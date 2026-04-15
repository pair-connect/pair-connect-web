import { supabaseAdmin } from "../clients/supabase.ts";

export const sessionsQuery = {
  insertSession: (payload: Record<string, unknown>) =>
    supabaseAdmin
      .from('sessions')
      .insert(payload)
      .select()
      .single(),

  listSessions: (filters: { projectId?: string; ownerId?: string }) => {
    let queryBuilder = supabaseAdmin.from('sessions').select('*');

    if (filters.projectId) {
      queryBuilder = queryBuilder.eq('project_id', filters.projectId);
    }
    if (filters.ownerId) {
      queryBuilder = queryBuilder.eq('owner_id', filters.ownerId);
    }

    return queryBuilder.order('date', { ascending: false });
  },

  findSessionById: (sessionId: string) =>
    supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single(),

  findSessionOwnerById: (sessionId: string) =>
    supabaseAdmin
      .from('sessions')
      .select('owner_id')
      .eq('id', sessionId)
      .single(),

  updateSessionById: (sessionId: string, payload: Record<string, unknown>) =>
    supabaseAdmin
      .from('sessions')
      .update(payload)
      .eq('id', sessionId)
      .select()
      .single(),

  deleteSessionById: (sessionId: string) =>
    supabaseAdmin
      .from('sessions')
      .delete()
      .eq('id', sessionId),

  findParticipantsBySessionId: (sessionId: string) =>
    supabaseAdmin
      .from('session_participants')
      .select('user_id')
      .eq('session_id', sessionId),

  findInterestedBySessionId: (sessionId: string) =>
    supabaseAdmin
      .from('session_interested')
      .select('user_id')
      .eq('session_id', sessionId),

  findSessionParticipant: (sessionId: string, userId: string) =>
    supabaseAdmin
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single(),

  countSessionParticipants: (sessionId: string) =>
    supabaseAdmin
      .from('session_participants')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId),

  insertSessionParticipant: (sessionId: string, userId: string) =>
    supabaseAdmin
      .from('session_participants')
      .insert({ session_id: sessionId, user_id: userId }),

  deleteSessionParticipant: (sessionId: string, userId: string) =>
    supabaseAdmin
      .from('session_participants')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId),

  findSessionInterest: (sessionId: string, userId: string) =>
    supabaseAdmin
      .from('session_interested')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single(),

  insertSessionInterest: (sessionId: string, userId: string) =>
    supabaseAdmin
      .from('session_interested')
      .insert({ session_id: sessionId, user_id: userId }),

  deleteSessionInterest: (sessionId: string, userId: string) =>
    supabaseAdmin
      .from('session_interested')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId),

  findProjectOwnerById: (projectId: string) =>
    supabaseAdmin
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single(),
};
