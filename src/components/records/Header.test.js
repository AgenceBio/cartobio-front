import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { useOperatorStore } from "@/stores/operator.js";
import { useRecordStore } from "@/stores/record.js";
import { useUserStore } from "@/stores/user.js";
import axios from "axios";

import operator from "@/utils/__fixtures__/operator.json" assert { type: "json" };
import record from "@/utils/__fixtures__/record-with-features.json" assert { type: "json" };

import RecordHeader from "./Header.vue";
import EditVersionModal from "@/components/forms/EditVersionForm.vue";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const operatorStore = useOperatorStore(pinia);
const recordStore = useRecordStore(pinia);
const userStore = useUserStore(pinia);

describe("RecordHeader", () => {
  const AsyncComponent = defineComponent({
    components: { RecordHeader },
    template: '<Suspense><RecordHeader v-bind="$attrs" /></Suspense>',
  });

  beforeEach(() => {
    recordStore.update(record);
    operatorStore.operator = operator;
    axios.__createMock.patch.mockResolvedValue({ data: record });
  });

  afterEach(() => {
    operatorStore.$reset();
    userStore.$reset();
    recordStore.$reset();
  });

  it("should display store informations", () => {
    const wrapper = mount(AsyncComponent);

    expect(wrapper.find(".operator-name").text()).toEqual("test");
    expect(wrapper.find(".operator-name").attributes("data-numerobio")).toEqual("34857");
    expect(wrapper.find(".version-name").text()).toEqual("Version créée le 01/01/2024");
  });

  describe("Modifier la version", () => {
    afterEach(() => userStore.$reset());

    it("should allow agri when OPERATOR_DRAFT", async () => {
      userStore.isAgri = true;
      let wrapper = mount(AsyncComponent);
      await wrapper.find(".edit-version-info").trigger("click");

      const modal = wrapper.getComponent(EditVersionModal);
      expect(modal.find("#version_name").exists()).toBe(true);
    });

    it("should allow Certification Body after audit only for OC and without certification dates", async () => {
      recordStore.update({ certification_state: "AUDITED", audit_date: "2024-01-01" });
      userStore.isOc = false;
      userStore.isOcCertif = false;
      let wrapper = mount(AsyncComponent);
      await flushPromises();
      expect(await wrapper.find(".edit-version-info").exists()).toBe(false);

      userStore.isOc = true;
      userStore.isOcCertif = true;
      wrapper = mount(AsyncComponent);
      await wrapper.find(".edit-version-info").trigger("click");
      await flushPromises();
      const modal = wrapper.getComponent(EditVersionModal);
      expect(modal.find("#audit_date").exists()).toBe(true);
      expect(modal.find("#certification_date_debut").exists()).toBe(false);
      expect(modal.find("#certification_date_fin").exists()).toBe(false);
    });

    it("should allow Certification Body after certification only for OC and with certification dates and save it", async () => {
      recordStore.update({
        certification_state: "CERTIFIED",
        audit_date: "2024-01-01",
        certification_date_debut: "2024-02-01",
        certification_date_fin: "2025-02-01",
      });
      userStore.isOc = false;
      userStore.isOcCertif = false;
      let wrapper = mount(AsyncComponent);
      await flushPromises();
      expect(await wrapper.find(".edit-version-info").exists()).toBe(false);

      userStore.isOc = true;
      userStore.isOcCertif = true;
      wrapper = mount(AsyncComponent);
      await wrapper.find(".edit-version-info").trigger("click");
      await flushPromises();

      const modal = wrapper.getComponent(EditVersionModal);
      expect(modal.find("#audit_date").exists()).toBe(true);
      expect(modal.find("#certification_date_debut").exists()).toBe(true);
      expect(modal.find("#certification_date_fin").exists()).toBe(true);

      const newCertificationDateDebut = "2026-02-01";
      const newCertificationDateFin = "2027-02-01";
      await modal.find("#certification_date_debut").setValue(newCertificationDateDebut);
      await modal.find("#certification_date_fin").setValue(newCertificationDateFin);
      await modal.find("form").trigger("submit");
      await flushPromises();

      expect(axios.__createMock.patch).toHaveBeenCalledWith(
        "/v2/audits/054f0d70-c3da-448f-823e-81fcf7c2bf6e",
        {
          audit_date: "2024-01-01",
          certification_date_debut: newCertificationDateDebut,
          certification_date_fin: newCertificationDateFin,
          version_name: "Version créée le 01/01/2024",
        },
        expect.anything(),
      );
    });
  });
});
