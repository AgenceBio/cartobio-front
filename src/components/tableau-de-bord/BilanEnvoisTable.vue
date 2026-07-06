<script setup lang="ts">
import Pagination from "@/components/widgets/Pagination.vue";
import CopierColler from "@/components/tableau-de-bord/CopierColler.vue";
import { formatDateTableau } from "@/utils/date.formatters";
import { formatEtat, formatEtatLong, formatStatut, statutBadgeClass } from "@/utils/etat.formatters";
import type { BilanEnvoiItem } from "@/types/tableau-de-bord";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    envois: BilanEnvoiItem[];
    page: number;
    maxPage: number;
    tableId?: string;
    caption?: string;
    large?: boolean;
    ordreDate?: "asc" | "desc";
  }>(),
  {
    tableId: "table-bilan-envoi",
    caption: "Liste des envois de la période sélectionnée",
    large: false,
    ordreDate: "desc",
  },
);

const emit = defineEmits<{
  (e: "change-page", page: number): void;
  (e: "open-details", envoi: BilanEnvoiItem): void;
  (e: "change-tri-date"): void;
}>();

const triCroissant = computed(() => props.ordreDate === "asc");
const labelTriDate = computed(() =>
  triCroissant.value ? "Trier par date d'envoi par ordre décroissant" : "Trier par date d'envoi par ordre croissant",
);
</script>

<template>
  <div class="fr-table">
    <div class="fr-table__wrapper">
      <div class="fr-table__container">
        <div class="fr-table__content">
          <table :id="tableId">
            <caption class="fr-sr-only">
              {{
                caption
              }}
            </caption>
            <thead>
              <tr>
                <template v-if="large">
                  <th scope="col">N° Client</th>
                  <th scope="col">N° BIO</th>
                </template>
                <th v-else scope="col">N° Client<span class="fr-hint-text"> N° BIO</span></th>
                <th scope="col">État</th>
                <th scope="col" :aria-sort="triCroissant ? 'ascending' : 'descending'">
                  <div class="flex space-between">
                    <span style="align-self: center">Date d'envoi</span>
                    <button
                      type="button"
                      class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
                      :class="{
                        'fr-icon-arrow-up-line': triCroissant,
                        'fr-icon-arrow-down-line': !triCroissant,
                      }"
                      :aria-label="labelTriDate"
                      @click="emit('change-tri-date')"
                    ></button>
                  </div>
                </th>
                <th scope="col">Statut</th>
                <th v-if="large" scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="envoi in envois" :key="envoi.jobId">
                <template v-if="large">
                  <td>{{ envoi.numeroClient }}</td>
                  <td>{{ envoi.numeroBio }}</td>
                  <td>{{ formatEtatLong(envoi.etat) }}</td>
                </template>
                <template v-else>
                  <td>
                    <div class="identity-cell">
                      <CopierColler :value="envoi.numeroClient" label="Numéro client" />
                      <CopierColler :value="envoi.numeroBio" label="Numéro BIO" hint />
                    </div>
                  </td>
                  <td>{{ formatEtat(envoi.etat) }}</td>
                </template>
                <td>{{ formatDateTableau(envoi.createdAt) }}</td>
                <td>
                  <div class="flex space-between">
                    <span class="fr-badge fr-badge--sm" :class="statutBadgeClass(envoi.statut)">
                      {{ formatStatut(envoi.statut) }}
                    </span>
                    <button
                      v-if="!large"
                      type="button"
                      class="fr-btn fr-icon-arrow-right-up-line fr-btn--tertiary-no-outline fr-btn--sm"
                      :aria-label="`Voir le détail de l'envoi ${envoi.numeroClient ?? ''}`"
                      @click="emit('open-details', envoi)"
                    >
                      <span class="fr-sr-only">Voir le détail de cet envoi</span>
                    </button>
                  </div>
                </td>
                <td v-if="large">
                  <button
                    type="button"
                    class="fr-btn fr-icon-arrow-right-up-line fr-btn--tertiary-no-outline"
                    :aria-label="`Voir le détail de l'envoi ${envoi.numeroClient ?? ''}`"
                    @click="emit('open-details', envoi)"
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
    <div class="fr-table__footer">
      <div class="fr-table__footer--middle">
        <Pagination
          :id="tableId"
          :current-page="page"
          :max-page="maxPage"
          :small-size="!large"
          :noExplane="!large"
          @change-page="(p) => emit('change-page', p)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.identity-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
table {
  width: 100% !important;
}
th {
  text-align: left;
}
th:last-child {
  text-align: center;
}
.fr-table__footer--middle {
  margin-left: auto;
  margin-right: auto;
}

.flex {
  display: flex;
}

.space-between {
  justify-content: space-between;
}
</style>
