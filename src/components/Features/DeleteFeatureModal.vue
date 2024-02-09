<template>
  <Modal v-bind="$attrs" data-track-content data-content-name="Modale de suppression de parcelle" icon="fr-icon-delete-line">
    <template #title>Suppression de parcelle</template>

    <p class="fr-text--lg">
      {{ featureName(feature) }}
      ({{ inHa(surface(feature)) }} ha)
    </p>

    <div class="fr-alert fr-alert--error fr-alert--sm">
      <p>Cette action est irréversible.</p>
    </div>

    <form id="delete-feature-form" class="fr-my-3w" @submit.prevent="validateForm" novalidate>
      <div class="fr-input-group" :class="{ 'fr-input-group--error': requiredError }">
        <label for="deletion-reason" class="fr-label">Raison de la suppression
          <span class="fr-hint-text">Ce champ est obligatoire</span></label>
        <select id="deletion-reason" name="code" class="fr-select" :class="{ 'fr-input--error': requiredError }" v-model="reason.code" required>
          <option v-for="({ code, label }) in deletionReasons" :value="code" :key="code">
            {{ label }}
          </option>
        </select>
        <p class="fr-error-text" v-if="requiredError">Vous devez sélectionner une raison de suppression dans la liste.</p>
      </div>

      <div class="fr-input-group" v-if="isOther">
        <label class="fr-label" for="deletion-details">
          Préciser votre motif (facultatif)
        </label>
        <textarea class="fr-input" id="deletion-details" name="details" v-model="reason.details" />
      </div>
    </form>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg fr-btns-group--icon-left">
        <li>
          <button class="fr-btn fr-icon-delete-line" form="delete-feature-form">
            Supprimer la parcelle
          </button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { deletionReasons, DeletionReasonsCode, featureName, inHa, surface } from '@/components/Features/index.js'
import { useFeaturesStore } from '@/stores/features.js'

import Modal from '@/components/Modal.vue'

const props = defineProps({
  featureId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['submit'])

const store = useFeaturesStore()
const feature = computed(() => store.getFeatureById(props.featureId))
const isOther = computed(() => reason.code === DeletionReasonsCode.OTHER)

const reason = reactive({
  code: '',
  details: ''
})

const requiredError = ref(false)
watch(() => reason.code, () => {
  requiredError.value = false
})
const validateForm = () => {
  if (reason.code === '') {
    requiredError.value = true
    return
  }

  emit('submit', { id: props.featureId, reason })
}
</script>
