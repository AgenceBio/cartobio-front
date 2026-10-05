<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { onClickOutside, onKeyStroke, useSwipe } from "@vueuse/core";
import { useHead } from "@unhead/vue";

const show = ref(false);
const fadeIn = ref(false);
const actionsMenuRef = ref(null);
const triggerRef = ref(null);

const menuId = `actions-menu-${Math.random().toString(36).slice(2)}`;

const props = defineProps({
  withIcons: {
    type: Boolean,
    default: false,
  },
  iconClass: {
    type: String,
    default: "fr-icon-more-fill",
  },
  iconStyle: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  smallList: {
    type: Boolean,
    default: false,
  },
  vertical: {
    type: Boolean,
    default: false,
  },
  alignLeft: {
    type: Boolean,
    default: false,
  },
  noWrap: {
    type: Boolean,
    default: false,
  },
});

const getFocusableElements = () => {
  if (!actionsMenuRef.value) {
    return [];
  }

  return [
    ...actionsMenuRef.value.querySelectorAll(
      'button:not(:disabled):not([aria-disabled="true"]), a[href]:not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"])',
    ),
  ];
};

const openMenu = async () => {
  if (props.disabled) {
    return;
  }

  show.value = true;

  await nextTick();

  fadeIn.value = true;

  await nextTick();

  const elements = getFocusableElements();

  elements[0]?.focus();
};

const closeMenu = async ({ restoreFocus = true } = {}) => {
  show.value = false;
  fadeIn.value = false;

  if (restoreFocus) {
    await nextTick();
    triggerRef.value?.focus();
  }
};

const toggleMenu = () => {
  if (show.value) {
    closeMenu();
  } else {
    openMenu();
  }
};

const handleMenuClick = (event) => {
  if (event.target.closest("button, a")) {
    closeMenu({ restoreFocus: false });
  }
};

const handleMenuKeydown = (event) => {
  const elements = getFocusableElements();

  if (!elements.length) {
    return;
  }

  const currentIndex = elements.indexOf(document.activeElement);

  switch (event.key) {
    case "ArrowDown": {
      event.preventDefault();

      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % elements.length;

      elements[nextIndex].focus();
      break;
    }

    case "ArrowUp": {
      event.preventDefault();

      const previousIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;

      elements[previousIndex].focus();
      break;
    }

    case "Home": {
      event.preventDefault();
      elements[0].focus();
      break;
    }

    case "End": {
      event.preventDefault();
      elements[elements.length - 1].focus();
      break;
    }

    case "Tab": {
      const isFirst = currentIndex === 0;
      const isLast = currentIndex === elements.length - 1;

      if (!event.shiftKey && isLast) {
        closeMenu({ restoreFocus: false });
        return;
      }

      if (event.shiftKey && isFirst) {
        closeMenu({ restoreFocus: false });
      }

      break;
    }

    default:
      break;
  }
};

const handleEscape = () => {
  if (show.value) {
    closeMenu();
  }
};

const handleTriggerKeydown = (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();

    if (!show.value) {
      openMenu();
    }
  }
};

const cancelKeyStroke = onKeyStroke("Escape", handleEscape);

const cancelClickOutside = onClickOutside(actionsMenuRef, () => {
  if (show.value) {
    closeMenu();
  }
});

const down = ref("16px");

const { direction, lengthY } = useSwipe(actionsMenuRef, {
  onSwipe: () => {
    if (direction.value === "DOWN" && lengthY.value < 0) {
      down.value = `${16 + lengthY.value}px`;
    } else {
      down.value = "16px";
    }
  },

  onSwipeEnd: () => {
    if (lengthY.value < -30) {
      closeMenu({ restoreFocus: false });
      down.value = "16px";
    }
  },
});

watch(show, async (isOpen) => {
  if (!isOpen) {
    fadeIn.value = false;
    return;
  }

  await nextTick();

  requestAnimationFrame(() => {
    fadeIn.value = true;
  });
});

onBeforeUnmount(() => {
  cancelClickOutside();
  cancelKeyStroke();
});

useHead(() => ({
  htmlAttrs: {
    style: show.value && !window.matchMedia("(min-width: 580px)").matches ? "overflow: hidden;" : "",
    tagDuplicateStrategy: "replace",
  },
}));
</script>

<template>
  <div class="menu-anchor">
    <slot name="trigger" :toggle="toggleMenu" :open="show" :menu-id="menuId">
      <button
        ref="triggerRef"
        type="button"
        class="fr-btn fr-btn--tertiary-no-outline show-actions"
        :class="props.iconClass"
        :style="[props.iconStyle, props.vertical ? { transform: 'rotate(90deg)' } : {}]"
        :disabled="props.disabled"
        :aria-expanded="show"
        :aria-controls="menuId"
        aria-haspopup="true"
        aria-label="Choix des actions"
        @click.stop.prevent="toggleMenu"
        @keydown="handleTriggerKeydown"
      ></button>
    </slot>

    <dialog :id="menuId" class="menu-container" :open="show" aria-label="Actions">
      <div
        ref="actionsMenuRef"
        class="fr-menu"
        :class="{
          '--fade-in': fadeIn,
          '--align-left': props.alignLeft,
        }"
        :style="{ '--down': down }"
        @keydown="handleMenuKeydown"
      >
        <ul
          class="fr-menu__list"
          :class="{
            'fr-btns-group--icon-left': props.withIcons,
            'fr-btns-group--sm': props.smallList,
            'fr-btns-group': !props.smallList,
            '--no-wrap': props.noWrap,
          }"
          @click="handleMenuClick"
        >
          <slot />
        </ul>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.menu-anchor {
  position: relative;
  display: inline-flex;
  flex-direction: row;
  align-items: flex-end;
}

.menu-container {
  display: none;
  background: transparent;
}

.menu-container[open] {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100vw;
  border: none;
  z-index: 999;
  background: var(--grey-50-1000-a375, rgba(22, 22, 22, 0.64));
  transition: background 0.3s;
  display: block;

  @media (min-width: 580px) {
    background: transparent;
    margin: 0;
    width: 0;
    position: relative;
    padding: 0;
    height: auto;
  }
}

.fr-menu {
  position: absolute;
  bottom: -10rem;
  transition: bottom 0.3s;
  right: 1rem;
  left: 1rem;
  margin: 0;
  padding: 0;
  border-radius: 0.3125rem;
  filter: drop-shadow(var(--overlap-shadow));

  &.--fade-in {
    bottom: v-bind(down);
  }

  @media (min-width: 580px) {
    z-index: 1000;
    left: auto;
    top: 0;
    right: 0;
    height: auto;
    bottom: auto;

    &.--fade-in {
      bottom: auto;
    }

    &.--align-left {
      left: 0;
      right: auto;
    }
  }

  .fr-menu__list {
    border-radius: 0.3125rem;
    margin: 0;
    width: auto;
    padding: 0;
    background-color: var(--background-overlap-grey);
    --hover: var(--background-overlap-grey-hover);
    --active: var(--background-overlap-grey-active);
    box-shadow: inset 0 1px 0 0 var(--border-open-blue-france);
    list-style-type: none;

    &.--no-wrap {
      :deep(li .fr-btn) {
        white-space: nowrap;
      }
    }
  }

  :deep(li .fr-btn) {
    margin: 0;
    text-align: left;
    justify-content: flex-start;
    padding: 0.75rem !important;
    width: 100%;
    @extend .fr-btn--tertiary-no-outline;

    --hover-tint: var(--background-default-grey-hover) !important;
  }
}
</style>
