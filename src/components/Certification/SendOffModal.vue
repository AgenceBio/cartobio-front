<template>
  <component :is="Modal" v-bind="$attrs" icon="fr-icon-checkbox-circle-fill" data-track-content data-content-name="Modale d'enregistrement d'audit">
    <template #title>Terminer l'audit</template>

    <h2 class="fr-text--lead">{{ operator.nom }}</h2>

    <form id="sendoff-form" @submit.prevent="emit('submit', { record_id: record.record_id, patch })">
      <div class="fr-input-group">
        <label class="fr-label" for="audit_notes">
          Notes finales de l'audit
        </label>
        <textarea class="fr-input" id="audit_notes" name="audit_notes" v-model="patch.audit_notes" />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="audit_demandes">
          Mémo à l'attention de l'exploitant·e
        </label>
        <textarea class="fr-input" id="audit_demandes" name="audit_demandes" v-model="patch.audit_demandes" />
      </div>
    </form>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button class="fr-btn" form="sendoff-form">
            Enregistrer
          </button>
        </li>
      </ul>
    </template>
  </component>
</template>

<script setup>
import { reactive } from 'vue'

import Modal from '@/components/Modal.vue'

const emit = defineEmits(['submit'])
const props = defineProps({
  operator: {
    type: Object,
    required: true
  },
  record: {
    type: Object,
    required: true
  }
})

const patch = reactive({
  audit_notes: props.record.audit_notes,
  audit_demandes: props.record.audit_demandes
})
</script>
