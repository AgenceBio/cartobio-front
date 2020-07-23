---
title: Données géographiques des parcelles bio pour les territoires, collectivités, et organismes à vocation environnementale
---

L'**API Territoires de CartoBio** est un moyen de récupérer des données de
l'agriculture biologique au niveau d'une commune, d'une EPCI ou d'un contour géographique de votre choix.

**Intention** : ce document va vous guider dans l'accès à l'API Territoires de CartoBio,
sur l'accès aux données à travers des exemples techniques.

**À qui s'adresse l'API Territoires** ?<br>
Nous destinons l'API Territoires de CartoBio aux **acteurs des territoires**.<br>

# Utilisation de l'API Territoires de CartoBio

## Formats de réponse

- [GeoJSON](https://geojson.org/)
- [ESRI Shapefile](https://fr.wikipedia.org/wiki/Shapefile)

**Exemple de requête pour récupérer du GeoJSON :

```bash
$ curl https://cartobio.org/api/v1/territoires/test
$ curl -H 'Accept: application/json' https://cartobio.org/api/v1/territoires/test
```

**Exemple de requête pour récupérer du ESRI Shapefile :

```bash
$ curl -H 'Accept: application/vnd.shp+octet-stream' https://cartobio.org/api/v1/territoires/test
```

# Référence de l'API (`v1` • beta)

## Récupérer le parcellaire bio anonyme pour mon EPCI

**Chemin** : `/api/v1/territoires/epci/:epciId`

**Exemple de requête** :

```bash
$ curl https://cartobio.org/api/v1/territoires/epci/200067106
```

<details>
  <summary>Exemple de réponse</summary>
  <pre class="language-json"><code>{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "codeculture": "BTH",
        "labelculture": "Blé tendre d'hiver"
        "groupeculture": "Blé tendre"
        "bio": 1,
        "millesime": 2019
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
}</code></pre></details>

## Récupérer le parcellaire bio anonyme pour ma commune

**Chemin** : `/api/v1/territoires/insee/:codeInsee`

**Exemple de requête** :

```bash
$ curl https://cartobio.org/api/v1/territoires/epci/64102
```

<details>
  <summary>Exemple de réponse</summary>
  <pre class="language-json"><code>{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "codeculture": "BTH",
        "labelculture": "Blé tendre d'hiver"
        "groupeculture": "Blé tendre"
        "bio": 1,
        "millesime": 2019
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
}</code></pre></details>

## Récupérer le parcellaire bio anonyme pour un contour géographique

**Chemin** : `/api/v1/territoires`

**Paramètres optionnels** :

- `epsg` : explicite la projection géographique des données envoyées au [format **EPSG**](https://epsg.io)
- `crs` : explicite la projection géographique des données envoyées au format **CRS**.

**Exemple de requête** :

```bash
$ curl -X PUT --upload-file contour.shp https://cartobio.org/api/v1/territoires?espg=4171
$ curl -X PUT --upload-file contour.shp https://cartobio.org/api/v1/territoires?crs=RFG93
```

<details>
  <summary>Exemple de réponse</summary>
  <pre class="language-json"><code>{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "codeculture": "BTH",
        "labelculture": "Blé tendre d'hiver"
        "groupeculture": "Blé tendre"
        "bio": 1,
        "millesime": 2019
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
}</code></pre></details>

# Une question ? Un problème ? Besoin d'aide ?

L'équipe technique de CartoBio fera de son mieux pour y répondre
dans un délai raisonnable.

[📮 Nous contacter par e-mail][contact].



[contact]: mailto:cartobio@beta.gouv.fr?subject=Question%20%C3%A0%20propos%20de%20l'API%20CartoBio
[ask-token]: mailto:cartobio@beta.gouv.fr?subject=Demande%20%de%jeton%20%pour%20l'API%20CartoBio,%20Merci%20!
[ask-wip-feature]: mailto:cartobio@beta.gouv.fr?subject=API%20CartoBio%20%3A%20%C3%A0%20propos%20d'une%20future%20fonctionnalit%C3%A9

[^1]: Nous sommes un service public. Nous ne collectons pas de données personnelles. Nous ne revendons pas de données.<br>
      Les seules données générées sont liées à l'activité de l'API, afin d'en améliorer sa robustesse.
