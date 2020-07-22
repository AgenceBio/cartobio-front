import Vue from "vue";
import {get, patch} from "axios";

const { VUE_APP_API_ENDPOINT, VUE_APP_COLLABORATIF_ENDPOINT } = process.env;

const BASE_WFS_PARAMS = {
  service: "WFS",
  version: "1.1.0",
  request: "GetFeature",
  outputFormat: "GeoJSON",
  srsname: "4326",
  typeName: null,
  filter: null,
}

const state = {
  areSingleOperatorParcelsLoading: false,
  areCertificationBodyParcelsLoading: false,
  isUpdatingOperator: false,

  wfsLayerIds: new Map([
    [2020, 'rpgbio2020v1'],
    [2019, 'rpgbio2019v4'],
    [2018, 'rpgbio2018v9'],
    [2017, 'rpgbio2017v7'],
  ]),

  currentOperatorId: null,
  certificationBodyOperators: [],
};

/**
 * Translates GeoJSON feature into a simili-Agence Bio one.
 *
 * This is because initially, the displayed data were taken from AgenceBio API
 * whereas now, data are taken from our own API, which mimics… our GeoPortail data structure 🙃
 * @param  {[type]} properties [description]
 * @return {[type]}            [description]
 */
function wrapOperator ({ properties }) {
  return {
    id: properties.numerobio,
    dateEngagement: properties.date_engagement,
    dateMaj: properties.date_maj,
    numeroPacage: properties.pacage,
    numeroBio: properties.numerobio,
    title: properties.nom
  }
}

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

  FETCH_WFS_LAYERS ({ state }, { numeroPacage, years }) {
    state.areSingleOperatorParcelsLoading = true

    const yearsP = years.map(year => {
      const typeName = state.wfsLayerIds.get(year)

      // Doc : https://espacecollaboratif.ign.fr/api/doc/transaction
      // mongoDB filter and not standard WFS filter.
      return get(`${VUE_APP_COLLABORATIF_ENDPOINT}/gcms/wfs/cartobio`, {
        params: {
          ...BASE_WFS_PARAMS,
          filter: JSON.stringify({
            pacage: String(numeroPacage).padStart(9, '0')
          }),
          typeName
        }
      }).then(({ data }) => [year, data])
    })

    const p = Promise.all(yearsP)
    p.finally(() => state.areSingleOperatorParcelsLoading = false)

    return p
  },

  UPDATE_OPERATOR ({ state, commit, rootState }, { numeroBio, numeroPacage }) {
    const {apiToken} = rootState.user
    const options = {
      headers: {
        Authorization: `Bearer ${apiToken}`
      }
    }

    state.isUpdatingOperator = true

    const p = patch(`${VUE_APP_API_ENDPOINT}/v1/operator/${numeroBio}`, { numeroPacage }, options)

    p.then(({ data }) => commit('MERGE_OPERATOR', data))
      .catch(console.error)

    p.finally(() => state.isUpdatingOperator = false)

    return p
  }
};

const mutations = {
  CLEAR (state) {
    state.currentOperatorId = null
    state.certificationBodyOperators = []
  },
  CLEAR_CURRENT (state) {
    state.currentOperatorId = null
  },

  SET_CURRENT (state, numeroBio) {
    state.currentOperatorId = numeroBio
  },

  MERGE_OPERATOR (state, featureCollection) {
    const feature = featureCollection.features[0]

    const index = state.certificationBodyOperators.features.findIndex(({ properties }) => {
      return properties.numerobio === feature.properties.numerobio
    })

    Vue.set(state.certificationBodyOperators.features, index, feature)
  }
};

const getters = {
  isLoaded (state) {
    return state.isLoaded
  },

  currentOperator (state) {
    const feature = (state.certificationBodyOperators?.features ?? []).find(({ properties }) => {
      return properties.numerobio === state.currentOperatorId
    })

    return feature ? wrapOperator(feature) : {}
  }
};

export default {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
}
