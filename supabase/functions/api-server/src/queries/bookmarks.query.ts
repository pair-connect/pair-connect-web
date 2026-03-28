import { supabaseAdmin } from "../clients/supabase.ts";

export const bookmarksQuery = {
  findBookmark: (userId: string, sessionId: string) =>
    supabaseAdmin
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .single(),

  deleteBookmark: (userId: string, sessionId: string) =>
    supabaseAdmin
      .from('user_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('session_id', sessionId),

  insertBookmark: (userId: string, sessionId: string) =>
    supabaseAdmin
      .from('user_bookmarks')
      .insert({ user_id: userId, session_id: sessionId }),

  findBookmarkSessionIds: (userId: string) =>
    supabaseAdmin
      .from('user_bookmarks')
      .select('session_id')
      .eq('user_id', userId),

  findBookmarksWithSessions: (userId: string) =>
    supabaseAdmin
      .from('user_bookmarks')
      .select(`
        session_id,
        sessions (*)
      `)
      .eq('user_id', userId),
};
