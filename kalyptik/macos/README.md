# Kalyptik Office pour macOS

La version Mac (Apple Silicon) se prépare en deux temps :

1. **GitHub compile l'application** sur ses Mac (gratuit pour un dépôt public).
   Elle sort **non signée** et n'est **pas publiée** : elle reste dans les
   artefacts du build pendant 7 jours.
2. **Votre MacBook la signe**, la fait **notariser par Apple** et crée le
   **.dmg** à vendre, avec `kalyptik/scripts/macos-sign.sh`. Ces étapes sont
   légères (quelques minutes, surtout l'attente d'Apple).

## Préparation du MacBook (une seule fois)

1. **Le script** : récupérez le dépôt (les sous-modules ne sont pas nécessaires).
   ```sh
   git clone https://github.com/HadesSama63/kalyptik-office.git
   cd kalyptik-office
   ```
2. **Le certificat « Developer ID Application »** (titulaire du compte Apple
   Developer) : Xcode → Réglages → Comptes → votre équipe → *Gérer les
   certificats…* → **+** → *Developer ID Application*. Vérification :
   ```sh
   security find-identity -v -p codesigning     # doit lister « Developer ID Application: … »
   ```
3. **Un mot de passe pour app** : [appleid.apple.com](https://appleid.apple.com)
   → Connexion et sécurité → *Mots de passe pour app* → en créer un
   (par exemple « notarisation Kalyptik »).
4. **Enregistrer l'accès à la notarisation** dans le trousseau. L'identifiant
   d'équipe (10 caractères) est sur
   [developer.apple.com/account](https://developer.apple.com/account) → *Membership*.
   ```sh
   xcrun notarytool store-credentials kalyptik-notarisation \
     --apple-id "votre-identifiant-apple@exemple.fr" \
     --team-id "ABCDE12345" \
     --password "abcd-efgh-ijkl-mnop"
   ```

## À chaque nouvelle version

1. **Compiler** : GitHub → *Actions* → *Kalyptik - Build* → *Run workflow* →
   cocher **macOS** (on peut cocher en même temps Windows, Linux et
   « Publier » : la version Mac n'est jamais publiée sur GitHub).
   La première compilation reconstruit toutes les dépendances (Chromium, V8…) :
   si elle dépasse les 6 heures autorisées, relancez-la, le travail déjà fait
   est gardé en cache. Les suivantes sont bien plus rapides.
2. **Télécharger** l'artefact `kalyptik-office-macos-arm64`, en bas de la page
   du build. Il contient `Kalyptik-Office-<version>-macos-arm64-non-signe.zip`
   (Safari le décompresse parfois tout seul en `Kalyptik Office.app` : les
   deux conviennent).
3. **Signer, notariser et créer le .dmg** :
   ```sh
   cd kalyptik-office && git pull
   ./kalyptik/scripts/macos-sign.sh ~/Downloads/Kalyptik-Office-9.3.5.27-macos-arm64-non-signe.zip
   ```
   Résultat : `kalyptik-macos/Kalyptik-Office-<version>-macos-arm64.dmg`,
   signé, notarisé et « agrafé » (il s'ouvre sans alerte, même hors ligne).
   Pour un essai sans passer par Apple : ajouter `--sans-notarisation`.
4. **Tester** le .dmg : l'ouvrir, glisser Kalyptik Office dans Applications,
   lancer l'application, ouvrir un document de chaque type.

En cas de refus d'Apple, le script affiche le détail et l'enregistre dans
`kalyptik-macos/notarisation-details.json`.

## Ce que contient la version Mac

Les mêmes ajouts que sous Windows et Linux (module Examen 2027, polices pour
l'école et la dyslexie, vérification des polices à l'ouverture, graphiques,
thèmes Kalyptik), avec le nom et l'icône Kalyptik Office. Différences :

- pas de mise à jour intégrée : la notification de nouvelle version n'apparaît
  sur Mac que pour une version publiée sur GitHub avec un .dmg ; pour la version
  payante, prévenez vos clients par votre plateforme de vente ;
- la langue suit celle de macOS (français sur un Mac en français).

## Vendre la version Mac : à savoir

- **Licence AGPL v3** (celle d'Euro-Office) : la vente est autorisée, mais vos
  acheteurs doivent pouvoir obtenir le code source (le dépôt public suffit ; le
  lien « Licence » de la fenêtre « À propos » y renvoie) et ils restent libres
  de redistribuer l'application. Ce que vous vendez, c'est la version prête à
  l'emploi, signée et notarisée, et votre suivi. Les mentions d'origine
  (Euro-Office, ONLYOFFICE) doivent rester.
- **Pas de Mac App Store** : ses conditions sont incompatibles avec l'AGPL ;
  vendez le .dmg directement.
- **Plateforme de vente** : une plateforme qui agit comme revendeur
  (*merchant of record*, par exemple Paddle ou Lemon Squeezy) encaisse, gère la
  TVA européenne et les factures, et vous reverse le montant net.
- **Statut** : vérifiez auprès de votre administration les règles de cumul
  d'activités des fonctionnaires, et le statut à utiliser pour les ventes
  (micro-entreprise, par exemple).
