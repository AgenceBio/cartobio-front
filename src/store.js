import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        userProfile: {},
        currentOperator: {},
        disclaimer: true
    },
    getters: {
        getProfile: state => state.userProfile,
        getOperator: state => state.currentOperator,
        getDisclaimer: state => state.disclaimer
    },
    mutations: {
        setUser(state, profile) {
            state.userProfile = profile;
        },
        setOperator(state, operator) {
            state.currentOperator = operator;
        },
        setDisclaimer(state, bool) {
            state.disclaimer = bool;
        }
    }
})