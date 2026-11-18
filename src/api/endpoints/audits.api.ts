import { apiClient } from "@/api/client";
import type { AxiosRequestConfig } from "axios";
import type { FeatureCollection } from "geojson";
import type {
  AttestationProductionResponse,
  CreateRecordBody,
  FeatureControlResponse,
  NormalizedRecord,
} from "@agencebio/cartobio-types";

/**
 * Crée un parcellaire pour l'opérateur
 */
export async function createOperatorRecord(
  numeroBio: string,
  payload: Partial<CreateRecordBody>,
): Promise<NormalizedRecord> {
  const { data } = await apiClient.post<NormalizedRecord>(`/v2/operator/${numeroBio}/records`, payload, {
    timeout: 600000,
  });

  return data;
}

export async function fetchRecord(recordId: string): Promise<NormalizedRecord> {
  const { data } = await apiClient.get<NormalizedRecord>(`/v2/audits/${recordId}`);
  return data;
}

export async function updateRecordInfo(
  recordId: string,
  payload: unknown,
  config?: AxiosRequestConfig,
): Promise<NormalizedRecord> {
  const { data } = await apiClient.patch<NormalizedRecord>(`/v2/audits/${recordId}`, payload, config);
  return data;
}

export async function deleteRecord(recordId: string): Promise<void> {
  await apiClient.delete(`/v2/audits/${recordId}`);
}

export async function fetchRecordParcelles(recordId: string): Promise<FeatureCollection> {
  const { data } = await apiClient.get<FeatureCollection>(`/v2/audits/${recordId}/parcelles`);
  return data;
}

export async function tagParcelleControlee(recordId: string, id: string | number): Promise<FeatureControlResponse> {
  const { data } = await apiClient.post<FeatureControlResponse>(`/v2/audits/${recordId}/${id}/controlee`);

  return data;
}

export async function tagParcelleNonControlee(recordId: string, id: string | number): Promise<FeatureControlResponse> {
  const { data } = await apiClient.post<FeatureControlResponse>(`/v2/audits/${recordId}/${id}/non-controlee`);

  return data;
}

export async function submitNewParcelle(recordId: string, feature: unknown): Promise<NormalizedRecord> {
  const { data } = await apiClient.post<NormalizedRecord>(`/v2/audits/${recordId}/parcelles`, {
    feature,
  });

  return data;
}

export async function updateFeature(
  recordId: string,
  feature: unknown,
  featureId: string | number,
  config?: AxiosRequestConfig,
): Promise<NormalizedRecord> {
  const { data } = await apiClient.patch<NormalizedRecord>(
    `/v2/audits/${recordId}/parcelles/${featureId}`,
    feature,
    config,
  );

  return data;
}

export async function updateFeatures(recordId: string, features: unknown): Promise<NormalizedRecord> {
  const { data } = await apiClient.patch<NormalizedRecord>(`/v2/audits/${recordId}/parcelles`, { features });

  return data;
}

export async function updateFeatureCollection(
  recordId: string,
  featureCollection: unknown,
  config?: AxiosRequestConfig,
): Promise<NormalizedRecord> {
  const { data } = await apiClient.patch<NormalizedRecord>(
    `/v2/audits/${recordId}/parcelles`,
    featureCollection,
    config,
  );

  return data;
}

export async function createFeaturesFromOther(
  recordId: string,
  features: unknown[],
  from: unknown,
): Promise<NormalizedRecord> {
  const { data } = await apiClient.put<NormalizedRecord>(`/v2/audits/${recordId}/parcelles`, {
    features,
    from,
  });

  return data;
}

export async function deleteParcelle(
  recordId: string,
  featureId: string | number,
  reason: unknown,
  config?: AxiosRequestConfig,
): Promise<NormalizedRecord> {
  const { data } = await apiClient.delete<NormalizedRecord>(`/v2/audits/${recordId}/parcelles/${featureId}`, {
    data: reason,
    ...config,
  });

  return data;
}

export async function getHasAttestationProduction(
  recordId: string,
  type: string,
): Promise<AttestationProductionResponse> {
  const { data } = await apiClient.get<AttestationProductionResponse>(
    `/v2/audits/${recordId}/has-attestation-production?pac=${type === "pac" || type === "zip"}`,
  );

  return data;
}
