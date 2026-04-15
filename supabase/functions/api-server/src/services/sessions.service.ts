import { sessionsQuery } from "../queries/sessions.query.ts";
import type { DbInterestedRow, DbSession } from "../types/domain.ts";
import type { CreateSessionDto, UpdateSessionDto } from "../types/dto.ts";
import { ensureUserExists } from "./users.service.ts";

type ServiceResult = { status: number; body: Record<string, unknown> | unknown[] };

const toFrontendSession = (
  session: DbSession,
  participants: Array<{ user_id: string }>,
  interested: DbInterestedRow[],
  userId: string | null
) => {
  const participantIds = participants?.map((p) => p.user_id) || [];
  const isOwner = userId === session.owner_id;
  const isParticipant = !!userId && participantIds.includes(userId);

  const sessionData: Record<string, unknown> = {
    ...session,
    projectId: session.project_id,
    ownerId: session.owner_id,
    maxParticipants: session.max_participants,
    participants: participantIds,
    interested: interested?.map((i) => i.user_id) || [],
  };

  if (!isOwner && !isParticipant) {
    delete sessionData.link;
    sessionData.link = null;
  }

  return sessionData;
};

export const sessionsService = {
  async createSession(userId: string | null, sessionData: CreateSessionDto): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const userExists = await ensureUserExists(userId);
    if (!userExists) {
      return { status: 500, body: { error: 'Could not create user profile' } };
    }

    const { projectId } = sessionData;
    const { data: project } = await sessionsQuery.findProjectOwnerById(projectId);

    if (!project || project.owner_id !== userId) {
      return { status: 403, body: { error: 'Forbidden - not project owner' } };
    }

    const { data: session, error } = await sessionsQuery.insertSession({
      project_id: projectId,
      owner_id: userId,
      title: sessionData.title,
      description: sessionData.description,
      date: sessionData.date,
      duration: sessionData.duration || 60,
      max_participants: sessionData.maxParticipants || 4,
      link: sessionData.link,
    });

    if (error) {
      console.log('Create session error:', error);
      return { status: 500, body: { error: 'Error creating session' } };
    }

    await sessionsQuery.insertSessionParticipant(session.id, userId);

    return {
      status: 200,
      body: {
        ...session,
        participants: [userId],
        interested: [],
      },
    };
  },

  async getSessions(projectId?: string, ownerId?: string, userId: string | null = null): Promise<ServiceResult> {
    const { data: sessions, error } = await sessionsQuery.listSessions({ projectId, ownerId });

    if (error) {
      console.log('Get sessions error details:', error.message, error.code, error.details);
      return { status: 500, body: { error: 'Error fetching sessions: ' + error.message } };
    }

    const sessionsWithRelations = await Promise.all(
      ((sessions as DbSession[] | null) || []).map(async (session) => {
        const { data: participants } = await sessionsQuery.findParticipantsBySessionId(session.id);
        const { data: interested } = await sessionsQuery.findInterestedBySessionId(session.id);
        return toFrontendSession(session, participants || [], interested || [], userId);
      })
    );

    return { status: 200, body: sessionsWithRelations };
  },

  async getSessionById(sessionId: string, userId: string | null): Promise<ServiceResult> {
    const { data: session, error } = await sessionsQuery.findSessionById(sessionId);

    if (error || !session) {
      return { status: 404, body: { error: 'Session not found' } };
    }

    const { data: participants } = await sessionsQuery.findParticipantsBySessionId(sessionId);
    const { data: interested } = await sessionsQuery.findInterestedBySessionId(sessionId);

    return {
      status: 200,
      body: toFrontendSession(session, participants || [], interested || [], userId),
    };
  },

  async updateSession(userId: string | null, sessionId: string, updates: UpdateSessionDto): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { data: existing } = await sessionsQuery.findSessionOwnerById(sessionId);

    if (!existing || existing.owner_id !== userId) {
      return { status: 403, body: { error: 'Forbidden - not session owner' } };
    }

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.duration) dbUpdates.duration = updates.duration;
    if (updates.maxParticipants) dbUpdates.max_participants = updates.maxParticipants;
    if (updates.link !== undefined) dbUpdates.link = updates.link;

    const { data: session, error } = await sessionsQuery.updateSessionById(sessionId, dbUpdates);

    if (error) {
      return { status: 500, body: { error: 'Error updating session' } };
    }

    return { status: 200, body: session };
  },

  async deleteSession(userId: string | null, sessionId: string): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { data: existing } = await sessionsQuery.findSessionOwnerById(sessionId);

    if (!existing || existing.owner_id !== userId) {
      return { status: 403, body: { error: 'Forbidden - not session owner' } };
    }

    const { error } = await sessionsQuery.deleteSessionById(sessionId);

    if (error) {
      return { status: 500, body: { error: 'Error deleting session' } };
    }

    return { status: 200, body: { success: true } };
  },

  async joinSession(userId: string | null, sessionId: string): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { data: session } = await sessionsQuery.findSessionById(sessionId);

    if (!session) {
      return { status: 404, body: { error: 'Session not found' } };
    }

    const { data: existing } = await sessionsQuery.findSessionParticipant(sessionId, userId);

    if (existing) {
      return { status: 400, body: { error: 'Already joined this session' } };
    }

    const { count } = await sessionsQuery.countSessionParticipants(sessionId);

    if ((count || 0) >= session.max_participants) {
      return { status: 400, body: { error: 'Session is full' } };
    }

    await sessionsQuery.insertSessionParticipant(sessionId, userId);
    await sessionsQuery.deleteSessionInterest(sessionId, userId);

    return { status: 200, body: { success: true } };
  },

  async leaveSession(userId: string | null, sessionId: string): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { data: session } = await sessionsQuery.findSessionOwnerById(sessionId);

    if (session?.owner_id === userId) {
      return { status: 400, body: { error: 'Owner cannot leave session' } };
    }

    await sessionsQuery.deleteSessionParticipant(sessionId, userId);

    return { status: 200, body: { success: true } };
  },

  async toggleSessionInterest(userId: string | null, sessionId: string): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { data: participant } = await sessionsQuery.findSessionParticipant(sessionId, userId);

    if (participant) {
      return { status: 400, body: { error: 'Already participating' } };
    }

    const { data: existing } = await sessionsQuery.findSessionInterest(sessionId, userId);

    if (existing) {
      await sessionsQuery.deleteSessionInterest(sessionId, userId);
    } else {
      await sessionsQuery.insertSessionInterest(sessionId, userId);
    }

    return { status: 200, body: { success: true, isInterested: !existing } };
  },
};
