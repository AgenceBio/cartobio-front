<template>
  <Modal v-bind="$attrs" ref="modal">
    <template #title>Suppression du parcellaire</template>

    <div class="fr-alert fr-alert--info fr-my-3w">
      <p>
        Supprimer le parcellaire pour importer un nouveau fichier.
      </p>
    </div>

    <div class="fr-alert fr-alert--error fr-my-3w">
      <p>
        Attention, toutes les modifications effectuées sur le parcellaire depuis le dernier import,
        ainsi que les notes d'audit, seront également perdues.
      </p>
    </div>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline-lg">
        <li>
          <button class="fr-btn" @click="handleDelete">
            Supprimer le parcellaire
          </button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<script setup>
import Modal from "@/components/Modal.vue"
import { deleteRecord } from "@/cartobio-api.js"
import { useRecordStore } from "@/stores/index.js"
import { ref } from "vue"

const props = defineProps({
  operator: {
    type: Object,
    required: true
  },
})

const modal = ref(null)
const recordStore = useRecordStore()

async function handleDelete() {
  const record = await deleteRecord(props.operator.id)

  // we reset the current state of operator and features
  recordStore.reset()
  // ... then restore the operator data (otherwise we loose the initial context)
  recordStore.update(record)
  modal.value?.$emit('update:modelValue', false)
}
</script>
