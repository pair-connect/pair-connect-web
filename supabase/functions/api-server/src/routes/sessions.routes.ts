import type { Hono } from "hono";
import { verifyAuth } from "../auth/verifyAuth.ts";
import { sessionsService } from "../services/sessions.service.ts";

export const registerSessionsRoutes = (app: Hono) => {
  app.post('/make-server-39ee6a8c/sessions', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const sessionData = await c.req.json();
      const result = await sessionsService.createSession(userId, sessionData);
      return c.json(result.body, result.status as 200 | 401 | 403 | 500);
    } catch (error: unknown) {
      console.log('Create session error:', error);
      return c.json({ error: 'Internal server error creating session' }, 500);
    }
  });

  app.get('/make-server-39ee6a8c/sessions', async (c) => {
    try {
      const projectId = c.req.query('projectId');
      const ownerId = c.req.query('ownerId');
      const userId = await verifyAuth(c.req.header('Authorization'));
      const result = await sessionsService.getSessions(projectId, ownerId, userId);
      return c.json(result.body, result.status as 200 | 500);
    } catch (error: unknown) {
      console.log('Get sessions error:', error);
      return c.json({ error: 'Internal server error fetching sessions' }, 500);
    }
  });

  app.get('/make-server-39ee6a8c/sessions/:id', async (c) => {
    try {
      const sessionId = c.req.param('id');
      const userId = await verifyAuth(c.req.header('Authorization'));
      const result = await sessionsService.getSessionById(sessionId, userId);
      return c.json(result.body, result.status as 200 | 404);
    } catch (error: unknown) {
      console.log('Get session error:', error);
      return c.json({ error: 'Internal server error fetching session' }, 500);
    }
  });

  app.put('/make-server-39ee6a8c/sessions/:id', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const sessionId = c.req.param('id');

      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const updates = await c.req.json();
      const result = await sessionsService.updateSession(userId, sessionId, updates);
      return c.json(result.body, result.status as 200 | 401 | 403 | 500);
    } catch (error: unknown) {
      console.log('Update session error:', error);
      return c.json({ error: 'Internal server error updating session' }, 500);
    }
  });

  app.delete('/make-server-39ee6a8c/sessions/:id', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const sessionId = c.req.param('id');
      const result = await sessionsService.deleteSession(userId, sessionId);
      return c.json(result.body, result.status as 200 | 401 | 403 | 500);
    } catch (error: unknown) {
      console.log('Delete session error:', error);
      return c.json({ error: 'Internal server error deleting session' }, 500);
    }
  });

  app.post('/make-server-39ee6a8c/sessions/:id/join', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const sessionId = c.req.param('id');
      const result = await sessionsService.joinSession(userId, sessionId);
      return c.json(result.body, result.status as 200 | 400 | 401 | 404);
    } catch (error: unknown) {
      console.log('Join session error:', error);
      return c.json({ error: 'Internal server error joining session' }, 500);
    }
  });

  app.post('/make-server-39ee6a8c/sessions/:id/leave', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const sessionId = c.req.param('id');
      const result = await sessionsService.leaveSession(userId, sessionId);
      return c.json(result.body, result.status as 200 | 400 | 401);
    } catch (error: unknown) {
      console.log('Leave session error:', error);
      return c.json({ error: 'Internal server error leaving session' }, 500);
    }
  });

  app.post('/make-server-39ee6a8c/sessions/:id/interested', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const sessionId = c.req.param('id');
      const result = await sessionsService.toggleSessionInterest(userId, sessionId);
      return c.json(result.body, result.status as 200 | 400 | 401);
    } catch (error: unknown) {
      console.log('Toggle interest error:', error);
      return c.json({ error: 'Internal server error toggling interest' }, 500);
    }
  });
};
