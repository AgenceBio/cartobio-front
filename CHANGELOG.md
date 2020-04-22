---
title: Journal d'évolution
---

## Semaine du 13 au 17 avril

- <v-chip small color="brown lighten-3 brown--text text--darken-4">API</v-chip>
  Mise à disposition de l'adresse `/api/v1/parcels/operator/:numero-bio`, pour
  intégrer le parcellaire bio d'un _opérateur bio_ à une application métier en tant
  qu'<abbr title="Organismes de Certification">OC</abbr> ([lire la documentation](#/api)).

## Semaine du 6 au 10 avril

- <v-chip small color="purple lighten-3 purple--text text--darken-4">Design</v-chip>
  Clarification de la vue "Exploitations", où il est rendu explicite
  quelles parcelles peuvent être visualisées.
- <v-chip small color="brown lighten-3 brown--text text--darken-4">API</v-chip>
  Mise à disposition de l'adresse `/api/v1/parcels`, pour
  intégrer le parcellaire bio à une application métier en tant
  qu'<abbr title="Organismes de Certification">OC</abbr> ([lire la documentation](#/api)).

## Semaine du 30 mars au 3 avril

- <v-chip small color="purple lighten-3 purple--text text--darken-4">Design</v-chip>
  Clarification des interactions possibles avec le panneau "Calques".

## Semaine du 23 au 27 mars

- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Le survol d'une parcelle indique sa surface totale,
  le libellé de culture (au lieu du code culture à 3 lettres),
  ainsi que le groupe de culture, s'il a lieu.
- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Le survol d'une parcelle cultivée indique sa **référence cadastrale**.
- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Intégration du [registre cadastral](https://cadastre.data.gouv.fr/).
- <v-chip small color="purple lighten-3 purple--text text--darken-4">Design</v-chip>
  Nous avons ajouté le **nombre de demandes de données** reçues
  sur la [page Statistiques](#/stats).
- <v-chip small color="light-green lighten-3 light-green--text text--darken-4">Perfs</v-chip>
  Amélioration des peformances d'affichage de la carte — elle devrait
  être bien plus fluide et rapide à charger.
- <v-chip small color="light-green lighten-3 light-green--text text--darken-4">Perfs</v-chip>
  Réduction drastique de la quantité de données à charger pour
  commencer à naviguer dans l'application.
- <v-chip small color="light-green lighten-3 light-green--text text--darken-4">Perfs</v-chip>
  Refonte de la page d'accueil, dans l'intention de la rendre
  plus légère et explicite sur nos objectifs et missions.

## Semaine du 16 au 20 mars

- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Le survol d'une parcelle affiche son historique de cultures.
- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Le numéro d'ilot et de parcelle s'affiche lorsque — en tant qu'Organisme Certificateur —
  vous accédez au parcellaire d'un·e de vos opérateur·ices.
- <v-chip small color="purple lighten-3 purple--text text--darken-4">Design</v-chip>
  Refonte de l'invite de connexion : elle s'ouvre si nécessaire,
  se navigue au clavier, et vous indique comment retrouver votre mot
  de passe du portail de notifications de l'Agence Bio.
- <v-chip small color="purple lighten-3 purple--text text--darken-4">Design</v-chip>
  Ajout de ce journal d'évolution de CartoBio, pour un suivi au jour
  le jour de ses évolutions.
- <v-chip small color="light-green lighten-3 light-green--text text--darken-4">Perfs</v-chip>
  Optimisation de l'application, qui ont pour effet de réduire la
  quantité de données nécessaires pour accéder à l'application.
- <v-chip small color="yellow lighten-3 deep-orange--text text--darken-4">Sécurité</v-chip>
  L'accès au service `cartobio.org` est sécurisée avec le protocole `https`.
  Mots de passe et informations personnelles ne peuvent plus être interceptées
  sur le réseau que vous utilisez pour accéder à Internet.

## Semaine du 9 au 13 mars

- <v-chip small color="yellow lighten-3 deep-orange--text text--darken-4">Sécurité</v-chip>
  L'application mémorise vos informations de connexion pour une durée de 24 heures.
  Elle vous reconnaîtra automatiquement la prochaine fois que vous lui rendez visite,
  si vos informations de connexion n'ont pas expiré entre temps.
