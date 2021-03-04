import { featureCollection as Collection, feature as Feature } from "@turf/helpers";
import { polygon as Polygon } from "@turf/helpers";
import { toWgs84 } from "reproject"

const lambert93 = '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'

function parcelleToProperties ({ parcelle, ilot, pacage }) {
  const com = ilot.querySelector('commune')?.textContent.trim()

  const culture_type = Array.from(parcelle.querySelectorAll('code-culture'))
    .map(node => node.textContent)
    .filter(culture => culture && culture !== '___')

  const niveau_conversion = parcelle.querySelector('agri-bio[conduite-bio="true"]') ? 'BIO' : ''

  const id = [
    ilot.getAttribute('numero-ilot'),
    parcelle.querySelector('[numero-parcelle]').getAttribute('numero-parcelle')
  ].join('.')

  return {
    com,
    id,
    pacage,
    culture_type,
    niveau_conversion,
    comment: [
      `Parcelle ${id}.`,
      parcelle.querySelector('agri-bio[conduite-maraichage="true"]') ? 'Conduite en maraîchage.' : '',
      parcelle.querySelector('agroforesterie') ? 'Conduite en agroforesterie.' : '',
    ].filter(d => d).join('\n')
  }
}

function gmlGeometryToGeoJSONGeometry ({ polygon }) {
  const coordinates = polygon.querySelectorAll('LinearRing coordinates')
  const polygons = Array.from(coordinates)
    // we split the space-separated pairs of X,Y
    .map(node => node.textContent.trim().replace(/\n/g, '').split(' '))
    // clean tabular spacing
    .map(coords => coords.filter(d => d))
    // we split the single unit of X,Y into array pairs of [X, Y]
    .map(coords => coords.map(unit => unit.split(',')))
    // turn them into floats
    .map(coords => coords.map(([X, Y]) => [parseFloat(X), parseFloat(Y)]))

  return Polygon(polygons)
}

export function convertXmlDossierToGeoJSON (text) {
  const xml = new DOMParser().parseFromString(text, 'text/xml')

  const pacage = xml.querySelector('producteur').getAttribute('numero-pacage')
  const nodes = Array.from(xml.querySelectorAll('parcelle'))

  const featureCollection = Collection(nodes.map(parcelle => {
    const ilot = parcelle.parentElement.parentElement

    const { geometry } = gmlGeometryToGeoJSONGeometry({ polygon: parcelle.querySelector('Polygon') })
    const properties = parcelleToProperties({ ilot, parcelle, pacage })
    const { id } = properties

    return Feature(geometry, properties, { id })
  }))

  console.log(featureCollection)

  return { pacage, featureCollection: toWgs84(featureCollection, lambert93) }
}
