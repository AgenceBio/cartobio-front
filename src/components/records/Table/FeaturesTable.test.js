import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { defineComponent, markRaw } from "vue";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises, mount } from "@vue/test-utils";
import axios from "axios";

import { useFeaturesStore } from "@/stores/features.js";
import { usePermissions } from "@/stores/permissions.js";
import { useRecordStore } from "@/stores/record.js";
import { useCartoBioStorage } from "@/stores/storage.js";

import record from "@/utils/__fixtures__/record-with-features.json";
import Modal from "@/components/widgets/Modal.vue";
import DeleteFeatureModal from "@/components/forms/DeleteFeatureForm.vue";
import EditForm from "@/components/forms/SingleItemOperatorForm.vue";
import TableComponent from "@/components/records/Table/FeaturesTable.vue";
import { DeletionReasonsCode, GROUPE_COMMUNE } from "@/utils/features.js";
import { useUserStore } from "@/stores/user";
import CultureTypeModal from "@/components/forms/CultureTypeForm.vue";
import EngagementDateModal from "@/components/forms/EngagementDateForm.vue";
import EngagementLevelModal from "@/components/forms/EngagementLevelForm.vue";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const storageStore = useCartoBioStorage(pinia);
const recordStore = useRecordStore(pinia);
const userStore = useUserStore(pinia);
const featuresStore = useFeaturesStore(pinia);
const permissions = usePermissions(pinia);

describe("Features Table", () => {
  beforeEach(() => {
    recordStore.$reset();
    recordStore.update(record);
    storageStore.online = true;
  });

  afterEach(() => {
    document.body.outerHTML = "";
  });

  test("features are listed as 3 groups of 2 and 1 and 2 features (one being multi-crops)", () => {
    const wrapper = mount(TableComponent);
    expect(wrapper.find(".total-parcelles").text()).toContain("4 parcelles");
    expect(wrapper.findAll(".groupe-parcelles")).toHaveLength(3);
    expect(wrapper.findAll(".parcelle-carte")).toHaveLength(5);

    expect(wrapper.find("#parcelle-1").attributes()).toHaveProperty("hidden", "");
  });

  test("we toggle all features in one click", async () => {
    const wrapper = mount(TableComponent);

    expect(wrapper.find("#mass-edit").exists()).toEqual(false);
    await wrapper.find("#radio-select-all").trigger("click");

    expect(featuresStore.selectedIds).toEqual(["1", "2", "3", "4"]);
    expect(wrapper.find("#mass-edit").exists()).toEqual(true);
  });

  test("Selectionne quelques parcelles", async () => {
    const AsyncComponent = defineComponent({
      components: { TableComponent },
      template: '<Suspense><TableComponent v-bind="$attrs" /></Suspense>',
    });

    const wrapper = mount(AsyncComponent, {
      props: {
        massActions: [
          { label: "Modifier les cultures", component: markRaw(CultureTypeModal) },
          { label: "Ajouter une date de début de conversion", component: markRaw(EngagementDateModal) },
          { label: "Modifier le statut des parcelles", component: markRaw(EngagementLevelModal) },
        ],
      },
    });

    expect(wrapper.find("#mass-edit").exists()).toEqual(false);
    await wrapper.findAll(".actions-parcelles")[0].find("input").trigger("click");

    expect(featuresStore.selectedIds).toEqual(["2", "4"]);
    expect(wrapper.find("#mass-edit .menu-button").exists()).toEqual(true);

    await wrapper.find("#mass-edit .menu-button").trigger("click");

    expect(wrapper.findAll("#mass-edit ul > li")).toHaveLength(3);
  });

  // test("we not be able to see and activate facets as an Agri", async () => {
  //   const wrapper = mount(TableComponent);

  //   expect(wrapper.find(".fr-tags-group--annotations").exists()).toEqual(false);
  // });

  // test("we should be able to see and activate facets only when we are a Certification Body", async () => {
  //   const wrapper = mount(TableComponent);

  //   expect(wrapper.find(".fr-tags-group--tags").exists()).toEqual(false);

  //   permissions.isOc = true;
  //   await flushPromises();

  //   expect(wrapper.find(".fr-tags-group--tags").exists()).toEqual(true);

  //   // toggle two filters
  //   await wrapper.find(".fr-tags-group--tags .tag--annotation_downgraded").trigger("click");
  //   await wrapper.find(".fr-tags-group--tags .tag--annotation_risky").trigger("click");
  //   await wrapper.find(".fr-tags-group--tags .tag--annotation_surveyed").trigger("click");
  //   await wrapper.find(".fr-tags-group--tags .tag--annotation_surveyed").trigger("click");
  //   await flushPromises();
  //   expect(wrapper.find("thead.summary tr").text()).toContain("1 parcelles");
  //   expect(wrapper.findAll("tr.parcelle")).toHaveLength(1);
  //   expect(featuresStore.all).toHaveLength(4);
  // });

  test("we group by town", async () => {
    const wrapper = mount(TableComponent);

    wrapper.find("#plots-group-by").setValue(GROUPE_COMMUNE);

    // await rendering
    await flushPromises();
    const groups = wrapper.findAll(".groupe-parcelles");

    expect(groups.at(0).find("h3").text()).toContain("26108");
    expect(groups.at(1).find("h3").text()).toContain("26113");
  });

  test("we select a feature and its unfolds the group", async () => {
    const wrapper = mount(TableComponent);

    // await wrapper.find('#parcelle-1 th .single-checkbox input[type="checkbox"]')
    featuresStore.toggleSingleSelected(1);
    await flushPromises();

    expect(wrapper.find("#parcelle-1").attributes()).not.toHaveProperty("hidden");
  });

  test("we delete a feature", async () => {
    userStore.user = {
      organismeCertificateur: {
        id: 1,
      },
    };
    permissions.canDeleteFeature = true;

    const wrapper = mount(TableComponent);

    await wrapper.find(".groupe-parcelles").trigger("click");
    await wrapper.find("#parcelle-3 .show-actions").trigger("click");
    await wrapper.find("#parcelle-3 .menu-container .fr-icon-delete-line").trigger("click");

    // we trigger the deletion
    axios.__createMock.delete.mockResolvedValueOnce({ data: record });

    const modal = wrapper.getComponent(DeleteFeatureModal);
    expect(modal.text()).toContain("parcelle 3");
    await modal.find("#deletion-reason").setValue(DeletionReasonsCode.OTHER);
    await modal.find("#deletion-details").setValue("Parce que");
    await modal.find("button.fr-icon-delete-line").trigger("click");

    expect(modal.emitted("submit")).toHaveProperty("0.0.id", "3");
    expect(modal.emitted("submit")).toHaveProperty("0.0.reason", {
      code: DeletionReasonsCode.OTHER,
      details: "Parce que",
    });
  });

  test("there is not other action if we are not the correct OC", async () => {
    userStore.user = {
      organismeCertificateur: {
        id: 2,
      },
    };
    permissions.isOc = true;

    const wrapper = mount(TableComponent);

    expect(wrapper.find(".more-actions").exists()).toEqual(false);
  });

  test("we open a modal and test various cases it should remain open, or close", async () => {
    permissions.isOc = false;
    permissions.isAgri = true;
    permissions.canDeleteFeature = true;
    permissions.canChangeCulture = true;

    const AsyncComponent = defineComponent({
      components: { TableComponent },
      template: '<Suspense><TableComponent v-bind="$attrs" /></Suspense>',
    });

    const wrapper = mount(AsyncComponent, {
      props: { editForm: markRaw(EditForm) },
    });

    wrapper.getComponent(TableComponent);
    let modal;

    // // we click outside the edit modal (the background of the <dialog> element)
    // // it closes itself because it is not "dirty"
    // table.find("tr.parcelle td.actions button:first-child").trigger("click");
    // await flushPromises();
    // modal = wrapper.getComponent(Modal);
    // await modal.trigger("click");
    // await flushPromises();
    // expect(modal.exists()).toEqual(false);

    // // now, we change a field and we should not be able to close it
    // axios.__createMock.patch.mockResolvedValueOnce({ data: record });

    // table.find("tr.parcelle td.actions button:first-child").trigger("click");
    // await flushPromises();
    // modal = wrapper.getComponent(Modal);
    // await modal.find("#feature-nom").setValue("aa");
    // await modal.trigger("click");
    // await flushPromises();
    // expect(modal.exists()).toEqual(true);

    // // we click outside the delete modal
    await wrapper.find(".groupe-parcelles").trigger("click");
    await wrapper.find("#parcelle-3 .show-actions").trigger("click");
    await wrapper.find(".fr-icon-delete-line").trigger("click");
    modal = wrapper.getComponent(DeleteFeatureModal);
    await modal.trigger("click");
    await flushPromises();
    expect(modal.exists()).toEqual(false);

    // we click inside, so the modal should still exist
    await wrapper.find(".groupe-parcelles").trigger("click");
    await wrapper.find("#parcelle-3 .show-actions").trigger("click");
    await wrapper.find(".fr-icon-delete-line").trigger("click");
    await flushPromises();
    modal = wrapper.getComponent(Modal);
    await modal.find("#modal-title").trigger("click");
    await flushPromises();
    expect(modal.exists()).toEqual(true);
  });
});
