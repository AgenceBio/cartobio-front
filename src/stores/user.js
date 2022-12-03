import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export const ROLES = Object.freeze({
  OC: 'oc',
  OPERATEUR: 'agri',
  ADMIN: 'admin',
  GUEST: 'guest',
  UNKNOWN: 'unknown'
})

export function parseJwt (token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""));

  return JSON.parse(jsonPayload);
}

export const useUserStore = defineStore('user', () => {
  const token = useLocalStorage('cartobioUserToken', '')
  const user = computed(() => token.value ? parseJwt(token.value) : {})
  const isLogged = computed(() => Boolean(user.value.id))

  const role = computed(() => {
    const groupName = user.value?.mainGroup?.nom

    if (!isLogged.value) {
      return ROLES.GUEST
    }
    else if (['Super OC', 'OC CartoBio', 'OC'].includes(groupName)) {
      return ROLES.OC
    }
    else if (groupName === 'Admin') {
      return ROLES.ADMIN
    }
    else if (groupName === 'Opérateur') {
      return ROLES.OPERATEUR
    }
    else {
      return ROLES.UNKNOWN
    }
  })


  function login (userToken) {
    token.value = userToken
  }

  function logout () {
    token.value = null
  }

  return {
    token,
    // getters
    isLogged,
    user,
    role,
    // methods
    login,
    logout,
  }
})