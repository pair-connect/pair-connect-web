import type { Hono } from "hono";
import { verifyAuth } from "../auth/verifyAuth.ts";
import { projectsService } from "../services/projects.service.ts";

export const registerProjectsRoutes = (app: Hono) => {
  app.post('/make-server-39ee6a8c/projects', async (c) => {
    try {
      const authHeader = c.req.header('Authorization');
      console.log('Create project - Auth header present:', !!authHeader);

      const userId = await verifyAuth(authHeader);
      if (!userId) {
        console.log('Create project - Auth verification failed');
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const projectData = await c.req.json();
      const result = await projectsService.createProject(userId, projectData);
      return c.json(result.body, result.status as 200 | 401 | 500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('Create project error:', error);
      return c.json({ error: 'Internal server error creating project: ' + errorMessage }, 500);
    }
  });

  app.get('/make-server-39ee6a8c/projects', async (c) => {
    try {
      const ownerId = c.req.query('ownerId');
      const stack = c.req.query('stack');
      const level = c.req.query('level');
      const result = await projectsService.getProjects(ownerId, stack, level);
      return c.json(result.body, result.status as 200 | 500);
    } catch (error: unknown) {
      console.log('Get projects error:', error);
      return c.json({ error: 'Internal server error fetching projects' }, 500);
    }
  });

  app.get('/make-server-39ee6a8c/projects/:id', async (c) => {
    try {
      const result = await projectsService.getProjectById(c.req.param('id'));
      return c.json(result.body, result.status as 200 | 404);
    } catch (error: unknown) {
      console.log('Get project error:', error);
      return c.json({ error: 'Internal server error fetching project' }, 500);
    }
  });

  app.put('/make-server-39ee6a8c/projects/:id', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const projectId = c.req.param('id');

      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const updates = await c.req.json();
      const result = await projectsService.updateProject(userId, projectId, updates);
      return c.json(result.body, result.status as 200 | 401 | 403 | 500);
    } catch (error: unknown) {
      console.log('Update project error:', error);
      return c.json({ error: 'Internal server error updating project' }, 500);
    }
  });

  app.delete('/make-server-39ee6a8c/projects/:id', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const projectId = c.req.param('id');
      const result = await projectsService.deleteProject(userId, projectId);
      return c.json(result.body, result.status as 200 | 401 | 403 | 500);
    } catch (error: unknown) {
      console.log('Delete project error:', error);
      return c.json({ error: 'Internal server error deleting project' }, 500);
    }
  });

  app.post('/make-server-39ee6a8c/projects/:id/interested', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const projectId = c.req.param('id');
      const result = await projectsService.toggleProjectInterest(userId, projectId);
      return c.json(result.body, result.status as 200 | 400 | 401 | 404 | 500);
    } catch (error: unknown) {
      console.log('Toggle project interest error:', error);
      return c.json({ error: 'Internal server error toggling project interest' }, 500);
    }
  });

  app.get('/make-server-39ee6a8c/projects/:id/requests', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const projectId = c.req.param('id');
      const result = await projectsService.getProjectRequests(userId, projectId);
      return c.json(result.body, result.status as 200 | 401 | 403 | 500);
    } catch (error: unknown) {
      console.log('Get project requests error:', error);
      return c.json({ error: 'Internal server error fetching requests' }, 500);
    }
  });

  app.post('/make-server-39ee6a8c/projects/:id/requests/:requestId', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const projectId = c.req.param('id');
      const requestId = c.req.param('requestId');
      const { action } = await c.req.json();
      const result = await projectsService.updateProjectRequest(userId, projectId, requestId, action);
      return c.json(result.body, result.status as 200 | 400 | 401 | 403 | 404 | 500);
    } catch (error: unknown) {
      console.log('Update project request error:', error);
      return c.json({ error: 'Internal server error updating request' }, 500);
    }
  });
};
