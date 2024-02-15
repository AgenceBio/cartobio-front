import axios from 'axios'

const { VUE_APP_API_ENDPOINT: baseURL } = import.meta.env

/**
 * @typedef {import('geojson').FeatureCollection} FeatureCollection
 * @typedef {import('@agencebio/cartobio-types').NormalizedRecord} NormalizedRecord
 * @typedef {import('@agencebio/cartobio-types').AgenceBioNormalizedOperator} AgenceBioNormalizedOperator
 * @typedef {import('@agencebio/cartobio-types').AgenceBioNormalizedOperatorWithRecord} AgenceBioNormalizedOperatorWithRecord
 * @typedef {import('@agencebio/cartobio-types').CartoBioUser} CartoBioUser
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeatureCollection} CartoBioFeatureCollection
 */

const apiClient = axios.create({ baseURL, timeout: 10000 })

/**
 * @param {number} numeroBio
 * @returns {Promise<NormalizedRecord>}
 */
export async function getOperatorParcelles (numeroBio) {
  const { data } = await apiClient.get(`/v2/operator/${numeroBio}`)

  return data
}

/**
 *
 * @param {{ evv: String, numeroBio: String }} params
 * @returns {Promise<CartoBioFeatureCollection>}
 */
export async function getOperatorNcviFeatures ({ evv, numeroBio }) {
  const { data } = await apiClient.get(`/v2/import/evv/${evv}+${numeroBio}`)

  return data
}

/**
 * @param {string} input
 * @returns {Promise<AgenceBioNormalizedOperatorWithRecord[]>}
 */
export async function searchOperators (input) {
  const { data } = await apiClient.post(`/v2/certification/operators/search`, { input })

  return data
}

/**
 * @return {Promise<AgenceBioNormalizedOperator[]>}
 */
export async function getUserOperators () {
  const { data } = await apiClient.get(`/v2/operators`)

  return data
}

/**
 * @param {string} pacage
 * @returns {Promise<{ geojson: CartoBioFeatureCollection }>}
 */
export async function pacageLookup (pacage) {
  const { data } = await apiClient.get(`/v2/import/pacage/${pacage}`)

  return data
}

/**
 * @returns {Promise<AgenceBioNormalizedOperatorWithRecord[]>}
 */
export async function fetchLatestOperators () {
  const { data } = await apiClient.get(`/v2/certification/operators/latest`, { timeout: 10000 })

  return data.operators
}

/**
 * Creates a new operator Record
 *
 * @returns {Promise<NormalizedRecord>}
 */
export async function createOperatorRecord (numeroBio, payload) {
  const { data } = await apiClient.post(`/v2/audits/${numeroBio}`, payload)

  return data
}

/**
 * Delete a single feature
 *
 * @return {Promise<NormalizedRecord>}
 */
export async function deleteSingleFeature ({ recordId }, { id, reason }) {
  const { data } = await apiClient.delete(`/v2/audits/${recordId}/parcelles/${id}`, {data: { reason }})

  return data
}

/**
 * Creates or updates a record based on geographical informations
 *
 * @returns {Promise<NormalizedRecord>}
 */
export async function updateFeatureCollectionProperties ({ recordId }, featureCollection) {
  const { data } = await apiClient.patch(`/v2/audits/${recordId}/parcelles`, featureCollection)

  return data
}

/**
 * Update/replace properties of a single feature
 *
 * @returns {Promise<NormalizedRecord>}
 */
export async function updateSingleFeature ({ recordId }, { id, properties, geometry }) {
  const { data } = await apiClient.put(`/v2/audits/${recordId}/parcelles/${id}`, { properties, geometry })

  return data
}

/**
 *
 * @param {{ recordId: string }} identifiers
 * @param {Object} patch
 * @returns {Promise<NormalizedRecord>}
 */
export async function updateAuditState ({ recordId }, patch) {
  const { data } = await apiClient.patch(`/v2/audits/${recordId}`, patch)

  return data
}

/**
 * @param {string} recordId
 * @returns {Promise<>}
 */
export async function deleteRecord (recordId) {
  const { data } = await apiClient.delete(`/v2/audits/${recordId}`)

  return data
}

/**
 * Add a new plot without id to a feature collection
 *
 * @returns {Promise<NormalizedRecord>}
 */
export async function submitNewParcelle ({ recordId }, feature) {
  const { data } = await apiClient.post(`/v2/audits/${recordId}/parcelles`, {
    feature
  })

  return data
}

/**
 * @param {string} userToken
 * @returns {Promise<CartoBioUser>}
 */
export async function verifyToken (userToken) {
  const { data } = await apiClient.get(`/v2/user/verify`, {
    headers: {
      Authorization: `Bearer ${userToken}`
    }
  })

  return data
}

/**
 *
 * @param token
 * @return {Promise<{ operator: AgenceBioNormalizedOperator, token: CartoBioUser}>}
 */
export async function exchangeNotificationToken (token) {
  const { data } = await apiClient.get(`/v2/user/exchangeToken`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return data
}

export function setAuthorization (userToken) {
  if (userToken) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${userToken}`
  }
  else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}

/**
 * Turn a zipped Shapefile into a GeoJSON
 *
 * @param {File} archive
 * @returns {Promise<CartoBioFeatureCollection>}
 */
export async function convertShapefileArchiveToGeoJSON (archive) {
  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await apiClient.post(`/v2/convert/shapefile/geojson`, form)
  return geojson
}

/**
 * Turn a geofolia archive into a GeoJSON
 *
 * @param {File} archive
 * @returns {Promise<CartoBioFeatureCollection>}
 */
export async function convertGeofoliaArchiveToGeoJSON (archive) {
  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await apiClient.post(`/v2/convert/geofolia/geojson`, form)
  return geojson
}
