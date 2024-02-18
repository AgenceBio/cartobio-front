<template>
  <Modal @close="showCancelModal = true" v-bind="$attrs" data-track-content data-content-name="Modale de modification de parcelle">
    <div class="fr-card fr-p-2w fr-mb-3w">
      <div class="fr-input-group" :class="{ 'fr-input-group--error': nameError }">
        <label class="fr-label" for="nom">Nom de la parcelle</label>
        <span class="fr-hint-text fr-mb-1v">Exemple&nbsp;: Les charrons 2</span>
        <input class="fr-input fr-error" v-model="patch.NOM" :required="requiredName" :class="{ 'fr-input--error': nameError }" />
        <p v-if="nameError" class="fr-error-text">
          Ce champ est obligatoire
        </p>
      </div>
      <p class="fr-mb-0">Sa superficie est de {{ inHa(surface(feature)) }} ha.</p>

      <ul v-if="details.length">
        <li v-for="(detail, index) in details" :key="index">
          {{ detail }}
        </li>
      </ul>
    </div>


    <form @submit.prevent="validate" id="single-feature-edit-form">
      <div v-if="permissions.canChangeCulture" class="fr-input-group">
        <CultureSelector :cultures="patch.cultures" @change="$cultures => patch.cultures = $cultures" />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="commentaires">
          Vos notes
          <span class="fr-hint-text">Elles seront visibles par votre organisme de certification.</span>
        </label>
        <textarea class="fr-input" id="commentaires" name="commentaires" v-model="patch.commentaires" />
      </div>
    </form>

    <template #title><slot name="title" /></template>

    <template #footer>
      <div class="fr-input-group">
        <button class="fr-btn" type="submit" form="single-feature-edit-form">Enregistrer</button>
      </div>
    </template>
  </Modal>
  <CancelModal v-if="showCancelModal" @cancel="showCancelModal = false" @close="$emit('close')"/>
</template>


<script setup>
import { reactive, ref } from 'vue';

import { featureDetails, inHa, surface } from '@/components/Features/index.js'
import Modal from '@/components/Modal.vue'
import CultureSelector from '@/components/Features/CultureSelector.vue'
import { usePermissions } from "@/stores/permissions.js"
import { applyValidationRules, RULE_ENGAGEMENT_DATE, RULE_NAME } from "@/referentiels/ab.js"
import CancelModal from "@/components/Forms/CancelModal.vue"

const props = defineProps({
  feature: {
    type: Object,
    required: true
  },
  requiredName: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['submit', 'close'])

const permissions = usePermissions()
const showCancelModal = ref(false)

const patch = reactive({
  NOM: props.feature.properties.NOM || '',
  cultures: props.feature.properties.cultures,
  commentaires: props.feature.properties.commentaires || '',
})
const nameError = ref(false)

const validate = () => {
  const { rules } = applyValidationRules([props.requiredName ? RULE_NAME : null, RULE_ENGAGEMENT_DATE], { properties: patch })

  if (rules[RULE_NAME]?.success === 0) {
    nameError.value = true
    return false
  }

  emit('submit', { id: props.feature.id, properties: patch })
}

const details = await featureDetails(props.feature)
</script>
