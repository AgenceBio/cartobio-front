---
title: Récupérer les données du parcellaire bio via l'API CartoBio
---

L'**API CartoBio** est un moyen d'intégrer les données affichées
sur CartoBio, dans vos propres applications et outils métiers.

**Intention** : ce document va vous guider dans l'accès à l'API,
sur l'accès aux données à travers des exemples techniques.

**À qui s'adresse l'API** ?<br>
Nous destinons CartoBio et son API aux **Organismes certificateurs**,
et _prochainement_, aux **Collectivités locales** ainsi qu'aux **Opérateurs**.

# Utilisation de l'API CartoBio

## Demander un jeton d'accès

Si vous êtes une personne qui a accès au
[portail de notifications de l'Agence Bio](http://notifications.agencebio.org/),
ou que vous êtes une collectivité concernée
par le développement du bio comme levier d'action de santé publique, [demandez-nous un jeton d'accès][ask-token], c'est _gratuit_[^1].

Le **jeton d'accès ouvre l'accès aux données**.

Un jeton d'accès ressemble à ceci :

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
        "pacage": "026000001",
        "codecultu": "PPH",
        "bio": 1,
        "numilot": 1,
        "numparcel": 1,
        "numerobio": 7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              5.108556747436523,
              44.74149051605874
            ],
            [
              5.097227096557617,
              44.752097396080465
            ],
            [
              5.094738006591797,
              44.739661546926556
            ],
            [
              5.102462768554687,
              44.73069876185414
            ],
            [
              5.108556747436523,
              44.74149051605874
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
