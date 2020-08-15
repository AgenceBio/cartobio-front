import {get} from "axios";

const { VUE_APP_API_ENDPOINT } = process.env;

const state = {
  isValidating: false,
};

const actions = {
  VERIFY({ rootState }, { numeroPacage }) {
    const {apiToken} = rootState.user
    const options = {
      headers: {
        Authorization: `Bearer ${apiToken}`
      },
    }

    state.isValidating = true
    const p = get(`${VUE_APP_API_ENDPOINT}/v1/pacage/${numeroPacage}`, options)
      .then(({ data }) => data)

    p.finally(() => state.isValidating = false)

    return p
  },
};

const mutations = {
};

const getters = {
};

export default {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
}
