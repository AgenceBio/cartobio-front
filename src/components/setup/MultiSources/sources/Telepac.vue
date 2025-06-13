<template>
  <div>
    <h3 class="fr-sr-only">Import Telepac</h3>
    <div v-if="isOnCartobio && operatorStore.imported">
      <div class="fr-callout fr-icon-notification-3-line">
        <h3 class="fr-callout__title">Parcellaire déclaré à la PAC transmis à Cartobio</h3>
        <p class="fr-callout__text">
          A date du : {{ VUE_APP_DATEIMPORT }}
          <br />
          N° Pacage : {{ operatorStore.imported.pacage }}
          <br />
          {{ operatorStore.imported.nb_parcelles }} parcelle{{ operatorStore.imported.nb_parcelles > 1 ? "s" : "" }} ({{
            (operatorStore.imported.size / 10000).toFixed(2).replace(".",",")
          }}
          ha)
        </p>
        <button class="fr-btn" @click="importPAC()">Importer et créer une nouvelle version</button>
      </div>

      <div class="fr-alert fr-alert--info">
        <h3 class="fr-alert__title">D'où vient ce parcellaire ?</h3>

        <p>
          Ce parcellaire correspond à votre dernière déclaration PAC. Il a été transmis de Télépac à CartoBio, avec
          votre accord, afin de faciliter la transmission des données entre les deux outils. Il reste à votre
          disposition et vous pouvez l'utiliser pour créer une nouvelle version.
        </p>
      </div>
      <hr class="fr-my-3w" />
    </div>
    <h3 class="fr-h5">Importer manuellement un fichier</h3>

    <div class="fr-upload-group fr-mb-5w">
      <input type="file" ref="fileInput" accept=".zip,.xml" @change="handleFileUpload" hidden />
      <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="fileInput.click()">
        Sélectionner ma dernière déclaration PAC
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
          href="https://docs-cartobio.agencebio.org/agriculteurs.trices/pas-a-pas/importer-mon-parcellaire/import-de-la-declaration-pac"
          target="_blank"
          >import de la déclaration PAC<lien-externe
        /></a>
        de notre documentation pour une aide illustrée et pas à pas.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import { convertTelepacFileToGeoJSON } from "@/cartobio-api.js";
import { useTélépac } from "@/referentiels/pac.js";
const { VUE_APP_DATEIMPORT } = import.meta.env;
import { useOperatorStore } from "@/stores/operator.js";

const operatorStore = useOperatorStore();
const isOnCartobio = inject("isOnCartobio");

const emit = defineEmits(["upload:start", "upload:complete"]);

const { campagne: currentCampagne } = useTélépac();
const fileInput = ref(null);
const source = "telepac";
const erreur = ref("");

async function importPAC() {
  const metadata = operatorStore.imported.record.metadata;
  const geojson = operatorStore.imported.record.parcelles;
  const w = [];
  const versionName = operatorStore.imported.record.version_name;
  emit("upload:complete", { geojson, source, w, metadata, versionName });
}

async function handleFileUpload() {
  const warnings = [];
  const [archive] = fileInput.value.files;

  emit("upload:start");

  try {
    const geojson = await convertTelepacFileToGeoJSON(archive);
    const metadata = {
      campagne: geojson.features.at(0)?.properties?.CAMPAGNE,
      pacage: geojson.features.at(0)?.properties?.PACAGE,
    };

    if (parseInt(metadata.campagne, 10) < currentCampagne.value) {
      warnings.push(
        `Le fichier contient des données datant de la campagne ${metadata.campagne}. Peut-être disposez-vous d'un export plus récent, par exemple de la campagne ${currentCampagne.value} ?`,
      );
    }

    emit("upload:complete", { geojson, source, warnings, metadata });
  } catch (error) {
    if (error.response?.status >= 400 && error.response?.status < 500) {
      erreur.value = error.response.data.message;
    } else {
      erreur.value = "Erreur inconnue, merci de réessayer plus tard.";
      throw error;
    }
  }
}
</script>
