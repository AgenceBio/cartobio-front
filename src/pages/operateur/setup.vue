<template>
  <div class="container">
    <h2>
      Votre parcellaire
      <small class="tag">Cet outil est actuellement en phase de test</small>
    </h2>

    <p>
      Sélectionner l’outil où votre parcellaire est maintenu à jour.
    </p>

    <ul class="sources">
      <li v-for="(source, sourceId) in featureSources">
        <button class="button" :disabled="source.active === false" type="button" :aria-current="sourceId === featureSource" @click="featureSource = sourceId">{{ source.label }}</button>
      </li>
    </ul>

    <section v-if="featureSource === 'telepac'">
      <!-- <article>
        <button type="button" @click.prevent="$router.push('/operateur/parcellaire')">
          🔐 Connecter mon compte TelePAC
        </button>
      </article> -->

      <article>
        <h3>Import de déclaration PAC</h3>

        <button type="button" @click="pacFileInput.click()">
          <input type="file" ref="pacFileInput" accept=".zip" @change="handlePacFileUpload" hidden>
          <vue-feather type="upload-cloud" /> Importer ma dernière déclaration PAC
        </button>

        <p class="help">
          <vue-feather type="thumbs-up" />
          Le nom du fichier ressemble à <code>Dossier-PAC-{{ campagnePacAnnee }}_parcelle-{{ campagnePacAnnee }}_{{ currentUser.numeroPacage }}_….zip</code>
        </p>

        <details class="help">
          <summary><vue-feather type="help-circle" /> Où trouver mon fichier ?</summary>

          <p>
            Le fichier <b>Parcelles déclarées {{ campagnePacAnnee }} › Fichier de parcelles</b> se trouve sur le <a href="https://www.telepac.agriculture.gouv.fr/" target="_blank">portail Telepac</a>,
            dans la <a :href="campagnePacUrl" target="_blank">téléprocédure <b>Dossier PAC {{ campagnePacAnnee }}</b></a>,
            dans l'onglet bleu "Import/export" puis <a :href="campagnePacExportUrl" target="_blank">Export îlots et parcelles</a>.
          </p>
          <p>
            <img src="/import/telepac-export.png" class="screenshot" alt="Écran Import/Export du dossier PAC sur le service en ligne Telepac" />
          </p>
        </details>
      </article>
    </section>

    <section v-if="featureSource === 'geofolia'">
      <!-- <article>
        <button type="button" @click.prevent="$router.push('/operateur/parcellaire')">
          🔐 Connecter mon compte Isagri Geofolia
        </button>
      </article> -->

      <article>
        <h3>Import des parcelles et interventions</h3>

        <button type="button" @click="geofoliaFileInput.click()">
          <input type="file" ref="geofoliaFileInput" accept=".zip" @change="handleGeofoliaFileUpload" hidden>
          <vue-feather type="upload-cloud" /> Importer mes parcelles et interventions
        </button>

        <p class="help">
          <vue-feather type="thumbs-up" />
          Le nom du fichier ressemble à <code>…_Parcelles et Interventions (ZIP)_….zip</code>
        </p>

        <details class="help">
          <summary><vue-feather type="help-circle" /> Où trouver mon fichier ?</summary>

          <p>
            Le fichier <b>Parcelles et interventions (ZIP)</b> se trouve dans l'onglet "Export › Parcelles et interventions"
            du logiciel Géofolia, édité par Isagri.
          </p>

          <p>
            <img src="/import/geofolia-export.png" class="screenshot" alt="Écran Export Parcelles et interventions du logiciel Géofolia" />
          </p>
        </details>
      </article>
    </section>
  </div>
</template>

<script setup>
import { post } from 'axios'
import { ref, readonly, computed, toRef } from 'vue'
import { useRouter } from 'vue-router'
import store from '../../store.js'

const { VUE_APP_API_ENDPOINT } = import.meta.env

const router = useRouter()
const currentUser = toRef(store.state, 'currentUser')
const featureSource = ref(store.state.parcellaireSource)
const campagnePacAnnee = ref(2021)
const campagnePacAnneeShort = computed(() => String(campagnePacAnnee.value).slice(-2))
const campagnePacUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/auth/accueilTas.action?campagne=${campagnePacAnnee.value}&titreApplication=Dossier+PAC+${campagnePacAnnee.value}`)
const campagnePacExportUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/ie/exportShpIlots.action`)

const pacFileInput = ref(null)
const geofoliaFileInput = ref(null)

const featureSources = readonly({
  telepac: {
    label: 'Déclaration PAC',
    active: true,
  },
  mesparcelles: {
    label: 'MesParcelles',
    active: false,
  },
  geofolia: {
    label: 'Géofolia',
    active: true,
  },
  smagfarmer: {
    label: 'SMAG Farmer',
    active: false,
  },
  ncvi: {
    label: 'ProDouanes (nCVI)',
    active: false,
  }
})

async function handlePacFileUpload () {
  const [archive] = pacFileInput.value.files

  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await post(`${VUE_APP_API_ENDPOINT}/v1/convert/shapefile/geojson`, form)

  store.setParcelles({ geojson, source: featureSource.value })
  router.push('/operateur/parcellaire')
}

async function handleGeofoliaFileUpload () {
  const [archive] = geofoliaFileInput.value.files

  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await post(`${VUE_APP_API_ENDPOINT}/v1/convert/geofolia/geojson`, form)

  store.setParcelles({ geojson, source: featureSource.value })
  router.push('/operateur/parcellaire')
}
</script>

<style scoped>
[aria-current="true"] {
  font-weight: bold;
}

.sources {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 0;
}

article .screenshot {
  max-width: min(500px, 50vw);
}

details.help summary {
  display: block;
}
</style>

<style scoped>
</style>
