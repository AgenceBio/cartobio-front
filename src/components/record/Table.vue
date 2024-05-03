<template>
  <div class="fr-table fr-table--bordered fr-table--no-caption fr-my-6v">
    <ul class="fr-tags-group fr-tags-group--tags fr-my-6v" v-if="permissions.canViewAnnotations">
      <li :key="id" v-for="{ active, id, count, label, required } in tags">
        <button class="fr-tag" :class="{'fr-tag--dismiss': active, [`tag--${id}`]: true, 'fr-icon-warning-fill fr-tag--icon-left': required }" :aria-label="`${active ? 'Ne plus filtrer' : 'Filtrer'} sur le critère ${label}`" @click="handleFilterClick(id)">
          {{ label }} ({{ count }})
        </button>
      </li>
    </ul>

    <table @mouseout="hoveredFeatureId = null">
      <caption>Parcellaire agricole</caption>
      <colgroup>
        <col class="selection" />
        <col class="accordion" />
        <col class="labels" />
        <col class="surface" />
        <col class="actions" />
      </colgroup>
      <thead>
        <tr v-if="(selectedFeatureIds.length > 0)" class="summary summary__mass-actions">
          <td class="selection" colspan="2">
            <div class="fr-checkbox-group single-checkbox">
              <input type="checkbox" id="radio-mass-edit" checked @click="selectedFeatureIds = []" />
              <label class="fr-label" for="radio-mass-edit" />
            </div>
          </td>
          <td colspan="3">
            <div>
              {{ selectedFeatureIds.length }} parcelles sélectionnées
              <MassActionsSelector v-if="massActions.length" :actions="massActions" label="Modifier" @submit="handleFeatureCollectionSubmit" />
            </div>
          </td>
        </tr>
        <tr>
          <th colspan="2">
            <div class="fr-checkbox-group single-checkbox" v-if="hasFeatures">
              <input type="checkbox" id="radio-select-all" :checked="allSelected" @click="toggleAllSelected" />
              <label class="fr-label" for="radio-select-all" />
            </div>
          </th>
          <th class="labels" scope="col">
            <div class="seamless-select">
              <label for="plots-group-by">Parcelles par </label>
              <b>{{ groupingChoices[userGroupingChoice].label }}</b>
              <select id="plots-group-by" v-model="userGroupingChoice">
                <option :value="key" v-for="({ label }, key) in groupingChoices" :key="key">
                  {{ label }}
                </option>
              </select>
            </div>
          </th>
          <th scope="col" class="numeric">
            <span class="fr-hidden fr-unhidden-sm fr-unhidden-md fr-unhidden-lg fr-unhidden-xl ">
              Surface
            </span>
          </th>
          <th />
        </tr>
        <tr class="summary" v-if="(selectedFeatureIds.length === 0 && hasFeatures)">
          <td colspan="2"></td>
          <td class="labels">
            {{ features.length }} parcelles
            <span class="fr-hidden-sm fr-hidden-md fr-hidden-lg fr-hidden-xl">
              - {{ inHa(legalProjectionSurface(features)) }}&nbsp;ha
            </span>
          </td>
          <td class="numeric">
            <span class="fr-hidden fr-unhidden-sm fr-unhidden-md fr-unhidden-lg fr-unhidden-xl ">
            {{ inHa(legalProjectionSurface(features)) }}&nbsp;ha
            </span>
          </td>
          <th />
        </tr>
      </thead>

      <tbody v-if="!hasFeatures">
        <tr>
          <td colspan="4">
            Votre parcellaire est vide.
          </td>
        </tr>
      </tbody>

      <FeatureGroup v-for="featureGroup in featureGroups" :featureGroup="featureGroup" :key="featureGroup.key" @edit:featureId="(featuredId) => editedFeatureId = featuredId" @delete:featureId="(featureId) => maybeDeletedFeatureId = featureId" />
    </table>

    <p class="fr-my-3w" v-if="permissions.canAddParcelle">
      <router-link :to="`/exploitations/${operator.numeroBio}/${record.record_id}/ajout-parcelle`" class="fr-btn fr-btn--secondary fr-icon--sm fr-btn--icon-left fr-icon-add-line">Ajouter une parcelle</router-link>
    </p>
  </div>

  <Teleport to="body">
    <Component  v-if="editedFeatureId && editForm" :is="editForm" :feature="editedFeature" @submit="handleSingleFeatureSubmit" @close="editedFeatureId = null" icon="fr-icon-file-text-fill">
      <template #title>Modification de parcelle</template>
    </Component>

    <DeleteFeatureModal v-if="maybeDeletedFeatureId" @close="maybeDeletedFeatureId = false" :feature-id="maybeDeletedFeatureId" @submit="handleSingleFeatureDeletion" />
  </Teleport>

  <p>
    <a href="#top" class="fr-icon--sm fr-icon-arrow-up-fill">
      retour en haut de page
    </a>
  </p>
</template>
<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useFeaturesStore } from "@/stores/features.js"
import { useFeaturesSetsStore } from "@/stores/features-sets.js"
import { useOperatorStore } from "@/stores/operator.js"
import { usePermissions } from "@/stores/permissions.js"
import { useRecordStore } from "@/stores/record.js"

import MassActionsSelector from '@/components/Features/MassActionsSelector.vue'
import DeleteFeatureModal from '@/components/record/modals/DeleteFeatureModal.vue'
import FeatureGroup from '@/components/Features/FeatureGroup.vue'

import {
  featureName,
  getFeatureGroups,
  groupingChoices,
  inHa,
  legalProjectionSurface,
} from '../Features/index.js'
import toast from "@/components/toast.js"
import { statsPush } from "@/stats.js"

defineProps({
  editForm: {
    type: Object
  },
  massActions: {
    type: Array,
    default: () => ([])
  },
})

const operatorStore = useOperatorStore()
const recordStore = useRecordStore()
const featuresStore = useFeaturesStore()
const featuresSets = useFeaturesSetsStore()
const permissions = usePermissions()

const { operator } = storeToRefs(operatorStore)
const { record } = storeToRefs(recordStore)
const { hits: features, tags } = storeToRefs(featuresSets)
const { hasFeatures, hoveredId: hoveredFeatureId } = storeToRefs(featuresStore)
const { selectedIds: selectedFeatureIds, allSelected } = storeToRefs(featuresStore)
const { getFeatureById, toggleAllSelected } = featuresStore

const editedFeatureId = ref(null)
const editedFeature = computed(() => editedFeatureId.value ? getFeatureById(editedFeatureId.value) : null)
const maybeDeletedFeatureId = ref(null)

const userGroupingChoice = ref('CULTURE')
const featureGroups = computed(() => getFeatureGroups({ features: features.value }, userGroupingChoice.value))

async function handleSingleFeatureSubmit ({ id, properties }) {
  statsPush(['trackEvent', 'Parcelles', 'Modification individuelle (sauvegarde)'])
  editedFeatureId.value = null

  await featuresStore.updateSingleFeature({ id, properties })
  toast.success(`Parcelle « ${featureName(featuresStore.getFeatureById(id))} » modifiée.`)
}

async function handleSingleFeatureDeletion ({ id, reason }) {
  statsPush(['trackEvent', 'Parcelles', 'Suppression individuelle (sauvegarde)'])

  maybeDeletedFeatureId.value = null

  const deletedFeatureName = featureName(featuresStore.getFeatureById(id))
  await featuresStore.deleteSingleFeature({ id, reason })
  toast.success(`Parcelle « ${deletedFeatureName} » supprimée.`)
}

async function handleFeatureCollectionSubmit ({ ids, patch }) {
  statsPush(['trackEvent', 'Parcelles', 'Modification multiple (sauvegarde)'])
  editedFeatureId.value = null

  const featureCollection = {
    type: 'FeatureCollection',
    features: ids.map(id => ({
      id,
      properties: { ...patch }
    }))
  }
  await featuresStore.updateFeatureCollectionProperties(featureCollection)
  toast.success('Parcelles modifiées.')
}

function handleFilterClick (id) {
  featuresSets.toggle(id)

  if (featuresSets.isToggled(id)) {
    statsPush(['trackEvent', 'Filtre parcelles', id])
  }
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
.selection {
  min-width: 2rem;
}

.accordion {
  width: 2.5rem;
}

.seamless-select {
  position: relative;
  padding-right: 1rem;
  font-weight: normal;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEyIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNiA2TDAgMEgxMkw2IDZaIiBmaWxsPSIjMDAwMDkxIi8+Cjwvc3ZnPgo=");
  background-position: right center;
  background-repeat: no-repeat;

  & label {
    display: inline;
  }

  /* super hacky way to hide a select behind
   our custom div and still be able to interact with it
   (there is no way to open select fields programmatically) */
  & select {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}

.fr-table table {
  display: table;
  overflow: initial;

  & th:empty,
  & td:empty {
    padding: 0;
    font-size: 0;
    line-height: 0;
    white-space: nowrap;
  }

  th:has(span.fr-hidden.fr-unhidden-sm),
  td:has(span.fr-hidden.fr-unhidden-sm){
    @media (max-width: 579px) {
      padding: 0;
    }
  }
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
  z-index: var(--z-index-dropdown);
}

.fr-table .summary.summary__mass-actions .fr-checkbox-group input[type="checkbox"]:checked + label::before{
  box-shadow: inset 0 0 0 1px var(--text-inverted-blue-france);
}

.fr-table .summary.summary__mass-actions td:nth-child(2) div {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.fr-table td.numeric,
.fr-table th.numeric {
  font-variant-numeric: tabular-nums;
  text-align: right !important;
}

.fr-tags-group--tags {
  gap: 0.75rem;

  > li {
    min-height: auto !important;
    line-height: 1.5rem;
  }

  .fr-tag {
    margin: 0;
  }
}
</style>
