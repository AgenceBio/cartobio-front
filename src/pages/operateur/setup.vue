<route lang="yaml">
meta:
  requiresAuth: true
</route>

<template>
  <div class="fr-container fr-my-5w">
    <h2>
      Importer mon parcellaire
    </h2>

    <p>
      Sélectionner l’outil où votre parcellaire est maintenu à jour.
    </p>

    <div class="fr-tabs">
      <ul class="fr-tabs__list" role="tablist">
        <li v-for="(source, sourceId) in featureSources" role="presentation" :key="sourceId">
          <button class="fr-tabs__tab" :disabled="!source.component" type="button" :aria-selected="sourceId === featureSource" @click="featureSource = sourceId">{{ source.label }}</button>
        </li>
      </ul>

      <Component :is="featureSources[featureSource].component" currentUser @upload:ok="handleUpload" :class="{ 'fr-tabs__panel': true, 'fr-tabs__panel--selected': true }" role="tabpanel" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import store from '../../store.js'
import { statsPush } from '../stats.js'
import { submitParcelles } from '../../cartobio-api.js'

import featureSources from '../../components/OperatorSetup/index.js'

const router = useRouter()
const featureSource = ref(store.state.parcellaireSource ?? 'telepac')

watch(featureSource, () => statsPush(['trackEvent', 'setup', 'sourceSelect', featureSource.value]))

async function handleUpload ({ geojson, source }) {
  await submitParcelles(geojson, { source })

  statsPush(['trackEvent', 'setup', `import:${featureSource.value}`, 'ok'])
  router.push('/operateur/certification-ab')
}
</script>

<style scoped>
[aria-current="true"] {
  font-weight: bold;
}

.sources {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 0;
}

article .screenshot {
  max-width: min(500px, 50vw);
}

details.help summary {
  display: block;
}
</style>
