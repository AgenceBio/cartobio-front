<template>
  <component :is="Modal" v-bind="$attrs" icon="fr-icon-calendar-2-line">
    <template #title>{{ operator.nom }}</template>

    <div class="history-cards" role="list">
      <div class="fr-card fr-mb-3w" v-for="(entry, i) in record.audit_history" :key="i" role="listitem">
        <div class="fr-card__body">
          <div class="fr-card__content">
            <div class="fr-card__desc">
              <p class="fr-icon-account-circle-line fr-quote__source fr-text--sm" v-if="entry.userId">
                par <b>{{ entry.userName }}</b>
                <span v-if="entry.userRoleId">({{ entry.userRole }})</span>
                <span v-else-if="entry.userOrgId">({{ entry.userOrg }})</span>
              </p>

              <p v-if="entry.description">{{ entry.description }}</p>

              <p class="fr-icon-arrow-right-line fr-icon--sm fr-quote__source fr-text--sm fr-mb-0">
                <span aria-hidden="true" />
                {{ ddmmmmyyyy(entry.date) }}
              </p>
            </div>

            <div class="fr-card__start">
              <ul class="fr-tags-group">
                <li v-if="entry.state">
                  <CertificationState :state="entry.state" />
                </li>
              </ul>
          </div>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup>
import { ddmmmmyyyy } from '@/components/dates.js'

import Modal from '@/components/Modal.vue'
import CertificationState from '@/components/Certification/State.vue'

defineProps({
  operator: {
    type: Object,
    required: true
  },
  record: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.history-cards {
  display: flex;
  flex-direction: column-reverse;
}
</style>
