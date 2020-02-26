# Exploration des fichiers du Registre Parcellaire Graphique (RPG)

Ces fichiers sont fournis par l'Institut Géographique National (IGN).

Une partie de la documentation officielle se trouve sur
[l'espace documentaire IGN Pro](https://geoservices.ign.fr/documentation/diffusion/documentation-offre.html#rpg).


## Conversion en GeoJSON

```bash
$ ogr2ogr -f GeoJSON  \
          -s_srs EPSG:2154 \
          -t_srs EPSG:4326 \
          -limit 10 \
          /vsistdout/ \
          /vsizip/SURFACES-2019-PARCELLES-GRAPHIQUES-CONSTATEES_001_20190721.zip
```

1. Conversion vers le format GeoJSON (depuis Shapefile/SHP)
1. La projection d'origine est le Lambert 93 (RGF93), aka [EPSG:2154](https://epsg.io/2154)
1. La projection de destination est le WGS 84 (World Geodetic System 1984, used in GPS), aka [EPSG:4326](EPSG:4326)
1. On limite à 10 features (enregistrements) pour explorer plus facilement
1. Le résultat est envoyé vers la _sortie standard_ (`stdout`)
1. Les données sont lues depuis le contenu du fichier zip (via `vsizip`), cf. [GDAL Virtual File System](https://gdal.org/user/virtual_file_systems.html)

## Propriétés d'une _feature_

```json
{
  "type": "Feature",
  "properties": {
    "PACAGE": "001009149",
    "NUM_ILOT": 21,
    "NUM_PARCEL": 1,
    "CODE_CULTU": "MIS",
    "SURF_ADM": 0.52,
    "PRECISION": null,
    "RECONVER_P": 0,
    "RETOURNMT_": 0,
    "SEMENCE": 0,
    "DEST_ICHN": null,
    "CULTURE_D1": null,
    "CULTURE_D2": null,
    "BIO": 0,
    "ENGAGEMENT": null,
    "MARAICHAGE": 0,
    "AGROFOREST": null,
    "FORCE_MAJE": 0
  },
  "geometry": { ... }
}
```

## Calculer des statistiques en ligne de commande

```bash
$ jq --unbuffered --ascii-output --compact \
  '{ dept: input_filename, bio: [.features[] | select(.properties.BIO == 1 and .properties.SURF_ADM > 0)] | { count: .|length, surface: [ .[].properties.SURF_ADM ] | add }, nonBio: [.features[] | select(.properties.BIO == 0  and .properties.SURF_ADM > 0)] | { count: .|length, surface: [ .[].properties.SURF_ADM ] | add }}' \
  SURFACES-*.geojson > stats.ndjson
```

```bash
$ jq --slurp \
  --arg year 2019 \
  '{ "stats": { year: $year, aggregates: . } }' \
  stats.ndjson > stats.json
```

## Superficies

Elles sont exprimées en hectares.

## Codes cultures

Il y a 3 types de cultures dans le référentiel des codes cultures :

* [Cultures principales](https://geoservices.ign.fr/ressources_documentaires/Espace_documentaire/BASES_VECTORIELLES/RPG/Codification_cultures_principales.csv)<br>
  Culture principale de la parcelle.
* [Cultures dérobées](https://geoservices.ign.fr/ressources_documentaires/Espace_documentaire/BASES_VECTORIELLES/RPG/Codification_cultures_derobees.csv)<br>
  Culture intercalée entre 2 moissons de culture principale. Il peut y en avoir aucune, une (`CULTURE_D1`) ou deux (`CULTURE_D2`).
* Culture type variété (associé à un code "variété culture")
