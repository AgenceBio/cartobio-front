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

    expect(
      wrapper
        .find("span")
        .text()
        .replace(/\u00A0/g, " "),
    ).toContain("Brouillon");

    const spanElement = wrapper.find("span");
    expect(spanElement.attributes("style")).toContain("background-color: rgb(229, 229, 229)");
    expect(spanElement.attributes("style")).toContain("color: rgb(102, 102, 102)");
  });

  it('does not render text when "text" prop is false', async () => {
    const wrapper = mount(NotificationState, {
      props: {
        operator: {
          notifications: [
            {
              status: "BROUILLON",
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
          notifications: {
            etatCertification: "ENGAGEE",
          },
        },
        text: true,
      },
    });
    await flushPromises();

    expect(wrapper.find(".fr-icon--sm").classes()).toContain("fr-icon-check-line");
    expect(wrapper.findAll(".component > span")[1].text()).toContain("Notification");
    expect(wrapper.findAll(".component >span")[2].text()).toContain("Engagée");

    const spanElement = wrapper.find("span");
    expect(spanElement.attributes("style")).toContain("background-color: rgb(223, 253, 247)");
    expect(spanElement.attributes("style")).toContain("color: rgb(55, 99, 95)");
  });
});
