import { reactive } from 'vue'

export default reactive({
  state: {
    currentUser: {},
    parcellaire: {},
  },

  loginUser (userData) {
    Object.assign(this.state.currentUser, userData)
  },

  setParcelles (geojson) {
    Object.assign(this.state.parcellaire, geojson)
  },

  logoutUser () {
    this.state.currentUser = {}
    this.state.parcellaire = {}
  },
})
