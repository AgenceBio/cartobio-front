<script setup>
import { computed, ref } from "vue";
import Modal from "@/components/widgets/Modal.vue";
import { useFocus } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { usePreferences } from "@/stores/preferences";

const emit = defineEmits(["close"]);
const autofocusedElement = ref();
useFocus(autofocusedElement, { initialValue: true });
const preferences = usePreferences();

const { params: mapParams } = storeToRefs(preferences);

const props = defineProps({
  targetMode: {
    type: String,
    required: true,
  },
});

const modeName = computed(() => {
  switch (mapParams.value.currentMode) {
    case "edit":
      return "de modification des contours";
    case "draw":
      return "d'ajout de parcelle";
    case "decouper":
      return "de découpe de bordure";
    case "divide":
      return "de division de parcelle";
    case "fusionner":
      return "de fusion de parcelles";
    default:
      return "modification de parcelle";
  }
});

const changeMode = () => {
  mapParams.value.currentMode = props.targetMode;
  emit("close");
};
</script>

<template>
  <Modal @close="$emit('close')" no-close-button>
    <template #title>Modifications non enregistrées</template>

    <div class="fr-alert fr-alert--warning">
      <p>
        Vous êtes sur le point de fermer le module {{ modeName }} sans avoir enregistré vos modifications. Voulez-vous
        vraiment quitter ?
      </p>
    </div>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button class="fr-btn" @click="$emit('close')" ref="autofocusedElement">Revenir au module</button>
        </li>
        <li>
          <button class="fr-btn fr-btn--secondary" @click="changeMode()">Annuler les modifications</button>
        </li>
      </ul>
    </template>
  </Modal>
</template>
