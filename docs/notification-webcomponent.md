---
title: WebComponent pour le Portail de Notification de l'Agence Bio
---

## Installation

```html
<notification-cartobio auth-token="..."></notification-cartobio>

<script type="module" src="https://cartobio-preprod.agencebio.org/notification-webcomponent/notification-cartobio.es.js"></script>
```

## Propriétés du composant

### `auth-token`

Le jeton émis par le Portail de Notification a la forme suivante, une fois décodé :

```javascript
{
  "userId": Integer,
  "email": String,
  "operateurId": Integer,
  "notificationId": Integer,
  "numeroPacage": String?,
  "organismeCertificateurId": Integer,
  "organismeCertificateurNom": String
}
```

## Configuration serveur

Au moins deux applications doivent être configurées pour que le composant soit effectif.

### @agencebio/cartobio-api

La variable d'environnement `NOTIFICATIONS_AB_PUBLIC_KEY` contient une clé publique, encodée sur une ligne.\
Les retours à la ligne sont écrits avec le caractère `\n`.

La variable d'environnement `NOTIFICATIONS_AB_SERVICE_TOKEN` sert à accéder à l'API Notification
pour obtenir des informations liées à l'utilisateur concerné par le jeton.

## Événements

### `import:ready`

### `import:started`

### `import:complete`

### `import:errored`
