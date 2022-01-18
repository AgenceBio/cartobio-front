import { reactive, toRefs } from 'vue'

export default reactive({
  state: {
    currentUser: null
  },

  loginUser (userData) {
    this.state.currentUser = toRefs(userData)
  },

  logoutUser () {
    this.state.currentUser = null
  },
})
