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
        <div style="display: flex; flex-direction: column; align-items: flex-start">
          <span>{{ title }}</span>
          <span
            v-if="optionsSelected && (!Array.isArray(optionsSelected) || optionsSelected.length > 0)"
            class="small-text"
            >{{
              Array.isArray(optionsSelected)
                ? optionsSelected.length > 1
                  ? optionsSelected.length + " sélections"
                  : "1 sélection"
                : optionsSelected
            }}<template v-if="optionsSuffix"> | {{ optionsSuffix }}</template></span
          >
          <span class="fr-badge fr-badge--warning fr-badge--no-icon" v-if="requiresAction">À préciser</span>
        </div>
      </button>
    </h3>

    <div
      ref="contentElement"
      :class="{ 'fr-collapse': true, 'fr-collapsing': isExpanding, 'fr-collapse--expanded': isOpen }"
      :id="elementId"
    >
      <slot v-if="isOpen" name="default" />
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
  optionsSelected: {
    type: [String, Array],
    required: false,
  },
  optionsSuffix: {
    type: [String, Number],
    required: false,
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
  if (isClosed.value) {
    openingState.value = STATE.EXPANDING;
    activeAccordionId.value = elementId.value;

    setTimeout(() => {
      openingState.value = STATE.OPEN;
    }, 500);
  } else {
    openingState.value = STATE.CLOSED;
    activeAccordionId.value = null;
  }
}

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

.fr-collapsing {
  overflow: hidden !important;
}

.small-text {
  color: grey;
  font-size: 12px;
}
</style>
