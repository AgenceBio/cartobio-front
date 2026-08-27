<script setup lang="ts">
import { computed } from "vue";
import AccordionGroup from "@/components/widgets/AccordionGroup.vue";
import AccordionSection from "@/components/widgets/Accordion.vue";
import { getErrorMessage, getErrorColor, getErrorTextColor } from "@/utils/error-api.utils";
import { useErreursEnvoi } from "@/composables/tableau-de-bord/useErreursEnvoi";
import type { ErreurEnvoi } from "@/types/tableau-de-bord";

const props = defineProps<{
  envoi: { erreurs?: ErreurEnvoi[]; statut?: string } | null;
}>();

const source = computed(() => props.envoi);

const { erreursOperateur, erreursDatesParcellaire, erreursParcelles, erreursParcellesGroupees, isInternalJobError } =
  useErreursEnvoi(source);
</script>

<template>
  <div v-if="isInternalJobError" class="fr-alert fr-alert--error fr-mt-3w">
    <h3 class="fr-alert__title">Erreur interne</h3>
    <p>
      Cet envoi n'a pas pu être traité en raison d'une erreur technique interne. Aucun détail d'anomalie n'est
      disponible.
    </p>
  </div>

  <AccordionGroup v-else>
    <AccordionSection title="Opérateur">
      <template #right>
        <span class="fr-badge fr-badge--sm" :class="erreursOperateur.length ? 'fr-badge--error' : 'fr-badge--success'">
          {{ erreursOperateur.length ? `${erreursOperateur.length} ERREURS` : "VALIDÉ" }}
        </span>
      </template>
      <div class="fr-p-2w">
        <p v-if="erreursOperateur.length === 0" class="fr-text--sm fr-mb-0">Aucune erreur liée à l'opérateur.</p>
        <div v-else>
          <div v-for="erreur in erreursOperateur" :key="erreur.code" class="fr-mb-2w">
            {{ getErrorMessage(erreur.code, "short") }}
          </div>
        </div>
      </div>
    </AccordionSection>

    <AccordionSection title="Dates du parcellaire">
      <template #right>
        <span
          class="fr-badge fr-badge--sm"
          :class="erreursDatesParcellaire.length ? 'fr-badge--error' : 'fr-badge--success'"
        >
          {{ erreursDatesParcellaire.length ? `${erreursDatesParcellaire.length} ERREURS` : "VALIDÉ" }}
        </span>
      </template>
      <div class="fr-p-2w">
        <p v-if="erreursDatesParcellaire.length === 0" class="fr-text--sm fr-mb-0">
          Aucune erreur liée aux dates du parcellaire.
        </p>
        <div v-else>
          <div v-for="erreur in erreursDatesParcellaire" :key="erreur.code">
            {{ getErrorMessage(erreur.code, "short") }}
          </div>
        </div>
      </div>
    </AccordionSection>

    <AccordionSection title="Parcelles">
      <template #right>
        <span class="fr-badge fr-badge--sm" :class="erreursParcelles.length ? 'fr-badge--error' : 'fr-badge--success'">
          {{ erreursParcelles.length ? `${erreursParcelles.length} ERREURS` : "VALIDÉ" }}
        </span>
      </template>
      <div class="fr-p-2w">
        <p v-if="erreursParcelles.length === 0" class="fr-text--sm fr-mb-0">Aucune erreur liée à une parcelle.</p>
        <div v-for="groupe in erreursParcellesGroupees" :key="groupe.key" class="row-accordion">
          <strong>{{ groupe.label }}</strong>
          <div class="parcel-error-badges">
            <span
              v-for="erreur in groupe.erreurs"
              :key="erreur.code"
              class="fr-badge fr-badge--sm error-badge"
              :style="{
                backgroundColor: getErrorColor(erreur.code),
                color: getErrorTextColor(erreur.code),
              }"
            >
              {{ getErrorMessage(erreur.code, "short") }}
            </span>
          </div>
        </div>
      </div>
    </AccordionSection>
  </AccordionGroup>
</template>

<style scoped>
.row-accordion {
  display: flex;
  justify-content: space-between;
}
.parcel-error-badges {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.error-badge {
  border: 0;
  box-shadow: none;
}
</style>
