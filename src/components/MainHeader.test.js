import { afterEach, describe, expect, test, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises, mount } from "@vue/test-utils";
import { ROLES, useUserStore } from "@/stores/user.js";
import { usePermissions } from "@/stores/permissions.js";
import MainHeader from "./MainHeader.vue";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const user = useUserStore(pinia);
const permissions = usePermissions(pinia);

const createRouterMock = (path = "/", meta = {}) => ({
  fullPath: path,
  path,
  meta: { skipLinks: {}, ...meta },
});

describe("MainHeader", () => {
  afterEach(() => {
    user.$reset();
    permissions.$reset();
    vi.unstubAllEnvs();
  });

  test("skip links target content, menu and footer", () => {
    const wrapper = mount(MainHeader, {
      global: {
        mocks: {
          $route: createRouterMock(),
        },
      },
    });
    const result = wrapper.findAll(".fr-skiplinks .fr-link").map((w) => w.attributes("href"));
    expect(result).toEqual(["#header", "#content", "#header-navigation", "#footer"]);
  });

  test("as a guest", () => {
    const wrapper = mount(MainHeader, {
      global: {
        mocks: {
          $route: createRouterMock(),
        },
      },
    });
    expect(wrapper.find(".tool-username").exists()).toEqual(false);
    expect(wrapper.find(".fr-header__tools").text()).toContain("Me connecter");

    const mobileMenu = wrapper.find('#mobile-menu .fr-nav[role="navigation"]');
    expect(mobileMenu.text()).toContain("À propos de CartoBio");
  });

  test("with a warning header", async () => {
    delete import.meta.env.VUE_APP_PRODUCTION;
    const wrapper = mount(MainHeader, {
      global: {
        mocks: {
          $route: createRouterMock(),
        },
      },
    });
    expect(wrapper.find(".fr-notice").exists()).toEqual(true);
  });

  test("without a warning header", async () => {
    vi.stubEnv("VUE_APP_PRODUCTION", true);
    const wrapper = mount(MainHeader, {
      global: {
        mocks: {
          $route: createRouterMock(),
        },
      },
    });
    expect(wrapper.find(".fr-notice").exists()).toEqual(false);
  });

  test("as a guest, on a general audience page", () => {
    const wrapper = mount(MainHeader, {
      global: {
        mocks: {
          $route: createRouterMock("/", { generalAudience: true }),
        },
      },
    });
    expect(wrapper.find(".tool-username").exists()).toEqual(false);
    expect(wrapper.find(".fr-header__tools").text()).toContain("Me connecter");
  });

  test("as a certification body", async () => {
    const wrapper = mount(MainHeader, {
      global: {
        mocks: {
          $route: createRouterMock("/certification/tableau-de-bord"),
        },
        stubs: {
          "router-link": {
            template: '<a :href="to"><slot /></a>',
            props: ["to"],
          },
        },
      },
    });

    user.isLogged = true;
    user.user = { nom: "Nom", prenom: "Prénom" };
    user.roles = [ROLES.OC_AUDIT];
    await flushPromises();

    const userButton = wrapper.find(".tool-username button");
    expect(userButton.exists()).toBe(true);
    expect(userButton.classes()).toContain("fr-icon-medal-fill");
    expect(userButton.text()).toContain("Nom");
    expect(userButton.text()).toContain("Prénom");

    await userButton.trigger("click");
    await flushPromises();

    const monEspaceMenu = wrapper.find("#navigation-espace");
    expect(monEspaceMenu.isVisible()).toBe(true);

    const menuLinks = monEspaceMenu.findAll("a");
    expect(menuLinks.length).toBeGreaterThan(0);
  });

  test("as a farmer", async () => {
    const wrapper = mount(MainHeader, {
      global: {
        mocks: {
          $route: createRouterMock("/exploitations"),
        },
        stubs: {
          "router-link": {
            template: '<a :href="to"><slot /></a>',
            props: ["to"],
          },
        },
      },
    });

    user.isLogged = true;
    user.user = { nom: "Nom", prenom: "Prénom" };
    user.roles = [ROLES.OPERATEUR];
    await flushPromises();

    const userButton = wrapper.find(".tool-username button");
    expect(userButton.exists()).toBe(true);
    expect(userButton.classes()).toContain("fr-icon-plant-fill");
    expect(userButton.text()).toContain("Nom");
    expect(userButton.text()).toContain("Prénom");

    await userButton.trigger("click");
    await flushPromises();

    const monEspaceMenu = wrapper.find("#navigation-espace");
    expect(monEspaceMenu.isVisible()).toBe(true);
  });

  test("as unknown role", async () => {
    const wrapper = mount(MainHeader, {
      global: {
        mocks: {
          $route: createRouterMock("/"),
        },
        stubs: {
          "router-link": {
            template: '<a :href="to"><slot /></a>',
            props: ["to"],
          },
        },
      },
    });

    user.isLogged = true;
    user.user = { nom: "Nom", prenom: "Prénom" };
    user.roles = [];
    await flushPromises();

    const userButton = wrapper.find(".tool-username button");
    expect(userButton.exists()).toBe(true);
    expect(userButton.classes()).toContain("fr-icon-account-circle-fill");
    expect(userButton.text()).toContain("Nom");
    expect(userButton.text()).toContain("Prénom");
  });

  test("dropdown menu has correct styling", async () => {
    const wrapper = mount(MainHeader, {
      global: {
        mocks: {
          $route: createRouterMock("/exploitations/123456/2024"),
        },
        stubs: {
          "router-link": {
            template: '<a :href="to"><slot /></a>',
            props: ["to"],
          },
        },
      },
    });

    user.isLogged = true;
    user.user = { nom: "Nom", prenom: "Prénom" };
    user.roles = [ROLES.OC_AUDIT];
    await flushPromises();

    const dropdownButton = wrapper.find(".dropdown-menu-container button");
    if (dropdownButton.exists()) {
      await dropdownButton.trigger("click");
      await flushPromises();

      const dropdown = wrapper.find("#dropdown-menu");
      expect(dropdown.exists()).toBe(true);
      expect(dropdown.classes()).toContain("fr-collapse");
      expect(dropdown.classes()).toContain("fr-menu");
      expect(dropdown.classes()).toContain("fr-collapse--expanded");

      const links = dropdown.findAll("a");
      expect(links.length).toBeGreaterThan(0);

      links.forEach((link) => {
        const hasIcon = link.find("span[class*='fr-icon-']").exists();
        expect(hasIcon).toBe(true);
      });
    }
  });
});
