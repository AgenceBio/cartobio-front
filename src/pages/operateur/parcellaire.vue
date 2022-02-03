<template>
  <div class="container">
    <section>
      <h2>
        {{ currentUser.commercial_name }}
        <small class="tag">Cet outil est actuellement en phase de test</small>
      </h2>

      <ul>
        <li v-for="(features, ilot) in featuresByIlot" :key="ilot">
          <h3>Ilot {{ ilot }} <small>({{ features.length }} parcelles)</small></h3>

          <table class="parcelles">
            <tr v-for="({ properties: props }) in features" :key="props.NUMERO_I + props.NUMERO_P ">
              <th scope="row">Parcelle {{ props.NUMERO_P }}</th>
              <td>{{ props.SURF }} ha</td>
              <td>{{ props.TYPE }}</td>
              <td>?</td>
              <td>?</td>
            </tr>
          </table>
        </li>
      </ul>

    </section>

    <aside class="map" ref="mapContainer" />
  </div>
</template>

<script setup>
import { readonly, computed, onMounted, ref, toRefs } from 'vue'
import groupBy from 'array.prototype.groupby'
import store from '../../store.js'
import { Map as MapLibre } from 'maplibre-gl'

const mapContainer = ref(null)
const { currentUser, parcellaire } = toRefs(store.state)

const featuresByIlot = computed(() => groupBy(parcellaire.value.features, (feature) => feature.properties.NUMERO_I))

onMounted(() => {
  const map = new MapLibre({
    container: mapContainer.value,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [3, 46],
    zoom: 5
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

table.parcelles,
table.parcelles :is(td, th) {
  border: 1px solid #ccc;
  padding: .5em;
}

.map {
  background: #ccc;
  height: calc(100vh - 3rem);
  width: max(50vw, 450px);
}
</style>
