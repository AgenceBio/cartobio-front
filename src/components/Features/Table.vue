<template>
  <div class="fr-table fr-table--bordered fr-table--no-caption">
    <table @mouseout="hoveredFeatureId = null">
      <caption>Parcellaire agricole</caption>
      <colgroup>
        <col width="10%" />
        <col width="10%" />
        <col width="30%" />
        <col width="20%" />
        <col width="20%" />
        <col width="10%" />
      </colgroup>
      <thead>
        <tr>
          <!-- <th scope="col">
            <div class="fr-checkbox-group single-checkbox">
              <input type="checkbox" id="select-all" :checked="allSelected" @click="toggleAllSelected" />
              <label class="fr-label" for="select-all" />
            </div>
          </th> -->
          <th colspan="2"></th>
          <th colspan="2" scope="col">
            <div class="seemless-select">
              <label for="plots-group-by">Parcelles par</label>
              <select id="plots-group-by" v-model="userGroupingChoice">
                <option :value="key" v-for="({ label }, key) in groupingChoices" :key="key">
                  {{ label }}
                </option>
              </select>
            </div>
          </th>
          <th scope="col" class="numeric">Surface</th>
          <th scope="col" class="numeric">Détails</th>
        </tr>
        <tr class="summary">
          <td colspan="2"></td>
          <td colspan="2">{{ features.features.length }} parcelles</td>
          <td class="numeric">{{ inHa(surface(features)) }}&nbsp;ha</td>
          <td></td>
        </tr>
      </thead>

      <FeatureGroup v-for="featureGroup in featureGroups" :featureGroup="featureGroup" :key="featureGroup.key" v-model:hoveredId="hoveredFeatureId" v-model:selectedIds="selectedFeatureIds" @edit:featureId="(featuredId) => editedFeatureId = featuredId" :validation-rules="validationRules" />
    </table>
  </div>

  <Teleport to="body">
    <Modal v-model="modal" icon="fr-icon-file-text-fill" @update:modelValue="editedFeatureId = null">
      <template #title>Modification de parcelle</template>

      <Component :is="editForm" :feature="editedFeature" v-if="editedFeatureId && editForm" @submit="handleSingleFeatureEdit" />
    </Modal>
  </Teleport>

  <p>
    <a href="#top" class="fr-icon--sm fr-icon-arrow-up-fill">
      retour en haut de page
    </a>
  </p>
</template>
<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useFeaturesStore } from '@/stores/features.js'
import FeatureGroup from '@/components/Features/FeatureGroup.vue'
import Modal from '@/components/Modal.vue'

import { surface, inHa, getFeatureGroups, groupingChoices, getFeatureById } from './index.js'
import { submitParcellesChanges } from '@/cartobio-api.js'

const props = defineProps({
  operator: {
    type: Object,
    required: true,
  },
  features: {
    type: Object,
    required: true
  },
  'edit-form': Object,
  'validation-rules': Object
})

const isSaving = ref(false)
const savingResult = ref(null)
const modal = computed(() => Boolean(editedFeatureId.value))
const store = useFeaturesStore()

const { hoveredId:hoveredFeatureId } = storeToRefs(store)
const { activeId:selectedFeatureId, activeFeature:selectedFeature } = storeToRefs(store)
const { allSelected, selectedIds:selectedFeatureIds } = storeToRefs(store)
const { toggleAllSelected } = store

const editedFeatureId = ref(null)
const editedFeature = computed(() => editedFeatureId.value ? getFeatureById(props.features.features, editedFeatureId.value) : null)

const userGroupingChoice = ref('CULTURE')
const handleUserGroupingChoice = ($event) => userGroupingChoice.value = $event.target.value

// hence, feature groups
const featureGroups = computed(() => getFeatureGroups(props.features, userGroupingChoice.value))

function handleSingleFeatureEdit ({ id, patch }) {
  const feature = props.features.features.find(f => f.id === id)

  feature.properties = {
    ...feature.properties,
    ...patch
  }

  editedFeatureId.value = null
  store.setAll(props.features.features)
  doSave(props.features)
}

function doSave (geojson) {
  const { id: operatorId, numeroBio} = props.operator

  isSaving.value = true

  setTimeout(async () => {
    try {
      await submitParcellesChanges ({ geojson, operatorId, numeroBio })
      savingResult.value = {
        type: 'success',
        message: "Parcellaire correctement sauvegardé sur les serveurs CartoBio."
      }
    }
    catch (error) {
      console.error(error)
      savingResult.value = {
        type: 'error',
        message: "Une erreur d'enregistrement s'est produite. Les données n'ont pas été sauvegardées sur les serveurs CartoBio."
      }
    }

    isSaving.value = false
  }, 300)
}
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

.fr-table thead {
  background-image: linear-gradient(0deg, var(--border-active-blue-france), var(--border-active-blue-france));
}
.fr-table .summary {
  color: var(--text-title-blue-france);
  background-size: 100% 2px, 100% 2px;
  background-repeat: no-repeat;
  background-color: var(--background-alt-blue-france);
  background-position: top, bottom;
  background-image: linear-gradient(0deg, var(--border-active-blue-france), var(--border-active-blue-france)), linear-gradient(0deg, var(--border-active-blue-france), var(--border-active-blue-france));
}

.fr-text--align-right {
  text-align: right !important;
}

.fr-table td.numeric,
.fr-table th.numeric {
  font-variant-numeric: tabular-nums;
  text-align: right !important;
}


</style>
