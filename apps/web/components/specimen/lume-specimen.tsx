import type { LumeFormName } from "@lume/data/glyphs";
import { LU, type LumeAccent } from "@lume/data/tokens";
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

export function LumeSpecimen({
  form,
  hue,
  found = true,
  size = 120,
  glow = 0.55,
  className,
  image,
  style,
}: LumeSpecimenProps): ReactElement {
  const rgb = ACCENT_TO_RGB[hue];
  const accentColor = LU.accent[hue];
  const haloOpacity = Math.max(0, Math.min(1, glow));
  // Locked specimens render as a dimmed white silhouette over a faint halo
  // so the gallery still reads the form (as a hint of what's to find) but
  // does not reveal the full colour identity until the visitor scans it.
  const glyphColor = found ? accentColor : "rgba(246, 246, 251, 0.32)";
  const haloFill = found
    ? `radial-gradient(circle at 50% 50%, rgba(${rgb}, ${haloOpacity * 0.9}) 0%, rgba(${rgb}, ${haloOpacity * 0.45}) 35%, rgba(${rgb}, 0) 70%)`
    : `radial-gradient(circle at 50% 50%, rgba(${rgb}, 0.10) 0%, rgba(${rgb}, 0.04) 50%, rgba(${rgb}, 0) 75%)`;
  const showImage = Boolean(image && found);

  return (
    <div
      aria-hidden={showImage ? undefined : "true"}
      className={`relative inline-flex items-center justify-center ${className ?? ""}`}
      data-form={form}
      data-found={found ? "true" : "false"}
      data-hue={hue}
      data-image={showImage ? "true" : undefined}
      style={{ width: size, height: size, ...style }}
    >
      {/* Glow halo — sits behind the glyph and matches the specimen hue. */}
      <span
        className="pointer-events-none absolute"
        style={{
          inset: -size * 0.08,
          background: haloFill,
          filter: found ? "blur(6px)" : "blur(8px)",
        }}
      />
      <span
        className="relative inline-flex items-center justify-center"
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
              filter: `drop-shadow(0 0 6px rgba(${rgb}, 0.55))`,
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
              filter: found
                ? `drop-shadow(0 0 6px rgba(${rgb}, 0.55))`
                : "none",
            }}
          />
        )}
      </span>
    </div>
  );
}
