"use client";

import {
  getSpecimenVisual,
  LUME_SPECIMENS,
  LUME_TOTAL_SPECIMENS,
  type LumeSpecimen,
} from "@lume/data/specimens";
import { LU } from "@lume/data/tokens";
import { useRouter } from "next/navigation";
import { type CSSProperties, useEffect } from "react";
import { useLocale, useLume } from "../../components/lume-provider";
import { LumeSpecimen as LumeSpecimenView } from "../../components/specimen/lume-specimen";

/**
 * Completion reveal — `/complete`.
 *
 * The visitor lands here once they've reached 23/23. Three layers stack
 * over the deep canvas:
 *   - a slowly-rotating conic halo + central glow,
 *   - a scattered grid of all 23 specimens fading in with a small
 *     stagger so the field-guide reads as full,
 *   - the localized 'you found all twenty-three' copy and a
 *     'View your card' button that records the finalSeen flag and
 *     routes to /card.
 *
 * Animation is CSS transform + opacity only (no layout writes), and
 * `prefers-reduced-motion: reduce` snaps the entire composition to its
 * settled state on first paint.
 *
 * Visitors who arrive at /complete without 23/23 are redirected to
 * /index so the reveal is never spoiled.
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
  gap: 8,
  textAlign: "center",
};

const EYEBROW_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.accent.mint,
};

const CENTER_STYLE: CSSProperties = {
  position: "relative",
  alignSelf: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "min(82vw, 380px)",
  aspectRatio: "1 / 1",
};

const NUMERAL_STACK_STYLE: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
};

const NUMERAL_STYLE: CSSProperties = {
  fontSize: 96,
  fontWeight: 700,
  letterSpacing: -3,
  color: LU.base.ink,
  lineHeight: 0.9,
  textShadow: "0 0 24px rgba(126, 240, 196, 0.45)",
};

const NUMERAL_SUB_LABEL_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 2.6,
  textTransform: "uppercase",
  color: LU.base.ink2,
  textShadow: "0 0 18px rgba(126, 240, 196, 0.28)",
};

const TITLE_STYLE: CSSProperties = {
  fontSize: 28,
  fontWeight: 600,
  letterSpacing: -0.4,
  margin: 0,
  textAlign: "center",
  maxWidth: 360,
};

const BODY_STYLE: CSSProperties = {
  color: LU.base.ink2,
  fontSize: 15,
  lineHeight: 1.5,
  textAlign: "center",
  maxWidth: 380,
  margin: "8px auto 0",
};

const FOOTER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  alignItems: "center",
};

const PRIMARY_STYLE: CSSProperties = {
  appearance: "none",
  border: `1px solid ${LU.accent.mint}`,
  background: "rgba(126, 240, 196, 0.16)",
  color: LU.base.ink,
  padding: "16px 24px",
  borderRadius: 999,
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: 0.4,
  cursor: "pointer",
  width: "min(320px, 100%)",
  boxShadow: "0 0 0 1px rgba(126, 240, 196, 0.35)",
};

/**
 * Stagger the specimen-cluster reveal: each tile lights up at a slightly
 * later moment, with a deterministic offset derived from its position so
 * the composition feels orchestrated rather than random.
 */
function specimenClusterPosition(specimen: LumeSpecimen, index: number) {
  // Distribute across the bounding circle in a deterministic spiral.
  const angle = (index / LUME_TOTAL_SPECIMENS) * Math.PI * 2 + index * 0.18;
  const radius = 0.32 + ((index * 13) % 18) / 50; // 0.32..0.68 of half-edge
  const x = 50 + Math.cos(angle) * radius * 100; // percent of container
  const y = 50 + Math.sin(angle) * radius * 100;
  return { x, y, delay: 80 + index * 60, hue: specimen.hue };
}

export default function CompletePage() {
  const router = useRouter();
  const { hydrated, completion, markFinalSeen } = useLume();
  const { lang, t } = useLocale();

  // Redirect visitors who landed here without reaching 23/23.
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!completion) {
      router.replace("/index");
    }
  }, [hydrated, completion, router]);

  // Mark the reveal as seen once we know the visitor really has 23/23.
  useEffect(() => {
    if (!(hydrated && completion)) {
      return;
    }
    markFinalSeen();
  }, [hydrated, completion, markFinalSeen]);

  return (
    <main style={PAGE_STYLE}>
      <header style={HEADER_STYLE}>
        <span style={EYEBROW_STYLE}>{t.complete_eyebrow}</span>
      </header>

      <section style={CENTER_STYLE}>
        <span
          aria-hidden="true"
          className="lume-complete-halo"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: LU.aurora.halo,
            filter: "blur(40px)",
            opacity: 0.7,
          }}
        />
        <span
          aria-hidden="true"
          className="lume-complete-numeral"
          style={NUMERAL_STACK_STYLE}
        >
          <span style={NUMERAL_STYLE}>23</span>
          <span style={NUMERAL_SUB_LABEL_STYLE}>
            {t.complete_light_forms_lit}
          </span>
        </span>
        {LUME_SPECIMENS.map((s, i) => {
          const pos = specimenClusterPosition(s, i);
          const visual = getSpecimenVisual(s, lang);
          return (
            <span
              aria-hidden="true"
              className="lume-complete-tile"
              key={s.qr}
              style={
                {
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  opacity: 0,
                  animationDelay: `${pos.delay}ms`,
                } as CSSProperties
              }
            >
              <LumeSpecimenView
                form={s.form}
                glow={0.6}
                hue={s.hue}
                image={visual.kind === "image" ? visual : undefined}
                size={28}
              />
            </span>
          );
        })}
      </section>

      <div>
        <h1 style={TITLE_STYLE}>{t.complete_title}</h1>
        <p style={BODY_STYLE}>{t.complete_body}</p>
      </div>

      <footer style={FOOTER_STYLE}>
        <button
          onClick={() => router.push("/card")}
          style={PRIMARY_STYLE}
          type="button"
        >
          {t.complete_view_card}
        </button>
      </footer>

      <style>{`
        @keyframes lume-complete-tile-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes lume-complete-numeral-in {
          from { opacity: 0; transform: scale(0.85); filter: blur(8px); }
          to   { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes lume-complete-halo-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .lume-complete-tile {
          animation: lume-complete-tile-in 720ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .lume-complete-numeral {
          animation: lume-complete-numeral-in 680ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .lume-complete-halo {
          animation: lume-complete-halo-spin 36s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .lume-complete-tile {
            opacity: 1 !important;
            animation: none !important;
            transform: translate(-50%, -50%) !important;
          }
          .lume-complete-numeral {
            opacity: 1 !important;
            animation: none !important;
            transform: none !important;
            filter: none !important;
          }
          .lume-complete-halo {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
