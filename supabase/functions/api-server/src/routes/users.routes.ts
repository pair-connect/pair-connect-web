import type { Hono } from "hono";
import { verifyAuth } from "../auth/verifyAuth.ts";
import { usersService } from "../services/users.service.ts";

export const registerUsersRoutes = (app: Hono) => {
  app.get('/make-server-39ee6a8c/users/:id', async (c) => {
    try {
      const userId = c.req.param('id');
      const authHeader = c.req.header('Authorization');
      const requestingUserId = await verifyAuth(authHeader);
      const result = await usersService.getUserById(requestingUserId, userId);
      return c.json(result.body, result.status as 200 | 403 | 404);
    } catch (error: unknown) {
      console.log('Get user error:', error);
      return c.json({ error: 'Internal server error fetching user' }, 500);
    }
  });

  app.put('/make-server-39ee6a8c/users/:id', async (c) => {
    try {
      const authUserId = await verifyAuth(c.req.header('Authorization'));
      const requestedUserId = c.req.param('id');

      if (!authUserId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      if (authUserId !== requestedUserId) {
        return c.json({ error: 'Forbidden - can only update own profile' }, 403);
      }

      const updates = await c.req.json();
      const result = await usersService.updateUserProfile(authUserId, requestedUserId, updates);
      return c.json(result.body, result.status as 200 | 401 | 403 | 500);
    } catch (error: unknown) {
      console.log('Update user error:', error);
      return c.json({ error: 'Internal server error updating user' }, 500);
    }
  });

  app.get('/make-server-39ee6a8c/users', async (c) => {
    try {
      const query = c.req.query('q') || '';
      const stack = c.req.query('stack');
      const level = c.req.query('level');
      const result = await usersService.searchUsers(query, stack, level);
      return c.json(result.body, result.status as 200 | 500);
    } catch (error: unknown) {
      console.log('Search users error:', error);
      return c.json({ error: 'Internal server error searching users' }, 500);
    }
  });

  app.post('/make-server-39ee6a8c/users/:id/avatar', async (c) => {
    try {
      const authHeader = c.req.header('Authorization');
      console.log('Upload avatar - Auth header present:', !!authHeader);

      const authUserId = await verifyAuth(authHeader);
      const requestedUserId = c.req.param('id');

      console.log('Upload avatar - Auth verified, userId:', authUserId, 'requestedUserId:', requestedUserId);

      if (!authUserId) {
        console.log('Upload avatar - Auth verification failed');
        return c.json({ error: 'Unauthorized' }, 401);
      }

      if (authUserId !== requestedUserId) {
        console.log('Upload avatar - User ID mismatch');
        return c.json({ error: 'Forbidden - can only upload own avatar' }, 403);
      }

      const formData = await c.req.formData();
      const file = formData.get('file') as File;
      const result = await usersService.uploadAvatar(authUserId, requestedUserId, file || null);
      return c.json(result.body, result.status as 200 | 400 | 401 | 403 | 500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('Upload avatar error:', error);
      return c.json({ error: 'Internal server error uploading avatar: ' + errorMessage }, 500);
    }
  });
};
