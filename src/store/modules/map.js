import getCentroid from '@turf/centroid'
import { featureCollection } from '@turf/helpers';

const state = {
  center: [],
  zoomLevel: 0,

  // this is then reflected on the map with a reactive style state
  hoveredParcels: [],
  hoveredIlotId: null,

  // the map then reacts to this change to gather features, and build an informative popup
  hoveredCoordinates: null,

  trackPointer: false
};

const actions = {
  zoomOn (featureOrfeatureCollection) {
    return featureOrfeatureCollection
  }
};

const mutations = {
  CLEAR_HOVERED_FEATURE (state) {
    state.hoveredParcels = []
    state.hoveredCoordinates = null
    state.trackPointer = false
    state.hoveredIlotId = null
  },

  // DERIVE_CENTER_FROM_FEATURE (state, featureOrFeatureCollection) {

  // },

  HOVERED_FEATURE_COLLECTION(state, { numIlot, featureCollection }) {
    state.hoveredParcels = featureCollection.features.slice(0)
    state.hoveredIlotId = numIlot
  },

  /**
   *
   * @param {*} state
   * @param {{ feature: object, centroid: boolean, trackPointer: boolean }} featureOptions
   */
  HOVERED_FEATURE (state, { feature, trackPointer, lngLat, centroid }) {
    state.hoveredParcels = [feature]
    state.trackPointer = trackPointer ? true : false

    if (centroid === true) {
      const [lng, lat] = getCentroid(feature.geometry).geometry.coordinates
      state.hoveredCoordinates = [lng, lat]
    }
    else {
      state.hoveredCoordinates = [lngLat.lng, lngLat.lat]
    }

  }
};

const getters = {
  /**
   * Returns the ID and lng/lat of a feature actively interacted with by a user
   *
   * @param {*} state
   * @returns {{ id: string, lng: number, lat: number}?}
   */
  activeFeature (state) {
    const [feature] = state.hoveredParcels
    const {hoveredCoordinates: lngLat, trackPointer} = state

    if (!feature || state.hoveredParcels.length > 1) {
      return null
    }

    return { feature, lngLat, trackPointer }
  },

  activeFeatures (state) {
    if (state.hoveredParcels.length < 2) {
      return null
    }

    return {
      featureCollection: featureCollection(state.hoveredParcels),
      numIlot: state.hoveredIlotId
    }
  }
};

export default {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
}
