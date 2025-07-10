import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { defineComponent, markRaw } from "vue";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises, mount } from "@vue/test-utils";
import axios from "axios";
import { useRecordStore } from "@/stores/record.js";
import { usePermissions } from "@/stores/permissions.js";
import { useCartoBioStorage } from "@/stores/storage.js";
import {
  ANNOTATIONS,
  AnnotationTags,
  CERTIFICATION_BODY_DECISION,
  LEVEL_AB,
  LEVEL_C1,
  LEVEL_C2,
  LEVEL_C3,
  LEVEL_CONVENTIONAL,
} from "@/referentiels/ab.js";

import record from "@/utils/__fixtures__/record-with-features.json" assert { type: "json" };
import EditForm from "@/components/forms/SingleItemCertificationBodyForm.vue";
import { useUserStore } from "@/stores/user";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const recordStore = useRecordStore(pinia);
const userStore = useUserStore(pinia);
const permissions = usePermissions(pinia);
const storage = useCartoBioStorage(pinia);

describe("SingleItemCertificationBodyForm", () => {
  let wrapper;

  beforeEach(async () => {
    recordStore.$reset();
    recordStore.update(record);
    permissions.isOc = true;
    storage.online = true;

    wrapper = mount(EditForm, {
      props: { feature: record.parcelles.features[1] },
    });

    /** */
    await flushPromises();
  });

  afterEach(() => {
    document.body.outerHTML = "";
  });

  describe("item is not readonly", async () => {
    beforeAll(async () => {
      userStore.user = {
        organismeCertificateur: {
          id: 1,
        },
      };
    });
    test("we assign a certification state", async () => {
      const form = wrapper.getComponent(EditForm);

      // if "Conventionnel", there is no date field
      await form.find(`#conversion-${LEVEL_CONVENTIONAL}`).setValue();
      expect(form.find("#engagement_date").exists()).toEqual(false);

      // if AB, date field is not mandatory
      await form.find(`#conversion-${LEVEL_AB}`).setValue();
      expect(form.find("#engagement_date").attributes()).not.toHaveProperty("required");

      // date field is mandatory otherwise
      await form.find(`#conversion-${LEVEL_C1}`).setValue();
      expect(form.find("#engagement_date").attributes()).toHaveProperty("required", "");
    });

    test("we toggle expanded annotations", async () => {
      const form = wrapper.getComponent(EditForm);

      // We have all the tags tags and no expand button
      expect(form.findAll(".fr-tags-group--annotations > .annotation-choice")).toHaveLength(5);
      expect(form.find(".fr-tags-group--annotations > .annotation--more").attributes()).toHaveProperty("hidden");

      // expect(form.find('.fr-tags-group--annotations > .annotation--more').attributes()).not.toHaveProperty('hidden')
      // await form.find('.fr-tags-group--annotations > .annotation--more button').trigger('click')

      const expectedChoices = Object.keys(AnnotationTags);
      expect(form.findAll(".fr-tags-group--annotations > .annotation-choice")).toHaveLength(expectedChoices.length);
    });

    test("we select three choices, and two reasons", async () => {
      const form = wrapper.getComponent(EditForm);

      // We have 5 tags
      await form.find(`.fr-tags-group--annotations > .annotation--${ANNOTATIONS.DOWNGRADED} button`).trigger("click");
      await form
        .find(`.fr-tags-group--annotations > .annotation--${ANNOTATIONS.REDUCED_CONVERSION_PERIOD} button`)
        .trigger("click");
      await form.find(`.fr-tags-group--annotations > .annotation--${ANNOTATIONS.RISKY} button`).trigger("click");

      expect(form.find("#downgraded_state").element.value).toEqual(CERTIFICATION_BODY_DECISION.PENDING);
      expect(form.find("#downgraded_state").element.selectedOptions[0].textContent).toEqual("En cours de traitement");

      expect(form.find("#reduced_conversion_period_state").element.value).toEqual(CERTIFICATION_BODY_DECISION.PENDING);
      expect(form.find("#reduced_conversion_period_state").element.selectedOptions[0].textContent).toEqual(
        "En cours de traitement",
      );

      // we toggle and cancel the tag
      await form.find(`.fr-tags-group--annotations > .annotation--${ANNOTATIONS.SURVEYED} button`).trigger("click");
      await form.find(`.fr-tags-group--annotations > .annotation--${ANNOTATIONS.SURVEYED} button`).trigger("click");

      await form.find("#reduced_conversion_period_state").setValue(CERTIFICATION_BODY_DECISION.REJECTED);
      await form.find("#downgraded_state").setValue(CERTIFICATION_BODY_DECISION.ACCEPTED);

      // click and assess server update
      axios.__createMock.patch.mockResolvedValueOnce({ data: record });
      axios.__createMock.get.mockResolvedValueOnce({ data: record });
      await form.find(".fr-modal__footer button.fr-btn").trigger("click");

      await flushPromises();
    });
  });

  describe("item is readonly", async () => {
    beforeAll(async () => {
      userStore.user = {
        organismeCertificateur: {
          id: 2,
        },
      };
    });
    test("certification state are disabled", async () => {
      const form = wrapper.getComponent(EditForm);

      expect(form.find(`#conversion-${LEVEL_CONVENTIONAL}`).isDisabled()).toEqual(true);
      expect(form.find(`#conversion-${LEVEL_C1}`).isDisabled()).toEqual(true);
      expect(form.find(`#conversion-${LEVEL_C2}`).isDisabled()).toEqual(true);
      expect(form.find(`#conversion-${LEVEL_C3}`).isDisabled()).toEqual(true);
      expect(form.find(`#conversion-${LEVEL_AB}`).isDisabled()).toEqual(true);
    });

    test("annotations are disabled", async () => {
      const form = wrapper.getComponent(EditForm);

      // We have all the tags tags and no expand button
      expect(form.findAll(".fr-tags-group--annotations > .annotation-choice")).toHaveLength(5);
      expect(form.find(".fr-tags-group--annotations > .annotation--more").attributes()).toHaveProperty("hidden");

      // expect(form.find('.fr-tags-group--annotations > .annotation--more').attributes()).not.toHaveProperty('hidden')
      // await form.find('.fr-tags-group--annotations > .annotation--more button').trigger('click')

      const expectedChoices = Object.keys(AnnotationTags);
      expect(form.findAll(".fr-tags-group--annotations > .annotation-choice")).toHaveLength(expectedChoices.length);

      const annotations = form.findAll(".fr-tags-group--annotations > .annotation-choice > button");
      expect(annotations[0].isDisabled()).toEqual(true);
      expect(annotations[1].isDisabled()).toEqual(true);
      expect(annotations[2].isDisabled()).toEqual(true);
      expect(annotations[3].isDisabled()).toEqual(true);
      expect(annotations[4].isDisabled()).toEqual(true);
    });
  });
});
