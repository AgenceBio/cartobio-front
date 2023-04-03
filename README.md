# CartoBio

Application de suivi et de certificaton du parcellaire bio à destination des _opérateurs bio_[^1] et aux _organismes de certification_.

Cette application implémente [la maquette Figma CartoBio](https://www.figma.com/file/tkco0RcI2RqAjn8Vmtd1Og/Cartobio?node-id=493-89045) ainsi que le [Système de Design de l'État](https://www.systeme-de-design.gouv.fr/) avec [Vue 3], [Vue Router], [Vue Pages] et [Pinia].

## Installation

**Pré-requis** : `node@16`

```bash
npm install
```

### Développement local

```bash
npm start
```

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
