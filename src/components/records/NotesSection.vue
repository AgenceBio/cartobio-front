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
      class="fr-grid-row fr-grid-row--middle notif-title"
      :class="{ 'fr-pb-4v': open }"
      @click.stop="open = !open"
      @keydown.enter="open = !open"
    >
      <h3 class="fr-text--lg fr-mb-0">Notes du contrôle</h3>
      <div class="fr-grid-row icons">
        <span aria-hidden="true" class="fr-icon fr-icon--sm fr-text--bold fr-icon-quote-line fr-mb-0 badge-commentaire">
          {{ lengthMessage }}
        </span>
        <span v-if="!open" class="fr-icon fr-icon-add-line fr-icon--sm color-green" aria-hidden="true"></span>
        <span v-else class="fr-icon fr-icon-subtract-line fr-icon--sm color-green" aria-hidden="true"></span>
      </div>
    </div>
    <div :hidden="!open">
      <figure v-if="permissions.isOc && record.audit_notes" class="fr-quote">
        <figcaption>
          <p class="fr-quote__author">Notes de fin de controle</p>
        </figcaption>
        <blockquote>
          <p>{{ record.audit_notes }}</p>
        </blockquote>
      </figure>

      <figure v-if="displayCallout" class="fr-quote">
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

<style>
.notification {
  border: 1px solid var(--blue-france-950-100);
  justify-content: space-between;
}

.left-block {
  gap: 8px;
}

.error-text {
  text-transform: uppercase;
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
}

.notifications-icon {
  color: var(--blue-ecume-sun-247-moon-675);
  background-color: var(--blue-ecume-925-125);
}

.color-green {
  color: var(--green-bourgeon-sun-425-moon-759);
}

.bg-bourgeon {
  background-color: var(--green-bourgeon-975-75);
}

.notif-title {
  justify-content: space-between;
}

.badge-commentaire {
  background-color: rgba(254, 236, 194, 1);
  padding: 0px 6px;
  border-radius: 4px;
}

.badge-commentaire::before {
  margin-right: 3px;
}

.icons {
  gap: 5px;
  cursor: pointer;
}

.notif-title {
  cursor: pointer;
}
</style>
