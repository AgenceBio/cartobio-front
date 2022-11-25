<template>
  <header>
    <h4 class="fr-h4 fr-mb-1w">{{ operator.nom }}</h4>
    <p class="fr-subtitle">
      <ParcellaireState :record="record" />
    </p>
  </header>
</template>

<script setup>
import ParcellaireState from '@/components/Certification/State.vue'

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
</script>
