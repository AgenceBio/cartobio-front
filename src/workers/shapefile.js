const { parentPort, workerData } = require('worker_threads');
const gdal = require('gdal-next')

// const {sourceFile, filteringFeatures} = workerData
//

function extractFeatures({sourceFile, filteringFeatures}) {
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

  layer.features.forEach(feature => {
    const geometry = feature.getGeometry()

    const intersects = filterGeometry.intersects(geometry)

    if (intersects) {
      const {BIO, CODE_CULTU} = feature.fields.toObject()
      features.push({
        type: 'Feature',
        properties: {BIO, CODE_CULTU},
        geometry: feature.getGeometry().toObject()
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

module.exports = function ({sourceFile, filteringFeatures}, done) {
  try {
    done(null, extractFeatures({sourceFile, filteringFeatures}))
  }
  catch (error) {
    done(error)
  }
}


// parentPort.close()
