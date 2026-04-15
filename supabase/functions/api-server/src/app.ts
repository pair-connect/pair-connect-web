import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { registerAuthRoutes } from "./routes/auth.routes.ts";
import { registerBookmarksRoutes } from "./routes/bookmarks.routes.ts";
import { registerHealthRoutes } from "./routes/health.routes.ts";
import { registerProjectsRoutes } from "./routes/projects.routes.ts";
import { registerSessionsRoutes } from "./routes/sessions.routes.ts";
import { registerUsersRoutes } from "./routes/users.routes.ts";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  '/*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
  })
);

registerHealthRoutes(app);
registerAuthRoutes(app);
registerBookmarksRoutes(app);
registerUsersRoutes(app);
registerProjectsRoutes(app);
registerSessionsRoutes(app);

export const createApp = () => app;
