<script setup>
import { computed, ref } from "vue";
import { isCertificationImmutable } from "@/referentiels/ab.js";
import { usePermissions } from "@/stores/permissions.js";
import { useRecordStore } from "@/stores/record.js";

/*
 * * Stores
 */

const recordStore = useRecordStore();
const permissions = usePermissions();
const { record } = recordStore;

/*
 * * Refs
 */

const open = ref(false);

/*
 * * Computed
 */

const displayCallout = computed(() => record.audit_demandes && isCertificationImmutable(record.certification_state));
const lengthMessage = computed(() => {
  let toreturn = 0;
  if (record.audit_notes) {
    toreturn++;
  }
  if (displayCallout.value) {
    toreturn++;
  }
  return toreturn;
});
</script>

<template>
  <div>
    <div
      class="fr-grid-row fr-px-4v fr-py-4v groupe-notes"
      tabindex="0"
      aria-expanded="open"
      :aria-controls="`group-content-notes`"
      :class="{ 'groupe-titre-on': open }"
      @click.stop="open = !open"
      @keydown.enter="open = !open"
    >
      <div class="fr-grid-row groupe-titre fr-mb-0">
        <b class="fr-text--lg fr-mb-0 font-blue">Notes du contrôle</b>
      </div>
      <div class="fr-grid-row gap-10 actions-notes">
        <span aria-hidden="true" class="fr-icon fr-icon--sm fr-text--bold fr-icon-quote-line fr-mb-0 badge-commentaire">
          {{ lengthMessage }}
        </span>
        <span class="fr-icon fr-icon-arrow-down-s-line font-blue" :aria-checked="open" aria-role="button" />
      </div>
    </div>

    <div :hidden="!open" class="notes-content fr-mx-4v fr-mb-2v">
      <figure v-if="permissions.isOc && record.audit_notes" class="fr-quote fr-my-3v fr-p-3v note-item">
        <figcaption>
          <p class="fr-quote__author">Notes de fin de contrôle</p>
        </figcaption>
        <blockquote>
          <p>{{ record.audit_notes }}</p>
        </blockquote>
      </figure>

      <figure v-if="displayCallout" class="fr-quote fr-my-3v fr-p-3v note-item">
        <figcaption>
          <p class="fr-quote__author">Notes à destination de l'agriculteur</p>
        </figcaption>
        <blockquote>
          <p>{{ record.audit_demandes }}</p>
        </blockquote>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.groupe-notes {
  gap: 12px;
  justify-content: space-between;
  border-top: 1px solid var(--artwork-decorative-blue-france);
  cursor: pointer;

  .groupe-titre {
    color: var(--light-decisions-text-text-action-high-blue-france, #000091);
    gap: 7px;
  }

  .actions-notes {
    align-content: center;
  }
}

.groupe-titre-on {
  background-color: var(--blue-france-925-125);
}

.groupe-notes:hover {
  background-color: var(--blue-france-925-125-hover);
}

.fr-icon[aria-checked="true"]::before {
  transform: rotate(180deg);
}

.gap-10 {
  gap: 10px;
}

.font-blue {
  color: var(--light-decisions-text-text-action-high-blue-france, #000091);
}

.badge-commentaire {
  background-color: rgba(254, 236, 194, 1);
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-commentaire::before {
  margin-right: 5px;
}
</style>
