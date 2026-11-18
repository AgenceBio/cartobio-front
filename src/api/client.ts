import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const { VUE_APP_API_ENDPOINT: baseURL } = import.meta.env;

export const apiClient = axios.create({ baseURL, timeout: 20000 });

const EXPIRED_CODES = ["EXPIRED_CREDENTIALS", "INVALID_CREDENTIALS"];

let refreshToken: (() => Promise<string | null>) | null = null;

export function setAuthorization(userToken?: string | null) {
  if (userToken) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

export function setTokenRefresher(refresher: () => Promise<string | null>) {
  refreshToken = refresher;
}

apiClient.interceptors.response.use(undefined, async (error: AxiosError<{ code?: string }>) => {
  const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  if (
    !refreshToken ||
    !config ||
    config._retried ||
    config.url?.startsWith("/auth-provider/") ||
    !EXPIRED_CODES.includes(error.response?.data?.code ?? "")
  ) {
    throw error;
  }

  const token = await refreshToken();
  if (!token) throw error;

  config._retried = true;
  config.headers.Authorization = `Bearer ${token}`;
  return apiClient(config);
});
