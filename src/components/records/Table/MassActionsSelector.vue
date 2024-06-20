<template>
  <ActionDropdown>
    <template #trigger="{ toggle }">
      <button
          class="fr-btn fr-btn--sm fr-btn--secondary fr-btn--icon-right fr-icon-arrow-down-s-line menu-button"
          @click.stop.prevent="toggle"
      >
        {{ label }}
      </button>
    </template>
    <li v-for="({ label, component }) in actions" :key="label">
      <button
          class="fr-btn fr-text--sm fr-btn--sm fr-btn--tertiary-no-outline"
          @click="openModalWithComponent(component)"
      >
        {{ label }}
      </button>
    </li>
  </ActionDropdown>

  <Teleport to="body">
    <Component :is="modalComponent" v-if="(modalComponent && isModalOpen)" @close="isModalOpen = false" @submit="handleSubmit" />
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import ActionDropdown from "@/components/widgets/ActionDropdown.vue"

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
.menu-button {
  border: 1px solid #fff;
  background-color: #fff;
  margin-bottom: 0;
  box-shadow: none;
}

li .fr-btn {
  min-width: 250px;
}
</style>
