"use client";

import { useLocale } from "../components/lume-provider";
import { useViewTransitionRouter } from "../lib/use-view-transition-router";

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

const HALO_SIZE = 320;

export default function CoverPage() {
  const { navigate } = useViewTransitionRouter();
  const { t } = useLocale();
  return (
    <main className="relative flex min-h-[var(--lu-screen-h)] flex-col justify-between overflow-hidden bg-aurora-cover px-6 pt-[max(48px,env(safe-area-inset-top))] pb-[max(40px,env(safe-area-inset-bottom))] text-ink">
      <header
        className="flex flex-col items-center gap-3 text-center"
        data-stagger
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <span className="font-mono-lu text-[11px] text-amber uppercase tracking-[3px] [text-shadow:0_0_18px_var(--lu-accent-amber)]">
          {t.cover_special_exhibition}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2.5 font-mono-lu text-[11px] text-ink-2 uppercase tracking-[3px]">
          <span
            aria-hidden="true"
            className="h-[5px] w-[5px] rounded-full bg-amber shadow-[0_0_12px_var(--lu-accent-amber)]"
          />
          <span>{t.cover_eyebrow_specimens}</span>
          <span aria-hidden="true" className="text-ink-3">
            ·
          </span>
          <span>{t.cover_eyebrow_floors}</span>
        </div>
      </header>

      <section
        className="flex flex-col items-center gap-8"
        data-stagger
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <div className="relative flex h-80 w-80 items-center justify-center">
          <span
            aria-hidden="true"
            className="lume-cover-halo absolute inset-0 rounded-full bg-aurora-halo opacity-[0.85] blur-[24px]"
          />
          <span
            aria-hidden="true"
            className="absolute rounded-full blur-[8px]"
            style={{
              inset: HALO_SIZE * 0.15,
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 65%)",
            }}
          />
          <h1 className="relative m-0 font-bold text-[88px] text-ink leading-none tracking-[-2px] [text-shadow:0_0_24px_rgba(255,255,255,0.18)]">
            {t.cover_title}
          </h1>
        </div>
        <p className="mx-auto max-w-[360px] text-center text-base text-ink-2 leading-normal">
          {t.cover_intro}
        </p>
      </section>

      <footer
        className="flex flex-col items-center gap-4"
        data-stagger
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <button
          className="lu-press w-[min(320px,100%)] cursor-pointer appearance-none rounded-full border border-rule-strong bg-glass-3 px-8 py-4 font-semibold text-base text-ink tracking-[0.4px] backdrop-blur-[12px]"
          onClick={() => navigate("/language")}
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
