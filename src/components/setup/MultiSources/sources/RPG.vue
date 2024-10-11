<script setup>
import { ref } from "vue";

import { pacageLookup } from "@/cartobio-api.js";
import { normalize, isValid, useTélépac } from "@/referentiels/pac.js";
import { sources } from "@/referentiels/imports.js";
import { useOperatorStore } from "@/stores/operator.js";

const emit = defineEmits(["upload:start", "upload:complete"]);

const telepac = useTélépac();
const operatorStore = useOperatorStore();

const pacage = ref(operatorStore.operator?.numeroPacage ?? "");
const loading = ref(false);
const erreur = ref("");
const importRPG = async () => {
  if (!isValid(normalize(pacage.value))) {
    if (pacage.value.length < 7 || pacage.value.length > 9) {
      erreur.value = "Le numéro de PACAGE est composé de minimum 7 chiffres.";
    } else {
      erreur.value =
        "Le numéro de PACAGE est invalide. Il doit commencer par le numéro du département, " +
        "et être composé de 7 ou 8 chiffres, éventuellement précédés de 0, ou de 9 chiffres pour les DROM.";
    }
    return;
  }

  erreur.value = "";
  loading.value = true;
  emit("upload:start");

  try {
    const geojson = await pacageLookup(normalize(pacage.value));
    if (!geojson.features.length) {
      erreur.value = "Aucune parcelle trouvée pour ce numéro de PACAGE.";
      return;
    }
    emit("upload:complete", {
      geojson,
      source: sources.RPG,
      warnings: [],
      metadata: {
        pacage: normalize(pacage.value),
        campagne: telepac.campagne.value,
      },
    });
  } catch (err) {
    erreur.value = "Erreur inconnue, merci de réessayer plus tard.";
    throw err;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <h3 class="fr-sr-only">Import Registre Parcellaire Graphique (RPG)</h3>

    <p>Vous pouvez importer le dernier Registre parcellaire graphique (RPG) instruit.</p>

    <form @submit.prevent="importRPG">
      <div class="fr-input-group" :class="{ 'fr-input-group--disabled': loading, 'fr-input-group--error': !!erreur }">
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

<style scoped></style>
