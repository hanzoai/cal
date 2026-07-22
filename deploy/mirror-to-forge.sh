#!/usr/bin/env bash
# mirror-to-forge.sh — mirror a GitHub-canonical repo INTO git.hanzo.ai.
#
# Canonical origin is GitHub (github.com/hanzoai/<name>). git.hanzo.ai is a
# downstream mirror + native CI executor, so it FOLLOWS GitHub: the forge pulls
# from the canonical source (a server-side `git fetch +refs/*:refs/*`) rather
# than us push-seeding a second write target. Idempotent — the first call clones
# the source, a repeat call resyncs it.
#
# Auth: the live Hanzo IAM JWT (`hanzo auth token`) as a Bearer, written into a
# mode-600 curl config at call time — it never appears in argv, the URL, or the
# shell history. Requires a logged-in `hanzo` CLI (`hanzo auth whoami` resolves).
#
#   Usage: deploy/mirror-to-forge.sh <name> [github-org]
#   e.g.:  deploy/mirror-to-forge.sh cal              # public → anonymous fetch
#          deploy/mirror-to-forge.sh base             # (see private-source note)
#
# A PRIVATE GitHub source needs the forge's server-side GIT_MIRROR_TOKEN
# (allowlisted to github.com); that is forge deploy config, not set here.
set -euo pipefail

NAME="${1:?forge/github repo name required, e.g. cal}"
GH_ORG="${2:-hanzoai}"
API="https://api.hanzo.ai/v1/git"
SRC="https://github.com/${GH_ORG}/${NAME}.git"

CFG="$(mktemp)"; trap 'rm -f "$CFG"' EXIT; chmod 600 "$CFG"
# printf is a shell builtin → the token never appears in any process argv.
printf 'header = "Authorization: Bearer %s"\n' "$(hanzo auth token)" > "$CFG"

# 1) Ensure the forge repo exists under org `hanzo` (idempotent).
code="$(curl -sS -o /dev/null -m 30 -w '%{http_code}' -K "$CFG" \
  -H 'Content-Type: application/json' \
  -X POST "${API}/repos" -d "{\"name\":\"${NAME}\"}" || true)"
case "$code" in
  201) echo "created forge repo hanzo/${NAME}" ;;
  409) echo "forge repo hanzo/${NAME} already exists" ;;
  *)   echo "note: create returned HTTP ${code} (continuing)" ;;
esac

# 2) Mirror-IN: the forge force-fetches every ref from the GitHub canonical.
echo "mirroring ${SRC} -> git.hanzo.ai/hanzo/${NAME} ..."
curl -fsS -m 300 -K "$CFG" -H 'Content-Type: application/json' \
  -X POST "${API}/repos/${NAME}/mirror" -d "{\"source\":\"${SRC}\"}" \
  -w '\n<<HTTP %{http_code}>>\n'

echo "done — clone at https://git.hanzo.ai/hanzo/${NAME}.git"
