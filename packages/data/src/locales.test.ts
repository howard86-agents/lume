import { describe, expect, test } from "bun:test";
import {
  LUME_DEFAULT_LOCALE,
  LUME_LOCALE_BUNDLES,
  LUME_LOCALES,
  resolveBrowserLocale,
} from "./locales";

describe("cover locale copy", () => {
  test("includes the special exhibition eyebrow in every supported locale", () => {
    const expected = {
      en: "A SPECIAL EXHIBITION",
      "zh-tw": "特別展覽",
      "zh-cn": "特别展览",
      ja: "特別展",
      ko: "특별 전시",
    } as const;

    for (const locale of LUME_LOCALES) {
      expect(LUME_LOCALE_BUNDLES[locale].cover_special_exhibition).toBe(
        expected[locale]
      );
    }
  });
});

describe("locale bundles", () => {
  test("includes the permission pre-prompt eyebrow in every supported locale", () => {
    expect(
      Object.fromEntries(
        LUME_LOCALES.map((locale) => [
          locale,
          LUME_LOCALE_BUNDLES[locale].permission_before_we_begin,
        ])
      )
    ).toEqual({
      en: "BEFORE WE BEGIN",
      "zh-tw": "開始之前",
      "zh-cn": "开始之前",
      ja: "はじめる前に",
      ko: "시작하기 전에",
    });
  });
});

describe("resolveBrowserLocale", () => {
  test("maps Japanese browser tags to ja", () => {
    expect(resolveBrowserLocale("ja")).toBe("ja");
    expect(resolveBrowserLocale("ja-JP")).toBe("ja");
    expect(resolveBrowserLocale(["ja-JP", "en"])).toBe("ja");
  });

  test("maps Korean browser tags to ko", () => {
    expect(resolveBrowserLocale("ko")).toBe("ko");
    expect(resolveBrowserLocale("ko-KR")).toBe("ko");
  });

  test("maps Traditional Chinese script and regions to zh-tw", () => {
    expect(resolveBrowserLocale("zh-Hant")).toBe("zh-tw");
    expect(resolveBrowserLocale("zh-Hant-TW")).toBe("zh-tw");
    expect(resolveBrowserLocale("zh-TW")).toBe("zh-tw");
    expect(resolveBrowserLocale("zh-HK")).toBe("zh-tw");
  });

  test("maps Simplified Chinese script and regions to zh-cn", () => {
    expect(resolveBrowserLocale("zh-Hans")).toBe("zh-cn");
    expect(resolveBrowserLocale("zh-Hans-CN")).toBe("zh-cn");
    expect(resolveBrowserLocale("zh-CN")).toBe("zh-cn");
    expect(resolveBrowserLocale("zh-SG")).toBe("zh-cn");
  });

  test("maps English variants to en", () => {
    expect(resolveBrowserLocale("en")).toBe("en");
    expect(resolveBrowserLocale("en-US")).toBe("en");
    expect(resolveBrowserLocale("en-GB")).toBe("en");
  });

  test("falls back to the default locale for unsupported tags", () => {
    expect(resolveBrowserLocale("fr-FR")).toBe(LUME_DEFAULT_LOCALE);
    expect(resolveBrowserLocale("de")).toBe(LUME_DEFAULT_LOCALE);
    expect(resolveBrowserLocale("zh")).toBe(LUME_DEFAULT_LOCALE);
  });

  test("falls back to the default locale for empty / missing input", () => {
    expect(resolveBrowserLocale(undefined)).toBe(LUME_DEFAULT_LOCALE);
    expect(resolveBrowserLocale(null)).toBe(LUME_DEFAULT_LOCALE);
    expect(resolveBrowserLocale("")).toBe(LUME_DEFAULT_LOCALE);
    expect(resolveBrowserLocale([])).toBe(LUME_DEFAULT_LOCALE);
  });

  test("walks an ordered list and returns the first supported tag", () => {
    expect(resolveBrowserLocale(["fr-FR", "ja-JP", "en-US"])).toBe("ja");
    expect(resolveBrowserLocale(["zh", "zh-TW"])).toBe("zh-tw");
    expect(resolveBrowserLocale(["xx-YY", "ko"])).toBe("ko");
  });

  test("is case-insensitive and accepts underscores", () => {
    expect(resolveBrowserLocale("ZH-TW")).toBe("zh-tw");
    expect(resolveBrowserLocale("zh_hant_HK")).toBe("zh-tw");
    expect(resolveBrowserLocale("JA-jp")).toBe("ja");
  });
});

describe("scanner copy", () => {
  test("defines the scanning eyebrow and named duplicate toast in every locale", () => {
    expect(LUME_LOCALE_BUNDLES.en.scan_scanning).toBe("SCANNING");
    expect(
      LUME_LOCALE_BUNDLES.en.scan_result_dupe_named
        .replace("{name}", "Ferra")
        .replace("{n}", "007")
    ).toBe("Ferra (no. 007) — already in your index");

    expect(LUME_LOCALE_BUNDLES["zh-tw"].scan_scanning).toBe("掃描中");
    expect(LUME_LOCALE_BUNDLES["zh-cn"].scan_scanning).toBe("扫描中");
    expect(LUME_LOCALE_BUNDLES.ja.scan_scanning).toBe("スキャン中");
    expect(LUME_LOCALE_BUNDLES.ko.scan_scanning).toBe("스캔 중");

    for (const bundle of Object.values(LUME_LOCALE_BUNDLES)) {
      expect(bundle.scan_result_dupe_named).toContain("{name}");
      expect(bundle.scan_result_dupe_named).toContain("{n}");
    }
  });
});
