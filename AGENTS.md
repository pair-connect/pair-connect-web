# AGENTS.md

## Purpose
This repository is a TypeScript project with Supabase Edge Functions. Work must preserve existing frontend API behavior while refactoring backend internals from monolithic handlers into modular layers.

## Non-Negotiable Rules
1. Preserve API contracts 1:1 unless explicitly requested otherwise.
2. Keep endpoint paths, HTTP methods, status codes, response shapes, and error message semantics unchanged.
3. Do not introduce silent behavior changes (including validation or error-handling differences).
4. Make incremental, reversible changes with small diffs.
5. Prefer clarity and deterministic behavior over clever abstractions.

## API Contract Preservation
- Keep all public routes backward compatible.
- Preserve request/response field names and casing.
- Preserve optional vs required fields exactly.
- Preserve auth header expectations and token handling behavior.
- Preserve edge-case behavior unless there is explicit approval to change it.

If compatibility risk exists, stop and report before proceeding.

## Architecture Rules
Use strict separation of concerns:

- `routes/`
  - Parse HTTP input
  - Perform input validation
  - Delegate to services
  - Map service result to HTTP response

- `services/`
  - Business logic and orchestration
  - No raw HTTP handling
  - Use queries/adapters for persistence and mapping

- `queries/`
  - Data access only (Supabase reads/writes)
  - No business branching

- `adapters/` (when needed)
  - Map database/domain objects to frontend contract shapes

- `types/`
  - Shared DTO/domain/query typing

## Refactoring Guidelines
- Refactor by bounded module blocks (one domain at a time).
- Do not refactor unrelated domains in the same change.
- Keep old behavior in place while extracting; then switch wiring.
- Avoid broad renames/moves without functional value.
- Remove dead code only after replacement is validated.

## Validation Requirements
Every behavior-affecting change must be validated before and after:

1. Compile/type checks pass.
2. Run reproducible endpoint checks for success and error paths.
3. Verify parity for:
   - request payload expectations
   - response structure
   - status codes
   - error payloads/messages
4. Document any detected differences before fixing them.

Prefer script-based repeatable checks over ad-hoc manual testing.

## Commit Conventions
Use Conventional Commits:

- `feat:` new functionality
- `fix:` bug fix or behavior parity fix
- `refactor:` internal restructuring with no behavior change
- `test:` test/check additions or updates
- `docs:` documentation changes
- `chore:` tooling/maintenance

Guidelines:
- Keep commits focused and atomic.
- One logical change per commit.
- Include scope when useful (e.g., `refactor(auth): extract routes/service/query`).
- Do not mix refactor + behavior change in one commit unless explicitly approved.

## Definition of Done
A change is done only when:
- API contract parity is confirmed.
- Relevant checks pass.
- Diff is scoped to the intended module/domain.
- Documentation is updated if architecture or process rules changed.
