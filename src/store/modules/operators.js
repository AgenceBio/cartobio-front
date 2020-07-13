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

  UPDATE_OPERATOR ({ state, commit, rootState }, { numeroBio, pacage }) {
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
