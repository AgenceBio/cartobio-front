import { reactive, watch } from 'vue'
import { get } from 'axios'

const DEFAULT_STATE = {
  currentUser: {},
  parcellaire: {},
  parcellaireSource: null,
  parcellaireSourceLastUpdate: null,
}

const DEFAULT_STATS = {
  surfaceCartobioCouverte: 0,
  surfaceBioCouverte: 2776553,
  surfaceRpgBioCouverte: 2360070,
  get surfaceCartographiéConnuee () {
    return (this.surfaceRpgBioCouverte / this.surfaceBioCouverte * 100).toLocaleString('fr-FR')
  },
  cartobioExploitationsCount: 0,
  opendataDownloadCount: 518, // datapass.api.gouv.fr + demandes manuelles
}

const store = reactive({
  state: {
    ...structuredClone(DEFAULT_STATE),
    currentUser: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : structuredClone(DEFAULT_STATE.currentUser),
    stats: structuredClone(DEFAULT_STATS),
  },

  async fetchStats () {
    const [ dataGouv ] = await Promise.all([
      get('https://www.data.gouv.fr/api/1/datasets/616d6531c2951bbe8bd97771/')
    ])

    this.state.stats.opendataDownloadCount = dataGouv.data.resources.reduce((sum, resource) => sum + (resource.metrics.views ?? 0), DEFAULT_STATS.opendataDownloadCount)

  },

  loginUser (userData) {
    Object.assign(this.state.currentUser, userData)
  },

  setParcelles ({ geojson, source, sourceLastUpdate }) {
    this.state.parcellaireSource = source
    this.state.parcellaireSourceLastUpdate = sourceLastUpdate ?? new Date().toISOString()
    Object.assign(this.state.parcellaire, geojson)
  },

  logoutUser () {
    Object.assign(this.state, structuredClone(DEFAULT_STATE))
  },
})

watch(() => store.state.currentUser, currentUser => {
  localStorage.setItem('currentUser', JSON.stringify(currentUser))
}, { deep: true })

export default store
