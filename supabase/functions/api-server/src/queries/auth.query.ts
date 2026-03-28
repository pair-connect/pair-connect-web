import { supabaseAdmin } from "../clients/supabase.ts";
import { env } from "../config/env.ts";

export const authQuery = {
  findUsernameByUsername: (username: string) =>
    supabaseAdmin
      .from('users')
      .select('username, email')
      .eq('username', username)
      .single(),

  createAuthUser: (params: { email: string; password: string; name: string; username: string }) =>
    supabaseAdmin.auth.admin.createUser({
      email: params.email,
      password: params.password,
      user_metadata: { name: params.name, username: params.username },
      email_confirm: true,
    }),

  findUserProfileByEmail: (email: string) =>
    supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single(),

  deleteUserProfilesByEmail: (email: string) =>
    supabaseAdmin
      .from('users')
      .delete()
      .eq('email', email),

  insertUserProfile: (profile: Record<string, unknown>) =>
    supabaseAdmin
      .from('users')
      .insert(profile)
      .select()
      .single(),

  deleteAuthUser: (userId: string) => supabaseAdmin.auth.admin.deleteUser(userId),

  requestPasswordToken: (email: string, password: string) =>
    fetch(`${env.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.supabaseAnonKey,
      },
      body: JSON.stringify({ email, password }),
    }),

  findBookmarksByUserId: (userId: string) =>
    supabaseAdmin
      .from('user_bookmarks')
      .select('session_id')
      .eq('user_id', userId),

  findUserProfileById: (userId: string) =>
    supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single(),
};
