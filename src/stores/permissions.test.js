import { afterEach, describe, it, expect, vi } from "vitest"
import { usePermissions } from "./permissions.js"
import { useRecordStore } from "./record.js"
import { useUserStore } from "./user.js"
import { ROLES } from "./user.js"
import { CERTIFICATION_STATE } from "../referentiels/ab.js"
import { createTestingPinia } from "@pinia/testing"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const permissions = usePermissions(pinia)
const recordStore = useRecordStore(pinia)
const user = useUserStore(pinia)

describe('roles', () => {
  afterEach(() => permissions.$reset())

  it('should be able to perform Operateur actions', () => {
    user.roles = [ROLES.OPERATEUR]

    expect(permissions.isAgri).toEqual(true)
    expect(permissions.canAddParcelle).toEqual(false)

    recordStore.record.certification_state = CERTIFICATION_STATE.OPERATOR_DRAFT

    expect(permissions.canAddParcelle).toEqual(true)
    expect(permissions.canDeleteFeature).toEqual(true)
    expect(permissions.canDeleteParcellaire).toEqual(true)
    expect(permissions.canChangeCulture).toEqual(true)
    expect(permissions.canAddParcelleNote).toEqual(true)
    expect(permissions.canChangeConversionLevel).toEqual(false)
    expect(permissions.canSaveAudit).toEqual(false)
    expect(permissions.canSendAudit).toEqual(false)
    expect(permissions.canCertify).toEqual(false)

    recordStore.record.certification_state = CERTIFICATION_STATE.AUDITED
    expect(permissions.canAddParcelle).toEqual(false)
    expect(permissions.canDeleteFeature).toEqual(false)
    expect(permissions.canDeleteParcellaire).toEqual(false)
    expect(permissions.canChangeCulture).toEqual(false)
    expect(permissions.canAddParcelleNote).toEqual(true /* false */)
    expect(permissions.canSaveAudit).toEqual(false)
    expect(permissions.canSendAudit).toEqual(false)
    expect(permissions.canCertify).toEqual(false)
  })

  it('should be able to perform Certification actions', () => {
    user.roles = [ROLES.OC_CERTIF]

    expect(permissions.isOc).toEqual(true)
    expect(permissions.canAddParcelle).toEqual(true)

    recordStore.record.certification_state = CERTIFICATION_STATE.OPERATOR_DRAFT

    expect(permissions.canAddParcelle).toEqual(true)
    expect(permissions.canDeleteFeature).toEqual(true)
    expect(permissions.canDeleteParcellaire).toEqual(true)
    expect(permissions.canChangeCulture).toEqual(true)
    expect(permissions.canAddParcelleNote).toEqual(true)
    expect(permissions.canChangeConversionLevel).toEqual(true)
    expect(permissions.canSaveAudit).toEqual(false)
    expect(permissions.canSendAudit).toEqual(false)
    expect(permissions.canCertify).toEqual(true)

    recordStore.record.certification_state = CERTIFICATION_STATE.AUDITED
    expect(permissions.canAddParcelle).toEqual(true)
    expect(permissions.canDeleteFeature).toEqual(true)
    expect(permissions.canDeleteParcellaire).toEqual(true)
    expect(permissions.canChangeCulture).toEqual(true)
    expect(permissions.canAddParcelleNote).toEqual(true)
    expect(permissions.canChangeConversionLevel).toEqual(true)
    expect(permissions.canSaveAudit).toEqual(false)
    expect(permissions.canSendAudit).toEqual(false)
    expect(permissions.canCertify).toEqual(true)
  })

  it('should be able to perform Auditeur actions', () => {
    user.roles = [ROLES.OC_AUDIT]

    expect(permissions.isOc).toEqual(true)
    expect(permissions.canAddParcelle).toEqual(true)

    recordStore.record.certification_state = CERTIFICATION_STATE.OPERATOR_DRAFT

    expect(permissions.canAddParcelle).toEqual(true)
    expect(permissions.canDeleteFeature).toEqual(true)
    expect(permissions.canDeleteParcellaire).toEqual(true)
    expect(permissions.canChangeCulture).toEqual(true)
    expect(permissions.canAddParcelleNote).toEqual(true)
    expect(permissions.canChangeConversionLevel).toEqual(true)
    expect(permissions.canSaveAudit).toEqual(true)
    expect(permissions.canSendAudit).toEqual(true)
    expect(permissions.canCertify).toEqual(false)

    recordStore.record.certification_state = CERTIFICATION_STATE.AUDITED
    expect(permissions.canAddParcelle).toEqual(true)
    expect(permissions.canDeleteFeature).toEqual(true)
    expect(permissions.canDeleteParcellaire).toEqual(true)
    expect(permissions.canChangeCulture).toEqual(true)
    expect(permissions.canAddParcelleNote).toEqual(true)
    expect(permissions.canChangeConversionLevel).toEqual(true)
    expect(permissions.canSaveAudit).toEqual(true)
    expect(permissions.canSendAudit).toEqual(true)
    expect(permissions.canCertify).toEqual(false)
  })

  it('unknwon role cannot do anything', () => {
    user.roles = [ROLES.UNKNOWN]

    expect(permissions.isAgri).toEqual(false)
    expect(permissions.isOc).toEqual(false)
    expect(permissions.canAddParcelle).toEqual(false)
    expect(permissions.canDeleteFeature).toEqual(false)

    recordStore.record.certification_state = CERTIFICATION_STATE.OPERATOR_DRAFT

    expect(permissions.canAddParcelle).toEqual(false)
    expect(permissions.canDeleteFeature).toEqual(false)
    expect(permissions.canDeleteParcellaire).toEqual(false)
    expect(permissions.canChangeCulture).toEqual(false)
    expect(permissions.canAddParcelleNote).toEqual(true /* false */)
    expect(permissions.canChangeConversionLevel).toEqual(false)
    expect(permissions.canSaveAudit).toEqual(false)
    expect(permissions.canSendAudit).toEqual(false)
    expect(permissions.canCertify).toEqual(false)

    recordStore.record.certification_state = CERTIFICATION_STATE.AUDITED
    expect(permissions.canAddParcelle).toEqual(false)
    expect(permissions.canDeleteFeature).toEqual(false)
    expect(permissions.canDeleteParcellaire).toEqual(false)
    expect(permissions.canChangeCulture).toEqual(false)
    expect(permissions.canAddParcelleNote).toEqual(true /* false */)
  })
})
