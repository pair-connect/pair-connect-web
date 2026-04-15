import { supabaseAdmin } from "../clients/supabase.ts";

export const usersQuery = {
  findUserById: (userId: string) =>
    supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single(),

  findUserIdOnlyById: (userId: string) =>
    supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single(),

  getAuthUserById: (userId: string) => supabaseAdmin.auth.admin.getUserById(userId),

  insertUser: (payload: Record<string, unknown>) =>
    supabaseAdmin
      .from('users')
      .insert(payload)
      .select()
      .single(),

  updateUserById: (userId: string, payload: Record<string, unknown>) =>
    supabaseAdmin
      .from('users')
      .update(payload)
      .eq('id', userId)
      .select()
      .single(),

  listUsers: (filters: { stack?: string; level?: string; applyPublicFilter: boolean }) => {
    let queryBuilder = supabaseAdmin.from('users').select('*');

    if (filters.applyPublicFilter) {
      queryBuilder = queryBuilder.or('profile_public.is.null,profile_public.eq.true');
    }

    if (filters.stack) {
      queryBuilder = queryBuilder.eq('stack', filters.stack);
    }

    if (filters.level) {
      queryBuilder = queryBuilder.eq('level', filters.level);
    }

    return queryBuilder;
  },

  findBookmarksByUserId: (userId: string) =>
    supabaseAdmin
      .from('user_bookmarks')
      .select('session_id')
      .eq('user_id', userId),

  uploadAvatarFile: (filePath: string, content: Uint8Array, contentType: string) =>
    supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, content, {
        contentType,
        upsert: false,
      }),

  getAvatarPublicUrl: (filePath: string) =>
    supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filePath),

  removeAvatarFiles: (paths: string[]) =>
    supabaseAdmin.storage
      .from('avatars')
      .remove(paths),
};
