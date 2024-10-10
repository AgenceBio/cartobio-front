<template>
  <div>
    <h3 class="fr-sr-only">Import MesParcelles</h3>

    <div class="fr-upload-group fr-mb-5w">
      <input type="file" ref="fileInput" accept=".xml" @change="handleFileUpload" hidden />
      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Sélectionner mon export MesParcelles (service Telepac)
      </button>
    </div>

    <div v-if="erreur" class="fr-alert fr-alert--error fr-mb-6w">
      <h3 class="fr-alert__title">Échec de l'import</h3>
      <p>{{ erreur }}</p>
    </div>

    <div class="fr-alert fr-alert--info">
      <h3 class="fr-alert__title">Où récupérer le fichier demandé ?</h3>

      <p>
        Consultez la page
        <a
          href="https://docs-cartobio.agencebio.org/agriculteurs.trices/pas-a-pas/importer-mon-parcellaire/import-du-fichier-mesparcelles"
          target="_blank"
          >import MesParcelles<lien-externe
        /></a>
        de notre documentation pour une aide illustrée et pas à pas.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { convertTelepacFileToGeoJSON } from "@/cartobio-api.js";
import { sources } from "@/referentiels/imports.js";

const emit = defineEmits(["upload:start", "upload:complete"]);

const fileInput = ref(null);
const erreur = ref("");

async function handleFileUpload() {
  const warnings = [];
  const [file] = fileInput.value.files;

  emit("upload:start");

  try {
    const geojson = await convertTelepacFileToGeoJSON(file);
    const metadata = {
      pacage: geojson.features.at(0)?.properties?.PACAGE,
    };

    emit("upload:complete", { geojson, source: sources.MESPARCELLES, warnings, metadata });
  } catch (error) {
    if (error.response?.status >= 400 && error.response?.status < 500) {
      erreur.value = "Votre fichier ne semble pas être un export MesParcelles valide.";
    } else {
      erreur.value = "Erreur inconnue, merci de réessayer plus tard.";
      throw error;
    }
  }
}
</script>
