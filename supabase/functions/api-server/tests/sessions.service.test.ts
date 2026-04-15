import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { setTestEnv, withPatchedMethods } from "./_helpers.ts";

const serviceTest = (name: string, fn: () => Promise<void> | void) =>
  Deno.test({ name, sanitizeOps: false, sanitizeResources: false, fn });

setTestEnv();

const { sessionsService } = await import("../src/services/sessions.service.ts");
const { sessionsQuery } = await import("../src/queries/sessions.query.ts");

serviceTest("sessionsService.getSessionById hides link for non-owner and non-participant", async () => {
  await withPatchedMethods(
    sessionsQuery as Record<string, unknown>,
    {
      findSessionById: () =>
        Promise.resolve({
          data: {
            id: "session-1",
            owner_id: "owner-1",
            project_id: "project-1",
            max_participants: 4,
            title: "Session",
            link: "https://meet.test",
          },
          error: null,
        }),
      findParticipantsBySessionId: () => Promise.resolve({ data: [{ user_id: "member-1" }] }),
      findInterestedBySessionId: () => Promise.resolve({ data: [{ user_id: "interest-1" }] }),
    },
    async () => {
      const result = await sessionsService.getSessionById("session-1", "viewer-1");
      assertEquals(result.status, 200);
      assertEquals((result.body as Record<string, unknown>).link, null);
      assertEquals((result.body as Record<string, unknown>).participants, ["member-1"]);
    },
  );
});

serviceTest("sessionsService.getSessionById keeps link for owner", async () => {
  await withPatchedMethods(
    sessionsQuery as Record<string, unknown>,
    {
      findSessionById: () =>
        Promise.resolve({
          data: {
            id: "session-1",
            owner_id: "owner-1",
            project_id: "project-1",
            max_participants: 4,
            title: "Session",
            link: "https://meet.test",
          },
          error: null,
        }),
      findParticipantsBySessionId: () => Promise.resolve({ data: [] }),
      findInterestedBySessionId: () => Promise.resolve({ data: [] }),
    },
    async () => {
      const result = await sessionsService.getSessionById("session-1", "owner-1");
      assertEquals(result.status, 200);
      assertEquals((result.body as Record<string, unknown>).link, "https://meet.test");
    },
  );
});

serviceTest("sessionsService.joinSession returns 400 when already joined", async () => {
  await withPatchedMethods(
    sessionsQuery as Record<string, unknown>,
    {
      findSessionById: () => Promise.resolve({ data: { id: "session-1", max_participants: 4 } }),
      findSessionParticipant: () => Promise.resolve({ data: { user_id: "user-1" } }),
    },
    async () => {
      const result = await sessionsService.joinSession("user-1", "session-1");
      assertEquals(result, { status: 400, body: { error: "Already joined this session" } });
    },
  );
});
