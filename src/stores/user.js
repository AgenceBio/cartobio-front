import { defineStore } from "pinia";
import * as Sentry from "@sentry/vue";
import { computed, ref, watch } from "vue";
import { setAuthorization, setTokenRefresher } from "@/api/client";
import { logoutApi, refreshApi, verifyToken } from "@/api/endpoints/auth.api";
import { CUSTOM_DIMENSION_ROLE, setCustomDimension } from "@/stats.js";

/**
 * @typedef {import('@agencebio/cartobio-types').CartoBioUser} CartoBioUser
 */

export const ROLES = Object.freeze({
  OC_AUDIT: "audit",
  OC_CERTIF: "certif",
  OPERATEUR: "agri",
  ADMIN: "admin",
  GUEST: "guest",
  UNKNOWN: "unknown",
});

export const API_DASHBOARD_OC_IDS = new Set([1, 2, 3, 7]);

export function deriveRoles(user) {
  if (Boolean(user.id) === false) {
    return [ROLES.GUEST];
  }

  return user.roles?.length ? user.roles : [ROLES.UNKNOWN];
}

export const useUserStore = defineStore("user", () => {
  const storageName = "cartobio.user";
  const token = ref("");
  /**
   * @type {Ref<CartoBioUser|{}>}
   */
  const user = ref({});
  const roles = computed(() => deriveRoles(user.value));
  let refreshing = null;
  const isLogged = computed(() => Boolean(user.value.id));
  const isAdmin = computed(() => roles.value.includes(ROLES.ADMIN));
  const isUnknown = computed(() => roles.value.includes(ROLES.UNKNOWN));
  const isOcAudit = computed(() => roles.value.includes(ROLES.OC_AUDIT));
  const isOcCertif = computed(() => roles.value.includes(ROLES.OC_CERTIF));
  const isOc = computed(() => isOcAudit.value || isOcCertif.value);
  const isAgri = computed(() => roles.value.includes(ROLES.OPERATEUR));
  const canAccessApiDashboard = computed(
    () => !isAdmin.value && isOc.value && API_DASHBOARD_OC_IDS.has(Number(user.value.organismeCertificateur?.id)),
  );

  const startPage = computed(() => {
    if (isOc.value) {
      return "/certification/tableau-de-bord";
    } else if (isAgri.value) {
      return "/exploitations/liste";
    }

    return "/";
  });

  const accueilPage = computed(() => {
    if (isAdmin.value) {
      return "/certification/exploitations";
    } else if (isOc.value) {
      return "/certification/tableau-de-bord";
    } else if (isAgri.value) {
      return "/exploitations";
    }

    return "/";
  });

  const exploitationPage = computed(() => {
    if (isOc.value) {
      return "/certification/exploitations";
    } else if (isAgri.value) {
      return "/exploitations/liste";
    }

    return "/";
  });

  const libelleExploitationPage = computed(() => {
    if (isOc.value) {
      return "Liste des exploitations";
    } else if (isAgri.value) {
      return "Mes exploitations";
    }

    return "";
  });

  const documentationPage = computed(() => {
    if (isOc.value) return "https://docs-cartobio.agencebio.org/organisme-certification";
    else if (isAgri.value) return "https://docs-cartobio.agencebio.org/agriculteurs.trices";

    return "https://docs-cartobio.agencebio.org/cartobio-aide/";
  });

  function login(profile, accessToken) {
    token.value = accessToken;
    user.value = profile;
  }

  function refresh() {
    refreshing ??= refreshApi()
      .then(async ({ token: accessToken }) => {
        const profile = await verifyToken(accessToken);
        login(profile, accessToken);
        return accessToken;
      })
      .catch(() => null)
      .finally(() => (refreshing = null));

    return refreshing;
  }

  async function logout() {
    try {
      return await logoutApi();
    } finally {
      token.value = "";
      user.value = {};
    }
  }

  function enablePersistance() {
    window.localStorage.removeItem("cartobio.v3");
    try {
      user.value = JSON.parse(window.localStorage.getItem(storageName) || "{}");
    } catch {
      user.value = {};
    }

    watch(user, (value) => window.localStorage.setItem(storageName, JSON.stringify(value || {})), {
      flush: "sync",
      deep: true,
    });
  }

  function saveDepartements(departements) {
    window.localStorage.setItem("departements-tableau-de-bord", departements || []);
  }

  function getDepartements() {
    const dep = window.localStorage.getItem("departements-tableau-de-bord") || "";

    if (!dep.length) {
      return [];
    }

    return dep.split(",");
  }

  function $reset() {
    logout();
  }

  watch(token, (newToken) => setAuthorization(newToken ? newToken : ""), { flush: "sync" });
  setTokenRefresher(refresh);
  watch(user, () => {
    setCustomDimension(CUSTOM_DIMENSION_ROLE, roles.value.join(", "));

    if (user.value) {
      Sentry.setUser({ id: user.value.id });
    } else {
      Sentry.setUser(null);
    }
  });

  return {
    token,
    // getters
    isAgri,
    isLogged,
    isAdmin,
    isOc,
    isOcAudit,
    isOcCertif,
    canAccessApiDashboard,
    isUnknown,
    roles,
    startPage,
    accueilPage,
    exploitationPage,
    libelleExploitationPage,
    documentationPage,
    user,
    // methods
    enablePersistance,
    login,
    refresh,
    logout,
    $reset,
    saveDepartements,
    getDepartements,
  };
});
