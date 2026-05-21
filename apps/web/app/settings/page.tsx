"use client";

import {
  LUME_LOCALE_LABELS,
  LUME_LOCALES,
  type LumeLocale,
} from "@lume/data/locales";
import { LU } from "@lume/data/tokens";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, useState } from "react";
import { useLocale, useLume } from "../../components/lume-provider";

/**
 * Settings menu — `/settings`.
 *
 * Reachable from the index dock (and any other surface that wires it up
 * via a Link). Three responsibilities:
 *
 *   - language switching that updates the active locale live across
 *     every consumer of useLocale(),
 *   - 'reset progress' that clears the persisted state behind a
 *     confirmation dialog, and
 *   - the 'progress is kept on this device' recovery note the brief
 *     calls out so visitors understand why their state survives a
 *     refresh and what they're losing on reset.
 */

const PAGE_STYLE: CSSProperties = {
  minHeight: "100dvh",
  background: LU.aurora.page,
  color: LU.base.ink,
  display: "flex",
  flexDirection: "column",
  padding:
    "max(40px, env(safe-area-inset-top)) 20px max(40px, env(safe-area-inset-bottom))",
  gap: 24,
};

const HEADER_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const TITLE_STYLE: CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: -0.3,
  margin: 0,
};

const SECTION_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const SECTION_HEADING_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.base.ink2,
  margin: 0,
};

const ROW_STYLE: CSSProperties = {
  appearance: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "16px 18px",
  borderRadius: 16,
  border: `1px solid ${LU.rule.hair}`,
  background: LU.glass.surface1,
  color: LU.base.ink,
  fontSize: 16,
  textAlign: "left",
  cursor: "pointer",
};

const SELECTED_ROW_STYLE: CSSProperties = {
  ...ROW_STYLE,
  border: `1px solid ${LU.accent.amber}`,
  background: "rgba(255, 183, 85, 0.10)",
  boxShadow: "0 0 0 1px rgba(255, 183, 85, 0.35)",
};

const RESET_BUTTON_STYLE: CSSProperties = {
  ...ROW_STYLE,
  border: "1px solid rgba(255, 141, 161, 0.45)",
  color: LU.accent.rose,
  background: "rgba(255, 141, 161, 0.08)",
  fontWeight: 600,
};

const NOTE_STYLE: CSSProperties = {
  fontSize: 13,
  color: LU.base.ink3,
  lineHeight: 1.55,
  margin: 0,
  paddingLeft: 4,
};

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

// Confirmation dialog styles (reused from the manual-entry dialog look).
const CONFIRM_BACKDROP_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(8, 8, 13, 0.65)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const CONFIRM_DIALOG_STYLE: CSSProperties = {
  width: "100%",
  maxWidth: 420,
  background: LU.glass.surface3,
  border: `1px solid ${LU.rule.strong}`,
  borderRadius: 24,
  padding: "24px 24px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const CONFIRM_TITLE_STYLE: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 600,
};

const CONFIRM_BODY_STYLE: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.5,
  color: LU.base.ink2,
};

const CONFIRM_ACTIONS_STYLE: CSSProperties = {
  display: "flex",
  gap: 12,
  justifyContent: "flex-end",
};

const CONFIRM_RESET_STYLE: CSSProperties = {
  appearance: "none",
  border: `1px solid ${LU.accent.rose}`,
  background: "rgba(255, 141, 161, 0.16)",
  color: LU.base.ink,
  padding: "12px 20px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const CONFIRM_CANCEL_STYLE: CSSProperties = {
  appearance: "none",
  border: "none",
  background: "transparent",
  color: LU.base.ink2,
  padding: "12px 20px",
  fontSize: 14,
  cursor: "pointer",
};

export default function SettingsPage() {
  const router = useRouter();
  const { reset } = useLume();
  const { lang, setLang, t } = useLocale();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const onResetConfirmed = () => {
    reset();
    setConfirmOpen(false);
    router.replace("/");
  };

  return (
    <main style={PAGE_STYLE}>
      <header style={HEADER_STYLE}>
        <h1 style={TITLE_STYLE}>{t.settings_title}</h1>
        <Link
          aria-label={t.settings_close}
          href="/index"
          style={{
            color: LU.base.ink2,
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          {t.settings_close}
        </Link>
      </header>

      <section style={SECTION_STYLE}>
        <h2 style={SECTION_HEADING_STYLE}>{t.settings_language}</h2>
        <fieldset
          style={{
            border: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <legend style={SR_ONLY_STYLE}>{t.settings_language}</legend>
          {LUME_LOCALES.map((code) => {
            const labels = LUME_LOCALE_LABELS[code];
            const selected = lang === code;
            return (
              <label
                key={code}
                style={selected ? SELECTED_ROW_STYLE : ROW_STYLE}
              >
                <input
                  checked={selected}
                  name="lume-settings-language"
                  onChange={() => setLang(code as LumeLocale)}
                  style={SR_ONLY_STYLE}
                  type="radio"
                  value={code}
                />
                <span
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <span style={{ fontSize: 16, fontWeight: 600 }}>
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
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: `1px solid ${selected ? LU.accent.amber : LU.rule.strong}`,
                    background: selected ? LU.accent.amber : "transparent",
                  }}
                />
              </label>
            );
          })}
        </fieldset>
      </section>

      <section style={SECTION_STYLE}>
        <h2 style={SECTION_HEADING_STYLE}>{t.settings_reset}</h2>
        <button
          onClick={() => setConfirmOpen(true)}
          style={RESET_BUTTON_STYLE}
          type="button"
        >
          <span>{t.settings_reset}</span>
          <span aria-hidden="true">→</span>
        </button>
        <p style={NOTE_STYLE}>{t.settings_progress_note}</p>
      </section>

      {confirmOpen ? (
        <div aria-modal="true" role="dialog" style={CONFIRM_BACKDROP_STYLE}>
          <div style={CONFIRM_DIALOG_STYLE}>
            <h2 style={CONFIRM_TITLE_STYLE}>
              {t.settings_reset_confirm_title}
            </h2>
            <p style={CONFIRM_BODY_STYLE}>{t.settings_reset_confirm_body}</p>
            <div style={CONFIRM_ACTIONS_STYLE}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={CONFIRM_CANCEL_STYLE}
                type="button"
              >
                {t.settings_reset_confirm_cancel}
              </button>
              <button
                onClick={onResetConfirmed}
                style={CONFIRM_RESET_STYLE}
                type="button"
              >
                {t.settings_reset_confirm_yes}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
