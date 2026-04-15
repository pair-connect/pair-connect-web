import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { setTestEnv, withPatchedMethods } from "./_helpers.ts";

const serviceTest = (name: string, fn: () => Promise<void> | void) =>
  Deno.test({ name, sanitizeOps: false, sanitizeResources: false, fn });

setTestEnv();

const { projectsService } = await import("../src/services/projects.service.ts");
const { projectsQuery } = await import("../src/queries/projects.query.ts");

serviceTest("projectsService.updateProjectRequest validates action", async () => {
  const result = await projectsService.updateProjectRequest(
    "owner-1",
    "project-1",
    "request-1",
    "invalid-action",
  );

  assertEquals(result, {
    status: 400,
    body: { error: 'Invalid action. Must be "accept" or "reject"' },
  });
});

serviceTest("projectsService.toggleProjectInterest rejects owner interest", async () => {
  await withPatchedMethods(
    projectsQuery as Record<string, unknown>,
    {
      findProjectById: () => Promise.resolve({ data: { id: "p1", owner_id: "owner-1" }, error: null }),
    },
    async () => {
      const result = await projectsService.toggleProjectInterest("owner-1", "p1");
      assertEquals(result, {
        status: 400,
        body: { error: "Cannot show interest in your own project" },
      });
    },
  );
});

serviceTest("projectsService.getProjects maps interested users", async () => {
  await withPatchedMethods(
    projectsQuery as Record<string, unknown>,
    {
      listProjects: () =>
        Promise.resolve({
          data: [
            {
              id: "p1",
              owner_id: "owner-1",
              title: "Project",
              description: "Desc",
              created_at: "2026-01-01T00:00:00.000Z",
            },
          ],
          error: null,
        }),
      findProjectInterestedUsers: () => Promise.resolve({ data: [{ user_id: "u1" }, { user_id: "u2" }] }),
    },
    async () => {
      const result = await projectsService.getProjects();
      const body = result.body as Array<Record<string, unknown>>;

      assertEquals(result.status, 200);
      assertEquals(body.length, 1);
      assertEquals(body[0].interested, ["u1", "u2"]);
      assertEquals(body[0].ownerId, "owner-1");
    },
  );
});
