<template>
  <Loading v-if="!isVerified" class="message fr-mb-5w">Établissement d'une connexion sécurisée à CartoBio.</Loading>

  <div v-else-if="isVerified && !isAuthenticated" class="fr-alert fr-alert--error fr-mb-5w">
    <p class="fr-alert__title">Connexion à CartoBio</p>
    <p>Impossible d'établir une connexion sécurisée.</p>
  </div>

  <OperatorSetup v-else-if="canImport" class="fr-container--fluid fr-my-5w"  @import:start="onUploadStart" @import:complete="onSuccess" @import:error="onError" :sources="[sources.TELEPAC]" />

  <div v-else-if="uploadState === 'complete'" class="fr-alert fr-alert--success fr-mb-5w">
    <p class="fr-alert__title">Parcellaire importé avec succès.</p>

    <p>Il sera mis à disposition de l'organisme certificateur {{ user.organismeCertificateur.nom }} pour votre premier audit.</p>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue'
import { storeToRefs } from 'pinia'

import Loading from '@/components/Loading.vue'
import OperatorSetup from '@/components/OperatorSetup/index.vue'
import { useUserStore } from '@/stores/user.js'
import { exchangeNotificationToken } from '@/cartobio-api.js'
import { sources } from '@/referentiels/imports.js'

const props = defineProps({ authToken: String })
const emit = defineEmits(['error', 'import:ready', 'import:started', 'import:complete', 'import:errored'])

const uploadState = ref(null)
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const isVerified = ref(false)
const isAuthenticated = computed(() => user.value.id)
const canImport = computed(() => isVerified.value && isAuthenticated.value && uploadState.value !== 'complete')

onBeforeMount(async () => {
  try {
    const { token: cartobioToken } = await exchangeNotificationToken(props.authToken)

    if (cartobioToken) {
      userStore.login(cartobioToken)
    }
  }
  catch (error) {
    uploadState.value = 'error'
    emit('import:errored', error)
    emit('error', error)
  }
  finally {
    isVerified.value = true
    emit('import:ready')
  }
})

function onUploadStart () {
  emit('import:started')
  uploadState.value = 'start'
}

function onSuccess ({ geojson, source }) {
  emit('import:complete', { geojson, source })
  uploadState.value = 'complete'
}

function onError (error) {
  console.error(error)
  uploadState.value = 'error'
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
