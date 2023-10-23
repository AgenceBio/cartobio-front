<template>
  <Modal ref="modal" data-track-content data-content-name="Modale de modification de parcelle" v-bind="$attrs">
    <div class="fr-card fr-p-2w fr-mb-3w">
      <label class="fr-label" for="nom">Nom de la parcelle</label>
      <span class="fr-hint-text fr-mb-1v">Exemple&nbsp;: Les charrons 2</span>
      <input class="fr-input" v-model="patch.NOM" id="nom" required="required" />
      <p class="fr-mt-2w fr-mb-0">Sa superficie est de {{ inHa(surface(feature)) }} ha.</p>

      <ul v-if="details.length">
        <li v-for="(detail, index) in details" :key="index">
          {{ detail }}
        </li>
      </ul>
    </div>


    <form @submit.prevent="emit('submit', { id: feature.id, properties: patch })" id="single-feature-edit-form">
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
</template>


<script setup>
import { reactive } from 'vue';

import { featureDetails, featureName, inHa, surface } from '@/components/Features/index.js'
import Modal from '@/components/Modal.vue'
import CultureSelector from '@/components/Features/CultureSelector.vue'
import { usePermissions } from "@/stores/permissions.js"

const props = defineProps({
  feature: {
    type: Object,
    required: true
  }
})

const patch = reactive({
  NOM: featureName(props.feature, { placeholder: '' }),
  cultures: props.feature.properties.cultures,
  commentaires: props.feature.properties.commentaires || '',
})

const emit = defineEmits(['submit'])

const permissions = usePermissions()

const details = await featureDetails(props.feature)
</script>
