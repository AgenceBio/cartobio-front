import { describe, test, expect } from "vitest";
import { countRotationErrors, isCultureNonRotative } from "./culture.js";

describe("test du compteur d'erreur de rotation", () => {
  test("Rotation invalide", () => {
    const salsifis = { cultures: [{ CPF: "01.13.49.5" }] };
    expect(countRotationErrors(0, [salsifis, salsifis])).toEqual(2);
    expect(countRotationErrors(1, [salsifis, salsifis])).toEqual(2);
    expect(countRotationErrors(0, [salsifis, salsifis, salsifis])).toEqual(3);
    expect(countRotationErrors(1, [salsifis, salsifis, salsifis])).toEqual(3);
    expect(countRotationErrors(2, [salsifis, salsifis, salsifis])).toEqual(3);
  });

  test("Mutliculture rotation non verifié", () => {
    const salsifisEtManioc = { cultures: [{ CPF: "01.13.49.5" }, { CPF: "01.13.53" }] };
    const maniocEtTabac = { cultures: [{ CPF: "01.13.53" }, { CPF: "01.15.1" }] };
    expect(countRotationErrors(0, [salsifisEtManioc, maniocEtTabac])).toEqual(0);
    expect(countRotationErrors(1, [salsifisEtManioc, maniocEtTabac])).toEqual(0);
  });

  test("Rotation valide", () => {
    const salsifis = { cultures: [{ CPF: "01.13.49.5" }] };
    const rutabagas = { cultures: [{ CPF: "01.13.49.6" }] };
    expect(countRotationErrors(0, [salsifis, rutabagas])).toEqual(1);
    expect(countRotationErrors(1, [salsifis, rutabagas])).toEqual(1);
    expect(countRotationErrors(0, [salsifis, rutabagas, salsifis])).toEqual(1);
    expect(countRotationErrors(1, [salsifis, rutabagas, salsifis])).toEqual(1);
    expect(countRotationErrors(2, [salsifis, rutabagas, salsifis])).toEqual(1);
  });

  test("Rotation valide culture perenne", () => {
    const vigne = { cultures: [{ CPF: "01.21.11" }] };
    const prunes = { cultures: [{ CPF: "01.24.27" }] };
    const prairePermanente = { cultures: [{ CPF: "01.19.10.12" }] };
    expect(countRotationErrors(0, [vigne, vigne])).toEqual(1);
    expect(countRotationErrors(1, [prunes, prunes])).toEqual(1);
    expect(countRotationErrors(0, [prairePermanente, prairePermanente, prairePermanente])).toEqual(1);
    expect(countRotationErrors(1, [prunes, prunes, prunes])).toEqual(1);
    expect(countRotationErrors(2, [vigne, vigne, vigne])).toEqual(1);
  });

  test("Rotation valide culture perenne et non perennes", () => {
    const salsifis = { cultures: [{ CPF: "01.13.49.5" }] };
    const vigne = { cultures: [{ CPF: "01.21.11" }] };
    const prunes = { cultures: [{ CPF: "01.24.27" }] };
    const prairePermanente = { cultures: [{ CPF: "01.19.10.12" }] };
    expect(countRotationErrors(0, [vigne, salsifis])).toEqual(1);
    expect(countRotationErrors(1, [salsifis, prunes])).toEqual(1);
    expect(countRotationErrors(0, [prairePermanente, salsifis, prairePermanente])).toEqual(1);
    expect(countRotationErrors(1, [prunes, salsifis, prunes])).toEqual(1);
    expect(countRotationErrors(2, [vigne, salsifis, vigne])).toEqual(1);
  });

  test("Rotation valide culture non rotative hors cultures pérennes", () => {
    const luzerne = { cultures: [{ CPF: "01.19.10.8" }] };
    const prairieTemporaire = { cultures: [{ CPF: "01.19.10.11" }] };
    expect(countRotationErrors(0, [luzerne, luzerne, luzerne])).toEqual(1);
    expect(countRotationErrors(1, [prairieTemporaire, prairieTemporaire])).toEqual(1);
  });

  test("Rotation invalide culture perenne et non perennes", () => {
    const salsifis = { cultures: [{ CPF: "01.13.49.5" }] };
    const vigne = { cultures: [{ CPF: "01.21.11" }] };
    const prunes = { cultures: [{ CPF: "01.24.27" }] };
    const prairePermanente = { cultures: [{ CPF: "01.19.10.12" }] };
    expect(countRotationErrors(0, [salsifis, salsifis, prairePermanente])).toEqual(2);
    expect(countRotationErrors(1, [prunes, salsifis, salsifis])).toEqual(2);
    expect(countRotationErrors(2, [vigne, salsifis, salsifis])).toEqual(2);
  });
});

describe("isCultureNonRotative", () => {
  test("Cultures non rotatives", () => {
    expect(isCultureNonRotative("01.21.11")).toBe(true); // Vigne
    expect(isCultureNonRotative("01.24.27")).toBe(true); // Prune
    expect(isCultureNonRotative("01.19.10.12")).toBe(true); // Prairie permanente
    expect(isCultureNonRotative("01.19.10.8")).toBe(true); // Luzerne
  });

  test("Cultures rotatives", () => {
    expect(isCultureNonRotative("01.11.12")).toBe(false); // Blé tendre
    expect(isCultureNonRotative("01.13.49.5")).toBe(false); // Salsifis
    expect(isCultureNonRotative("ACT.Prod.Inc")).toBe(false); // Culture inconnue
  });

  test("Codes inconnus ou absents", () => {
    expect(isCultureNonRotative("999.99")).toBe(false);
    expect(isCultureNonRotative("")).toBe(false);
    expect(isCultureNonRotative(undefined)).toBe(false);
    expect(isCultureNonRotative(null)).toBe(false);
  });
});

describe("countRotationErrors - cas limites", () => {
  test("Historique vide ou absent", () => {
    expect(countRotationErrors(0, null)).toEqual(0);
    expect(countRotationErrors(0, [])).toEqual(0);
  });

  test("Code CPF inconnu traité comme rotatif", () => {
    const inconnu = { cultures: [{ CPF: "999.99" }] };
    expect(countRotationErrors(0, [inconnu, inconnu])).toEqual(2);
  });

  test("Culture inconnue (ACT.Prod.Inc) traitée comme rotative", () => {
    const inconnue = { cultures: [{ CPF: "ACT.Prod.Inc" }] };
    expect(countRotationErrors(0, [inconnue, inconnue, inconnue])).toEqual(3);
  });
});
