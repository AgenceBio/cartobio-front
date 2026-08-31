<script setup lang="ts">
import { useCC } from "@/composables/tableau-de-bord/useCC";

const props = defineProps<{
  value: string | number | null | undefined;
  label: string;
  hint?: boolean;
}>();

const { copiedValue, copyValue } = useCC();
</script>

<template>
  <span class="copyable-value" :class="{ 'fr-hint-text': hint }">
    {{ props.value }}
    <button
      v-if="props.value"
      type="button"
      class="fr-btn fr-btn--tertiary-no-outline fr-icon-clipboard-line fr-btn--sm copy-button"
      :aria-label="`Copier le ${props.label.toLowerCase()} ${props.value}`"
      @click.stop="copyValue(props.value, props.label)"
    >
      <span class="fr-sr-only">Copier le {{ props.label.toLowerCase() }}</span>
    </button>
    <span v-if="copiedValue" class="fr-sr-only" aria-live="polite">{{ copiedValue }}</span>
  </span>
</template>

<style scoped>
.copyable-value {
  display: inline-flex;
  align-items: center;
}
.copy-button {
  width: 1.5rem;
  min-width: 1.5rem;
  min-height: 1.5rem;
  margin: 0;
  padding: 0;
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}
.copyable-value:hover .copy-button,
.copy-button:focus-visible {
  opacity: 1;
}
</style>
