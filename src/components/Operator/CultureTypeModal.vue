<template>
  <Modal v-bind="$attrs">
    <template #title>Modification du type de culture</template>

    <div class="fr-alert fr-alert--info fr-my-3w">
      <p>
        Cette modification impactera <b>{{ selectedIds.length }} parcelles</b>.
      </p>
    </div>

    <form id="mass-edit-form" @submit.prevent="emit('submit', { ids: selectedIds, patch })">
      <div class="fr-input-group">
        <CultureSelector :cultures="patch.cultures" @change="$cultures => patch.cultures = $cultures" />
      </div>
    </form>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button class="fr-btn" form="mass-edit-form">
            Enregistrer
          </button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useFeaturesStore } from '@/stores/features.js'

import Modal from '@/components/Modal.vue'
import CultureSelector from "@/components/Features/CultureSelector.vue";

defineProps({ })
const emit = defineEmits(['submit'])

const store = useFeaturesStore()
const { selectedIds, selectedFeatures } = storeToRefs(store)

const commonValues = computed(() => {
  return selectedFeatures.value.reduce((acc, feature) => {
    if (acc === null) {
      return {
        CPF: feature.properties.CPF,
        TYPE: feature.properties.TYPE
      }
    }

    return {
      CPF: acc.CPF === feature.properties.CPF ? acc.CPF : '',
      TYPE: acc.TYPE === feature.properties.TYPE ? acc.TYPE : ''
    }
  }, null)
})


const patch = reactive({
  CPF: commonValues.value.CPF,
  cultures: []
})
</script>
