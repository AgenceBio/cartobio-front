# CartoBio - Frontend

> Application de suivi et de certificaton du parcellaire bio à destination des _opérateurs bio_ et des _organismes de certification_.

Cette application implémente [la maquette Figma CartoBio](https://www.figma.com/file/RpE4QhlPyV0OSSYuk5vPno/Cartobio) ainsi que le [Système de Design de l'État](https://www.systeme-de-design.gouv.fr/) avec [Vue 3](https://vuejs.org/), [Vue Router](https://router.vuejs.org/), [Vue Pages](https://github.com/hannoeru/vite-plugin-pages), [Pinia](https://pinia.vuejs.org/) et [MapLibre](https://maplibre.org/) entre autres.

Les erreurs sont centralisées avec [Sentry](https://github.com/getsentry/sentry) et les mesures pour les statistiques d'utilisation avec [Matomo](https://github.com/matomo-org/matomo).

## Développement

### Outils nécessaires

- `node` 20

On pourra utiliser `nvm` pour faciliter la gestion de différentes versions de node (cf. [`.nvmrc`](.nvmrc)) :

```sh
nvm install && nvm use
```

### Configuration

Créer un fichier `.env` inspiré de `.env.local.example`.
Bien vérifier l'API mobilisée paramétrée avec `VUE_APP_API_ENDPOINT`.

### Application

Récupérer les dépendances :

```sh
# Versions verrouillées
npm ci

# Et/ou en les mettant à jour
npm install
```

Démarrer :

```sh
npm start
```

Ouvrir :

- http://localhost:3000/

### WebComponent Notification

Le composant est intégré au portail de notification de l'Agence Bio pour proposer une option de chargement de parcellaire dès la première étape règlementaire.

Le code source se situe dans [`widget/`](widget/).

La variable d'environnement `VUE_APP_NOTIFICATIONS_AB_SAMPLE_WEBCOMPONENT_TOKEN` doit être configurée avec un jeton valide.

La clé publique de vérification doit être installée côté API via la variable d'environnement `NOTIFICATIONS_AB_PUBLIC_KEY`.

```sh
npm start -- --config vite.widget.config.js
```

Ouvrir :

- http://localhost:3000/

La page documente son intégration dans une page web tout en proposant une version interactive.

### Exécution des tests

```sh
npm test
```

### Préparation au déploiement

```sh
npm run build
```

Les fichiers produits sont dans le répertoire `dist`.

## Déploiement

### Environnement de test

Chaque commit/push sur la branche `test` déploie en test : [Build and deploy (test)](https://github.com/AgenceBio/cartobio-front/actions/workflows/test.yml)

### Environnement de préproduction

Chaque commit/push sur la branche `v2` déploie en préproduction : [Build and deploy (staging)](https://github.com/AgenceBio/cartobio-front/actions/workflows/staging.yml)

### Environnement de production

Chaque nouveau tag `v2.*` déploie en production : [Build and deploy (production)](https://github.com/AgenceBio/cartobio-front/actions/workflows/deploy.yml)

Pour créer un tag :

```sh
# Lors d'ajout de fonctionnalités
npm version minor

# Lors d'un correctif ou ajout très mineur
npm version patch
```

Puis :

```sh
git push --tags
```

## Maintenance

### Mettre à jour les codes cultures PAC

```sh
npm install @agencebio/rosetta-cultures@latest
```
