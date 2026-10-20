# Kalyptik Office pour macOS

La version Mac (Apple Silicon) se prépare en deux temps :

1. **GitHub compile l'application** sur ses Mac (gratuit pour un dépôt public).
   Elle sort **non signée** et n'est **pas publiée** : elle reste dans les
   artefacts du build pendant 7 jours.
2. **Votre MacBook la signe**, la fait **notariser par Apple** et crée le
   **.dmg**, avec `kalyptik/scripts/macos-sign.sh`. Ces étapes sont légères
   (quelques minutes, surtout l'attente d'Apple).
3. **Vous ajoutez le .dmg à la version publiée sur GitHub** : il est alors
   proposé sur kalyptik.com (bloc `kalyptik/site/telechargement.html`) et les
   utilisateurs Mac sont prévenus dans l'application.

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

5. **Publier** : GitHub → *Releases* → la version correspondante (par exemple
   v9.3.5.28) → icône crayon (*Edit*) → glisser le .dmg dans la zone
   *Attach binaries* → *Update release*. Ne publiez que le .dmg produit par le
   script (signé et notarisé), jamais l'application non signée.

En cas de refus d'Apple, le script affiche le détail et l'enregistre dans
`kalyptik-macos/notarisation-details.json`.

## Ce que contient la version Mac

Les mêmes ajouts que sous Windows et Linux (module Examen 2027, polices pour
l'école et la dyslexie, vérification des polices à l'ouverture, graphiques,
thèmes Kalyptik), avec le nom et l'icône Kalyptik Office. Différences :

- pas d'installation intégrée des mises à jour : la notification de nouvelle
  version apparaît sur Mac quand une version publiée contient un .dmg, et
  propose de le télécharger ;
- la langue suit celle de macOS (français sur un Mac en français).

## Licence

Kalyptik Office est sous licence AGPL v3 (celle d'Euro-Office) : le code source
est sur ce dépôt (le lien « Licence » de la fenêtre « À propos » y renvoie) et
les mentions d'origine (Euro-Office, ONLYOFFICE) doivent rester. Le Mac App
Store n'est pas une option : ses conditions sont incompatibles avec l'AGPL.
