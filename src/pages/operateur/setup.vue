<route lang="yaml">
classNames: fr-container fr-my-5w
meta:
  requiresAuth: true
</route>

<template>
  <div class="fr-container fr-my-5w">
    <h2>Importer mon parcellaire</h2>

    <p>
      Sélectionner l’outil où votre parcellaire est maintenu à jour.
    </p>

    <OperatorSetup @import:start="onUploadStart" @import:complete="onSuccess" @import:error="onError" ref="importTool" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { statsPush } from '../stats.js'

import OperatorSetup from '../../components/OperatorSetup/index.vue'

const router = useRouter()
const importTool = ref(null)

onMounted(() => {
  watch(() => importTool.value.featureSource, () => {
    statsPush(['trackEvent', 'setup', 'sourceSelect', importTool.value.featureSource])
  })
})

function onUploadStart () {
  statsPush(['trackEvent', 'setup', `import:${importTool.value.featureSource}`, 'start'])
}

function onSuccess () {
  statsPush(['trackEvent', 'setup', `import:${importTool.value.featureSource}`, 'ok'])
  router.push('/operateur/certification-ab')
}

function onError (error) {
  statsPush(['trackEvent', 'setup', `import:${importTool.value.featureSource}`, 'error'])
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
