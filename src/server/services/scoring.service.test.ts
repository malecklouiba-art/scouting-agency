import { describe, expect, it } from "vitest";
import { scorePlayer } from "./scoring.service";
import type { PlayerSearchCriteria } from "./search.service";

function player(overrides: {
  position?: string | null;
  secondaryPositions?: string[];
  dateOfBirth?: Date | null;
  nationality?: string | null;
}) {
  return {
    position: overrides.position ?? null,
    secondaryPositions: overrides.secondaryPositions ?? [],
    dateOfBirth: overrides.dateOfBirth ?? null,
    nationality: overrides.nationality ?? null,
  };
}

function agedYears(age: number): Date {
  const now = new Date();
  return new Date(now.getFullYear() - age, now.getMonth(), now.getDate());
}

describe("scorePlayer", () => {
  it("scores 100 when no criteria are given", () => {
    const result = scorePlayer(player({ position: "CB" }), {});
    expect(result.score).toBe(100);
    expect(result.breakdown).toHaveLength(0);
  });

  it("gives full position points for an exact match", () => {
    const criteria: PlayerSearchCriteria = { position: "CB" };
    const result = scorePlayer(player({ position: "CB" }), criteria);
    expect(result.score).toBe(100);
  });

  it("gives partial credit for a secondary position match", () => {
    const criteria: PlayerSearchCriteria = { position: "CB" };
    const result = scorePlayer(player({ position: "LB", secondaryPositions: ["CB"] }), criteria);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });

  it("scores 0 when position doesn't match at all", () => {
    const criteria: PlayerSearchCriteria = { position: "CB" };
    const result = scorePlayer(player({ position: "ST" }), criteria);
    expect(result.score).toBe(0);
  });

  it("gives full age points inside the requested range", () => {
    const criteria: PlayerSearchCriteria = { ageMin: 18, ageMax: 23 };
    const result = scorePlayer(player({ dateOfBirth: agedYears(20) }), criteria);
    expect(result.score).toBe(100);
  });

  it("degrades age score the further outside the range", () => {
    const criteria: PlayerSearchCriteria = { ageMin: 18, ageMax: 23 };
    const closeMiss = scorePlayer(player({ dateOfBirth: agedYears(24) }), criteria);
    const farMiss = scorePlayer(player({ dateOfBirth: agedYears(30) }), criteria);
    expect(closeMiss.score).toBeGreaterThan(farMiss.score);
    expect(farMiss.score).toBe(0);
  });

  it("combines multiple criteria proportionally", () => {
    const criteria: PlayerSearchCriteria = { position: "CB", nationalities: ["France"] };
    const matchesBoth = scorePlayer(player({ position: "CB", nationality: "France" }), criteria);
    const matchesOne = scorePlayer(player({ position: "CB", nationality: "Brazil" }), criteria);
    expect(matchesBoth.score).toBe(100);
    expect(matchesOne.score).toBeGreaterThan(0);
    expect(matchesOne.score).toBeLessThan(100);
  });

  it("treats an unknown date of birth as not matching the age criterion", () => {
    const criteria: PlayerSearchCriteria = { ageMin: 18, ageMax: 23 };
    const result = scorePlayer(player({ dateOfBirth: null }), criteria);
    expect(result.score).toBe(0);
  });
});
