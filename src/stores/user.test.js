import { describe, it, expect } from "vitest";
import { deriveRoles, ROLES } from "./user.js";

describe("deriveRoles()", () => {
  it("derives GUEST role if not logged in", () => {
    expect(deriveRoles({})).toEqual([ROLES.GUEST]);
  });

  it("uses the roles computed by the API", () => {
    expect(deriveRoles({ id: 1, roles: [ROLES.OC_CERTIF, ROLES.OC_AUDIT] })).toEqual([ROLES.OC_CERTIF, ROLES.OC_AUDIT]);
  });

  it("derives UNKNOWN role without any CartoBio role", () => {
    expect(deriveRoles({ id: 1, roles: [] })).toEqual([ROLES.UNKNOWN]);
  });

  it("derives UNKNOWN role from a profile stored before the API computed roles", () => {
    expect(deriveRoles({ id: 1, mainGroup: { id: 3, nom: "Super OC" } })).toEqual([ROLES.UNKNOWN]);
  });
});
