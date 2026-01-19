import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises, mount } from "@vue/test-utils";

import { useFeaturesStore } from "@/stores/features.js";
import { usePermissions } from "@/stores/permissions.js";

import record from "@/utils/__fixtures__/record-with-features.json" assert { type: "json" };
import FeatureGroup from "@/components/records/Table/FeatureGroup.vue";
import { getFeatureGroups, GROUPE_COMMUNE } from "@/utils/features.js";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const featuresStore = useFeaturesStore(pinia);
const permissions = usePermissions(pinia);

describe("FeatureGroup", () => {
  let featureGroup;

  beforeEach(() => {
    featureGroup = getFeatureGroups(record.parcelles).at(0);
  });

  afterEach(() => {
    document.body.outerHTML = "";
    permissions.$reset();
  });

  test("properly renders a group", async () => {
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup },
    });

    await wrapper.find(".groupe-parcelles").trigger("click");
    expect(wrapper.vm.open).toEqual(true);

    // we should have a multi culture name within the 3rd cell
    expect(wrapper.find("#parcelle-2 .parcelle-actions ").text()).toContain("Multiculture");

    // we should have a single culture name within the 3rd cell
    expect(wrapper.find("#parcelle-4 .parcelle-titre").text()).toContain("îlot 2, parcelle 1");
    expect(wrapper.find("#parcelle-4 .parcelle-titre .badge.badge-AB").exists()).toEqual(true);
    console.warn(wrapper.html());
  });

  test("non-culture grouping has different column name", async () => {
    const featureGroup = getFeatureGroups(record.parcelles, GROUPE_COMMUNE).at(0);
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup },
    });
    await wrapper.find(".groupe-parcelles").trigger("click");

    // we should have a multi culture name within the 3rd cell
    expect(wrapper.find("#parcelle-2 .parcelle-actions ").text()).toContain("713,01");

    // we should have a single culture name within the 3rd cell
    expect(wrapper.find("#parcelle-4 .parcelle-actions > p").text()).toContain("713,01");
    expect(wrapper.find("#parcelle-4 .parcelle-titre ").text()).toContain("Ail");
  });

  test("toggles on and off all group items", async () => {
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup },
    });

    expect(wrapper.vm.selectedIds).toEqual([]);

    // hidden elements cannot be clicked…
    await wrapper.find(".groupe-parcelles").trigger("click");

    const selectAllCheckbox = wrapper.find('.groupe-parcelles  input[type="checkbox"]');
    await selectAllCheckbox.trigger("click");
    expect(featuresStore.selectedIds).toEqual(["4", "2"]);

    await selectAllCheckbox.trigger("click");
    expect(featuresStore.selectedIds).toEqual([]);

    // we close the header
    // then we click again on a single checkbox
    await wrapper.find(".groupe-parcelles").trigger("click");
    await wrapper.find('#parcelle-2  input[type="checkbox"]').trigger("click");
    expect(featuresStore.selectedIds).toEqual(["2"]);
    expect(wrapper.vm.open).toEqual(true);
  });

  test("we trigger an edit form", async () => {
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup },
    });

    const group = wrapper.getComponent(FeatureGroup);
    await wrapper.find(".groupe-parcelles").trigger("click");
    await wrapper.find("#parcelle-2 .parcelle-actions").trigger("click");
    expect(group.emitted("edit:featureId")).toHaveProperty("0", ["2"]);
  });

  test("we trigger a delete form", async () => {
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup },
    });

    await wrapper.find(".groupe-parcelles").trigger("click");

    // delete item is not active unless we have the permissions (after flushPromises/re-render)
    expect(wrapper.find("#parcelle-2 .fr-icon-delete-line").attributes()).toHaveProperty("disabled");
    permissions.canDeleteFeature = true;
    await flushPromises();
    expect(wrapper.find("#parcelle-2 .fr-icon-delete-line").attributes()).not.toHaveProperty("disabled");
    await wrapper.find("#parcelle-2 .fr-icon-delete-line").trigger("click");
    expect(wrapper.emitted("delete:featureId")).toHaveProperty("0", ["2"]);
  });
});
