import axios from 'axios'

import store from '@/store.js'

const { VUE_APP_API_ENDPOINT: baseURL } = import.meta.env

const cartobioApi = axios.create({ baseURL })

class ParcellesNotSetupError extends Error {
  name = 'ParcellesNotSetup'
  message = 'Parcelles have not been setup for this operator.'
}

class ParcellesEmptyError extends Error {
  name = 'ParcellesEmpty'
  message = 'Parcelles are setup, but empty for this operator.'
}

export async function getOperatorParcelles (operatorId, { token } = {}) {
  const { data } = await cartobioApi.get(`/v2/operator/${operatorId}`, token ? {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  } : {})

  return data
}

/**
 * @TODO use session ocId
 * @returns
 */
export async function searchOperators (input, { token }) {
  const { data } = await cartobioApi.post(`/v2/certification/operators/search`, { input }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return data
}

/**
 * @TODO use session ocId
 * @returns
 */
export async function fetchLatestOperators ({ token }) {
  const { data } = await cartobioApi.get(`/v2/certification/operators/latest`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return data.operators
}

export async function submitParcellesChanges ({ geojson, operatorId, numeroBio }) {
  const { token } = store.state.currentUser

  const { data } = await cartobioApi.post(`/v2/operator/${operatorId}/parcelles`, {
    numeroBio,
    geojson,
  })

  store.setParcelles({
    record_id: data.record_id,
    geojson: data.parcelles,
    ...data.metadata
  })
}

export async function updateAuditState ({ recordId }, patch) {
  const { data } = await cartobioApi.patch(`/v2/certification/audits/${recordId}`, patch)

  return data
}

export async function submitParcelles (geojson, { source }) {
  const { id: operatorId, numeroBio, certificats, token } = store.state.currentUser

  const { data } = await cartobioApi.post(`/v2/operator/${operatorId}/parcelles`, {
    ocId: certificats[0]?.organismeCertificateurId,
    ocLabel: certificats[0]?.organisme,
    numeroBio,
    geojson,
    metadata: {
      source,
      sourceLastUpdate: new Date().toISOString()
    }
  })

  store.setParcelles({
    record_id: data.record_id,
    geojson: data.parcelles,
    ...data.metadata
  })
}

export async function verifyToken (userToken) {
  const { data } = await cartobioApi.post(`/v2/user/verify`, {}, {
    headers: {
      Authorization: `Bearer ${userToken}`
    }
  })

  cartobioApi.defaults.headers.common['Authorization'] = `Bearer ${userToken}`

  return data
}

