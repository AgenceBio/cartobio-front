import {parseJwt} from '@/api/user.js';

const state = {
  // has the first load happened?
  isLoaded: false,
  apiToken: null,
};

const actions = {
  setProfile ({ commit, state }, cartobioToken) {
    if (!cartobioToken) {
      state.apiToken = null
      return null;
    }

    return Promise.resolve(cartobioToken)
      .then(token => parseJwt(token))
      .then(userData => {
        state.apiToken = cartobioToken

        commit("FIRST_LOAD_DONE")
        commit("setUser", userData, { root: true })
        commit("setUserCategory", userData.mainGroup.nom, { root: true })
        return userData
      });
  },
};

const mutations = {
  FIRST_LOAD_DONE (state) {
    state.isLoaded = true
  }
};

const getters = {
  isAuthenticated (state, getters, rootState) {
    const {userProfile} = rootState
    return Boolean(userProfile && userProfile.id);
  },

  isLoaded (state) {
    return state.isLoaded
  }
};

export default {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
}
