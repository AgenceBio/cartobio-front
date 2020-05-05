import {parseJwt} from '@/api/user.js';

const state = {

};

const actions = {
  setProfile ({ commit }, cartobioToken) {
    if (!cartobioToken) {
      return null;
    }

    console.log(cartobioToken)

    return Promise.resolve(cartobioToken)
      .then(token => parseJwt(token))
      .then(userData => {
        commit("setUser", userData, { root: true })
        commit("setUserCategory", userData.mainGroup.nom, { root: true })
        return userData
      });
  },
};

const getters = {
  isAuthenticated (state, getters, rootState) {
    const {userProfile} = rootState
    return Boolean(userProfile && userProfile.id);
  },
};

export default {
  namespaced: true,
  actions,
  getters,
  state,
}
