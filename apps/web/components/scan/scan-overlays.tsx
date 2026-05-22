"use client";

import {
  getSpecimenVisual,
  LUME_TOTAL_SPECIMENS,
  type LumeSpecimen,
} from "@lume/data/specimens";
import { LU } from "@lume/data/tokens";
import Link from "next/link";
import type { CSSProperties, ReactElement } from "react";
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

const SHEET_BACKDROP_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(8, 8, 13, 0.55)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  zIndex: 40,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
};

const SHEET_STYLE: CSSProperties = {
  width: "100%",
  maxWidth: 480,
  margin: "0 auto",
  padding: "24px 24px max(24px, env(safe-area-inset-bottom))",
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  border: `1px solid ${LU.rule.strong}`,
  borderBottom: "none",
  background: LU.glass.surface3,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  textAlign: "center",
  boxShadow: "0 -32px 96px rgba(0, 0, 0, 0.55)",
};

const META_ROW_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 12,
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: LU.base.ink2,
};

const NAME_STYLE: CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: -0.3,
  margin: 0,
};

const NOTES_STYLE: CSSProperties = {
  color: LU.base.ink2,
  fontSize: 14,
  lineHeight: 1.5,
  margin: 0,
  maxWidth: 360,
};

const PROGRESS_LABEL_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: LU.base.ink3,
};

const PROGRESS_TRACK_STYLE: CSSProperties = {
  width: "100%",
  height: 4,
  borderRadius: 999,
  background: LU.glass.surface2,
  overflow: "hidden",
};

const ACTIONS_STYLE: CSSProperties = {
  display: "flex",
  gap: 12,
  width: "100%",
};

const PRIMARY_STYLE: CSSProperties = {
  appearance: "none",
  flex: 1,
  border: `1px solid ${LU.rule.strong}`,
  background: LU.glass.surface3,
  color: LU.base.ink,
  padding: "14px 16px",
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: 0.4,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const TOAST_WRAPPER_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 30,
  padding: "0 16px max(96px, env(safe-area-inset-bottom)) 16px",
};

const TOAST_BASE_STYLE: CSSProperties = {
  pointerEvents: "auto",
  width: "100%",
  maxWidth: 420,
  padding: "14px 18px",
  borderRadius: 16,
  border: `1px solid ${LU.rule.hair}`,
  background: LU.glass.surface3,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  color: LU.base.ink,
  fontSize: 14,
  textAlign: "center",
  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5)",
};

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
    <div aria-modal="true" role="dialog" style={SHEET_BACKDROP_STYLE}>
      <div style={SHEET_STYLE}>
        <span style={META_ROW_STYLE}>
          <span style={{ color: LU.accent.mint }}>{t.scan_result_added}</span>
          <span style={{ color: LU.rule.strong }}>·</span>
          <span>
            {t.specimen_plate_label} {specimen.plate}
          </span>
          <span style={{ color: LU.rule.strong }}>·</span>
          <span>
            {t.specimen_floor_label} {specimen.floor}
          </span>
        </span>
        <LumeSpecimenView
          form={specimen.form}
          glow={0.7}
          hue={specimen.hue}
          image={visual.kind === "image" ? visual : undefined}
          size={148}
        />
        <h2 style={NAME_STYLE}>{specimen.name[lang] ?? specimen.name.en}</h2>
        <p style={NOTES_STYLE}>{specimen.notes[lang] ?? specimen.notes.en}</p>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span style={PROGRESS_LABEL_STYLE}>
            {format("index_progress", {
              found: collectedCount,
              total: LUME_TOTAL_SPECIMENS,
            })}
          </span>
          <span style={{ ...PROGRESS_LABEL_STYLE, color: LU.base.ink3 }}>
            {progressPct}%
          </span>
        </div>
        <div style={PROGRESS_TRACK_STYLE}>
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: LU.accent.amber,
              transition: "width 240ms ease-out",
            }}
          />
        </div>
        <div style={ACTIONS_STYLE}>
          <Link href={`/specimen/${specimen.number}`} style={PRIMARY_STYLE}>
            {t.scan_view_specimen}
          </Link>
          <button onClick={onContinue} style={PRIMARY_STYLE} type="button">
            {t.scan_continue}
          </button>
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
    <div style={TOAST_WRAPPER_STYLE}>
      <button
        onClick={onDismiss}
        style={{
          ...TOAST_BASE_STYLE,
          border: "1px solid rgba(255, 183, 85, 0.55)",
          background: "rgba(255, 183, 85, 0.10)",
          appearance: "none",
          cursor: "pointer",
        }}
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
    <div style={TOAST_WRAPPER_STYLE}>
      <button
        onClick={onDismiss}
        style={{
          ...TOAST_BASE_STYLE,
          border: "1px solid rgba(255, 141, 161, 0.55)",
          background: "rgba(255, 141, 161, 0.10)",
          appearance: "none",
          cursor: "pointer",
        }}
        type="button"
      >
        {t.scan_result_invalid}
      </button>
    </div>
  );
}
