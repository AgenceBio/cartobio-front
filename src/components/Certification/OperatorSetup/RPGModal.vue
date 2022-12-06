<template>
  <component :is="Modal" v-bind="$attrs" icon="fr-icon-checkbox-circle-fill">
    <template #title>Import des données PAC de 2021</template>

  </component>
</template>

<script setup>
import Modal from '@/components/Modal.vue'
</script>
