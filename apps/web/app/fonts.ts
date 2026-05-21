import {
  Geist_Mono,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Space_Grotesk,
} from "next/font/google";

/**
 * Lume font pipeline.
 *
 * The display + mono pair (Space Grotesk, Geist Mono) is preloaded so the
 * cover and shared chrome render with the right type from the first paint.
 *
 * The four CJK families (Noto Sans TC/SC/JP/KR) each have huge glyph
 * coverage and are only needed when their locale is active, so they're
 * registered with `preload: false`. Fetching is deferred until something
 * actually applies the matching CSS variable, keeping the cover screen
 * lightweight for the en/zh-* default audiences.
 *
 * Each family exposes a CSS custom property (`--font-display`,
 * `--font-mono`, `--font-noto-tc`, etc.) that `globals.css` consumes via
 * `font-family` chains.
 */
export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

export const fontNotoTC = Noto_Sans_TC({
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-tc",
  display: "swap",
  preload: false,
});

export const fontNotoSC = Noto_Sans_SC({
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sc",
  display: "swap",
  preload: false,
});

export const fontNotoJP = Noto_Sans_JP({
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-jp",
  display: "swap",
  preload: false,
});

export const fontNotoKR = Noto_Sans_KR({
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-kr",
  display: "swap",
  preload: false,
});

/** Concatenated CSS variable class list to apply on `<html>` or `<body>`. */
export const fontVariables = [
  fontDisplay.variable,
  fontMono.variable,
  fontNotoTC.variable,
  fontNotoSC.variable,
  fontNotoJP.variable,
  fontNotoKR.variable,
].join(" ");
