<template>
  <div class="fr-card fr-enlarge-link">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <a href="#from-scratch" @click.prevent="confirmImport" role="button">
            Créer un parcellaire de zéro
          </a>
        </h3>
        <div class="fr-card__desc">
          <p>
            Ajouter les parcelles une par une,
            par référence cadastrale
            ou en dessinant sur un fond de carte.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { sources } from '@/referentiels/imports.js'

const emit = defineEmits(['save'])

defineProps({
  operator: {
    type: Object,
    required: true
  }
})

function confirmImport () {
  emit('save', {
    geojson: { type: 'FeatureCollection', features: [] },
    source: sources.MANUAL,
    warnings: []
  })
}
</script>
