import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { config, flushPromises, mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import axios from "axios";
import { usePermissions } from "@/stores/permissions.js";
import { ROLES, useUserStore } from "@/stores/user.js";

import operatorJson from "@/utils/__fixtures__/operator-for-card.json";
import Card from "@/components/operator/Card.vue";
import { notificationsStateLevel } from "@/referentiels/ab.js";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const permissions = usePermissions(pinia);
const user = useUserStore(pinia);

describe("Card", () => {
  beforeEach(() => {
    axios.post.mockResolvedValue({
      data: {
        operator: { ...operatorJson, epingle: !operatorJson.epingle },
      },
    });
  });

  afterEach(() => {
    user.$reset();
    permissions.$reset();
    vi.unstubAllEnvs();
  });

  test("I'm the current oc and have other parcellaire", async () => {
    const { record_id, audit_date, certification_date_debut, certification_state, ...operator } = operatorJson;
    const wrapper = mount(Card, {
      props: {
        operator: operator,
        operatorDisabled: {},
        certificationState: certification_state,
        certificationDateDebut: certification_date_debut,
        auditDate: audit_date,
        record_id: record_id,
        organismeOc: operator.organismeCertificateur,
      },
    });

    await flushPromises();

    expect(wrapper.find(".badge-inline").text()).toContain(
      notificationsStateLevel[operator.notifications.etatCertification].label,
    );

    expect(wrapper.find(".fr-card__title").text()).toContain(operator.nom);
    expect(wrapper.find(".fr-card__desc").text()).toContain(operator.codePostal);
    expect(wrapper.find(".fr-card__desc").text()).toContain(operator.commune);
    expect(wrapper.findAll(".row").length).toEqual(3);
    expect(wrapper.find(".lastcertifieddate").text()).toEqual("2024");
    expect(wrapper.findAll(".row")[1].text()).toContain("Contrôle réalisé");
    expect(wrapper.findAll(".row")[1].text()).toContain("13/09/2024");
    expect(wrapper.findAll(".row")[2].text()).toContain("Certifié");
    expect(wrapper.findAll(".row")[2].text()).toContain("11/09/2024");

    expect(wrapper.find(".error-icon > span").text()).toEqual("!");
    expect(wrapper.find(".tooltip > p").exists()).toEqual(true);
  });

  test("I'm the current oc and have no other parcellaire", async () => {
    const { record_id, audit_date, certification_date_debut, certification_state, ...operator } = operatorJson;
    operator.otherParcellaire = null;
    const wrapper = mount(Card, {
      props: {
        operator: operator,
        operatorDisabled: {},
        certificationState: certification_state,
        certificationDateDebut: certification_date_debut,
        auditDate: audit_date,
        record_id: record_id,
        organismeOc: operator.organismeCertificateur,
      },
    });

    await flushPromises();

    expect(wrapper.find(".badge-inline").text()).toContain(
      notificationsStateLevel[operator.notifications.etatCertification].label,
    );

    expect(wrapper.find(".disabled-tooltip").exists()).toEqual(false);

    expect(wrapper.find(".fr-card__title").text()).toContain(operator.nom);
    expect(wrapper.find(".fr-card__desc").text()).toContain(operator.codePostal);
    expect(wrapper.find(".fr-card__desc").text()).toContain(operator.commune);
    expect(wrapper.findAll(".row").length).toEqual(3);
    expect(wrapper.find(".lastcertifieddate").text()).toEqual("2024");
    expect(wrapper.findAll(".row")[1].text()).toContain("Contrôle réalisé");
    expect(wrapper.findAll(".row")[1].text()).toContain("13/09/2024");
    expect(wrapper.findAll(".row")[2].text()).toContain("Certifié");
    expect(wrapper.findAll(".row")[2].text()).toContain("11/09/2024");

    expect(wrapper.find(".error-icon").exists()).toEqual(false);
  });

  test("Operator is disabled", async () => {
    const { record_id, audit_date, certification_date_debut, certification_state, ...operator } = operatorJson;
    operator.notifications.etatCertification = "NON ENGAGEE";
    operator.otherParcellaire = null;
    const wrapper = mount(Card, {
      props: {
        operator: operator,
        operatorDisabled: { 1234: true },
        certificationState: certification_state,
        certificationDateDebut: certification_date_debut,
        auditDate: audit_date,
        record_id: record_id,
        organismeOc: operator.organismeCertificateur,
      },
    });

    await flushPromises();
    expect(wrapper.find(".disabled-tooltip").exists()).toEqual(true);
    expect(wrapper.find(".ri-pushpin-line").exists()).toEqual(false);

    expect(wrapper.find(".fr-card__footer p").exists()).toEqual(true);
    expect(wrapper.find(".fr-card__footer p").text()).toContain("portail de notification");
  });

  test("I'm not the current oc", async () => {
    user.roles = [ROLES.OC_AUDIT];
    user.user.organismeCertificateur = {
      id: 2,
      nom: "Un autre",
    };
    const { record_id, audit_date, certification_date_debut, certification_state, ...operator } = operatorJson;
    const wrapper = mount(Card, {
      props: {
        operator: operator,
        operatorDisabled: {},
        certificationState: certification_state,
        certificationDateDebut: certification_date_debut,
        auditDate: audit_date,
        record_id: record_id,
        organismeOc: {
          id: 2,
          nom: "Un autre",
        },
      },
    });

    await flushPromises();

    expect(wrapper.find(".badge-inline").text()).toContain(notificationsStateLevel["ARRETEE"].label);
    expect(wrapper.find(".badge-inline").text()).toContain("Changement d'OC");

    expect(wrapper.find(".fr-card__title").text()).toContain(operator.nom);
    expect(wrapper.find(".fr-card__desc").text()).toContain(operator.codePostal);
    expect(wrapper.find(".fr-card__desc").text()).toContain(operator.commune);

    expect(wrapper.findAll(".row").length).toEqual(0);

    expect(wrapper.find(".fr-card__footer p").exists()).toEqual(true);
  });

  test("Pin / unpin", async () => {
    const { record_id, audit_date, certification_date_debut, certification_state, ...operator } = operatorJson;
    const wrapper = mount(Card, {
      props: {
        operator: operator,
        operatorDisabled: {},
        certificationState: certification_state,
        certificationDateDebut: certification_date_debut,
        auditDate: audit_date,
        record_id: record_id,
        organismeOc: operator.organismeCertificateur,
      },
    });

    await flushPromises();

    expect(wrapper.find(".ri-pushpin-line").exists()).toEqual(true);

    await wrapper.find(".ri-pushpin-line").trigger("click");
    await flushPromises();

    expect(wrapper.find(".ri-pushpin-fill").exists()).toEqual(true);

    await wrapper.find(".ri-pushpin-fill").trigger("click");
    await flushPromises();

    expect(wrapper.find(".ri-pushpin-line").exists()).toEqual(true);
  });

  test("Go to exploitation", async () => {
    const mockPush = vi.fn();
    config.global.plugins[1].push = mockPush;

    const { record_id, audit_date, certification_date_debut, certification_state, ...operator } = operatorJson;
    const wrapper = mount(Card, {
      props: {
        operator: operator,
        operatorDisabled: {},
        certificationState: certification_state,
        certificationDateDebut: certification_date_debut,
        auditDate: audit_date,
        record_id: record_id,
        organismeOc: operator.organismeCertificateur,
      },
    });

    await flushPromises();

    expect(wrapper.find(".fr-card__body").exists()).toEqual(true);

    await wrapper.find(".fr-card__body").trigger("click");
    await flushPromises();
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  test("Click on arrow exploitation", async () => {
    const mockPush = vi.fn();
    config.global.plugins[1].push = mockPush;

    const { record_id, audit_date, certification_date_debut, certification_state, ...operator } = operatorJson;
    const wrapper = mount(Card, {
      props: {
        operator: operator,
        operatorDisabled: {},
        certificationState: certification_state,
        certificationDateDebut: certification_date_debut,
        auditDate: audit_date,
        record_id: record_id,
        organismeOc: operator.organismeCertificateur,
      },
    });

    await flushPromises();

    expect(wrapper.find(".fr-icon-arrow-right-line").exists()).toEqual(true);

    await wrapper.find(".fr-icon-arrow-right-line").trigger("click");
    await flushPromises();
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  test("Can't click on disabled exploitation", async () => {
    const mockPush = vi.fn();
    config.global.plugins[1].push = mockPush;

    const { record_id, audit_date, certification_date_debut, certification_state, ...operator } = operatorJson;
    const wrapper = mount(Card, {
      props: {
        operator: operator,
        operatorDisabled: { 1234: true },
        certificationState: certification_state,
        certificationDateDebut: certification_date_debut,
        auditDate: audit_date,
        record_id: record_id,
        organismeOc: operator.organismeCertificateur,
      },
    });

    await flushPromises();

    expect(wrapper.find(".fr-card__body").exists()).toEqual(true);
    expect(wrapper.find(".fr-icon-arrow-right-line").exists()).toEqual(false);

    await wrapper.find(".fr-card__body").trigger("click");
    await flushPromises();
    expect(wrapper.vm.tooltip).toEqual({ visible: true, operatorId: operator.id });
    await wrapper.find(".fr-card__body").trigger("click");
    await flushPromises();
    expect(wrapper.vm.tooltip).toEqual({ visible: false, operatorId: null });
    expect(mockPush).toHaveBeenCalledTimes(0);
  });

  test("Go to specific version audited", async () => {
    const mockPush = vi.fn();
    config.global.plugins[1].push = mockPush;

    const { record_id, audit_date, certification_date_debut, ...operator } = operatorJson;
    const wrapper = mount(Card, {
      props: {
        operator: operator,
        operatorDisabled: {},
        certificationState: "AUDITED",
        certificationDateDebut: certification_date_debut,
        auditDate: audit_date,
        record_id: record_id,
        organismeOc: operator.organismeCertificateur,
      },
    });

    await flushPromises();

    expect(wrapper.find(".fr-icon-arrow-right-up-line").exists()).toEqual(true);
    expect(wrapper.find(".fr-icon-arrow-right-up-line").text()).toContain("Soumettre");

    await wrapper.find(".fr-icon-arrow-right-up-line").trigger("click");
    await flushPromises();
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  test("Go to specific version draft", async () => {
    const mockPush = vi.fn();
    config.global.plugins[1].push = mockPush;

    const { record_id, audit_date, certification_date_debut, ...operator } = operatorJson;
    const wrapper = mount(Card, {
      props: {
        operator: operator,
        operatorDisabled: {},
        certificationState: "OPERATOR_DRAFT",
        certificationDateDebut: certification_date_debut,
        auditDate: audit_date,
        record_id: record_id,
        organismeOc: operator.organismeCertificateur,
      },
    });

    await flushPromises();

    expect(wrapper.find(".fr-icon-arrow-right-up-line").exists()).toEqual(true);
    expect(wrapper.find(".fr-icon-arrow-right-up-line").text()).toContain("Contrôler");

    await wrapper.find(".fr-icon-arrow-right-up-line").trigger("click");
    await flushPromises();
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  test("Can't go to specific version with no record id", async () => {
    const mockPush = vi.fn();
    config.global.plugins[1].push = mockPush;

    const { audit_date, certification_date_debut, ...operator } = operatorJson;
    const wrapper = mount(Card, {
      props: {
        operator: operator,
        operatorDisabled: {},
        certificationState: "OPERATOR_DRAFT",
        certificationDateDebut: certification_date_debut,
        auditDate: audit_date,
        record_id: null,
        organismeOc: operator.organismeCertificateur,
      },
    });

    await flushPromises();

    expect(wrapper.find(".fr-icon-arrow-right-up-line").exists()).toEqual(true);
    expect(wrapper.find(".fr-icon-arrow-right-up-line").text()).toContain("Contrôler");

    await wrapper.find(".fr-icon-arrow-right-up-line").trigger("click");
    await flushPromises();
    expect(mockPush).toHaveBeenCalledTimes(0);
  });
});
