<template>
  <section class="fr-accordion">
    <h3 class="fr-accordion__title">
      <button
        class="fr-accordion__btn"
        :aria-expanded="!isClosed"
        @click="handleToggle"
        :aria-controls="elementId"
        type="button"
      >
        <span>{{ title }}</span>
        <span class="fr-badge fr-badge--warning fr-badge--no-icon" v-if="requiresAction">À préciser</span>
      </button>
    </h3>

    <div
      ref="contentElement"
      :class="{ 'fr-collapse': true, 'fr-collapsing': isExpanding, 'fr-collapse--expanded': isOpen }"
      :id="elementId"
    >
      <slot name="default" />
    </div>
  </section>
</template>

<script setup>
import { computed, inject, nextTick, ref, watch } from "vue";

const activeAccordionId = inject("openAccordion", () => ref(null));

const props = defineProps({
  open: {
    type: Boolean,
  },
  requiresAction: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
});

const STATE = {
  CLOSED: 0,
  EXPANDING: 1,
  OPEN: 2,
};

const contentElement = ref(null);
const elementId = ref(`accordion-${crypto.randomUUID()}`);
const openingState = ref(props.open || props.requiresAction ? STATE.OPEN : STATE.CLOSED);

const isClosed = computed(() => openingState.value === STATE.CLOSED);
const isOpen = computed(() => openingState.value === STATE.OPEN);
const isExpanding = computed(() => openingState.value === STATE.EXPANDING);

function handleToggle() {
  openingState.value = isClosed.value ? STATE.EXPANDING : STATE.CLOSED;
  activeAccordionId.value = isExpanding.value ? elementId.value : null;
}

watch(openingState, (newState) => {
  if (newState === STATE.EXPANDING) {
    nextTick(() => (openingState.value = STATE.OPEN));
  }
});

if (activeAccordionId) {
  watch(activeAccordionId, (newId) => {
    if (newId && newId !== elementId.value) {
      openingState.value = STATE.CLOSED;
    }
  });
}
</script>

<style scoped>
.fr-collapse--expanded {
  --collapse-max-height: none;
}

.fr-accordion__btn {
  gap: 1rem;

  span:first-child {
    flex: 1;
  }
}
</style>
