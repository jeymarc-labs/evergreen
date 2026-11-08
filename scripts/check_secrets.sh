#!/usr/bin/env bash
# Fails if anything that looks like a secret is tracked, staged or untracked-but-not-ignored.
# Prints file:line only, never the value.
set -euo pipefail
cd "$(dirname "$0")/.."

# Patterns are assembled from pieces so this file never matches itself and can be scanned too.
p_known='(sk_(live|test)_|r''e_[A-Za-z0-9_]{20,}|gh[opsu]_[A-Za-z0-9]{20,}|AK''IA[0-9A-Z]{16}|0x4[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE'' KEY-----)'
p_assign='["'"'"']?[A-Za-z_]*(SECRET|TOKEN|PASSWORD|API_KEY|APIKEY|PRIVATE_KEY)[A-Za-z_]*["'"'"']?[[:space:]]*[=:][[:space:]]*["'"'"']?[^[:space:]"'"'"',}]{8,}'
p_hex40='(^|[^0-9a-fA-F])[0-9a-f]{4''0}([^0-9a-fA-F]|$)'   # Strava secrets/tokens; only checked in .env* files

files=$( { git ls-files; git diff --cached --name-only; git ls-files --others --exclude-standard; } | sort -u )
found=0
while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in package-lock.json|*.png|*.jpg|*.jpeg|*.webp|*.avif|*.ico|*.heic) continue ;; esac
  # Known key formats are always reported. For "NAME = value" assignments, reading the value from the
  # environment (env.X, process.env.X, import.meta.env.X, getSecret(...), envField.*) is not a
  # secret, so only those are skipped.
  known=$(grep -nE "$p_known" -- "$f" 2>/dev/null | cut -d: -f1 || true)
  assigned=$(grep -niE "$p_assign" -- "$f" 2>/dev/null \
    | grep -vE '[=:][[:space:]]*((env|process\.env|import\.meta\.env)\.[A-Z_]+|getSecret\(|envField\.)' | cut -d: -f1 || true)
  lines=$(printf '%s\n%s\n' "$known" "$assigned" | sort -nu | tr '\n' ' ')
  case "$f" in .env*|*/.env*) lines="$lines $(grep -nE "$p_hex40" -- "$f" 2>/dev/null | cut -d: -f1 || true)" ;; esac
  for line in $lines; do echo "looks like a key at $f:$line"; found=1; done
done <<< "$files"

# Any real env file (not an example) that git would track is a failure.
while IFS= read -r f; do
  case "$f" in *.example) ;; .env*|*/.env*) echo "env file tracked or not ignored: $f"; found=1 ;; esac
done <<< "$files"

[ "$found" -eq 0 ] && echo "secrets: none found"
exit "$found"
