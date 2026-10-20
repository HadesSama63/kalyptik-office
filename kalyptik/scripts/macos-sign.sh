#!/usr/bin/env bash
# Kalyptik Office pour macOS : signe l'application compilée par GitHub
# (artefact « kalyptik-office-macos-arm64 »), la fait notariser par Apple et
# crée le .dmg à distribuer. À lancer sur le Mac. Voir kalyptik/macos/README.md.
#
#   kalyptik/scripts/macos-sign.sh <application .zip ou .app> [options]
#
# Options :
#   --identite "<nom>"     certificat « Developer ID Application: … (ÉQUIPE) »
#                          (détecté automatiquement s'il n'y en a qu'un)
#   --profil <nom>         profil notarytool enregistré (défaut : kalyptik-notarisation)
#   --sortie <dossier>     dossier de travail et du .dmg (défaut : ./kalyptik-macos)
#   --sans-notarisation    signer et créer le .dmg sans l'envoyer à Apple (test)
set -euo pipefail

IDENTITY=""
PROFILE="kalyptik-notarisation"
OUT="$PWD/kalyptik-macos"
NOTARIZE=1
INPUT=""

die() { echo "ERREUR : $*" >&2; exit 1; }
step() { echo; echo "== $*"; }

while [ $# -gt 0 ]; do
    case "$1" in
        --identite) IDENTITY="$2"; shift 2 ;;
        --profil) PROFILE="$2"; shift 2 ;;
        --sortie) OUT="$2"; shift 2 ;;
        --sans-notarisation) NOTARIZE=0; shift ;;
        -h|--help) sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
        -*) die "option inconnue : $1" ;;
        *) INPUT="$1"; shift ;;
    esac
done

[ "$(uname -s)" = "Darwin" ] || die "ce script se lance sur un Mac."
[ -n "$INPUT" ] || die "indiquez l'application (.zip téléchargé depuis GitHub ou .app)."
[ -e "$INPUT" ] || die "introuvable : $INPUT"
for tool in codesign ditto hdiutil xattr /usr/libexec/PlistBuddy; do
    command -v "$tool" >/dev/null 2>&1 || die "outil manquant : $tool"
done
[ "$NOTARIZE" = 0 ] || xcrun --find notarytool >/dev/null 2>&1 || die "notarytool introuvable : installez Xcode."
mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)

# --- Certificat Developer ID
if [ -z "$IDENTITY" ]; then
    ids=$(security find-identity -v -p codesigning | sed -n 's/.*"\(Developer ID Application: [^"]*\)".*/\1/p' | sort -u)
    count=$(printf '%s' "$ids" | grep -c . || true)
    [ "$count" -ge 1 ] || die "aucun certificat « Developer ID Application » dans le trousseau (voir kalyptik/macos/README.md)."
    [ "$count" -eq 1 ] || die "plusieurs certificats Developer ID, choisissez avec --identite :
$ids"
    IDENTITY="$ids"
fi
echo "Certificat : $IDENTITY"

# --- Copie de travail de l'application
step "Préparation"
WORK="$OUT/travail"
rm -rf "$WORK"; mkdir -p "$WORK"
case "$INPUT" in
    *.zip) ditto -x -k "$INPUT" "$WORK" ;;
    *.app) ditto "$INPUT" "$WORK/$(basename "$INPUT")" ;;
    *) die "format non reconnu (attendu : .zip ou .app) : $INPUT" ;;
esac
APP=$(find "$WORK" -maxdepth 1 -name "*.app" -type d | head -1)
[ -n "$APP" ] || die "aucune application .app dans $INPUT"
NAME=$(basename "$APP" .app)
VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$APP/Contents/Info.plist")
BUILD=$(printf '%s' "$(basename "$INPUT")" | sed -n 's/.*-[0-9.]*\.\([0-9][0-9]*\)-macos.*/\1/p')
FULL="$VERSION${BUILD:+.$BUILD}"
echo "Application : $NAME $FULL"
xattr -cr "$APP"   # retire la « quarantaine » posée par le téléchargement

# Autorisations du runtime renforcé (Chromium a besoin du JIT). Pas de
# get-task-allow : Apple refuse de notariser une application débogable.
ENT="$OUT/autorisations.plist"
cat > "$ENT" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.cs.allow-jit</key>
	<true/>
	<key>com.apple.security.cs.allow-unsigned-executable-memory</key>
	<true/>
	<key>com.apple.security.cs.disable-library-validation</key>
	<true/>
	<key>com.apple.security.device.audio-input</key>
	<true/>
	<key>com.apple.security.device.camera</key>
	<true/>
</dict>
</plist>
EOF

by_depth() { awk -F/ '{print NF "\t" $0}' | sort -rn | cut -f2-; }
sign() { codesign --force --timestamp --options runtime --sign "$IDENTITY" "$@"; }

sign_all() {
    # 1. Chaque binaire Mach-O, du plus profond au moins profond
    local n=0 f kind
    while IFS= read -r f; do
        kind=$(file -b "$f")
        case "$kind" in
            *Mach-O*executable*) sign --entitlements "$ENT" "$f" >/dev/null ;;
            *Mach-O*) sign "$f" >/dev/null ;;
            *) continue ;;
        esac
        n=$((n + 1))
    done < <(find "$APP" -type f \( -perm -u+x -o -name "*.dylib" -o -name "*.so" \) | by_depth)
    echo "   $n binaires signés"
    # 2. Les paquets imbriqués (frameworks, auxiliaires .app, services .xpc)
    local b
    while IFS= read -r b; do
        case "$b" in
            *.app|*.xpc) sign --entitlements "$ENT" "$b" >/dev/null ;;
            *) sign "$b" >/dev/null ;;
        esac
    done < <(find "$APP/Contents" -type d \( -name "*.framework" -o -name "*.app" -o -name "*.xpc" -o -name "*.bundle" \) | by_depth)
    # 3. L'application elle-même
    sign --entitlements "$ENT" "$APP"
}

# Liens symboliques des auxiliaires Chromium qui sortent de leur propre paquet
# (vers le Chromium et les bibliothèques de l'application principale) : si la
# vérification stricte d'Apple les refuse, on les remplace par de vraies copies.
materialize_links() {
    local link target
    while IFS= read -r link; do
        target=$(cd "$(dirname "$link")" && cd "$(readlink "$link")" 2>/dev/null && pwd -P) || continue
        echo "   copie de $(basename "$target") dans $(echo "$link" | sed "s|$APP/||")"
        rm "$link"
        ditto "$target" "$link"
    done < <(find "$APP/Contents/Frameworks" -path "*.app/Contents/*" -type l)
}

step "Signature (Developer ID)"
sign_all
LOG="$OUT/verification.log"
if ! codesign --verify --deep --strict --verbose=2 "$APP" >"$LOG" 2>&1; then
    if grep -qi "symbolic link" "$LOG"; then
        echo "   liens symboliques refusés : remplacement par des copies, puis nouvelle signature"
        materialize_links
        sign_all
        codesign --verify --deep --strict --verbose=2 "$APP" >"$LOG" 2>&1 || { cat "$LOG"; die "signature invalide (détails ci-dessus)."; }
    else
        cat "$LOG"; die "signature invalide (détails ci-dessus)."
    fi
fi
echo "   signature vérifiée"

# --- Image disque
step "Création du .dmg"
DMG="$OUT/Kalyptik-Office-$FULL-macos-arm64.dmg"
DMGDIR="$OUT/dmg"
rm -rf "$DMGDIR" "$DMG"; mkdir -p "$DMGDIR"
ditto "$APP" "$DMGDIR/$NAME.app"
ln -s /Applications "$DMGDIR/Applications"
hdiutil create -volname "$NAME" -srcfolder "$DMGDIR" -ov -format UDZO "$DMG" >/dev/null
rm -rf "$DMGDIR"
sign "$DMG"
echo "   $DMG"

# --- Notarisation Apple
if [ "$NOTARIZE" = 1 ]; then
    step "Notarisation par Apple (quelques minutes)"
    RESULT="$OUT/notarisation.log"
    xcrun notarytool submit "$DMG" --keychain-profile "$PROFILE" --wait 2>&1 | tee "$RESULT"
    if ! grep -q "status: Accepted" "$RESULT"; then
        id=$(sed -n 's/^ *id: \([0-9a-f-]*\).*/\1/p' "$RESULT" | head -1)
        [ -n "$id" ] && xcrun notarytool log "$id" --keychain-profile "$PROFILE" "$OUT/notarisation-details.json" \
            && echo "Détails : $OUT/notarisation-details.json"
        die "Apple a refusé la notarisation (voir ci-dessus)."
    fi
    xcrun stapler staple "$DMG"
    spctl -a -t open --context context:primary-signature -v "$DMG"
fi

step "Terminé"
echo "$DMG"
[ "$NOTARIZE" = 1 ] || echo "(non notarisé : macOS avertira à l'ouverture sur un autre Mac)"
