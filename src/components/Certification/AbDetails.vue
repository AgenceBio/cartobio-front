<template>
  <div class="fr-card fr-card--sm fr-card--horizontal">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h4 class="fr-card__title">
          <router-link to="/exploitation/certification-ab">
            Ma certification&nbsp;<abbr title="Agriculture Biologique">AB</abbr>
          </router-link>
        </h4>

        <p class="fr-card__desc">
          Vous êtes engagé·e en bio depuis le {{ dateFormat(currentUser.dateEngagement) }}
          <span v-if="currentCertificate">avec {{ currentCertificate.organisme }}</span>.
        </p>

        <!-- <div class="fr-card__end">
          <p class="fr-card__detail fr-icon-award-fill">obtenir mes certificats et justificatifs</p>
        </div> -->
      </div>

      <div class="fr-card__footer">
        <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--sm fr-btns-group--icon-left">
          <li v-if="currentCertificate">
            <a class="fr-btn fr-btn--secondary fr-icon-file-download-fill" :aria-disabled="!currentCertificate.url" :href="currentCertificate.url" target="_blank" rel="noopener noreferrer">
              Mon certificat
            </a>
          </li>
          <!-- <li>
            <a class="fr-btn fr-btn--secondary fr-icon-file-download-fill" aria-disabled href="#" target="_blank" rel="noopener noreferrer">
              Attestation de notification
            </a>
          </li> -->
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'

import store from '../../store.js'
import { dateFormat } from '../dates.js'

defineProps({
  user: {
    type: Object,
    required: true
  }
})

const { currentUser } = toRefs(store.state)

const currentCertificate = computed(() => currentUser.value.certificats.at(-1))
</script>

<style scoped>
.fr-card__footer .fr-links-group {
  margin-bottom: unset;
}
</style>
