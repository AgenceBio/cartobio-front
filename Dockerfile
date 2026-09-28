# Image du front : build Vite puis nginx qui sert dist/.
# Les variables VUE_APP_* sont figées au build, comme dans les workflows (--build-arg).
FROM node:24-alpine AS build
WORKDIR /app
# .dsfr.yml est lu par le préinstalleur de @gouvfr/dsfr pendant npm ci
COPY package.json package-lock.json .dsfr.yml ./
RUN npm ci
COPY . .
ARG VUE_APP_API_ENDPOINT
ARG VUE_APP_ENVIRONMENT
ARG VUE_APP_MATOMO_SITE_ID
ARG VUE_APP_PRELOADED_CAMPAGNE_PAC
ARG VUE_APP_DATEIMPORT
ARG VUE_APP_NOTIFICATIONS_API
ARG VUE_APP_SENTRY_DSN
ARG VUE_APP_GIT_COMMIT_SHA
ARG VUE_APP_PRODUCTION
# Base publique du widget de notification ; vide = pas de widget (environnement test)
ARG WIDGET_BASE
RUN env | grep '^VUE_APP_' > .env.local \
 && npm run build:app \
 && if [ -n "$WIDGET_BASE" ]; then \
      npm run build:widget -- --base "$WIDGET_BASE" \
      && npm run build:widget-demo -- --base "$WIDGET_BASE"; \
    fi

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
