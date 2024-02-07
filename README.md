# CartoBio

Application de suivi et de certificaton du parcellaire bio à destination des _opérateurs bio_[^1] et aux _organismes de certification_.

Cette application implémente [la maquette Figma CartoBio][maquette-figma] ainsi que le [Système de Design de l'État](https://www.systeme-de-design.gouv.fr/) avec [Vue 3], [Vue Router], [Vue Pages] et [Pinia].

## Installation

**Pré-requis** : `node@20`

```bash
npm install
```

### Développement local

```bash
npm start
```

### WebComponent Notification

Le composant est intégré au portail de notification de l'Agence Bio pour proposer une option de chargement de parcellaire dès la première étape règlementaire.

Le code source se situe dans [`src/widget/`](src/widget/).

La variable d'environnement `VUE_APP_NOTIFICATIONS_AB_SAMPLE_WEBCOMPONENT_TOKEN` doit être configurée avec un jeton valide.

La clé publique de vérification doit être installée côté API via la variable d'environnement `NOTIFICATIONS_AB_PUBLIC_KEY`.

```
npm start -- --config vite.widget.config.js
```

La page [`src/widget/index.html`](src/widget/index.html) documente son intégration dans une page web, tout en proposant une version interactive.

### Prépare au déploiement

```bash
npm run build
```

### Exécution des tests

```bash
npm test
```

## Déploiement

### Par branche

[Netlify] dépose un commentaire par Pull Request, avec un lien vers une URL prévisualisation.

### En préproduction

Chaque commit/push sur la [branche `v2`] déploie en préproduction.

### En production

Chaque nouveau tag déploie en production.

Pour créer un tag :

```bash
# Lors d'ajout de fonctionnalités
npm version minor

# Lors d'un correctif ou ajout très mineur
npm version patch
```

Puis :

```bash
git push --version
```

## Maintenance


### Mettre à jour les codes cultures PAC

```bash
npm install @agencebio/rosetta-cultures@latest
```



[Vue 3]: https://vuejs.org/
[Vue Router]: https://router.vuejs.org/
[Vue Pages]: https://github.com/hannoeru/vite-plugin-pages
[Pinia]: https://pinia.vuejs.org/
[Netlify]: https://netlify.com
[maquette-figma]: https://www.figma.com/file/RpE4QhlPyV0OSSYuk5vPno/Cartobio
