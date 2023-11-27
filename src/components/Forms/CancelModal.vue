<script setup>
import Modal from "@/components/Modal.vue"

defineEmits(['close', 'save'])
</script>

<template>
  <Modal @close="$emit('close')">
    <template #title>Modification non enregistrées</template>

    <div class="fr-alert fr-alert--warning">
      <p>
        Vous êtes sur le point de fermer votre formulaire sans avoir enregistré vos modifications.
        Voulez-vous vraiment quitter ?
      </p>
    </div>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button class="fr-btn" @click="$emit('save')">
            Enregistrer
          </button>
        </li>
        <li>
          <button class="fr-btn fr-btn--secondary" @click="$emit('close')">
            Quitter
          </button>
        </li>
      </ul>
    </template>
  </Modal>
</template>
