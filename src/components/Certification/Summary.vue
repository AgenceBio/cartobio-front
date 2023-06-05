<template>
  <div class="fr-alert fr-alert--warning fr-mb-3w" v-if="hasFailures">
    <p v-for="([ruleId, result]) in validationRulesWithFailures" :key="ruleId">
      {{ ruleId === 'NOT_EMPTY' ? `Il manque un type de culture dans ${result.failures} parcelles.` : '' }}
      {{ ruleId === 'ENGAGEMENT_DATE' ? `Il manque une date d'engagement et/ou un niveau de conversion dans ${result.failures} parcelles.` : '' }}
    </p>
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
import { applyValidationRules, isCertificationImmutable, CERTIFICATION_STATE } from '@/referentiels/ab.js'
import { updateAuditState } from '@/cartobio-api.js'
import { useRecordStore } from '@/stores/index.js'

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
const validationRulesWithFailures = computed(() => Object.entries(validationResult.value.rules).filter(([, { failures }]) => failures))
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
