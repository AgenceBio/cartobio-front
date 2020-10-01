// const { parentPort, workerData, millesime } = require('worker_threads');
// const {sourceFile, filteringFeatures} = workerData
const gdal = require('gdal-next')
const { fromCode } = require('../modules/codes-cultures/pac.js')
const { geometry: area } = require('@mapbox/geojson-area')

const IN_HECTARES = 10000
const wgs84 = gdal.SpatialReference.fromProj4('+init=epsg:4326')

function extractFeatures({sourceFile, filteringFeatures, millesime: MILLESIME}) {
  const filteringFeaturesPolygon = new gdal.MultiPolygon()

  filteringFeatures.forEach(feature => {
    const geometry = gdal.Geometry.fromGeoJson(feature);

    // we loop over MULTIPOLYGON children (POLYGONs), or a POLYGON directly
    // eslint-disable-next-line no-unexpected-multiline
    (geometry.name === 'MULTIPOLYGON' ? geometry.children : [geometry]).forEach(g => {
      filteringFeaturesPolygon.children.add(g);
    })
  });

  const filterGeometry = filteringFeaturesPolygon.unionCascaded()

  const features = []
  const ds = gdal.open(sourceFile, 'r')
  const layer = ds.layers.get(0)

  const getWGS84Geometry = (function getWGS84GeometryFactory(layer) {
    return layer.srs.isSame(wgs84)
      ? (feature) => feature.getGeometry().toObject()
      : (feature) => {
        const geometry = feature.getGeometry().clone()
        geometry.transformTo(wgs84)
        return geometry.toObject()
      }
  })(layer)

  layer.features.forEach(feature => {
    const geometry = feature.getGeometry()

    const intersects = filterGeometry.intersects(geometry)

    if (intersects) {
      const {BIO, bio, CODE_CULTU, codecultu} = feature.fields.toObject()
      const {label: LBL_CULTU, groupLabel: GRP_CULTU} = fromCode(CODE_CULTU ?? codecultu)

      const geometry = getWGS84Geometry(feature)
      const SURFACE_HA = parseFloat(area(geometry) / IN_HECTARES).toFixed(2)

      features.push({
        type: 'Feature',
        geometry,
        properties: {
          BIO: parseInt(BIO ?? bio, 10),
          CODE_CULTU: CODE_CULTU ?? codecultu,
          LBL_CULTU,
          GRP_CULTU,
          SURFACE_HA,
          MILLESIME
        }
      })
      // parentPort.postMessage({
      //   type: 'Feature',
      //   properties: {
      //     BIO: feature.fields.get('BIO')
      //   },
      //   geometry: feature.getGeometry().toObject()
      // })
    }
  })

  return features
}

module.exports = function ({sourceFile, filteringFeatures, millesime}, done) {
  try {
    done(null, extractFeatures({sourceFile, filteringFeatures, millesime}))
  }
  catch (error) {
    done(error)
  }
}


// parentPort.close()
