import { afterEach, describe, it, expect, vi } from "vitest";
import { usePermissions } from "./permissions.js";
import { useRecordStore } from "./record.js";
import { useUserStore } from "./user.js";
import { ROLES } from "./user.js";
import { CertificationState } from "@agencebio/cartobio-types";
import { createTestingPinia } from "@pinia/testing";

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
const permissions = usePermissions(pinia);
const recordStore = useRecordStore(pinia);
const userStore = useUserStore(pinia);

describe("roles", () => {
  afterEach(() => permissions.$reset());

  it("should be able to perform Operateur actions", () => {
    userStore.roles = [ROLES.OPERATEUR];
    userStore.user = { organismeCertificateur: { id: 2 } };

    expect(permissions.isAgri).toEqual(true);
    expect(permissions.canAddParcelle).toEqual(false);

    recordStore.record.certification_state = CertificationState.OPERATOR_DRAFT;

    expect(permissions.canAddParcelle).toEqual(true);
    expect(permissions.canDeleteFeature).toEqual(true);
    expect(permissions.canDeleteParcellaire).toEqual(true);
    expect(permissions.canChangeCulture).toEqual(true);
    expect(permissions.canChangeConversionLevel).toEqual(false);
    expect(permissions.canSaveAudit).toEqual(false);
    expect(permissions.canSendAudit).toEqual(false);
    expect(permissions.canCertify).toEqual(false);

    recordStore.record.certification_state = CertificationState.AUDITED;
    expect(permissions.canAddParcelle).toEqual(false);
    expect(permissions.canDeleteFeature).toEqual(false);
    expect(permissions.canDeleteParcellaire).toEqual(false);
    expect(permissions.canChangeCulture).toEqual(false);
    expect(permissions.canSaveAudit).toEqual(false);
    expect(permissions.canSendAudit).toEqual(false);
    expect(permissions.canCertify).toEqual(false);
  });

  it("should be able to perform Certification actions", () => {
    userStore.roles = [ROLES.OC_CERTIF];
    userStore.user = { organismeCertificateur: { id: 2 } };

    expect(permissions.isOc).toEqual(true);
    expect(permissions.canAddParcelle).toEqual(true);

    userStore.user = { organismeCertificateur: { id: 2 } };
    recordStore.record.oc_id = 1;

    expect(permissions.canAddParcelle).toEqual(false);
    expect(permissions.canDeleteFeature).toEqual(false);
    expect(permissions.canDeleteParcellaire).toEqual(false);
    expect(permissions.canChangeCulture).toEqual(false);
    expect(permissions.canChangeConversionLevel).toEqual(false);

    userStore.user = { organismeCertificateur: { id: 1 } };
    recordStore.record.certification_state = CertificationState.OPERATOR_DRAFT;

    expect(permissions.canAddParcelle).toEqual(true);
    expect(permissions.canDeleteFeature).toEqual(true);
    expect(permissions.canDeleteParcellaire).toEqual(true);
    expect(permissions.canChangeCulture).toEqual(true);
    expect(permissions.canChangeConversionLevel).toEqual(true);
    expect(permissions.canSaveAudit).toEqual(false);
    expect(permissions.canSendAudit).toEqual(false);
    expect(permissions.canCertify).toEqual(true);

    recordStore.record.certification_state = CertificationState.AUDITED;
    expect(permissions.canAddParcelle).toEqual(true);
    expect(permissions.canDeleteFeature).toEqual(true);
    expect(permissions.canDeleteParcellaire).toEqual(true);
    expect(permissions.canChangeCulture).toEqual(true);
    expect(permissions.canChangeConversionLevel).toEqual(true);
    expect(permissions.canSaveAudit).toEqual(false);
    expect(permissions.canSendAudit).toEqual(false);
    expect(permissions.canCertify).toEqual(true);
  });

  it("should be able to perform Auditeur actions", () => {
    userStore.roles = [ROLES.OC_AUDIT];
    userStore.user = { organismeCertificateur: { id: 2 } };

    expect(permissions.isOc).toEqual(true);
    expect(permissions.canAddParcelle).toEqual(true);

    recordStore.record.certification_state = CertificationState.OPERATOR_DRAFT;
    userStore.user = { organismeCertificateur: { id: 1 } };
    recordStore.record.oc_id = 1;

    expect(permissions.canAddParcelle).toEqual(true);
    expect(permissions.canDeleteFeature).toEqual(true);
    expect(permissions.canDeleteParcellaire).toEqual(true);
    expect(permissions.canChangeCulture).toEqual(true);
    expect(permissions.canChangeConversionLevel).toEqual(true);
    expect(permissions.canSaveAudit).toEqual(true);
    expect(permissions.canSendAudit).toEqual(true);
    expect(permissions.canCertify).toEqual(false);

    recordStore.record.certification_state = CertificationState.AUDITED;
    expect(permissions.canAddParcelle).toEqual(true);
    expect(permissions.canDeleteFeature).toEqual(true);
    expect(permissions.canDeleteParcellaire).toEqual(true);
    expect(permissions.canChangeCulture).toEqual(true);
    expect(permissions.canChangeConversionLevel).toEqual(true);
    expect(permissions.canSaveAudit).toEqual(true);
    expect(permissions.canSendAudit).toEqual(true);
    expect(permissions.canCertify).toEqual(false);
  });

  it("unknwon role cannot do anything", () => {
    userStore.roles = [ROLES.UNKNOWN];
    userStore.user = { organismeCertificateur: { id: 2 } };

    expect(permissions.isAgri).toEqual(false);
    expect(permissions.isOc).toEqual(false);
    expect(permissions.canAddParcelle).toEqual(false);
    expect(permissions.canDeleteFeature).toEqual(false);

    recordStore.record.certification_state = CertificationState.OPERATOR_DRAFT;

    expect(permissions.canAddParcelle).toEqual(false);
    expect(permissions.canDeleteFeature).toEqual(false);
    expect(permissions.canDeleteParcellaire).toEqual(false);
    expect(permissions.canChangeCulture).toEqual(false);
    expect(permissions.canChangeConversionLevel).toEqual(false);
    expect(permissions.canSaveAudit).toEqual(false);
    expect(permissions.canSendAudit).toEqual(false);
    expect(permissions.canCertify).toEqual(false);

    recordStore.record.certification_state = CertificationState.AUDITED;
    expect(permissions.canAddParcelle).toEqual(false);
    expect(permissions.canDeleteFeature).toEqual(false);
    expect(permissions.canDeleteParcellaire).toEqual(false);
    expect(permissions.canChangeCulture).toEqual(false);
  });
});
