import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        userProfile: {}
    },
    getters: {
        getProfile: state => state.userProfile
    },
    mutations: {
        setUser(state, profile) {
            state.userProfile = profile;
        }
    }
})