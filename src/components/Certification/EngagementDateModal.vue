<template>
  <Modal v-bind="$attrs">
    <template #title>Modification de la date d'engagement</template>

    <div class="fr-alert fr-alert--info fr-my-3w">
      <p>
        Cette modification impactera <b>{{ selectedIds.length }} parcelles</b>.
      </p>
    </div>

    <form id="mass-edit-form" @submit.prevent="emit('submit', { ids: selectedIds, patch })">
      <div class="fr-input-group">
        <label class="fr-label">Date d'engagement</label>
        <div class="fr-input-wrap fr-icon-calendar-line">
          <input type="date" class="fr-input" v-model="patch.engagement_date" name="engagement_date" min="1985-01-01" :max="maxDate" required />
        </div>
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

const props = defineProps({ })
const emit = defineEmits(['submit'])

const store = useFeaturesStore()
const { selectedIds } = storeToRefs(store)

const patch = reactive({
  engagement_date: '',
})

const maxDate = computed(() => new Date().toISOString().split('T').at(0))
</script>
