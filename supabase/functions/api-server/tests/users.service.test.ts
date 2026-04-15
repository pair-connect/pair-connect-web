import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { setTestEnv, withPatchedMethods } from "./_helpers.ts";

const serviceTest = (name: string, fn: () => Promise<void> | void) =>
  Deno.test({ name, sanitizeOps: false, sanitizeResources: false, fn });

setTestEnv();

const { usersService } = await import("../src/services/users.service.ts");
const { usersQuery } = await import("../src/queries/users.query.ts");

serviceTest("usersService.getUserById returns 403 for private profile", async () => {
  await withPatchedMethods(
    usersQuery as Record<string, unknown>,
    {
      findUserById: () => Promise.resolve({ data: { id: "u1", profile_public: false }, error: null }),
    },
    async () => {
      const result = await usersService.getUserById("viewer-1", "u1");
      assertEquals(result, { status: 403, body: { error: "Profile is private" } });
    },
  );
});

serviceTest("usersService.getUserById masks fields using privacy settings", async () => {
  await withPatchedMethods(
    usersQuery as Record<string, unknown>,
    {
      findUserById: () =>
        Promise.resolve({
          data: {
            id: "u1",
            email: "private@example.com",
            contacts: { email: "private@example.com" },
            bio: "bio",
            languages: ["TS"],
            stack: null,
            level: null,
            profile_public: true,
            privacy_settings: {
              showEmail: false,
              showContacts: false,
              showBio: false,
              showLanguages: false,
            },
          },
          error: null,
        }),
      findBookmarksByUserId: () => Promise.resolve({ data: [{ session_id: "s1" }] }),
    },
    async () => {
      const result = await usersService.getUserById("viewer-1", "u1");
      const body = result.body as Record<string, unknown>;

      assertEquals(result.status, 200);
      assertEquals(body.email, "");
      assertEquals(body.contacts, {});
      assertEquals(body.bio, null);
      assertEquals(body.languages, []);
      assertEquals(body.bookmarks, ["s1"]);
      assertEquals(body.stack, "Fullstack");
      assertEquals(body.level, "Junior");
    },
  );
});

serviceTest("usersService.searchUsers returns 500 when query fails", async () => {
  await withPatchedMethods(
    usersQuery as Record<string, unknown>,
    {
      listUsers: () =>
        Promise.resolve({
          data: null,
          error: { message: "boom", code: "X", details: "details" },
        }),
    },
    async () => {
      const result = await usersService.searchUsers("any");
      assertEquals(result, { status: 500, body: { error: "Error searching users: boom" } });
    },
  );
});
