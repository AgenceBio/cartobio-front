<template>
  <Modal
    v-bind="$attrs"
    icon="fr-icon-calendar-2-line"
    data-track-content
    data-content-name="Modale de modification multiple du niveau de conversion"
  >
    <template #title>Suppression de parcelles</template>

    <div class="fr-alert fr-alert--info fr-my-3w">
      <p>
        Cette modification impactera <b>{{ selectedIds.length }} parcelle{{ selectedIds.length > 1 ? "s" : "" }}</b
        >.
      </p>
    </div>

    <div class="fr-alert fr-alert--error fr-alert--sm">
      <p>Cette action est irréversible.</p>
    </div>

    <form id="delete-feature-form" class="fr-my-3w" @submit.prevent="validateForm" novalidate>
      <div class="fr-input-group" :class="{ 'fr-input-group--error': requiredError }">
        <label for="deletion-reason" class="fr-label"
          >Raison de la suppression <span class="fr-hint-text">Ce champ est obligatoire</span></label
        >
        <select
          id="deletion-reason"
          name="code"
          class="fr-select"
          :class="{ 'fr-input--error': requiredError }"
          v-model="reason.code"
          ref="autofocusedElement"
          required
        >
          <option v-for="{ code, label } in deletionReasons" :value="code" :key="code">
            {{ label }}
          </option>
        </select>
        <p class="fr-error-text" v-if="requiredError">
          Vous devez sélectionner une raison de suppression dans la liste.
        </p>
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="deletion-details"> Préciser votre motif (facultatif) </label>
        <textarea class="fr-input" id="deletion-details" name="details" v-model="reason.details" />
      </div>
    </form>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg fr-btns-group--icon-left">
        <li>
          <button class="fr-btn fr-icon-delete-line" form="delete-feature-form">
            Supprimer {{ selectedIds.length > 1 ? "les" : "la" }} parcelle{{ selectedIds.length > 1 ? "s" : "" }}
          </button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useFeaturesStore } from "@/stores/features.js";
import { deletionReasons } from "@/utils/features.js";
import { useFocus } from "@vueuse/core";

import Modal from "@/components/widgets/Modal.vue";

defineProps({});
const emit = defineEmits(["submit"]);

const store = useFeaturesStore();
const { selectedIds } = storeToRefs(store);

const reason = reactive({
  code: "",
  details: "",
});

const autofocusedElement = ref();
useFocus(autofocusedElement, { initialValue: true });
const requiredError = ref(false);
watch(
  () => reason.code,
  () => {
    requiredError.value = false;
  },
);
const validateForm = () => {
  if (reason.code === "") {
    requiredError.value = true;
    return;
  }

  emit("submit", reason);
};
</script>
