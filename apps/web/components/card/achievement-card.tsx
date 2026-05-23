"use client";

import {
  LUME_SPECIMENS,
  LUME_TOTAL_SPECIMENS,
  type LumeSpecimen,
} from "@lume/data/specimens";
import { LU, type LumeAccent } from "@lume/data/tokens";
import Image from "next/image";
import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type ReactElement,
} from "react";

/**
 * Achievement card — the export-friendly visual rendered on `/card` and
 * snapshotted to PNG by `save-card.ts`.
 *
 * The card is intentionally laid out at a fixed pixel size (3 / 4 portrait)
 * so the snapshot is deterministic across viewports — callers wrap it in
 * a CSS-`transform: scale()` to fit smaller screens. All visual depth is
 * baked into solid gradients so modern-screenshot does not need to rasterise
 * unsupported CSS blur layers.
 *
 * Identity is conveyed by:
 *   - the `23 / 23` numeral over a conic halo,
 *   - a grid of 23 colored glow-dots (one per specimen hue),
 *   - the field-guide eyebrow,
 *   - the visitor name (`nickname`, falling back to a localised default)
 *     paired with the formatted save date in the footer.
 */

/** Fixed export dimensions — 3 : 4 portrait, ample mobile margins. */
export const ACHIEVEMENT_CARD_WIDTH = 360;
export const ACHIEVEMENT_CARD_HEIGHT = 480;

/** Visual + accessibility props for the achievement card. */
export interface AchievementCardProps {
  /** Localised card title (e.g. "Your field guide"). */
  cardTitle: string;
  /** Pre-formatted date string (e.g. "22 May 2026"). */
  dateLabel: string;
  /** Localised field-guide eyebrow rendered inside the card. */
  fieldGuideLabel: string;
  /**
   * Optional set of collected specimen numbers — every specimen lights up
   * by default (the card is shown at 23/23). Allowed for future re-use
   * while previewing partial progress.
   */
  highlightedNumbers?: ReadonlySet<number>;
  /** Visitor name to render as the card subject. */
  nickname: string;
}

/** Style helpers — kept module-scoped to avoid re-allocating per render. */
const CARD_STYLE: CSSProperties = {
  position: "relative",
  width: ACHIEVEMENT_CARD_WIDTH,
  height: ACHIEVEMENT_CARD_HEIGHT,
  borderRadius: 28,
  // Solid (non-translucent) aurora — no unsupported CSS blur dependency.
  background:
    "radial-gradient(120% 60% at 50% 0%, rgba(179, 144, 255, 0.55) 0%, rgba(179, 144, 255, 0) 60%)," +
    "radial-gradient(80% 50% at 50% 100%, rgba(105, 224, 255, 0.32) 0%, rgba(105, 224, 255, 0) 60%)," +
    "linear-gradient(180deg, #0a0a14 0%, #08080d 100%)",
  border: `1px solid ${LU.rule.strong}`,
  boxShadow:
    "0 30px 80px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
  color: LU.base.ink,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  // The fixed-pixel design language assumes our display font has loaded.
  fontFamily: "var(--lu-font-display)",
};

const HEADER_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 24px 0",
};

const EYEBROW_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 10,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.accent.mint,
};

const BRAND_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 10,
  letterSpacing: 4,
  textTransform: "uppercase",
  color: LU.base.ink3,
};

const HERO_STYLE: CSSProperties = {
  position: "relative",
  margin: "12px 24px 0",
  height: 196,
  borderRadius: 22,
  // Solid plate — the "glassy" look is faked with two inset gradients.
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)," +
    "linear-gradient(180deg, #131322 0%, #0d0d18 100%)",
  border: `1px solid ${LU.rule.hair}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const HALO_STYLE: CSSProperties = {
  position: "absolute",
  inset: 12,
  borderRadius: "50%",
  background: LU.aurora.halo,
  filter: "blur(28px)",
  opacity: 0.85,
};

const HALO_CORE_STYLE: CSSProperties = {
  position: "absolute",
  width: 88,
  height: 88,
  borderRadius: "50%",
  background:
    "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 70%)",
  filter: "blur(8px)",
};

const HERO_NUMERAL_STYLE: CSSProperties = {
  position: "relative",
  fontSize: 56,
  fontWeight: 700,
  letterSpacing: -1.4,
  lineHeight: 1,
  color: LU.base.ink,
  textShadow: "0 0 16px rgba(255, 255, 255, 0.35)",
};

const HERO_NUMERAL_DIVIDER_STYLE: CSSProperties = {
  position: "relative",
  margin: "0 8px",
  fontSize: 36,
  fontWeight: 400,
  color: LU.base.ink3,
};

const HERO_TOTAL_STYLE: CSSProperties = {
  ...HERO_NUMERAL_STYLE,
  fontSize: 36,
  color: LU.base.ink2,
  textShadow: "none",
};

const TITLE_BLOCK_STYLE: CSSProperties = {
  margin: "20px 24px 0",
  display: "flex",
  flexDirection: "column",
  gap: 4,
  textAlign: "center",
};

const CARD_TITLE_STYLE: CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  letterSpacing: -0.3,
  color: LU.base.ink,
};

const GRID_WRAPPER_STYLE: CSSProperties = {
  margin: "16px 24px 0",
  padding: "12px 8px",
  borderRadius: 18,
  border: `1px solid ${LU.rule.hair}`,
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.015) 100%)",
};

const GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: 8,
  justifyItems: "center",
};

const FOOTER_STYLE: CSSProperties = {
  marginTop: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 24px 18px",
  borderTop: `1px solid ${LU.rule.hair}`,
};

const FOOTER_VISITOR_STYLE: CSSProperties = {
  minWidth: 0,
  maxWidth: "60%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: -0.2,
  color: LU.base.ink,
};

const FOOTER_DATE_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: 1,
  color: LU.base.ink2,
};

/**
 * Render a single colored glow-dot for the 23-grid. Each dot resolves the
 * specimen hue to two stacked radial gradients — a tight core + a soft
 * outer halo — so the dot reads as a luminous point even at small sizes.
 */
function dotStyle(specimen: LumeSpecimen, lit: boolean): CSSProperties {
  const rgb = ACCENT_TO_RGB[specimen.hue];
  if (!lit) {
    return {
      width: 18,
      height: 18,
      borderRadius: "50%",
      background:
        `radial-gradient(circle at 50% 50%, rgba(${rgb}, 0.18) 0%, ` +
        `rgba(${rgb}, 0.06) 60%, rgba(${rgb}, 0) 80%)`,
      border: `1px solid ${LU.rule.hair}`,
    };
  }
  return {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background:
      `radial-gradient(circle at 50% 50%, rgba(${rgb}, 0.95) 0%, ` +
      `rgba(${rgb}, 0.6) 40%, rgba(${rgb}, 0) 80%)`,
    boxShadow: `0 0 8px rgba(${rgb}, 0.55)`,
  };
}

/** Wrapper style used when a lit specimen has bespoke artwork. */
const IMAGE_DOT_WRAPPER_STYLE: CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: "50%",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
};

/**
 * Render either the existing hue-glow dot or — when the specimen has
 * bespoke artwork *and* it is in the lit state — a small circular image
 * inside a hue-tinted halo. The card export runs at `scale: 2` so an 18px
 * dot rasterises at 36px, big enough to read the placeholder thumbnail.
 *
 * Locked specimens never reveal artwork (mirrors LumeSpecimen's
 * found/locked contract), so the image branch only activates on `lit`.
 */
function GridDot({
  specimen,
  lit,
}: {
  lit: boolean;
  specimen: LumeSpecimen;
}): ReactElement {
  if (lit && specimen.image) {
    const rgb = ACCENT_TO_RGB[specimen.hue];
    return (
      <span
        aria-hidden="true"
        style={{
          ...IMAGE_DOT_WRAPPER_STYLE,
          boxShadow: `0 0 8px rgba(${rgb}, 0.55)`,
          background:
            `radial-gradient(circle at 50% 50%, rgba(${rgb}, 0.45) 0%, ` +
            `rgba(${rgb}, 0.18) 60%, rgba(${rgb}, 0) 100%)`,
        }}
      >
        <Image
          alt=""
          decoding="sync"
          height={18}
          src={specimen.image.src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          unoptimized
          width={18}
        />
      </span>
    );
  }
  return <span aria-hidden="true" style={dotStyle(specimen, lit)} />;
}

const ACCENT_TO_RGB: Record<LumeAccent, string> = {
  amber: "255, 183, 85",
  cyan: "105, 224, 255",
  magenta: "255, 122, 223",
  mint: "126, 240, 196",
  violet: "179, 144, 255",
  rose: "255, 141, 161",
};

function AchievementCardImpl(
  props: AchievementCardProps,
  ref: ForwardedRef<HTMLDivElement>
): ReactElement {
  const {
    cardTitle,
    dateLabel,
    fieldGuideLabel,
    highlightedNumbers,
    nickname,
  } = props;
  return (
    <div data-export-card="lume-achievement" ref={ref} style={CARD_STYLE}>
      <header style={HEADER_STYLE}>
        <span style={EYEBROW_STYLE}>{fieldGuideLabel}</span>
        <span style={BRAND_STYLE}>LUME</span>
      </header>

      <section style={HERO_STYLE}>
        <span aria-hidden="true" style={HALO_STYLE} />
        <span aria-hidden="true" style={HALO_CORE_STYLE} />
        <span style={HERO_NUMERAL_STYLE}>{LUME_TOTAL_SPECIMENS}</span>
        <span style={HERO_NUMERAL_DIVIDER_STYLE}>/</span>
        <span style={HERO_TOTAL_STYLE}>{LUME_TOTAL_SPECIMENS}</span>
      </section>

      <section style={TITLE_BLOCK_STYLE}>
        <span style={CARD_TITLE_STYLE}>{cardTitle}</span>
      </section>

      <section style={GRID_WRAPPER_STYLE}>
        <div style={GRID_STYLE}>
          {LUME_SPECIMENS.map((s) => (
            <GridDot
              key={s.qr}
              lit={highlightedNumbers ? highlightedNumbers.has(s.number) : true}
              specimen={s}
            />
          ))}
        </div>
      </section>

      <footer style={FOOTER_STYLE}>
        <span style={FOOTER_VISITOR_STYLE}>{nickname}</span>
        <span style={FOOTER_DATE_STYLE}>{dateLabel}</span>
      </footer>
    </div>
  );
}

/**
 * Forwarded ref so the parent can pass the card DOM node to
 * `modern-screenshot` without re-querying via `document.querySelector`.
 */
export const AchievementCard = forwardRef<HTMLDivElement, AchievementCardProps>(
  AchievementCardImpl
);

AchievementCard.displayName = "AchievementCard";
