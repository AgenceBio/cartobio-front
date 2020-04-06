const { parentPort, workerData } = require('worker_threads');
const gdal = require('gdal-next')

// const {sourceFile, filteringFeatures} = workerData
//

function extractFeatures({sourceFile, filteringFeature}) {
  const features = []
  const ds = gdal.open(sourceFile, 'r')
  const layer = ds.layers.get(0)

  layer.features.forEach(feature => {
    const geometry = feature.getGeometry()

    const filterGeometry = gdal.Geometry.fromGeoJson(filteringFeature)
    const intersects = filterGeometry.intersects(geometry) || filterGeometry.contains(geometry)

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

module.exports = function ({sourceFile, filteringFeature}, done) {
  try {
    done(null, extractFeatures({sourceFile, filteringFeature}))
  }
  catch (error) {
    done(error)
  }
}


// parentPort.close()
