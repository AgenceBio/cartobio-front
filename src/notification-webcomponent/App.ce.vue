<template>
  <h2>Utilisateur #{{ store.state.currentUser.id }}</h2>
  <OperatorSetup v-if="uploadState !== 'complete'" class="fr-container--fluid fr-my-5w"  @import:start="onUploadStart" @import:complete="onSuccess" @import:error="onError" />
  <div v-else class="fr-alert fr-alert--success fr-mb-5w">
    <p class="fr-alert__title">Import réussi</p>
    <p>Merci, et à bientôt !</p>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'

import OperatorSetup from '../components/OperatorSetup/index.vue'
import store from '../store.js'
import { parse } from '../jwt.js'


const props = defineProps({ 'auth-token': String })
const emit = defineEmits(['import:start', 'import:complete', 'import:error'])

const uploadState = ref(null)

onBeforeMount(() => {
  const token = parse(props.authToken)
  if (token.id) {
    store.loginUser(token)
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
@charset "utf-8";
@import '@gouvfr/dsfr/dsfr.main.css';
@import '@gouvfr/dsfr/utility/icons/icons.css';

a[aria-disabled] {
  --text-action-high-blue-france: gray;
  --border-action-high-blue-france: gray;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
