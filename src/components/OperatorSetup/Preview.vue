<template>
  <section>
    <div class="fr-alert fr-alert--success fr-mb-3w">
      <p class="fr-alert__title">Nous avons identifié {{ featureCollection.features.length }} parcelles ({{ surfaceTotale }}&nbsp;ha).</p>
    </div>

    <div class="fr-alert fr-alert--warning fr-mb-3w" v-for="(warning, i) in warnings" :key="i">
      <p v-if="(warning instanceof FeatureNotFoundError)">
        La référence cadastrale <ReferenceCadastrale class="fr-text--bold" :reference="warning.id" /> est introuvable dans le parcellaire informatisé.
      </p>
      <p v-else>{{ warning }}</p>
    </div>

    <MapPreview :controls="false" :collection="featureCollection" class="fr-mb-3w" />

    <p>
      <button class="fr-btn" @click="emit('submit')">
        Importer ces données
      </button>
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

import MapPreview from '@/components/Map/Preview.vue'
import ReferenceCadastrale from '@/components/Features/ReferenceCadastrale.vue';

import { surface, inHa, FeatureNotFoundError } from '@/components/Features/index.js'

const emit = defineEmits(['submit', 'cancel'])
const props = defineProps({
  featureCollection: {
    type: Object,
    required: true
  },
  warnings: {
    type: Array,
    default: () => ([])
  }
})

const surfaceTotale = computed(() => inHa(surface(props.featureCollection)))
</script>
