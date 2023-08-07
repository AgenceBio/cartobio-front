<template>
  <section>
    <div class="fr-alert fr-alert--success fr-mb-3w">
      <p class="fr-alert__title">Nous avons identifié {{ featureCollection.features.length }} parcelles ({{ surfaceTotale }}&nbsp;ha).</p>
    </div>

    <div class="fr-alert fr-alert--warning fr-mb-3w" v-for="(warning, i) in warnings" :key="i">
      <p>{{ warning }}</p>
    </div>

    <MapPreview :controls="false" :collection="featureCollection" class="fr-mb-3w" />

    <p>
      <button class="fr-btn" @click="emit('submit')">
        Import des données
      </button>
    </p>

    <p>
      <button class="fr-btn fr-btn--secondary" @click="emit('cancel')">
        Revenir à l'étape précédente
      </button>
    </p>
  </section>
</template>

<script setup>
import { computed, inject } from 'vue'

import MapPreview from '@/components/Map/Preview.vue'

import { surface, inHa } from '@/components/Features/index.js'

const featureCollection = inject('featureCollection')
const warnings = inject('importWarnings')

const emit = defineEmits(['submit', 'cancel'])

const surfaceTotale = computed(() => inHa(surface(featureCollection.value)))
</script>
