---
title: Journal d'évolution
---

## Semaine du 10 au 14 août

- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Affichage des exploitations bio hors-PAC dans les résultats de recherche.
- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Lorsque le numéro PACAGE d'une exploitation est inconnu, nous proposons de le renseigner, ou de déclarer l'exploitation comme étant hors-PAC.
- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Quand nous ne connaissons pas les parcelles d'une exploitation, nous vous proposons de nous les indiquer manuellement — via des indications textuelles, ou téléversement de fichiers.<br>
  Nous améliorerons cet écran en fonction de vos usages, et de vos retours.
- <v-chip small color="deep-orange lighten-3 grey--text text--darken-4">API</v-chip>
  Une [documentation interactive (Swagger)](https://api.gouv.fr/documentation/api_cartobio_territoires) complète notre [guide d'utilisation](#/api).
- <v-chip small color="deep-orange lighten-3 grey--text text--darken-4">API</v-chip>
  Nous faisons désormais partie du [catalogue des API du service public](https://api.gouv.fr/les-api/api_cartobio_territoires), en vue de créer un guichet simplifié d'accès aux données.

## Semaine du 3 au 7 août

- <v-chip small color="purple lighten-3 purple--text text--darken-4">Design</v-chip>
  Clarification de la page d'accueil, et création de deux nouvelles pages
  à destination des [organismes de certification](/#/features/organismes-certification-bio), et de [personnes/entités morales actives sur leur territoire](/#/features/territoires).

## Semaine du 22 au 26 juin

- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Nous avons ajouté la sélection d'une exploitation peut se faire directement depuis la carte, en plus du moteur de recherche.

## Semaine du 1er au 5 juin

- <v-chip small color="purple lighten-3 blue--text text--darken-4">Design</v-chip>
  Clarification de l'historique d'une parcelle, avec l'intention de la rendre
  plus lisible et explicite.

## Semaine du 18 au 22 mai

- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Ajout d'indicateurs de navigation dans la liste des parcelles d'une exploitation. On peut se diriger vers un ilot, une parcelle ou retourner à une vue d'ensemble de l'exploitation.

## Semaine du 11 au 15 mai

- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Affichage du nombre d'exploitations par département.

## Semaine du 27 au 30 avril

- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Prévisualisation des données téléchargeables.
- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Refonte de l'affichage de la liste des parcelles : effet visuel au survol,
  informations supplémentaires, bouton "télécharger" mis en avant.
- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Intégration du parcellaire conventionnel, en préparation à de nouvelles
  fonctionnalités d'affichage.
- <v-chip small color="blue lighten-3 blue--text text--darken-4">Carto</v-chip>
  Refonte du composant de recherche : elle se fait par ville, par code postal,
  et par nom d'exploitation.

## Semaine du 13 au 17 avril

- <v-chip small color="deep-orange lighten-3 grey--text text--darken-4">API</v-chip>
  Mise à disposition de l'adresse `/api/v1/parcels/operator/:numero-bio`, pour
  intégrer le parcellaire bio d'un _opérateur bio_ à une application métier en tant
  qu'<abbr title="Organismes de Certification">OC</abbr> ([lire la documentation](#/api)).

## Semaine du 6 au 10 avril

- <v-chip small color="purple lighten-3 purple--text text--darken-4">Design</v-chip>
  Clarification de la vue "Exploitations", où il est rendu explicite
  quelles parcelles peuvent être visualisées.
- <v-chip small color="deep-orange lighten-3 grey--text text--darken-4">API</v-chip>
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
