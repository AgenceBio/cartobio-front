<template>
  <tbody class="feature-group">
    <tr @click.stop="open = !open" @keydown.enter="open = !open" class="clickable group-header" tabindex="0">
      <td class="selection">
        <div class="fr-checkbox-group single-checkbox">
          <input type="checkbox" :id="'radio-'+ featureGroup.key" :checked="allSelected" @click="toggleFeatureGroup" />
          <label class="fr-label" :for="'radio-'+ featureGroup.key" :aria-label="allSelected ? `Désélectionner les parcelles ${featureGroup.label.toLocaleLowerCase()}` : `Sélectionner les parcelles ${featureGroup.label.toLocaleLowerCase()}`" />
        </div>
      </td>
      <td class="accordion"><span class="fr-icon fr-icon-arrow-down-s-line" :aria-checked="open" aria-role="button" /></td>
      <th class="labels" scope="row" :data-group-id="featureGroup.key">
        {{ featureGroup.label }}
        <small class="group-precision fr-hidden-sm fr-hidden-md fr-hidden-lg fr-hidden-xl">
          {{ inHa(featureGroup.surface) }}&nbsp;ha
        </small>
      </th>
      <td class="surface numeric">
        <span class="fr-hidden fr-unhidden-sm fr-unhidden-md fr-unhidden-lg fr-unhidden-xl">
          {{ inHa(featureGroup.surface) }}&nbsp;ha
        </span>
      </td>
      <td class="actions">
        <span
            v-if="groupErrors"
            class="fr-btn fr-btn--tertiary-no-outline fr-icon-warning-fill fr-icon--warning"
            :title="`${groupErrors} parcelles à amender`"
        />
      </td>
    </tr>
    <tr>
      <td colspan="7">
        <table class="fr-table group-table fr-table--no-caption" :aria-describedby="`operator-features-summary-${featureGroup.key}`">
          <caption>
            Parcelles {{ featureGroup.label.toLocaleLowerCase() }}
          </caption>
          <colgroup>
            <col class="selection" />
            <col class="labels" />
            <col class="certification" />
            <col class="surface" />
            <col class="actions" />
          </colgroup>
          <tbody>
            <tr :hidden="!open" class="intermediate-header">
              <th scope="col" aria-hidden></th>
              <th scope="col" v-if="isGroupedByCulture">Nom</th>
              <th scope="col" v-else>Culture</th>
              <th scope="col" class="certification">
                <span class=" fr-hidden fr-unhidden-sm fr-unhidden-md fr-unhidden-lg fr-unhidden-xl">Certification</span>
              </th>
              <th scope="col" class="surface">
                <span class="fr-hidden fr-unhidden-sm fr-unhidden-md fr-unhidden-lg fr-unhidden-xl">Surface</span>
              </th>
              <th scope="col" class="actions">Actions</th>
            </tr>
            <tr class="parcelle clickable" :class="{'parcelle--is-new': feature.id === Number(route.query?.new)}" :id="'parcelle-' + feature.id" :hidden="!open" v-for="feature in featureGroup.features" :key="feature.id" @mouseover="hoveredId = feature.id" :aria-current="feature.id === hoveredId ? 'location' : null">
              <th scope="row">
                <div class="fr-checkbox-group single-checkbox">
                  <input type="checkbox" :id="'radio-' + feature.id" :checked="selectedIds.includes(feature.id)" @click="toggleSingleSelected(feature.id)" />
                  <label class="fr-label" :for="'radio-' + feature.id" :aria-label="selectedIds.includes(feature.id) ? `Désélectionner ${featureName(feature)}` : `Sélectionner ${featureName(feature)}`" />
                </div>
              </th>
              <td @click="isOnline && toggleEditForm(feature.id)" v-if="isGroupedByCulture">
                <span class="culture-name">{{ featureName(feature) }}</span>
                <small class="feature-precision" v-if="feature.properties.cultures.length > 1">Multi-culture</small>
                <small class="feature-precision fr-hidden-sm fr-hidden-md fr-hidden-lg fr-hidden-xl">
                  <ConversionLevel :feature="feature" with-date /><br />
                  {{ inHa(legalProjectionSurface(feature)) }}&nbsp;ha
                </small>
              </td>
              <td @click="isOnline && toggleEditForm(feature.id)" v-else>
                <span class="culture-type" v-if="feature.properties.cultures.length > 1">
                  Multi-cultures<span class="fr-sr-only"> : </span>
                  <small class="feature-precision" v-for="(culture, i) in feature.properties.cultures" :key="i">
                    <span v-if="i" class="fr-sr-only">, </span>{{ cultureLabel(culture) }}
                  </small>
                </span>
                <span class="culture-name" v-else>{{ cultureLabel(feature.properties.cultures[0]) }}</span>
                <small class="feature-precision">{{ featureName(feature) }}</small>
              </td>
              <td @click="isOnline && toggleEditForm(feature.id)">
                <span class="fr-hidden fr-unhidden-sm fr-unhidden-md fr-unhidden-lg fr-unhidden-xl">
                  <ConversionLevel :feature="feature" with-date />
                </span>
              </td>
              <td @click="isOnline && toggleEditForm(feature.id)" class="numeric">
                <span class="fr-hidden fr-unhidden-sm fr-unhidden-md fr-unhidden-lg fr-unhidden-xl">
                  {{ inHa(legalProjectionSurface(feature)) }}&nbsp;ha
                </span>
              </td>
              <td class="actions">
                <button
                    type="button"
                    class="fr-hidden fr-unhidden-sm fr-unhidden-md fr-unhidden-lg fr-unhidden-xl"
                    :class="{'fr-btn': true, 'fr-btn--tertiary-no-outline': true, 'fr-icon-edit-line': true }"
                    @click="toggleEditForm(feature.id)" aria-label="Modifier"
                />

                <ActionDropdown with-icons>
                  <li v-if="permissions.canChangeGeometry && isOnline">
                    <router-link :to="`/exploitations/${operatorStore.operator.numeroBio}/${recordStore.record.record_id}/modifier/${feature.id}`" type="button" class="fr-btn fr-btn--tertiary-no-outline fr-icon-geometry fr-text--sm">
                    Modifier le contour
                  </router-link>
                  </li>
                  <li v-else>
                    <button type="button" disabled class="fr-btn fr-btn--tertiary-no-outline fr-icon-geometry fr-text--sm">
                      Modifier le contour
                    </button>
                  </li>
                  <li>
                    <button
                        type="button"
                        @click.prevent="toggleDeleteForm(feature.id)"
                        :disabled="!permissions.canDeleteFeature"
                        class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-line btn--error fr-text--sm"
                    >
                      Supprimer la parcelle
                    </button>
                  </li>
                </ActionDropdown>
              </td>
            </tr>
          </tbody>
        </table>

        <p :id="`operator-features-summary-${featureGroup.key}`" class="fr-sr-only">
          Liste de {{ featureGroup.features.length }} parcelles cultivées en {{ featureGroup.label.toLocaleLowerCase() }}.
          La première colonne contient le nom de la parcelle ;
          la seconde, son statut de certification et éventuelle date de début de conversion ;
          la troisième, sa surface en hectares ;
          la quatrième et dernière colonne, des boutons d'action.
        </p>
      </td>
    </tr>
  </tbody>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from "vue-router";
import { useOperatorStore } from "@/stores/operator.js"
import { useRecordStore } from "@/stores/record.js"
import { useFeaturesStore } from "@/stores/features.js"
import { useFeaturesSetsStore } from "@/stores/features-sets.js"
import { usePermissions } from "@/stores/permissions.js"

import ConversionLevel from '@/components/records/Table/ConversionLevel.vue'
import ActionDropdown from "@/components/widgets/ActionDropdown.vue"
import { useOnline } from "@vueuse/core"
import { cultureLabel, featureName, inHa, legalProjectionSurface } from "@/utils/features.js"


const route = useRoute()
const operatorStore = useOperatorStore()
const recordStore = useRecordStore()
const featuresStore = useFeaturesStore()
const featuresSets = useFeaturesSetsStore()
const permissions = usePermissions()
const isOnline = useOnline()

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
  }
})
</script>

<style scoped>
.labels {
  min-width: 100%;
}

.actions {
  --hover: transparent;
  --active: transparent;

  padding-left: 0;
  padding-right: 0; /* to text align buttons/texts in this column, and because actions are already padded */
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

tr.group-header td,
tr.group-header th,
tr.intermediate-header th,
tr.parcelle td,
tr.parcelle th {
  padding: .6rem;

  &:has(span.fr-hidden.fr-unhidden-sm) {
    @media (max-width: 579px) {
      padding: 0;
    }
  }

  & > .group-precision {
    display: block;
    color: var(--text-mention-grey);
  }
}

td.numeric,
th.numeric {
  font-variant-numeric: tabular-nums;
  text-align: right !important;
}

tr.group-header td.actions {
  padding: 0;
}

td:has(table) {
  padding: 0;
  background-color: #fff;
}

.group-table {
  margin: 0;
  padding: 0;
  width: 100%;
  display: table;
  overflow: visible;

  & .selection {
    min-width: 2.5rem;
  }
}

.group-table tr.intermediate-header {
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

.group-table tr.parcelle {
  background-color: var(--background-alt-blue-france);
}
.group-table tr.parcelle:nth-child(2n) {
  background-color: var(--background-default-grey);
}
.group-table tr.parcelle:last-child {
  /* same as .fr-table--bordered tbody tr */
  background-size: 100% 2px;
  background-image: linear-gradient(180deg, var(--grey-625-425), var(--grey-625-425));
}

.group-table tr.parcelle :where(.culture-type, .culture-name) {
  display: block;
}

.group-table tr.parcelle span > .feature-precision {
  display: block;
}

.group-table tr.parcelle td > .feature-precision {
  color: var(--text-mention-grey);
}

.group-table tr.parcelle--is-new,
.group-table tr.parcelle--is-new:nth-child(2n) {
  background-color: var(--green-tilleul-verveine-975-75);
}

.fr-icon[aria-checked="true"]::before {
  transform: rotate(180deg);
}

table tr[aria-current="location"] {
  background-color: var(--background-alt-blue-france-hover) !important;

  button, :deep(button) { /* same pattern as in [numeroBio]/index.vue */
    --hover-tint: var(--background-alt-blue-france-active);
  }
}
</style>
