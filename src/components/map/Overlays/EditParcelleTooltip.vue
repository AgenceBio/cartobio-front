<template>
  <div class="openlayer-tooltip-container">
    <div class="fr-text--bold legend"><i class="ri-custom-size" aria-hidden="true" />{{ area }} ha</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  area: number;
}

defineProps<Props>();
</script>

<style scoped>
.openlayer-tooltip-container {
  background: white;
  padding: 8px 12px;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.openlayer-tooltip-container .legend {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
