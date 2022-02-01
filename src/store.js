import { reactive } from 'vue'

export default reactive({
  state: {
    currentUser: {}
  },

  loginUser (userData) {
    Object.assign(this.state.currentUser, userData)
  },

  logoutUser () {
    this.state.currentUser = {}
  },
})
