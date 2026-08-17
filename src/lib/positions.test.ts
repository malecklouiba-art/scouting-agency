import { describe, expect, it } from "vitest";
import { positionCodeFromLabel, positionCodeFromSource, positionLabel } from "./positions";

describe("positionCodeFromSource", () => {
  it("maps known Transfermarkt English labels to internal codes", () => {
    expect(positionCodeFromSource("Centre-Back")).toBe("CB");
    expect(positionCodeFromSource("centre-back")).toBe("CB");
    expect(positionCodeFromSource("Left Winger")).toBe("LW");
    expect(positionCodeFromSource("Goalkeeper")).toBe("GK");
  });

  it("returns null for unknown labels", () => {
    expect(positionCodeFromSource("Unknown Position")).toBeNull();
    expect(positionCodeFromSource(null)).toBeNull();
  });
});

describe("positionCodeFromLabel", () => {
  it("matches the French label case- and accent-insensitively", () => {
    expect(positionCodeFromLabel("Défenseur central")).toBe("CB");
    expect(positionCodeFromLabel("defenseur central")).toBe("CB");
    expect(positionCodeFromLabel("DÉFENSEUR CENTRAL")).toBe("CB");
  });

  it("resolves unambiguous short aliases", () => {
    expect(positionCodeFromLabel("gardien")).toBe("GK");
    expect(positionCodeFromLabel("attaquant")).toBe("ST");
  });

  it("does not guess for ambiguous short terms", () => {
    expect(positionCodeFromLabel("défenseur")).toBeNull();
    expect(positionCodeFromLabel("milieu")).toBeNull();
    expect(positionCodeFromLabel("ailier")).toBeNull();
  });

  it("returns null for unknown labels", () => {
    expect(positionCodeFromLabel("pas un poste")).toBeNull();
    expect(positionCodeFromLabel(null)).toBeNull();
  });
});

describe("positionLabel", () => {
  it("returns the French label for a known code", () => {
    expect(positionLabel("CB")).toBe("Défenseur central");
  });

  it("falls back to the code itself when unknown", () => {
    expect(positionLabel("XX")).toBe("XX");
  });

  it("returns null when given null", () => {
    expect(positionLabel(null)).toBeNull();
  });
});
