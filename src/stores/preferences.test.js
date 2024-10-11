import { afterEach, describe, it, expect, vi } from "vitest";
import { usePreferences } from "./preferences.js";
import { createTestingPinia } from "@pinia/testing";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const preferences = usePreferences(pinia);

describe("preferences/map", () => {
  afterEach(() => preferences.$reset());

  it("should provide sensible defaults", () => {
    expect(preferences.map).toEqual({
      background: "plan",
      cadastre: false,
      rpg: false,
    });
  });

  // for some reasons, vueuse does not seem to detect localStorage
  it.skip("should store updated values in localStorage", () => {
    preferences.map.background = "satellite";

    expect(localStorage.setItem).toHaveBeenCalledWith("cartobio/preferences/map", {
      background: "satellite",
      cadastre: false,
      rpg: false,
    });
  });

  it("should reset the values", () => {
    preferences.map.background = "satellite";

    preferences.$reset();

    expect(preferences).toHaveProperty("map.background", "plan");
  });
});
