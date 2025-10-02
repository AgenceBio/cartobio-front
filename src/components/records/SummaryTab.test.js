import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";

import { useRecordStore } from "@/stores/record.js";
import { useCartoBioStorage } from "@/stores/storage.js";
import SummaryTab from "./SummaryTab.vue";

import record from "@/utils/__fixtures__/record-with-features.json";
import { useOperatorStore } from "@/stores/operator";
import { useFeaturesStore } from "@/stores/features";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const storageStore = useCartoBioStorage(pinia);
const recordStore = useRecordStore(pinia);
const operatorStore = useOperatorStore(pinia);
const featuresStore = useFeaturesStore(pinia);

describe("SummaryTab", () => {
  beforeEach(() => {
    recordStore.$reset();
    recordStore.update(record);
    storageStore.online = true;
  });

  it("N'affiche pas de warning si on est sur la parcelle la plus recente", async () => {
    const wrapper = mount(SummaryTab);

    operatorStore.records = [record];
    await flushPromises();
    expect(wrapper.findAll(".notification")).toHaveLength(0);
    expect(wrapper.find(".color-green.bg-bourgeon").text()).toEqual("0");
  });

  it("Affiche un warning si on est pas sur la parcelle la plus recente", async () => {
    const wrapper = mount(SummaryTab);

    operatorStore.records = [];
    await flushPromises();
    expect(wrapper.findAll(".notification")).toHaveLength(1);
    expect(wrapper.find(".color-green.bg-bourgeon").text()).toEqual("1");
  });

  it("Affiche des warnings", async () => {
    const wrapper = mount(SummaryTab);

    featuresStore.setAll([
      { id: "1", properties: {} },
      { id: "2", properties: { cultures: [{ TYPE: "AGR", CPF: "" }] } },
      { id: "3", properties: { cultures: [{ CPF: "01.23.11,01.23.12,01.23.13,01.23.14,01.23.19" }] } },
      { id: "4", properties: { NUMERO_I: "1", NUMERO_P: "2", cultures: [{ CPF: "01.13.42" }] } },
      { id: "5", properties: { NOM: "test", cultures: [{ CPF: "01.13.42" }], conversion_niveau: "C1" } },
      { id: "6", properties: { NOM: "test", cultures: [{ CPF: "01.13.42" }], conversion_niveau: "AB?" } },
      { id: "7", properties: { NOM: "test", cultures: [{ CPF: "01.13.42" }], conversion_niveau: "AB" } },
      {
        id: "8",
        geometry: { coordinates: [] },
        properties: {
          NOM: "test",
          cultures: [{ CPF: "01.13.42" }],
          conversion_niveau: "C1",
          engagement_date: "2023-04-23",
        },
      },
    ]);
    operatorStore.records = [];

    await flushPromises();
    expect(wrapper.findAll(".notification")).toHaveLength(4);
    expect(wrapper.find(".color-green.bg-bourgeon").text()).toEqual("4");
    expect(wrapper.findAll(".notification h4")).toHaveLength(4);
    expect(wrapper.findAll(".notification h4")[0].text()).toEqual("Sans nom");
    expect(wrapper.findAll(".notification h4")[1].text()).toEqual("Sans culture");
    expect(wrapper.findAll(".notification h4")[2].text()).toEqual("Culture à préciser");

    expect(wrapper.findAll(".notification p")).toHaveLength(4);
    expect(wrapper.findAll(".notification p")[0].text()).toEqual("3 parcelles");
    expect(wrapper.findAll(".notification p")[1].text()).toEqual("1 parcelle");
    expect(wrapper.findAll(".notification p")[2].text()).toEqual("2 parcelles");
  });

  it("Affiche les infos générales du parcellaire", async () => {
    const wrapper = mount(SummaryTab);

    expect(wrapper.findAll(".infos-parcelles > p")).toHaveLength(2);
    expect(wrapper.findAll(".infos-parcelles > p")[0].text()).toEqual("4 parcelles");
    expect(wrapper.findAll(".infos-parcelles > p")[1].text()).toEqual("5 431,49 ha");
  });

  it("Devrait affiche 2 cartes de niveaux de conversion", async () => {
    const wrapper = mount(SummaryTab);

    expect(wrapper.findAll(".carte-niveau-conv")).toHaveLength(2);
    expect(wrapper.findAll(".carte-niveau-conv > div > p")).toHaveLength(8);
    expect(wrapper.findAll(".carte-niveau-conv > div > p")[0].text()).toEqual("AB");
    expect(wrapper.findAll(".carte-niveau-conv > div > p")[1].text()).toEqual("2 718,48 ha");
    expect(wrapper.findAll(".carte-niveau-conv > div > p")[2].text()).toEqual("3");
    expect(wrapper.findAll(".carte-niveau-conv > div > p")[3].text()).toEqual("Parcelles");
    expect(wrapper.findAll(".carte-niveau-conv > div > p")[4].text()).toEqual("C3");
    expect(wrapper.findAll(".carte-niveau-conv > div > p")[5].text()).toEqual("2 713,01 ha");
    expect(wrapper.findAll(".carte-niveau-conv > div > p")[6].text()).toEqual("1");
    expect(wrapper.findAll(".carte-niveau-conv > div > p")[7].text()).toEqual("Parcelles");
  });

  it("Devrait changer d'onglet au click", async () => {
    const wrapper = mount(SummaryTab);

    expect(wrapper.findAll(".carte-niveau-conv")).toHaveLength(2);
    await wrapper.findAll(".carte-niveau-conv")[0].trigger("click");
    expect(wrapper.emitted("switch-tab")).toEqual([["NIVEAU_CONVERSION"]]);
  });
});
