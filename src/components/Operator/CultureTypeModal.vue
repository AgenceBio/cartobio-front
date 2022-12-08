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
        <label class="fr-label">Nouveau type de culture</label>
        <select class="fr-select" name="culture" v-model="patch.TYPE" required>
          <option v-for="([code, libellé]) in codesPac" :key="code" :value="code">
            {{ libellé }}
          </option>
        </select>
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
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useFeaturesStore } from '@/stores/features.js'
import { liste as codesPac } from '@/referentiels/pac.js'

import Modal from '@/components/Modal.vue'

const props = defineProps({ })
const emit = defineEmits(['submit'])

const store = useFeaturesStore()
const { selectedIds } = storeToRefs(store)

const patch = reactive({
  TYPE: '',
})
</script>

<style scoped>
</style>
