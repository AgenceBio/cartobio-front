import { LegalProjections, RegionBounds } from "@agencebio/cartobio-types"
import intersect from "@turf/intersect"
import bboxPolygon from "@turf/bbox-polygon"
import { reproject } from "reproject"
import proj4 from "proj4"
import { polygonArea } from "geometric"

/**
 * @param {CartoBioFeature[]|CartoBioFeature|CartoBioFeatureCollection} feature ou collection - en WGS84
 * @return {Number} surface en mètres carrés
 */
export function legalProjectionSurface(feature) {
  if (feature.type === 'FeatureCollection') {
    feature = feature.features
  }

  if (Array.isArray(feature)) {
    return feature.reduce((total, f) => total + legalProjectionSurface(f), 0)
  }

  const area = (Object.entries(RegionBounds).find(([, bounds]) => {
    return intersect(feature, bboxPolygon(bounds))
  }) || ['metropole'])[0]

  const projection = LegalProjections[area]
  const coordinates = reproject(feature, proj4.WGS84, projection).geometry.coordinates
  const outer = coordinates[0]
  const inner = coordinates.slice(1)

  // les coordonnées nouvellement projetées sont en mètres carrés,
  // on peut donc utiliser un simple calcul géométrique d'aire
  return inner.reduce((total, hole) => {
    return total - polygonArea(hole)
  }, polygonArea(outer))
}
