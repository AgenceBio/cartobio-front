<template>
  <div v-for="(message, index) in displayedMessages" :key="index">
    <div v-if="message.type === 'success'" class="fr-alert fr-alert--success fr-alert--sm fr-mb-2w">
      <p>{{ message.text }}</p>
      <button class="fr-btn--close fr-btn" title="Masquer le message" @click="displayedMessages.splice(index, 1)">
        Masquer le message
      </button>
    </div>
    <div v-if="message.type === 'error'" class="fr-alert fr-alert--error fr-alert--sm fr-mb-2w">
      <p>{{ message.text }}</p>
      <button class="fr-btn--close fr-btn" title="Masquer le message" @click="displayedMessages.splice(index, 1)">
        Masquer le message
      </button>
    </div>
  </div>

  <div class="fr-table fr-table--bordered fr-table--no-caption fr-mt-5w">
    <table @mouseout="hoveredFeatureId = null">
      <caption>Parcellaire agricole</caption>
      <colgroup>
        <col width="8%" />
        <col width="8%" />
        <col width="30%" />
        <col width="22%" />
        <col width="15%" />
        <col width="17%" />
      </colgroup>
      <thead>
        <tr v-if="(selectedFeatureIds.length > 0)" class="summary summary__mass-actions">
          <td colspan="2">
            <div class="fr-checkbox-group single-checkbox">
              <input type="checkbox" id="radio-mass-edit" checked @click="selectedFeatureIds = []" />
              <label class="fr-label" for="radio-mass-edit" />
            </div>
          </td>
          <td colspan="2">{{ selectedFeatureIds.length }} parcelles sélectionnées</td>
          <td colspan="2">
            <MassActionsSelector v-if="massActions.length" :actions="massActions" label="Modifier" @submit="handleFeatureCollectionSubmit" />
          </td>
        </tr>
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
      </thead>

      <FeatureGroup v-for="featureGroup in featureGroups" :featureGroup="featureGroup" :key="featureGroup.key" v-model:hoveredId="hoveredFeatureId" v-model:selectedIds="selectedFeatureIds" @edit:featureId="(featuredId) => editedFeatureId = featuredId" @delete:featureId="(featureId) => maybeDeletedFeatureId = featureId" @toggle:singleFeatureId="toggleSingleSelected" :validation-rules="validationRules" />
    </table>

    <p class="fr-my-3w" v-if="permissions.canAddParcelle">
      <router-link :to="{ name: 'exploitations-id-ajout-parcelle', params: { id: operator.id || 1 }}" class="fr-btn fr-btn--secondary fr-icon--sm fr-btn--icon-left fr-icon-add-line">Ajouter une parcelle</router-link>
    </p>
  </div>

  <Teleport to="body">
    <Modal v-if="editedFeatureId && editForm" v-model="showModal" icon="fr-icon-file-text-fill" @update:modelValue="editedFeatureId = null">
      <template #title>Modification de parcelle</template>

      <Component :is="editForm" :feature="editedFeature" @submit="handleSingleFeatureSubmit" />
    </Modal>

    <DeleteFeatureModal v-if="maybeDeletedFeatureId" v-model="showDeleteFeatureModal" :feature-id="maybeDeletedFeatureId" @submit="handleSingleFeatureDeletion" />
  </Teleport>

  <p>
    <a href="#top" class="fr-icon--sm fr-icon-arrow-up-fill">
      retour en haut de page
    </a>
  </p>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useFeaturesStore } from '@/stores/features.js'
import MassActionsSelector from '@/components/Features/MassActionsSelector.vue'
import DeleteFeatureModal from '@/components/Features/DeleteFeatureModal.vue'
import FeatureGroup from '@/components/Features/FeatureGroup.vue'
import Modal from '@/components/Modal.vue'

import { surface, inHa, getFeatureGroups, groupingChoices, getFeatureById } from './index.js'
import { deleteSingleFeature, updateSingleFeatureProperties, updateFeatureCollectionProperties } from '@/cartobio-api.js'
import { usePermissions } from "@/stores/permissions.js"
import { toast } from "vue3-toastify"
import { useMessages } from "@/stores/index.js"
import { statsPush } from "@/stats.js"

const props = defineProps({
  operator: {
    type: Object,
    required: true,
  },
  record: {
    type: Object,
    required: true,
  },
  features: {
    type: Object,
    required: true
  },
  editForm: Object,
  validationRules: Object,
  massActions: Array,
})

const store = useFeaturesStore()
const permissions = usePermissions()
const messages = useMessages()

const { hoveredId:hoveredFeatureId } = storeToRefs(store)
const { selectedIds:selectedFeatureIds, allSelected } = storeToRefs(store)
const { toggleSingleSelected, toggleAllSelected } = store

const editedFeatureId = ref(null)
const editedFeature = computed(() => editedFeatureId.value ? getFeatureById(props.features.features, editedFeatureId.value) : null)

const maybeDeletedFeatureId = ref(null)
const showDeleteFeatureModal = computed(() => Boolean(maybeDeletedFeatureId.value))

const userGroupingChoice = ref('CULTURE')

// hence, feature groups
const featureGroups = computed(() => getFeatureGroups(props.features, userGroupingChoice.value))

const isSaving = ref(false)
const showModal = computed(() => Boolean(editedFeatureId.value))

// Messages
const displayedMessages = ref(messages.popMessages())
watch(messages.queue, () => {
  displayedMessages.value.push(...messages.popMessages())
})
watch(showModal, (value) => {
  if (value) {
    displayedMessages.value = []
  }
})

function handleSingleFeatureSubmit ({ id, properties }) {
  statsPush(['trackEvent', 'Parcelles', 'Modification individuelle (sauvegarde)'])

  store.updateMatchingFeatures([{id, properties }])
  editedFeatureId.value = null

  performAsyncAction(
    updateSingleFeatureProperties({ recordId: props.record.record_id }, { id, properties })
  )
}

function handleSingleFeatureDeletion ({ id, reason }) {
  statsPush(['trackEvent', 'Parcelles', 'Suppression individuelle (sauvegarde)'])

  maybeDeletedFeatureId.value = null

  performAsyncAction(
    deleteSingleFeature({ recordId: props.record.record_id }, { id, reason } )
  )
}

function handleFeatureCollectionSubmit ({ ids, patch }) {
  statsPush(['trackEvent', 'Parcelles', 'Modification multiple (sauvegarde)'])
  const featureCollection = {
    type: 'FeatureCollection',
    features: ids.map(id => ({
      id,
      properties: { ...patch }
    }))
  }

  store.updateMatchingFeatures(featureCollection.features)
  editedFeatureId.value = null

  performAsyncAction(
    updateFeatureCollectionProperties({ recordId: props.record.record_id }, featureCollection)
  )
}

function performAsyncAction (promise) {
  isSaving.value = true

  return new Promise((resolve, reject) => {
    promise
      .then(record => {
        messages.addMessage({ type: 'success', text: 'Modification enregistrée.' })
        resolve(record)
      })
      .catch(error => {
        console.error(error)
        toast.error(
          "Une erreur d'enregistrement s'est produite. Les données n'ont pas été sauvegardées sur les serveurs CartoBio."
        )
        reject(error)
      })
      .finally(() => isSaving.value = false)
  })
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
    padding-right: 1rem;
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
  position: sticky;
  top: 0;
  z-index: var(--z-index-mass-actions);
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
