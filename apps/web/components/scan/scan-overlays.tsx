"use client";

import {
  getSpecimenVisual,
  LUME_TOTAL_SPECIMENS,
  type LumeSpecimen,
} from "@lume/data/specimens";
import { LU } from "@lume/data/tokens";
import Link from "next/link";
import type { ReactElement } from "react";
import { useLocale } from "../lume-provider";
import { LumeSpecimen as LumeSpecimenView } from "../specimen/lume-specimen";

/**
 * Scan-result overlays.
 *
 * Three surfaces that rise over the scanner when collect() resolves:
 *   - SuccessSheet ('new'): a glassy bottom-sheet with the collected
 *     specimen as a glowing hero, the localized name + plate/floor/no.
 *     metadata, the field notes, the updated NN/23 progress bar, and
 *     two actions — View specimen (-> /specimen/[n]) and
 *     Continue scanning (which dismisses and resumes the loop),
 *   - DuplicateToast ('dupe'): an amber-tinted toast hovering near the
 *     bottom of the frame,
 *   - InvalidToast ('invalid'): a rose-tinted toast styled per the
 *     'code not recognised' design.
 *
 * Each overlay reads its copy from useLocale() and is purely
 * presentational — the overlay manager on /scan owns when to show them.
 */

interface SuccessSheetProps {
  collectedCount: number;
  onContinue: () => void;
  specimen: LumeSpecimen;
}

export function SuccessSheet({
  specimen,
  collectedCount,
  onContinue,
}: SuccessSheetProps): ReactElement {
  const { lang, t, format } = useLocale();
  const progressPct = Math.min(
    100,
    Math.round((collectedCount / LUME_TOTAL_SPECIMENS) * 100)
  );
  const visual = getSpecimenVisual(specimen, lang);
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center backdrop-blur-[8px]"
      role="dialog"
      style={{ background: "rgba(8, 8, 13, 0.55)" }}
    >
      <div className="relative w-full max-w-[480px]">
        <LumeSpecimenView
          form={specimen.form}
          glow={0.7}
          hue={specimen.hue}
          image={visual.kind === "image" ? visual : undefined}
          size={160}
          style={{
            position: "absolute",
            top: -84,
            left: "50%",
            zIndex: 1,
            transform: "translateX(-50%)",
            filter: "drop-shadow(0 30px 50px rgba(255, 183, 85, 0.18))",
          }}
        />
        <div className="flex w-full flex-col items-center gap-4 rounded-t-[28px] border border-rule-strong border-b-0 bg-glass-3 p-[96px_24px_max(24px,env(safe-area-inset-bottom))] text-center shadow-[0_-32px_96px_rgba(0,0,0,0.55)] backdrop-blur-[20px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,183,85,0.26)] bg-[rgba(255,183,85,0.10)] px-3 py-[7px] font-mono-lu font-semibold text-[11px] text-ink uppercase tracking-[1.4px] shadow-[0_0_24px_rgba(255,183,85,0.12)]">
            <span
              aria-hidden="true"
              className="h-[7px] w-[7px] rounded-full bg-amber shadow-[0_0_14px_rgba(255,183,85,0.9)]"
            />
            {t.scan_new_specimen}
          </span>
          <h2 className="m-0 font-semibold text-2xl tracking-[-0.3px]">
            {specimen.name[lang] ?? specimen.name.en}
          </h2>
          <p className="m-0 max-w-[360px] text-ink-2 text-sm leading-normal">
            {specimen.notes[lang] ?? specimen.notes.en}
          </p>
          <div className="flex w-full items-baseline justify-between">
            <span className="font-mono-lu text-[11px] text-ink-3 uppercase tracking-[2px]">
              {format("index_progress", {
                found: collectedCount,
                total: LUME_TOTAL_SPECIMENS,
              })}
            </span>
            <span className="font-mono-lu text-[11px] text-ink-3 uppercase tracking-[2px]">
              {progressPct}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-glass-2">
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${LU.accent.cyan} 0%, ${LU.accent.amber} 100%)`,
                boxShadow: "0 0 18px rgba(255, 183, 85, 0.78)",
                transition: "width 240ms ease-out",
              }}
            />
          </div>
          <div className="flex w-full gap-3">
            <button
              className="inline-flex flex-[1.18] cursor-pointer appearance-none items-center justify-center rounded-full border border-[rgba(246,246,251,0.88)] bg-ink px-4 py-[14px] font-semibold text-[15px] text-deep tracking-[0.4px] no-underline"
              onClick={onContinue}
              type="button"
            >
              {t.scan_continue}
            </button>
            <Link
              className="inline-flex flex-[0.82] cursor-pointer appearance-none items-center justify-center rounded-full border border-rule-strong bg-glass-3 px-4 py-[14px] font-semibold text-[15px] text-ink tracking-[0.4px] no-underline"
              href={`/specimen/${specimen.number}`}
            >
              {t.scan_view_specimen}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DuplicateToast({
  onDismiss,
  specimen,
}: {
  onDismiss: () => void;
  specimen?: LumeSpecimen;
}): ReactElement {
  const { format, lang, t } = useLocale();
  const message = specimen
    ? format("scan_result_dupe_named", {
        name: specimen.name[lang] ?? specimen.name.en,
        n: specimen.number.toString().padStart(3, "0"),
      })
    : t.scan_result_dupe;
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-end justify-center p-[0_16px_max(96px,env(safe-area-inset-bottom))_16px]">
      <button
        className="pointer-events-auto w-full max-w-[420px] cursor-pointer appearance-none rounded-2xl border border-[rgba(255,183,85,0.55)] bg-[rgba(255,183,85,0.10)] p-[14px_18px] text-center text-ink text-sm shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-[20px]"
        onClick={onDismiss}
        type="button"
      >
        {message}
      </button>
    </div>
  );
}

export function InvalidToast({
  onDismiss,
}: {
  onDismiss: () => void;
}): ReactElement {
  const { t } = useLocale();
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-end justify-center p-[0_16px_max(96px,env(safe-area-inset-bottom))_16px]">
      <button
        className="pointer-events-auto w-full max-w-[420px] cursor-pointer appearance-none rounded-2xl border border-[rgba(255,141,161,0.55)] bg-[rgba(255,141,161,0.10)] p-[14px_18px] text-center text-ink text-sm shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-[20px]"
        onClick={onDismiss}
        type="button"
      >
        {t.scan_result_invalid}
      </button>
    </div>
  );
}
