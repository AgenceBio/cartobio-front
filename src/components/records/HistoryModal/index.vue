<template>
  <component :is="Modal" v-bind="$attrs" icon="fr-icon-calendar-2-line" data-track-content data-content-name="Modale d'historique">
    <template #title>{{ operator.nom }}</template>

    <div class="history-cards" role="list">
      <HistoryEntry :entry="entry" v-for="(entry, i) in record.audit_history" :key="i" />
    </div>
  </component>
</template>

<script setup>
import Modal from '@/components/widgets/Modal.vue'
import HistoryEntry from './HistoryEntry.vue'

defineProps({
  operator: {
    type: Object,
    required: true
  },
  record: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.history-cards {
  display: flex;
  flex-direction: column-reverse;
}
</style>
