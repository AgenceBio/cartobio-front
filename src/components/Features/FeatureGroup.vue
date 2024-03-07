<template>
  <tbody>
    <tr @click.stop="open = !open" class="clickable group-header">
      <td>
        <div class="fr-checkbox-group single-checkbox">
          <input type="checkbox" :id="'radio-'+ featureGroup.key" :checked="allSelected" @click="toggleFeatureGroup" />
          <label class="fr-label" :for="'radio-'+ featureGroup.key" />
        </div>
      </td>
      <td><span class="fr-icon fr-icon-arrow-down-s-line" :aria-checked="open" aria-role="button" /></td>
      <th scope="row" colspan="2" :data-group-id="featureGroup.key">{{ featureGroup.label }}</th>
      <td class="numeric">{{ inHa(featureGroup.surface) }}&nbsp;ha</td>
      <td class="actions">
        <span class="fr-btn fr-btn--tertiary-no-outline fr-icon-warning-fill fr-icon--warning" :title="`${groupErrors} parcelles à amender`" v-if="groupErrors" />
      </td>
    </tr>
    <tr :hidden="!open" class="intermediate-header">
      <th scope="col" colspan="2"></th>
      <th scope="col" v-if="isGroupedByCulture">Nom</th>
      <th scope="col" v-else>Culture</th>
      <th scope="col">Certification</th>
      <th scope="col" colspan="2"></th>
    </tr>
    <tr class="parcelle clickable" :class="{'parcelle--is-new': feature.id === Number(route.query?.new)}" :id="'parcelle-' + feature.id" :hidden="!open" v-for="feature in featureGroup.features" :key="feature.id" @mouseover="hoveredId = feature.id" :aria-current="feature.id === hoveredId ? 'location' : null">
      <th scope="row">
        <div class="fr-checkbox-group single-checkbox">
          <input type="checkbox" :id="'radio-' + feature.id" :checked="selectedIds.includes(feature.id)" @click="toggleSingleSelected(feature.id)" />
          <label class="fr-label" :for="'radio-' + feature.id" />
        </div>
      </th>
      <td @click="toggleEditForm(feature.id)"></td>
      <td @click="toggleEditForm(feature.id)" v-if="isGroupedByCulture">
        <span class="culture-name">{{ featureName(feature) }}</span>
        <small class="feature-precision" v-if="feature.properties.cultures.length > 1">Multi-culture</small>
      </td>
      <td @click="toggleEditForm(feature.id)" v-else>
        <span class="culture-type" v-if="feature.properties.cultures.length > 1">
          Multi-cultures<span class="fr-sr-only"> : </span>
          <small class="feature-precision" v-for="(culture, i) in feature.properties.cultures" :key="i">
            <span v-if="i" class="fr-sr-only">, </span>{{ cultureLabel(culture) }}
          </small>
        </span>
        <span class="culture-name" v-else>{{ cultureLabel(feature.properties.cultures[0]) }}</span>
        <small class="feature-precision">{{ featureName(feature) }}</small>
      </td>
      <td @click="toggleEditForm(feature.id)">
        <ConversionLevel :feature="feature" with-date />
      </td>
      <td @click="toggleEditForm(feature.id)" class="numeric">{{ inHa(surface(feature)) }}&nbsp;ha</td>
      <td class="actions">
        <button type="button" :class="{'fr-btn': true, 'fr-btn--tertiary-no-outline': true, 'fr-icon-edit-line': true /*!featuresSets.byFeature(feature.id, true).size, 'fr-icon-edit-box-fill fr-icon--warning': featuresSets.byFeature(feature.id, true).size*/}" @click="toggleEditForm(feature.id)">
          Modifier
        </button>

        <ActionDropdown>
          <router-link v-if="permissions.canChangeGeometry" :to="`/exploitations/${operatorStore.operator.numeroBio}/${recordStore.record.record_id}/modifier/${feature.id}`" type="button" class="fr-btn fr-btn--tertiary-no-outline fr-icon-geometry fr-text--sm">
            Modifier le contour
          </router-link>
          <button v-else type="button" disabled class="fr-btn fr-btn--tertiary-no-outline fr-icon-geometry fr-text--sm">
            Modifier le contour
          </button>
          <button type="button" @click.prevent="toggleDeleteForm(feature.id)" :disabled="!permissions.canDeleteFeature" class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-line btn--error fr-text--sm">
            Supprimer la parcelle
          </button>
        </ActionDropdown>
      </td>
    </tr>
  </tbody>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from "vue-router";
import { featureName, cultureLabel, inHa, surface } from '@/components/Features/index.js'
import { useFeaturesStore, useFeaturesSetsStore, useOperatorStore, usePermissions, useRecordStore } from '@/stores/index.js'

import ConversionLevel from './ConversionLevel.vue'
import ActionDropdown from "@/components/ActionDropdown.vue"


const route = useRoute()
const operatorStore = useOperatorStore()
const recordStore = useRecordStore()
const featuresStore = useFeaturesStore()
const featuresSets = useFeaturesSetsStore()
const permissions = usePermissions()

const props = defineProps({
  featureGroup: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit:featureId', 'delete:featureId'])

const { selectedIds, hoveredId } = storeToRefs(featuresStore)
const { toggleSingleSelected } = featuresStore

const featureIds = computed(() => props.featureGroup.features.map(({ id }) => id))
const open = ref(featureIds.value.includes(String(route.query?.new)))
const allSelected = computed(() => featureIds.value.every(id => selectedIds.value.includes(id)))
const isGroupedByCulture = computed(() => props.featureGroup.pivot === 'CULTURE')

const groupErrors = computed(() => {
  return featureIds.value.reduce((sum, id) => sum + featuresSets.byFeature(id, true).size, 0)
})

function toggleEditForm (featureId) {
  return emit('edit:featureId', featureId)
}

function toggleDeleteForm (featureId) {
  return emit('delete:featureId', featureId)
}

function toggleFeatureGroup () {
  // we uncheck them
  if (allSelected.value) {
    featuresStore.unselect(...featureIds.value)
  }
  else {
    featuresStore.select(...featureIds.value)
  }
}

watch(selectedIds, (selectedIds, prevSelectedIds) => {
  const newItems = featureIds.value.filter(id => {
    return selectedIds.includes(id) && !prevSelectedIds.includes(id)
  })

  if (newItems.length === 1 && newItems.length !== featureIds.value.length) {
    open.value = true

    setTimeout(() => {
      document.querySelector(`tr#parcelle-${newItems[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)
  }
})
</script>

<style scoped>
.fr-table tr.intermediate-header {
  background-size: 100% 2px;
  background-repeat: no-repeat;
  background-image: linear-gradient(0deg, var(--border-plain-grey), var(--border-plain-grey));
}
  .fr-table tr.intermediate-header th {
    background-color: var(--background-default-grey);
    color: var(--text-mention-grey);
    border-bottom: 1px solid ;
    padding-top: .75rem;
    padding-bottom: .75rem;
  }
  .fr-table td.numeric,
  .fr-table th.numeric {
    font-variant-numeric: tabular-nums;
    text-align: right !important;
  }

  .fr-table tr.group-header :is(td, th),
  .fr-table tr.intermediate-header th,
  .fr-table tr.parcelle :is(td, th) {
    padding: .6rem;
  }

  .fr-table tr.parcelle {
    background-color: var(--background-alt-blue-france);
  }
  .fr-table tr.parcelle:nth-child(2n) {
    background-color: var(--background-default-grey);
  }
  .fr-table tr.parcelle:last-child {
    /* same as .fr-table--bordered tbody tr */
    background-size: 100% 2px;
    background-image: linear-gradient(180deg, var(--grey-625-425), var(--grey-625-425));
  }

  .fr-table tr.parcelle :where(.culture-type, .culture-name) {
    display: block;
  }

  .fr-table tr.parcelle span > .feature-precision {
    display: block;
  }

  .fr-table tr.parcelle td > .feature-precision {
    color: var(--text-mention-grey);
  }

  .fr-table tr.parcelle--is-new,
  .fr-table tr.parcelle--is-new:nth-child(2n) {
    background-color: var(--green-tilleul-verveine-975-75);
  }

.fr-icon[aria-checked="true"]::before {
  transform: rotate(180deg);
}

table tr[aria-current="location"] {
  background-color: var(--background-alt-blue-france-hover) !important;
}

.actions {
  --hover: transparent;
  --active: transparent;

  position: relative;
  text-align: left;
  white-space: nowrap;
}

.fr-icon--warning {
  color: var(--text-default-error);
}

.fr-icon-geometry::before {
  mask-image: url(@/assets/icon-geometry.svg);
}
</style>
