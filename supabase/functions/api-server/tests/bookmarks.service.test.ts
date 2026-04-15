import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { setTestEnv, withPatchedMethods } from "./_helpers.ts";

const serviceTest = (name: string, fn: () => Promise<void> | void) =>
  Deno.test({ name, sanitizeOps: false, sanitizeResources: false, fn });

setTestEnv();

const { bookmarksService } = await import("../src/services/bookmarks.service.ts");
const { bookmarksQuery } = await import("../src/queries/bookmarks.query.ts");

serviceTest("bookmarksService.toggleBookmark returns 401 without auth", async () => {
  const result = await bookmarksService.toggleBookmark(null, { sessionId: "s1" });
  assertEquals(result, { status: 401, body: { error: "Unauthorized" } });
});

serviceTest("bookmarksService.toggleBookmark returns 400 without sessionId", async () => {
  const result = await bookmarksService.toggleBookmark("user-1", {});
  assertEquals(result, { status: 400, body: { error: "Session ID required" } });
});

serviceTest("bookmarksService.toggleBookmark inserts bookmark when not existing", async () => {
  let inserted = false;

  await withPatchedMethods(
    bookmarksQuery as Record<string, unknown>,
    {
      findBookmark: () => Promise.resolve({ data: null }),
      insertBookmark: () => {
        inserted = true;
        return Promise.resolve({ error: null });
      },
      findBookmarkSessionIds: () =>
        Promise.resolve({ data: [{ session_id: "s1" }, { session_id: "s2" }] }),
    },
    async () => {
      const result = await bookmarksService.toggleBookmark("user-1", { sessionId: "s2" });
      assertEquals(inserted, true);
      assertEquals(result, {
        status: 200,
        body: { bookmarks: ["s1", "s2"], isBookmarked: true },
      });
    },
  );
});

serviceTest("bookmarksService.toggleBookmark deletes bookmark when already existing", async () => {
  let deleted = false;

  await withPatchedMethods(
    bookmarksQuery as Record<string, unknown>,
    {
      findBookmark: () => Promise.resolve({ data: { user_id: "user-1", session_id: "s1" } }),
      deleteBookmark: () => {
        deleted = true;
        return Promise.resolve({ error: null });
      },
      findBookmarkSessionIds: () => Promise.resolve({ data: [{ session_id: "s2" }] }),
    },
    async () => {
      const result = await bookmarksService.toggleBookmark("user-1", { sessionId: "s1" });
      assertEquals(deleted, true);
      assertEquals(result, {
        status: 200,
        body: { bookmarks: ["s2"], isBookmarked: false },
      });
    },
  );
});
