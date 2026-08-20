<script setup>
import { computed, useId } from "vue";

const props = defineProps({
  value: { type: Number, required: true },
  max: { type: Number, required: true },
  title: { type: String, default: "" },
  label: { type: String, default: "" },
  infoText: { type: String, default: "" },
  ariaText: { type: String, default: "" },
});

const fmt = new Intl.NumberFormat("fr-FR");
const titleId = `jauge-title-${useId()}`;

const pct = computed(() => {
  if (props.max <= 0) return 0;
  return Math.min(100, Math.max(0, (props.value / props.max) * 100));
});

const showLabel = computed(() => Boolean(props.label) && pct.value >= 30);

const ariaValueNow = computed(() => Math.min(Math.max(props.value, 0), Math.max(props.max, 0)));

const ariaValueText = computed(
  () =>
    props.ariaText ||
    `${fmt.format(props.value)} ${props.label.toLowerCase()} sur ${fmt.format(props.max)}, soit ${Math.round(pct.value)} %`,
);
</script>

<template>
  <div class="jauge-avancement">
    <p v-if="title" :id="titleId" class="jauge-title fr-text--bold fr-mb-1w">
      {{ title }}
      <button
        v-if="infoText"
        type="button"
        class="jauge-info fr-icon-information-line"
        v-tooltip="{ text: infoText, position: 'top' }"
      />
    </p>

    <div class="jauge-row">
      <div
        class="jauge-track"
        role="progressbar"
        aria-valuemin="0"
        :aria-valuenow="ariaValueNow"
        :aria-valuemax="max"
        :aria-valuetext="ariaValueText"
        :aria-labelledby="title ? titleId : undefined"
        :aria-label="title ? undefined : label || 'Progression'"
      >
        <div class="jauge-fill" :class="{ 'jauge-fill--compact': !showLabel }" :style="{ width: `${pct}%` }">
          <span v-if="showLabel" class="jauge-label">{{ label }}</span>
          <span class="jauge-badge">{{ fmt.format(value) }}</span>
        </div>
      </div>
      <span class="jauge-total" aria-hidden="true">{{ fmt.format(max) }}</span>
    </div>
  </div>
</template>

<style scoped>
.jauge-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-title-grey);
}

.jauge-info {
  background: none;
  border: none;
  padding: 0;
  cursor: help;
  color: var(--text-action-high-blue-france);
}

.jauge-info::before {
  --icon-size: 1.25rem;
}

.jauge-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.jauge-track {
  flex: 1;
  display: flex;
  height: 36px;
  background: var(--background-contrast-blue-france);
  border-radius: 1.5rem;
}

.jauge-fill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: max-content;
  height: 100%;
  padding: 0 0.375rem 0 1rem;
  background: var(--background-action-high-blue-france);
  border-radius: 1.5rem;
  color: var(--text-inverted-blue-france);
  transition: width 0.4s ease-in-out;
}

.jauge-fill--compact {
  justify-content: center;
  padding: 0 0.375rem;
}

.jauge-label {
  font-size: 14px;
  white-space: nowrap;
}

.jauge-badge {
  flex-shrink: 0;
  padding: 2px 10px;
  background: var(--background-default-grey);
  color: var(--text-action-high-blue-france);
  border-radius: 1rem;
  font-size: 14px;
}

.jauge-total {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-action-high-blue-france);
}
</style>
