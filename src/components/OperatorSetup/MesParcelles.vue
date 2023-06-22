<template>
  <div>
    <div class="fr-alert fr-alert--info fr-mb-5w">
      <p class="fr-alert__title">Remarque</p>
      <p>Nous importons les parcelles de l'exploitation principale, pour l'instant.</p>
    </div>

    <div  v-if="errors.length" class="fr-alert fr-alert--error fr-mb-5w">
      <p class="fr-alert__title">Erreur</p>
      <p v-for="error in errors" :key="error">{{ error }}</p>
    </div>

    <form @submit.prevent="handleLoginImport(mesParcellesUser)">
      <div class="fr-input-group">
        <label for="mp-email" class="fr-label">Adresse e-mail MesParcelles</label>

        <div class="fr-input-wrap fr-icon-mail-line">
          <input type="email" class="fr-input" id="mp-email" v-model="mesParcellesUser.email" ref="loginInput" required
            autofocus />
        </div>
      </div>

      <div class="fr-input-group">
        <label for="mp-password" class="fr-label">Mot de passe</label>
        <div class="fr-input-wrap fr-icon-shield-line">
          <input type="password" class="fr-input" id="mp-password" v-model="mesParcellesUser.password" required
            autocomplete="off" />
        </div>
      </div>

      <div class="fr-input-group">
        <label for="mp-server" class="fr-label">Choix du serveur régional</label>
        <select id="mp-server" class="fr-select" v-model="mesParcellesUser.server" required>
          <option v-for="(label, key) in mesParcellesServers" :value="key" :key="key" selected="selected">{{ label }}
          </option>
        </select>
      </div>

      <div class="fr-input-group">
        <label for="mp-server" class="fr-label">Millésime</label>
        <select id="mp-server" class="fr-select" v-model="mesParcellesUser.millesime" required>
          <option v-for="(year) in [2022, 2023]" :value="year" :key="year" selected="selected">{{ year }}
          </option>
        </select>
      </div>

      <div class="fr-input-group">
        <button class="fr-btn"
          :disabled="!mesParcellesUser.server || !mesParcellesUser.password || !mesParcellesUser.email">Collecter les
          parcelles</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { readonly, ref } from 'vue'
import axios from 'axios'

const { VUE_APP_API_ENDPOINT } = import.meta.env

const emit = defineEmits(['upload:start', 'upload:complete'])
const source = 'mesparcelles'
const errors = ref([])

const mesParcellesUser = ref({
  email: '',
  millesime: new Date().getFullYear(),
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

async function handleLoginImport ({ email, millesime, password, server }) {
  emit('upload:start')

  try {
    const { data: geojson } = await axios.post(`${VUE_APP_API_ENDPOINT}/v2/import/mesparcelles/login`, { email, millesime, password, server })
  } catch (error) {
    if (error.response.status === 401) {
      return errors.value = ['Identifiants incorrects.']
    }

    if (error.response.status === 500) {
      return errors.value = ['Erreur interne au serveur MesParcelles.']
    }
  }

  emit('upload:complete', { geojson, source, warnings: [] })
}

</script>
