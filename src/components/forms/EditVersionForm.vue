<script setup>
import { computed, ref } from 'vue'
import { useFocus } from '@vueuse/core'
import Modal from "@/components/widgets/Modal.vue"
import { reactive } from "vue"
import toast from "@/utils/toast.js"
import { usePermissions } from "@/stores/permissions.js"
import { useRecordStore } from "@/stores/record.js"
import { useOperatorStore } from "@/stores/operator.js"

const emit = defineEmits(['close'])

const recordStore = useRecordStore()
const operatorStore = useOperatorStore()
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

const datesCertificationConflict = computed(() => {
  if (!patch.certification_date_debut || !patch.certification_date_fin) {
    return false;
  }
  const debutCertificationDate = new Date(patch.certification_date_debut)
  const finCertificationDate = new Date(patch.certification_date_fin)
  return debutCertificationDate >= finCertificationDate
})

const dateConflict = computed(() => {
  let newDate
  try {
    newDate = new Date(patch.audit_date).toISOString().split('T')[0]
  } catch {
    return
  }
  return operatorStore.records?.find(otherRecord => otherRecord.audit_date === newDate && record.record_id !== otherRecord.record_id)
})

function save() {
  recordStore.updateInfo({
    version_name: patch.version_name,
    ...(patch.audit_date && { audit_date: patch.audit_date }),
    ...(patch.certification_date_debut && { certification_date_debut: patch.certification_date_debut }),
    ...(patch.certification_date_fin && { certification_date_fin: patch.certification_date_fin })
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

      <div v-if="dateConflict" class="fr-alert fr-alert--error fr-mb-2w">
        <p class="fr-text--sm">
          La version
          <router-link :to="`/exploitations/${operatorStore.operator.numeroBio}/${dateConflict.record_id}`">
            {{ dateConflict.version_name }}
          </router-link>
          possède déjà la même date d'audit.
        </p>
        <p class="fr-text--sm">
          Deux versions ne peuvent pas avoir la même date d'audit. Vous pouvez cependant
          supprimer l'autre version ou modifier sa date d'audit.
        </p>
      </div>

      <div v-if="record.certification_state === 'CERTIFIED' && permissions.canChangeCertificationDate" class="fr-input-group">
        <label for="certification_date_debut" class="fr-input-group__label">Date de début de validité du certificat</label>
        <input type="date" id="certification_date_debut" class="fr-input" v-model="patch.certification_date_debut" required />
      </div>

      <div v-if="record.certification_state === 'CERTIFIED' && permissions.canChangeCertificationDate" class="fr-input-group">
        <label for="certification_date_fin" class="fr-input-group__label">Date de fin de validité du certificat</label>
        <input type="date" id="certification_date_fin" class="fr-input" v-model="patch.certification_date_fin" required />
      </div>

      <div v-if="datesCertificationConflict" class="fr-alert fr-alert--error fr-mb-2w">
        <p class="fr-text--sm">
          La date de début de validé du certificat doit être antérieure à la date de fin de validité de celui-ci.
        </p>
      </div>
    </form>

    <template #footer>
      <ul class="fr-btns-group fr-btns-group--inline">
        <li>
          <button type="submit" class="fr-btn" form="version-edit-form" :disabled="dateConflict || datesCertificationConflict">Enregistrer</button>
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
