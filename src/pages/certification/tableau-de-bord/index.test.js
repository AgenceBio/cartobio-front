import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import axios from "axios";

import { useUserStore } from "@/stores/user.js";

import records from "../../__fixtures__/search-records.json";
import userFixture from "../../__fixtures__/user.json";

import Page from "./index.vue";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const user = useUserStore(pinia);

beforeEach(() => (user.user = userFixture));
afterEach(() => user.$reset());

describe("certification/tableau-de-bord", () => {
  it("should display a page with only a search bar if user has no pinned operators", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        pinnedOperators: [],
        consultedOperators: [],
      },
    });

    const wrapper = mount(Page);

    expect(wrapper.find(".content").text()).toContain("Chargement des données…");

    await flushPromises();
    expect(wrapper.find(".operateurs-epingles").exists()).toEqual(true);
    expect(wrapper.findAll(".operateurs-epingles > div")).toHaveLength(1);
    expect(wrapper.find(".operateurs-epingles > div > p").text()).toContain("Aucune exploitation");
    expect(wrapper.find(".operateurs-consulte").exists()).toEqual(false);
  });

  it("should display 2 pinned operators", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        pinnedOperators: records.slice(0, 2),
        consultedOperators: records.slice(0, 2),
      },
    });

    const wrapper = mount(Page);

    await flushPromises();
    expect(axios.get).toHaveBeenCalled(1);
    expect(wrapper.findAll(".operateurs-epingles")).toHaveLength(1);
    expect(wrapper.findAll(".operateurs-epingles > div")).toHaveLength(2);

    // changement d'onglet
    expect(wrapper.findAll("label[for=derniers-operateurs]")).toHaveLength(1);
    await wrapper.find("#derniers-operateurs").setValue("derniers-operateurs");
    await flushPromises();

    expect(wrapper.findAll(".operateurs-epingles")).toHaveLength(0);
    expect(wrapper.findAll(".operateurs-consultes")).toHaveLength(1);
    expect(wrapper.findAll(".operateurs-consultes > div")).toHaveLength(2);
  });
});
