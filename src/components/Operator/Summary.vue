<template>
  <header>
    <h4 class="fr-h4 fr-mb-1w">{{ operator.nom }}</h4>
    <p class="fr-subtitle">
      <ParcellaireState :record="record" />
    </p>

    <div class="fr-callout fr-callout--blue-ecume" v-if="displayCallout">
      <h3 class="fr-callout__title">Demandes formulées lors de l'audit</h3>

      <div v-html="record.audit_demandes" />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import ParcellaireState from '@/components/Certification/State.vue'

import { isCertificationImmutable } from '@/referentiels/ab.js'

const props = defineProps({
  operator: {
    type: Object,
    required: true
  },
  record: {
    type: Object,
    required: true
  }
})

const displayCallout = computed(() => props.record.audit_demandes && isCertificationImmutable(props.record.certification_state))
</script>
