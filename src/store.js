import { reactive } from 'vue'

export default reactive({
  state: {
    currentUser: {},
    parcellaire: {},
    parcellaireSource: null,
    parcellaireSourceLastUpdate: null,
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
    this.state.currentUser = {}
    this.state.parcellaire = {}
  },
})
