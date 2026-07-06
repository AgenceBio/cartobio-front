<script setup lang="ts">
import Pagination from "@/components/widgets/Pagination.vue";
import CopierColler from "@/components/tableau-de-bord/CopierColler.vue";
import { getErrorMessage, getErrorColor, getErrorTextColor, ErrorCode } from "@/utils/error-api.utils";
import { formatDateTableau } from "@/utils/date.formatters";
import type { BilanEnvoiItem } from "@/types/tableau-de-bord";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    envois: BilanEnvoiItem[];
    page: number;
    maxPage: number;
    tableId?: string;
    caption?: string;
    ordreDate?: "asc" | "desc";
  }>(),
  {
    tableId: "table-envois-rejetes",
    caption: "Liste des envois rejetés de la période sélectionnée",
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
                <th scope="col">N° Client<span class="fr-hint-text">N° BIO</span></th>
                <th scope="col">Date d'audit</th>
                <th scope="col">Rejets</th>
                <th scope="col" :aria-sort="triCroissant ? 'ascending' : 'descending'">
                  <div class="flex">
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
              </tr>
            </thead>
            <tbody>
              <tr v-for="envoi in envois" :key="envoi.jobId">
                <td>
                  <div class="identity-cell">
                    <CopierColler :value="envoi.numeroClient" label="Numéro client" />
                    <CopierColler :value="envoi.numeroBio" label="Numéro BIO" hint />
                  </div>
                </td>
                <td>
                  {{ envoi.auditDate ? new Date(envoi.auditDate).toLocaleDateString("fr-FR") : "—" }}
                </td>
                <td>
                  <span
                    v-for="detail in envoi.details?.slice(0, 1)"
                    :key="detail.code"
                    class="fr-badge fr-badge--sm fr-mr-1w error-badge"
                    :style="{
                      backgroundColor: getErrorColor(detail.code),
                      color: getErrorTextColor(detail.code),
                    }"
                  >
                    {{ getErrorMessage(detail.code as ErrorCode, "short") }}
                  </span>
                  <span v-if="(envoi.details?.length ?? 0) > 2" class="fr-text--sm">
                    +{{ (envoi.details?.length ?? 0) - 1 }}
                  </span>
                </td>
                <td>
                  <div class="flex space-between">
                    <span style="align-self: center">{{ formatDateTableau(envoi.createdAt) }}</span>
                    <button
                      type="button"
                      class="fr-btn fr-icon-arrow-right-up-line fr-btn--tertiary-no-outline"
                      :aria-label="`Voir le détail de l'envoi ${envoi.numeroClient ?? ''}`"
                      @click="emit('open-details', envoi)"
                    >
                      <span class="fr-sr-only">Voir le détail de cet envoi</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="fr-table__footer">
      <div class="fr-table__footer--middle">
        <Pagination :current-page="page" :max-page="maxPage" small-size @change-page="(p) => emit('change-page', p)" />
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
.error-badge {
  border: 0;
  box-shadow: none;
}
table {
  width: 100% !important;
}
th {
  text-align: left;
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

.flex {
  display: flex;
}

.space-between {
  justify-content: space-between;
}
</style>
