<template>
  <div class="button-group">
    <div class="left-button">
      <button class="fr-btn fr-btn--tertiary-no-outline" @click="emit('openDetail')">
        <i class="ri-arrow-right-double-line"></i>
      </button>
    </div>

    <div class="mode-choice" v-if="isDraw">
      <button class="fr-btn fr-btn--tertiary-no-outline" @click="emit('compare')">
        <i class="ri-arrow-left-right-line"></i> Comparer
      </button>
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-icon-add-line fr-btn--icon-left"
        @click="emit('addParcelle')"
      >
        Ajouter une parcelle
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref, watch } from "vue";

/**
 * * Props
 */
const props = defineProps<{
  isDraw: boolean;
}>();

/**
 * * Refs
 */
const isDraw = ref<boolean>(props.isDraw);

/**
 * * Emits
 */
const emit = defineEmits<{
  (e: "addParcelle"): void;
  (e: "compare"): void;
  (e: "openDetail"): void;
}>();

/**
 * * Watchers
 */
watch(
  () => props.isDraw,
  (newValue) => {
    isDraw.value = newValue;
  },
);
</script>

<style scoped>
.mode-choice {
  background: #ffffff;
  padding: 10px;
  justify-content: space-between;
  gap: 10px;
  height: fit-content;
  position: absolute;
  top: 10px;
  left: 35%;
  display: flex;
  gap: 10px;
}

.left-button {
  background: #ffffff;
  justify-content: space-between;
  gap: 10px;
  height: fit-content;
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
}

.left-button > button {
  border-radius: 4px;
  width: 44px;
  height: 44px;
  text-align: center;
}

.button-group {
  width: 100%;
  z-index: 1;
  position: absolute;
}
</style>
