<template>
  <p>
    <span class="fr-icon-info-line" aria-hidden="true" />
    {{ featureName(feature) }}
  </p>

  <form @submit.prevent="emit('submit', { id: feature.id, patch })">
    <div class="fr-input-group">
      <label class="fr-label">Type de culture</label>
      <select class="fr-select" name="culture" v-model="patch.TYPE" required>
        <option v-for="([code, libellé]) in codesPac" :key="code" :value="code">
          {{ libellé }}
        </option>
      </select>
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

import { featureName } from '@/components/Features/index.js'
import { liste as codesPac } from '@/referentiels/pac.js'

const props = defineProps({
  feature: {
    type: Object,
    required: true
  }
})

const patch = reactive({
  TYPE: props.feature.properties.TYPE,
  commentaires: props.feature.properties.commentaires || '',
})

const emit = defineEmits(['submit'])
</script>
