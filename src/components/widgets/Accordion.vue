<template>
  <section class="fr-accordion">
    <h3 class="fr-accordion__title">
      <button
        class="fr-accordion__btn"
        :aria-expanded="!isClosed"
        @click="handleToggle"
        :aria-controls="elementId"
        type="button"
        aria-label="Modifier les éléments sélectionnés"
      >
        <div
          :style="{
            display: 'flex',
            flexDirection: optionsCulture ? 'row' : 'column',
            alignItems: optionsCulture ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            gap: optionsCulture ? '0.5rem' : '0',
          }"
        >
          <span>{{ title }}</span>
          <span
            v-if="optionsSelected && (!Array.isArray(optionsSelected) || optionsSelected.length > 0)"
            class="small-text"
          >
            {{
              Array.isArray(optionsSelected)
                ? optionsSelected.length > 1
                  ? optionsSelected.length + " sélections"
                  : "1 sélection"
                : optionsSelected
            }}
            <template v-if="optionsSuffix"> | {{ optionsSuffix }}</template>
          </span>

          <span v-if="optionsCulture" class="fr-hint-text culture-name">
            <span :class="optionsCulture.icon ? optionsCulture.icon : ''" aria-hidden="true"></span>
            {{ optionsCulture.name }}
          </span>

          <span class="fr-badge fr-badge--warning fr-badge--no-icon" v-if="requiresAction && !optionsCulture"
            >À préciser</span
          >
        </div>
        <div v-if="requiresAction && optionsCulture" class="badge-right">
          <p class="error-text fr-mb-0 fr-px-1v fr-text--sm fr-text--bold">
            <span class="fr-icon fr-icon-warning-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>1
          </p>
        </div>
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
  optionsSelected: {
    type: [String, Array],
    required: false,
  },
  optionsSuffix: {
    type: [String, Number],
    required: false,
  },
  optionsCulture: {
    required: false,
    type: Object,
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
  overflow: hidden;
}

.fr-accordion__btn {
  gap: 1px;

  span:first-child {
    flex: 1;
  }
}

.fr-accordion__btn {
  display: flex;
  align-items: center;
  position: relative;
  gap: 0.5rem;
  width: 100%;
}

.badge-right {
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: fit-content;
}

.fr-collapsing {
  overflow: hidden !important;
}

.small-text {
  color: grey;
  font-size: 12px;
}

.culture-name {
  max-width: 14ch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
}

.badge-right {
  margin-left: auto;
  margin-right: 0px;
}
</style>
