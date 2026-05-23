"use client";

import {
  getSpecimenVisual,
  LUME_SPECIMENS,
  LUME_TOTAL_SPECIMENS,
  type LumeSpecimen,
} from "@lume/data/specimens";
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
 * /collection so the reveal is never spoiled.
 */

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
      router.replace("/collection");
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
    <main className="relative flex min-h-[var(--lu-screen-h)] flex-col justify-between overflow-hidden bg-aurora-cover px-6 pt-[max(48px,env(safe-area-inset-top))] pb-[max(40px,env(safe-area-inset-bottom))] text-ink">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="font-mono-lu text-[11px] text-mint uppercase tracking-[3px]">
          {t.complete_eyebrow}
        </span>
      </header>

      <section
        className="relative flex w-[min(82vw,380px)] items-center justify-center self-center"
        style={{ aspectRatio: "1 / 1" }}
      >
        <span
          aria-hidden="true"
          className="lume-complete-halo absolute inset-0 rounded-[50%] bg-aurora-halo opacity-[0.7] blur-[40px]"
        />
        <span
          aria-hidden="true"
          className="lume-complete-numeral relative flex flex-col items-center gap-[6px]"
        >
          <span className="font-bold text-[96px] text-ink leading-[0.9] tracking-[-3px] [text-shadow:0_0_24px_rgba(126,240,196,0.45)]">
            23
          </span>
          <span className="font-mono-lu text-[11px] text-ink-2 uppercase tracking-[2.6px] [text-shadow:0_0_18px_rgba(126,240,196,0.28)]">
            {t.complete_light_forms_lit}
          </span>
        </span>
        {LUME_SPECIMENS.map((s, i) => {
          const pos = specimenClusterPosition(s, i);
          const visual = getSpecimenVisual(s, lang);
          return (
            <span
              aria-hidden="true"
              className="lume-complete-tile absolute"
              key={s.qr}
              style={
                {
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
        <h1 className="m-0 max-w-[360px] text-center font-semibold text-[28px] tracking-[-0.4px]">
          {t.complete_title}
        </h1>
        <p className="mx-auto mt-2 max-w-[380px] text-center text-[15px] text-ink-2 leading-normal">
          {t.complete_body}
        </p>
      </div>

      <footer className="flex flex-col items-center gap-3">
        <button
          className="w-[min(320px,100%)] cursor-pointer appearance-none rounded-full border border-rule-strong bg-glass-3 px-6 py-4 font-semibold text-base text-ink tracking-[0.4px]"
          onClick={() => router.push("/card")}
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
