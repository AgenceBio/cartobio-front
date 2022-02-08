<template>
  <div class="container">
    <section>
      <h2>
        {{ currentUser.nom }}
        <small class="tag">Cet outil est actuellement en phase de test</small>
      </h2>

      <table class="parcelles">
        <tr v-for="({ properties: props }) in parcellaire.features" :key="props.NUMERO_I + props.NUMERO_P ">
          <th scope="row" class="rowIdCell">
            <span>{{ props.NOM || `${props.NUMERO_I}.${props.NUMERO_P}` }}</span>
            <small v-if="props.NOM">({{ props.NUMERO_I }}.{{ props.NUMERO_P }})</small>
          </th>
          <td>{{ props.COMMUNE }}</td>
          <td>{{ props.SURF }}&nbsp;ha</td>
          <td>
            <span>{{ props.TYPE_LIBELLE ?? groupLibelléFromCode(props.TYPE) }}</span><br>
            <small v-if="!props.TYPE_LIBELLE">{{ libelléFromCode(props.TYPE) }}</small>
          </td>
          <td>?</td>
          <td>?</td>
        </tr>
      </table>

    </section>

    <aside class="map" ref="mapContainer" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, toRefs } from 'vue'
import { Map as MapLibre } from 'maplibre-gl'
import groupBy from 'array.prototype.groupby'
import bbox from '@turf/bbox'
import { all as mergeAll } from 'deepmerge'
import { libelléFromCode, groupLibelléFromCode } from '../../referentiels/pac.js'

import baseStyle from '../../map-styles/base.json'
import cadastreStyle from '../../map-styles/cadastre.json'
import infrastructureStyle from '../../map-styles/infrastructure.json'

import store from '../../store.js'

const mapContainer = ref(null)
const { currentUser, parcellaire, parcellaireSource } = toRefs(store.state)

const featuresByIlot = computed(() => groupBy(parcellaire.value.features, (feature) => feature.properties.NUMERO_I))

onMounted(() => {
  const map = new MapLibre({
    container: mapContainer.value,
    hash: true,
    style: mergeAll([ baseStyle, cadastreStyle, infrastructureStyle ]),
    bounds: bbox(parcellaire.value),
    padding: 20,
  })

  map.on('load', () => {
    map.addSource('parcellaire-operateur', {
      type: 'geojson',
      data: parcellaire.value
    })

    map.addLayer({
      id: 'parcellaire-operateur-geometry',
      source: 'parcellaire-operateur',
      type: 'fill',
      paint: {
        "fill-color": "#00ffff",
        "fill-outline-color": "#00ffff",
        "fill-opacity": 0.5,
      },
      layout: {}
    })

    map.setZoom(map.getZoom() - 1)
  })
})

</script>


<style lang="postcss" scoped>
.container {
  display: flex;
  position: relative;
}

.container ul {
  list-style: none;
  padding: 0;
}

.container > section {
  flex-grow: 1;
  padding: 0 var(--spacing);
}

table.parcelles {
  border-collapse: collapse;
  width: 100%;
}

.rowIdCell small {
  font-weight: normal;
  margin-left: .5rem;
}

table.parcelles,
table.parcelles :is(td, th) {
  border: 1px solid #ccc;
  padding: .5em;
  text-align: left;
}

.map {
  background: #ccc;
  height: calc(100vh - 3rem);
  position: sticky;
  top: 0;
  width: max(50vw, 450px);
}

::v-deep .maplibregl-control-container {
  display: none;
}
</style>
