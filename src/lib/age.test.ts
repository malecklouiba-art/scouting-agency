import { describe, expect, it } from "vitest";
import { calculateAge } from "./age";

describe("calculateAge", () => {
  it("returns null when date of birth is unknown", () => {
    expect(calculateAge(null)).toBeNull();
  });

  it("computes age when the birthday already happened this year", () => {
    const now = new Date();
    const dateOfBirth = new Date(now.getFullYear() - 25, now.getMonth(), now.getDate());
    expect(calculateAge(dateOfBirth)).toBe(25);
  });

  it("does not count this year's birthday if it hasn't happened yet", () => {
    const now = new Date();
    // Anniversaire demain -> encore un an de moins qu'une simple soustraction d'année.
    const notYetBirthday = new Date(now.getFullYear() - 25, now.getMonth(), now.getDate() + 1);
    expect(calculateAge(notYetBirthday)).toBe(24);
  });
});
