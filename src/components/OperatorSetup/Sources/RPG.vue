<script setup>
import { ref } from "vue"

import { pacageLookup } from "@/cartobio-api.js"
import { normalize, isValid, useTélépac } from "@/referentiels/pac.js"
import { sources } from "@/referentiels/imports.js"

const emit = defineEmits(["upload:start", "upload:complete"])

const telepac = useTélépac()

const pacage = ref('')
const loading = ref(false)
const erreur = ref('')
const importRPG = async () => {
  if (!isValid(normalize(pacage.value))) {
    erreur.value = 'Le numéro de PACAGE est composé de 8 ou 9 chiffres.'
    return
  }

  erreur.value = ''
  loading.value = true
  emit('upload:start')

  try {
    const geojson = await pacageLookup(normalize(pacage.value))
    if (!geojson.features.length) {
      erreur.value = 'Aucune parcelle trouvée pour ce numéro de PACAGE.'
      return
    }
    emit('upload:complete', { geojson, source: sources.RPG, warnings: [], metadata: {
        pacage: normalize(pacage.value),
        campagne: telepac.campagne.value,
      }})
  } catch (err) {
    erreur.value = 'Erreur inconnue, merci de réessayer plus tard.'
    throw err
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <p>
      Vous pouvez importer le dernier Registre parcellaire graphique (RPG) instruit
    </p>
    <form @submit.prevent="importRPG">
      <div class="fr-input-group" :class="{'fr-input-group--disabled': loading, 'fr-input-group--error': !!erreur}">
        <label class="fr-label" for="input-pacage">Numéro d'identification PAC (numéro de PACAGE)</label>
        <input v-model="pacage" class="fr-input" id="input-pacage" name="input-pacage" type="text" maxlength="9" />
        <p v-if="erreur" class="fr-error-text">
          {{ erreur }}
        </p>
      </div>
      <button class="fr-btn" :disabled="loading" @click="importRPG">Importer</button>
    </form>
  </div>
</template>

<style scoped>

</style>
