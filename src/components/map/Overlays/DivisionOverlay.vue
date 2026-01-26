<template>
  <div class="division-overlay">
    <p class="fr-text--bold fr-mb-1w">{{ libelle }}</p>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
      <span class="area-info blue"></span>
      1: {{ area1 }} ha
    </div>
    <div style="display: flex; align-items: center; gap: 8px">
      <span class="area-info green"></span>
      2: {{ area2 }} ha
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  libelle: string;
  area1: string;
  area2: string;
}

defineProps<Props>();
</script>

<style scoped>
.division-overlay {
  background: white;
  padding: 8px 12px;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  border-radius: 4px;
}

.area-info {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.area-info.blue {
  background-color: rgba(0, 123, 255, 0.6);
}

.area-info.green {
  background-color: rgba(40, 167, 69, 0.6);
}
</style>
