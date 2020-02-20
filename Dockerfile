FROM node:12-alpine
COPY ./ /app
WORKDIR /app
RUN npm ci --no-audit
RUN npm run build

FROM nginx
RUN mkdir /app
COPY --from=0 /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
