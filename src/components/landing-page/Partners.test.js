import { describe, expect, test } from "vitest";
import { mount } from "@vue/test-utils";

import Partners from "./Partners.vue";

describe("Partners", () => {
  test("displays only the headline", () => {
    const wrapper = mount(Partners, {
      props: {},
      slots: {
        headline: "Okay",
      },
    });

    expect(wrapper.find("h2").text()).toBe("Okay");
    expect(wrapper.findAll(".fr-grid-row.sections > *")).toHaveLength(0);
  });

  test("displays full width sponsors", () => {
    const wrapper = mount(Partners, {
      props: { sponsors: true },
    });

    expect(wrapper.findAll(".fr-grid-row.sections > *")).toHaveLength(1);
    expect(wrapper.find(".fr-grid-row.sections > div").classes()).toEqual(["fr-col-12"]);
    expect(wrapper.find(".fr-grid-row.sections .logos--sponsors").exists()).toEqual(true);
  });

  test("displays full width certification bodies", () => {
    const wrapper = mount(Partners, {
      props: { certificationBodies: true },
    });

    expect(wrapper.findAll(".fr-grid-row.sections > *")).toHaveLength(1);
    expect(wrapper.find(".fr-grid-row.sections > div").classes()).toEqual(["fr-col-12"]);
    expect(wrapper.find(".fr-grid-row.sections .logos--certification-bodies").exists()).toEqual(true);
  });

  test("displays both sponsors and certification bodies", () => {
    const wrapper = mount(Partners, {
      props: { certificationBodies: true, sponsors: true },
    });

    expect(wrapper.findAll(".fr-grid-row.sections > *")).toHaveLength(2);
    expect(wrapper.find(".fr-grid-row.sections > div:nth-child(1)").classes()).toEqual(["fr-col-lg-5"]);
    expect(wrapper.find(".fr-grid-row.sections > div:nth-child(2)").classes()).toEqual([
      "fr-col-lg-6",
      "fr-col-offset-lg-1",
    ]);
  });
});
