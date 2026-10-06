<script setup lang="ts">
import { formatNumberWithSpaces } from "@/utils/numbers.formatters";

defineProps<{
  title: string;
  value: number | string | null | undefined;
  total?: number | null;
  badge?: string | number | null;
  variant?: "default" | "error" | "warning";
  picto?: string;
  pictoAlt?: string;
}>();
</script>

<template>
  <div
    class="stats-card"
    :class="{
      'stats-card--error': variant === 'error',
      'stats-card--warning': variant === 'warning',
    }"
  >
    <div class="stats-card__header">
      <span class="stats-card__title fr-text--lg fr-mb-0">{{ title }}</span>
      <span v-if="badge !== null && badge !== undefined" class="stats-card__badge fr-text--xs fr-mb-0">
        {{ badge }}&nbsp;%
      </span>
    </div>
    <div class="stats-card__content">
      <div>
        <span class="stats-card__value fr-h6 fr-mb-0">{{ formatNumberWithSpaces(value) ?? "—" }}</span>
        <span v-if="total !== undefined && total !== null" class="fr-text--md">
          / {{ formatNumberWithSpaces(total) }}</span
        >
      </div>
      <img v-if="picto" :src="picto" :alt="pictoAlt ?? ''" width="42" height="42" />
    </div>
  </div>
</template>

<style scoped>
.stats-card {
  background: #fff;
  border-left: 4px solid var(--light-options-illustration-color-850-default-green-menthe-850, #73e0cf);
  border-radius: 0 0 48px 0;
  padding: 14px 20px;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.stats-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stats-card__badge {
  background-color: #8bf8e7;
  color: var(--light-options-illustration-color-sun-default-green-menthe-sun-373, #37635f);
  padding: 2px 8px;
  border-radius: 12px;
}
.stats-card__content {
  margin-top: 2rem;
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.stats-card__value {
  color: var(--light-options-illustration-color-sun-default-green-menthe-sun-373, #37635f);
}

/* Rouge */
.stats-card--error {
  border-left-color: var(--light-options-system-color-850-error-850, #ffbdbd);
}
.stats-card--error .stats-card__badge {
  background: var(--light-options-system-color-925-error-925, #ffdbdb);
  color: var(--light-decisions-text-text-action-high-error, #ce0500);
}
.stats-card--error .stats-card__value {
  color: var(--dark-options-system-color-625-default-error-625, #ff5655);
}

/* Orange */
.stats-card--warning {
  border-left-color: var(--light-options-illustration-color-850-default-yellow-moutarde-850, #fcc63a);
}
.stats-card--warning .stats-card__badge {
  background: var(--light-options-illustration-color-925-default-yellow-moutarde-925, #fde2b5);
  color: var(--light-options-illustration-color-sun-default-yellow-moutarde-sun-348, #695240);
}
.stats-card--warning .stats-card__value {
  color: var(--light-options-illustration-color-sun-default-yellow-moutarde-sun-348, #695240);
}
</style>
