import {parseJwt, getUserProfileFromToken} from '@/api/user.js';

const state = {

};

const actions = {
  getProfile ({commit}, token) {
    const {id:userId} = parseJwt(token)

    return getUserProfileFromToken({userId, token})
      .then(userData => {
        commit("setUser", userData, { root: true })
        commit("setUserCategory", userData.groupes[0].nom, { root: true })
        return userData
      });
  },
};

const getters = {
  isAuthenticated: (state, getters, rootState) => {
    const {userProfile} = rootState
    return userProfile && userProfile.id;
  },
};

export default {
  namespaced: true,
  actions,
  getters,
  state,
}
