<template>
  <h6 class="fr-mb-0">{{ featureName(feature) }}
    ({{ (surface(feature) / 10_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) }} ha)</h6>
  <ul v-if="details.length">
    <li v-for="(detail, index) in details" :key="index">
      {{ detail }}
    </li>
  </ul>

  <form @submit.prevent="emit('submit', { ids: [feature.id], patch })">
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

    <div class="fr-input-group fr-mt-4w">
      <button class="fr-btn" type="submit">Enregistrer</button>
    </div>
  </form>
</template>

<script setup>
import { reactive } from 'vue';

import { featureDetails, featureName, surface } from '@/components/Features/index.js'
import CultureSelector from '@/components/Features/CultureSelector.vue'
import { usePermissions } from "@/stores/permissions.js"

const props = defineProps({
  feature: {
    type: Object,
    required: true
  }
})

const patch = reactive({
  cultures: props.feature.properties.cultures,
  commentaires: props.feature.properties.commentaires || '',
})

const emit = defineEmits(['submit'])

const permissions = usePermissions()

const details = await featureDetails(props.feature)
</script>
