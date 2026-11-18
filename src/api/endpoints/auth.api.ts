import { apiClient } from "@/api/client";
import type { AxiosResponse } from "axios";
import type { ExchangeTokenResponse, LogoutResponse, RefreshResponse, VerifyResponse } from "@agencebio/cartobio-types";

const sessionRequest = { withCredentials: true, headers: { "X-Requested-With": "XMLHttpRequest" } };

export async function verifyToken(userToken: string): Promise<VerifyResponse> {
  const { data } = await apiClient.get<VerifyResponse>(`/v2/user/verify`, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  return data;
}

export async function exchangeNotificationToken(token: string): Promise<ExchangeTokenResponse> {
  const { data } = await apiClient.get<ExchangeTokenResponse>(`/v2/user/exchangeToken`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function refreshApi(): Promise<RefreshResponse> {
  const { data } = await apiClient.post<RefreshResponse>(`/auth-provider/refresh`, null, sessionRequest);

  return data;
}

export async function logoutApi(): Promise<AxiosResponse<LogoutResponse>> {
  return apiClient.post<LogoutResponse>(`/auth-provider/logout`, null, sessionRequest);
}
