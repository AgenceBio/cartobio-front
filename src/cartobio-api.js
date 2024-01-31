import axios from 'axios'

const { VUE_APP_API_ENDPOINT: baseURL } = import.meta.env

/**
 * @enum {String}
 * Duplicate of api/cartobio.js#EventType
 */
export const EventType = {
  CERTIFICATION_STATE_CHANGE: 'CertificationStateChange',
  FEATURE_COLLECTION_CREATE: 'FeatureCollectionCreation',
  FEATURE_COLLECTION_DELETE: 'FeatureCollectionDeletion',
  FEATURE_COLLECTION_UPDATE: 'FeatureCollectionUpdate',
  FEATURE_CREATE: 'FeatureCreation',
  FEATURE_DELETE: 'FeatureDeletion',
  FEATURE_UPDATE: 'FeatureUpdate'
}

/**
 * @typedef {import('@types/geojson').FeatureCollection} FeatureCollection
 * @typedef {import('@/referentiels/imports.js').sources} SourceType
 * @typedef {import('@/referentiels/ab.js').CERTIFICATION_STATE} CertificationState
 **/

/**
 * @typedef {Object} CertificationBody
 * @property {number} id
 * @property {string} nom
 */

/**
 * @typedef {Object} Operator
 * @property {number} id
 * @property {string | null} dateEngagement
 * @property {string | null} datePremierEngagement
 * @property {string} nom
 * @property {string} denominationCourante
 * @property {string} numeroBio
 * @property {string | null} numeroPacage
 * @property {string | null} siret
 * @property {string | null} email
 * @property {CertificationBody} organismeCertificateur
 * @property {string} codeCommune
 * @property {string} commune
 * @property {string} departement
 */

/**
 * @typedef {Object} RecordMetadata
 * @property {SourceType} source
 * @property {string} sourceLastUpdate
 */

/**
 * @typedef {Object} AuditHistoryEvent
 * @property {string} date
 * @property {CertificationState} state
 * @property {number=} userId
 * @property {string=} userName
 * @property {number=} userRoleId
 * @property {string=} userRole
 * @property {number=} userOrgId
 * @property {string=} userOrg
 * @property {string=} description
 */

/**
 * @typedef {Object} BaseRecord
 * @property {string} certification_state
 * @property {string} created_at
 * @property {string} numerobio
 * @property {RecordMetadata} metadata
 * @property {string} record_id
 * @property {string} updated_at
 */

/**
 * @typedef {BaseRecord & {operator: Operator}} BaseRecordWithOperator
 */

/**
 * @typedef {Object} CertificationRecord
 * @property {string} record_id
 * @property {Array<AuditHistoryEvent>} audit_history
 * @property {string} audit_notes
 * @property {string} audit_demandes
 */

/**
 * @typedef {Object} GeographicRecord
 * @property {FeatureCollection} parcellaire
 */

/**
 * @typedef {BaseRecordWithOperator & CertificationRecord & GeographicRecord} Record
 */

/**
 * @typedef {Object} UserRole
 * @property {number} id
 * @property {string} nom
 */

/**
 * @typedef {Object} DecodedUserToken
 * @property {number} id
 * @property {string} nom
 * @property {string} prenom
 * @property {number} organismeCertificateurId
 * @property {CertificationBody} organismeCertificateur
 * @property {UserRole} mainGroup
 */

const apiClient = axios.create({ baseURL, timeout: 10000 })

/**
 * @param {number} numeroBio
 * @returns {Promise<Record>}
 */
export async function getOperatorParcelles (numeroBio) {
  const { data } = await apiClient.get(`/v2/operator/${numeroBio}`)

  return data
}

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
 * @returns {Promise<Record[]>}
 */
export async function searchOperators (input) {
  const { data } = await apiClient.post(`/v2/certification/operators/search`, { input })

  return data
}

/**
 * @return {Promise<undefined>}
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
 * @returns {Promise<Record[]>}
 */
export async function fetchLatestOperators () {
  const { data } = await apiClient.get(`/v2/certification/operators/latest`, { timeout: 10000 })

  return data.operators
}

/**
 * Creates a new operator Record
 *
 * @param {{ featureCollection: GeoJSON.FeatureCollection, numeroBio: number }} param0
 * @returns {Promise<Record>}
 */
export async function createOperatorRecord (numeroBio, payload) {
  const { data } = await apiClient.post(`/v2/audits/${numeroBio}`, payload)

  return data
}

export async function deleteSingleFeature ({ recordId }, { id, reason }) {
  const { data } = await apiClient.delete(`/v2/audits/${recordId}/parcelles/${id}`, {data: { reason }})

  return data
}

/**
 * Creates or updates a record based on geographical informations
 *
 * @param {{ recordId: string }} identifiers
 * @param {GeoJSON.FeatureCollection} featureCollection
 * @returns {Promise<Record>}
 */
export async function updateFeatureCollectionProperties ({ recordId }, featureCollection) {
  const { data } = await apiClient.patch(`/v2/audits/${recordId}/parcelles`, featureCollection)

  return data
}

/**
 * Update/replace properties of a single feature
 *
 * @param {{ recordId: string }} identifiers
 * @param {GeoJSON.Feature} feature
 * @returns {Promise<Record>}
 */
export async function updateSingleFeature ({ recordId }, { id, properties, geometry }) {
  const { data } = await apiClient.put(`/v2/audits/${recordId}/parcelles/${id}`, { properties, geometry })

  return data
}

/**
 *
 * @param {{ recordId: string }} identifiers
 * @param {Object} patch
 * @returns {Promise<Record>}
 */
export async function updateAuditState ({ recordId }, patch) {
  const { data } = await apiClient.patch(`/v2/audits/${recordId}`, patch)

  return data
}

/**
 * @param {string} recordId
 * @returns {Promise<Record>}
 */
export async function deleteRecord (recordId) {
  const { data } = await apiClient.delete(`/v2/audits/${recordId}`)

  return data
}

/**
 * Add a new plot without id to a feature collection
 *
 * @param {{ recordId: String }} identifiers
 * @param {feature: GeoJSON.Feature} feature
 * @returns {Promise<Record>}
 */
export async function submitNewParcelle ({ recordId }, feature) {
  const { data } = await apiClient.post(`/v2/audits/${recordId}/parcelles`, {
    feature
  })

  return data
}

/**
 * @param {string} userToken
 * @returns {Promise<DecodedUserToken>}
 */
export async function verifyToken (userToken) {
  const { data } = await apiClient.get(`/v2/user/verify`, {
    headers: {
      Authorization: `Bearer ${userToken}`
    }
  })

  return data
}

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
 * @returns {GeoJSON}
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
 * @returns {GeoJSON}
 */
export async function convertGeofoliaArchiveToGeoJSON (archive) {
  const form = new FormData()
  form.append('archive', archive)
  const { data: geojson } = await apiClient.post(`/v2/convert/geofolia/geojson`, form)
  return geojson
}
