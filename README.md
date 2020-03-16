# CartoBio-Presentation

Static website presenting CartoBio Project.

- [Changelog](CHANGELOG.md)
- [Documentation](docs)
- [Quick handbooks](#handbook)

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

### Compute total surfaces

```bash
$ npm run update-stats path/to/RPG-shapefiles/*.zip
```

This script will:

1. Convert Shapefiles/Lambert 93 into GeoJSON/WGS84 (~2h)
2. Fetch local government boundaries from [`gregoiredavid/france-geojson@v2.1.1` repo][france-geojson] (~1min)
3. Compute parcel surfaces within their county boundaries (~18min)

The `public/stats.json` file will be update accordingly.

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
