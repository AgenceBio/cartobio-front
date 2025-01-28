<template>
  <component
    :is="Modal"
    v-bind="$attrs"
    icon="fr-icon-checkbox-circle-fill"
    data-track-content
    data-content-name="Modale de certification"
  >
    <template #title>Certifier ce parcellaire</template>

    <h2 class="fr-text--lead">{{ operator.nom }}</h2>

    <form id="sendoff-form" @submit.prevent="emit('submit', { record_id: record.record_id, patch })">
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
        <label class="fr-label" for="certification_date_debut"> Date de début de validité du certificat </label>
        <input
          type="date"
          class="fr-input"
          id="certification_date_debut"
          name="certification_date_debut"
          v-model="patch.certification_date_debut"
          ref="autofocusedElement"
          required
        />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="certification_date_debut"> Date de fin de validité du certificat </label>
        <input
          type="date"
          class="fr-input"
          id="certification_date_debut"
          name="certification_date_debut"
          v-model="patch.certification_date_fin"
          required
        />
      </div>
    </form>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button class="fr-btn" form="sendoff-form">Certifier</button>
        </li>
      </ul>
    </template>
  </component>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useFocus } from "@vueuse/core";
import { certificationDateFin } from "@/referentiels/ab.js";
import { toDateInputString } from "@/utils/dates.js";

import Modal from "@/components/widgets/Modal.vue";

const emit = defineEmits(["submit"]);
const props = defineProps({
  operator: {
    type: Object,
    required: true,
  },
  record: {
    type: Object,
    required: true,
  },
});
const autofocusedElement = ref();
useFocus(autofocusedElement, { initialValue: true });

const startDate = new Date();
const endDate = certificationDateFin.AnneePlusDeux(startDate);

const currentYear = new Date().getFullYear();

const patch = reactive({
  annee_reference_controle: props.record.annee_reference_controle,
  certification_date_debut: props.record.certification_date_debut ?? toDateInputString(startDate),
  certification_date_fin: props.record.certification_date_fin ?? toDateInputString(endDate),
});
</script>

<style scoped>
.fr-select.small {
  width: 30%;
}
</style>
