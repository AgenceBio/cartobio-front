import { defineStore } from 'pinia'
import { computed, ref, watch, watchEffect } from 'vue'
import { setAuthorization } from '@/cartobio-api'

export const ROLES = Object.freeze({
  OC_AUDIT: 'audit',
  OC_CERTIF: 'certif',
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
  const storageName = 'cartobio.v2'
  const token = ref('')
  const user = computed(() => token.value ? parseJwt(token.value) : {})
  const isLogged = computed(() => Boolean(user.value.id))

  const roles = computed(() => {
    const groupName = user.value?.mainGroup?.nom

    if (!isLogged.value) {
      return [ROLES.GUEST]
    }
    else if (groupName === 'Super OC') {
      return [ROLES.OC_CERTIF, ROLES.OC_AUDIT]
    }
    else if (groupName === 'OC CartoBio') {
      return [ROLES.OC_AUDIT]
    }
    else if (groupName === 'OC') {
      return [ROLES.OC_CERTIF]
    }
    else if (groupName === 'Admin') {
      return [ROLES.ADMIN]
    }
    else if (groupName === 'Opérateur' || user.value.numeroBio) {
      return [ROLES.OPERATEUR]
    }
    else {
      return [ROLES.UNKNOWN]
    }
  })

  function isRole (expectedRoleId) {
    return roles.value.includes(expectedRoleId)
  }

  function login (userToken) {
    token.value = userToken
  }

  function logout () {
    token.value = null
  }

  function enablePersistance () {
    token.value = window.localStorage.getItem(storageName) || ''

    watchEffect(function () {
      window.localStorage.setItem(storageName, token.value || '')
    }, { flush: 'sync' })
  }

  watch(token, newToken => setAuthorization(newToken ? newToken : ''))

  return {
    token,
    // getters
    isLogged,
    isRole,
    user,
    roles,
    // methods
    enablePersistance,
    login,
    logout,
  }
})
