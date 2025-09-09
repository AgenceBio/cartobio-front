import axios from "axios";

const { VUE_APP_API_ENDPOINT: baseURL } = import.meta.env;

/**
 * @typedef {import('geojson').FeatureCollection} FeatureCollection
 * @typedef {import('@agencebio/cartobio-types').NormalizedRecord} NormalizedRecord
 * @typedef {import('@agencebio/cartobio-types').AgenceBioNormalizedOperator} AgenceBioNormalizedOperator
 * @typedef {import('@agencebio/cartobio-types').AgenceBioNormalizedOperatorWithRecord} AgenceBioNormalizedOperatorWithRecord
 * @typedef {import('@agencebio/cartobio-types').CartoBioUser} CartoBioUser
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeatureCollection} CartoBioFeatureCollection
 */

export const apiClient = axios.create({ baseURL, timeout: 20000 });

/**
 *
 * @returns {Promise<String>}
 */
export async function getVersion() {
  const {
    data: { version: version },
  } = await apiClient.get("/version");
  return version;
}

/**
 *
 * @param {{ evv: String, numeroBio: String }} params
 * @returns {Promise<FeatureCollection>}
 */
export async function getOperatorNcviFeatures({ evv, numeroBio }) {
  const { data } = await apiClient.get(`/v2/import/evv/${evv}+${numeroBio}`);

  return data;
}

/**
 * @param {string} input
 * @returns {Promise<AgenceBioNormalizedOperatorWithRecord[]>}
 */
export async function searchOperators({ input, page, filter, limit = 7 }) {
  const { data } = await apiClient.post(`/v2/certification/search`, { input, page, filter, limit }, { timeout: 60000 });

  return data;
}

/**
 * @param {string} input
 * @returns {Promise<any[]>}
 */
export async function getForAutocomplete(search) {
  const { data } = await apiClient.get(`/v2/certification/autocomplete`, { params: { search } });

  return data;
}

/**
 * @param {number?} limit
 * @param {number?} offset
 * @return {Promise<AgenceBioNormalizedOperator[]>}
 */
export async function getUserOperators(search, limit, offset) {
  const { data } = await apiClient.get(`/v2/operators`, { params: { limit, offset, search } });

  return data;
}

/**
 * @param {number?} limit
 * @param {number?} offset
 * @return {Promise<AgenceBioNormalizedOperator[]>}
 */
export async function getUserOperatorsForDashboard() {
  const { data } = await apiClient.get(`/v2/operators/dashboard`);

  return data;
}

/**
 * @param {number?} limit
 * @param {number?} offset
 * @return {Promise<AgenceBioNormalizedOperator[]>}
 */
export async function getDashboardSummary(departements, anneeReferenceControle) {
  const { data } = await apiClient.post(`/v2/operators/dashboard-summary`, { departements, anneeReferenceControle });

  return data;
}

/**
 * @param {string} pacage
 * @returns {Promise<FeatureCollection>}
 */
export async function pacageLookup(pacage) {
  const { data } = await apiClient.get(`/v2/import/pacage/${pacage}`);

  return data;
}

/**
 * Creates a new operator Record
 *
 * @param {string} numeroBio
 * @param {Partial<NormalizedRecord>} payload
 * @returns {Promise<NormalizedRecord>}
 */
export async function createOperatorRecord(numeroBio, payload) {
  const { data } = await apiClient.post(`/v2/operator/${numeroBio}/records`, payload, { timeout: 600000 });

  return data;
}

/**
 * @param {string} recordId
 * @returns {Promise<void>}
 */
export async function deleteRecord(recordId) {
  await apiClient.delete(`/v2/audits/${recordId}`);
}

/**
 * Pin an operator
 *
 * @param {string} numeroBio
 * @param {Partial<NormalizedRecord>} payload
 * @returns {Promise<NormalizedRecord>}
 */
export async function pinOperator(numeroBio) {
  const { data } = await apiClient.post(`/v2/operator/${numeroBio}/pin`);

  return data;
}

/**
 * Unpin an operator
 *
 * @param {string} numeroBio
 * @param {Partial<NormalizedRecord>} payload
 * @returns {Promise<NormalizedRecord>}
 */
export async function unpinOperator(numeroBio) {
  const { data } = await apiClient.post(`/v2/operator/${numeroBio}/unpin`);

  return data;
}

/**
 * Add a new plot without id to a feature collection
 *
 * @returns {Promise<NormalizedRecord>}
 */
export async function submitNewParcelle({ recordId }, feature) {
  const { data } = await apiClient.post(`/v2/audits/${recordId}/parcelles`, {
    feature,
  });

  return data;
}

/**
 * Add a new plot without id to a feature collection
 *
 * @returns {Promise<NormalizedRecord>}
 */
export async function divideNewParcelle(recordId, featureId, features) {
  const { data } = await apiClient.post(`/v2/audits/${recordId}/parcelles/${featureId}`, {
    features,
  });

  return data;
}

/**
 * @param {string} userToken
 * @returns {Promise<CartoBioUser>}
 */
export async function verifyToken(userToken) {
  const { data } = await apiClient.get(`/v2/user/verify`, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  return data;
}

/**
 *
 * @param token
 * @return {Promise<{ operator: AgenceBioNormalizedOperator, token: CartoBioUser}>}
 */
export async function exchangeNotificationToken(token) {
  const { data } = await apiClient.get(`/v2/user/exchangeToken`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export function setAuthorization(userToken) {
  if (userToken) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

/**
 * Turn a geographical file into a GeoJSON
 *
 * @param {File} archive
 * @returns {Promise<CartoBioFeatureCollection>}
 */
export async function convertGeographicalFileToGeoJSON(archive) {
  const form = new FormData();
  form.append("archive", archive);
  const { data: geojson } = await apiClient.post(`/v2/convert/anygeo/geojson`, form);
  return geojson;
}

/**
 * Turn a zipped Shapefile into a GeoJSON
 *
 * @param {File} archive
 * @returns {Promise<CartoBioFeatureCollection>}
 */
export async function convertTelepacFileToGeoJSON(archive) {
  const form = new FormData();
  form.append("archive", archive);
  const { data: geojson } = await apiClient.post(`/v2/convert/telepac/geojson`, form);
  return geojson;
}

/**
 * Turn a geofolia archive into a GeoJSON
 *
 * @param {File} archive
 * @returns {Promise<CartoBioFeatureCollection>}
 */
export async function convertGeofoliaArchiveToGeoJSON(archive) {
  const form = new FormData();
  form.append("archive", archive);
  const { data: geojson } = await apiClient.post(`/v2/convert/geofolia/geojson`, form);
  return geojson;
}

/**
 * Checks the availability of an immediate download
 *
 * @param {File} archive
 * @returns {Promise<Number>}
 */
export async function checkGeofoliaAccountStatus(numeroBio) {
  const { status } = await apiClient.head(`/v2/import/geofolia/${numeroBio}`);
  return status;
}

/**
 * Retrieves an immediate download
 * It eventually indicates the try again later, because the download is being processed (Retry-After + HTTP 202 Accepted)
 *
 * @param {File} archive
 * @returns {Promise<GeoJSON>}
 */
export async function getOperatorGeofoliaFeatures(numeroBio) {
  const { data: geojson } = await apiClient.get(`/v2/import/geofolia/${numeroBio}`);
  return geojson;
}

/**
 * Retrieves all departements
 *
 * @returns {Promise<{any}>}
 */
export async function getDepartements() {
  const { data: departements } = await apiClient.get(`/v2/departements`);
  return departements;
}

/**
 * Retrieves data for a XLSX export
 *
 * @param {string}
 * @returns {Promise<any>}
 */
export async function getDataXLSX(payload) {
  const data = await apiClient.post("/v2/exportParcellaire", { payload }, { timeout: 600000 });
  return data;
}

/**
 * Retrieves PDF for an export
 *
 * @param {string} numeroBio - Le numéro bio
 * @param {string} record_id - Le record-id de l'exploitation
 * @param {object} signal - Signal de la requete Axios
 * @returns {Promise<string>} -Base64 du fichier pdf
 */
export async function getPDFData(numeroBio, record_id, signal) {
  const data = await apiClient.get(`/v2/pdf/${numeroBio}/${record_id}?${new Date().getTime()}`, {
    timeout: 600000,
    signal,
  });
  return data;
}

export async function hideNotif(numeroBio) {
  await apiClient.patch(`/v2/operator/${numeroBio}/hideNotif`);
}

export async function getHasAttestationProduction(recordId) {
 const { data } = await apiClient.get(`/v2/audits/${recordId}/has-attestation-production`);

 return data
}
