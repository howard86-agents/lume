import { describe, expect, test } from "bun:test";
import {
  extractQrSlug,
  getSpecimenByNumber,
  getSpecimenByQrPayload,
  LUME_SPECIMENS,
  LUME_SPECIMENS_BY_FLOOR,
  LUME_TOTAL_SPECIMENS,
  SAMPLE_FOUND,
} from "./specimens";

describe("LUME_SPECIMENS catalogue", () => {
  test("contains exactly 23 specimens", () => {
    expect(LUME_SPECIMENS.length).toBe(LUME_TOTAL_SPECIMENS);
    expect(LUME_TOTAL_SPECIMENS).toBe(23);
  });

  test("uses 1..23 visitor numbers without gaps", () => {
    const numbers = LUME_SPECIMENS.map((s) => s.number).sort((a, b) => a - b);
    expect(numbers).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23,
    ]);
  });

  test("uses unique QR slugs", () => {
    const slugs = new Set(LUME_SPECIMENS.map((s) => s.qr));
    expect(slugs.size).toBe(LUME_SPECIMENS.length);
  });

  test("only uses floors 1..4 with at least one specimen each", () => {
    for (const floor of [1, 2, 3, 4] as const) {
      expect(LUME_SPECIMENS_BY_FLOOR[floor].length).toBeGreaterThan(0);
    }
    const allOnKnownFloors = LUME_SPECIMENS.every(
      (s) => s.floor >= 1 && s.floor <= 4
    );
    expect(allOnKnownFloors).toBe(true);
  });

  test("provides names + notes for every supported locale", () => {
    for (const s of LUME_SPECIMENS) {
      for (const locale of ["en", "zh-tw", "zh-cn", "ja", "ko"] as const) {
        expect(s.name[locale].length).toBeGreaterThan(0);
        expect(s.notes[locale].length).toBeGreaterThan(0);
      }
    }
  });

  test("SAMPLE_FOUND references real specimen numbers", () => {
    for (const n of SAMPLE_FOUND) {
      expect(getSpecimenByNumber(n)).toBeDefined();
    }
  });
});

describe("getSpecimenByNumber", () => {
  test("returns the specimen for a valid number", () => {
    const s = getSpecimenByNumber(1);
    expect(s?.number).toBe(1);
  });

  test("returns undefined outside 1..23", () => {
    expect(getSpecimenByNumber(0)).toBeUndefined();
    expect(getSpecimenByNumber(24)).toBeUndefined();
    expect(getSpecimenByNumber(-3)).toBeUndefined();
  });

  test("returns undefined for non-integer input", () => {
    expect(getSpecimenByNumber(1.5)).toBeUndefined();
    expect(getSpecimenByNumber(Number.NaN)).toBeUndefined();
    expect(getSpecimenByNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
  });
});

describe("extractQrSlug", () => {
  test("returns a bare slug as-is, lowercased", () => {
    expect(extractQrSlug("lu-08-mirage")).toBe("lu-08-mirage");
    expect(extractQrSlug("LU-08-MIRAGE")).toBe("lu-08-mirage");
    expect(extractQrSlug("  lu-08-mirage  ")).toBe("lu-08-mirage");
  });

  test("extracts the c= param from a full URL", () => {
    expect(extractQrSlug("https://lume.example/scan?c=lu-09-comet")).toBe(
      "lu-09-comet"
    );
  });

  test("extracts the c= param from a relative path", () => {
    expect(extractQrSlug("/scan?c=lu-13-rosa")).toBe("lu-13-rosa");
  });

  test("rejects empty and whitespace-only payloads", () => {
    expect(extractQrSlug("")).toBeUndefined();
    expect(extractQrSlug("   ")).toBeUndefined();
  });

  test("rejects payloads without a c= param and without slug shape", () => {
    expect(extractQrSlug("hello world")).toBeUndefined();
    expect(extractQrSlug("https://lume.example/")).toBeUndefined();
  });
});

describe("getSpecimenByQrPayload", () => {
  test("resolves a known bare slug", () => {
    const s = getSpecimenByQrPayload("lu-01-aurum");
    expect(s?.number).toBe(1);
  });

  test("resolves a known URL payload", () => {
    const s = getSpecimenByQrPayload("https://lume.example/scan?c=lu-23-keep");
    expect(s?.number).toBe(23);
  });

  test("returns undefined for an unknown slug", () => {
    expect(getSpecimenByQrPayload("lu-99-unknown")).toBeUndefined();
  });

  test("returns undefined for nonsense input", () => {
    expect(getSpecimenByQrPayload("definitely not a code")).toBeUndefined();
  });
});
