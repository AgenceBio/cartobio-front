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
              <button type="button" class="fr-btn fr-btn--tertiary-no-outline" @click.prevent="resetSavingState">
                Annuler
              </button>
            </li>
            <li>
              <button type="submit" class="fr-btn fr-btn--icon-left fr-icon-success-line" :disabled="isSavingDisabled">
                Enregistrer le changement
              </button>
            </li>
          </ul>
        </template>
      </component>

      <div v-if="savingResult" :class="savingResultClass">
        <p>{{ savingResult.message }}</p>
        <button class="fr-btn--close fr-btn" @click="resetSavingState">Masquer le message</button>
      </div>
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
import { submitParcellesChanges } from '@/cartobio-api.js'

const emit = defineEmits(['update'])

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
const isSaving = ref(false)
const isSavingDisabled = computed(() => isSaving.value || savingResult.value?.type === 'success')
const savingResult = ref(null)
const savingResultClass = computed(() => ['fr-alert', savingResult.value && `fr-alert--${savingResult.value.type}`])

function resetSavingState () {
  isSaving.value = false
  savingResult.value = null
  selectedAction.value = null
}

function handleUpdate (action) {
  const fn = ActionForms.actions[action.type]

  if (typeof fn === 'function') {
    const newGeoJSON = patchGeoJSON(action, fn)
    handleSaving(newGeoJSON)
  }
}

function handleSaving (newParcellaire) {
  isSaving.value = true

  setTimeout(async () => {
    try {
      await submitParcellesChanges(newParcellaire)
      savingResult.value = {
        type: 'success',
        message: "Parcellaire correctement sauvegardé sur les serveurs CartoBio."
      }
    }
    catch (error) {
      console.error(error)
      savingResult.value = {
        type: 'error',
        message: "Une erreur d'enregistrement s'est produite. Les données n'ont pas été sauvegardées sur les serveurs CartoBio."
      }
    }

    isSaving.value = false
  }, 300)
}

function patchGeoJSON (action, fn) {
  props.parcellaire.features
    .filter(({ id }) => props.selectedFeatureIds.includes(id))
    .forEach(feature => fn({ feature, value: action.value }))

  return props.parcellaire
}
</script>
