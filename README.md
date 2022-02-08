# CartoBio

Application de suivi et de certificaton du parcellaire bio à destination des _opérateurs bio_[^1] et aux _organismes de certification_.

Cette application implémente [la maquette Figma de l'interface opérateurs](https://www.figma.com/file/sVYES3AEoLk90DalmhxDAX).

## Installation

**Pré-requis** : `node@16`

```
npm install
```

### Développement local

```
npm start
```

### Prépare au déploiement
```
npm run build
```

### Exécution des tests
```
npm test
```

## Maintenance

### Mettre à jour les codes cultures PAC

```sh
cat docs/pac/REF_CULTURES_GROUPES_CULTURES_2020.csv \
  | csvjson --no-inference --indent 2 > src/referentiels/codes-pac.json
```
