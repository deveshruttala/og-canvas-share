#!/usr/bin/env bash
# Smoke test: signup → AI chat endpoint (requires OPENAI_API_KEY + running server)
set -euo pipefail

API="${VITE_API_URL:-http://localhost:8000}"
USER="testagent$(date +%s | tail -c 6)"
PASS="testpassword1234"

echo "→ Signup as $USER"
RESP=$(curl -sS -X POST "$API/auth/signup" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

echo "→ AI chat (add sticky)"
CHAT=$(curl -sS -X POST "$API/ai/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Add a yellow sticky that says Hello from Wall Agent at position 200,200"}],"canvasSummary":"Empty wall"}')

echo "$CHAT" | python3 -m json.tool

if echo "$CHAT" | grep -q 'add_sticky\|"toolCalls"'; then
  echo "✓ Agent returned tool calls"
else
  echo "⚠ No tool calls in response (check OPENAI_API_KEY)"
fi

echo "→ Unauthorized should 401"
CODE=$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$API/ai/chat" \
  -H 'Content-Type: application/json' \
  -d '{"messages":[],"canvasSummary":""}')
test "$CODE" = "401" && echo "✓ Unauthenticated blocked" || echo "✗ Expected 401 got $CODE"

echo "Done."
