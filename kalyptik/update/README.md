# Mises à jour de Kalyptik Office

## Pour les utilisateurs

Au démarrage (puis toutes les 12 h), l'écran d'accueil compare la version
installée à la dernière version publiée dans l'onglet **Releases** du dépôt.
Si elle est plus récente, une carte « Nouvelle version disponible » propose :

- **Télécharger** : sous Windows, lance directement le téléchargement vérifié
  et affiche sa progression dans la carte. Une fois le fichier vérifié, un bouton
  de confirmation permet de fermer les documents, installer la mise à jour et
  relancer Kalyptik Office. L'installeur reprend la langue et le dossier
  précédemment choisis ; Windows peut demander une autorisation UAC. Sous Linux,
  le bouton propose le paquet `.deb` ou `.rpm` dans le navigateur pour installation
  par l'utilisateur ;
- **Nouveautés** : la page de la version ;
- **Plus tard** : masque cette version (la suivante sera de nouveau proposée).

Code : `kalyptik-update.js`, copié dans l'écran d'accueil au build
(`kalyptik/scripts/apply-kalyptik.sh`, étape 6).

La mise à jour Windows utilise le condensat SHA-256 fourni par l'API des releases
GitHub et ne lance pas le fichier si son téléchargement ou sa vérification échoue.
Les confirmations et les erreurs sont affichées dans la carte de mise à jour
plutôt que dans une boîte de dialogue du navigateur intégré. Après confirmation,
les éditeurs suivent leur parcours habituel de fermeture :
les documents non enregistrés peuvent donc encore être sauvegardés ou faire
annuler la fermeture. Le processus d'installation ne démarre qu'après la fermeture
de l'application.

## Publier une version

1. Nouveautés d'Euro-Office : fusionner la PR `sync/euro-office` ouverte chaque
   semaine par le workflow *Kalyptik - Sync upstream*.
2. Onglet **Actions → Kalyptik - Build → Run workflow**, cocher Windows et/ou
   Linux **et « Publier la version »**.
3. En fin de build, la version `v9.3.1.<n>` est créée avec les paquets ; les
   utilisateurs sont prévenus à leur prochain démarrage.

Le numéro `<n>` est le numéro d'exécution du workflow : il augmente à chaque
build, c'est lui qui permet de savoir qu'une version est plus récente.

Les paquets Linux restent installés par l'utilisateur afin de respecter le
gestionnaire de paquets de chaque distribution.
