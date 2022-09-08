<template>
  <div class="fr-form-group" :disabled="!selectedFeatureIds.length">
    <fieldset class="fr-fieldset">
      <legend class="fr-fieldset__legend" id='radio-rich-legend'>
        Avec les {{ selectedFeatureIds.length }} parcelles sélectionnées :
      </legend>

      <div class="fr-fieldset__content">
        <template v-for="(action, id) in actions" :key="id">
          <div class="fr-radio-group fr-radio-rich" v-if="!selectedAction || selectedAction === id">
            <input type="radio" :id="'action-' + id" name="parcellaire-actions" :value="id" :disabled="!action.component" v-model="selectedAction">
            <label class="fr-label" :for="'action-' + id">
              {{ action.label }}
              <span v-if="!action.component" class="fr-hint-text fr-icon fr-icon--sm fr-icon-info-line">Fonctionnalité en cours de développement</span>
            </label>
          </div>
        </template>
      </div>

      <component :is="selectedActionForm" v-if="selectedActionForm" @form:valid="handleUpdate">
        <template #footer>
          <ul class="fr-list" v-if="selectedAction">
            <li>
              <button class="fr-btn fr-btn--tertiary-no-outline" @click.prevent="selectedAction = null">
                Annuler
              </button>
            </li>
            <li>
              <button class="fr-btn fr-btn--icon-left fr-icon-success-line">
                Enregistrer le changement
              </button>
            </li>
          </ul>
        </template>
      </component>
    </fieldset>
  </div>
</template>

<style scoped>
.fr-list {
  list-style: none;
}
</style>

<script setup>
import { computed, ref } from 'vue'
import * as ActionForms from './ActionForm/index.js'

const props = defineProps({
  parcellaire: {
    type: Object,
    required: true
  },
  selectedFeatureIds: {
    type: Array,
    required: true
  }
})

const actions = {
  culture: {
    label: "Mettre à jour l'assolement",
    component: ActionForms.Culture
  },
  conversion: {
    label: "Mettre à jour leur niveau de conversion",
    component: ActionForms.Conversion
  },
  engagement: {
    label: "Mettre à jour leur date d'engagement",
    component: ActionForms.Engagement
  },
  'derogation': {
    label: "Obtenir des justificatifs de dérogation bio",
    component: null
  },
  'non-conformite': {
    label: "Déclarer une non-conformité",
    component: null
  }
}

const selectedAction = ref(null)
const selectedActionForm = computed(() => selectedAction && actions[selectedAction.value]?.component)
const operationsQueue = ref([])

function handleUpdate (action) {
  operationsQueue.value.push({ ...action, featureIds: props.selectedFeatureIds })
}
</script>
