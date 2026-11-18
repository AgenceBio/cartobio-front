import { apiClient } from "@/api/client";
import type { VersionResponse } from "@agencebio/cartobio-types";

export async function getVersion(): Promise<string> {
  const {
    data: { version },
  } = await apiClient.get<VersionResponse>("/version");
  return version;
}
