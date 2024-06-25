<script setup>
import { ref } from 'vue'
import { useFocus } from '@vueuse/core'
import Modal from "@/components/widgets/Modal.vue"
import { reactive } from "vue"
import toast from "@/utils/toast.js"
import { usePermissions } from "@/stores/permissions.js"
import { useRecordStore } from "@/stores/record.js"

const emit = defineEmits(['close'])

const recordStore = useRecordStore()
const permissions = usePermissions()

const { record } = recordStore
const autofocusedElement = ref()
useFocus(autofocusedElement, { initialValue: true })

const patch = reactive({
  version_name: record.version_name,
  audit_date: record.audit_date,
  certification_date_debut: record.certification_date_debut,
  certification_date_fin: record.certification_date_fin
})

function save() {
  recordStore.updateInfo({
    version_name: patch.version_name,
    ...(patch.audit_date && permissions.canChangeAuditDate && { audit_date: patch.audit_date }),
    ...(patch.certification_date_debut && permissions.canChangeCertificationDate && { certification_date_debut: patch.certification_date_debut }),
    ...(patch.certification_date_fin && permissions.canChangeCertificationDate && { certification_date_fin: patch.certification_date_fin })
  })

  toast.success('La version a bien été modifiée')
  emit('close')
}

</script>

<template>
  <Modal @close="$emit('close')" v-bind="$attrs" icon="fr-icon-edit-fill">
    <template #title>Modifier la version</template>

    <form @submit.prevent="save" id="version-edit-form">
      <div class="fr-input-group">
        <label for="version_name" class="fr-input-group__label">Nom de la version du parcellaire</label>
        <span class="fr-hint-text">Ex: Parcellaire audité 2023</span>
        <input type="text" id="version_name" class="fr-input" v-model="patch.version_name" ref="autofocusedElement" />
      </div>

      <div v-if="patch.audit_date && permissions.canChangeAuditDate" class="fr-input-group">
        <label for="audit_date" class="fr-input-group__label">Date d'audit</label>
        <input type="date" id="audit_date" class="fr-input" v-model="patch.audit_date" />
      </div>

      <div v-if="record.certification_state === 'CERTIFIED' && permissions.canChangeCertificationDate" class="fr-input-group">
        <label for="certification_date_debut" class="fr-input-group__label">Date de début de validité du certificat</label>
        <input type="date" id="certification_date_debut" class="fr-input" v-model="patch.certification_date_debut" />
      </div>

      <div v-if="record.certification_state === 'CERTIFIED' && permissions.canChangeCertificationDate" class="fr-input-group">
        <label for="certification_date_fin" class="fr-input-group__label">Date de fin de validité du certificat</label>
        <input type="date" id="certification_date_fin" class="fr-input" v-model="patch.certification_date_fin" />
      </div>
    </form>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline">
        <li>
          <button type="submit" class="fr-btn" form="version-edit-form">Enregistrer</button>
        </li>
        <li>
          <button class="fr-btn fr-btn--tertiary" @click="$emit('close')">Annuler</button>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<style scoped>

</style>
