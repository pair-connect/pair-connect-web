export const setTestEnv = () => {
  Deno.env.set('SUPABASE_URL', 'http://127.0.0.1:54321');
  Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
  Deno.env.set('SUPABASE_ANON_KEY', 'test-anon-key');
};

type AnyFn = (...args: unknown[]) => unknown;

export const withPatchedMethods = async <T extends Record<string, unknown>>(
  target: T,
  patches: Partial<Record<keyof T, AnyFn>>,
  run: () => Promise<void> | void,
) => {
  const originals = new Map<keyof T, unknown>();

  for (const key of Object.keys(patches) as Array<keyof T>) {
    originals.set(key, target[key]);
    target[key] = patches[key] as T[keyof T];
  }

  try {
    await run();
  } finally {
    for (const [key, value] of originals) {
      target[key] = value as T[keyof T];
    }
  }
};
