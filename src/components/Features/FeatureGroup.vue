<template>
  <tbody>
    <tr @click.stop="open = !open" class="clickable">
      <td>
        <div class="fr-checkbox-group single-checkbox">
          <input type="checkbox" :id="'radio-'+ featureGroup.key" :checked="allSelected" @click="toggleFeatureGroup" />
          <label class="fr-label" :for="'radio-'+ featureGroup.key" />
        </div>
      </td>
      <th scope="row" colspan="3">
        <span class="fr-icon fr-icon fr-icon-arrow-right-s-fill" :aria-checked="open" aria-role="button" />
        {{ featureGroup.label }}
      </th>
      <td class="numeric">{{ inHa(featureGroup.surface) }}&nbsp;ha</td>
    </tr>
    <tr :hidden="!open" class="intermediate-header">
      <th scope="col" class="fr-text--xs"></th>
      <th scope="col" class="fr-text--xs">Nom</th>
      <th scope="col" class="fr-text--xs">Certification</th>
      <th scope="col" colspan="2" class="numeric fr-text--xs">Surface graphique</th>
    </tr>
    <tr class="parcelle" :id="'parcelle-' + feature.id" :hidden="!open" v-for="feature in featureGroup.features" :key="feature.id" @mouseover="emit('update:hoveredId', feature.id)" @click.prevent.stop="toggleSelectedIds(feature.id)" :aria-current="feature.id === hoveredId ? 'location' : null">
      <th scope="row">
        <div class="fr-checkbox-group single-checkbox">
          <input type="checkbox" :id="'radio-' + feature.id" :checked="selectedIds.includes(feature.id)" @click.stop="toggleSelectedIds(feature.id)" />
          <label class="fr-label" :for="'radio-' + feature.id" />
        </div>
      </th>
      <td>
        <span v-if="feature.properties.NUMERO_I">Ilot {{ feature.properties.NUMERO_I }}<span v-if="feature.properties.NUMERO_P">, parcelle {{ feature.properties.NUMERO_P }}</span></span>
        <span v-else>{{ feature.properties.NOM }}</span>
      </td>
      <td>
        <ConversionLevel :feature="feature" />
      </td>
      <td class="fr-px-0">
        <!-- <span class="fr-icon fr-icon-message-2-line fr-text-label--green-tilleul-verveine" aria-role="button" /> -->
      </td>
      <td class="numeric">{{ inHa(surface(feature)) }}&nbsp;ha</td>
    </tr>
  </tbody>
</template>

<script setup>
import { computed, ref, unref, watch } from 'vue'
import { surface, inHa } from '@/components/Features/index.js'
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
  }
})

const emit = defineEmits(['update:hoveredId', 'update:selectedIds'])
const open = ref(false)

const featureIds = computed(() => props.featureGroup.features.map(({ id }) => id))
const allSelected = computed(() => featureIds.value.every(id => props.selectedIds.includes(id)))

function toggleSelectedIds (featureId) {
  return props.selectedIds.includes(featureId)
    ? emit('update:selectedIds', props.selectedIds.filter(id => id !== featureId))
    : emit('update:selectedIds', props.selectedIds.concat(featureId))
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
  .fr-table tr.intermediate-header th {
    padding-top: .5rem;
    padding-bottom: .5rem;
  }
  .fr-table td.numeric,
  .fr-table th.numeric {
    font-variant-numeric: tabular-nums;
    text-align: right !important;
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

  .subtable {
    padding: 0;
  }
    .subtable table,
    .subtable tbody {
      width: 100%;
    }
  .clickable {
    cursor: pointer;
  }

  .fr-icon[aria-checked="true"]::before {
    transform: rotate(90deg);
  }

  table tr[aria-current="location"] {
    background-color: #00ffff50 !important;
    cursor: pointer;
  }
</style>
