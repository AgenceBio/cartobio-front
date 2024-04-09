<script setup>
import { onUpdated, ref, watch } from "vue"
import { onClickOutside, useSwipe } from "@vueuse/core"
import { useHead } from "@unhead/vue"

const show = ref(false)
const fadeIn = ref(false)
const actionsMenuRef = ref(null)

const props = defineProps({
  withIcons: {
    type: Boolean,
    default: false
  }
})

onUpdated(() => {
  setTimeout(() => {
    fadeIn.value = show.value
  }, 1)
})

const down = ref('16px')
const { direction, lengthY } = useSwipe(
    actionsMenuRef,
    {
      onSwipe: () => {
        if (direction.value === 'DOWN' && lengthY.value < 0) {
          down.value = (16 + lengthY.value) + 'px'
        } else {
          down.value = '16px'
        }
        console.log(down.value)
      },
      onSwipeEnd: () => {
        if (lengthY.value < -30) {
          show.value = false
          down.value = '16px'
        }
      }
    }
)

onClickOutside(actionsMenuRef, () => {
  show.value = false
})

watch(show, (value) => {
  if (value && !window.matchMedia('(min-width: 580px)').matches) {
    useHead({ htmlAttrs: {
        'data-fr-scrolling': true,
        tagDuplicateStrategy: 'replace'
      }
    })
  } else {
    useHead({
      htmlAttrs: {
        'data-fr-scrolling': null,
        tagDuplicateStrategy: 'replace'
      }
    })
  }
})
</script>

<template>
  <div class="menu-anchor">
    <slot name="trigger" :toggle="() => show =! show">
      <button type="button" @click.stop.prevent="show = !show" class="fr-btn fr-btn--tertiary-no-outline fr-icon-more-fill show-actions">
        Autres actions
      </button>
    </slot>
      <dialog class="menu-container" :open="show">
        <div class="fr-menu" :class="{ '--fade-in': fadeIn }" ref="actionsMenuRef" :style="{ '--down': down }">
          <ul class="fr-menu__list fr-btns-group fr-btns-group--equisized" :class="{ 'fr-btns-group--icon-left': props.withIcons }">
            <slot/>
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
  z-index: var(--z-index-dropdown);
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
  }

  :deep(.fr-menu__list) {
    border-radius: 0.3125rem;
    margin: 0;
    width: auto;
    padding: 0;
    background-color: var(--background-overlap-grey);
    --hover: var(--background-overlap-grey-hover);
    --active: var(--background-overlap-grey-active);
    box-shadow: inset 0 1px 0 0 var(--border-open-blue-france);
  }

  :deep(.fr-btn) {
    margin: 0;
    padding: 0.75rem !important;
    width: 100%;
    @extend .fr-btn--tertiary-no-outline;
  }
}
</style>
