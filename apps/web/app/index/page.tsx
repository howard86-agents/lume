"use client";

import {
  LUME_SPECIMENS_BY_FLOOR,
  LUME_TOTAL_SPECIMENS,
  type LumeFloor,
  type LumeSpecimen,
} from "@lume/data/specimens";
import { LU } from "@lume/data/tokens";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useLocale, useLume } from "../../components/lume-provider";
import { LumeSpecimen as LumeSpecimenView } from "../../components/specimen/lume-specimen";

/**
 * Collection gallery — `/index`.
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

const PAGE_STYLE: CSSProperties = {
  minHeight: "100dvh",
  background: LU.aurora.page,
  color: LU.base.ink,
  display: "flex",
  flexDirection: "column",
  padding:
    "max(40px, env(safe-area-inset-top)) 20px max(112px, env(safe-area-inset-bottom))",
  gap: 28,
};

const HEADER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const HEADER_TOP_ROW_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const TITLE_STYLE: CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: -0.3,
  margin: 0,
};

const SETTINGS_LINK_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  borderRadius: 999,
  border: `1px solid ${LU.rule.hair}`,
  background: LU.glass.surface1,
  color: LU.base.ink2,
  textDecoration: "none",
};

const PROGRESS_LABEL_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  fontFamily: "var(--lu-font-mono)",
  fontSize: 12,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: LU.base.ink2,
};

const PROGRESS_TRACK_STYLE: CSSProperties = {
  width: "100%",
  height: 4,
  borderRadius: 999,
  background: LU.glass.surface2,
  overflow: "hidden",
};

const FLOOR_HEADER_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  marginBottom: 12,
};

const FLOOR_LABEL_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.base.ink2,
};

const FLOOR_COUNT_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  color: LU.base.ink3,
};

const GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 12,
};

const TILE_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: "16px 8px 12px",
  borderRadius: 18,
  border: `1px solid ${LU.rule.hair}`,
  background: LU.glass.surface1,
  textDecoration: "none",
  color: LU.base.ink,
  cursor: "pointer",
};

const TILE_LOCKED_STYLE: CSSProperties = {
  ...TILE_STYLE,
  cursor: "default",
};

const TILE_NUMBER_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: LU.base.ink3,
};

const TILE_NAME_STYLE: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  textAlign: "center",
  color: LU.base.ink,
};

const TILE_LOCKED_LABEL_STYLE: CSSProperties = {
  ...TILE_NAME_STYLE,
  color: LU.base.ink3,
  fontWeight: 500,
};

const DOCK_STYLE: CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  padding: "12px 20px max(20px, env(safe-area-inset-bottom)) 20px",
  background:
    "linear-gradient(180deg, rgba(8,8,13,0) 0%, rgba(8,8,13,0.85) 30%, #08080d 100%)",
  display: "flex",
  justifyContent: "center",
};

const DOCK_BUTTON_STYLE: CSSProperties = {
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
  width: "min(420px, 100%)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const DOCK_BUTTON_COMPLETE_STYLE: CSSProperties = {
  ...DOCK_BUTTON_STYLE,
  border: `1px solid ${LU.accent.mint}`,
  background: "rgba(126, 240, 196, 0.16)",
  boxShadow: "0 0 0 1px rgba(126, 240, 196, 0.35)",
};

interface SpecimenTileProps {
  found: boolean;
  lockedLabel: string;
  specimen: LumeSpecimen;
}

function SpecimenTile({ specimen, found, lockedLabel }: SpecimenTileProps) {
  const number = String(specimen.number).padStart(2, "0");
  const tileBody = (
    <>
      <span style={TILE_NUMBER_STYLE}>NO. {number}</span>
      <LumeSpecimenView
        form={specimen.form}
        found={found}
        glow={found ? 0.55 : 0.4}
        hue={specimen.hue}
        size={88}
      />
      {found ? (
        <span style={TILE_NAME_STYLE}>{specimen.name.en}</span>
      ) : (
        <span style={TILE_LOCKED_LABEL_STYLE}>{lockedLabel}</span>
      )}
    </>
  );
  if (found) {
    return (
      <Link
        aria-label={`${specimen.name.en} (no. ${number})`}
        href={`/specimen/${specimen.number}`}
        style={TILE_STYLE}
      >
        {tileBody}
      </Link>
    );
  }
  return (
    <div style={TILE_LOCKED_STYLE} title={lockedLabel}>
      {tileBody}
    </div>
  );
}

export default function IndexPage() {
  const router = useRouter();
  const { collectedNumbers, collectedCount, completion, state } = useLume();
  const { t, format } = useLocale();

  const dockOnClick = () => {
    if (completion) {
      // Loop visitors through the reveal once before the card; on
      // subsequent taps go straight to the card.
      router.push(state.finalSeen ? "/card" : "/complete");
      return;
    }
    router.push("/scan");
  };

  const progressPct = Math.min(
    100,
    Math.round((collectedCount / LUME_TOTAL_SPECIMENS) * 100)
  );

  return (
    <main style={PAGE_STYLE}>
      <header style={HEADER_STYLE}>
        <div style={HEADER_TOP_ROW_STYLE}>
          <h1 style={TITLE_STYLE}>{t.index_title}</h1>
          <Link
            aria-label={t.settings_title}
            href="/settings"
            style={SETTINGS_LINK_STYLE}
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
          </Link>
        </div>
        <div style={PROGRESS_LABEL_STYLE}>
          <span>
            {format("index_progress", {
              found: collectedCount,
              total: LUME_TOTAL_SPECIMENS,
            })}
          </span>
          <span style={{ color: LU.base.ink3 }}>{progressPct}%</span>
        </div>
        <div style={PROGRESS_TRACK_STYLE}>
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: completion ? LU.accent.mint : LU.accent.amber,
              transition: "width 240ms ease-out",
            }}
          />
        </div>
      </header>

      {FLOORS.map((floor) => {
        const specimens = LUME_SPECIMENS_BY_FLOOR[floor];
        const foundOnFloor = specimens.filter((s) =>
          collectedNumbers.has(s.number)
        ).length;
        return (
          <section key={floor}>
            <header style={FLOOR_HEADER_STYLE}>
              <span style={FLOOR_LABEL_STYLE}>
                {format("index_floor_label", { floor })}
              </span>
              <span style={FLOOR_COUNT_STYLE}>
                {format("index_floor_count", {
                  found: foundOnFloor,
                  total: specimens.length,
                })}
              </span>
            </header>
            <div style={GRID_STYLE}>
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

      <nav style={DOCK_STYLE}>
        <button
          onClick={dockOnClick}
          style={completion ? DOCK_BUTTON_COMPLETE_STYLE : DOCK_BUTTON_STYLE}
          type="button"
        >
          {completion ? t.index_dock_card : t.index_dock_scan}
        </button>
      </nav>
    </main>
  );
}
