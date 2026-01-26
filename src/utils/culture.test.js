import { describe, test, expect } from "vitest";
import { countRotationErrors } from "./culture.js";

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
