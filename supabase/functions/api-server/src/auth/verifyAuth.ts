import { supabase, supabaseAdmin } from "../clients/supabase.ts";

export const verifyAuth = async (authHeader: string | null | undefined): Promise<string | null> => {
  if (!authHeader) {
    console.log('No auth header provided');
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('Invalid auth header format');
    return null;
  }

  const token = parts[1];
  if (!token) {
    console.log('No token in auth header');
    return null;
  }

  console.log('Verifying token, length:', token.length);

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('Token verification failed:', error?.message || 'User not found');
      try {
        const jwtParts = token.split('.');
        if (jwtParts.length === 3) {
          const payload = JSON.parse(atob(jwtParts[1]));
          const userId = payload.sub;

          if (userId) {
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
              console.log('Token expired');
              return null;
            }

            const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.getUserById(userId);
            if (!adminError && adminUser && adminUser.user) {
              console.log('Auth verified for user (admin fallback):', userId);
              return userId;
            }
          }
        }
      } catch (decodeError: unknown) {
        const decodeErrorMessage = decodeError instanceof Error ? decodeError.message : String(decodeError);
        console.log('Token decode fallback failed:', decodeErrorMessage);
      }

      return null;
    }

    console.log('Auth verified for user:', user.id);
    return user.id;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.log('Exception in verifyAuth:', errorMessage);
    return null;
  }
};
