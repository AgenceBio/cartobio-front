<route lang="yaml">
meta:
  requiresAuth: true
</route>

<template>
  <div class="fr-container fr-my-5w">
    <h2>
      Importer mon parcellaire
    </h2>

    <p>
      Sélectionner l’outil où votre parcellaire est maintenu à jour.
    </p>


    <div class="fr-tabs">
      <ul class="fr-tabs__list" role="tablist">
        <li v-for="(source, sourceId) in featureSources" role="presentation" :key="sourceId">
          <button class="fr-tabs__tab" :disabled="source.active === false" type="button" :aria-selected="sourceId === featureSource" @click="featureSource = sourceId">{{ source.label }}</button>
        </li>
      </ul>

      <section :class="{'fr-tabs__panel': true, 'fr-tabs__panel--selected': featureSource === 'telepac'}" role="tabpanel">
        <!-- <article>
          <button type="button" @click.prevent="$router.push('/operateur/parcellaire')">
            🔐 Connecter mon compte TelePAC
          </button>
        </article> -->
        <div class="fr-alert fr-alert--info fr-mb-5w">
            <p class="fr-alert__title">Remarque</p>
            <p>
              Le nom du fichier ressemble à
              <code>Dossier-PAC-{{ campagnePacAnnee }}_parcelle-{{ campagnePacAnnee }}_{{ currentUser.numeroPacage }}_….zip</code>.
            </p>
        </div>

          <div class="fr-upload-group">
              <input type="file" ref="pacFileInput" accept=".zip" @change="handlePacFileUpload" hidden />

              <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="pacFileInput.click()">
                Importer ma dernière déclaration PAC
              </button>
          </div>


          <details class="fr-my-5w">
            <summary class="fr-icon-questionnaire-line fr-btn fr-btn--secondary fr-btn--icon-left">Où trouver mon fichier ?</summary>

            <p>
              Le fichier <b>Parcelles déclarées {{ campagnePacAnnee }} › Fichier de parcelles</b> se trouve sur le <a href="https://www.telepac.agriculture.gouv.fr/" target="_blank">portail Telepac</a>,
              dans la <a :href="campagnePacUrl" target="_blank">téléprocédure <b>Dossier PAC {{ campagnePacAnnee }}</b></a>,
              dans l'onglet bleu "Import/export" puis <a :href="campagnePacExportUrl" target="_blank">Export îlots et parcelles</a>.
            </p>
            <p>
              <img src="/import/telepac-export.png" class="screenshot" alt="Écran Import/Export du dossier PAC sur le service en ligne Telepac" />
            </p>
          </details>
      </section>

      <section :class="{'fr-tabs__panel': true, 'fr-tabs__panel--selected': featureSource === 'mesparcelles'}" role="tabpanel">
        <!-- <article>
          <button type="button" @click.prevent="$router.push('/operateur/parcellaire')">
            🔐 Connecter mon compte MesParcelles
          </button>
        </article> -->

        <div class="fr-alert fr-alert--info fr-mb-5w">
            <p class="fr-alert__title">Remarque</p>
            <p>Nous importons les parcelles de l'exploitation principale, pour l'instant.</p>
        </div>

          <form @submit.prevent="handleMesParcellesLoginImport(mesParcellesUser)">
            <div class="fr-input-group">
              <label for="mp-email" class="fr-label">Adresse e-mail MesParcelles</label>

              <div class="fr-input-wrap fr-icon-mail-line">
                <input type="email" class="fr-input" id="mp-email" v-model="mesParcellesUser.email" ref="loginInput" required autofocus />
              </div>
            </div>

            <div class="fr-input-group">
              <label for="mp-password" class="fr-label">Mot de passe</label>
              <div class="fr-input-wrap fr-icon-shield-line">
                <input type="password" class="fr-input" id="mp-password" v-model="mesParcellesUser.password" required autocomplete="off" />
              </div>
            </div>

            <div class="fr-input-group">
              <label for="mp-server" class="fr-label">Choix du serveur régional</label>
              <select id="mp-server" class="fr-select" v-model="mesParcellesUser.server" required>
                <option v-for="(label, key) in mesParcellesServers" :value="key" :key="key" selected="selected">{{ label }}</option>
              </select>
            </div>

            <div class="fr-input-group">
              <button class="fr-btn" :disabled="!mesParcellesUser.server || !mesParcellesUser.password || !mesParcellesUser.email">Importer les parcelles</button>
            </div>
          </form>
      </section>

      <section :class="{'fr-tabs__panel': true, 'fr-tabs__panel--selected': featureSource === 'geofolia'}" role="tabpanel">
        <!-- <article>
          <button type="button" @click.prevent="$router.push('/operateur/parcellaire')">
            🔐 Connecter mon compte Isagri Geofolia
          </button>
        </article> -->
        <div class="fr-alert fr-alert--info fr-mb-5w">
            <p class="fr-alert__title">Remarque</p>
            <p>Le nom du fichier ressemble à <code>…_Parcelles et Interventions (ZIP)_….zip</code>.</p>
        </div>

          <div class="fr-upload-group">
              <input type="file" ref="geofoliaFileInput" accept=".zip" @change="handleGeofoliaFileUpload" hidden>

              <button class="fr-btn fr-icon-upload-line fr-btn--icon-left" @click="geofoliaFileInput.click()">
                Importer mes parcelles et interventions
              </button>
          </div>


          <details class="fr-my-5w">
            <summary class="fr-icon-questionnaire-line fr-btn fr-btn--secondary fr-btn--icon-left">Où trouver mon fichier ?</summary>

            <p>
              Le fichier <b>Parcelles et interventions (ZIP)</b> se trouve dans l'onglet "Export › Parcelles et interventions"
              du logiciel Géofolia, édité par Isagri.
            </p>

            <p>
              <img src="/import/geofolia-export.png" class="screenshot" alt="Écran Export Parcelles et interventions du logiciel Géofolia" />
            </p>
          </details>
      </section>
    </div>
  </div>
</template>

<script setup>
import { post } from 'axios'
import { ref, readonly, computed, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import store from '../../store.js'

const { VUE_APP_API_ENDPOINT } = import.meta.env

const router = useRouter()
const currentUser = toRef(store.state, 'currentUser')
const featureSource = ref(store.state.parcellaireSource ?? 'telepac')
const campagnePacAnnee = ref(2021)
const campagnePacAnneeShort = computed(() => String(campagnePacAnnee.value).slice(-2))
const campagnePacUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/auth/accueilTas.action?campagne=${campagnePacAnnee.value}&titreApplication=Dossier+PAC+${campagnePacAnnee.value}`)
const campagnePacExportUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/ie/exportShpIlots.action`)

const pacFileInput = ref(null)
const geofoliaFileInput = ref(null)

watch(featureSource, () => window._paq.push(['trackEvent', 'setup', 'sourceSelect', featureSource.value]))

const mesParcellesUser = ref({
  email: '',
  password: '',
  server: 'rhone-alpes'
})
const mesParcellesServers = readonly({
  'alsace-lorraine': 'Alsace-Lorraine',
  'aquitaine': 'Aquitaine',
  'auvergne': 'Auvergne',
  'bourgogne': 'Bourgogne',
  'bretagne': 'Bretagne',
  'centre': 'Centre',
  'champagne-ardenne': 'Champagne-Ardenne',
  'franche-compte': 'Franche-Comté',
  'ile-de-france': 'Île-de-France',
  'limousin': 'Limousin',
  'hautsdefrance': 'Hauts-de-France',
  'normandie': 'Normandie',
  'paca': 'Provence-Alpes-Côte-d\'Azur',
  'pdl': 'Pays-de-la-Loire',
  'poitou-charentes': 'Poitou-Charentes',
  'rhone-alpes': 'Rhône-Alpes',
})

const featureSources = readonly({
  mesparcelles: {
    label: 'MesParcelles',
    active: true,
  },
  geofolia: {
    label: 'Géofolia',
    active: true,
  },
  telepac: {
    label: 'Déclaration PAC',
    active: true,
  },
  ncvi: {
    label: 'ProDouanes (nCVI)',
    active: false,
  },
  smagfarmer: {
    label: 'SMAG Farmer',
    active: false,
  },
})

async function handlePacFileUpload () {
  const [archive] = pacFileInput.value.files
  window._paq.push(['trackEvent', 'setup', `import:${featureSource.value}`, 'start'])

  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await post(`${VUE_APP_API_ENDPOINT}/v1/convert/shapefile/geojson`, form)

  const { data } = await post(`${VUE_APP_API_ENDPOINT}/v2/operator/${currentUser.value.id}/parcelles`, {
    geojson,
    metadata: {
      source: featureSource.value,
      sourceLastUpdate: new Date().toISOString()
    }
  })

  store.setParcelles({ geojson: data.parcelles, source: featureSource.value })
  window._paq.push(['trackEvent', 'setup', `import:${featureSource.value}`, 'ok'])
  router.push('/operateur/certification-ab')
}

async function handleGeofoliaFileUpload () {
  const [archive] = geofoliaFileInput.value.files
  window._paq.push(['trackEvent', 'setup', `import:${featureSource.value}`, 'start'])

  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await post(`${VUE_APP_API_ENDPOINT}/v1/convert/geofolia/geojson`, form)

  const { data } = await post(`${VUE_APP_API_ENDPOINT}/v2/operator/${currentUser.value.id}/parcelles`, {
    geojson,
    metadata: {
      source: featureSource.value,
      sourceLastUpdate: new Date().toISOString()
    }
  })

  store.setParcelles({ geojson: data.parcelles, source: featureSource.value })
  window._paq.push(['trackEvent', 'setup', `import:${featureSource.value}`, 'ok'])
  router.push('/operateur/parcellaire')
}

async function handleMesParcellesLoginImport ({ email, password, server }) {
  const { data: geojson } = await post(`${VUE_APP_API_ENDPOINT}/v2/import/mesparcelles/login`, { email, password, server })

  const { data } = await post(`${VUE_APP_API_ENDPOINT}/v2/operator/${currentUser.value.id}/parcelles`, {
    geojson,
    metadata: {
      source: featureSource.value,
      sourceLastUpdate: new Date().toISOString()
    }
  })

  store.setParcelles({ geojson: data.parcelles, source: featureSource.value })
  window._paq.push(['trackEvent', 'setup', `import:${featureSource.value}`, 'ok'])
  router.push('/operateur/certification-ab')
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
