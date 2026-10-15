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
#   7. rubans et typographie     kalyptik/theme/ribbon/
#   8. polices                   kalyptik/fonts/
#   9. modules (extensions)      kalyptik/modules/  -> build/kalyptik-plugins/
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

echo "== 7. Rubans et typographie Kalyptik"
"$PYTHON" kalyptik/theme/ribbon/install.py

echo "== 8. Polices (libres incluses + vérification à l'ouverture)"
mkdir -p desktop-apps/win-linux/res/kalyptik-fonts
for dir in kalyptik/fonts/bundled/*/; do
  family=$(basename "$dir")
  cp "$dir"*.[ot]tf desktop-apps/win-linux/res/kalyptik-fonts/
  cp "$dir"OFL.txt "desktop-apps/win-linux/res/kalyptik-fonts/LICENCE-$family.txt"
done
cp kalyptik/fonts/kalyptik-fonts.js web-apps/apps/common/main/lib/util/
echo "   $(ls desktop-apps/win-linux/res/kalyptik-fonts/*.[ot]tf | wc -l) fichiers de police copiés"

echo "== 9. Modules (extensions des éditeurs)"
# Chaque module est copié dans un dossier nommé d'après son GUID ; le kit v1
# est partagé. Le Dockerfile « desktop-common » les place dans
# editors/sdkjs-plugins/ où l'application charge les extensions système.
rm -rf build/kalyptik-plugins
mkdir -p build/kalyptik-plugins
cp -r kalyptik/modules/v1 build/kalyptik-plugins/v1
for dir in kalyptik/modules/*/; do
  [ -f "$dir/config.json" ] || continue
  guid=$("$PYTHON" -c 'import json,sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["guid"].split(".", 1)[1])' "$dir/config.json")
  mkdir -p "build/kalyptik-plugins/$guid"
  (cd "$dir" && tar --exclude=tests --exclude='*.svg' -cf - .) | tar -xf - -C "build/kalyptik-plugins/$guid"
  echo "   $(basename "$dir") -> $guid"
done

echo "Kalyptik Office appliqué."
