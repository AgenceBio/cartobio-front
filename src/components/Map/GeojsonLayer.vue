<!-- eslint-disable vue/valid-template-root -->
<template></template>

<script>
export default {
  props: {
    // Either style or (data and (fill or line)) must be provided
    style: {
      type: Object
    },
    data: {
      type: Object,
    },
    name: {
      type: String,
      required: true,
    },
    before: {
      type: String,
      required: false,
      default: 'waterway-name'
    },
    fill: {
      type: Object,
      default: () => ({
        "fill-color": [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          "#000091",
          ['boolean', ['feature-state', 'hover'], false],
          "#dcdcfc",
          ['boolean', ['==', ['get', "TYPE"], "BOR"], false],
          //--blue-france-main-525
          "#6a6af4",
          //--blue-france-sun-113-625
          "#eee"
        ],
        "fill-opacity": 0.6,
      })
    },
    line: {
      type: Object,
      default: () => ({
        "line-width": 1,
        "line-color": "#000091",
        "line-opacity": 0.9,
      })
    },
  },
  inject: ['map'],
  mounted() {
    this.map.once('data', () => {
      const nextLayer = this.map.getLayersOrder().find((id) => this.before === id.split('/')[0])

      // always create the data layer even if data is empty at first,
      // otherwise the watch() fails (if empty at first, it cannot be updated)
      if (!this.map.getSource(`${this.name}/data`)) {
        this.map
        .addSource(`${this.name}/data`, {
          type: 'geojson',
          data: this.data ?? { type: 'FeatureCollection', features: [] }
        })
      }

      // If we use a data and fill / line props, we create the geometry layers
      if (this.data && this.fill && !this.map.getLayer(`${this.name}/geometry`)) {
        this.map.addLayer({
          id: `${this.name}/geometry`,
          source: `${this.name}/data`,
          type: 'fill',
          paint: this.fill
        }, nextLayer)
      }

      if (this.data && this.line && !this.map.getLayer(`${this.name}/geometry-outline`)) {
        this.map.addLayer({
          id: `${this.name}/geometry-outline`,
          source: `${this.name}/data`,
          type: 'line',
          paint: this.line
        }, nextLayer)
      }

      // If we use a style prop, we create the layers
      if (!this.style) return

      if (this.style.sprite) {
        const hasSprite = this.map.getSprite(this.name)

        if (!hasSprite) {
          this.map.addSprite(this.name, this.style.sprite)
        }
      }

      if (this.style.glyphs) {
        this.map.setGlyphs(this.style.glyphs)
      }

      Object.entries(this.style.sources || {}).map(([key, value]) => {
        if (this.map.style && this.map.getSource(`${this.name}/${key}`)) return
        this.map.addSource(`${this.name}/${key}`, value)
      })

      this.style.layers?.map(layer => {
        if (this.map.getLayer(`${this.name}/${layer.id}`)) return

        this.map.addLayer({
          ...layer,
          id: `${this.name}/${layer.id}`,
          source: `${this.name}/${layer.source}`
        }, nextLayer)
      })
    })
  },
  unmounted() {
    const layerRE = new RegExp(`^${this.name}/`)

    if (!this.map.isStyleLoaded()) {
      return
    }

    this.map.getLayersOrder()
      .filter(name => layerRE.test(name))
      .filter(name => this.map.getLayer(name))
      .forEach(name => this.map.removeLayer(name))

      // a source can be removed only after its last layer has been demoted
      this.map.removeSource(`${this.name}/data`)

    if (!this.style) return

    // est-ce encore nécessaire avec le filtre ci-dessus ?
    this.style.layers
      .filter(layer => this.map.getLayer(layer.id))
      .map(layer => this.map.removeLayer(`${this.name}/${layer.id}`))

    Object.keys(this.style.sources || {}).map(key => {
      if (!this.map.getSource(`${this.name}/${key}`)) return
      this.map.removeSource(`${this.name}/${key}`)
    })
  },
  watch: {
    data: {
      deep: true,
      handler(featureCollection) {
        this.map.getSource(`${this.name}/data`).setData(featureCollection)
      }
    }
  }
}
</script>
