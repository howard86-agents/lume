/**
 * Lume specimen-glyph definitions.
 *
 * Each light-form specimen renders an abstract SVG glyph composed of one or
 * more primitive `Shape`s on a fixed `viewBox` coordinate system. The data
 * lives in this pure-TS module so it can be consumed by both the in-app
 * renderer and (later) the achievement-card export pipeline without pulling
 * in React.
 *
 * Shapes intentionally use only `circle`, `rect`, `polygon`, and `path` so
 * they remain trivially serialisable to SVG strings, PNG snapshots, and
 * static print sheets.
 *
 * Coordinate system: a 200×200 box with `(100, 100)` as the visual centre.
 * All forms are sized to fit within an inner safe radius of ~92px so the
 * outer halo glow rendered by `LumeSpecimen` does not clip them.
 */

/** Stable identifier for one of the 12 abstract specimen forms. */
export type LumeFormName =
  | "halo"
  | "ring"
  | "orb"
  | "petal"
  | "prism"
  | "comet"
  | "lattice"
  | "bloom"
  | "shard"
  | "tide"
  | "mote"
  | "spire";

/** Discriminated SVG primitive used to describe a glyph stroke or fill. */
export type LumeGlyphShape =
  | {
      kind: "circle";
      cx: number;
      cy: number;
      r: number;
      stroke?: boolean;
      strokeWidth?: number;
      opacity?: number;
    }
  | {
      kind: "ring";
      cx: number;
      cy: number;
      r: number;
      strokeWidth: number;
      opacity?: number;
    }
  | {
      kind: "polygon";
      points: ReadonlyArray<readonly [number, number]>;
      stroke?: boolean;
      strokeWidth?: number;
      opacity?: number;
    }
  | {
      kind: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
      ry?: number;
      rotate?: number;
      stroke?: boolean;
      strokeWidth?: number;
      opacity?: number;
    }
  | {
      kind: "path";
      d: string;
      stroke?: boolean;
      strokeWidth?: number;
      opacity?: number;
    };

/** Render-ready definition for one of the 12 specimen forms. */
export interface LumeFormDefinition {
  /** Stable form name used by `Specimen.form`. */
  name: LumeFormName;
  /** Ordered shapes drawn for this form, painted with the specimen hue. */
  shapes: readonly LumeGlyphShape[];
  /** Square viewBox edge length; all coordinates assume this canvas. */
  viewBox: number;
}

/** Common viewBox edge for every form. */
export const LUME_GLYPH_VIEWBOX = 200;

/** Default centre of the glyph canvas. */
const C = LUME_GLYPH_VIEWBOX / 2;

/**
 * Convert N points evenly spaced around a circle into a polygon point list,
 * starting from the top (12 o'clock) and rotating clockwise. Used for the
 * geometric forms (prism, lattice, shard, spire).
 */
function regularPolygon(
  sides: number,
  radius: number,
  rotationDeg = 0
): readonly (readonly [number, number])[] {
  const points: (readonly [number, number])[] = [];
  const offset = (rotationDeg * Math.PI) / 180 - Math.PI / 2;
  for (let i = 0; i < sides; i += 1) {
    const angle = offset + (i * 2 * Math.PI) / sides;
    const x = C + radius * Math.cos(angle);
    const y = C + radius * Math.sin(angle);
    points.push([Number(x.toFixed(2)), Number(y.toFixed(2))]);
  }
  return points;
}

const FORMS: Record<LumeFormName, LumeFormDefinition> = {
  // 1. Halo — a single luminous disc with a thin outer ring.
  halo: {
    name: "halo",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      { kind: "circle", cx: C, cy: C, r: 38, opacity: 0.95 },
      { kind: "ring", cx: C, cy: C, r: 64, strokeWidth: 1.5, opacity: 0.65 },
    ],
  },
  // 2. Ring — concentric thin rings, no solid core.
  ring: {
    name: "ring",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      { kind: "ring", cx: C, cy: C, r: 30, strokeWidth: 2, opacity: 0.9 },
      { kind: "ring", cx: C, cy: C, r: 52, strokeWidth: 1.5, opacity: 0.7 },
      { kind: "ring", cx: C, cy: C, r: 74, strokeWidth: 1, opacity: 0.45 },
    ],
  },
  // 3. Orb — soft disc with a tiny inner highlight, no ring.
  orb: {
    name: "orb",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      { kind: "circle", cx: C, cy: C, r: 56, opacity: 0.9 },
      { kind: "circle", cx: C - 16, cy: C - 18, r: 10, opacity: 0.55 },
    ],
  },
  // 4. Petal — four lobes radiating from the centre.
  petal: {
    name: "petal",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      {
        kind: "path",
        d:
          "M100 28 C 132 60 132 60 100 100 C 68 60 68 60 100 28 Z " +
          "M172 100 C 140 132 140 132 100 100 C 140 68 140 68 172 100 Z " +
          "M100 172 C 68 140 68 140 100 100 C 132 140 132 140 100 172 Z " +
          "M28 100 C 60 68 60 68 100 100 C 60 132 60 132 28 100 Z",
        opacity: 0.9,
      },
      { kind: "circle", cx: C, cy: C, r: 8, opacity: 0.95 },
    ],
  },
  // 5. Prism — equilateral triangle outline + filled inner triangle.
  prism: {
    name: "prism",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      {
        kind: "polygon",
        points: regularPolygon(3, 70, 0),
        stroke: true,
        strokeWidth: 2,
        opacity: 0.85,
      },
      {
        kind: "polygon",
        points: regularPolygon(3, 32, 180),
        opacity: 0.9,
      },
    ],
  },
  // 6. Comet — a streak with a leading orb (path-based for the flowing tail).
  comet: {
    name: "comet",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      {
        kind: "path",
        d: "M40 150 C 70 130 110 90 150 50",
        stroke: true,
        strokeWidth: 6,
        opacity: 0.55,
      },
      { kind: "circle", cx: 150, cy: 50, r: 22, opacity: 0.95 },
      { kind: "circle", cx: 150, cy: 50, r: 36, opacity: 0.25 },
    ],
  },
  // 7. Lattice — two overlapping squares forming an 8-point star.
  lattice: {
    name: "lattice",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      {
        kind: "polygon",
        points: regularPolygon(4, 56, 0),
        stroke: true,
        strokeWidth: 2,
        opacity: 0.85,
      },
      {
        kind: "polygon",
        points: regularPolygon(4, 56, 45),
        stroke: true,
        strokeWidth: 2,
        opacity: 0.85,
      },
      { kind: "circle", cx: C, cy: C, r: 10, opacity: 0.9 },
    ],
  },
  // 8. Bloom — six radial rays emanating from a central core.
  bloom: {
    name: "bloom",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      {
        kind: "path",
        d:
          "M100 32 L100 76 M168 60 L132 88 M168 140 L132 112 " +
          "M100 168 L100 124 M32 140 L68 112 M32 60 L68 88",
        stroke: true,
        strokeWidth: 4,
        opacity: 0.85,
      },
      { kind: "circle", cx: C, cy: C, r: 22, opacity: 0.95 },
    ],
  },
  // 9. Shard — pentagon with a luminous inner edge.
  shard: {
    name: "shard",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      {
        kind: "polygon",
        points: regularPolygon(5, 68, 0),
        opacity: 0.9,
      },
      {
        kind: "polygon",
        points: regularPolygon(5, 38, 180),
        stroke: true,
        strokeWidth: 1.5,
        opacity: 0.7,
      },
    ],
  },
  // 10. Tide — three horizontal sine-wave bands suggesting fluid light.
  tide: {
    name: "tide",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      {
        kind: "path",
        d: "M28 70 C 56 50 84 90 112 70 C 140 50 168 90 172 70",
        stroke: true,
        strokeWidth: 4,
        opacity: 0.85,
      },
      {
        kind: "path",
        d: "M28 100 C 56 80 84 120 112 100 C 140 80 168 120 172 100",
        stroke: true,
        strokeWidth: 4,
        opacity: 0.7,
      },
      {
        kind: "path",
        d: "M28 130 C 56 110 84 150 112 130 C 140 110 168 150 172 130",
        stroke: true,
        strokeWidth: 4,
        opacity: 0.55,
      },
    ],
  },
  // 11. Mote — clustered small discs forming a constellation.
  mote: {
    name: "mote",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      { kind: "circle", cx: 70, cy: 70, r: 8, opacity: 0.9 },
      { kind: "circle", cx: 130, cy: 64, r: 12, opacity: 0.95 },
      { kind: "circle", cx: 92, cy: 110, r: 18, opacity: 0.95 },
      { kind: "circle", cx: 142, cy: 122, r: 9, opacity: 0.85 },
      { kind: "circle", cx: 74, cy: 144, r: 11, opacity: 0.9 },
    ],
  },
  // 12. Spire — vertical luminous rod with capping orbs (axis-mundi motif).
  spire: {
    name: "spire",
    viewBox: LUME_GLYPH_VIEWBOX,
    shapes: [
      {
        kind: "rect",
        x: 94,
        y: 32,
        width: 12,
        height: 136,
        rx: 6,
        opacity: 0.9,
      },
      { kind: "circle", cx: C, cy: 32, r: 14, opacity: 0.95 },
      { kind: "circle", cx: C, cy: 168, r: 14, opacity: 0.95 },
      { kind: "circle", cx: C, cy: C, r: 8, opacity: 0.9 },
    ],
  },
};

/** Frozen lookup of every form definition, keyed by its name. */
export const LUME_FORMS: Readonly<Record<LumeFormName, LumeFormDefinition>> =
  FORMS;

/** All 12 form names, in canonical render order. */
export const LUME_FORM_NAMES: readonly LumeFormName[] = Object.keys(
  FORMS
) as readonly LumeFormName[];

/** Resolve a form definition by name (exhaustive across `LumeFormName`). */
export function getLumeForm(name: LumeFormName): LumeFormDefinition {
  return FORMS[name];
}
