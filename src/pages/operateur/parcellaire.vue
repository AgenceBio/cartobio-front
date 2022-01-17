<template>
  <section>
    <h2>
      GAEC de la Tête d'Or
      <small>Cet outil est actuellement en phase de test</small>
    </h2>

    <ul>
      <li v-for="(features, ilot) in featuresByIlot" :key="ilot">
        <h3>Ilot {{ ilot }} <small>({{ features.length }} parcelles)</small></h3>

        <table>
          <tr v-for="feature in features" :key="feature['rpg.ilot'] + feature['rpg.parcelle'] ">
            <th scope="row">{{ feature.name }}</th>
            <td>0,77 ha</td>
            <td>{{ feature['rpg.code_culture'] }}</td>
            <td>{{ feature['bio.statut'] }}</td>
            <td>{{ feature['bio.conversion_date'] }}</td>
          </tr>
        </table>
      </li>
    </ul>

  </section>

  <aside class="map">

  </aside>
</template>

<script setup>
import { readonly, computed } from 'vue'
import groupBy from 'array.prototype.groupby'

const features = readonly([
  {
    name: 'Parcelle 1',
    'rpg.parcelle': 1,
    'rpg.ilot': 1,
    'rpg.code_culture': 'PTH',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 2',
    'rpg.parcelle': 2,
    'rpg.ilot': 1,
    'rpg.code_culture': 'PTH',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 3',
    'rpg.parcelle': 3,
    'rpg.ilot': 1,
    'rpg.code_culture': 'PTH',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 4',
    'rpg.parcelle': 4,
    'rpg.ilot': 1,
    'rpg.code_culture': 'PTH',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 5',
    'rpg.parcelle': 5,
    'rpg.ilot': 1,
    'rpg.code_culture': 'PTH',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 1',
    'rpg.parcelle': 1,
    'rpg.ilot': 2,
    'rpg.code_culture': 'BTH',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 1',
    'rpg.parcelle': 1,
    'rpg.ilot': 3,
    'rpg.code_culture': 'AIL',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 2',
    'rpg.parcelle': 2,
    'rpg.ilot': 3,
    'rpg.code_culture': 'AIL',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 3',
    'rpg.parcelle': 3,
    'rpg.ilot': 3,
    'rpg.code_culture': 'AIL',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 4',
    'rpg.parcelle': 4,
    'rpg.ilot': 3,
    'rpg.code_culture': 'AIL',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 5',
    'rpg.parcelle': 5,
    'rpg.ilot': 3,
    'rpg.code_culture': 'AIL',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 6',
    'rpg.parcelle': 6,
    'rpg.ilot': 3,
    'rpg.code_culture': 'AIL',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
  {
    name: 'Parcelle 7',
    'rpg.parcelle': 7,
    'rpg.ilot': 3,
    'rpg.code_culture': 'AIL',
    'bio.statut': 'BIO',
    'bio.conversion_date': '2010-05-01'
  },
])

const featuresByIlot = computed(() => groupBy(features, (feature) => feature['rpg.ilot']))
</script>


<style scoped>
.map {
  background: #ccc;
  height: 100vh;
  width: max(50vw, 450px);
}
</style>
