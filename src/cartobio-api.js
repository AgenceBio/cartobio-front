import { get, post } from 'axios'
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

  const { data } = await get(`${VUE_APP_API_ENDPOINT}/v2/operator/${id}`)

  if (!data || !data.metadata.source) {
    throw new ParcellesNotSetupError()
  }
  else if (data.parcelles.features.length && data.metadata.source) {
    store.setParcelles({
      geojson: data.parcelles,
      source: data.metadata.source,
      sourceLastUpdate: data.metadata.sourceLastUpdate,
    })
  }

  return data.parcelles
}

export async function submitParcellesChanges (geojson) {
  const { id, token } = store.state.currentUser

  const { data } = await post(`${VUE_APP_API_ENDPOINT}/v2/operator/${id}/parcelles`, {
    geojson,
    lastUpdate: new Date().toISOString()
  })

  store.setParcelles({
    geojson: data.parcelles,
    lastUpdate: data.metadata.lastUpdate,
  })
}

export async function submitParcelles (geojson, { source }) {
  const { id, token } = store.state.currentUser

  const { data } = await post(`${VUE_APP_API_ENDPOINT}/v2/operator/${id}/parcelles`, {
    geojson,
    metadata: {
      source,
      sourceLastUpdate: new Date().toISOString()
    }
  })

  store.setParcelles({ geojson: data.parcelles, source })
}

