---
title: Récupérer les données du parcellaire bio via l'API CartoBio
---

L'**API CartoBio** est un moyen d'intégrer les données affichées
sur CartoBio, dans vos propres applications et outils métiers.

**Intention** : ce document va vous guider dans l'accès à l'API,
sur l'accès aux données à travers des exemples techniques.

**À qui s'adresse l'API** ?<br>
Nous destinons CartoBio et son API aux **Organismes certificateurs**.<br>
Nous aimerions _ensuite_ la proposer aux **Collectivités locales**.

# Utilisation de l'API CartoBio

## Demander un jeton d'accès

Si vous êtes une personne qui a accès au
[portail de notifications de l'Agence Bio](http://notifications.agencebio.org/),
ou que vous êtes une collectivité concernée
par le développement du bio comme levier d'action de santé publique, [**demandez-nous un jeton d'accès**][ask-token], c'est _gratuit_[^1].

Le **jeton d'accès ouvre l'accès aux données**.

Voici un jeton de test ; il rend fonctionnels les exemples ci-après:

```
eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJvY0lkIjowLCJ0ZXN0Ijp0cnVlfQ.NL050Bt_jMnQ6WLcqIbmwGJkaDvZ0PIAZdCKTNF_-sSTiTw5cijPGm6TwUSCWEyQUMFvI1_La19TDPXsaemDow
```

## Authentification des requêtes

Illustration du passage du jeton dans une requête vers l'API :

```bash
$ CARTOBIO_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvY0lkIjowLCJ0ZXN0Ijp0cnVlfQ.B7elZEHGsKYwWxDNWalnwU7L1ZkdAjQVeAo0Hi4VsB4"

$ curl -H "Authorization: Bearer ${CARTOBIO_TOKEN}" https://cartobio.org/api/v1/test
```

**Exemple de réponse** :

```json
{"test":"OK"}
```

Et maintenant, en cas d'identification incorrecte :

```bash
$ curl https://cartobio.org/api/v1/test
```

**Exemple de réponse** :

```json
{"error":"We could not verify the provided token."}
```

## Formats de réponse

- [GeoJSON](https://geojson.org/)
- (Prochainement) [GeoPackage](http://www.geopackage.org/guidance/getting-started.html)
- (Prochainement) [GeoBuf](https://github.com/mapbox/geobuf#geobuf)

# Référence de l'API (`v1` • beta)

Toutes les requêtes nécessitent un [jeton d'accès](#demander-un-jeton-d’accès), passé dans l'entête HTTP `Authorize`.

## Tester la connectivité

**Chemin** : `/api/v1/test`

**Exemple de requête** :

```bash
$ curl https://cartobio.org/api/v1/test
```

**Exemple de réponse** :

```json
{"test":"OK"}
```

## Récupérer le parcellaire bio de mon organisme certificateur

**Chemin** : `/api/v1/parcels`

**Exemple de requête** :

```bash
$ curl https://cartobio.org/api/v1/parcels
```

**Exemple de réponse** :

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "pacage": "026000003",
        "codecultu": "BTH",
        "bio": 1,
        "numilot": 1,
        "numparcel": 1,
        "numerobio": 11
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
               5.10632514953613,
               44.7276498788965
            ],
            [
               5.11610984802246,
               44.7327109365672
            ],
            [
               5.11877059936523,
               44.7366131364681
            ],
            [
               5.12057304382324,
               44.7398444464433
            ],
            [
               5.11739730834961,
               44.7508173586635
            ],
            [
               5.11516571044922,
               44.749781117133
            ],
            [
               5.11336326599121,
               44.746489403153
            ],
            [
               5.11173248291016,
               44.7452702022555
            ],
            [
               5.11035919189453,
               44.7426488332508
            ],
            [
               5.108642578125,
               44.7378325199372
            ],
            [
               5.1075267791748,
               44.7349059564114
            ],
            [
               5.10503768920898,
               44.7333816459144
            ],
            [
               5.10443687438965,
               44.73130851916
            ],
            [
               5.10375022888184,
               44.7300280213927
            ],
            [
               5.10349273681641,
               44.7292353180915
            ],
            [
               5.10272026062012,
               44.7278937954473
            ],
            [
               5.10632514953613,
               44.7276498788965
            ]
          ]
        ]
      }
    },

    ...
  ]
}
```

## Récupérer le parcellaire d'un·e opérateur·ice

**Chemin** : `/api/v1/parcels/operator/:numero-bio`

**Exemple de requête** :

```bash
$ curl https://cartobio.org/api/v1/parcels/operator/11
```

**Exemple de réponse** :

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "pacage": "026000003",
        "codecultu": "BTH",
        "bio": 1,
        "numilot": 1,
        "numparcel": 1,
        "numerobio": 11
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
               5.10632514953613,
               44.7276498788965
            ],
            [
               5.11610984802246,
               44.7327109365672
            ],
            [
               5.11877059936523,
               44.7366131364681
            ],
            [
               5.12057304382324,
               44.7398444464433
            ],
            [
               5.11739730834961,
               44.7508173586635
            ],
            [
               5.11516571044922,
               44.749781117133
            ],
            [
               5.11336326599121,
               44.746489403153
            ],
            [
               5.11173248291016,
               44.7452702022555
            ],
            [
               5.11035919189453,
               44.7426488332508
            ],
            [
               5.108642578125,
               44.7378325199372
            ],
            [
               5.1075267791748,
               44.7349059564114
            ],
            [
               5.10503768920898,
               44.7333816459144
            ],
            [
               5.10443687438965,
               44.73130851916
            ],
            [
               5.10375022888184,
               44.7300280213927
            ],
            [
               5.10349273681641,
               44.7292353180915
            ],
            [
               5.10272026062012,
               44.7278937954473
            ],
            [
               5.10632514953613,
               44.7276498788965
            ]
          ]
        ]
      }
    },

    ...
  ]
}
```

## Récupérer le parcellaire bio anonymisé

🚧 Prochainement. [Ces données vous intéressent ?][ask-wip-feature]

# Une question ? Un problème ? Besoin d'aide ?

L'équipe technique de CartoBio fera de son mieux pour y répondre
dans un délai raisonnable.

[📮 Nous contacter par e-mail][contact].



[contact]: mailto:cartobio@beta.gouv.fr?subject=Question%20%C3%A0%20propos%20de%20l'API%20CartoBio
[ask-token]: mailto:cartobio@beta.gouv.fr?subject=Demande%20%de%jeton%20%pour%20l'API%20CartoBio,%20Merci%20!
[ask-wip-feature]: mailto:cartobio@beta.gouv.fr?subject=API%20CartoBio%20%3A%20%C3%A0%20propos%20d'une%20future%20fonctionnalit%C3%A9

[^1]: Nous sommes un service public. Nous ne collectons pas de données personnelles. Nous ne revendons pas de données.<br>
      Les seules données générées sont liées à l'activité de l'API, afin d'en améliorer sa robustesse.
