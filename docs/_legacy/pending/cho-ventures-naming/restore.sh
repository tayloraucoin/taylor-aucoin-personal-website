#!/usr/bin/env bash
# Re-applies the Cho Ventures de-anonymization. See NOTE.md — do not run this
# until Tony Cho's written email confirmation is in hand.
#
#   bash docs/pending/cho-ventures-naming/restore.sh
#
# Run from the repo root. It renames the case study and its asset directory,
# then applies naming.patch on top. Nothing is committed.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
HERE=docs/pending/cho-ventures-naming

test -f content/work/family-office-platform.ts \
  || { echo "content/work/family-office-platform.ts not found — already restored?"; exit 1; }

git mv content/work/family-office-platform.ts content/work/cho-ventures.ts
git mv public/work/family-office-platform public/work/cho-ventures
git mv public/work/cho-ventures/family-office-architecture.webp \
       public/work/cho-ventures/cho-ventures-architecture.webp

# Plain apply: the patch carries no blob hashes, so --3way only adds noise.
# If context has drifted, fall back to `patch -p1 < $HERE/naming.patch`.
git apply "$HERE/naming.patch"

echo
echo "Restored. Now:"
echo "  npx tsc --noEmit && yarn build:agent"
echo "  git rm -r --cached docs/pending/cho-ventures-naming && rm -rf docs/pending/cho-ventures-naming"
