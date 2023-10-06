<template>
  <div class="fr-accordions-group">
    <slot name="default" />
  </div>
</template>

<script setup>
import { provide, ref } from 'vue'

const openElement = ref(null)

provide('openAccordion', openElement)
</script>

<style scoped>
.fr-collapse {
  --collapse-max-height: none;
}
</style>
