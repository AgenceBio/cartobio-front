import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Pagination from "@/components/widgets/Pagination.vue";

describe("Pagination.vue", () => {
  const getWrapper = (page) =>
    mount(Pagination, {
      props: {
        currentPage: page,
        maxPage: 5,
      },
    });

  it("renders correctly", () => {
    const wrapper = getWrapper(1);
    expect(wrapper.find(".fr-pagination").exists()).toBe(true);
  });

  it("emits changePage event with correct value when select option is changed", async () => {
    const wrapper = getWrapper(1);
    const button3 = wrapper.find(".fr-pagination__link--3");
    await button3.trigger("click");
    expect(wrapper.emitted().changePage[0]).toEqual([3]);
  });

  it("emits changePage event with correct value when previous button is clicked", async () => {
    const wrapper = getWrapper(2);
    const prevButton = wrapper.find(".fr-pagination__link--prev ");
    await prevButton.trigger("click");
    expect(wrapper.emitted().changePage[0]).toEqual([1]);
  });

  it("emits changePage event with correct value when next button is clicked", async () => {
    const wrapper = getWrapper(2);
    const nextButton = wrapper.find(".fr-pagination__link--next");
    await nextButton.trigger("click");
    expect(wrapper.emitted().changePage[0]).toEqual([3]);
  });

  it("disables previous button on the first page", () => {
    const wrapper = getWrapper(1);
    const prevButton = wrapper.find(".fr-pagination__link--prev");
    expect(prevButton.attributes("disabled")).not.toBeUndefined();
  });

  it("disables next button on the last page", () => {
    const wrapper = getWrapper(5);
    const nextButton = wrapper.find(".fr-pagination__link--next");
    expect(nextButton.attributes("disabled")).not.toBeUndefined();
  });
});
