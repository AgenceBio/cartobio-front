# PostGIS

Un serveur Postgres avec l'extension PostGIS est à notre disposition.

Y sont stockées :

- les **couches RPG Bio** anonymysées (tables `anon_rpgbio_20xx`)

## Pour s'y connecter

1. D'abord créer un tunnel SSH :

```sh
ssh -L 65432:localhost:5432 91.134.137.224
```

L'hôte `localhost:65432` est alors disponible comme adresse de connexion,
avec l'identifiant `docker` et un mot de passe communiqué individuellement.

2. Lister les tables du RPG Bio

```
psql -h localhost -p 65432 -U docker \
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public'" gis
```

3. Créer la version "anonymisée" du RPG Bio

Cette étape présuppose que la [couche bio+non-bio a déjà été produite](ign.md).
La version anonymisée en est déduite.

```sh
RPG_YEAR=2020

ogr2ogr --config PG_USE_COPY YES -f PGDump -nln anon_rpgbio_${RPG_YEAR} -nlt GEOMETRY -lco FID=id \
  anon_rpgbio_${RPG_YEAR}.sql cartobio \
  -dialect 'sqlite' -sql "SELECT CODE_CULTU as codecultu, BIO as bio, GEOMETRY as geom FROM cartobio WHERE BIO=1";
```

Ou, par exemple, pour la couche RPG conventionnelle :

```bash
$ ogr2ogr --config PG_USE_COPY YES -f PGDump -nln anon_rpg_${RPG_YEAR} -nlt GEOMETRY -lco FID=id \
  anon_rpg_${RPG_YEAR}.sql /vsizip/2019/cartononbio.zip/cartononbio \
  -dialect 'sqlite' -sql "SELECT CODE_CULTU as codecultu, BIO as bio, GEOMETRY as geom FROM cartononbio WHERE BIO=0";
```

Ou, pour la couche bio, complète :

```
$ ogr2ogr --config PG_USE_COPY YES -f PGDump -nln rpgbio_${RPG_YEAR} -nlt GEOMETRY -lco FID=id \
  rpgbio_${RPG_YEAR}.sql /vsizip/${RPG_YEAR}/cartobio.zip/cartobio \
  -dialect 'sqlite' -sql "SELECT CODE_CULTU as codecultu, BIO as bio, GEOMETRY as geom, ST_centroid(GEOMETRY) as center, gid, SURF_GEO as surfgeo, SURF_ADM as surfadm, PACAGE as pacage, NUM_ILOT as numilot, NUM_PARCEL as numparcel, CODE_CULTU as codecultu, SEMENCE as semence, ENGAGEMENT as engagement, MARAICHAGE as maraichage, AGROFOREST as agroforest FROM cartobio"
```

4. Charger le dump dans PostGis

```bashsh
psql -h localhost -p 65432 -U docker --file=anon_rpgbio_${RPG_YEAR}.sql gis
```

5. (Re)charger le calque dans GeoServer

Se rendre sur l'[interface d'administration du GeoServer][geoserver], puis :

1. Data › Layers › New Layer (from `cartobio:postgis`)
2. `anon_rpgbio_20xx` et soit `Publish again`, soit `Publish`
3. Data ›`Bounding Boxes` : cliquer sur **Compute from data**, puis sur **Compute from native bounds**, puis cliquer sur `Save`
4. Tile Caching › Cocher **application/json;type=geojson**, **application/json;type=topojson** et **application/vnd.mapbox-vector-tile**, puis cliquer sur `Save`

5. Profiter

Le calque est désormais disponible pour être consommé du côté
de l'application `Cartobio-Presentation`.

[geoserver]: http://91.134.137.224:8088/geoserver/web/
