#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env.local ]; then
  echo "Missing .env.local"
  exit 1
fi

set -a
source .env.local
set +a

if [ -z "${VITE_API_URL:-}" ] || [ -z "${VITE_SUPABASE_ANON_KEY:-}" ]; then
  echo "Missing VITE_API_URL or VITE_SUPABASE_ANON_KEY"
  exit 1
fi

# Required tokens and ids for protected/domain-specific checks.
# Export before running, for example:
# export CHECK_ACCESS_TOKEN="..."
# export CHECK_USER_ID="..."
# export CHECK_PROJECT_ID="..."
# export CHECK_SESSION_ID="..."

TS="$(date +%s)"
REQ_DIR="/tmp/api-core-check-${TS}"
mkdir -p "$REQ_DIR"

run() {
  local name="$1"
  shift
  echo "---- $name ----"
  curl -s -i "$@" > "$REQ_DIR/${name}.txt"
  sed -n '1,28p' "$REQ_DIR/${name}.txt"
  echo
}

run health \
  -X GET "$VITE_API_URL/health" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"

run users_search_public \
  -X GET "$VITE_API_URL/users?q=a" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"

if [ -n "${CHECK_USER_ID:-}" ] && [ -n "${CHECK_ACCESS_TOKEN:-}" ]; then
  run user_get_authenticated \
    -X GET "$VITE_API_URL/users/${CHECK_USER_ID}" \
    -H "Authorization: Bearer $CHECK_ACCESS_TOKEN" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY"

  run user_update_own_profile \
    -X PUT "$VITE_API_URL/users/${CHECK_USER_ID}" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $CHECK_ACCESS_TOKEN" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY" \
    --data '{"bio":"check-core"}'
else
  echo "Skipping user_get_authenticated and user_update_own_profile (set CHECK_USER_ID + CHECK_ACCESS_TOKEN)"
  echo
fi

run projects_list \
  -X GET "$VITE_API_URL/projects" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"

if [ -n "${CHECK_PROJECT_ID:-}" ]; then
  run project_get_by_id \
    -X GET "$VITE_API_URL/projects/${CHECK_PROJECT_ID}" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY"

  run project_requests_unauthorized \
    -X GET "$VITE_API_URL/projects/${CHECK_PROJECT_ID}/requests" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY"
else
  echo "Skipping project_get_by_id and project_requests_unauthorized (set CHECK_PROJECT_ID)"
  echo
fi

run sessions_list \
  -X GET "$VITE_API_URL/sessions" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"

if [ -n "${CHECK_SESSION_ID:-}" ]; then
  run session_get_by_id \
    -X GET "$VITE_API_URL/sessions/${CHECK_SESSION_ID}" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY"

  run session_join_unauthorized \
    -X POST "$VITE_API_URL/sessions/${CHECK_SESSION_ID}/join" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY"
else
  echo "Skipping session_get_by_id and session_join_unauthorized (set CHECK_SESSION_ID)"
  echo
fi

echo "Saved raw results in: $REQ_DIR"
