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
      geojson: data.parcelles,
      ...data.metadata
    })
  }

  return data.parcelles
}

export async function getOperators () {
  const { id, certificats, token } = store.state.currentUser
  const ocId = certificats[0].organismeCertificateurId || null
  const { data } = await axios.get(`${VUE_APP_API_ENDPOINT}/v2/certification/operators/${ocId}`)

  return data
}

export async function submitParcellesChanges (geojson) {
  const { id, token } = store.state.currentUser

  const { data } = await axios.post(`${VUE_APP_API_ENDPOINT}/v2/operator/${id}/parcelles`, {
    geojson,
    lastUpdate: new Date().toISOString()
  })

  store.setParcelles({
    geojson: data.parcelles,
    ...data.metadata
  })
}

export async function submitParcelles (geojson, { source }) {
  const { id, token } = store.state.currentUser

  const { data } = await axios.post(`${VUE_APP_API_ENDPOINT}/v2/operator/${id}/parcelles`, {
    geojson,
    metadata: {
      source,
      sourceLastUpdate: new Date().toISOString()
    }
  })

  store.setParcelles({
    geojson: data.parcelles,
    ...data.metadata
  })
}

