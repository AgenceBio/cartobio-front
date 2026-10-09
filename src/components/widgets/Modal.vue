<template>
  <dialog
    ref="dialog"
    :aria-labelledby="!label && titreAffiche ? titleId : undefined"
    :aria-label="label"
    role="dialog"
    :id="modalId"
    class="fr-modal fr-modal--opened"
    open
    aria-modal="true"
    tabindex="-1"
  >
    <div
      :class="[
        !extraLarge ? (!large ? 'fr-container-md ' : 'fr-container-lg') : 'fr-px-6v',
        !extraLarge ?? 'fr-container fr-container--fluid',
      ]"
    >
      <div :class="[!extraLarge ? 'fr-grid-row fr-grid-row--center' : '']">
        <div
          ref="target"
          :class="[
            !extraLarge ?? 'fr-col-12 fr-col-md-8',
            !large && !extraLarge && !mediumLarge ? 'fr-col-lg-6' : null,
            mediumLarge ? 'fr-col-lg-10' : null,
          ]"
        >
          <div class="fr-modal__body">
            <div class="fr-modal__header" v-if="!noHeader">
              <template v-if="!slots.header">
                <h1 v-if="titreAffiche" :id="titleId" class="fr-modal__title fr-m-0 fr-mt-2w">
                  <span :class="['fr-icon', icon, 'fr-mr-1w']" v-if="icon" aria-hidden="true" />
                  <slot name="title" />
                </h1>

                <button
                  class="fr-btn--close fr-btn"
                  title="Fermer la fenêtre modale"
                  :aria-controls="modalId"
                  @click="emit('close')"
                  :disabled="lockClose"
                  v-if="!noCloseButton"
                >
                  Fermer
                </button>
              </template>
              <template v-else>
                <slot name="header" />
              </template>
            </div>
            <div class="fr-modal__content">
              <slot name="default" v-bind="$attrs" />
            </div>

            <div class="fr-modal__footer"><slot name="footer" /></div>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, useId, useSlots, ref } from "vue";
import { useHead } from "@unhead/vue";
import { onClickOutside, onKeyStroke } from "@vueuse/core";
import { useContentTracking } from "@/stats.js";

const slots = useSlots();

useContentTracking();

const emit = defineEmits(["close"]);
const props = defineProps({
  icon: String,
  label: String,
  noCloseButton: Boolean,
  lockClose: {
    type: Boolean,
    default: false,
  },
  large: {
    type: Boolean,
    default: false,
  },
  extraLarge: {
    type: Boolean,
    default: false,
  },
  noHeader: {
    type: Boolean,
    default: false,
  },
  mediumLarge: {
    type: Boolean,
    default: false,
  },
});

const uid = useId();
const modalId = `modal-${uid}`;
const titleId = `modal-title-${uid}`;
const titreAffiche = computed(() => !props.noHeader && !slots.header && Boolean(slots.title));

const dialog = ref(null);
const target = ref(null);
const estAuPremierPlan = computed(() => pileModales.value.at(-1) === modalId);

const pileModales = ref([]);

const FOCUSABLES = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

let elementOrigine = null;

function elementsFocusables() {
  if (!dialog.value) return [];
  return [...dialog.value.querySelectorAll(FOCUSABLES)].filter((el) => el.getClientRects().length > 0);
}

const cancelKeyStroke = onKeyStroke("Escape", (event) => {
  if (event.defaultPrevented || !estAuPremierPlan.value || props.lockClose) return;
  emit("close");
});

const cancelTabKeyStroke = onKeyStroke("Tab", (event) => {
  if (!estAuPremierPlan.value || !dialog.value) return;

  const focusables = elementsFocusables();
  if (focusables.length === 0) {
    event.preventDefault();
    dialog.value.focus();
    return;
  }

  const premier = focusables[0];
  const dernier = focusables.at(-1);
  const actif = document.activeElement;

  if (!dialog.value.contains(actif)) {
    event.preventDefault();
    (event.shiftKey ? dernier : premier).focus();
  } else if (event.shiftKey && (actif === premier || actif === dialog.value)) {
    event.preventDefault();
    dernier.focus();
  } else if (!event.shiftKey && actif === dernier) {
    event.preventDefault();
    premier.focus();
  }
});

const cancelClickOutside = onClickOutside(
  target,
  () => {
    if (!estAuPremierPlan.value || props.lockClose) return;
    emit("close");
  },
  { ignore: [".aa-Panel"] },
);

onMounted(() => {
  elementOrigine = document.activeElement;
  pileModales.value.push(modalId);

  useHead({
    htmlAttrs: {
      "data-fr-scrolling": true,
      tagDuplicateStrategy: "replace",
    },
  });

  nextTick(() => {
    if (!dialog.value || dialog.value.contains(document.activeElement)) return;
    (elementsFocusables()[0] ?? dialog.value).focus();
  });
});

onBeforeUnmount(() => {
  const focusDansModale = dialog.value?.contains(document.activeElement) || document.activeElement === document.body;

  pileModales.value = pileModales.value.filter((id) => id !== modalId);

  if (pileModales.value.length === 0) {
    useHead({
      htmlAttrs: {
        "data-fr-scrolling": false,
        tagDuplicateStrategy: "replace",
      },
    });
  }
  cancelClickOutside();
  cancelKeyStroke();
  cancelTabKeyStroke();

  if (pileModales.value.length === 0) {
    useHead({
      htmlAttrs: {},
    });
  }

  if (!focusDansModale) return;
  if (elementOrigine?.isConnected && typeof elementOrigine.focus === "function") {
    elementOrigine.focus();
  } else {
    document.getElementById(pileModales.value.at(-1))?.focus();
  }
});
</script>

<style scoped>
.fr-modal__title {
  align-items: flex-start;
}
.fr-modal__footer {
  filter: drop-shadow(var(--lifted-shadow));
  z-index: calc(var(--ground) + 2000);
}
.fr-modal__footer:empty {
  display: none;
}
.fr-modal:focus {
  outline: none;
}
</style>
<style>
:root[data-fr-scrolling] body {
  position: inherit !important;
}
</style>
