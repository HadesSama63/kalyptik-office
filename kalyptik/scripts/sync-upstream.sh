#!/usr/bin/env bash
# Intègre la dernière version d'Euro-Office DesktopEditors dans la branche courante.
set -euo pipefail

UPSTREAM_URL="https://github.com/Euro-Office/DesktopEditors.git"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-main}"

cd "$(git rev-parse --show-toplevel)"

if ! git remote get-url upstream >/dev/null 2>&1; then
  git remote add upstream "$UPSTREAM_URL"
fi

git fetch upstream "$UPSTREAM_BRANCH"

if git merge-base --is-ancestor "upstream/$UPSTREAM_BRANCH" HEAD; then
  echo "Déjà à jour avec Euro-Office ($UPSTREAM_BRANCH)."
  exit 0
fi

git merge --no-edit -m "Sync Euro-Office ($UPSTREAM_BRANCH)" "upstream/$UPSTREAM_BRANCH"
git submodule update --init --recursive 2>/dev/null || true
echo "Mise à jour Euro-Office intégrée. Vérifiez puis poussez avec : git push"
