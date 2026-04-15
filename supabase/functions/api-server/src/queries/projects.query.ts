import { supabaseAdmin } from "../clients/supabase.ts";

export const projectsQuery = {
  insertProject: (payload: Record<string, unknown>) =>
    supabaseAdmin
      .from('projects')
      .insert(payload)
      .select()
      .single(),

  listProjects: (filters: { ownerId?: string; stack?: string; level?: string }) => {
    let queryBuilder = supabaseAdmin.from('projects').select('*');

    if (filters.ownerId) {
      queryBuilder = queryBuilder.eq('owner_id', filters.ownerId);
    }
    if (filters.stack) {
      queryBuilder = queryBuilder.eq('stack', filters.stack);
    }
    if (filters.level) {
      queryBuilder = queryBuilder.eq('level', filters.level);
    }

    return queryBuilder.order('created_at', { ascending: false });
  },

  findProjectById: (projectId: string) =>
    supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single(),

  findProjectOwnerById: (projectId: string) =>
    supabaseAdmin
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single(),

  updateProjectById: (projectId: string, updates: Record<string, unknown>) =>
    supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single(),

  deleteProjectById: (projectId: string) =>
    supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId),

  findProjectInterestedUsers: (projectId: string) =>
    supabaseAdmin
      .from('project_interested')
      .select('user_id')
      .eq('project_id', projectId),

  findProjectRequestByProjectAndUser: (projectId: string, userId: string) =>
    supabaseAdmin
      .from('project_requests')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single(),

  deleteProjectRequestByProjectAndUser: (projectId: string, userId: string) =>
    supabaseAdmin
      .from('project_requests')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId),

  insertProjectRequest: (payload: Record<string, unknown>) =>
    supabaseAdmin
      .from('project_requests')
      .insert(payload),

  findAcceptedProjectRequestsByProjectId: (projectId: string) =>
    supabaseAdmin
      .from('project_requests')
      .select('user_id')
      .eq('project_id', projectId)
      .eq('status', 'accepted'),

  findProjectRequestsWithUser: (projectId: string) =>
    supabaseAdmin
      .from('project_requests')
      .select(`
        *,
        user:users!project_requests_user_id_fkey(id, name, username, email, avatar, stack, level)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),

  findProjectRequestByIdAndProject: (requestId: string, projectId: string) =>
    supabaseAdmin
      .from('project_requests')
      .select('*')
      .eq('id', requestId)
      .eq('project_id', projectId)
      .single(),

  updateProjectRequestStatus: (requestId: string, status: 'accepted' | 'rejected') =>
    supabaseAdmin
      .from('project_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single(),

  findSessionIdsByProjectId: (projectId: string) =>
    supabaseAdmin
      .from('sessions')
      .select('id')
      .eq('project_id', projectId),

  upsertSessionParticipants: (payload: Array<{ session_id: string; user_id: string }>) =>
    supabaseAdmin
      .from('session_participants')
      .upsert(payload, { onConflict: 'session_id,user_id' }),
};
