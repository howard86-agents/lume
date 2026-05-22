"use client";

import { LU } from "@lume/data/tokens";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useLocale } from "../components/lume-provider";

/**
 * Cover screen — the landing surface at `/`.
 *
 * Renders the Lume aesthetic foundation: a central luminous glow over a
 * slowly-rotating conic halo, anchored by the exhibition eyebrow, the
 * "Lume." display, and the dot-row metadata ("23 light-forms / 4 floors"). The primary "Enter"
 * action takes the visitor into the language picker. Animation is a
 * single CSS transform/opacity rotation that respects
 * `prefers-reduced-motion`.
 */

const PAGE_STYLE: CSSProperties = {
  position: "relative",
  minHeight: "100dvh",
  background: LU.aurora.cover,
  color: LU.base.ink,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding:
    "max(48px, env(safe-area-inset-top)) 24px max(40px, env(safe-area-inset-bottom))",
  overflow: "hidden",
};

const HEADER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  textAlign: "center",
};

const SPECIAL_EXHIBITION_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.accent.amber,
  textShadow: `0 0 18px ${LU.accent.amber}`,
};

const EYEBROW_ROW_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  flexWrap: "wrap",
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.base.ink2,
};

const AMBER_DOT_STYLE: CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: "50%",
  background: LU.accent.amber,
  boxShadow: `0 0 12px ${LU.accent.amber}`,
};

const EYEBROW_SEPARATOR_STYLE: CSSProperties = {
  color: LU.base.ink3,
};

const HALO_SIZE = 320;

const HALO_WRAPPER_STYLE: CSSProperties = {
  position: "relative",
  width: HALO_SIZE,
  height: HALO_SIZE,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const TITLE_STYLE: CSSProperties = {
  fontSize: 88,
  fontWeight: 700,
  letterSpacing: -2,
  margin: 0,
  lineHeight: 1,
  color: LU.base.ink,
  textShadow: "0 0 24px rgba(255, 255, 255, 0.18)",
};

const INTRO_STYLE: CSSProperties = {
  maxWidth: 360,
  margin: "0 auto",
  textAlign: "center",
  color: LU.base.ink2,
  fontSize: 16,
  lineHeight: 1.5,
};

const FOOTER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
};

const ENTER_BUTTON_STYLE: CSSProperties = {
  appearance: "none",
  border: `1px solid ${LU.rule.strong}`,
  background: LU.glass.surface3,
  color: LU.base.ink,
  padding: "16px 32px",
  borderRadius: 999,
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: 0.4,
  width: "min(320px, 100%)",
  cursor: "pointer",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

export default function CoverPage() {
  const router = useRouter();
  const { t } = useLocale();
  return (
    <main style={PAGE_STYLE}>
      <header style={HEADER_STYLE}>
        <span style={SPECIAL_EXHIBITION_STYLE}>
          {t.cover_special_exhibition}
        </span>
        <div style={EYEBROW_ROW_STYLE}>
          <span aria-hidden="true" style={AMBER_DOT_STYLE} />
          <span>{t.cover_eyebrow_specimens}</span>
          <span aria-hidden="true" style={EYEBROW_SEPARATOR_STYLE}>
            ·
          </span>
          <span>{t.cover_eyebrow_floors}</span>
        </div>
      </header>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div style={HALO_WRAPPER_STYLE}>
          <span
            aria-hidden="true"
            className="lume-cover-halo"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: LU.aurora.halo,
              filter: "blur(24px)",
              opacity: 0.85,
            }}
          />
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: HALO_SIZE * 0.15,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 65%)",
              filter: "blur(8px)",
            }}
          />
          <h1 style={{ ...TITLE_STYLE, position: "relative" }}>
            {t.cover_title}
          </h1>
        </div>
        <p style={INTRO_STYLE}>{t.cover_intro}</p>
      </section>

      <footer style={FOOTER_STYLE}>
        <button
          onClick={() => router.push("/language")}
          style={ENTER_BUTTON_STYLE}
          type="button"
        >
          {t.cover_enter}
        </button>
      </footer>

      {/*
        Slow conic-halo rotation. Pulled into a <style jsx>-style element so
        it ships with the route bundle without needing an extra global rule.
        Reduced-motion preference disables the rotation entirely.
      */}
      <style>{`
        @keyframes lume-cover-halo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .lume-cover-halo {
          animation: lume-cover-halo-spin 32s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .lume-cover-halo {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
