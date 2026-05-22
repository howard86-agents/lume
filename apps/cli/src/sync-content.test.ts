import { describe, expect, test } from "bun:test";
import {
  buildSpecimenContentModule,
  parseSpecimenContentCsv,
  validateSpecimenContentRows,
} from "./sync-content";

const locales = ["en", "zh-tw", "zh-cn", "ja", "ko"] as const;
const expectedSpecimens = [
  { number: 1, qr: "lu-01-aurum" },
  { number: 2, qr: "lu-02-ember" },
] as const;

function row(qr: string, suffix = qr): string {
  return [
    qr,
    ...locales.flatMap((locale) => [
      `${locale} name ${suffix}`,
      `${locale} notes ${suffix}`,
    ]),
  ]
    .map((cell) => JSON.stringify(cell))
    .join(",");
}

const header = [
  "qr",
  ...locales.flatMap((locale) => [`name_${locale}`, `notes_${locale}`]),
].join(",");

describe("parseSpecimenContentCsv", () => {
  test("parses quoted published-sheet CSV cells", () => {
    const rows = parseSpecimenContentCsv(
      `${header}\n"lu-01-aurum","Aurum, warm","Line one\nLine two","金光","筆記","金光","笔记","金の灯","メモ","금빛","메모"\n`
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.qr).toBe("lu-01-aurum");
    expect(rows[0]?.name.en).toBe("Aurum, warm");
    expect(rows[0]?.notes.en).toBe("Line one\nLine two");
  });
});

describe("validateSpecimenContentRows", () => {
  test("fails loudly when a locale cell is missing", () => {
    const rows = parseSpecimenContentCsv(
      `${header}\n${row("lu-01-aurum")}\n${row("lu-02-ember").replace("ko notes lu-02-ember", "")}\n`
    );

    expect(() => validateSpecimenContentRows(rows, expectedSpecimens)).toThrow(
      "lu-02-ember: missing notes_ko"
    );
  });

  test("fails on unknown or missing specimen QR slugs instead of mutating identity", () => {
    const rows = parseSpecimenContentCsv(
      `${header}\n${row("lu-01-renamed")}\n${row("lu-02-ember")}\n`
    );

    expect(() => validateSpecimenContentRows(rows, expectedSpecimens)).toThrow(
      "unknown qr lu-01-renamed"
    );
    expect(() => validateSpecimenContentRows(rows, expectedSpecimens)).toThrow(
      "missing row for lu-01-aurum"
    );
  });
});

describe("buildSpecimenContentModule", () => {
  test("emits deterministic generated TypeScript in canonical specimen order", () => {
    const rows = parseSpecimenContentCsv(
      `${header}\n${row("lu-02-ember")}\n${row("lu-01-aurum")}\n`
    );

    const output = buildSpecimenContentModule(rows, expectedSpecimens);

    expect(output.indexOf('"lu-01-aurum"')).toBeLessThan(
      output.indexOf('"lu-02-ember"')
    );
    expect(output).toContain("export const LUME_SPECIMEN_CONTENT");
    expect(output).not.toContain("number:");
  });
});
