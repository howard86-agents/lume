"use client";

import {
  LUME_LOCALE_LABELS,
  LUME_LOCALES,
  type LumeLocale,
} from "@lume/data/locales";
import { LU } from "@lume/data/tokens";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useLocale } from "../../components/lume-provider";

/**
 * Language picker — `/language`.
 *
 * Lists the five supported locales as glassy selectable rows with the
 * active one highlighted in amber. Selection persists via the provider
 * immediately (so the screen updates live), and Continue advances to
 * the onboarding primer.
 */

const PAGE_STYLE: CSSProperties = {
  minHeight: "100dvh",
  background: LU.aurora.page,
  color: LU.base.ink,
  display: "flex",
  flexDirection: "column",
  padding:
    "max(48px, env(safe-area-inset-top)) 24px max(40px, env(safe-area-inset-bottom))",
  gap: 24,
};

const HEADER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const STEP_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.base.ink3,
};

const TITLE_STYLE: CSSProperties = {
  fontSize: 28,
  fontWeight: 600,
  letterSpacing: -0.4,
  margin: 0,
};

const SUBTITLE_STYLE: CSSProperties = {
  color: LU.base.ink2,
  fontSize: 15,
  lineHeight: 1.45,
  margin: 0,
};

const LIST_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 8,
};

const baseRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "18px 20px",
  borderRadius: 18,
  border: `1px solid ${LU.rule.hair}`,
  background: LU.glass.surface1,
  color: LU.base.ink,
  fontSize: 16,
  textAlign: "left",
  cursor: "pointer",
  appearance: "none",
};

const selectedRowStyle: CSSProperties = {
  ...baseRowStyle,
  border: `1px solid ${LU.accent.amber}`,
  background: "rgba(255, 183, 85, 0.10)",
  boxShadow: "0 0 0 1px rgba(255, 183, 85, 0.35)",
};

const FOOTER_STYLE: CSSProperties = {
  marginTop: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const CONTINUE_STYLE: CSSProperties = {
  appearance: "none",
  border: `1px solid ${LU.rule.strong}`,
  background: LU.glass.surface3,
  color: LU.base.ink,
  padding: "16px 24px",
  borderRadius: 999,
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: 0.4,
  cursor: "pointer",
  width: "100%",
};

const SKIP_STYLE: CSSProperties = {
  appearance: "none",
  background: "transparent",
  color: LU.base.ink2,
  border: "none",
  padding: "8px",
  fontSize: 14,
  cursor: "pointer",
  alignSelf: "center",
};

/** Visually-hidden style for radio inputs we render with a custom UI. */
const SR_ONLY_STYLE: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function LanguagePage() {
  const router = useRouter();
  const { lang, setLang, t } = useLocale();
  const proceed = () => router.push("/onboarding");
  return (
    <main style={PAGE_STYLE}>
      <header style={HEADER_STYLE}>
        <span style={STEP_STYLE}>{t.language_step}</span>
        <h1 style={TITLE_STYLE}>{t.language_title}</h1>
        <p style={SUBTITLE_STYLE}>{t.language_subtitle}</p>
      </header>

      <fieldset
        style={{
          ...LIST_STYLE,
          border: "none",
          margin: 0,
          padding: 0,
          minInlineSize: "auto",
        }}
      >
        <legend style={SR_ONLY_STYLE}>{t.language_title}</legend>
        {LUME_LOCALES.map((code) => {
          const labels = LUME_LOCALE_LABELS[code];
          const selected = lang === code;
          return (
            <label
              key={code}
              style={selected ? selectedRowStyle : baseRowStyle}
            >
              <input
                checked={selected}
                name="lume-language"
                onChange={() => setLang(code as LumeLocale)}
                style={SR_ONLY_STYLE}
                type="radio"
                value={code}
              />
              <span
                style={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <span style={{ fontSize: 17, fontWeight: 600 }}>
                  {labels.native}
                </span>
                <span
                  style={{
                    fontFamily: "var(--lu-font-mono)",
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: LU.base.ink3,
                  }}
                >
                  {labels.latin}
                </span>
              </span>
              <span
                aria-hidden="true"
                style={{
                  alignItems: "center",
                  background: "transparent",
                  border: `1px solid ${selected ? LU.accent.amber : LU.rule.strong}`,
                  borderRadius: "50%",
                  boxShadow: selected
                    ? "0 0 12px rgba(255, 183, 85, 0.65)"
                    : "none",
                  display: "flex",
                  height: 18,
                  justifyContent: "center",
                  width: 18,
                }}
              >
                <span
                  style={{
                    background: LU.accent.amber,
                    borderRadius: "50%",
                    boxShadow: selected
                      ? "0 0 8px rgba(255, 183, 85, 0.75)"
                      : "none",
                    height: 6,
                    opacity: selected ? 1 : 0,
                    width: 6,
                  }}
                />
              </span>
            </label>
          );
        })}
      </fieldset>

      <footer style={FOOTER_STYLE}>
        <button onClick={proceed} style={CONTINUE_STYLE} type="button">
          {t.language_continue}
        </button>
        <button onClick={proceed} style={SKIP_STYLE} type="button">
          {t.language_skip}
        </button>
      </footer>
    </main>
  );
}
