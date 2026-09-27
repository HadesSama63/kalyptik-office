#!/usr/bin/env bash
# Applique la personnalisation Kalyptik sur les sources d'Euro-Office.
#
#   ./kalyptik/scripts/apply-kalyptik.sh                 # applique les correctifs (patches)
#   ./kalyptik/scripts/apply-kalyptik.sh <dossier-install>  # + copie les thèmes dans l'application construite
#
# Idempotent : un correctif déjà appliqué est ignoré.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

for dir in kalyptik/patches/*/; do
  sub=$(basename "$dir")
  for patch in "$dir"*.patch; do
    [ -e "$patch" ] || continue
    if git -C "$sub" apply --reverse --check "../$patch" 2>/dev/null; then
      echo "déjà appliqué : $patch"
    else
      git -C "$sub" apply "../$patch"
      echo "appliqué      : $patch"
    fi
  done
done

if [ $# -ge 1 ]; then
  install_dir=$1
  mkdir -p "$install_dir/uithemes"
  cp kalyptik/theme/uithemes/*.json "$install_dir/uithemes/"
  echo "thèmes copiés dans $install_dir/uithemes"
fi
