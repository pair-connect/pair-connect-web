import { env } from "../config/env.ts";
import { authQuery } from "../queries/auth.query.ts";
import type { DbBookmarkRow, DbUser } from "../types/domain.ts";

type ServiceResult = { status: number; body: Record<string, unknown> };

const getBookmarksArray = async (userId: string) => {
  const { data: bookmarks } = await authQuery.findBookmarksByUserId(userId);
  return (bookmarks as DbBookmarkRow[] | null)?.map((b) => b.session_id) || [];
};

export const authService = {
  async signup(input: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<ServiceResult> {
    console.log('Signup request received:', { email: input.email, username: input.username });

    const { name, username, email, password } = input;

    const { data: existingUsername } = await authQuery.findUsernameByUsername(username);

    if (existingUsername && existingUsername.email !== email) {
      return { status: 400, body: { error: 'Este nombre de usuario ya está en uso' } };
    }

    const { data: authData, error: authError } = await authQuery.createAuthUser({
      name,
      username,
      email,
      password,
    });

    if (authError) {
      console.log('Signup auth error:', authError.message);
      if (authError.message.includes('already registered')) {
        return {
          status: 400,
          body: { error: 'Ya existe un usuario con este email. Por favor, inicia sesión.' },
        };
      }
      return { status: 400, body: { error: `Error de autenticación: ${authError.message}` } };
    }

    if (!authData.user) {
      return { status: 500, body: { error: 'Error al crear usuario' } };
    }

    const { data: existingUserInTable } = await authQuery.findUserProfileByEmail(email);

    let userProfile: DbUser;
    if (existingUserInTable) {
      await authQuery.deleteUserProfilesByEmail(email);

      const { data: newProfile, error: profileError } = await authQuery.insertUserProfile({
        id: authData.user.id,
        username: username || existingUserInTable.username,
        name: name || existingUserInTable.name,
        email,
        stack: existingUserInTable.stack || 'Fullstack',
        level: existingUserInTable.level || 'Junior',
        languages: existingUserInTable.languages || [],
        contacts: existingUserInTable.contacts || { email },
      });

      if (profileError) {
        console.log('Profile creation error:', profileError.message);
        await authQuery.deleteAuthUser(authData.user.id);
        return { status: 500, body: { error: 'Error al crear perfil de usuario' } };
      }

      userProfile = newProfile;
    } else {
      const { data: newProfile, error: profileError } = await authQuery.insertUserProfile({
        id: authData.user.id,
        username,
        name,
        email,
        stack: 'Fullstack',
        level: 'Junior',
        languages: [],
        contacts: { email },
      });

      if (profileError) {
        console.log('Profile creation error:', profileError.message);
        await authQuery.deleteAuthUser(authData.user.id);
        return { status: 500, body: { error: 'Error al crear perfil de usuario' } };
      }

      userProfile = newProfile;
    }

    let accessToken: string | null = null;
    try {
      const sessionResponse = await authQuery.requestPasswordToken(email, password);

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        accessToken = sessionData.access_token;
      } else {
        console.log('Session creation error: Could not get token after signup');
      }
    } catch (sessionError: unknown) {
      const errorMessage = sessionError instanceof Error ? sessionError.message : String(sessionError);
      console.log('Session creation error:', errorMessage);
    }

    const bookmarks = await getBookmarksArray(authData.user.id);

    if (accessToken) {
      return {
        status: 200,
        body: {
          user: {
            ...userProfile,
            bookmarks,
          },
          accessToken,
        },
      };
    }

    return {
      status: 200,
      body: {
        user: {
          ...userProfile,
          bookmarks,
        },
        needsLogin: true,
      },
    };
  },

  async login(input: { email?: string; password?: string }): Promise<ServiceResult> {
    const { email, password } = input;
    console.log('Login request received:', { email, passwordLength: password?.length });

    if (!env.supabaseUrl || !env.supabaseAnonKey) {
      console.log('Missing Supabase configuration');
      return { status: 500, body: { error: 'Error de configuración del servidor' } };
    }

    console.log('Making auth request to:', `${env.supabaseUrl}/auth/v1/token?grant_type=password`);
    const authResponse = await authQuery.requestPasswordToken(email || '', password || '');

    console.log('Auth response status:', authResponse.status, authResponse.statusText);

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.log('Auth error response text:', errorText);

      let errorData: Record<string, unknown>;
      try {
        errorData = JSON.parse(errorText) as Record<string, unknown>;
      } catch {
        errorData = { error: errorText || 'Invalid credentials' };
      }

      console.log('Login auth error details:', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        error: errorData.error || errorData.message || errorData.msg,
        fullError: errorData,
      });

      const parsedError =
        (typeof errorData.error === 'string' && errorData.error) ||
        (typeof errorData.message === 'string' && errorData.message) ||
        (typeof errorData.msg === 'string' && errorData.msg) ||
        'Credenciales inválidas';
      return {
        status: 401,
        body: {
          error:
            parsedError.includes('Invalid login credentials') || parsedError.includes('invalid')
              ? 'Email o contraseña incorrectos. Verifica tus credenciales.'
              : parsedError,
        },
      };
    }

    const authData = await authResponse.json() as {
      user?: { id: string; email?: string; user_metadata?: { username?: string; name?: string } };
      access_token?: string;
    };
    console.log('Auth success, user ID:', authData.user?.id);

    if (!authData.user || !authData.access_token) {
      console.log('Login auth error: Invalid response structure', {
        hasUser: !!authData.user,
        hasToken: !!authData.access_token,
      });
      return { status: 401, body: { error: 'Invalid login credentials' } };
    }

    let { data: userProfile, error: profileError } = await authQuery.findUserProfileById(authData.user.id);

    if (profileError || !userProfile) {
      console.log('User profile not found, creating from auth metadata:', authData.user.id);

      const { data: newProfile, error: createError } = await authQuery.insertUserProfile({
        id: authData.user.id,
        username:
          authData.user.user_metadata?.username ||
          authData.user.email?.split('@')[0] ||
          `user_${authData.user.id.substring(0, 8)}`,
        name:
          authData.user.user_metadata?.name ||
          authData.user.email?.split('@')[0] ||
          'Usuario',
        email: authData.user.email || '',
        stack: 'Fullstack',
        level: 'Junior',
        languages: [],
        contacts: { email: authData.user.email || '' },
      });

      if (createError || !newProfile) {
        console.log('Error creating user profile:', createError?.message);
        return { status: 500, body: { error: 'Error creating user profile' } };
      }

      userProfile = newProfile;
    }

    const bookmarks = await getBookmarksArray(authData.user.id);

    const responseData = {
      user: {
        ...userProfile,
        bookmarks,
      },
      accessToken: authData.access_token,
    };

    const responseUser = responseData.user as DbUser;
    console.log('Login successful, returning data:', {
      userId: responseUser.id,
      email: responseUser.email,
      hasToken: !!responseData.accessToken,
      tokenLength: responseData.accessToken?.length,
    });

    return { status: 200, body: responseData };
  },

  async getSession(userId: string | null): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { data: user, error } = await authQuery.findUserProfileById(userId);

    if (error || !user) {
      return { status: 404, body: { error: 'User not found' } };
    }

    const bookmarks = await getBookmarksArray(userId);

    return {
      status: 200,
      body: {
        user: {
          ...user,
          bookmarks,
        },
      },
    };
  },
};
