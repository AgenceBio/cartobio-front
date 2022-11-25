<template>
  <div class="fr-select-group fr-my-3w">
    <label class="fr-label" for="plots-group-by">
      Grouper les parcelles par
    </label>
    <select class="fr-select" id="plots-group-by" v-model="userGroupingChoice">
      <option :value="key" v-for="({ label }, key) in groupingChoices" :key="key">
        {{ label }}
      </option>
    </select>
  </div>

  <div class="fr-table fr-table--bordered fr-table--no-caption">
    <table @mouseout="hoveredFeatureId = null">
      <caption>Parcellaire agricole</caption>
      <colgroup>
        <col width="5%" />
        <col width="50%" />
        <col width="30%" />
        <col width="5%" />
        <col width="10%" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">
            <div class="fr-checkbox-group single-checkbox">
              <input type="checkbox" id="select-all" :checked="allSelected" @click="toggleAllSelected" />
              <label class="fr-label" for="select-all" />
            </div>
          </th>
          <th colspan="3" class="numeric">
            {{ features.features.length }} parcelles
          </th>
          <th scope="col" class="numeric">
            {{ inHa(surface(features)) }}&nbsp;ha
          </th>
        </tr>
      </thead>

      <FeatureGroup v-for="featureGroup in featureGroups" :featureGroup="featureGroup" :key="featureGroup.key" v-model:hoveredId="hoveredFeatureId" v-model:selectedIds="selectedFeatureIds" />
    </table>
  </div>

  <p>
    <a href="#top" class="fr-icon--sm fr-icon-arrow-up-fill">
      retour en haut de page
    </a>
  </p>
</template>
<script setup>
import { ref, computed, readonly } from 'vue'
import { storeToRefs } from 'pinia'

import { useFeaturesStore } from '@/stores/features.js'
import FeatureGroup from '@/components/Features/FeatureGroup.vue'

import { surface, inHa, getFeatureGroups, groupingChoices } from './index.js'

const props = defineProps({
  operator: {
    type: Object,
    required: false,
  },
  record: {
    type: Object,
    required: false,
  },
  features: {
    type: Object,
    required: true
  }
})

const store = useFeaturesStore()

const { hoveredId:hoveredFeatureId } = storeToRefs(store)
const { activeId:selectedFeatureId, activeFeature:selectedFeature } = storeToRefs(store)
const { allSelected, selectedIds:selectedFeatureIds } = storeToRefs(store)
const { toggleAllSelected } = store

const userGroupingChoice = ref('CULTURE')
const handleUserGroupingChoice = ($event) => userGroupingChoice.value = $event.target.value

// hence, feature groups
const featureGroups = computed(() => getFeatureGroups(props.features, userGroupingChoice.value))

</script>

<style>
.single-checkbox input[type="checkbox"] + label::before {
  left: auto !important;
  top: auto !important;
  margin: 0 !important;
}
.single-checkbox input[type="checkbox"] + label {
  margin: 0 !important;
}
</style>

<style scoped>
.rowIdCell small {
  font-weight: normal;
  margin-left: .5rem;
}

/* .fr-table table {
  display: table;
} */
.fr-text--align-right {
  text-align: right !important;
}

.fr-table td.numeric,
.fr-table th.numeric {
  font-variant-numeric: tabular-nums;
  text-align: right !important;
}


</style>
