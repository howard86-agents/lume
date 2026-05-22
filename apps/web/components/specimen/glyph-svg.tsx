import {
  getLumeForm,
  type LumeFormName,
  type LumeGlyphShape,
} from "@lume/data/glyphs";
import {
  type CSSProperties,
  Fragment,
  type ReactElement,
  type SVGProps,
} from "react";

/**
 * Render a single Lume specimen-glyph as an inline SVG.
 *
 * The component knows how to project each `LumeGlyphShape` onto SVG
 * primitives (`circle`, `rect`, `polygon`, `path`). Strokes default to the
 * resolved `color` value so callers can theme a glyph with a single
 * `color` prop or a CSS custom property — the surrounding `LumeSpecimen`
 * passes the specimen hue down via `color` for that reason.
 */
export interface GlyphSvgProps
  extends Omit<SVGProps<SVGSVGElement>, "viewBox"> {
  /**
   * Foreground colour passed to fills and strokes that do not specify one.
   * Defaults to `currentColor`, which lets parents drive colour with CSS.
   */
  color?: string;
  /** The form to render. */
  form: LumeFormName;
  /** Explicit pixel size; defaults to `100%` so the parent box decides. */
  size?: number | string;
}

export function GlyphSvg({
  form,
  size = "100%",
  color = "currentColor",
  ...rest
}: GlyphSvgProps): ReactElement {
  const definition = getLumeForm(form);
  const dimension = typeof size === "number" ? `${size}px` : size;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height={dimension}
      style={{ color }}
      viewBox={`0 0 ${definition.viewBox} ${definition.viewBox}`}
      width={dimension}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <title>{form}</title>
      {definition.shapes.map((shape, index) => (
        // Forms have a fixed shape order, so a positional key is stable.
        <Fragment key={shapeKey(form, shape, index)}>
          {renderShape(shape, color)}
        </Fragment>
      ))}
    </svg>
  );
}

/** Build a stable per-shape key that does not rely on plain array index. */
function shapeKey(
  form: LumeFormName,
  shape: LumeGlyphShape,
  index: number
): string {
  switch (shape.kind) {
    case "circle":
    case "ring":
      return `${form}-${shape.kind}-${index}-${shape.cx}-${shape.cy}-${shape.r}`;
    case "polygon":
      return `${form}-poly-${index}-${shape.points.length}`;
    case "rect":
      return `${form}-rect-${index}-${shape.x}-${shape.y}-${shape.width}-${shape.height}`;
    case "path":
      return `${form}-path-${index}-${shape.d.length}`;
    default: {
      const _exhaustive: never = shape;
      return `${form}-unknown-${index}-${String(_exhaustive)}`;
    }
  }
}

function renderShape(shape: LumeGlyphShape, color: string): ReactElement {
  switch (shape.kind) {
    case "circle":
      return (
        <circle
          cx={shape.cx}
          cy={shape.cy}
          fill={shape.stroke ? "none" : color}
          opacity={shape.opacity}
          r={shape.r}
          stroke={shape.stroke ? color : undefined}
          strokeWidth={shape.strokeWidth}
        />
      );
    case "ring":
      return (
        <circle
          cx={shape.cx}
          cy={shape.cy}
          fill="none"
          opacity={shape.opacity}
          r={shape.r}
          stroke={color}
          strokeWidth={shape.strokeWidth}
        />
      );
    case "polygon": {
      const points = shape.points.map((p) => `${p[0]},${p[1]}`).join(" ");
      return (
        <polygon
          fill={shape.stroke ? "none" : color}
          opacity={shape.opacity}
          points={points}
          stroke={shape.stroke ? color : undefined}
          strokeLinejoin="round"
          strokeWidth={shape.strokeWidth}
        />
      );
    }
    case "rect": {
      const transform = shape.rotate
        ? `rotate(${shape.rotate} ${shape.x + shape.width / 2} ${
            shape.y + shape.height / 2
          })`
        : undefined;
      return (
        <rect
          fill={shape.stroke ? "none" : color}
          height={shape.height}
          opacity={shape.opacity}
          rx={shape.rx}
          ry={shape.ry}
          stroke={shape.stroke ? color : undefined}
          strokeWidth={shape.strokeWidth}
          transform={transform}
          width={shape.width}
          x={shape.x}
          y={shape.y}
        />
      );
    }
    case "path":
      return (
        <path
          d={shape.d}
          fill={shape.stroke ? "none" : color}
          opacity={shape.opacity}
          stroke={shape.stroke ? color : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={shape.strokeWidth}
        />
      );
    default: {
      // Exhaustiveness check — if a new shape kind is added, this branch
      // becomes a type error until the renderer handles it.
      const _exhaustive: never = shape;
      return <g data-unhandled-shape={_exhaustive} />;
    }
  }
}

/** Helper: build the inline `<style>` value used by `LumeSpecimen` halos. */
export function buildGlowStyle(color: string, intensity = 0.55): CSSProperties {
  return {
    background: `radial-gradient(circle at 50% 50%, ${color}${Math.round(
      intensity * 255
    )
      .toString(16)
      .padStart(2, "0")} 0%, transparent 70%)`,
  };
}
