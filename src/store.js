import { reactive, watch } from 'vue'
import axios from 'axios'
import { now } from '@/components/dates.js'

const DEFAULT_STATE = {
  currentUser: {},
  record_id: null,
  record: {
    record_id: null,
    certification_state: null,
    created_at: null,
    updated_at: null,
  },
  parcellaire: {},
  parcellaireSource: null,
  parcellaireSourceLastUpdate: null,
  stats: {}
}

const DEFAULT_STATS = {
  surfaceCartobioCouverte: 0,
  surfaceBioCouverte: 2776553,
  surfaceRpgBioCouverte: 2360070,
  get surfaceCartographiéConnuee () {
    return (this.surfaceRpgBioCouverte / this.surfaceBioCouverte * 100).toLocaleString('fr-FR')
  },
  cartobioExploitationsCount: 0,
  cartobioParcellesCount: 0,
  opendataDownloadCount: 518, // datapass.api.gouv.fr + demandes manuelles
}

const store = reactive({
  state: {
    ...structuredClone(DEFAULT_STATE),
    currentUser: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : structuredClone(DEFAULT_STATE.currentUser),
    stats: structuredClone(DEFAULT_STATS),
  },

  async fetchStats () {
    const [ dataGouv, cartobioStats ] = await Promise.all([
      axios.get('https://www.data.gouv.fr/api/1/datasets/616d6531c2951bbe8bd97771/'),
      axios.get(`${import.meta.env.VUE_APP_API_ENDPOINT}/v2/stats`)
    ])

    this.state.stats.opendataDownloadCount = dataGouv.data.resources.reduce((sum, resource) => sum + (resource.metrics.views ?? 0), DEFAULT_STATS.opendataDownloadCount)
    this.state.stats.cartobioExploitationsCount = cartobioStats.data.stats.count
    this.state.stats.cartobioParcellesCount = cartobioStats.data.stats.parcelles_count

  },

  setCurrentUser (userData) {
    Object.assign(this.state.currentUser, userData)
  },

  setParcelles ({ geojson, source, sourceLastUpdate }) {
    this.state.parcellaireSource = source
    this.state.parcellaireSourceLastUpdate = sourceLastUpdate ?? now()
    Object.assign(this.state.parcellaire, geojson)
  },

  setRecord (record) {
    if (record.record_id) {
      this.state.record_id = record.record_id
    }

    Object.assign(this.state.record, record)
  },

  logoutUser () {
    Object.assign(this.state, structuredClone(DEFAULT_STATE))
    localStorage.removeItem('currentUser')
  },
})

watch(() => store.state.currentUser, currentUser => {
  localStorage.setItem('currentUser', JSON.stringify(currentUser))
}, { deep: true })

export default store
