import { get, post } from 'axios'
import store from './store.js'

const { VUE_APP_API_ENDPOINT } = import.meta.env

export async function getOperatorParcelles () {
  const { id, token } = store.state.currentUser

  const { data } = await get(`${VUE_APP_API_ENDPOINT}/v2/operator/${id}`)

  if (data) {
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

