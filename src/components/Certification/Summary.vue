<template>
  <div class="fr-alert fr-alert--warning fr-mb-3w" v-if="hasFailures">
    <ValidationErrors :validation-result="validationResult" />
  </div>

  <div class="fr-callout fr-callout--blue-ecume" v-else-if="!isAudited && isComplete">
    <h3 class="fr-callout__title">Parcellaire complet <span aria-hidden>🎉</span></h3>

    <button class="fr-btn" @click="sendOffModal = true">Terminer l'audit</button>
  </div>

  <Teleport to="body">
    <SendOffModal :operator="operator" :record="record" v-if="sendOffModal" v-model="sendOffModal" @submit="handleSendOff" />
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { applyValidationRules, CERTIFICATION_STATE, isCertificationImmutable } from '@/referentiels/ab.js'
import { updateAuditState } from '@/cartobio-api.js'
import { useRecordStore } from '@/stores/index.js'
import ValidationErrors from "@/components/Features/ValidationErrors.vue"

const recordStore = useRecordStore()

const props = defineProps({
  operator: {
    type: Object,
    required: true
  },
  features: {
    type: Object,
    required: true
  },
  record: {
    type: Object,
    required: true
  },
  validationRules: {
    type: Object,
    required: true
  }
})

const sendOffModal = ref(false)
const validationResult = computed(() => applyValidationRules(props.validationRules.rules, ...props.features.features))
const hasFailures = computed(() => Boolean(validationResult.value.failures))
const isComplete = computed(() => hasFailures.value === false)
const isAudited = computed(() => isCertificationImmutable(props.record.certification_state))

async function handleSendOff ({ record_id: recordId, patch }) {
  const record = await updateAuditState({ recordId }, {
    ...patch,
    certification_state: CERTIFICATION_STATE.AUDITED
  })

  recordStore.update(record)
  sendOffModal.value = false
}
</script>
