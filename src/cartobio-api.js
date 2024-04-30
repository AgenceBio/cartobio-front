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

export const apiClient = axios.create({ baseURL, timeout: 10000 })

/**
 *
 * @param {{ evv: String, numeroBio: String }} params
 * @returns {Promise<FeatureCollection>}
 */
export async function getOperatorNcviFeatures ({ evv, numeroBio }) {
  const { data } = await apiClient.get(`/v2/import/evv/${evv}+${numeroBio}`)

  return data
}

/**
 * @param {string} input
 * @returns {Promise<AgenceBioNormalizedOperatorWithRecord[]>}
 */
export async function searchOperators ({ input, page, sort, order }) {
  const { data } = await apiClient.post(`/v2/certification/search`, { input, page, sort, order })

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
 * @returns {Promise<FeatureCollection>}
 */
export async function pacageLookup (pacage) {
  const { data } = await apiClient.get(`/v2/import/pacage/${pacage}`)

  return data
}

/**
 * Creates a new operator Record
 *
 * @returns {Promise<NormalizedRecord>}
 */
export async function createOperatorRecord (numeroBio, payload) {
  const { data } = await apiClient.post(`/v2/operator/${numeroBio}/records`, payload)

  return data
}

/**
 * @param {string} recordId
 * @returns {Promise<void>}
 */
export async function deleteRecord (recordId) {
  await apiClient.delete(`/v2/audits/${recordId}`)
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
export async function convertTelepacFileToGeoJSON (archive) {
  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await apiClient.post(`/v2/convert/telepac/geojson`, form)
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

/**
 * Checks the availability of an immediate download
 *
 * @param {File} archive
 * @returns {Promise<Number>}
 */
export async function checkGeofoliaAccountStatus (numeroBio) {
  const { status } = await apiClient.head(`/v2/import/geofolia/${numeroBio}`)
  return status
}

/**
 * Retrieves an immediate download
 * It eventually indicates the try again later, because the download is being processed (Retry-After + HTTP 202 Accepted)
 *
 * @param {File} archive
 * @returns {Promise<GeoJSON>}
 */
export async function getOperatorGeofoliaFeatures (numeroBio) {
  const { data: geojson } = await apiClient.get(`/v2/import/geofolia/${numeroBio}`)
  return geojson
}
