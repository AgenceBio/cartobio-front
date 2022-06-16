<template>
  <h1>Hello {{ label }}</h1>

  <p><button class=" searchBtnCommun  AdvancedsearchBtn">Stylé !</button></p>

  <p>Auth token : <code>{{ authToken }}</code></p>

  <ParcellaireSetup />
</template>

<script setup>
import { ref } from 'vue'
import ParcellaireSetup from '../pages/operateur/setup.vue'

defineProps({
  'auth-token': String
})

const label = ref('Cartobio')
</script>

<style>
@charset "utf-8";

@import '@gouvfr/dsfr/dsfr.css';
@import '@gouvfr/dsfr/utility/icons/icons.css';
@import '../styles/variables.css';

a[aria-disabled] {
  --text-action-high-blue-france: gray;
  --border-action-high-blue-france: gray;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
