<script setup>
import { ref, computed } from "vue";
import { useFocus } from "@vueuse/core";
import Modal from "@/components/widgets/Modal.vue";
import { useOperatorStore } from "@/stores/operator.js";
import { useRecordStore } from "@/stores/record.js";
import { sources } from "@/referentiels/imports.js";
import { createOperatorRecord } from "@/cartobio-api.js";
import { useRouter } from "vue-router";
import { jjmmyyyy } from "@/utils/dates";
import { inHa } from "@/utils/features.js";
import State from "@/components/records/State.vue";
import toast from "@/utils/toast.js";

const router = useRouter();
const operatorStore = useOperatorStore();
const recordStore = useRecordStore();
const autofocusedElement = ref();
const selectedOption = ref(null);
const selectedRecord = ref(null);

useFocus(autofocusedElement, { initialValue: true });

const sortedRecords = computed(() => operatorStore.records);

async function createEmptyVersion() {
  recordStore.update(
    await createOperatorRecord(operatorStore.operator.numeroBio, {
      parcelles: { type: "FeatureCollection", features: [] },
      metadata: {
        provenance: window.location.host,
        source: sources.MANUAL,
        warnings: [],
      },
    }),
  );

  await router.push(`/exploitations/${operatorStore.operator.numeroBio}/${recordStore.record.record_id}`);
}

const handleSubmit = async () => {
  if (selectedOption.value === "import") {
    await router.push(`${operatorStore.operator.numeroBio}/import`);
  } else if (selectedOption.value === "empty") {
    await createEmptyVersion();
  } else if (selectedOption.value === "duplicate" && selectedRecord.value) {
    const result = await recordStore.duplicate(selectedRecord.value.record_id);
    if (result) toast.success("La version a été dupliquée");
    emit("close");
  }
};
</script>

<template>
  <Modal large @close="$emit('close')" v-bind="$attrs" icon="fr-icon-add-line">
    <template #title>Créer une nouvelle version</template>
    <p>Il existe plusieurs façons de créer une nouvelle version du parcellaire.</p>

    <fieldset class="fr-fieldset" aria-labelledby="radio-versions">
      <legend class="fr-fieldset__legend--regular fr-fieldset__legend" id="radio-versions-legend">
        Choisissez un mode de création
      </legend>
      <div class="fr-fieldset__element">
        <div class="fr-radio-group">
          <input type="radio" id="import-version" value="import" v-model="selectedOption" ref="autofocusedElement" />
          <label class="fr-label" for="import-version">
            Importer un parcellaire informatisé
            <span class="fr-hint-text">
              Importez via votre déclaration <b>PAC</b>, le dossier <b>nCVI</b>, <b>MesParcelles</b> ou <b>Geofolia</b>.
            </span>
          </label>
        </div>
      </div>

      <div class="fr-fieldset__element">
        <div class="fr-radio-group">
          <input type="radio" id="create-empty" value="empty" v-model="selectedOption" />
          <label class="fr-label" for="create-empty">
            Créer à partir de zéro
            <span class="fr-hint-text">
              Ajouter vos parcelles une à une, par référence cadastrale ou dessin sur la carte.
            </span>
          </label>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-radio-group">
          <input type="radio" id="duplicate" value="duplicate" v-model="selectedOption" />
          <label class="fr-label" for="duplicate">
            Dupliquer une autre version
            <span class="fr-hint-text"> Veuillez sélectionner la version à dupliquer </span>
          </label>
        </div>
      </div>
    </fieldset>
    <div
      class="fr-table table-data fr-table--bordered version-table fr-table--no-caption"
      v-if="selectedOption == 'duplicate'"
    >
      <table aria-hidden="true" aria-describedby="versions-summary-global">
        <colgroup>
          <col class="blank-column" />
          <col class="version-name" />
          <col class="audit-date" />
          <col class="surface" />
          <col class="parcelles" />
          <col class="statut" />
        </colgroup>
        <thead>
          <tr class="column-headers">
            <th>Nom de version</th>
            <th>Date d'audit</th>
            <th>Surface</th>
            <th>Parcelles</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in sortedRecords" :key="record.id" @click="selectedRecord = record">
            <td class="version-name">
              <div class="fr-radio-group fr-radio-group--sm">
                <input
                  type="radio"
                  class="radio-button"
                  id="radio-{{record.id}}"
                  name="radio-inline"
                  v-model="selectedRecord"
                  :value="record"
                />
                <label class="fr-label" for="radio-{{record.id}}"> {{ record.version_name }} </label>
              </div>
            </td>
            <td class="audit-date">{{ record.audit_date ? jjmmyyyy(record.audit_date) : "Non audité" }}</td>
            <td class="surface">{{ inHa(record.surface) }} ha</td>
            <td class="parcelles">{{ record.parcelles }}</td>
            <td class="statut">
              <State :record="record" :show-date="false" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <div class="footer-row">
        <div class="btn-container">
          <button
            class="fr-btn"
            @click="handleSubmit"
            :disabled="!selectedOption || (selectedOption === 'duplicate' && !selectedRecord)"
          >
            Valider
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.space-between {
  display: flex;
  justify-content: space-between !important;
  align-items: center;
}
tr:hover {
  background-color: var(--background-alt-blue-france-hover) !important;
}

.footer-row {
  display: flex;
  align-items: center;
}

.btn-container {
  margin-left: auto;
  margin-right: 0;
}
</style>
