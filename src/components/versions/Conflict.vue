<script setup>
import { useCartoBioStorage } from "@/stores/storage.js"
import VersionConflictModal from "@/components/versions/VersionConflictModal.vue"
import { ref } from "vue"

const storage = useCartoBioStorage()
const modalRecordId = ref(null)
</script>

<template>
  <div class="fr-alert fr-alert--error" role="alert">
    <div class="fr-alert__title">Conflit entre versions</div>
    <p>
      Les exploitations suivantes ont été modifiées pendant que vous étiez hors-ligne. Cliquez sur l'exploitation pour
      résoudre le conflit.
    </p>

    <ul class="fr-text--bold">
      <li v-for="conflict in storage.conflicts" :key="conflict">
        <a href="#" @click="modalRecordId = conflict">
          {{ storage.operators[storage.records[conflict].numerobio].operator.nom }} - {{ storage.records[conflict].version_name }}
        </a>
      </li>
    </ul>
  </div>

  <Teleport to="body">
    <VersionConflictModal
      v-if="modalRecordId"
      :record-id="modalRecordId"
      @close="modalRecordId = null"
    />
  </Teleport>
</template>

<style scoped>

</style>
