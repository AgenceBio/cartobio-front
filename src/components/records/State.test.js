import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { CertificationState } from "@agencebio/cartobio-types";
import State from "./State.vue";

describe("CertificationState", () => {
  it("renders N/C for an unknown or empty state", async () => {
    let wrapper = mount(State, { props: { record: { certification_state: undefined } } });
    expect(wrapper.text()).toContain("Non renseigné");

    wrapper = mount(State, { props: { record: { certification_state: CertificationState.UNKNOWN } } });
    expect(wrapper.text()).toContain("Non renseigné");
    expect(wrapper.attributes()).toHaveProperty("aria-label", "Non renseigné");
  });

  it("renders a date suffix when provided", async () => {
    const wrapper = mount(State, {
      props: {
        record: { certification_state: CertificationState.CERTIFIED, certification_date_debut: new Date("2023-01-01") },
      },
    });
    expect(wrapper.text()).toContain("Certifié2023");
    expect(wrapper.attributes()).toHaveProperty("aria-label", "Certifié en 2023");
  });
});
