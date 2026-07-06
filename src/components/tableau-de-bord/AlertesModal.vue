<script setup lang="ts">
import Modal from "@/components/widgets/Modal.vue";
import AccordionGroup from "@/components/widgets/AccordionGroup.vue";
import AccordionSection from "@/components/widgets/Accordion.vue";
import ErreursAccordion from "@/components/tableau-de-bord/ErreursAccordion.vue";
import Pagination from "@/components/widgets/Pagination.vue";
import { getErrorMessage, getErrorColor, getErrorTextColor } from "@/utils/error-api.utils";
import { formatDateTableau, formatDateControle } from "@/utils/date.formatters";
import { clefGroupe, typeRepetition, labelRepetition } from "@/composables/tableau-de-bord/useRepetitions";
import type { RepetitionGroupe, RepetitionEnvoi } from "@/types/tableau-de-bord.types";

defineProps<{
  vueAlertes: "liste" | "detail";
  repetitions: RepetitionGroupe[];
  groupeAOuvrirKey: string | null;
  selectedGroupe: RepetitionGroupe | null;
  selectedEnvoi: RepetitionEnvoi | null;
  rechercheBrouillon: string;
  page: number;
  maxPage: number;
  total: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "retour-liste"): void;
  (e: "ouvrir-detail", groupe: RepetitionGroupe, envoi: RepetitionEnvoi): void;
  (e: "valider-recherche"): void;
  (e: "update:rechercheBrouillon", value: string): void;
  (e: "changer-page", page: number): void;
}>();

const model = defineModel<boolean>({ required: true });
</script>

<template>
  <Modal v-if="model" data-track-content data-content-name="Toutes les alertes" @close="emit('close')">
    <template #header>
      <button class="fr-btn fr-btn--close" type="button" aria-controls="global-modal" @click="emit('close')">
        Fermer
      </button>
    </template>

    <!-- Vue liste -->
    <template v-if="vueAlertes === 'liste'">
      <h2 class="fr-h5 fr-mb-3w">Toutes les alertes</h2>

      <div class="fr-grid-row fr-grid-row--gutters fr-mb-3w alertes-toolbar">
        <div class="fr-col-12">
          <div class="fr-search-bar" role="search">
            <label class="fr-label" for="recherche-alertes">Rechercher</label>
            <input
              id="recherche-alertes"
              aria-describedby="recherche-alertes-messages"
              :value="rechercheBrouillon"
              class="fr-input"
              type="search"
              autocomplete="off"
              @input="emit('update:rechercheBrouillon', ($event.target as HTMLInputElement).value)"
              @keyup.enter="emit('valider-recherche')"
            />
            <div id="recherche-alertes-messages" class="fr-messages-group" aria-live="polite"></div>
            <button class="fr-btn" type="button" @click="emit('valider-recherche')">Rechercher</button>
          </div>
        </div>
      </div>

      <AccordionGroup>
        <AccordionSection
          v-for="groupe in repetitions"
          :key="clefGroupe(groupe)"
          :title="labelRepetition(groupe)"
          :open="clefGroupe(groupe) === groupeAOuvrirKey"
        >
          <template #right>
            <span
              class="fr-badge fr-badge--sm"
              :class="typeRepetition(groupe) === 'envois' ? 'fr-badge--info' : 'fr-badge--error'"
            >
              {{ groupe.envois.length }}
              {{ typeRepetition(groupe) === "envois" ? "ENVOIS" : "REFUS" }}
            </span>
          </template>

          <div class="fr-table">
            <div class="fr-table__wrapper">
              <div class="fr-table__container">
                <div class="fr-table__content">
                  <table>
                    <caption class="fr-sr-only">
                      Envois de
                      {{
                        labelRepetition(groupe)
                      }}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Rejets</th>
                        <th scope="col">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="envoi in groupe.envois" :key="envoi.jobId">
                        <td>{{ formatDateTableau(envoi.createdAt) }}</td>
                        <td>
                          <span
                            v-for="detail in envoi.erreurs?.slice(0, 2)"
                            :key="detail.code"
                            class="fr-badge fr-badge--sm fr-mr-1w error-badge"
                            :style="{
                              backgroundColor: getErrorColor(detail.code),
                              color: getErrorTextColor(detail.code),
                            }"
                          >
                            {{ getErrorMessage(detail.code, "short") }}
                          </span>
                          <span v-if="(envoi.erreurs?.length ?? 0) > 2" class="fr-text--sm">
                            +{{ (envoi.erreurs?.length ?? 0) - 2 }}
                          </span>
                        </td>
                        <td>
                          <span
                            class="fr-badge"
                            :class="envoi.statut === 'VALID' ? 'fr-badge--success' : 'fr-badge--error'"
                          >
                            {{ envoi.statut === "VALID" ? "Validé" : "Rejeté" }}
                          </span>
                          <button
                            type="button"
                            class="fr-btn fr-icon-arrow-right-up-line fr-btn--tertiary-no-outline"
                            :aria-label="`Voir le détail de l'envoi ${labelRepetition(groupe)}`"
                            @click="emit('ouvrir-detail', groupe, envoi)"
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
        </AccordionSection>
      </AccordionGroup>

      <p v-if="repetitions.length === 0" class="fr-text--sm">Aucune alerte pour cette période.</p>

      <Pagination
        class="fr-mt-2w"
        :current-page="page"
        :max-page="maxPage"
        @change-page="(p: number) => emit('changer-page', p)"
      />
    </template>

    <!-- Vue détail -->
    <template v-if="vueAlertes === 'detail' && selectedEnvoi && selectedGroupe">
      <h2 class="fr-h5 fr-mb-3w">
        N° BIO {{ selectedGroupe.numeroBio }} — N° Client {{ selectedGroupe.numeroClient }}
      </h2>
      <div class="controle-highlight fr-p-2w fr-mb-4w">
        <p class="fr-mb-0">Contrôle réalisé le {{ formatDateControle(selectedGroupe.auditDate) }}</p>
      </div>
      <h3 class="fr-h6 fr-mb-2w">Envoi du {{ formatDateTableau(selectedEnvoi.createdAt) }}</h3>
      <ErreursAccordion :envoi="selectedEnvoi" />
    </template>

    <template #footer v-if="vueAlertes === 'detail'">
      <div class="fr-text--right">
        <button type="button" class="fr-btn fr-btn--secondary" @click="emit('retour-liste')">Retour aux alertes</button>
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
.alertes-toolbar {
  align-items: center;
}
:deep(.fr-modal__content):has(> .fr-h5) {
  margin-bottom: 1rem !important;
}
</style>
