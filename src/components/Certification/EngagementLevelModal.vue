<template>
  <Modal
    v-bind="$attrs"
    icon="fr-icon-calendar-2-line"
  >
    <template #title>
      Modification du niveau de conversion
    </template>

    <div class="fr-alert fr-alert--info fr-my-3w">
      <p>
        Cette modification impactera <b>{{ selectedIds.length }} parcelles</b>.
      </p>
    </div>

    <form
      id="mass-edit-form"
      @submit.prevent="emit('submit', { ids: selectedIds, patch })"
    >
      <ConversionLevelSelector v-model="patch.conversion_niveau" />
    </form>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button
            class="fr-btn"
            form="mass-edit-form"
          >
            Enregistrer
          </button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<script setup>
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useFeaturesStore } from '@/stores/features.js'

import Modal from '@/components/Modal.vue'
import ConversionLevelSelector from "@/components/Features/ConversionLevelSelector.vue";

defineProps({ })
const emit = defineEmits(['submit'])

const store = useFeaturesStore()
const { selectedIds } = storeToRefs(store)

const patch = reactive({
  conversion_niveau: '',
})


</script>
