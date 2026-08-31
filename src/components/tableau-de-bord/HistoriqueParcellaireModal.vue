<script setup lang="ts">
import Modal from "@/components/widgets/Modal.vue";
import ErreursAccordion from "@/components/tableau-de-bord/ErreursAccordion.vue";
import { getErrorMessage, getErrorColor, getErrorTextColor } from "@/utils/error-api.utils";
import { formatDateTableau, formatDateControle } from "@/utils/date.formatters";
import { useTelechargements } from "@/composables/tableau-de-bord/useTelechargements";
import type { HistoriqueEnvoi } from "@/types/tableau-de-bord";

defineProps<{
  vueModal: "historique" | "detail";
  isLoading: boolean;
  numeroBio: string | null;
  numeroClient: string | null;
  auditDate: string | null;
  historique: HistoriqueEnvoi[];
  selectedEnvoi: HistoriqueEnvoi | null;
  envoiOrigine: HistoriqueEnvoi | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select-envoi", envoi: HistoriqueEnvoi): void;
  (e: "retour-historique"): void;
  (e: "retour-origine"): void;
  (e: "open-referentiel"): void;
}>();

const model = defineModel<boolean>({ required: true });

const { downloadJson } = useTelechargements();
</script>

<template>
  <Modal v-if="model" data-track-content data-content-name="Historique envoi parcellaire" @close="emit('close')">
    <template #header>
      <button
        v-if="vueModal === 'historique' && envoiOrigine"
        type="button"
        class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-left-line fr-btn--icon-left"
        @click="emit('retour-origine')"
      >
        Retour à l'envoi du {{ formatDateTableau(envoiOrigine.createdAt) }}
      </button>
      <button
        v-else-if="vueModal === 'detail' && selectedEnvoi !== envoiOrigine"
        type="button"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left"
        :class="envoiOrigine === selectedEnvoi ? 'fr-icon-arrow-right-up-line' : 'fr-icon-arrow-left-line'"
        @click="emit('retour-historique')"
      >
        {{ envoiOrigine === selectedEnvoi ? "Accéder aux bilans des envois" : "Retour aux bilans des envois" }}
      </button>
      <button class="fr-btn fr-btn--close" type="button" aria-controls="global-modal" @click="emit('close')">
        Fermer
      </button>
    </template>

    <template v-if="!isLoading">
      <h2 class="fr-h5 fr-mb-3w">N° BIO {{ numeroBio }} — N° Client {{ numeroClient }}</h2>
      <div class="controle-highlight fr-p-2w fr-mb-4w">
        <p class="fr-mb-0">Contrôle réalisé le {{ formatDateControle(auditDate ?? "") }}</p>
      </div>

      <!-- Vue historique -->
      <template v-if="vueModal === 'historique'">
        <div class="justify-between">
          <h3 class="fr-h6 fr-mb-2w">Bilan des envois</h3>
        </div>
        <div class="fr-table">
          <div class="fr-table__wrapper">
            <div class="fr-table__container">
              <div class="fr-table__content">
                <table id="table-historique-envois">
                  <caption class="fr-sr-only">
                    Historique des envois du parcellaire sélectionné
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Rejets</th>
                      <th scope="col">Statut</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="envoi in historique" :key="envoi.jobId">
                      <td>{{ formatDateTableau(envoi.createdAt) }}</td>
                      <td>
                        <span
                          v-for="detail in envoi.details?.slice(0, 2)"
                          :key="detail.code"
                          class="fr-badge fr-badge--sm fr-mr-1w error-badge"
                          :style="{
                            backgroundColor: getErrorColor(detail.code),
                            color: getErrorTextColor(detail.code),
                          }"
                        >
                          {{ getErrorMessage(detail.code, "short") }}
                        </span>
                        <span v-if="(envoi.details?.length ?? 0) > 2" class="fr-text--sm">
                          +{{ (envoi.details?.length ?? 0) - 2 }}
                        </span>
                      </td>
                      <td>
                        <span
                          class="fr-badge"
                          :class="envoi.erreurs.length > 0 ? 'fr-badge--error' : 'fr-badge--success'"
                        >
                          {{ envoi.erreurs.length > 0 ? "Rejeté" : "Validé" }}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          class="fr-btn fr-icon-arrow-right-up-line fr-btn--tertiary-no-outline"
                          :aria-label="`Voir le détail de l'envoi ${envoi.jobId}`"
                          @click="emit('select-envoi', envoi)"
                        >
                          <span class="fr-sr-only">Voir le détail de cet envoi</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Vue détail -->
      <template v-if="vueModal === 'detail' && selectedEnvoi">
        <div class="justify-between">
          <h3 class="fr-h6 fr-mb-2w">Envoi du {{ formatDateTableau(selectedEnvoi.createdAt) }}</h3>
          <button
            type="button"
            v-if="envoiOrigine === selectedEnvoi"
            class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left"
            :class="envoiOrigine === selectedEnvoi ? 'fr-icon-arrow-right-up-line' : 'fr-icon-arrow-left-line'"
            @click="emit('retour-historique')"
          >
            Accéder aux bilans des envois
          </button>
        </div>

        <ErreursAccordion :envoi="selectedEnvoi" />
      </template>
    </template>

    <template #footer>
      <div class="fr-col">
        <button class="fr-btn" type="button" @click="emit('open-referentiel')">Référentiel des anomalies</button>
      </div>
      <div class="fr-text--right">
        <button
          type="button"
          class="fr-btn fr-icon-download-line fr-btn--icon-left"
          @click="downloadJson(selectedEnvoi?.payload, `payload-${selectedEnvoi?.jobId}.json`)"
        >
          Télécharger l'envoi en JSON
        </button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.controle-highlight {
  background: var(--light-decisions-background-background-alt-blue-france, #f5f5fe);
  border-left: 4px solid var(--blue-france-sun-113-625);
}
.error-badge {
  border: 0;
  box-shadow: none;
}
.justify-between {
  justify-content: space-between;
  display: flex;
}
</style>
