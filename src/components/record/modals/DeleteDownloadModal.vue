<template>
  <Modal @close="emit('close')" data-track-content data-content-name="Modale de suppression d'un téléchargement de parcellaire">
    <template #title>Supprimer des téléchargements</template>

    <p>
      Cette version du parcellaire ne sera plus disponible hors connexion
    </p>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button class="fr-btn" @click="handleDelete" ref="autofocusedElement">
            Supprimer
          </button>
        </li>
        <li>
          <button class="fr-btn fr-btn--secondary" @click="$emit('close')">
            Annuler
          </button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from "@/components/Modal.vue"
import { useFocus } from '@vueuse/core'
import { useCartoBioStorage } from "@/stores/storage.js"

const props = defineProps({
  recordId: {
    type: String,
    required: true
  },
})
const emit = defineEmits(['close'])

const storage = useCartoBioStorage()
const autofocusedElement = ref()
useFocus(autofocusedElement, { initialValue: true })

async function handleDelete() {
  storage.clearRecord(props.recordId)
  emit('close')
}
</script>
