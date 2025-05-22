<script setup>
import Modal from "@/components/widgets/Modal.vue";
import { useCartoBioStorage } from "@/stores/storage.js";
import { useRecordStore } from "@/stores/record.js";
import { ref } from "vue";

const emit = defineEmits(["close"]);
const props = defineProps({
  recordId: {
    type: String,
    required: true,
  },
});

const storage = useCartoBioStorage();
const newRecord = await useRecordStore().getRecord(props.recordId);

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

async function cancel() {
  await storage.cancelConflict(props.recordId);
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
    <p v-if="!newRecord.certification_state === 'CERTIFIED'">
      Souhaitez-vous tout de même appliquer les changements faits hors-ligne sur cette version ?
    </p>
    <p v-else>
      Celui-ci est à présent certifié, il n'est donc plus possible de le modifier. Souhaitez-vous créer une nouvelle
      version ? Sinon, vous pouvez annuler vos changements qui seront alors perdus.
    </p>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline">
        <li>
          <button class="fr-btn" @click="duplicate">
            <div v-if="isNewVersionLoading">
              <Spinner :hint="'Cela peut prendre quelques secondes...'">Création en cours... </Spinner>
            </div>
            <p v-else>Créer une nouvelle version</p>
          </button>
        </li>
        <li>
          <button
            class="fr-btn fr-btn--tertiary"
            @click="merge"
            aria-label="Appliquer les changements sur la version existante"
            v-if="!newRecord.certification_state === 'CERTIFIED'"
          >
            Appliquer vos changements
          </button>
          <button
            class="fr-btn fr-btn--tertiary"
            @click="cancel"
            aria-label="Appliquer les changements sur la version existante"
            v-else
          >
            Annuler vos changements
          </button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<style scoped></style>
