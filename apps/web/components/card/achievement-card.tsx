"use client";

import {
  LUME_SPECIMENS,
  LUME_TOTAL_SPECIMENS,
  type LumeSpecimen,
} from "@lume/data/specimens";
import type { LumeAccent } from "@lume/data/tokens";
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

const ACCENT_TO_RGB: Record<LumeAccent, string> = {
  amber: "255, 183, 85",
  cyan: "105, 224, 255",
  magenta: "255, 122, 223",
  mint: "126, 240, 196",
  violet: "179, 144, 255",
  rose: "255, 141, 161",
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
      border: "1px solid var(--lu-rule-hair)",
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
        className="relative flex h-[18px] w-[18px] items-center justify-center overflow-hidden rounded-[50%]"
        style={{
          boxShadow: `0 0 8px rgba(${rgb}, 0.55)`,
          background:
            `radial-gradient(circle at 50% 50%, rgba(${rgb}, 0.45) 0%, ` +
            `rgba(${rgb}, 0.18) 60%, rgba(${rgb}, 0) 100%)`,
        }}
      >
        <Image
          alt=""
          className="h-full w-full object-contain"
          decoding="sync"
          height={18}
          src={specimen.image.src}
          unoptimized
          width={18}
        />
      </span>
    );
  }
  return <span aria-hidden="true" style={dotStyle(specimen, lit)} />;
}

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
    <div
      className="relative flex h-[480px] w-[360px] flex-col overflow-hidden rounded-[28px] border border-rule-strong text-ink"
      data-export-card="lume-achievement"
      ref={ref}
      style={{
        background:
          "radial-gradient(120% 60% at 50% 0%, rgba(179, 144, 255, 0.55) 0%, rgba(179, 144, 255, 0) 60%)," +
          "radial-gradient(80% 50% at 50% 100%, rgba(105, 224, 255, 0.32) 0%, rgba(105, 224, 255, 0) 60%)," +
          "linear-gradient(180deg, #0a0a14 0%, #08080d 100%)",
        boxShadow:
          "0 30px 80px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        fontFamily: "var(--lu-font-display)",
      }}
    >
      <header className="flex items-center justify-between px-6 pt-[18px]">
        <span className="font-mono-lu text-[10px] text-mint uppercase tracking-[3px]">
          {fieldGuideLabel}
        </span>
        <span className="font-mono-lu text-[10px] text-ink-3 uppercase tracking-[4px]">
          LUME
        </span>
      </header>

      <section
        className="relative mx-6 mt-3 flex h-[196px] items-center justify-center overflow-hidden rounded-[22px] border border-rule-hair"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)," +
            "linear-gradient(180deg, #131322 0%, #0d0d18 100%)",
        }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-3 rounded-[50%] bg-aurora-halo opacity-[0.85] blur-[28px]"
        />
        <span
          aria-hidden="true"
          className="absolute h-[88px] w-[88px] rounded-[50%] blur-[8px]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 70%)",
          }}
        />
        <span className="relative font-bold text-[56px] text-ink leading-none tracking-[-1.4px] [text-shadow:0_0_16px_rgba(255,255,255,0.35)]">
          {LUME_TOTAL_SPECIMENS}
        </span>
        <span className="relative mx-2 font-normal text-[36px] text-ink-3">
          /
        </span>
        <span className="relative font-bold text-[36px] text-ink-2 leading-none tracking-[-1.4px]">
          {LUME_TOTAL_SPECIMENS}
        </span>
      </section>

      <section className="mx-6 mt-5 flex flex-col gap-1 text-center">
        <span className="font-semibold text-[22px] text-ink tracking-[-0.3px]">
          {cardTitle}
        </span>
      </section>

      <section
        className="mx-6 mt-4 rounded-[18px] border border-rule-hair px-2 py-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.015) 100%)",
        }}
      >
        <div className="grid grid-cols-6 justify-items-center gap-2">
          {LUME_SPECIMENS.map((s) => (
            <GridDot
              key={s.qr}
              lit={highlightedNumbers ? highlightedNumbers.has(s.number) : true}
              specimen={s}
            />
          ))}
        </div>
      </section>

      <footer className="mt-auto flex items-center justify-between border-rule-hair border-t px-6 pt-[14px] pb-[18px]">
        <span className="min-w-0 max-w-[60%] truncate font-semibold text-[15px] text-ink tracking-[-0.2px]">
          {nickname}
        </span>
        <span className="font-medium font-mono-lu text-ink-2 text-xs tracking-[1px]">
          {dateLabel}
        </span>
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
