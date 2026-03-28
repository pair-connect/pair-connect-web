import type { Hono } from "npm:hono";
import { verifyAuth } from "../auth/verifyAuth.ts";
import { validateSignupInput } from "../auth/auth.validation.ts";
import { authService } from "../services/auth.service.ts";

export const registerAuthRoutes = (app: Hono) => {
  app.post('/make-server-39ee6a8c/auth/signup', async (c) => {
    try {
      const body = await c.req.json();
      // Preserve baseline behavior for null payloads (throws and returns 500 in catch).
      console.log('Signup request received:', { email: body.email, username: body.username });
      const validated = validateSignupInput(body);
      if (validated.error) {
        return c.json({ error: validated.error }, 400);
      }
      const result = await authService.signup(validated.value!);
      return c.json(result.body, result.status as 200 | 400 | 500);
    } catch (error: any) {
      console.log('Signup fatal error:', error.message);
      return c.json({ error: `Error interno del servidor: ${error.message}` }, 500);
    }
  });

  app.post('/make-server-39ee6a8c/auth/login', async (c) => {
    try {
      const body = await c.req.json();
      const result = await authService.login(body);
      return c.json(result.body, result.status as 200 | 401 | 500);
    } catch (error: any) {
      console.log('Login server error:', error.message, error.stack);
      return c.json({ error: 'Internal server error during login' }, 500);
    }
  });

  app.get('/make-server-39ee6a8c/auth/session', async (c) => {
    try {
      const userId = await verifyAuth(c.req.header('Authorization'));
      const result = await authService.getSession(userId);
      return c.json(result.body, result.status as 200 | 401 | 404);
    } catch (error: unknown) {
      console.log('Session check error:', error);
      return c.json({ error: 'Internal server error checking session' }, 500);
    }
  });
};
