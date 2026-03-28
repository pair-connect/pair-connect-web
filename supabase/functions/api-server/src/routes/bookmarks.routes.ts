import type { Hono } from "npm:hono";
import { verifyAuth } from "../auth/verifyAuth.ts";
import { bookmarksService } from "../services/bookmarks.service.ts";

export const registerBookmarksRoutes = (app: Hono) => {
  app.post('/make-server-39ee6a8c/bookmarks/toggle', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const body = await c.req.json();
      const result = await bookmarksService.toggleBookmark(userId, body);
      return c.json(result.body, result.status as 200 | 400 | 401);
    } catch (error: unknown) {
      console.log('Toggle bookmark error:', error);
      return c.json({ error: 'Internal server error toggling bookmark' }, 500);
    }
  });

  app.get('/make-server-39ee6a8c/bookmarks', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const result = await bookmarksService.getBookmarks(userId);
      return c.json(result.body, result.status as 200 | 401);
    } catch (error: unknown) {
      console.log('Get bookmarks error:', error);
      return c.json({ error: 'Internal server error fetching bookmarks' }, 500);
    }
  });
};
