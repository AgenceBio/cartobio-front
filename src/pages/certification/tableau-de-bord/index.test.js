import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import axios from "axios";

import { useUserStore } from "@/stores/user.js";

import records from "../../__fixtures__/search-records.json" assert { type: "json" };
import userFixture from "../../__fixtures__/user.json" assert { type: "json" };

import Page from "./index.vue";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const user = useUserStore(pinia);

beforeEach(() => (user.user = userFixture));
afterEach(() => user.$reset());

describe("certification/tableau-de-bord", () => {
  it("should display a page with only a search bar if user has no pinned operators", async () => {
    axios.__createMock.get.mockResolvedValueOnce({
      data: {
        operators: [],
      },
    });

    const wrapper = mount(Page);

    expect(wrapper.find(".content").text()).toContain("Chargement des données…");

    await flushPromises();
    expect(wrapper.find(".operateurs-epingles").exists()).toEqual(false);
  });

  it("should display 2 pinned operators", async () => {
    axios.__createMock.get.mockResolvedValueOnce({
      data: {
        operators: records.slice(0, 2),
      },
    });

    const wrapper = mount(Page);

    await flushPromises();
    expect(axios.__createMock.get).toHaveBeenCalled(1);
    expect(wrapper.findAll(".operateurs-epingles")).toHaveLength(1);
    expect(wrapper.findAll(".operateurs-epingles > div")).toHaveLength(2);
  });
});
