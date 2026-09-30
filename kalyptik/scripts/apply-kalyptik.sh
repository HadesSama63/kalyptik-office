#!/usr/bin/env bash
# Applique la personnalisation Kalyptik Office sur les sources d'Euro-Office
# (sous-modules), juste avant la compilation. Rien n'est commité dans les
# sous-modules : `git submodule foreach git checkout -- .` revient à l'origine.
#
#   ./kalyptik/scripts/apply-kalyptik.sh
#
# Étapes (toutes idempotentes) :
#   1. correctifs de code        kalyptik/patches/<sous-module>/*.patch
#   2. renommage                 kalyptik/brand/rebrand.py
#   3. images et icônes          kalyptik/brand/overlay/  (copié par-dessus)
#   4. thèmes d'interface        kalyptik/theme/uithemes/*.json
#   5. traductions françaises    kalyptik/i18n/complete_fr.py
#   6. mises à jour              kalyptik/update/kalyptik-update.js
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
PYTHON=$(command -v python3 || command -v python)

echo "== 1. Correctifs"
for dir in kalyptik/patches/*/; do
  sub=$(basename "$dir")
  for patch in "$dir"*.patch; do
    [ -e "$patch" ] || continue
    if git -C "$sub" apply --unidiff-zero --reverse --check "../$patch" 2>/dev/null; then
      echo "   déjà appliqué : $patch"
    else
      git -C "$sub" apply --unidiff-zero "../$patch"
      echo "   appliqué      : $patch"
    fi
  done
done

echo "== 2. Renommage"
"$PYTHON" kalyptik/brand/rebrand.py

echo "== 3. Images et icônes"
cp -r kalyptik/brand/overlay/. .
echo "   $(find kalyptik/brand/overlay -type f | wc -l) fichiers copiés"

echo "== 4. Thèmes d'interface"
mkdir -p desktop-apps/win-linux/res/uithemes
cp kalyptik/theme/uithemes/*.json desktop-apps/win-linux/res/uithemes/
echo "   $(ls kalyptik/theme/uithemes/*.json | wc -l) thèmes copiés"

echo "== 5. Traductions françaises manquantes"
"$PYTHON" kalyptik/i18n/complete_fr.py

echo "== 6. Notification de nouvelle version"
cp kalyptik/update/kalyptik-update.js desktop-apps/common/loginpage/src/
echo "   kalyptik-update.js copié"

echo "Kalyptik Office appliqué."
