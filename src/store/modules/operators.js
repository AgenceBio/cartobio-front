import {get, patch} from "axios";

const { VUE_APP_API_ENDPOINT } = process.env;

const state = {
  areSingleOperatorParcelsLoading: false,
  areCertificationBodyParcelsLoading: false,
  isUpdatingOperator: false,

  certificationBodyOperators: [],
};

const actions = {
  FETCH_OPERATORS ({ state, rootState }) {
    const {apiToken} = rootState.user
    const options = {
      headers: {
        Authorization: `Bearer ${apiToken}`
      }
    }

    state.areCertificationBodyParcelsLoading = true

    const p = get(`${VUE_APP_API_ENDPOINT}/v1/summary`, options)

    p.then(({ data }) => state.certificationBodyOperators = data)
      .finally(() => state.areCertificationBodyParcelsLoading = false)

    return p
  },

  UPDATE_OPERATOR ({ state, rootState }, { numeroBio, pacage }) {
    const {apiToken} = rootState.user
    const options = {
      headers: {
        Authorization: `Bearer ${apiToken}`
      }
    }

    state.isUpdatingOperator = true

    const p = patch(`${VUE_APP_API_ENDPOINT}/v1/operator/${numeroBio}`, { pacage }, options)

    p.then(console.log)
      .catch(console.error)
      .finally(() => this.isUpdatingOperator = false)

    return p
  }
};

const mutations = {
  MERGE_OPERATOR ({ state }, geojson) {
    const index = state.certificationBodyOperators.features.findIndex(({ properties }) => {
      return properties.numerobio === geojson.properties.numerobio
    })

    state.certificationBodyOperators.features[index] = geojson
  }
};

const getters = {
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
