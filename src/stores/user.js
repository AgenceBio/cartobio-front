import { defineStore } from 'pinia'
import { computed, ref, watch, watchEffect } from 'vue'
import { setAuthorization } from '@/cartobio-api'
import { statsPush } from "@/stats.js"

export const ROLES = Object.freeze({
  OC_AUDIT: 'audit',
  OC_CERTIF: 'certif',
  OPERATEUR: 'agri',
  ADMIN: 'admin',
  GUEST: 'guest',
  UNKNOWN: 'unknown'
})

const rolesMap = {
  'Super OC': [ROLES.OC_CERTIF, ROLES.OC_AUDIT],
  'OC CartoBio': [ROLES.OC_AUDIT],
  'OC': [ROLES.OC_CERTIF],
  'Admin': [ROLES.ADMIN]
}

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
    if (!isLogged.value) {
      return [ROLES.GUEST]
    }

    const groupNames = user.value?.groups?.map(group => group.nom) ?? []

    if (groupNames.includes('Opérateur') || user.value.numeroBio) {
      return [ROLES.OPERATEUR]
    }

    if (groupNames.length === 0) {
      return [ROLES.UNKNOWN]
    }

    const roles = new Set()
    groupNames.forEach(groupName => {
        rolesMap[groupName].forEach(role => roles.add(role))
    })

    return Array.from(roles)
  })

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
  watch(user, () => statsPush(['setCustomVariable', 1, "Rôle de l'utilisateur", roles.value.join(', '), 'visit']))

  return {
    token,
    // getters
    isLogged,
    user,
    roles,
    // methods
    enablePersistance,
    login,
    logout,
  }
})
