<template>
  <nav ref="openerElement" role="navigation" class="fr-translate fr-nav" data-fr-js-navigation="true">
    <div class="fr-nav__item" data-fr-js-navigation-item="true">
      <button type="button" class="fr-btn fr-btn--secondary fr-translate__btn" aria-controls="mass-actions__actions" :aria-expanded="isMenuOpen" @click="(isMenuOpen = !isMenuOpen)" data-fr-js-collapse-button="true">
        {{ label }}
      </button>
      <div :class="['fr-collapse', 'fr-translate__menu', 'fr-menu', isMenuOpen && 'fr-collapse--expanded']" id="mass-actions__actions" data-fr-js-collapse="true" style="--collapse-max-height: none; --collapse: -148px">
        <ul class="fr-menu__list">
          <li class="w-full" v-for="({ label, component }) in actions" :key="label">
            <button class="fr-btn fr-btn--tertiary-no-outline w-full" type="button" @click="openModalWithComponent(component)">
              {{ label }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <Teleport to="body">
    <Component :is="modalComponent" v-if="(modalComponent && isModalOpen)" @close="isModalOpen = false" @submit="handleSubmit" />
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

defineProps({
  label: {
    type: String,
    required: true
  },
  actions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['submit'])

const isMenuOpen = ref(false)
const isModalOpen = ref(false)
const openerElement = ref(null)
const modalComponent = ref(null)

onClickOutside(openerElement, () => isMenuOpen.value = false)

function openModalWithComponent (component) {
  modalComponent.value = component
  isModalOpen.value = true
  isMenuOpen.value = false
}

function handleSubmit ({ ids, patch }) {
  emit('submit', { ids, patch })
  isModalOpen.value = false
}
</script>

<style scoped>
.fr-nav__item {
  position: relative;
}
  .fr-translate__menu {
    left: 0;
    top: calc(100%);
    min-width: 25em;
    text-align: left;
  }
  .fr-translate .fr-translate__btn {
    align-self: flex-end;
    border: 1px solid #fff;
    background-color: #fff;
    margin-bottom: 0;
    box-shadow: none;
  }

  .fr-translate .fr-translate__btn::before {
    content: none;
  }

  .fr-menu__list .fr-btn {
    text-align: initial;
    width: 100%;
  }
</style>
