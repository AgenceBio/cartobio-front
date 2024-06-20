<script setup>
import { ref } from 'vue'
import Modal from "@/components/widgets/Modal.vue"
import { useFocus } from '@vueuse/core'

defineEmits(['close', 'cancel'])
const autofocusedElement = ref()
useFocus(autofocusedElement, { initialValue: true })
</script>

<template>
  <Modal @close="$emit('close')" no-close-button>
    <template #title>Modifications non enregistrées</template>

    <div class="fr-alert fr-alert--warning">
      <p>
        Vous êtes sur le point de fermer votre formulaire sans avoir enregistré vos modifications.
        Voulez-vous vraiment quitter ?
      </p>
    </div>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button class="fr-btn" @click="$emit('cancel')" ref="autofocusedElement">
            Revenir au formulaire
          </button>
        </li>
        <li>
          <button class="fr-btn fr-btn--secondary" @click="$emit('close')">
            Annuler les modifications
          </button>
        </li>
      </ul>
    </template>
  </Modal>
</template>
