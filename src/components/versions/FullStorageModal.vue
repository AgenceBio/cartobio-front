<script setup>
import { ref } from "vue";
import { useFocus } from "@vueuse/core";
import Modal from "@/components/widgets/Modal.vue";

defineEmits(["close"]);
const autofocusedElement = ref();
useFocus(autofocusedElement, { initialValue: true });
</script>

<template>
  <Modal @close="$emit('close')" v-bind="$attrs" icon="fr-icon-warning-fill">
    <template #title>Espace de stockage complet</template>

    <p>Vous avez atteint la limite de stockage de votre navigateur.</p>
    <p>Pour télécharger de nouveaux parcellaires, veuillez en supprimer parmi la liste des parcellaires téléchargés.</p>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline">
        <li>
          <router-link to="/exploitations/stockage/" class="fr-btn fr-btn--primary" ref="autofocusedElement"
            >Voir la liste</router-link
          >
        </li>
        <li>
          <button class="fr-btn fr-btn--tertiary" @click="$emit('close')">Annuler</button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<style scoped></style>
