import { describe, it, expect } from "vitest";
import { deriveRolesFromGroups, ROLES } from "./user.js";

describe("deriveRolesFromGroups()", () => {
  it("derives GUEST role if not logged in", () => {
    expect(deriveRolesFromGroups({})).toEqual([ROLES.GUEST]);
  });

  it("derives groups from a known role", () => {
    expect(
      deriveRolesFromGroups({
        id: 1,
        groups: [
          {
            id: 1,
            nom: "Super OC",
          },
          {
            id: 2,
            nom: "Chargé de certification",
          },
          // this one will be ignored
          {
            id: 9999,
            nom: "Rôle farfelu",
          },
        ],
      }),
    ).toEqual([ROLES.OC_CERTIF, ROLES.OC_AUDIT]);
  });

  it("derives groups from an unknown role", () => {
    expect(
      deriveRolesFromGroups({
        id: 1,
        groups: [
          {
            id: 9999,
            nom: "Rôle farfelu",
          },
        ],
      }),
    ).toEqual([ROLES.UNKNOWN]);
  });

  it("works without groups being part of the token (old connections)", () => {
    expect(
      deriveRolesFromGroups({
        id: 1,
        mainGroup: {
          id: 1,
          nom: "Super OC",
        },
      }),
    ).toEqual([ROLES.OC_CERTIF, ROLES.OC_AUDIT]);
  });
});
