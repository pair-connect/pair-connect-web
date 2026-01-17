import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware to verify auth token
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader) {
    console.log('No auth header provided');
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token in auth header');
    return null;
  }

  console.log('Verifying token, length:', token.length);
  
  try {
    // Try using the regular supabase client first
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (!error && user) {
      console.log('Auth verified for user (client):', user.id);
      return user.id;
    }

    // If that fails, try using admin API to get user by decoding JWT
    // Decode JWT payload (we trust our own tokens)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Invalid token format');
        return null;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.sub;
      
      if (!userId) {
        console.log('No user ID in token payload');
        return null;
      }

      // Verify user exists using admin client
      const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (adminError || !adminUser) {
        console.log('Admin user verification failed:', adminError?.message);
        return null;
      }
      
      console.log('Auth verified for user (admin):', userId);
      return userId;
    } catch (decodeError: any) {
      console.log('Token decode/verify error:', decodeError.message);
      return null;
    }
  } catch (err: any) {
    console.log('Exception in verifyAuth:', err.message);
    return null;
  }
};

// Helper to transform project from DB format to API format
const transformProject = (project: any) => ({
  id: project.id,
  ownerId: project.owner_id,
  title: project.title,
  description: project.description,
  image: project.image,
  stack: project.stack,
  level: project.level,
  languages: project.languages || [],
  createdAt: project.created_at,
  updatedAt: project.updated_at
});

// Helper to ensure user exists in users table
const ensureUserExists = async (userId: string) => {
  // Check if user exists
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (existingUser) {
    return true;
  }

  // Get user info from auth
  const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(userId);
  
  if (!authUser) {
    console.log('Auth user not found for ID:', userId);
    return false;
  }

  // Create user profile
  const { error: insertError } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      username: authUser.user_metadata?.username || `user_${userId.substring(0, 8)}`,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
      email: authUser.email || '',
      stack: 'Fullstack',
      level: 'Junior',
      languages: [],
      contacts: { email: authUser.email }
    });

  if (insertError) {
    console.log('Error creating user profile:', insertError);
    return false;
  }

  console.log('Created user profile for:', userId);
  return true;
};

// ==================== HEALTH CHECK ====================
app.get("/make-server-39ee6a8c/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ==================== AUTH ROUTES ====================

// Sign up - Creates a new user with Supabase Auth
app.post("/make-server-39ee6a8c/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    console.log('Signup request received:', { email: body.email, username: body.username });
    
    const { name, username, email, password } = body;

    if (!name || !username || !email || !password) {
      return c.json({ error: 'Todos los campos son requeridos' }, 400);
    }

    // Check if username is taken
    const { data: existingUsername } = await supabaseAdmin
      .from('users')
      .select('username, email')
      .eq('username', username)
      .single();

    if (existingUsername && existingUsername.email !== email) {
      return c.json({ error: 'Este nombre de usuario ya está en uso' }, 400);
    }

    // Check if user already exists in Auth
    // First try to create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, username },
      email_confirm: true
    });

    if (authError) {
      console.log('Signup auth error:', authError.message);
      if (authError.message.includes('already registered')) {
        // User exists in Auth, they should login instead
        return c.json({ error: 'Ya existe un usuario con este email. Por favor, inicia sesión.' }, 400);
      }
      return c.json({ error: `Error de autenticación: ${authError.message}` }, 400);
    }

    if (!authData.user) {
      return c.json({ error: 'Error al crear usuario' }, 500);
    }

    // Check if user profile already exists in users table
    const { data: existingUserInTable } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let userProfile;
    if (existingUserInTable) {
      // User exists in table but not in Auth - delete old record and create new one with Auth ID
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('email', email);

      // Create new profile with Auth ID, preserving existing data
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          username: username || existingUserInTable.username,
          name: name || existingUserInTable.name,
          email,
          stack: existingUserInTable.stack || 'Fullstack',
          level: existingUserInTable.level || 'Junior',
          languages: existingUserInTable.languages || [],
          contacts: existingUserInTable.contacts || { email }
        })
        .select()
        .single();

      if (profileError) {
        console.log('Profile creation error:', profileError.message);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return c.json({ error: 'Error al crear perfil de usuario' }, 500);
      }
      userProfile = newProfile;
    } else {
      // Create new user profile in users table
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          username,
          name,
          email,
          stack: 'Fullstack',
          level: 'Junior',
          languages: [],
          contacts: { email }
        })
        .select()
        .single();

      if (profileError) {
        console.log('Profile creation error:', profileError.message);
        // Rollback: delete auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return c.json({ error: 'Error al crear perfil de usuario' }, 500);
      }
      userProfile = newProfile;
    }

    // Create a session for the new user by making a direct API call
    // Since createSession doesn't exist, we'll get a token via the auth API
    let accessToken = null;
    try {
      const sessionResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ email, password }),
      });

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        accessToken = sessionData.access_token;
      } else {
        console.log('Session creation error: Could not get token after signup');
      }
    } catch (sessionError: any) {
      console.log('Session creation error:', sessionError?.message);
      // Don't fail registration if session creation fails, user can login manually
    }

    // Get user's bookmarks (empty for new user)
    const { data: bookmarks } = await supabaseAdmin
      .from('user_bookmarks')
      .select('session_id')
      .eq('user_id', authData.user.id);

    if (accessToken) {
      return c.json({ 
        user: {
          ...userProfile,
          bookmarks: bookmarks?.map(b => b.session_id) || []
        },
        accessToken: accessToken
      });
    } else {
      // If we couldn't get a token, return needsLogin flag
      return c.json({ 
        user: {
          ...userProfile,
          bookmarks: bookmarks?.map(b => b.session_id) || []
        },
        needsLogin: true
      });
    }

  } catch (error: any) {
    console.log('Signup fatal error:', error.message);
    return c.json({ error: `Error interno del servidor: ${error.message}` }, 500);
  }
});

// Login - Authenticates user with Supabase Auth
app.post("/make-server-39ee6a8c/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    console.log('Login request received:', { email, passwordLength: password?.length });

    // Verify Supabase URL and keys are set
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Missing Supabase configuration');
      return c.json({ error: 'Error de configuración del servidor' }, 500);
    }

    // Make direct HTTP request to Supabase Auth API
    // Using direct API call as it's more reliable from Edge Functions
    console.log('Making auth request to:', `${supabaseUrl}/auth/v1/token?grant_type=password`);
    
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Auth response status:', authResponse.status, authResponse.statusText);

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.log('Auth error response text:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Invalid credentials' };
      }
      
      console.log('Login auth error details:', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        error: errorData.error || errorData.message || errorData.msg,
        fullError: errorData
      });
      
      // Provide more specific error message
      const errorMessage = errorData.error || errorData.message || errorData.msg || 'Credenciales inválidas';
      return c.json({ 
        error: errorMessage.includes('Invalid login credentials') || errorMessage.includes('invalid') 
          ? 'Email o contraseña incorrectos. Verifica tus credenciales.'
          : errorMessage
      }, 401);
    }

    const authData = await authResponse.json();
    console.log('Auth success, user ID:', authData.user?.id);
    
    if (!authData.user || !authData.access_token) {
      console.log('Login auth error: Invalid response structure', { hasUser: !!authData.user, hasToken: !!authData.access_token });
      return c.json({ error: 'Invalid login credentials' }, 401);
    }

    // Get user profile from users table
    let { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // If profile doesn't exist, create it from auth metadata
    if (profileError || !userProfile) {
      console.log('User profile not found, creating from auth metadata:', authData.user.id);
      
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          username: authData.user.user_metadata?.username || authData.user.email?.split('@')[0] || `user_${authData.user.id.substring(0, 8)}`,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'Usuario',
          email: authData.user.email || '',
          stack: 'Fullstack',
          level: 'Junior',
          languages: [],
          contacts: { email: authData.user.email || '' }
        })
        .select()
        .single();

      if (createError || !newProfile) {
        console.log('Error creating user profile:', createError?.message);
        return c.json({ error: 'Error creating user profile' }, 500);
      }

      userProfile = newProfile;
    }

    // Get user's bookmarks
    const { data: bookmarks } = await supabaseAdmin
      .from('user_bookmarks')
      .select('session_id')
      .eq('user_id', authData.user.id);

    const responseData = { 
      user: {
        ...userProfile,
        bookmarks: bookmarks?.map(b => b.session_id) || []
      },
      accessToken: authData.access_token
    };

    console.log('Login successful, returning data:', {
      userId: responseData.user.id,
      email: responseData.user.email,
      hasToken: !!responseData.accessToken,
      tokenLength: responseData.accessToken?.length
    });

    return c.json(responseData);

  } catch (error: any) {
    console.log('Login server error:', error.message, error.stack);
    return c.json({ error: 'Internal server error during login' }, 500);
  }
});

// Get current session
app.get("/make-server-39ee6a8c/auth/session", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get user's bookmarks
    const { data: bookmarks } = await supabaseAdmin
      .from('user_bookmarks')
      .select('session_id')
      .eq('user_id', userId);

    return c.json({ 
      user: {
        ...user,
        bookmarks: bookmarks?.map(b => b.session_id) || []
      }
    });

  } catch (error) {
    console.log('Session check error:', error);
    return c.json({ error: 'Internal server error checking session' }, 500);
  }
});

// ==================== USER ROUTES ====================

// Get user by ID
app.get("/make-server-39ee6a8c/users/:id", async (c) => {
  try {
    const userId = c.req.param('id');
    const authHeader = c.req.header('Authorization');
    const requestingUserId = await verifyAuth(authHeader);
    const isOwnProfile = requestingUserId === userId;
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Si el perfil es privado y no es el propio perfil, retornar error
    if (!isOwnProfile && user.profile_public === false) {
      return c.json({ error: 'Profile is private' }, 403);
    }

    // Aplicar configuración de privacidad si no es el propio perfil
    let userData = { ...user };
    if (!isOwnProfile && user.privacy_settings) {
      const privacy = user.privacy_settings;
      
      // Ocultar email si no está permitido
      if (!privacy.showEmail) {
        userData.email = '';
      }
      
      // Ocultar contactos si no está permitido
      if (!privacy.showContacts) {
        userData.contacts = {};
      }
      
      // Ocultar bio si no está permitido
      if (!privacy.showBio) {
        userData.bio = null;
      }
      
      // Ocultar lenguajes si no está permitido
      if (!privacy.showLanguages) {
        userData.languages = [];
      }
      
      // Ocultar stack si no está permitido
      if (!privacy.showStack) {
        userData.stack = null;
      }
      
      // Ocultar level si no está permitido
      if (!privacy.showLevel) {
        userData.level = null;
      }
    }

    // Get bookmarks
    const { data: bookmarks } = await supabaseAdmin
      .from('user_bookmarks')
      .select('session_id')
      .eq('user_id', userId);

    return c.json({
      ...userData,
      bookmarks: bookmarks?.map(b => b.session_id) || [],
      profilePublic: userData.profile_public !== false,
      privacySettings: userData.privacy_settings || {
        showEmail: false,
        showContacts: true,
        showProjects: true,
        showSessions: false,
        showBio: true,
        showLanguages: true,
        showStack: true,
        showLevel: true,
      }
    });

  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: 'Internal server error fetching user' }, 500);
  }
});

// Update user profile
app.put("/make-server-39ee6a8c/users/:id", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const requestedUserId = c.req.param('id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (userId !== requestedUserId) {
      return c.json({ error: 'Forbidden - can only update own profile' }, 403);
    }

    const updates = await c.req.json();
    
    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.email;
    delete updates.created_at;
    delete updates.bookmarks;

    // Transform camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.profilePublic !== undefined) {
      dbUpdates.profile_public = updates.profilePublic;
    }
    if (updates.privacySettings !== undefined) {
      dbUpdates.privacy_settings = updates.privacySettings;
    }
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.stack !== undefined) dbUpdates.stack = updates.stack;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.languages !== undefined) dbUpdates.languages = updates.languages;
    if (updates.contacts !== undefined) dbUpdates.contacts = updates.contacts;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      // If user doesn't exist, create it
      if (error.code === 'PGRST116') {
        // Transform for insert as well
        const insertData: any = {
          id: userId,
          username: updates.username || `user_${userId.substring(0, 8)}`,
          name: updates.name || 'Usuario',
          email: updates.email || '',
        };
        if (updates.profilePublic !== undefined) {
          insertData.profile_public = updates.profilePublic;
        }
        if (updates.privacySettings !== undefined) {
          insertData.privacy_settings = updates.privacySettings;
        }
        if (updates.avatar !== undefined) insertData.avatar = updates.avatar;
        if (updates.bio !== undefined) insertData.bio = updates.bio;
        if (updates.stack !== undefined) insertData.stack = updates.stack;
        if (updates.level !== undefined) insertData.level = updates.level;
        if (updates.languages !== undefined) insertData.languages = updates.languages;
        if (updates.contacts !== undefined) insertData.contacts = updates.contacts;

        const { data: newUser, error: insertError } = await supabaseAdmin
          .from('users')
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          return c.json({ error: 'Error creating user profile' }, 500);
        }
        // Transform snake_case to camelCase for frontend
        return c.json({
          ...newUser,
          profilePublic: newUser.profile_public !== false,
          privacySettings: newUser.privacy_settings || {
            showEmail: false,
            showContacts: true,
            showProjects: true,
            showSessions: false,
            showBio: true,
            showLanguages: true,
            showStack: true,
            showLevel: true,
          }
        });
      }
      return c.json({ error: 'Error updating user' }, 500);
    }

    // Transform snake_case to camelCase for frontend
    return c.json({
      ...user,
      profilePublic: user.profile_public !== false,
      privacySettings: user.privacy_settings || {
        showEmail: false,
        showContacts: true,
        showProjects: true,
        showSessions: false,
        showBio: true,
        showLanguages: true,
        showStack: true,
        showLevel: true,
      }
    });

  } catch (error) {
    console.log('Update user error:', error);
    return c.json({ error: 'Internal server error updating user' }, 500);
  }
});

// Search users
app.get("/make-server-39ee6a8c/users", async (c) => {
  try {
    const query = c.req.query('q') || '';
    const stack = c.req.query('stack');
    const level = c.req.query('level');
    
    // Solo buscar usuarios con perfil público
    let queryBuilder = supabaseAdmin
      .from('users')
      .select('*')
      .or('profile_public.is.null,profile_public.eq.true');
    
    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,username.ilike.%${query}%`);
    }
    
    if (stack) {
      queryBuilder = queryBuilder.eq('stack', stack);
    }
    
    if (level) {
      queryBuilder = queryBuilder.eq('level', level);
    }

    const { data: users, error } = await queryBuilder;

    if (error) {
      return c.json({ error: 'Error searching users' }, 500);
    }

    // Aplicar configuración de privacidad a cada usuario
    const usersWithPrivacy = (users || []).map((user: any) => {
      const privacy = user.privacy_settings || {};
      const userData: any = {
        ...user,
        profilePublic: user.profile_public !== false,
        privacySettings: privacy,
      };

      // Ocultar información según configuración de privacidad
      if (!privacy.showEmail) {
        userData.email = '';
      }
      if (!privacy.showContacts) {
        userData.contacts = {};
      }
      if (!privacy.showBio) {
        userData.bio = null;
      }
      if (!privacy.showLanguages) {
        userData.languages = [];
      }
      if (!privacy.showStack) {
        userData.stack = null;
      }
      if (!privacy.showLevel) {
        userData.level = null;
      }

      return userData;
    });

    return c.json(usersWithPrivacy);

  } catch (error) {
    console.log('Search users error:', error);
    return c.json({ error: 'Internal server error searching users' }, 500);
  }
});

// Upload avatar image
app.post("/make-server-39ee6a8c/users/:id/avatar", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const requestedUserId = c.req.param('id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (userId !== requestedUserId) {
      return c.json({ error: 'Forbidden - can only upload own avatar' }, 403);
    }

    // Get the file from form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Convert File to ArrayBuffer for Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.log('Storage upload error:', uploadError);
      return c.json({ error: 'Error uploading file: ' + uploadError.message }, 500);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Update user's avatar in database
    const { data: user, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ avatar: publicUrl })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      // If update fails, try to delete the uploaded file
      await supabaseAdmin.storage.from('avatars').remove([filePath]);
      return c.json({ error: 'Error updating user avatar' }, 500);
    }

    return c.json({ 
      avatar: publicUrl,
      user 
    });

  } catch (error: any) {
    console.log('Upload avatar error:', error);
    return c.json({ error: 'Internal server error uploading avatar: ' + error.message }, 500);
  }
});

// ==================== PROJECT ROUTES ====================

// Create project
app.post("/make-server-39ee6a8c/projects", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('Create project - Auth header present:', !!authHeader);
    
    const userId = await verifyAuth(authHeader);

    if (!userId) {
      console.log('Create project - Auth verification failed');
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    console.log('Create project - Auth verified, userId:', userId);

    // Ensure user exists in users table before creating project
    const userExists = await ensureUserExists(userId);
    if (!userExists) {
      return c.json({ error: 'Could not create user profile' }, 500);
    }

    const projectData = await c.req.json();

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert({
        owner_id: userId,
        title: projectData.title,
        description: projectData.description,
        image: projectData.image,
        stack: projectData.stack || 'Fullstack',
        level: projectData.level || 'Junior',
        languages: projectData.languages || []
      })
      .select()
      .single();

    if (error) {
      console.log('Create project error:', error);
      return c.json({ error: 'Error creating project: ' + error.message }, 500);
    }

    return c.json({
      ...transformProject(project),
      interested: []
    });

  } catch (error: any) {
    console.log('Create project error:', error);
    return c.json({ error: 'Internal server error creating project: ' + error.message }, 500);
  }
});

// Get all projects
app.get("/make-server-39ee6a8c/projects", async (c) => {
  try {
    const ownerId = c.req.query('ownerId');
    const stack = c.req.query('stack');
    const level = c.req.query('level');

    let queryBuilder = supabaseAdmin.from('projects').select('*');

    if (ownerId) {
      queryBuilder = queryBuilder.eq('owner_id', ownerId);
    }
    if (stack) {
      queryBuilder = queryBuilder.eq('stack', stack);
    }
    if (level) {
      queryBuilder = queryBuilder.eq('level', level);
    }

    const { data: projects, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) {
      console.log('Get projects error details:', error.message, error.code, error.details);
      return c.json({ error: 'Error fetching projects: ' + error.message }, 500);
    }

    // Get interested users for all projects
    const projectsWithInterested = await Promise.all(
      (projects || []).map(async (project) => {
        const { data: interested } = await supabaseAdmin
          .from('project_interested')
          .select('user_id')
          .eq('project_id', project.id);

        return {
          ...transformProject(project),
          interested: interested?.map(i => i.user_id) || []
        };
      })
    );

    return c.json(projectsWithInterested);

  } catch (error) {
    console.log('Get projects error:', error);
    return c.json({ error: 'Internal server error fetching projects' }, 500);
  }
});

// Get project by ID
app.get("/make-server-39ee6a8c/projects/:id", async (c) => {
  try {
    const projectId = c.req.param('id');
    
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get interested users
    const { data: interested } = await supabaseAdmin
      .from('project_interested')
      .select('user_id')
      .eq('project_id', projectId);

    return c.json({
      ...transformProject(project),
      interested: interested?.map(i => i.user_id) || []
    });

  } catch (error) {
    console.log('Get project error:', error);
    return c.json({ error: 'Internal server error fetching project' }, 500);
  }
});

// Update project
app.put("/make-server-39ee6a8c/projects/:id", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const projectId = c.req.param('id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check ownership
    const { data: existing } = await supabaseAdmin
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (!existing || existing.owner_id !== userId) {
      return c.json({ error: 'Forbidden - not project owner' }, 403);
    }

    const updates = await c.req.json();
    delete updates.id;
    delete updates.owner_id;
    delete updates.created_at;

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      return c.json({ error: 'Error updating project' }, 500);
    }

    // Get interested users
    const { data: interested } = await supabaseAdmin
      .from('project_interested')
      .select('user_id')
      .eq('project_id', projectId);

    return c.json({
      ...transformProject(project),
      interested: interested?.map(i => i.user_id) || []
    });

  } catch (error) {
    console.log('Update project error:', error);
    return c.json({ error: 'Internal server error updating project' }, 500);
  }
});

// Delete project
app.delete("/make-server-39ee6a8c/projects/:id", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const projectId = c.req.param('id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check ownership
    const { data: existing } = await supabaseAdmin
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (!existing || existing.owner_id !== userId) {
      return c.json({ error: 'Forbidden - not project owner' }, 403);
    }

    // Delete project (sessions will cascade delete)
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      return c.json({ error: 'Error deleting project' }, 500);
    }

    return c.json({ success: true });

  } catch (error) {
    console.log('Delete project error:', error);
    return c.json({ error: 'Internal server error deleting project' }, 500);
  }
});

// Toggle interest in project (creates a request instead of direct interest)
app.post("/make-server-39ee6a8c/projects/:id/interested", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const projectId = c.req.param('id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get project and owner info
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*, owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Can't be interested in your own project
    if (project.owner_id === userId) {
      return c.json({ error: 'Cannot show interest in your own project' }, 400);
    }

    // Check if request already exists
    const { data: existingRequest } = await supabaseAdmin
      .from('project_requests')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (existingRequest) {
      // Remove request (cancel interest)
      await supabaseAdmin
        .from('project_requests')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);
    } else {
      // Create new request
      const { error: requestError } = await supabaseAdmin
        .from('project_requests')
        .insert({ 
          project_id: projectId, 
          user_id: userId,
          status: 'pending'
        });

      if (requestError) {
        console.log('Error creating request:', requestError);
        return c.json({ error: 'Error creating request' }, 500);
      }

      // Get requester info for email
      const { data: requester } = await supabaseAdmin
        .from('users')
        .select('name, email, username')
        .eq('id', userId)
        .single();

      // Get owner info for email
      const { data: owner } = await supabaseAdmin
        .from('users')
        .select('email, name')
        .eq('id', project.owner_id)
        .single();

      // Send email notification to owner
      if (owner?.email && requester) {
        try {
          const emailFunctionUrl = `${supabaseUrl}/functions/v1/send-email`;
          await fetch(emailFunctionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              to: owner.email,
              subject: `Nueva solicitud para tu proyecto: ${project.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #4ad3e5;">Nueva Solicitud de Participación</h2>
                  <p>Hola ${owner.name},</p>
                  <p><strong>${requester.name}</strong> (@${requester.username}) quiere unirse a tu proyecto <strong>"${project.title}"</strong>.</p>
                  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Información del solicitante:</strong></p>
                    <ul>
                      <li>Nombre: ${requester.name}</li>
                      <li>Username: @${requester.username}</li>
                      <li>Email: ${requester.email}</li>
                    </ul>
                  </div>
                  <p>
                    <a href="https://pairconnect.dev/proyectos/${projectId}/solicitudes" 
                       style="background: #4ad3e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      Ver y Gestionar Solicitudes
                    </a>
                  </p>
                  <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    Este es un email automático de Pair Connect.
                  </p>
                </div>
              `,
            }),
          });
        } catch (emailError) {
          console.log('Error sending email notification:', emailError);
          // Don't fail the request if email fails
        }
      }
    }

    // Get updated interested list (accepted requests)
    const { data: acceptedRequests } = await supabaseAdmin
      .from('project_requests')
      .select('user_id')
      .eq('project_id', projectId)
      .eq('status', 'accepted');

    // Get full project data
    const { data: fullProject } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    return c.json({
      ...transformProject(fullProject),
      interested: acceptedRequests?.map(r => r.user_id) || []
    });

  } catch (error) {
    console.log('Toggle project interest error:', error);
    return c.json({ error: 'Internal server error toggling project interest' }, 500);
  }
});

// Get project requests (for project owner)
app.get("/make-server-39ee6a8c/projects/:id/requests", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const projectId = c.req.param('id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Verify ownership
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (!project || project.owner_id !== userId) {
      return c.json({ error: 'Forbidden - not project owner' }, 403);
    }

    // Get all requests for this project
    const { data: requests, error } = await supabaseAdmin
      .from('project_requests')
      .select(`
        *,
        user:users!project_requests_user_id_fkey(id, name, username, email, avatar, stack, level)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return c.json({ error: 'Error fetching requests' }, 500);
    }

    return c.json(requests || []);

  } catch (error) {
    console.log('Get project requests error:', error);
    return c.json({ error: 'Internal server error fetching requests' }, 500);
  }
});

// Accept or reject project request
app.post("/make-server-39ee6a8c/projects/:id/requests/:requestId", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const projectId = c.req.param('id');
    const requestId = c.req.param('requestId');
    const { action } = await c.req.json(); // 'accept' or 'reject'

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!['accept', 'reject'].includes(action)) {
      return c.json({ error: 'Invalid action. Must be "accept" or "reject"' }, 400);
    }

    // Verify ownership
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (!project || project.owner_id !== userId) {
      return c.json({ error: 'Forbidden - not project owner' }, 403);
    }

    // Get request
    const { data: request, error: requestError } = await supabaseAdmin
      .from('project_requests')
      .select('*')
      .eq('id', requestId)
      .eq('project_id', projectId)
      .single();

    if (requestError || !request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    // Update request status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('project_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      return c.json({ error: 'Error updating request' }, 500);
    }

    // If accepted, add user to all sessions of this project as participant
    if (action === 'accept') {
      const { data: projectSessions } = await supabaseAdmin
        .from('sessions')
        .select('id')
        .eq('project_id', projectId);

      if (projectSessions && projectSessions.length > 0) {
        const sessionParticipants = projectSessions.map(session => ({
          session_id: session.id,
          user_id: request.user_id
        }));

        // Insert participants (ignore conflicts if already exists)
        await supabaseAdmin
          .from('session_participants')
          .upsert(sessionParticipants, { onConflict: 'session_id,user_id' });
      }

      // Get requester info for email
      const { data: requester } = await supabaseAdmin
        .from('users')
        .select('email, name')
        .eq('id', request.user_id)
        .single();

      // Get project info for email
      const { data: fullProject } = await supabaseAdmin
        .from('projects')
        .select('title')
        .eq('id', projectId)
        .single();

      // Send email notification to requester
      if (requester?.email && fullProject) {
        try {
          const emailFunctionUrl = `${supabaseUrl}/functions/v1/send-email`;
          await fetch(emailFunctionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              to: requester.email,
              subject: `¡Solicitud aceptada! - ${fullProject.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #4ad3e5;">¡Felicidades! Tu solicitud fue aceptada</h2>
                  <p>Hola ${requester.name},</p>
                  <p>Tu solicitud para unirte al proyecto <strong>"${fullProject.title}"</strong> ha sido <strong style="color: green;">aceptada</strong>.</p>
                  <p>Ahora puedes:</p>
                  <ul>
                    <li>Ver los detalles completos de las sesiones (incluyendo los enlaces de Zoom/Meet)</li>
                    <li>Participar en todas las sesiones del proyecto</li>
                    <li>Colaborar con el equipo</li>
                  </ul>
                  <p>
                    <a href="https://pairconnect.dev/proyectos/${projectId}" 
                       style="background: #4ad3e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      Ver Proyecto
                    </a>
                  </p>
                  <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    Este es un email automático de Pair Connect.
                  </p>
                </div>
              `,
            }),
          });
        } catch (emailError) {
          console.log('Error sending email notification:', emailError);
          // Don't fail the request if email fails
        }
      }
    }

    return c.json(updatedRequest);

  } catch (error) {
    console.log('Update project request error:', error);
    return c.json({ error: 'Internal server error updating request' }, 500);
  }
});

// ==================== SESSION ROUTES ====================

// Create session
app.post("/make-server-39ee6a8c/sessions", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Ensure user exists in users table
    const userExists = await ensureUserExists(userId);
    if (!userExists) {
      return c.json({ error: 'Could not create user profile' }, 500);
    }

    const sessionData = await c.req.json();
    const { projectId } = sessionData;

    // Verify project ownership
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (!project || project.owner_id !== userId) {
      return c.json({ error: 'Forbidden - not project owner' }, 403);
    }

    // Create session
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        project_id: projectId,
        owner_id: userId,
        title: sessionData.title,
        description: sessionData.description,
        date: sessionData.date,
        duration: sessionData.duration || 60,
        max_participants: sessionData.maxParticipants || 4,
        link: sessionData.link
      })
      .select()
      .single();

    if (error) {
      console.log('Create session error:', error);
      return c.json({ error: 'Error creating session' }, 500);
    }

    // Add owner as participant
    await supabaseAdmin
      .from('session_participants')
      .insert({ session_id: session.id, user_id: userId });

    // Return session with participants array
    return c.json({
      ...session,
      participants: [userId],
      interested: []
    });

  } catch (error) {
    console.log('Create session error:', error);
    return c.json({ error: 'Internal server error creating session' }, 500);
  }
});

// Get all sessions
app.get("/make-server-39ee6a8c/sessions", async (c) => {
  try {
    const projectId = c.req.query('projectId');
    const ownerId = c.req.query('ownerId');

    let queryBuilder = supabaseAdmin.from('sessions').select('*');

    if (projectId) {
      queryBuilder = queryBuilder.eq('project_id', projectId);
    }
    if (ownerId) {
      queryBuilder = queryBuilder.eq('owner_id', ownerId);
    }

    const { data: sessions, error } = await queryBuilder.order('date', { ascending: false });

    if (error) {
      console.log('Get sessions error details:', error.message, error.code, error.details);
      return c.json({ error: 'Error fetching sessions: ' + error.message }, 500);
    }

    // Get current user if authenticated
    const userId = await verifyAuth(c.req.header('Authorization'));

    // Get participants and interested for each session
    const sessionsWithRelations = await Promise.all(
      (sessions || []).map(async (session) => {
        const { data: participants } = await supabaseAdmin
          .from('session_participants')
          .select('user_id')
          .eq('session_id', session.id);

        const { data: interested } = await supabaseAdmin
          .from('session_interested')
          .select('user_id')
          .eq('session_id', session.id);

        const participantIds = participants?.map(p => p.user_id) || [];
        const isOwner = userId === session.owner_id;
        const isParticipant = userId && participantIds.includes(userId);

        const sessionData: any = {
          ...session,
          projectId: session.project_id,
          ownerId: session.owner_id,
          maxParticipants: session.max_participants,
          participants: participantIds,
          interested: interested?.map(i => i.user_id) || []
        };

        // Hide link if user is not owner or participant
        if (!isOwner && !isParticipant) {
          delete sessionData.link;
          sessionData.link = null;
        }

        return sessionData;
      })
    );

    return c.json(sessionsWithRelations);

  } catch (error) {
    console.log('Get sessions error:', error);
    return c.json({ error: 'Internal server error fetching sessions' }, 500);
  }
});

// Get session by ID (hides link if user is not an accepted participant)
app.get("/make-server-39ee6a8c/sessions/:id", async (c) => {
  try {
    const sessionId = c.req.param('id');
    const userId = await verifyAuth(c.req.header('Authorization')); // Optional auth
    
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // Get participants and interested
    const { data: participants } = await supabaseAdmin
      .from('session_participants')
      .select('user_id')
      .eq('session_id', sessionId);

    const { data: interested } = await supabaseAdmin
      .from('session_interested')
      .select('user_id')
      .eq('session_id', sessionId);

    const participantIds = participants?.map(p => p.user_id) || [];
    const isOwner = userId === session.owner_id;
    const isParticipant = userId && participantIds.includes(userId);

    // Only show link to owner or accepted participants
    const sessionResponse: any = {
      ...session,
      projectId: session.project_id,
      ownerId: session.owner_id,
      maxParticipants: session.max_participants,
      participants: participantIds,
      interested: interested?.map(i => i.user_id) || []
    };

    // Hide link if user is not owner or participant
    if (!isOwner && !isParticipant) {
      delete sessionResponse.link;
      sessionResponse.link = null; // Explicitly set to null
    }

    return c.json(sessionResponse);

  } catch (error) {
    console.log('Get session error:', error);
    return c.json({ error: 'Internal server error fetching session' }, 500);
  }
});

// Update session
app.put("/make-server-39ee6a8c/sessions/:id", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const sessionId = c.req.param('id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check ownership
    const { data: existing } = await supabaseAdmin
      .from('sessions')
      .select('owner_id')
      .eq('id', sessionId)
      .single();

    if (!existing || existing.owner_id !== userId) {
      return c.json({ error: 'Forbidden - not session owner' }, 403);
    }

    const updates = await c.req.json();
    
    // Map camelCase to snake_case
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.duration) dbUpdates.duration = updates.duration;
    if (updates.maxParticipants) dbUpdates.max_participants = updates.maxParticipants;
    if (updates.link !== undefined) dbUpdates.link = updates.link;

    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .update(dbUpdates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      return c.json({ error: 'Error updating session' }, 500);
    }

    return c.json(session);

  } catch (error) {
    console.log('Update session error:', error);
    return c.json({ error: 'Internal server error updating session' }, 500);
  }
});

// Delete session
app.delete("/make-server-39ee6a8c/sessions/:id", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const sessionId = c.req.param('id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check ownership
    const { data: existing } = await supabaseAdmin
      .from('sessions')
      .select('owner_id')
      .eq('id', sessionId)
      .single();

    if (!existing || existing.owner_id !== userId) {
      return c.json({ error: 'Forbidden - not session owner' }, 403);
    }

    const { error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      return c.json({ error: 'Error deleting session' }, 500);
    }

    return c.json({ success: true });

  } catch (error) {
    console.log('Delete session error:', error);
    return c.json({ error: 'Internal server error deleting session' }, 500);
  }
});

// Join session
app.post("/make-server-39ee6a8c/sessions/:id/join", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const sessionId = c.req.param('id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get session
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // Check if already joined
    const { data: existing } = await supabaseAdmin
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return c.json({ error: 'Already joined this session' }, 400);
    }

    // Check max participants
    const { count } = await supabaseAdmin
      .from('session_participants')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if ((count || 0) >= session.max_participants) {
      return c.json({ error: 'Session is full' }, 400);
    }

    // Add participant
    await supabaseAdmin
      .from('session_participants')
      .insert({ session_id: sessionId, user_id: userId });

    // Remove from interested if present
    await supabaseAdmin
      .from('session_interested')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    return c.json({ success: true });

  } catch (error) {
    console.log('Join session error:', error);
    return c.json({ error: 'Internal server error joining session' }, 500);
  }
});

// Leave session
app.post("/make-server-39ee6a8c/sessions/:id/leave", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const sessionId = c.req.param('id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if owner
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('owner_id')
      .eq('id', sessionId)
      .single();

    if (session?.owner_id === userId) {
      return c.json({ error: 'Owner cannot leave session' }, 400);
    }

    // Remove participant
    await supabaseAdmin
      .from('session_participants')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    return c.json({ success: true });

  } catch (error) {
    console.log('Leave session error:', error);
    return c.json({ error: 'Internal server error leaving session' }, 500);
  }
});

// Toggle interest
app.post("/make-server-39ee6a8c/sessions/:id/interested", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    const sessionId = c.req.param('id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if already participating
    const { data: participant } = await supabaseAdmin
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();

    if (participant) {
      return c.json({ error: 'Already participating' }, 400);
    }

    // Check if already interested
    const { data: existing } = await supabaseAdmin
      .from('session_interested')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Remove interest
      await supabaseAdmin
        .from('session_interested')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userId);
    } else {
      // Add interest
      await supabaseAdmin
        .from('session_interested')
        .insert({ session_id: sessionId, user_id: userId });
    }

    return c.json({ success: true, isInterested: !existing });

  } catch (error) {
    console.log('Toggle interest error:', error);
    return c.json({ error: 'Internal server error toggling interest' }, 500);
  }
});

// ==================== BOOKMARK ROUTES ====================

// Toggle bookmark
app.post("/make-server-39ee6a8c/bookmarks/toggle", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { sessionId } = await c.req.json();

    if (!sessionId) {
      return c.json({ error: 'Session ID required' }, 400);
    }

    // Check if bookmark exists
    const { data: existing } = await supabaseAdmin
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // Remove bookmark
      await supabaseAdmin
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('session_id', sessionId);
    } else {
      // Add bookmark
      await supabaseAdmin
        .from('user_bookmarks')
        .insert({ user_id: userId, session_id: sessionId });
    }

    // Get updated bookmarks
    const { data: bookmarks } = await supabaseAdmin
      .from('user_bookmarks')
      .select('session_id')
      .eq('user_id', userId);

    return c.json({ 
      bookmarks: bookmarks?.map(b => b.session_id) || [],
      isBookmarked: !existing 
    });

  } catch (error) {
    console.log('Toggle bookmark error:', error);
    return c.json({ error: 'Internal server error toggling bookmark' }, 500);
  }
});

// Get user bookmarks
app.get("/make-server-39ee6a8c/bookmarks", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: bookmarks } = await supabaseAdmin
      .from('user_bookmarks')
      .select(`
        session_id,
        sessions (*)
      `)
      .eq('user_id', userId);

    const sessions = bookmarks?.map(b => b.sessions).filter(Boolean) || [];

    return c.json(sessions);

  } catch (error) {
    console.log('Get bookmarks error:', error);
    return c.json({ error: 'Internal server error fetching bookmarks' }, 500);
  }
});

Deno.serve(app.fetch);
