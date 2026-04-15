# API Server (Supabase Edge Function)

## Architecture
- `src/app.ts`: composition/wiring only (middlewares + route registration)
- `src/routes/`: HTTP concerns (params/body/query parsing, auth extraction, HTTP response mapping)
- `src/services/`: business logic and orchestration
- `src/queries/`: Supabase data access only
- `src/adapters/frontend/`: payload mapping to frontend contract

## Contract rule
Public API must remain backward compatible unless explicitly approved:
- same endpoints and methods
- same status codes
- same response/error shapes and semantics

## Validation
- Type check:
  - `deno check supabase/functions/api-server/index.ts`
- Reproducible live checks:
  - `supabase/functions/api-server/scripts/check-auth-live.sh`
  - `supabase/functions/api-server/scripts/check-core-live.sh`
