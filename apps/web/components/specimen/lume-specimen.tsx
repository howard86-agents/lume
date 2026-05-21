import type { LumeFormName } from "@lume/data/glyphs";
import { LU, type LumeAccent } from "@lume/data/tokens";
import type { CSSProperties, ReactElement } from "react";
import { GlyphSvg } from "./glyph-svg";

/**
 * The visual treatment for a single Lume specimen — the abstract glyph on
 * top of a coloured glow halo, in either its `found` (full colour) or
 * `locked` (dimmed silhouette) state.
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
  /** Glyph form to render. */
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

  return (
    <div
      aria-hidden="true"
      className={className}
      data-form={form}
      data-found={found ? "true" : "false"}
      data-hue={hue}
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {/* Glow halo — sits behind the glyph and matches the specimen hue. */}
      <span
        style={{
          position: "absolute",
          inset: -size * 0.08,
          background: haloFill,
          filter: found ? "blur(6px)" : "blur(8px)",
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          width: size * 0.78,
          height: size * 0.78,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <GlyphSvg
          color={glyphColor}
          form={form}
          size="100%"
          style={{
            opacity: found ? 1 : 0.65,
            // A subtle drop-shadow on the glyph stroke itself keeps the
            // edge readable on top of the halo.
            filter: found ? `drop-shadow(0 0 6px rgba(${rgb}, 0.55))` : "none",
          }}
        />
      </span>
    </div>
  );
}
