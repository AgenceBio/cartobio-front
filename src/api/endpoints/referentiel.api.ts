import { apiClient } from "@/api/client";
import type { DepartementsResponse } from "@agencebio/cartobio-types";

export async function getDepartements(): Promise<DepartementsResponse> {
  const { data } = await apiClient.get<DepartementsResponse>(`/v2/departements`);
  return data;
}
