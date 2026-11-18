import { apiClient } from "@/api/client";
import type { AxiosResponse } from "axios";
import type { ExportParcellaireResponse, ExportPdfResponse } from "@agencebio/cartobio-types";

export async function getDataXLSX(payload: unknown): Promise<AxiosResponse<ExportParcellaireResponse>> {
  return apiClient.post<ExportParcellaireResponse>("/v2/exportParcellaire", { payload }, { timeout: 600000 });
}

export async function getPDFData(
  numeroBio: string,
  record_id: string,
  type: string,
  force = false,
  signal: AbortSignal | null = null,
): Promise<AxiosResponse<ExportPdfResponse>> {
  return apiClient.get<ExportPdfResponse>(
    `/v2/pdf/${numeroBio}/${record_id}?${new Date().getTime()}&force_refresh=${force}&pac=${type === "pac"}&zip=${type === "zip"}`,
    {
      timeout: 600000,
      signal: signal as AbortSignal | undefined, // null accepté par axios au runtime
    },
  );
}
