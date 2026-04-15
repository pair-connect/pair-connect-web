import {
  assertEquals,
  assertMatch,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { setTestEnv, withPatchedMethods } from "./_helpers.ts";

const serviceTest = (name: string, fn: () => Promise<void> | void) =>
  Deno.test({ name, sanitizeOps: false, sanitizeResources: false, fn });

setTestEnv();

const { createApp } = await import("../src/app.ts");
const { authService } = await import("../src/services/auth.service.ts");
const { projectsService } = await import("../src/services/projects.service.ts");
const { sessionsService } = await import("../src/services/sessions.service.ts");
const { usersService } = await import("../src/services/users.service.ts");

const app = createApp();

serviceTest("GET /health returns expected payload", async () => {
  const res = await app.fetch(
    new Request("http://localhost/make-server-39ee6a8c/health", { method: "GET" }),
  );

  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(body.status, "ok");
  assertMatch(body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

serviceTest("GET /projects maps service response and status", async () => {
  await withPatchedMethods(
    projectsService as Record<string, unknown>,
    {
      getProjects: () => Promise.resolve({ status: 200, body: [{ id: "p1", title: "Demo" }] }),
    },
    async () => {
      const res = await app.fetch(
        new Request("http://localhost/make-server-39ee6a8c/projects?stack=Fullstack", {
          method: "GET",
        }),
      );

      const body = await res.json();
      assertEquals(res.status, 200);
      assertEquals(body, [{ id: "p1", title: "Demo" }]);
    },
  );
});

serviceTest("POST /projects without auth keeps 401 contract", async () => {
  const res = await app.fetch(
    new Request("http://localhost/make-server-39ee6a8c/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "x", description: "y" }),
    }),
  );

  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body, { error: "Unauthorized" });
});

serviceTest("GET /sessions/:id maps service response and status", async () => {
  await withPatchedMethods(
    sessionsService as Record<string, unknown>,
    {
      getSessionById: () =>
        Promise.resolve({
          status: 200,
          body: { id: "s1", projectId: "p1", ownerId: "u1", link: null },
        }),
    },
    async () => {
      const res = await app.fetch(
        new Request("http://localhost/make-server-39ee6a8c/sessions/s1", { method: "GET" }),
      );

      const body = await res.json();
      assertEquals(res.status, 200);
      assertEquals(body, { id: "s1", projectId: "p1", ownerId: "u1", link: null });
    },
  );
});

serviceTest("PUT /sessions/:id without auth keeps 401 contract", async () => {
  const res = await app.fetch(
    new Request("http://localhost/make-server-39ee6a8c/sessions/s1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "new-title" }),
    }),
  );

  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body, { error: "Unauthorized" });
});

serviceTest("POST /auth/signup missing fields keeps 400 contract", async () => {
  const res = await app.fetch(
    new Request("http://localhost/make-server-39ee6a8c/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Only Name" }),
    }),
  );

  const body = await res.json();
  assertEquals(res.status, 400);
  assertEquals(body, { error: "Todos los campos son requeridos" });
});

serviceTest("POST /auth/signup null payload keeps 500 error format", async () => {
  const res = await app.fetch(
    new Request("http://localhost/make-server-39ee6a8c/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "null",
    }),
  );

  const body = await res.json();
  assertEquals(res.status, 500);
  assertEquals(typeof body.error, "string");
  assertMatch(body.error, /^Error interno del servidor:/);
});

serviceTest("POST /auth/login maps authService status and body", async () => {
  await withPatchedMethods(
    authService as Record<string, unknown>,
    {
      login: () =>
        Promise.resolve({
          status: 401,
          body: { error: "Email o contraseña incorrectos. Verifica tus credenciales." },
        }),
    },
    async () => {
      const res = await app.fetch(
        new Request("http://localhost/make-server-39ee6a8c/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "a@b.com", password: "wrong" }),
        }),
      );

      const body = await res.json();
      assertEquals(res.status, 401);
      assertEquals(body, { error: "Email o contraseña incorrectos. Verifica tus credenciales." });
    },
  );
});

serviceTest("GET /auth/session without auth keeps 401 contract", async () => {
  const res = await app.fetch(
    new Request("http://localhost/make-server-39ee6a8c/auth/session", { method: "GET" }),
  );

  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body, { error: "Unauthorized" });
});

serviceTest("GET /users maps usersService response and status", async () => {
  await withPatchedMethods(
    usersService as Record<string, unknown>,
    {
      searchUsers: () =>
        Promise.resolve({
          status: 200,
          body: [{ id: "u1", username: "helena" }],
        }),
    },
    async () => {
      const res = await app.fetch(
        new Request("http://localhost/make-server-39ee6a8c/users?q=helena", { method: "GET" }),
      );

      const body = await res.json();
      assertEquals(res.status, 200);
      assertEquals(body, [{ id: "u1", username: "helena" }]);
    },
  );
});

serviceTest("GET /users/:id maps usersService 403 contract", async () => {
  await withPatchedMethods(
    usersService as Record<string, unknown>,
    {
      getUserById: () => Promise.resolve({ status: 403, body: { error: "Profile is private" } }),
    },
    async () => {
      const res = await app.fetch(
        new Request("http://localhost/make-server-39ee6a8c/users/u-private", { method: "GET" }),
      );

      const body = await res.json();
      assertEquals(res.status, 403);
      assertEquals(body, { error: "Profile is private" });
    },
  );
});

serviceTest("PUT /users/:id without auth keeps 401 contract", async () => {
  const res = await app.fetch(
    new Request("http://localhost/make-server-39ee6a8c/users/user-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio: "x" }),
    }),
  );

  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body, { error: "Unauthorized" });
});
