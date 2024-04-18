<route lang="yaml">
  meta:
    generalAudience: true
    seo:
      title: Statistiques d'usage de CartoBio
  </route>

<template>
  <div class="fr-container fr-py-9v">
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <h1>Statistiques projet</h1>

        <iframe :src frameborder="0" width="100%" height="800" ref="el" allowtransparency />
      </div>
    </div>
  </div>
</template>

<script setup>
import { readonly } from 'vue'
import { getStatsIframeUrl } from '@/cartobio-api.js'

const src = readonly(await getStatsIframeUrl())
</script>
