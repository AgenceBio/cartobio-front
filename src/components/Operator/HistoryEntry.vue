<template>
  <div class="fr-card fr-mb-3w" :data-state="entry.state" :data-type="entry.type" role="listitem">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <div class="fr-card__desc">
          <p class="fr-icon-user-line" v-if="entry.user && entry.user.id">
            par <b>{{ entry.user.nom }}</b>
            <span class="fr-ml-1w" v-if="isOc">({{ entry.user.organismeCertificateur.nom }})</span>
          </p>

          <p v-if="entry.description">{{ entry.description }}</p>

          <p v-if="entry.type === EventType.FEATURE_COLLECTION_CREATE && entry.metadata" class="fr-icon-download-line">
            {{ entry.metadata.source }}
            {{ entry.metadata.campagne }}<span v-if="entry.metadata.pacage">, PACAGE {{ entry.metadata.pacage }}</span>
          </p>

          <p v-if="entry.type === EventType.FEATURE_COLLECTION_UPDATE && entry.featureIds" class="fr-icon-arrow-right-line">
            {{ plurals(entry.featureIds.length, { one: 'parcelle', other: 'parcelles' }) }}
          </p>

          <p v-if="entry.type === EventType.FEATURE_DELETE" class="fr-icon-arrow-right-line">
            Raison : {{ deletionReason }}
          </p>

          <p class="fr-icon-calendar-line">
            <span aria-hidden="true" />
            {{ ddmmmmyyyy(entry.date) }}
          </p>
        </div>

        <div class="fr-card__start">
          <ActionType :type="entry.type" :state="entry.state" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ddmmmmyyyy } from '@/components/dates.js'
import { EventType } from '@/cartobio-api.js'
import { deletionReasons } from '@/components/Features/index.js';

import ActionType from '@/components/Certification/ActionType.vue'
import { resolveCampagneFromDate } from '@/referentiels/pac';

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
})

const RE = /OC/
const isOc = computed(() => RE.test(props.entry.user?.mainGroup?.nom))

const pr = new Intl.PluralRules('fr-FR')
function plurals (count, { zero, one, other }) {
  const rules = { zero, one, other }
  const suffix = rules[pr.select(count)]
  return `${count} ${suffix}`
}

/**
 * We pick the details, or the associated label of a reason code
 */
const deletionReason = computed(() => {
  if (props.entry.type === EventType.FEATURE_DELETE) {
    const { code, details } = props.entry.metadata.reason
    return details || (deletionReasons.find(r => r.code === code)?.label ?? '')
  }

  return ''
})
</script>

<style scoped>
.fr-card__content {
  --text-spacing: 0.5rem;
  padding: 1.5rem;

  .fr-card__desc {
    margin-top: 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  p[class*="fr-icon"] {
    color: var(--text-mention-grey);
    font-size: 0.75rem;

    &::before {
      --icon-size: 1rem;
      margin-right: var(--text-spacing);
    }
  }
}
</style>
