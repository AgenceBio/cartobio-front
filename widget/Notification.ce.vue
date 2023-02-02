<template>
  <OperatorSetup v-if="isVerified && canImport" class="fr-container--fluid fr-my-5w"  @import:start="onUploadStart" @import:complete="onSuccess" @import:error="onError" />

  <div v-if="!isVerified" class="fr-alert fr-alert--info fr-mb-5w">
    <p class="fr-alert__title">Connexion à CartoBio</p>
    <p>Établissement d'une connexion sécurisée.</p>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeMount } from 'vue'

import OperatorSetup from '@/components/OperatorSetup/index.vue'
import store from '@/store.js'
import { exchangeNotificationToken, getOperatorParcelles } from '@/cartobio-api.js'

const props = defineProps({ 'auth-token': String })
const emit = defineEmits(['import:start', 'import:complete', 'import:error'])

const uploadState = ref(null)

const isVerified = computed(() => store.currentUser?.id)
const canImport = computed(() => uploadState !== 'complete')

onBeforeMount(async () => {
  const token = await exchangeNotificationToken(props.authToken)
  console.log({ token })
  if (token.id) {
    store.setCurrentUser(token)
    const parcelles = await getOperatorParcelles(token.id)
  }
})

function onUploadStart () {
  console.log('import:start')
  emit('import:start')
  uploadState.value = 'start'
}

function onSuccess ({ geojson, source }) {
  console.log('import:complete', { geojson, source })
  emit('import:start', { geojson, source })
  uploadState.value = 'complete'
}

function onError (error) {
  console.error('import:error', error)
  emit('import:error', error)
  uploadState.value = 'error'
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
