<script setup>
import Modal from "@/components/Modal.vue"
import { useCartoBioStorage } from "@/stores/storage.js"

const emit = defineEmits(['close'])
const props = defineProps({
  recordId: {
    type: String,
    required: true
  }
})

const storage = useCartoBioStorage()

async function duplicate() {
  await storage.resolveConflict(props.recordId, true)
  emit('close')
}

async function merge() {
  await storage.resolveConflict(props.recordId, false)
  emit('close')
}
</script>

<template>
  <Modal @close="$emit('close')" v-bind="$attrs" icon="fr-icon-warning-fill">
    <template #title>Conflit entre versions</template>
    <p>
      Il semblerait qu’une autre personne ait effectué des modifications sur un parcellaire pendant que vous le modifiiez hors-ligne :
    </p>
    <p>
      Version : <b>{{ storage.records[recordId].version_name }}</b> de l’exploitation <b>{{ storage.operators[storage.records[recordId].numerobio].nom }}</b><br/>
    </p>
    <p>
      Souhaitez-vous tout de même appliquer les changements faits hors-ligne sur cette version ?
    </p>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline">
        <li>
          <button class="fr-btn" @click="duplicate">Créer une nouvelle version</button>
        </li>
        <li>
          <button class="fr-btn fr-btn--tertiary" @click="merge">Appliquer les changements</button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<style scoped>

</style>
