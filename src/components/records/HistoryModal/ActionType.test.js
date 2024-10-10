import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { EventType } from "@agencebio/cartobio-types";
import { CertificationState } from "@agencebio/cartobio-types";
import { usePermissions } from "@/stores/permissions.js";
import ActionType from "./ActionType.vue";
import { createTestingPinia } from "@pinia/testing";

const pinia = createTestingPinia({ createSpy: vi.fn });
const permissions = usePermissions(pinia);

describe("ActionType", () => {
  afterEach(() => permissions.$reset());

  it("renders Nouvelle parcelle for all", async () => {
    const wrapper = mount(ActionType, { props: { type: EventType.FEATURE_CREATE } });
    expect(wrapper.text()).toContain("Nouvelle parcelle");
  });

  it("renders Parcellaire importé for all", async () => {
    // legacy data, without 'type'
    let wrapper = mount(ActionType, { props: { state: CertificationState.OPERATOR_DRAFT } });
    expect(wrapper.text()).toContain("Parcellaire importé");

    wrapper = mount(ActionType, {
      props: { type: EventType.CERTIFICATION_STATE_CHANGE, state: CertificationState.OPERATOR_DRAFT },
    });
    expect(wrapper.text()).toContain("Parcellaire importé");
  });

  it("renders Certification en cours for Agri, and Audit terminé for OC", async () => {
    // legacy data, without 'type'
    permissions.isAgri = true;
    let wrapper = mount(ActionType, { props: { state: CertificationState.AUDITED } });
    expect(wrapper.text()).toContain("Certification en cours");

    permissions.isAgri = false;
    wrapper = mount(ActionType, {
      props: { type: EventType.CERTIFICATION_STATE_CHANGE, state: CertificationState.AUDITED },
    });
    expect(wrapper.text()).toContain("Audit terminé");
  });

  it("renders Certification en cours for all", async () => {
    // legacy data, without 'type'
    let wrapper = mount(ActionType, { props: { state: CertificationState.PENDING_CERTIFICATION } });
    expect(wrapper.text()).toContain("Certification en cours");

    wrapper = mount(ActionType, {
      props: { type: EventType.CERTIFICATION_STATE_CHANGE, state: CertificationState.PENDING_CERTIFICATION },
    });
    expect(wrapper.text()).toContain("Certification en cours");
  });

  it("renders Certifié for all", async () => {
    // legacy data, without 'type'
    let wrapper = mount(ActionType, { props: { state: CertificationState.CERTIFIED } });
    expect(wrapper.text()).toContain("Certifié");

    wrapper = mount(ActionType, {
      props: { type: EventType.CERTIFICATION_STATE_CHANGE, state: CertificationState.CERTIFIED },
    });
    expect(wrapper.text()).toContain("Certifié");
  });
});
