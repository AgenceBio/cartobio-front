import { reactive } from 'vue'

const DEFAULT_STATE = {
  currentUser: {},
  parcellaire: {},
  parcellaireSource: null,
  parcellaireSourceLastUpdate: null,
}

export default reactive({
  state: structuredClone(DEFAULT_STATE),

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
