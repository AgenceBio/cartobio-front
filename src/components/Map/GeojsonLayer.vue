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
        "fill-opacity": 1,
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
    const siblingNames = this.$parent.$slots.default()
        .filter(node => node.props)
        .map(node => node.props.name)
    const nextSiblings = siblingNames.slice(siblingNames.indexOf(this.name) + 1)

    // always create the data layer
    // otherwise the watch() fails (if empty at first, it cannot be updated)
    this.map
      .addSource(`${this.name}/data`, {
        type: 'geojson',
        data: this.data ?? { type: 'FeatureCollection', features: [] }
      })

    if (this.data && (this.fill || this.line)) {
      if (this.map.getLayer(`${this.name}/geometry`)) return;

      if (this.fill) {
        this.map.addLayer({
          id: `${this.name}/geometry`,
          source: `${this.name}/data`,
          type: 'fill',
          paint: this.fill
        })
      }

      if (this.line) {
        this.map.addLayer({
          id: `${this.name}/geometry-outline`,
          source: `${this.name}/data`,
          type: 'line',
          paint: this.line
        })
      }
    }

    if (!this.style) return

    if (this.style.sprite) {
      const hasSprite = !this.map
          .getStyle?.()
          ?.sprite
          ?.find(({ id, url }) => id === this.name || url === this.style.sprite)
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
      if (this.map.getLayer(layer.id)) return

      const nextLayer = this.map.getStyle().layers.find(({ id }) => {
        return nextSiblings.includes(id.split('/')[0])
      })

      this.map.addLayer({
        ...layer,
        id: `${this.name}/${layer.id}`,
        source: `${this.name}/${layer.source}`
      }, nextLayer?.id)
    })
  },
  unmounted() {
    if (!this.style) return

    this.style.layers.map(layer => this.map.removeLayer(`${this.name}/${layer.id}`))
    Object.keys(this.style.sources).map(key => {
      if (!this.map.getSource(`${this.name}/${key}`)) return
      this.map.removeSource(`${this.name}/${key}`)
    })
  },
  watch: {
    data(featureCollection) {
      this.map.getSource(`${this.name}/data`).setData(featureCollection)
    }
  }
}
</script>
