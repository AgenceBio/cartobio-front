import { apiClient } from "@/api/client";
import type {
  AgenceBioNormalizedOperator,
  CertificationSearchBody,
  DashboardSummaryResponse,
  OperatorAutocompleteResponse,
  OperatorImportPacResponse,
  OperatorRecordsResponse,
  OperatorSearchResponse,
  OperatorsDashboardResponse,
  PinResponse,
  UserOperatorsResponse,
} from "@agencebio/cartobio-types";

export async function searchOperators({
  input,
  page,
  filter,
  limit = 7,
}: Partial<CertificationSearchBody>): Promise<OperatorSearchResponse> {
  const { data } = await apiClient.post<OperatorSearchResponse>(
    `/v2/certification/search`,
    { input, page, filter, limit },
    { timeout: 60000 },
  );

  return data;
}

export async function searchOperatorsAdmin({
  input,
  page,
  filter,
  limit = 7,
}: Partial<CertificationSearchBody>): Promise<OperatorSearchResponse> {
  const { data } = await apiClient.post<OperatorSearchResponse>(
    `/v2/certification/adminsearch`,
    { input, page, filter, limit },
    { timeout: 60000 },
  );
  return data;
}

export async function getForAutocomplete(search: string): Promise<OperatorAutocompleteResponse> {
  const { data } = await apiClient.get<OperatorAutocompleteResponse>(`/v2/certification/autocomplete`, {
    params: { search },
  });

  return data;
}

export async function getUserOperators(
  search?: string,
  limit?: number,
  offset?: number,
): Promise<UserOperatorsResponse> {
  const { data } = await apiClient.get<UserOperatorsResponse>(`/v2/operators`, { params: { limit, offset, search } });

  return data;
}

export async function getUserOperatorsForDashboard(): Promise<OperatorsDashboardResponse> {
  const { data } = await apiClient.get<OperatorsDashboardResponse>(`/v2/operators/dashboard`);

  return data;
}

export async function getDashboardSummary(
  departements: string[],
  anneeReferenceControle: number,
): Promise<DashboardSummaryResponse> {
  const { data } = await apiClient.post<DashboardSummaryResponse>(
    `/v2/operators/dashboard-summary`,
    { departements, anneeReferenceControle },
    { timeout: 60000 },
  );

  return data;
}

export async function fetchOperator(numeroBio: string): Promise<AgenceBioNormalizedOperator> {
  const { data } = await apiClient.get<AgenceBioNormalizedOperator>(`/v2/operator/${numeroBio}`);
  return data;
}

export async function fetchOperatorRecords(numeroBio: string): Promise<OperatorRecordsResponse> {
  const { data } = await apiClient.get<OperatorRecordsResponse>(`/v2/operator/${numeroBio}/records`);
  return data;
}

export async function fetchOperatorImportData(numeroBio: string): Promise<OperatorImportPacResponse> {
  const { data } = await apiClient.get<OperatorImportPacResponse>(`/v2/operator/${numeroBio}/importData`);
  return data;
}

export function markOperatorAsConsulted(numeroBio: string) {
  return apiClient.post(`/v2/operator/${numeroBio}/consulte`);
}

export async function pinOperator(numeroBio: string): Promise<PinResponse> {
  const { data } = await apiClient.post<PinResponse>(`/v2/operator/${numeroBio}/pin`);

  return data;
}

export async function unpinOperator(numeroBio: string): Promise<PinResponse> {
  const { data } = await apiClient.post<PinResponse>(`/v2/operator/${numeroBio}/unpin`);

  return data;
}

export async function hideNotif(numeroBio: string): Promise<void> {
  await apiClient.patch(`/v2/operator/${numeroBio}/hideNotif`);
}
