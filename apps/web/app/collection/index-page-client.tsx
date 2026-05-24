"use client";

import {
  getSpecimenVisual,
  LUME_SPECIMENS_BY_FLOOR,
  LUME_TOTAL_SPECIMENS,
  type LumeFloor,
  type LumeSpecimen,
} from "@lume/data/specimens";
import { LU } from "@lume/data/tokens";
import Link from "next/link";
import { useRef } from "react";
import { useLocale, useLume } from "../../components/lume-provider";
import { LumeSpecimen as LumeSpecimenView } from "../../components/specimen/lume-specimen";
import { setMorphOrigin } from "../../lib/morph-origin";
import { useInViewport } from "../../lib/use-in-viewport";
import { useViewTransitionRouter } from "../../lib/use-view-transition-router";

/**
 * Collection gallery — `/collection`.
 *
 * Renders the visitor's full field guide grouped by floor (1..4):
 *   - header carries the NN/23 count and a thin progress bar,
 *   - each floor section shows its own found/total count and a 3-column
 *     grid of specimen tiles (found vs locked variants from
 *     LumeSpecimen),
 *   - tapping a found tile routes to /specimen/[n] for the detail
 *     plate (handled by issue #19),
 *   - bottom dock shows "Scan" until 23/23, then flips to a mint-styled
 *     "View card" that takes the visitor to /card.
 */

const FLOORS: readonly LumeFloor[] = [1, 2, 3, 4];

interface SpecimenTileProps {
  found: boolean;
  lockedLabel: string;
  specimen: LumeSpecimen;
}

function SpecimenTile({ specimen, found, lockedLabel }: SpecimenTileProps) {
  const { lang } = useLocale();
  const { navigate } = useViewTransitionRouter();
  const tileRef = useRef<HTMLDivElement>(null);
  const inView = useInViewport(tileRef);
  const number = String(specimen.number).padStart(2, "0");
  const visual = getSpecimenVisual(specimen, lang);
  const specimenName = specimen.name[lang];
  const tileBody = (
    <>
      <span className="absolute top-2.5 left-2.5 z-[2] font-mono-lu text-[10px] text-ink-3 uppercase tracking-[1.4px]">
        NO. {number}
      </span>
      {found ? (
        <span className="inline-flex" data-hero>
          <LumeSpecimenView
            form={specimen.form}
            found
            glow={0.55}
            hue={specimen.hue}
            image={visual.kind === "image" ? visual : undefined}
            index={specimen.number}
            paused={!inView}
            size={68}
          />
        </span>
      ) : (
        <span className="inline-flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-rule-strong border-dashed opacity-[0.72]">
          <LumeSpecimenView
            form={specimen.form}
            found={false}
            glow={0.22}
            hue={specimen.hue}
            size={54}
          />
        </span>
      )}
      {found ? (
        <span className="absolute right-2.5 bottom-2.5 left-2.5 z-[2] text-left font-semibold text-ink text-xs leading-[1.15]">
          {specimenName}
        </span>
      ) : (
        <span className="absolute right-2.5 bottom-2.5 left-2.5 z-[2] text-left font-medium text-ink-3 text-xs leading-[1.15]">
          {lockedLabel}
        </span>
      )}
    </>
  );
  if (found) {
    return (
      <div ref={tileRef}>
        <Link
          aria-label={`${specimenName} (no. ${number})`}
          className="lu-press lu-lift relative flex aspect-square min-h-0 cursor-pointer items-center justify-center overflow-hidden rounded-[18px] border border-rule-hair bg-glass-1 p-3 text-ink no-underline"
          href={`/specimen/${specimen.number}`}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey) {
              return;
            }
            e.preventDefault();
            const hero =
              e.currentTarget.querySelector<HTMLElement>("[data-hero]");
            if (hero) {
              setMorphOrigin(specimen.number, hero);
            }
            navigate(`/specimen/${specimen.number}`, { mode: "morph" });
          }}
        >
          {tileBody}
        </Link>
      </div>
    );
  }
  return (
    <div ref={tileRef}>
      <div
        className="relative flex aspect-square min-h-0 cursor-default items-center justify-center overflow-hidden rounded-[18px] border border-rule-hair bg-glass-1 p-3 text-ink no-underline"
        title={lockedLabel}
      >
        {tileBody}
      </div>
    </div>
  );
}

export function IndexPageClient() {
  const { navigate } = useViewTransitionRouter();
  const { collectedNumbers, collectedCount, completion, state } = useLume();
  const { format, lang, t } = useLocale();

  const dockOnClick = () => {
    if (completion) {
      // Loop visitors through the reveal once before the card; on
      // subsequent taps go straight to the card.
      navigate(state.finalSeen ? "/card" : "/complete");
      return;
    }
    navigate("/scan", { mode: "sheet" });
  };

  const progressPct = Math.min(
    100,
    Math.round((collectedCount / LUME_TOTAL_SPECIMENS) * 100)
  );

  return (
    <main className="flex min-h-[var(--lu-screen-h)] flex-col gap-[28px] bg-aurora-page p-[max(40px,env(safe-area-inset-top))_20px_max(112px,env(safe-area-inset-bottom))] text-ink">
      <header
        className="flex flex-col gap-2"
        data-stagger
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div
              className={
                lang === "en"
                  ? "whitespace-nowrap font-bold text-[11px] text-amber uppercase leading-[1.2] tracking-[0.12em]"
                  : "whitespace-nowrap font-bold text-[11px] text-amber leading-[1.2] tracking-[0.04em]"
              }
            >
              {t.index_your_sky}
            </div>
            <h1 className="m-0 font-semibold text-[24px] tracking-[-0.3px]">
              {t.index_title}
            </h1>
          </div>
          <button
            aria-label={t.settings_title}
            className="lu-press inline-flex h-9 w-9 items-center justify-center rounded-full border border-rule-hair bg-glass-1 text-ink-2"
            onClick={() => navigate("/settings", { mode: "sheet" })}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              role="img"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
              width="18"
            >
              <title>{t.settings_title}</title>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
        <div className="flex items-baseline justify-between font-mono-lu text-ink-2 text-xs uppercase tracking-[2px]">
          <span>
            {format("index_progress", {
              found: collectedCount,
              total: LUME_TOTAL_SPECIMENS,
            })}
          </span>
          <span className="text-ink-3">{progressPct}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-glass-2">
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: completion
                ? LU.accent.mint
                : `linear-gradient(90deg, ${LU.accent.cyan} 0%, ${LU.accent.amber} 100%)`,
              transition: "width var(--lu-dur-base) var(--lu-ease-out)",
            }}
          />
        </div>
      </header>

      {FLOORS.map((floor, floorIndex) => {
        const specimens = LUME_SPECIMENS_BY_FLOOR[floor];
        const foundOnFloor = specimens.filter((s) =>
          collectedNumbers.has(s.number)
        ).length;
        return (
          <section
            data-stagger
            key={floor}
            style={{ "--i": floorIndex + 1 } as React.CSSProperties}
          >
            <header className="mb-3 flex items-baseline justify-between">
              <span className="font-mono-lu text-[11px] text-ink-2 uppercase tracking-[3px]">
                {format("index_floor_label", { floor })}
              </span>
              <span className="font-mono-lu text-[11px] text-ink-3">
                {format("index_floor_count", {
                  found: foundOnFloor,
                  total: specimens.length,
                })}
              </span>
            </header>
            <div className="grid grid-cols-3 gap-3">
              {specimens.map((s) => (
                <SpecimenTile
                  found={collectedNumbers.has(s.number)}
                  key={s.number}
                  lockedLabel={t.index_locked_label}
                  specimen={s}
                />
              ))}
            </div>
          </section>
        );
      })}

      <nav
        className="fixed right-0 bottom-0 left-0 z-10 flex justify-center"
        style={{
          padding: "12px 20px max(20px, env(safe-area-inset-bottom)) 20px",
          background:
            "linear-gradient(180deg, rgba(8,8,13,0) 0%, rgba(8,8,13,0.85) 30%, #08080d 100%)",
        }}
      >
        <button
          className={
            completion
              ? "lu-press lu-lift grid w-[min(420px,100%)] cursor-pointer appearance-none grid-cols-[44px_1fr_44px] items-center gap-2.5 rounded-full border border-mint bg-[rgba(126,240,196,0.16)] px-3 py-2.5 font-bold font-mono-lu text-[13px] text-mint uppercase tracking-[1.6px] shadow-[0_0_0_1px_rgba(126,240,196,0.35)] backdrop-blur-[12px]"
              : "lu-press lu-lift grid w-[min(420px,100%)] cursor-pointer appearance-none grid-cols-[44px_1fr_44px] items-center gap-2.5 rounded-full border-[1px] border-[rgba(255,183,85,0.45)] bg-[rgba(255,183,85,0.14)] px-3 py-2.5 font-bold font-mono-lu text-[13px] text-amber uppercase tracking-[1.6px] shadow-[0_0_0_1px_rgba(255,183,85,0.18)] backdrop-blur-[12px]"
          }
          onClick={dockOnClick}
          type="button"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-current"
          >
            <svg
              className="text-deep"
              fill="none"
              height="18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
              width="18"
            >
              <title>{t.index_dock_scan}</title>
              <path d="M4 8.5h3l1.6-2h6.8l1.6 2h3v10H4z" />
              <circle cx="12" cy="13.5" r="3.2" />
            </svg>
          </span>
          <span>{completion ? t.index_dock_card : t.index_dock_scan}</span>
          <span aria-hidden="true" className="justify-self-end">
            <svg
              fill="none"
              height="22"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
              width="22"
            >
              <title>
                {completion ? t.index_dock_card : t.index_dock_scan}
              </title>
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </button>
      </nav>
    </main>
  );
}
