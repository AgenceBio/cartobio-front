<script setup>
import { ref } from "vue";
import { useFocus } from "@vueuse/core";
import Modal from "@/components/widgets/Modal.vue";
import { deleteRecord } from "@/cartobio-api.js";
import toast from "@/utils/toast.js";
import { useOperatorStore } from "@/stores/operator.js";

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const operatorStore = useOperatorStore();
const autofocusedElement = ref();
useFocus(autofocusedElement, { initialValue: true });

async function saveDelete() {
  await deleteRecord(props.record.record_id);
  operatorStore.records = operatorStore.records.filter((record) => record.record_id !== props.record.record_id);
  toast.success("La version a bien été supprimée.");
  emit("close");
}
</script>

<template>
  <Modal @close="$emit('close')" v-bind="$attrs" icon="fr-icon-delete-bin-fill">
    <template #title>Suppression de la version</template>

    <p class="fr-text--lead">{{ record.version_name }}</p>

    <div class="fr-alert fr-alert--warning fr-mb-3w" role="alert">
      La version supprimée sera conservée 30 jours mais ne pourra être restaurée que sur demande explicite au support.
    </div>

    <p>Êtes-vous sûr de vouloir supprimer cette version&nbsp;?</p>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--icon-left">
        <li>
          <button class="fr-btn fr-icon-delete-bin-line" @click="saveDelete" ref="autofocusedElement">Supprimer</button>
        </li>
        <li>
          <button class="fr-btn fr-btn--tertiary" @click="$emit('close')">Annuler</button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<style scoped></style>
