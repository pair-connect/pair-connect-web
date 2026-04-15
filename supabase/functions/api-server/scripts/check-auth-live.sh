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

TS="$(date +%s)"
USERNAME="authcheck_${TS}"
EMAIL="${USERNAME}@example.com"
PASSWORD="Passw0rd!123"

REQ_DIR="/tmp/auth-check-${TS}"
mkdir -p "$REQ_DIR"

run() {
  local name="$1"
  shift
  echo "---- $name ----"
  curl -s -i "$@" > "$REQ_DIR/${name}.txt"
  sed -n '1,20p' "$REQ_DIR/${name}.txt"
  echo
}

run signup_success \
  -X POST "$VITE_API_URL/auth/signup" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  --data "{\"name\":\"Auth Check\",\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

run signup_missing_fields \
  -X POST "$VITE_API_URL/auth/signup" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  --data '{"name":"Only Name"}'

run signup_duplicate_username \
  -X POST "$VITE_API_URL/auth/signup" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  --data "{\"name\":\"Other\",\"username\":\"$USERNAME\",\"email\":\"other_${TS}@example.com\",\"password\":\"$PASSWORD\"}"

run login_success \
  -X POST "$VITE_API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  --data "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

run login_invalid_credentials \
  -X POST "$VITE_API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  --data "{\"email\":\"$EMAIL\",\"password\":\"wrong-password\"}"

LOGIN_BODY="$(awk 'BEGIN{p=0} p{print} /^\r?$/{p=1}' "$REQ_DIR/login_success.txt")"
TOKEN="$(printf "%s" "$LOGIN_BODY" | deno eval 'const s=await new Response(Deno.stdin.readable).text(); try { const j=JSON.parse(s); process.stdout.write((j.accessToken??"").trim()); } catch { process.stdout.write(""); }')"
TOKEN="$(printf '%s' "$TOKEN" | tr -d '\r\n')"

if [ -n "$TOKEN" ]; then
  run session_with_login_token \
    -X GET "$VITE_API_URL/auth/session" \
    -H "Authorization: Bearer $TOKEN" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY"
else
  echo "---- session_with_login_token ----"
  echo "No accessToken extracted from login_success"
  echo
fi

run session_invalid_token \
  -X GET "$VITE_API_URL/auth/session" \
  -H "Authorization: Bearer invalid.token.value" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"

run signup_null_payload \
  -X POST "$VITE_API_URL/auth/signup" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  --data 'null'

echo "Saved raw results in: $REQ_DIR"
