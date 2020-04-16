# CartoBio-Presentation

Static website presenting CartoBio Project.

- [Changelog](CHANGELOG.md)
- [Quick handbooks](#handbook)
- [**Documentation**](docs)
  - [Récupérer les données du parcellaire bio via l'API CartoBio](docs/api.md)
  - [Utilisation de l'espace collaboratif IGN](docs/ign.md)
  - [Exploration des fichiers du Registre Parcellaire Graphique (RPG)](docs/rpg.md)
  - [Mettre à jour le parcellaire bio anonyme sur PostGIS et GeoServer](docs/postgis.md)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development

```
npm start
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm test
```


## Handbook

### Export a GeoPackage/GeoJSON, filtered by one or many Shapefiles

```bash
$ npm run export -- --from '../RPG/2019/d0{11,09,66}/cartobio.shp' --in-lambert-93 '../reseau11/**/*.shp'

✔ Parsed 9 features in 5 datasets.
  ✔ d009/cartobio.shp
  ✔ d009/cartononbio.shp
  ⠹ d011/cartobio.shp
  ⠹ d011/cartononbio.shp
  ✔ d066/cartobio.shp
  ⠹ d066/cartononbio.shp
```

### Export a GeoPackage/GeoJSON, encompassing EPCI boundaries

```bash
$ npm run export -- --from '../RPG/2019/d064/cartobio.shp' --epci 200067106

✔ Parsed 158 features in 1 datasets.
  ✔ d064/cartobio.shp
  ⠹ d064/cartononbio.shp
```

### Compute total surfaces

```bash
$ npm run update-stats path/to/RPG-shapefiles/*.zip

```

This script will:

1. Convert Shapefiles/Lambert 93 into GeoJSON/WGS84 (~2h)
2. Fetch local government boundaries from [`gregoiredavid/france-geojson@v2.1.1` repo][france-geojson] (~1min)
3. Compute parcel surfaces within their county boundaries (~18min)

The `public/stats.json` file will be update accordingly.

### Rebuild Partners Logos SVG Sprite


```bash
$ npx svg-spreact-cli --no-optimize src/assets/logos > src/assets/logos-sprite.svg
```

### Update "Codes Cultures" data file

Once you get a new `.xlsx` file with the update crop codes,
run the folllowing command:

```sh
$ in2csv --no-inference /path/to/codes_culture20xx.xlsx \
  | csvcut --columns '1,2' --delete-empty-rows \
  | csvjson --indent 2 > src/modules/codes-cultures/data.json
```

Or, with a more complete CSV file:

```sh
$ csvjson --encoding latin1 --delimiter ';' --indent 2  --quoting 1 --no-inference \
  src/modules/codes-cultures/Codification_cultures_principales.csv \
  > src/modules/codes-cultures/data.json
```

**Note**: the pipeline relies on [csvkit](https://csvkit.readthedocs.io).


### Build Docker image

⚠️ Do you have an `.env.production.local` file? If not, the built app will be unstable.

```bash
$ docker build -t agencebio/cartobio-presentation .
$ docker run -ti --rm -p 8080:80 agencebio/cartobio-presentation
```

Now open [`localhost:8080`](https://localhost:8080) to see the app running.

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Docker
The website is deployed using Docker.
You can just download the docker image on the [Docker Hub](https://cloud.docker.com/u/agencebio/repository/docker/agencebio/cartobio-presentation "agencebio/cartobio-presentation") and run it.

[france-geojson]: https://github.com/gregoiredavid/france-geojson/raw/v2.1.1/departements-avec-outre-mer.geojson
