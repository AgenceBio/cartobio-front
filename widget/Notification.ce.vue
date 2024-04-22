<template>
  <Loading v-if="!hasBooted" class="message fr-mb-5w">Établissement d'une connexion sécurisée à CartoBio.</Loading>

  <div v-else-if="hasBooted && !isAuthenticated" class="fr-alert fr-alert--error fr-mb-5w">
    <p class="fr-alert__title">Connexion à CartoBio</p>
    <p>Impossible d'établir une connexion sécurisée.</p>
  </div>

  <OperatorSetupFlow
    v-else-if="canImport"
    class="fr-container--fluid fr-my-5w"
    flow-id="source"
    :operator="operator"
    :actions="operatorSetupActions"
    @error="emit('error', $event)"
    @upload="onUpload"
    @submit="onSubmit"
    @redirect="onRedirect"
  />
</template>

<script setup>
import { computed, markRaw, onBeforeMount, ref, watch } from 'vue'

import Loading from '@/components/Loading.vue'
import OperatorSetupFlow from '@/components/OperatorSetup/Flow.vue'
import FlowMultiSources from '@/components/OperatorSetup/Flows/MultiSources.vue'
import { exchangeNotificationToken, setAuthorization } from '@/cartobio-api.js'
import { sources } from '@/referentiels/imports.js'

const props = defineProps({ authToken: String })
const emit = defineEmits(['error', 'import:ready', 'import:started', 'import:complete', 'import:errored'])

const operator = ref(null)
const token = ref('')

const hasBooted = ref(false)
const isAuthenticated = computed(() => token.value)
const canImport = computed(() => hasBooted.value && isAuthenticated.value)

const operatorSetupActions = [
  {
    id: 'source',
    selector: null,
    wizzard: markRaw(FlowMultiSources),
    extraProps: {
      sources: [
        sources.GEOFOLIA,
        sources.MESPARCELLES,
        sources.TELEPAC,
        sources.CVI,
        sources.ANYGEO
      ]
    }
  },
]

onBeforeMount(async () => {
  try {
    const exchangeToken = await exchangeNotificationToken(props.authToken)

    operator.value = exchangeToken.operator
    token.value = exchangeToken.token
    emit('import:ready')
  }
  catch (error) {
    emit('import:errored', error)
    emit('error', error)
  }
  finally {
    hasBooted.value = true
  }
})

watch(token, (newToken) => setAuthorization(newToken))

function onUpload ({ geojson, metadata, warnings }) {
  emit('import:started', { geojson, metadata, warnings })
}

function onSubmit (record) {
  emit('import:complete', {
    geojson: record.parcelles,
    source: record.metadata.source
  })
}

function onRedirect (record) {
  const self = new URL(import.meta.url)
  window.open(`${self.protocol}//${self.host}/exploitations/${record.numerobio}`, '_blank')
}

function onError (error) {
  console.error(error)
  emit('import:errored', error)
  emit('error', error)
}
</script>

<style>
@import '@gouvfr/dsfr/dsfr.main.css';
@import '@gouvfr/dsfr/utility/icons/icons.css';

a[aria-disabled] {
  --text-action-high-blue-france: gray;
  --border-action-high-blue-france: gray;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
