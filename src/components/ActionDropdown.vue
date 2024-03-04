<script setup>
import { ref } from "vue"
import { onClickOutside } from "@vueuse/core"

const show = ref(false)
const actionsMenuRef = ref(null)

onClickOutside(actionsMenuRef, () => {
  show.value = false
})
</script>

<template>
  <div class="menu-container">
    <div v-if="show" class="fr-menu" ref="actionsMenuRef">
      <ul class="fr-menu__list fr-btns-group fr-btns-group--icon-left">
        <li>
          <slot/>
        </li>
      </ul>
    </div>
  </div>
  <button type="button" @click.stop.prevent="show = !show" class="fr-btn fr-btn--tertiary-no-outline fr-icon-more-fill show-actions">
    Autres actions
  </button>
</template>

<style scoped>
.menu-container {
  position: relative;
  display: inline-block;
}

.fr-menu {
  position: absolute;
  left: 100%;
  top: -100%;

  :deep(.fr-menu__list) {
    border-radius: 0.3125rem;
    margin: 0;
    width: auto;
  }

  :deep(.fr-btn) {
    font-weight: 700;
    justify-content: flex-start;
    margin: 0;
    padding: 0.75rem !important;
    width: 100%;
    @extend .fr-btn--tertiary-no-outline;
  }
}
</style>
