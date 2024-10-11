<template>
  <Modal v-bind="$attrs" data-track-content data-content-name="Modale de modification multiple de la culture">
    <template #title>Modification du type de culture</template>

    <div class="fr-alert fr-alert--info fr-my-3w">
      <p>
        Cette modification impactera <b>{{ selectedIds.length }} parcelles</b>.
      </p>
    </div>

    <form id="mass-edit-form" @submit.prevent="emit('submit', { ids: selectedIds, patch })">
      <div class="fr-input-group">
        <CultureSelector :cultures="patch.cultures" @change="($cultures) => (patch.cultures = $cultures)" />
      </div>
    </form>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button class="fr-btn" form="mass-edit-form">Enregistrer</button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<script setup>
import { reactive } from "vue";
import { storeToRefs } from "pinia";
import { useFeaturesStore } from "@/stores/features.js";

import Modal from "@/components/widgets/Modal.vue";
import CultureSelector from "@/components/forms/fields/CultureSelector.vue";

defineProps({});
const emit = defineEmits(["submit"]);

const store = useFeaturesStore();
const { selectedIds } = storeToRefs(store);

const patch = reactive({
  cultures: [{ CPF: "" }],
});
</script>
