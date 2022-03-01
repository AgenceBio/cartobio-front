import { reactive, watch } from 'vue'

const DEFAULT_STATE = {
  currentUser: {},
  parcellaire: {},
  parcellaireSource: null,
  parcellaireSourceLastUpdate: null,
}

const store = reactive({
  state: {
    ...structuredClone(DEFAULT_STATE),
    currentUser: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : structuredClone(DEFAULT_STATE.currentUser)
  },

  loginUser (userData) {
    Object.assign(this.state.currentUser, userData)
  },

  setParcelles ({ geojson, source }) {
    this.state.parcellaireSource = source
    this.state.parcellaireSourceLastUpdate = new Date().toISOString()
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
