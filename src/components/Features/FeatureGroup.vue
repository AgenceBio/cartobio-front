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
      <th scope="row" colspan="2">{{ featureGroup.label }}</th>
      <td class="numeric">{{ inHa(featureGroup.surface) }}&nbsp;ha</td>
      <td class="actions"><span :class="['fr-icon', 'fr-icon-edit-fill', groupValidationClass]" /></td>
    </tr>
    <tr :hidden="!open" class="intermediate-header">
      <th scope="col" colspan="2"></th>
      <th scope="col" v-if="featureGroup.pivot === 'CULTURE'">Nom</th>
      <th scope="col" v-else>Culture</th>
      <th scope="col">Certification</th>
      <th scope="col" colspan="2"></th>
    </tr>
    <tr class="parcelle clickable" :id="'parcelle-' + feature.id" :hidden="!open" v-for="feature in featureGroup.features" :key="feature.id" @mouseover="emit('update:hoveredId', feature.id)" @click="toggleEditForm(feature.id)" :aria-current="feature.id === hoveredId ? 'location' : null">
      <th scope="row">
        <div class="fr-checkbox-group single-checkbox">
          <input type="checkbox" :id="'radio-' + feature.id" :checked="selectedIds.includes(feature.id)" @click.stop="emit('toggle:singleFeatureId', feature.id)" />
          <label class="fr-label" :for="'radio-' + feature.id" />
        </div>
      </th>
      <td></td>
      <td v-if="featureGroup.pivot === 'CULTURE'">{{ featureName(feature) }}</td>
      <td v-else>
        <span class="culture-type">{{ libelléFromCode(feature.properties.TYPE) }}</span>
        <small class="culture-precision">{{ featureName(feature) }}</small>
      </td>
      <td>
        <ConversionLevel :feature="feature" with-date />
      </td>
      <td class="numeric">{{ inHa(surface(feature)) }}&nbsp;ha</td>
      <td class="actions">
        <span class="fr-icon fr-icon-edit-line" aria-role="button" />
      </td>
    </tr>
  </tbody>
</template>

<script setup>
import { computed, ref, unref, watch } from 'vue'
import { surface, inHa, featureName } from '@/components/Features/index.js'
import { libelléFromCode } from '@/referentiels/pac.js'
import { applyValidationRules } from '@/referentiels/ab.js'
import ConversionLevel from './ConversionLevel.vue'

const props = defineProps({
  featureGroup: {
    type: Object,
    required: true
  },
  hoveredId: {
    type: [Number, String, null],
    required: true
  },
  selectedIds: {
    type: Array,
    required: true
  },
  validationRules: {
    type: Object,
    required: true,
  }
})

const emit = defineEmits(['update:hoveredId', 'update:selectedIds', 'toggle:singleFeatureId', 'edit:featureId'])
const open = ref(false)

const featureIds = computed(() => props.featureGroup.features.map(({ id }) => id))
const allSelected = computed(() => featureIds.value.every(id => props.selectedIds.includes(id)))
const groupValidationClass = computed(() => {
  const validation = applyValidationRules(props.validationRules.rules, ...props.featureGroup.features)
  return validation.total === validation.success ? `fr-icon-success-line ${props.validationRules.success}` : `fr-icon-warning-fill ${props.validationRules.error}`
})

function toggleEditForm (featureId) {
  return emit('edit:featureId', featureId)
}

function toggleFeatureGroup () {
  // we uncheck them
  if (allSelected.value) {
    emit('update:selectedIds', props.selectedIds.filter(id => !featureIds.value.includes(id)))
  }
  else {
    emit('update:selectedIds', props.selectedIds.concat(Array.from(unref(featureIds.value))))
  }
}

watch(() => props.selectedIds, (selectedIds, prevSelectedIds) => {
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

  .fr-table tr.parcelle .culture-type {
    display: block;
  }

  .fr-table tr.parcelle .culture-precision {
    color: var(--text-mention-grey);
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
    text-align: center;
  }

.fr-icon--success {
  color: var(--text-default-success);
}

.fr-icon--neutral {
  color: transparent;
}

.fr-icon--warning {
  color: var(--text-default-warning);
}
</style>
