<script setup lang="ts">
import { clefGroupe, typeRepetition, labelRepetition } from "@/composables/tableau-de-bord/useRepetitions";
import type { RepetitionGroupe } from "@/types/tableau-de-bord";

defineProps<{
  apercu: RepetitionGroupe[];
  restantes: number;
}>();

const emit = defineEmits<{
  (e: "masquer", groupe: RepetitionGroupe): void;
  (e: "ouvrir", groupe?: RepetitionGroupe): void;
}>();
</script>

<template>
  <div class="fr-grid-row">
    <div class="fr-col-11">
      <div v-if="apercu.length > 0" class="repetitions-banner fr-grid-row fr-mb-4w">
        <template v-for="groupe in apercu" :key="clefGroupe(groupe)">
          <div class="fr-col-4 fr-p-1w">
            <div
              class="fr-alert repetition-alert"
              :class="typeRepetition(groupe) === 'envois' ? 'fr-alert--info' : 'fr-alert--error'"
            >
              <h6 class="fr-alert__title">{{ labelRepetition(groupe) }}</h6>
              <p class="flex space-between">
                <span class="fr-text--sm fr-mb-0">
                  {{ groupe.envois.length }}
                  {{ typeRepetition(groupe) === "envois" ? "envois" : "refus" }}
                </span>
                <button
                  type="button"
                  class="fr-link fr-text--sm repetition-alert__link"
                  @click="emit('ouvrir', groupe)"
                >
                  détail <span class="fr-icon-arrow-right-line fr-icon--sm" aria-hidden="true"></span>
                </button>
              </p>
              <button
                type="button"
                class="fr-btn--close fr-btn"
                :title="`Masquer l'alerte ${labelRepetition(groupe)}`"
                @click="emit('masquer', groupe)"
              >
                Masquer le message
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div v-if="restantes > 0" class="fr-col-1 fr-mb-4w col-tout">
      <div class="voir-tout fr-mb-2w">
        <span class="fr-text--sm fr-mb-0">+{{ restantes }}</span>
        <br />
        <button type="button" class="fr-link fr-text--sm" @click="emit('ouvrir')">
          Voir tout <span class="fr-icon--sm fr-icon-arrow-right-line" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.repetition-alert {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
}
.repetition-alert__title {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.25rem;
}
.repetition-alert__link {
  white-space: nowrap;
}
.repetition-alert--more {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-default-grey);
  border-radius: 0.25rem;
  background: #fff;
}
@media (max-width: 48rem) {
  .repetitions-banner {
    flex-direction: column;
  }
}

.fr-alert + .fr-alert {
  margin-top: 0;
}

.flex {
  display: flex;
}

.space-between {
  justify-content: space-between;
}
.voir-tout {
  text-align: end;
  margin-top: auto;
  display: block;
}

.col-tout {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
</style>
