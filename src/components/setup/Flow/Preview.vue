<template>
  <section>
    <div class="fr-alert fr-alert--success fr-mb-3w">
      <p class="fr-alert__title">
        Nous avons identifié {{ featureCollection.features.length }} parcelles ({{ surfaceTotale }}&nbsp;ha).
      </p>
    </div>

    <div class="fr-alert fr-alert--warning fr-mb-3w" v-for="(warning, i) in warnings" :key="i">
      <p v-if="warning instanceof FeatureNotFoundError">
        La référence cadastrale <ReferenceCadastrale class="fr-text--bold" :reference="warning.id" /> est introuvable
        dans le parcellaire informatisé.
      </p>
      <p v-else>{{ warning }}</p>
    </div>
    <form @submit.prevent="submitForm">
      <div :class="{ 'copy-data': !!operatorStore.records?.length }">
        <div class="fr-mb-3w">
          <MapContainer
            :controls="false"
            class="map map--preview"
            :options="{ interactive: false, hash: false, trackResize: false }"
            minInitialZoom="22"
            :bounds="mapBounds"
          >
            <GeojsonLayer :style="baseStyle" name="base" />
            <FeaturesLayer :data="featureCollection" />
          </MapContainer>
        </div>
        <div class="data-form" v-if="operatorStore.records?.length">
          <fieldset class="fr-fieldset" id="radio-import" aria-labelledby="radio-import-legend">
            <legend class="fr-fieldset__legend fr-fieldset__legend--regular" id="radio-import-legend">
              Souhaitez-vous récupérer les informations renseignées dans une version précédente ?
            </legend>

            <div class="list-options">
              <div class="fr-fieldset__element shadow-right">
                <div class="fr-radio-group">
                  <input
                    type="radio"
                    id="radio-import-oui"
                    name="radio-import"
                    v-model="importPrevious"
                    value="oui"
                    required="required"
                  />
                  <label class="fr-label" for="radio-import-oui">Oui</label>
                  <small class="grey--text">Recommandé par l’organisme de certification</small>
                </div>
              </div>
              <div class="fr-fieldset__element">
                <div class="fr-radio-group">
                  <input
                    type="radio"
                    id="radio-import-non"
                    name="radio-import"
                    v-model="importPrevious"
                    value="non"
                    required="required"
                  />
                  <label class="fr-label" for="radio-import-non">Non</label>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset class="fr-fieldset">
            <div class="fr-fieldset__element">
              <label class="fr-label" for="select-version">Sélectionner la version</label>
              <select
                class="fr-select"
                name="select-version"
                id="select-version"
                v-model="selectedRecord"
                :disabled="importPrevious != 'oui'"
              >
                <option :value="record.record_id" :key="record.record_id" v-for="record in sortedRecords">
                  {{ record.version_name }}
                </option>
              </select>
            </div>
          </fieldset>
          <button
            v-if="operatorStore.records?.length"
            class="fr-btn fr-btn--tertiary-no-outline"
            @click.stop.prevent="showDetails = !showDetails"
          >
            Quelles informations sont reprises ?<span
              :class="showDetails ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line'"
            />
          </button>
          <div v-if="showDetails && operatorStore.records?.length">
            <small>
              Vous pouvez récupérer les informations renseignées dans une version de votre choix : dates et niveaux de
              conversion, parcelles ajoutées manuellement, variété (si la culture est identique), notes de certification
              et noms de parcelles modifiés. Pour plus d’information : Accéder à la
              <a
                :href="
                  permissions.isAgri
                    ? 'https://docs-cartobio.agencebio.org/agriculteurs.trices/pas-a-pas/gestion-des-versions-de-parcellaire/importer-une-nouvelle-version-de-parcellaire'
                    : 'https://docs-cartobio.agencebio.org/organisme-certification/pas-a-pas/gestion-des-versions-de-parcellaire/importer-une-nouvelle-version'
                "
                >FAQ</a
              >
            </small>
          </div>
        </div>
      </div>

      <Spinner v-if="isLoading">Import en cours</Spinner>
      <p v-else>
        <button class="fr-btn" type="submit">Terminer et accéder au parcellaire</button>
      </p>
    </form>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

import ReferenceCadastrale from "@/components/records/ReferenceCadastrale.vue";

import { useOperatorStore } from "@/stores/operator.js";
import { bounds, FeatureNotFoundError, inHa, legalProjectionSurface } from "@/utils/features.js";
import baseStyle from "@/map-styles/base.json";
import FeaturesLayer from "@/components/map/FeaturesLayer.vue";
import MapContainer from "@/components/map/MapContainer.vue";
import GeojsonLayer from "@/components/map/GeojsonLayer.vue";
import { usePermissions } from "@/stores/permissions";
import { CertificationState } from "@agencebio/cartobio-types";
import Spinner from "@/components/widgets/Spinner.vue";

const emit = defineEmits(["submit"]);
const props = defineProps({
  featureCollection: {
    type: Object,
    required: true,
  },
  warnings: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: () => false,
  },
});

const operatorStore = useOperatorStore();
const permissions = usePermissions();

const sortedRecords = computed(
  () =>
    operatorStore.records?.toSorted((recordA, recordB) => {
      if (recordA.certification_state != recordB.certification_state) {
        if (
          recordA.certification_state === CertificationState.CERTIFIED ||
          recordB.certification_state === CertificationState.CERTIFIED
        ) {
          return recordA.certification_state === CertificationState.CERTIFIED ? -1 : 1;
        }

        if (
          recordA.certification_state === CertificationState.PENDING_CERTIFICATION ||
          recordB.certification_state === CertificationState.PENDING_CERTIFICATION
        ) {
          return recordA.certification_state === CertificationState.PENDING_CERTIFICATION ? -1 : 1;
        }

        if (
          recordA.certification_state === CertificationState.AUDITED ||
          recordB.certification_state === CertificationState.AUDITED
        ) {
          return recordA.certification_state === CertificationState.AUDITED ? -1 : 1;
        }
      }
      return new Date(recordB.created_at) - new Date(recordA.created_at);
    }) || [],
);

const selectedRecord = ref(sortedRecords.value?.length ? sortedRecords.value[0].record_id : null);

const importPrevious = ref("oui");
const showDetails = ref(false);

const surfaceTotale = computed(() => inHa(legalProjectionSurface(props.featureCollection)));
const mapBounds = computed(() => bounds(props.featureCollection));

const submitForm = () => {
  const importPrev = importPrevious.value === "oui";

  emit("submit", importPrev, importPrev ? selectedRecord.value : null);
};
</script>

<style>
.map {
  background: #ccc;
  height: 390px;
  width: 100%;

  @media (width >= 78em) {
    max-width: 40vw;
  }
}

.copy-data {
  display: flex;

  .map {
    @media (width >= 78em) {
      max-width: 100%;
    }
  }

  > div {
    flex: 1;
  }

  .data-form {
    padding-left: 1rem;
  }

  .list-options {
    display: flex;
    justify-content: space-between;
    flex: 1;

    .fr-fieldset__element {
      flex: 1;
    }
  }

  .shadow-right {
    -webkit-box-shadow: inset -1px 0 0 0 #ddd;
    box-shadow: inset -1px 0 0 0 #ddd;
    -webkit-box-shadow: inset -1px 0 0 0 var(--border-default-grey);
    box-shadow: inset -1px 0 0 0 var(--border-default-grey);
  }

  small {
    color: var(--text-mention-grey);
  }
}
</style>
