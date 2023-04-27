<template>
  <div class="fr-table fr-table--bordered fr-table--no-caption fr-mt-5w">
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
        <tr class="legend">
          <th colspan="2">
            <div class="fr-checkbox-group single-checkbox">
              <input type="checkbox" id="radio-select-all" :checked="allSelected" @click="toggleAllSelected" />
              <label class="fr-label" for="radio-select-all" />
            </div>
          </th>
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
        <tr class="summary" v-if="(selectedFeatureIds.length === 0)">
          <td colspan="2"></td>
          <td colspan="2">{{ features.features.length }} parcelles</td>
          <td class="numeric">{{ inHa(surface(features)) }}&nbsp;ha</td>
          <td></td>
        </tr>
        <tr v-else class="summary summary__mass-actions">
          <td colspan="2">
            <div class="fr-checkbox-group single-checkbox">
              <input type="checkbox" id="radio-mass-edit" checked @click="selectedFeatureIds = []" />
              <label class="fr-label" for="radio-mass-edit" />
            </div>
          </td>
          <td colspan="2">{{ selectedFeatureIds.length }} parcelles sélectionnées</td>
          <td colspan="2">
            <MassActionsSelector :actions="massActions" label="Modifier" @submit="handleFeaturesEdit" />
          </td>
        </tr>
      </thead>

      <FeatureGroup v-for="featureGroup in featureGroups" :featureGroup="featureGroup" :key="featureGroup.key" v-model:hoveredId="hoveredFeatureId" v-model:selectedIds="selectedFeatureIds" @edit:featureId="(featuredId) => editedFeatureId = featuredId" @toggle:singleFeatureId="toggleSingleSelected" :validation-rules="validationRules" />
    </table>
  </div>

  <Teleport to="body">
    <Modal v-if="editedFeatureId && editForm" v-model="modal" icon="fr-icon-file-text-fill" @update:modelValue="editedFeatureId = null">
      <template #title>Modification de parcelle</template>

      <Component :is="editForm" :feature="editedFeature" @submit="handleFeaturesEdit" />
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
import MassActionsSelector from '@/components/Features/MassActionsSelector.vue'
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
  'validation-rules': Object,
  'mass-actions': Array
})

const isSaving = ref(false)
const savingResult = ref(null)
const modal = computed(() => Boolean(editedFeatureId.value))
const store = useFeaturesStore()

const { hoveredId:hoveredFeatureId } = storeToRefs(store)
const { selectedIds:selectedFeatureIds, allSelected } = storeToRefs(store)
const { toggleSingleSelected, toggleAllSelected } = store

const editedFeatureId = ref(null)
const editedFeature = computed(() => editedFeatureId.value ? getFeatureById(props.features.features, editedFeatureId.value) : null)

const userGroupingChoice = ref('CULTURE')

// hence, feature groups
const featureGroups = computed(() => getFeatureGroups(props.features, userGroupingChoice.value))

function handleFeaturesEdit ({ ids, patch }) {
  props.features.features
    .filter(feature => ids.includes(feature.id))
    .forEach(feature => {
      feature.properties = {
        ...feature.properties,
        ...patch
      }
    })

  editedFeatureId.value = null
  store.setAll(props.features.features)
  doSave(props.features)
}

function doSave (geojson) {
  const { id: operatorId, numeroBio, organismeCertificateur } = props.operator
  const { id: ocId, nom: ocLabel } = organismeCertificateur

  isSaving.value = true

  setTimeout(async () => {
    try {
      await submitParcellesChanges ({ geojson, operatorId, ocId, ocLabel, numeroBio })
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
.seemless-select {
  font-weight: normal;
}
  .seemless-select select {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEyIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNiA2TDAgMEgxMkw2IDZaIiBmaWxsPSIjMDAwMDkxIi8+Cjwvc3ZnPgo=");
    background-position: right center;
    background-repeat: no-repeat;
    font-weight: bold;
  }

.rowIdCell small {
  font-weight: normal;
  margin-left: .5rem;
}
.fr-table table {
  overflow: initial;
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
.fr-table .summary.summary__mass-actions {
  color: var(--text-inverted-blue-france);
  background-color: var(--background-action-high-blue-france);
}
  .fr-table .summary.summary__mass-actions .fr-checkbox-group input[type="checkbox"]:checked + label::before{
    box-shadow: inset 0 0 0 1px var(--text-inverted-blue-france);
  }

.fr-text--align-right {
  text-align: right !important;
}

.fr-table tr.legend :is(td, th),
.fr-table tr.summary :is(td, th) {
  padding-left: .6rem;
  padding-right: .6rem;
}

.fr-table td.numeric,
.fr-table th.numeric {
  font-variant-numeric: tabular-nums;
  text-align: right !important;
}


</style>
