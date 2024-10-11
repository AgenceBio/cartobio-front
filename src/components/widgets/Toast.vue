<template>
  <div style="display: flex">
    <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center">{{ message }}</div>
    <button v-if="actionLabel" @click="actionCb" class="fr-btn fr-btn--tertiary-no-outline fr-ml-3w">
      {{ actionLabel }}
    </button>
    <button
      class="fr-btn fr-btn--tertiary-no-outline fr-ml-3w fr-btn--icon-right fr-icon-close-line"
      @click="closeToast"
    >
      Fermer
    </button>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
  closeToast: {
    type: Function,
    required: true,
  },
  actionLabel: {
    type: String,
    required: false,
  },
  actionCb: {
    type: Function,
    required: false,
  },
});
</script>

<style scoped></style>
