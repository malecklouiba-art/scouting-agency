import { describe, expect, it } from "vitest";
import {
  isLoanTransfer,
  parseDate,
  parseFoot,
  parseHeightCm,
  parseMarketValueEur,
  parseShirtNumber,
  parseTransferFee,
} from "./parsers";

describe("parseMarketValueEur", () => {
  it("parses millions", () => {
    expect(parseMarketValueEur("€180.00m")).toBe(180_000_000);
  });

  it("parses thousands", () => {
    expect(parseMarketValueEur("€850k")).toBe(850_000);
  });

  it("returns null for unknown values", () => {
    expect(parseMarketValueEur("-")).toBeNull();
    expect(parseMarketValueEur(null)).toBeNull();
    expect(parseMarketValueEur(undefined)).toBeNull();
  });
});

describe("parseTransferFee", () => {
  it("treats loan and free-transfer labels as no fee", () => {
    expect(parseTransferFee("loan transfer")).toBeNull();
    expect(parseTransferFee("free transfer")).toBeNull();
  });

  it("treats placeholder values as no fee", () => {
    expect(parseTransferFee("-")).toBeNull();
    expect(parseTransferFee("?")).toBeNull();
  });

  it("parses a real fee", () => {
    expect(parseTransferFee("€60.00m")).toBe(60_000_000);
  });
});

describe("isLoanTransfer", () => {
  it("detects loan wording case-insensitively", () => {
    expect(isLoanTransfer("End of loan")).toBe(true);
    expect(isLoanTransfer("LOAN")).toBe(true);
  });

  it("returns false for a normal fee", () => {
    expect(isLoanTransfer("€5.00m")).toBe(false);
  });
});

describe("parseHeightCm", () => {
  it("parses European comma decimal", () => {
    expect(parseHeightCm("1,85 m")).toBe(185);
  });

  it("parses dot decimal", () => {
    expect(parseHeightCm("1.85 m")).toBe(185);
  });

  it("returns null when missing", () => {
    expect(parseHeightCm(null)).toBeNull();
  });
});

describe("parseFoot", () => {
  it("maps known values case-insensitively", () => {
    expect(parseFoot("right")).toBe("RIGHT");
    expect(parseFoot("Left")).toBe("LEFT");
    expect(parseFoot("BOTH")).toBe("BOTH");
  });

  it("returns null for unknown values", () => {
    expect(parseFoot("unknown")).toBeNull();
    expect(parseFoot(null)).toBeNull();
  });
});

describe("parseDate", () => {
  it("parses common date formats", () => {
    expect(parseDate("Jul 5, 2000")?.toISOString().slice(0, 10)).toBe("2000-07-05");
    expect(parseDate("2000-07-05")?.toISOString().slice(0, 10)).toBe("2000-07-05");
  });

  it("returns null for unparseable input", () => {
    expect(parseDate("not a date")).toBeNull();
    expect(parseDate(null)).toBeNull();
  });
});

describe("parseShirtNumber", () => {
  it("parses a numeric string", () => {
    expect(parseShirtNumber("9")).toBe(9);
  });

  it("returns null for missing or invalid input", () => {
    expect(parseShirtNumber(null)).toBeNull();
    expect(parseShirtNumber("")).toBeNull();
  });
});
