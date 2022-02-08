<template>
  <p v-if="notification" class="notification is-{{ notification.type }}">
    <vue-feather type="check" />
    {{ notification.message }}
  </p>
</template>

<script setup>
import { ref } from 'vue'

const notification = ref(null)
</script>

<style scoped>
.notification {
  background: var(--type-default);
  color: var(--type-default--text);
  padding: 1rem;
}

  .notification.is-success {
    background-color: var(--type-success);
    color: var(--type-success--text);
  }
</style>
