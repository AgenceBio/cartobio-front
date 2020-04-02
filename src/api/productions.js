import { get } from 'axios'

const { VUE_APP_NOTIFICATIONS_ENDPOINT: endpoint } = process.env;

export function getAllProductions(token) {
  return get(`${endpoint}/portail/productions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(({ data }) => data)
}


export function getGroupsProduction(token) {
  return get(`${endpoint}/portail/productions/groupesProductions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(({ data }) => data)
}



export function getProductionsFromGroup(groupId, token ) {
  return get(`${endpoint}/portail/productions/filterParGroupe/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(({ data }) => data)
}


export function getProductionFromId( productionId, token ) {
  return get(`${endpoint}/portail/productions/${productionId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(({ data }) => data)
}
