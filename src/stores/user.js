import { defineStore } from 'pinia'
import * as Sentry from '@sentry/vue'
import { computed, ref, watch, watchEffect } from 'vue'
import { setAuthorization } from '@/cartobio-api'
import { CUSTOM_DIMENSION_ROLE, setCustomDimension } from "@/stats.js"


/**
 * @typedef {import('@agencebio/cartobio-types').CartoBioUser} CartoBioUser
 */

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
  // Legacy
  'OC CartoBio': [ROLES.OC_AUDIT],
  // Depuis 09/2023
  'Auditeur': [ROLES.OC_AUDIT],
  // Legacy
  'OC': [ROLES.OC_CERTIF],
  // Depuis 09/2023
  'Chargé de certification': [ROLES.OC_CERTIF],
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

export function deriveRolesFromGroups (user) {
  if (Boolean(user.id) === false) {
    return [ROLES.GUEST]
  }

  const groupNames = (user.groups ?? [user.mainGroup])
    .filter(group => group)
    .map(group => group.nom)

  if (groupNames.includes('Opérateur') || user.numeroBio) {
    return [ROLES.OPERATEUR]
  }

  const roles = new Set()
  groupNames.forEach(groupName => {
    if (groupName in rolesMap) {
      rolesMap[groupName].forEach(role => roles.add(role))
    }
  })

  if (roles.size === 0) {
    return [ROLES.UNKNOWN]
  }

  return Array.from(roles)
}

export const useUserStore = defineStore('user', () => {
  const storageName = 'cartobio.v2'
  const token = ref('')
  /**
   * @type {ComputedRef<CartoBioUser|{}>}
   */
  const user = computed(() => token.value ? parseJwt(token.value) : {})
  const isLogged = computed(() => Boolean(user.value.id))

  const roles = computed(() => deriveRolesFromGroups(user.value))

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

  function $reset () {
    logout()
  }

  watch(token, newToken => setAuthorization(newToken ? newToken : ''))
  watch(user, () => {
    setCustomDimension(CUSTOM_DIMENSION_ROLE, roles.value.join(', '))

    if (user.value) {
      Sentry.setUser({ id: user.value.id })
    } else {
      Sentry.setUser(null);
    }
  })

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
    $reset
  }
})
