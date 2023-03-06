import axios from 'axios'
import store from '@/store.js'
import { now } from '@/components/dates.js'

const { VUE_APP_API_ENDPOINT: baseURL } = import.meta.env

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
 * @typedef {Object} StrictRecord
 * @property {string} record_id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Array<AuditHistoryEvent>} audit_history
 * @property {string} audit_notes
 * @property {string} audit_demandes
 */

/**
 * @typedef {Object} ExtendedRecord
 * @property {RecordMetadata} metadata
 * @property {FeatureCollection} parcellaire
 */

/**
 * @typedef {StrictRecord & ExtendedRecord} Record
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

const cartobioApi = axios.create({ baseURL })

/**
 * @param {number} operatorId
 * @returns {Promise<Record>}
 */
export async function getOperatorParcelles (operatorId) {
  const { data } = await cartobioApi.get(`/v2/operator/${operatorId}`)

  return data
}

/**
 * @param {string} input
 * @returns {Promise<Record[]>}
 */
export async function searchOperators (input) {
  const { data } = await cartobioApi.post(`/v2/certification/operators/search`, { input })

  return data
}

/**
 * @param {string} pacage
 * @returns {Promise<FeatureCollection>}
 */
export async function pacageLookup (pacage) {
  const { data } = await cartobioApi.get(`/v2/import/pacage/${pacage}`)

  return data
}

/**
 * @returns {Promise<Record[]>}
 */
export async function fetchLatestOperators () {
  const { data } = await cartobioApi.get(`/v2/certification/operators/latest`)

  return data.operators
}

/**
 * Creates or updates a record based on geographical informations
 *
 * @param {{ geojson: GeoJSON.FeatureCollection, operatorId: number, ocId: number, ocLabel: number, metadata: Object, numeroBio: string }} param0
 * @returns {Promise<Record>}
 */
export async function submitParcellesChanges ({ operatorId, ...params }) {
  const { data } = await cartobioApi.post(`/v2/operator/${operatorId}/parcelles`, { ...params })

  return data
}

/**
 *
 * @param {{ recordId: number }} param0
 * @param {Object} patch
 * @returns {Promise<Record>}
 */
export async function updateAuditState ({ recordId }, patch) {
  const { data } = await cartobioApi.patch(`/v2/certification/audits/${recordId}`, patch)

  return data
}

/**
 *
 * @param {GeoJSON.FeatureCollection} geojson
 * @param {{ source: SourceType}} param1
 * @returns {Promise}
 */
export async function submitParcelles (geojson, { source }) {
  const { id: operatorId, numeroBio, organismeCertificateur } = store.state.currentUser

  const { data } = await cartobioApi.post(`/v2/operator/${operatorId}/parcelles`, {
    ocId: organismeCertificateur?.id,
    ocLabel: organismeCertificateur?.nom,
    numeroBio,
    geojson,
    metadata: {
      source,
      sourceLastUpdate: now()
    }
  })

  store.setParcelles({
    record_id: data.record_id,
    geojson: data.parcelles,
    ...data.metadata
  })
}

/**
 * @param {string} userToken
 * @returns {Promise<DecodedUserToken>}
 */
export async function verifyToken (userToken) {
  const { data } = await cartobioApi.get(`/v2/user/verify`, {
    headers: {
      Authorization: `Bearer ${userToken}`
    }
  })

  return data
}

export async function exchangeNotificationToken (token) {
  const { data } = await cartobioApi.get(`/v2/user/exchangeToken`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return data
}

export function setAuthorization (userToken) {
  if (userToken) {
    cartobioApi.defaults.headers.common['Authorization'] = `Bearer ${userToken}`
  }
  else {
    delete cartobioApi.defaults.headers.common['Authorization']
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

  const { data: geojson } = await cartobioApi.post(`/v1/convert/shapefile/geojson`, form)

  return geojson
}
