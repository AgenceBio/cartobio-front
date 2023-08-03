<template>
  <p>
    <span class="fr-icon-info-line" aria-hidden="true" />
    {{ featureName(feature) }}
  </p>

  <form @submit.prevent="emit('submit', { ids: [feature.id], patch })">
    <CultureSelector v-if="permissions.canChangeCulture" :cultures="patch.cultures" @change="$cultures => patch.cultures = $cultures" />

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

import { featureName } from '@/components/Features/index.js'
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
</script>
