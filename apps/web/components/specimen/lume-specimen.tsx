import type { LumeFormName } from "@lume/data/glyphs";
import { LU, type LumeAccent } from "@lume/data/tokens";
import clsx from "clsx";
import Image from "next/image";
import type { CSSProperties, ReactElement } from "react";
import { GlyphSvg } from "./glyph-svg";

/**
 * The visual treatment for a single Lume specimen — the abstract glyph on
 * top of a coloured glow halo, in either its `found` (full colour) or
 * `locked` (dimmed silhouette) state. When a specimen has bespoke
 * artwork the catalogue can pass an `image`, in which case the image
 * replaces the glyph on the found state; the locked state still renders
 * the glyph silhouette so we never spoil the artwork before the visitor
 * has scanned the QR code for it.
 *
 * Use this anywhere the specimen needs to be presented in its full Lume
 * aesthetic: the gallery tile, the success-sheet hero, the detail-plate
 * centerpiece, the completion reveal, the achievement card, and the
 * `/system/specimens` design preview.
 *
 * Sizing is driven by the surrounding container — the specimen fills the
 * box square, so callers can tune presentation by setting a width on the
 * wrapper.
 */
export interface LumeSpecimenProps {
  /** Forwarded to the wrapper for layout/positioning tweaks. */
  className?: string;
  /** Glyph form to render (and the locked-state silhouette). */
  form: LumeFormName;
  /** Whether the specimen has been collected. Defaults to `true` (found). */
  found?: boolean;
  /**
   * Optional intensity multiplier for the halo glow (0..1). Larger values
   * are reserved for the success sheet + completion reveal. Defaults to
   * `0.55`, matching the gallery preview.
   */
  glow?: number;
  /**
   * Single-instance hero contexts (specimen detail, collect sheet). Opts
   * into the looping halo-breathe plus a richer glyph breathe.
   */
  hero?: boolean;
  /** Accent hue used for the glow halo and (when `found`) the glyph fill. */
  hue: LumeAccent;
  /**
   * Optional artwork to render in place of the abstract glyph. Only
   * consulted on the `found` state — the locked silhouette always uses
   * the glyph so visitors don't see the artwork before they've scanned
   * the specimen.
   */
  image?: { alt: string; src: string };
  /**
   * Per-tile stagger seed for the gallery halo-breathe loop. Presence
   * opts the specimen into the looping animation.
   */
  index?: number;
  /**
   * When true, pauses the halo-breathe animation (used for off-screen tiles).
   */
  paused?: boolean;
  /**
   * Size of the square render area in CSS pixels. Defaults to `120` which
   * matches the gallery tile inner box. Pass a smaller number for chrome
   * and a larger number for detail-plate / completion variants.
   */
  size?: number;
  /** Forwarded to the wrapper for inline styling tweaks. */
  style?: CSSProperties;
}

const ACCENT_TO_RGB: Record<LumeAccent, string> = {
  amber: "255, 183, 85",
  cyan: "105, 224, 255",
  magenta: "255, 122, 223",
  mint: "126, 240, 196",
  violet: "179, 144, 255",
  rose: "255, 141, 161",
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: inherent state branching (found/locked/hero/image)
export function LumeSpecimen({
  form,
  hue,
  found = true,
  size = 120,
  glow = 0.55,
  className,
  hero = false,
  image,
  index,
  paused = false,
  style,
}: LumeSpecimenProps): ReactElement {
  const rgb = ACCENT_TO_RGB[hue];
  const accentColor = LU.accent[hue];
  const haloOpacity = Math.max(0, Math.min(1, glow));
  const breathing = found && (hero || index !== undefined);
  // Locked specimens render as a dimmed white silhouette over a faint halo
  // so the gallery still reads the form (as a hint of what's to find) but
  // does not reveal the full colour identity until the visitor scans it.
  const glyphColor = found ? accentColor : "rgba(246, 246, 251, 0.32)";
  // Softer gradient stops compensate for reduced/removed blur filter
  const haloFill = found
    ? `radial-gradient(circle at 50% 50%, rgba(${rgb}, ${haloOpacity * 0.8}) 0%, rgba(${rgb}, ${haloOpacity * 0.35}) 40%, rgba(${rgb}, 0) 72%)`
    : `radial-gradient(circle at 50% 50%, rgba(${rgb}, 0.09) 0%, rgba(${rgb}, 0.03) 55%, rgba(${rgb}, 0) 78%)`;
  const showImage = Boolean(image && found);
  // Reduce drop-shadow for small tiles (e.g. completion cluster ×23)
  let glyphShadow = "none";
  if (found && size > 40) {
    glyphShadow = `drop-shadow(0 0 6px rgba(${rgb}, 0.55))`;
  } else if (found) {
    glyphShadow = `drop-shadow(0 0 2px rgba(${rgb}, 0.4))`;
  }

  return (
    <div
      aria-hidden={showImage ? undefined : "true"}
      className={clsx(
        "relative inline-flex items-center justify-center",
        className
      )}
      data-form={form}
      data-found={found ? "true" : "false"}
      data-hue={hue}
      data-image={showImage ? "true" : undefined}
      style={{ width: size, height: size, ...style }}
    >
      {/* Glow halo — sits behind the glyph and matches the specimen hue. */}
      <span
        className={clsx(
          "pointer-events-none absolute",
          breathing &&
            "animate-halo-breathe [animation-delay:calc(var(--i)*180ms)]"
        )}
        style={
          {
            inset: -size * 0.08,
            background: haloFill,
            filter: found ? undefined : "blur(3px)",
            animationPlayState: breathing && paused ? "paused" : undefined,
            "--i": index ?? 0,
          } as CSSProperties
        }
      />
      <span
        className={clsx(
          "relative inline-flex items-center justify-center",
          hero && !showImage && "animate-glyph-breathe"
        )}
        style={{ width: size * 0.78, height: size * 0.78 }}
      >
        {showImage && image ? (
          <Image
            alt={image.alt}
            className="h-full w-full object-contain"
            decoding="async"
            // Disable next/image optimisation so SVG and PNG artwork is
            // delivered as authored (transparent edges, glow alpha) and
            // captured 1:1 at the card export's 2x scale.
            height={Math.round(size * 0.78)}
            loading="lazy"
            src={image.src}
            style={{
              filter: glyphShadow,
            }}
            unoptimized
            width={Math.round(size * 0.78)}
          />
        ) : (
          <GlyphSvg
            color={glyphColor}
            form={form}
            size="100%"
            style={{
              opacity: found ? 1 : 0.65,
              // A subtle drop-shadow on the glyph stroke itself keeps the
              // edge readable on top of the halo.
              filter: glyphShadow,
            }}
          />
        )}
      </span>
    </div>
  );
}
