import { describe, test, expect, vi } from "vitest";

import { deriveFromFilename, isValid, resolveCampagneFromDate, useTélépac } from "./pac.js";

describe("deriveFromFilename", () => {
  test("valid filename", () => {
    expect(deriveFromFilename("Dossier-PAC-2020_dossier_999100540_20201216111411.xml")).toEqual({
      pacage: "999100540",
      campagne: "2020",
    });
    expect(deriveFromFilename("Dossier-PAC-2020_parcelle-2020_082020054_20201113091213.zip")).toEqual({
      pacage: "082020054",
      campagne: "2020",
    });
  });

  test("invalid filename", () => {
    expect(deriveFromFilename("Client95_Parcelles et Interventions (ZIP)_20211217153622.zip")).toEqual({
      pacage: null,
      campagne: null,
    });
  });
});

describe("isValid", () => {
  test("valid pacage numbers", () => {
    expect(isValid("12345678")).toBe(true);
    expect(isValid("001234567")).toBe(true);
    expect(isValid("976345678")).toBe(true);
  });

  test("should fail with invalid numbers", () => {
    expect(isValid(null)).toBe(false);
    expect(isValid(undefined)).toBe(false);
    expect(isValid("")).toBe(false);
    expect(isValid("123456789")).toBe(false);
    expect(isValid("00000000")).toBe(false);
    expect(isValid("000000000")).toBe(false);
    expect(isValid("000000001")).toBe(false);
    expect(isValid("000000012")).toBe(false);
    expect(isValid("000000123")).toBe(false);
    expect(isValid("000001234")).toBe(false);
    expect(isValid("000012345")).toBe(false);
    expect(isValid("000123456")).toBe(false);
    expect(isValid("966345678")).toBe(false);
  });
});

describe("resolveCampagneFromDate", () => {
  test("it is the current year", () => {
    expect(resolveCampagneFromDate(new Date("2023-04-14"))).toBe(2023);
    expect(resolveCampagneFromDate(new Date("2023-04-15"))).toBe(2023);
  });

  test("it is the previous year", () => {
    expect(resolveCampagneFromDate(new Date("2023-04-01"))).toBe(2022);
  });
});

describe("useTélépac", () => {
  const t = useTélépac(new Date("2022-05-15"));

  test("compute URLs", () => {
    expect(t.urls).toEqual({
      home: "https://www.telepac.agriculture.gouv.fr/telepac/tas22/auth/accueilTas.action?campagne=22&titreApplication=Dossier+PAC+22",
      exportHome: "https://www.telepac.agriculture.gouv.fr/telepac/tas22/ie/exportShpIlots.action",
      exportShapefile:
        "https://www.telepac.agriculture.gouv.fr/telepac/tas22/ie/exportShpFichierParcelles.action?anneeCampagne=22",
      exportXml: "https://www.telepac.agriculture.gouv.fr/telepac/tas22/ie/exportDossierCourant.action",
    });
  });

  test("compute a sample PACAGE filename", () => {
    expect(t.pacageFilename("999100540").value).toEqual("Dossier-PAC-2022_parcelle-2022_999100540_20220131155301.zip");
    expect(t.pacageFilename().value).toEqual("Dossier-PAC-2022_parcelle-2022_123456789_20220131155301.zip");
  });

  // does not work because the module is loaded prior to the stub being set
  test.skip("without PRELOADED_CAMPAGNE_PAC being set", () => {
    vi.stubEnv("VUE_APP_PRELOADED_CAMPAGNE_PAC", undefined);
    const t = useTélépac();

    expect(t.preloadedCampagne.value).toEqual(NaN);
  });

  test.skip("with PRELOADED_CAMPAGNE_PAC being set", () => {
    // vi.stubEnv('VUE_APP_PRELOADED_CAMPAGNE_PAC', '2021')
    const t = useTélépac();

    expect(t.preloadedCampagne.value).toEqual(2021);
  });
});
