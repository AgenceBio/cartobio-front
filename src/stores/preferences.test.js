import { afterEach, describe, it, expect, vi } from "vitest";
import { usePreferences } from "./preferences.js";
import { createTestingPinia } from "@pinia/testing";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const preferences = usePreferences(pinia);

describe("map preferences", () => {
  afterEach(() => preferences.$reset());

  it("should provide sensible defaults", () => {
    expect(preferences.layers).toEqual({
      background: "plan",
      cadastre: false,
      rpg: false,
    });
    expect(preferences.params).toEqual({
      currentMode: "consult",
      blockPlan: false,
      hasUndo: false,
    });
  });

  // for some reasons, vueuse does not seem to detect localStorage
  it.skip("should store updated values in localStorage", () => {
    preferences.map.background = "satellite";
    preferences.map.cadastre = true;
    preferences.map.rpg = true;

    expect(localStorage.setItem).toHaveBeenCalledWith("cartobio/preferences/map", {
      background: "satellite",
      cadastre: true,
      rpg: true,
    });
  });

  it("should reset the values", () => {
    preferences.layers.background = "satellite";
    preferences.layers.cadastre = true;
    preferences.layers.rpg = true;
    preferences.params.currentMode = "draw";
    preferences.params.blockPlan = true;
    preferences.params.hasUndo = true;

    preferences.$reset();

    expect(preferences).toHaveProperty("layers.background", "plan");
    expect(preferences).toHaveProperty("layers.cadastre", false);
    expect(preferences).toHaveProperty("layers.rpg", false);
    expect(preferences).toHaveProperty("params.currentMode", "consult");
    expect(preferences).toHaveProperty("params.blockPlan", false);
    expect(preferences).toHaveProperty("params.hasUndo", false);
  });
});
