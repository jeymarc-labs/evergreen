#!/usr/bin/env bash
# All deterministic checks in one command.
#   scripts/check.sh          secrets, images, shellcheck, unit tests, types, build
#   scripts/check.sh --quick  same without the build
set -euo pipefail
cd "$(dirname "$0")/.."

# Use the Node from .nvmrc via nvm when available (Astro needs >= 22.23.4).
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh" >/dev/null
  nvm use >/dev/null || { echo "nvm use failed: install the Node version in .nvmrc"; exit 1; }
fi
export PATH="/opt/homebrew/bin:$PATH"

quick=0
[ "${1:-}" = "--quick" ] && quick=1
fail=0
step() { printf '\n== %s\n' "$1"; }

step "node $(node -v)"

step "secrets"
scripts/check_secrets.sh || fail=1

step "images (metadata, size, format)"
node scripts/clean_images.mjs --check || fail=1

step "shell scripts"
if command -v shellcheck >/dev/null; then shellcheck scripts/*.sh && echo "shellcheck: ok" || fail=1
else echo "shellcheck not installed (brew install shellcheck)"; fail=1; fi

step "unit tests"
if node --test 'tests/**/*.test.ts' >"${TMPDIR:-/tmp}/evergreen-test.log" 2>&1; then
  grep -E '^ℹ (tests|pass|fail) ' "${TMPDIR:-/tmp}/evergreen-test.log" | tr '\n' ' '; echo
else
  cat "${TMPDIR:-/tmp}/evergreen-test.log"; fail=1
fi

step "types (astro check)"
log="${TMPDIR:-/tmp}/evergreen-check.log"
if npx --no-install astro check >"$log" 2>&1; then tail -4 "$log"; else cat "$log"; fail=1; fi

if [ "$quick" -eq 0 ]; then
  step "build"
  if npx --no-install astro build >"${TMPDIR:-/tmp}/evergreen-build.log" 2>&1; then
    echo "build: ok ($(find dist -name '*.html' | wc -l | tr -d ' ') pages)"
  else
    tail -20 "${TMPDIR:-/tmp}/evergreen-build.log"; fail=1
  fi
fi

printf '\n%s\n' "$([ "$fail" -eq 0 ] && echo 'ALL CHECKS PASSED' || echo 'CHECKS FAILED')"
exit "$fail"
