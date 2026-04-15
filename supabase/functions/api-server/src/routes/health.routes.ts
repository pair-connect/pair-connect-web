import type { Hono } from "hono";

export const registerHealthRoutes = (app: Hono) => {
  app.get('/make-server-39ee6a8c/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
};
