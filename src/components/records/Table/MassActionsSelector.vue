<template>
  <ActionDropdown>
    <template #trigger="{}">
      <button
        class="fr-btn fr-btn--sm fr-btn--secondary fr-btn--icon-left fr-icon-edit-line menu-button"
        @click.stop.prevent="onTriggerClick"
      >
        {{ label }}
      </button>
    </template>
    <li v-for="{ label, component } in actions" :key="label">
      <button
        class="fr-btn fr-text--sm fr-btn--sm fr-btn--tertiary-no-outline"
        @click="openModalWithComponent(component)"
      >
        {{ label }}
      </button>
    </li>
  </ActionDropdown>

  <Teleport to="body">
    <Component
      :is="modalComponent"
      v-if="modalComponent && isModalOpen"
      @close="isModalOpen = false"
      @submit="handleSubmit"
    />
  </Teleport>
</template>

<script setup>
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import ActionDropdown from "@/components/widgets/ActionDropdown.vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  actions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["submit", "openModal"]);

const isMenuOpen = ref(false);
const isModalOpen = ref(false);
const openerElement = ref(null);
const modalComponent = ref(null);

onClickOutside(openerElement, () => (isMenuOpen.value = false));

function openModalWithComponent(component) {
  emit("openModal");
  modalComponent.value = component;
  isModalOpen.value = true;
  isMenuOpen.value = false;
}

function handleSubmit({ ids, patch }) {
  emit("submit", { ids, patch });
  isModalOpen.value = false;
}

function onTriggerClick() {
  if (props.actions.length === 1) {
    openModalWithComponent(props.actions[0].component);
  } else {
    isMenuOpen.value = !isMenuOpen.value;
  }
}
</script>

<style scoped>
.menu-button {
  margin-bottom: 0;
  box-shadow: none;
}

li .fr-btn {
  min-width: 250px;
}
</style>
