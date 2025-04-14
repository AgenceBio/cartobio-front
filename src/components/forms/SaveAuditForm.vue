<template>
  <component
    :is="Modal"
    v-bind="$attrs"
    icon="fr-icon-checkbox-circle-fill"
    data-track-content
    data-content-name="Modale d'enregistrement d'audit"
  >
    <template #title>Terminer l'audit</template>

    <h2 class="fr-text--lead">{{ operator.nom }}</h2>

    <div v-if="dateConflict" class="fr-alert fr-alert--error fr-mb-2w">
      <p class="fr-text--sm">
        L'audit de la version
        <router-link
          :to="`/exploitations/${operator.numeroBio}/${dateConflict.record_id}`"
          :title="`Consulter la version ${dateConflict.version_name}`"
        >
          {{ dateConflict.version_name }}
        </router-link>
        a déjà été terminé aujourd'hui.
      </p>
      <p class="fr-text--sm">
        Deux versions ne peuvent pas avoir la même date d'audit. Vous devez supprimer l'autre version ou modifier sa
        date d'audit pour terminer cet audit.
      </p>
    </div>

    <form id="sendoff-form" @submit.prevent="emit('submit', { patch })">
      <div class="fr-input-group">
        <label for="annee_reference_controle" class="fr-label">Année de référence contrôle</label>
        <select
          class="fr-select small"
          name="annee_reference_controle"
          id="annee_reference_controle"
          v-model="patch.annee_reference_controle"
        >
          <option :value="currentYear" :key="currentYear">{{ currentYear }}</option>
          <option :value="currentYear - 1" :key="currentYear - 1">{{ currentYear - 1 }}</option>
          <option :value="currentYear - 2" :key="currentYear - 2">{{ currentYear - 2 }}</option>
        </select>
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="audit_notes"> Notes finales de l'audit </label>
        <textarea
          class="fr-input"
          id="audit_notes"
          name="audit_notes"
          v-model="patch.audit_notes"
          ref="autofocusedElement"
        />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="audit_demandes"> Mémo à l'attention de l'exploitant·e </label>
        <textarea class="fr-input" id="audit_demandes" name="audit_demandes" v-model="patch.audit_demandes" />
      </div>
    </form>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button
            class="fr-btn"
            form="sendoff-form"
            :disabled="dateConflict"
            aria-label="Terminer l'audit du parcellaire"
          >
            Terminer
          </button>
        </li>
      </ul>
    </template>
  </component>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useFocus } from "@vueuse/core";

import Modal from "@/components/widgets/Modal.vue";
import { useOperatorStore } from "@/stores/operator.js";
import { useRecordStore } from "@/stores/record.js";
import { storeToRefs } from "pinia";

const emit = defineEmits(["submit"]);

const operatorStore = useOperatorStore();
const recordStore = useRecordStore();
const { operator } = storeToRefs(operatorStore);
const { record } = recordStore;

const autofocusedElement = ref();
useFocus(autofocusedElement, { initialValue: true });

const currentYear = new Date().getFullYear();

const dateConflict = computed(() => {
  const today = new Date().toISOString().split("T")[0];
  return operatorStore.records.find((record) => record.audit_date === today);
});

const patch = reactive({
  annee_reference_controle: record.annee_reference_controle,
  audit_notes: record.audit_notes,
  audit_demandes: record.audit_demandes,
});
</script>

<style scoped>
.fr-select.small {
  width: 30%;
}
</style>
