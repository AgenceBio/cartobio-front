import { describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import NotificationState from "./NotificationState.vue";

describe("NotificationState", () => {
  it('renders correctly for "BROUILLON" state', async () => {
    const wrapper = mount(NotificationState, {
      props: {
        operator: {
          notifications: {
            status: "BROUILLON",
          },
        },
        text: true,
      },
    });
    await flushPromises();

    expect(wrapper.find(".fr-icon--sm").classes()).toContain("fr-icon-article-line");
    expect(
      wrapper
        .find("span")
        .text()
        .replace(/\u00A0/g, " "),
    ).toContain("Brouillon");

    const spanElement = wrapper.find("span");
    expect(spanElement.attributes("style")).toContain("background-color: rgb(211, 211, 211)");
    expect(spanElement.attributes("style")).toContain("color: rgb(128, 128, 128)");
  });

  it('does not render text when "text" prop is false', async () => {
    const wrapper = mount(NotificationState, {
      props: {
        operator: {
          notifications: [
            {
              etatCertification: "BROUILLON",
            },
          ],
        },
        text: false,
      },
    });
    await flushPromises();

    expect(wrapper.find(".mr-1").exists()).toBe(false);
  });

  it('applies styles and classes for "ENGAGEE" state', async () => {
    const wrapper = mount(NotificationState, {
      props: {
        operator: {
          certificats: {
            status: "ENGAGEE",
          },
        },
        text: true,
      },
    });
    await flushPromises();

    expect(wrapper.find(".fr-icon--sm").classes()).toContain("fr-icon-success-line");
    expect(
      wrapper
        .find("span")
        .text()
        .replace(/\u00A0/g, " "),
    ).toContain("Notification Engagée");

    const spanElement = wrapper.find("span");
    expect(spanElement.attributes("style")).toContain("background-color: rgb(158, 249, 190)");
    expect(spanElement.attributes("style")).toContain("color: rgb(41, 114, 84)");
  });
});
