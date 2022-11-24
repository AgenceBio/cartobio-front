import axios from 'axios'
import store from './store.js'

const { VUE_APP_API_ENDPOINT } = import.meta.env

class ParcellesNotSetupError extends Error {
  name = 'ParcellesNotSetup'
  message = 'Parcelles have not been setup for this operator.'
}

class ParcellesEmptyError extends Error {
  name = 'ParcellesEmpty'
  message = 'Parcelles are setup, but empty for this operator.'
}

export async function getOperatorParcelles () {
  const { id, token } = store.state.currentUser

  const { data } = await axios.get(`${VUE_APP_API_ENDPOINT}/v2/operator/${id}`)

  if (!data || !data.parcelles || !data.metadata.source) {
    throw new ParcellesNotSetupError()
  }
  else if (data.parcelles.features.length && data.metadata.source) {
    store.setParcelles({
      record_id: data.record_id,
      geojson: data.parcelles,
      ...data.metadata
    })
  }

  return data.parcelles
}

/**
 * @TODO use session ocId
 * @returns
 */
export async function searchOperators (input) {
  const { certificats, token } = store.state.currentUser
  const ocId = certificats[0].organismeCertificateurId || null

  const { data } = await axios.post(`${VUE_APP_API_ENDPOINT}/v2/certification/operators/search`, { ocId, input })

  return data
}

/**
 * @TODO use session ocId
 * @returns
 */
export async function fetchLatestOperators () {
  const { certificats, token } = store.state.currentUser
  const ocId = certificats[0].organismeCertificateurId

  const { data } = await axios.get(`${VUE_APP_API_ENDPOINT}/v2/certification/operators/latest`, { params: { ocId } })

  return data.operators
}

export async function submitParcellesChanges (geojson) {
  const { id: operatorId, numeroBio, token } = store.state.currentUser

  const { data } = await axios.post(`${VUE_APP_API_ENDPOINT}/v2/operator/${operatorId}/parcelles`, {
    numeroBio,
    geojson,
  })

  store.setParcelles({
    record_id: data.record_id,
    geojson: data.parcelles,
    ...data.metadata
  })
}

export async function submitParcelles (geojson, { source }) {
  const { id: operatorId, numeroBio, certificats, token } = store.state.currentUser

  const { data } = await axios.post(`${VUE_APP_API_ENDPOINT}/v2/operator/${operatorId}/parcelles`, {
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

