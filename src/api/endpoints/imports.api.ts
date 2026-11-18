import { apiClient } from "@/api/client";
import type { FeatureCollection } from "geojson";
import type { ImportedFeatureCollection } from "@agencebio/cartobio-types";

async function convertArchive(path: string, archive: File): Promise<ImportedFeatureCollection> {
  const form = new FormData();
  form.append("archive", archive);
  const { data: geojson } = await apiClient.post<ImportedFeatureCollection>(path, form);
  return geojson;
}

export async function getOperatorNcviFeatures({
  evv,
  numeroBio,
}: {
  evv: string;
  numeroBio: string;
}): Promise<ImportedFeatureCollection> {
  const { data } = await apiClient.get<ImportedFeatureCollection>(`/v2/import/evv/${evv}+${numeroBio}`);

  return data;
}

export async function pacageLookup(pacage: string): Promise<FeatureCollection> {
  const { data } = await apiClient.get<FeatureCollection>(`/v2/import/pacage/${pacage}`);

  return data;
}

export function convertGeographicalFileToGeoJSON(archive: File): Promise<ImportedFeatureCollection> {
  return convertArchive(`/v2/convert/anygeo/geojson`, archive);
}

export function convertTelepacFileToGeoJSON(archive: File): Promise<ImportedFeatureCollection> {
  return convertArchive(`/v2/convert/telepac/geojson`, archive);
}

export function convertGeofoliaArchiveToGeoJSON(archive: File): Promise<ImportedFeatureCollection> {
  return convertArchive(`/v2/convert/geofolia/geojson`, archive);
}

export async function checkGeofoliaAccountStatus(numeroBio: string): Promise<number> {
  const { status } = await apiClient.head(`/v2/import/geofolia/${numeroBio}`);
  return status;
}

export async function getOperatorGeofoliaFeatures(numeroBio: string): Promise<ImportedFeatureCollection> {
  const { data: geojson } = await apiClient.get<ImportedFeatureCollection>(`/v2/import/geofolia/${numeroBio}`);
  return geojson;
}
