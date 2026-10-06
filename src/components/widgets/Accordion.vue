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
        <div class="accordion-left">
          <slot v-if="$slots.title" name="title" :is-closed="isClosed" :is-open="isOpen" :is-expanding="isExpanding" />

          <template v-else>
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
              <template v-if="optionsSuffix"> | {{ optionsSuffix }} </template>
            </span>

            <span v-if="optionsCulture && isEdit" class="fr-hint-text culture-name">
              <span :class="optionsCulture.icon ? optionsCulture.icon : ''" aria-hidden="true" />
              {{ optionsCulture.name }}
            </span>

            <span class="fr-badge fr-badge--warning fr-badge--no-icon" v-if="requiresAction && !isEdit">
              À préciser
            </span>
          </template>
        </div>

        <div class="accordion-right">
          <slot name="right">
            <div v-if="requiresAction && isEdit">
              <p class="error-text fr-mb-0 fr-px-1v fr-text--sm fr-text--bold">
                <span class="fr-icon fr-icon-warning-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
                1
              </p>
            </div>
          </slot>
        </div>
      </button>
    </h3>

    <div
      ref="contentElement"
      :class="{
        'fr-collapse': true,
        'fr-collapsing': isExpanding,
        'fr-collapse--expanded': isOpen,
      }"
      :id="elementId"
    >
      <slot />
    </div>
  </section>
</template>

<script setup>
import { computed, inject, nextTick, ref, watch } from "vue";

const activeAccordionId = inject("openAccordion", () => ref(null));

const props = defineProps({
  open: Boolean,
  requiresAction: {
    type: Boolean,
    default: false,
  },
  title: String,
  optionsSelected: {
    type: [String, Array],
  },
  optionsSuffix: {
    type: [String, Number],
  },
  optionsCulture: {
    type: Object,
  },
  isEdit: {
    type: Boolean,
    default: false,
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
    nextTick(() => {
      openingState.value = STATE.OPEN;
    });
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

.fr-collapsing {
  overflow: hidden !important;
}

.fr-accordion__btn {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.accordion-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.accordion-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.small-text {
  color: grey;
  font-size: 12px;
}

.culture-name {
  max-width: 30ch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
}

.error-text {
  color: var(--warning-425-625);
  border: 1px solid #ffbdb2;
  background-color: var(--warning-950-100);
  border-radius: 4px;
}

button:not(:disabled):hover {
  background-color: var(--background-open-blue-france-hover);
}
</style>
