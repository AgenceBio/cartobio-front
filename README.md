# CartoBio-Presentation
Static website presenting CartoBio Project

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

### Build Docker image

```bash
$ docker build -t agencebio/cartobio-presentation:$(git describe --abbrev=0 | cut -c2-20) .
$ docker push agencebio/cartobio-presentation:$(git describe --abbrev=0 | cut -c2-20)
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Docker
The website is deployed using Docker.
You can just download the docker image on the [Docker Hub](https://cloud.docker.com/u/agencebio/repository/docker/agencebio/cartobio-presentation "agencebio/cartobio-presentation") and run it.
