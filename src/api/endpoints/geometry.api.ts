import { apiClient } from "@/api/client";
import type { AxiosResponse } from "axios";
import type { AddGeometryResponse, BorderCutResponse, GeometryEqualsResponse } from "@agencebio/cartobio-types";

export async function addParcelleVerif(
  geojson: unknown,
  recordId: string,
): Promise<AxiosResponse<AddGeometryResponse>> {
  return apiClient.post<AddGeometryResponse>(`/v2/geometry/${recordId}/add`, { payload: geojson });
}

export async function getRPG(rpgData: unknown): Promise<AxiosResponse> {
  return apiClient.post(`/v2/geometry/rpg`, rpgData);
}

export async function getGeometryEquals(
  oldRecordId: string,
  newRecordId: string,
): Promise<AxiosResponse<GeometryEqualsResponse>> {
  return apiClient.post<GeometryEqualsResponse>(`/v2/geometry/geometryEquals`, {
    payload: { old: oldRecordId, new: newRecordId },
  });
}

export async function getCutBorder(
  geometry: unknown,
  distance: number,
  allBorder: boolean,
  isInverted: boolean,
  startBorderPoint: unknown,
  endBorderPoint: unknown,
): Promise<AxiosResponse<BorderCutResponse>> {
  const payload = {
    geometry,
    distance,
    allBorder,
    isInverted,
    startBorderPoint,
    endBorderPoint,
  };

  return apiClient.post<BorderCutResponse>("/v3/geometry/border-cut", payload);
}
