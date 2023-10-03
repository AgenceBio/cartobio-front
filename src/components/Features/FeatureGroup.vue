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
      <td class="actions"><span :class="{ 'fr-icon fr-icon-warning-fill fr-icon--warning': validation.total !== validation.success }" /></td>
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
          Multi-cultures
          <small class="feature-precision" v-for="(culture, i) in feature.properties.cultures" :key="i">
            {{ cultureLabel(culture) }}
          </small>
        </span>
        <small class="feature-precision">{{ featureName(feature) }}</small>
      </td>
      <td @click="toggleEditForm(feature.id)">
        <ConversionLevel :feature="feature" with-date />
      </td>
      <td @click="toggleEditForm(feature.id)" class="numeric">{{ inHa(surface(feature)) }}&nbsp;ha</td>
      <td class="actions">
        <button type="button" :class="{'fr-btn': true, 'fr-btn--tertiary-no-outline': true, 'fr-icon-edit-line': !hasError(feature.id), 'fr-icon-edit-box-fill': hasError(feature.id), 'fr-icon--warning': hasError(feature.id)}" @click="toggleEditForm(feature.id)">
          Modifier
        </button>

        <button type="button" class="fr-btn fr-btn--tertiary-no-outline fr-icon-more-fill show-actions" @click="toggleFeatureMenu(feature.id)">
          Autres actions
        </button>

        <div class="fr-menu" ref="actionsMenuRef" v-if="activeFeatureMenu === feature.id">
          <ul class="fr-menu__list fr-btns-group fr-btns-group--icon-left">
            <li v-if="permissions.canDeleteFeature">
              <button type="button" @click.prevent="toggleDeleteForm(feature.id)" class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-line btn--error">
                Supprimer la parcelle
              </button>
            </li>
          </ul>
        </div>
      </td>
    </tr>
  </tbody>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { featureName, cultureLabel, inHa, surface } from '@/components/Features/index.js'
import { applyValidationRules } from '@/referentiels/ab.js'
import ConversionLevel from './ConversionLevel.vue'
import { useRoute } from "vue-router";
import { useFeaturesStore, usePermissions } from '@/stores/index.js'
import { onClickOutside } from '@vueuse/core'

const route = useRoute()
const featuresStore = useFeaturesStore()
const permissions = usePermissions()

const props = defineProps({
  featureGroup: {
    type: Object,
    required: true
  },
  validationRules: {
    type: Object,
    required: true,
  }
})

const emit = defineEmits(['edit:featureId', 'delete:featureId'])

const activeFeatureMenu = ref(null)
const actionsMenuRef = ref(null)
const { selectedIds, hoveredId } = storeToRefs(featuresStore)
const { toggleSingleSelected } = featuresStore

const featureIds = computed(() => props.featureGroup.features.map(({ id }) => id))
const open = ref(featureIds.value.includes(Number(route.query?.new)))
const allSelected = computed(() => featureIds.value.every(id => selectedIds.value.includes(id)))
const isGroupedByCulture = computed(() => props.featureGroup.pivot === 'CULTURE')
const validation = computed(() => applyValidationRules(props.validationRules.rules, ...props.featureGroup.features))

function hasError (featureId) {
  return validation.value.features[featureId]?.failures > 0
}

function toggleEditForm (featureId) {
  return emit('edit:featureId', featureId)
}

function toggleFeatureMenu (featureId) {
  activeFeatureMenu.value = activeFeatureMenu.value ? null : featureId

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

onClickOutside(actionsMenuRef, ({ target }) => {
  if (!target.classList.contains('show-actions')) {
    activeFeatureMenu.value = null
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

  .subtable {
    padding: 0;
  }

  .subtable table,
  .subtable tbody {
    width: 100%;
  }

.fr-icon[aria-checked="true"]::before {
  transform: rotate(180deg);
}

table tr[aria-current="location"] {
  background-color: var(--background-alt-blue-france-hover) !important;
}

.actions {
  position: relative;
  text-align: center;

  .fr-menu {
    position: absolute;
    left: 100%;
    top: .6rem;
  }

  .fr-menu .fr-btn {
    margin: 0;
    width: 100%;
  }
}

.fr-icon--warning {
  color: var(--text-default-error);
}
</style>
