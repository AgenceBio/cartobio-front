<script setup>
import Modal from "@/components/widgets/Modal.vue";
import { useCartoBioStorage } from "@/stores/storage.js";

const emit = defineEmits(["close"]);
const props = defineProps({
  recordId: {
    type: String,
    required: true,
  },
});

const storage = useCartoBioStorage();
const isNewVersionLoading = ref(false);

async function duplicate() {
  isNewVersionLoading.value = true;
  await storage.resolveConflict(props.recordId, true);
  isNewVersionLoading.value = false;
  emit("close");
}

async function merge() {
  await storage.resolveConflict(props.recordId, false);
  emit("close");
}
</script>

<template>
  <Modal @close="$emit('close')" v-bind="$attrs" icon="fr-icon-warning-fill">
    <template #title>Conflit entre versions</template>
    <p>
      Il semblerait qu’une autre personne ait effectué des modifications sur un parcellaire pendant que vous le modifiez
      hors-ligne :
    </p>
    <p>
      Version : <b>{{ storage.records[recordId].version_name }}</b> de l’exploitation
      <b>{{ storage.operators[storage.records[recordId].numerobio].nom }}</b
      ><br />
    </p>
    <p>Souhaitez-vous tout de même appliquer les changements faits hors-ligne sur cette version ?</p>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline">
        <li>
          <button class="fr-btn" @click="duplicate">
            <div v-if="isNewVersionLoading">
              <Spinner :hint="'Cela peut prendre quelques secondes...'"> Création en cours... </Spinner>
            </div>
            <span> <p>Créer une nouvelle version</p> </span>
          </button>
        </li>
        <li>
          <button
            class="fr-btn fr-btn--tertiary"
            @click="merge"
            aria-label="Appliquer les changements sur la version existante"
            :disabled="storage.records[recordId].certification_state === 'CERTIFIED'"
          >
            Appliquer les changements
          </button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<style scoped></style>
