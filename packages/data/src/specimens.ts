/**
 * Lume specimen catalogue — the 23 light-form specimens distributed across
 * the venue's four floors.
 *
 * Each entry pairs a stable identity (number, qr code, plate label) with
 * presentational data (form, accent hue, per-language names + field notes)
 * so every screen — gallery tile, scan-result sheet, detail plate,
 * completion reveal, and the export card — can render the same record.
 *
 * Identity rules:
 *   - `number` is 1..23 in canonical visitor order. It also drives the
 *     `/specimen/[n]` route and the rendered "NO. NN" label.
 *   - `qr` is the opaque slug embedded in printed QR codes (`?c=<qr>`).
 *     Slugs are stable: changing one invalidates the printed signage.
 *   - `floor` is 1..4 and groups specimens in the index gallery.
 *   - `plate` is a Roman numeral within a floor (Plate I..VI), used in the
 *     detail-plate chrome to evoke the field-guide aesthetic.
 *   - `form` picks one of the 12 abstract glyph shapes from `./glyphs.ts`.
 *   - `hue` picks one of the six accent colours defined in `./tokens.ts`.
 *
 * `SAMPLE_FOUND` is the prototype's seed of "already collected" specimens
 * used by the design preview — six specimens evenly spread across the four
 * floors so the gallery shows a realistic mix of locked + found tiles.
 */

import type { LumeFormName } from "./glyphs";
import type { LumeLocale } from "./locales";
import { LUME_SPECIMEN_CONTENT } from "./specimen-content.generated";
import type { LumeSpecimenIdentity } from "./specimen-identities";
import { LUME_SPECIMEN_IDENTITIES } from "./specimen-identities";
import type { LumeAccent } from "./tokens";

export type { LumeSpecimenIdentity } from "./specimen-identities";

/** Floors the specimens are distributed across (1..4). */
export type LumeFloor = 1 | 2 | 3 | 4;

/** A 1..23 visitor-order number for a specimen. */
export type LumeSpecimenNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23;

/** Localised display copy for a single specimen. */
export type LumeSpecimenName = Readonly<Record<LumeLocale, string>>;

/**
 * Optional artwork attached to a specimen. When set, every renderer that
 * understands the image field swaps the abstract glyph out for the image
 * (correctly sized/cropped for the surface). Keeping the field optional
 * means the catalogue can ship before any artwork has landed.
 *
 *   - `src` is consumed verbatim by `<img src=...>`. The build does not
 *     remap the value, so absolute paths and pre-bundled URLs both work.
 *     Public-folder paths (e.g. `/images/specimens/<slug>.svg`) are the
 *     conventional choice.
 *   - `alt` is per-locale so screen readers can announce the artwork in
 *     the visitor's active language. The English string is required and
 *     used as a fallback when the active locale is missing.
 */
export interface LumeSpecimenImage {
  /** Per-language alt text. The English string is the canonical fallback. */
  alt: LumeSpecimenName;
  /** URL handed to `<img src>`; typically a path under the web public folder. */
  src: string;
}

/**
 * One entry in the 23-specimen catalogue. The shape is deliberately flat
 * so renderers can map over it without further normalisation.
 */
export interface LumeSpecimen {
  /** Floor (1..4) the specimen lives on. */
  floor: LumeFloor;
  /** One of the 12 abstract glyph forms. */
  form: LumeFormName;
  /** Accent hue used for the glow halo and plate accents. */
  hue: LumeAccent;
  /**
   * Optional artwork that replaces the generated glyph on every surface
   * that understands images (gallery, detail, scan-success, card). When
   * absent, the surface falls back to the abstract `form`/`hue` glyph.
   */
  image?: LumeSpecimenImage;
  /** Per-language display name. */
  name: LumeSpecimenName;
  /** Per-language short field-guide notes (one or two sentences). */
  notes: LumeSpecimenName;
  /** 1..23 visitor-order number. Drives `/specimen/[n]` and "NO. NN" chrome. */
  number: LumeSpecimenNumber;
  /**
   * Plate label within the floor — a Roman numeral string ("I".."VI"). Two
   * specimens may share a plate when the prototype groups them visually on
   * the same printed plate.
   */
  plate: string;
  /** Stable QR-payload slug (used as `?c=<qr>`). */
  qr: string;
}

/**
 * Helper for the table below — keeps each generated content lookup close to
 * the stable identity row while preventing sheet content from changing QR or
 * specimen-number identity.
 */
function specimen(entry: LumeSpecimenIdentity): LumeSpecimen {
  const content = LUME_SPECIMEN_CONTENT[entry.qr];
  if (!content) {
    throw new Error(`Missing generated content for specimen ${entry.qr}`);
  }
  return { ...entry, name: content.name, notes: content.notes };
}

/** Full catalogue with generated owner-editable copy attached to stable identity. */
export const LUME_SPECIMENS: readonly LumeSpecimen[] =
  LUME_SPECIMEN_IDENTITIES.map(specimen);

/**
 * Total number of specimens in the catalogue. Pinned at 23 so consumers
 * can use it directly in `NN / 23` progress chrome and 23/23-completion
 * checks without re-counting the array.
 */
export const LUME_TOTAL_SPECIMENS = 23 as const;

/** Compile-time assertion: the table really does contain 23 entries. */
type _AssertTwentyThree = LUME_SPECIMENS_LENGTH extends 23 ? true : never;
type LUME_SPECIMENS_LENGTH = typeof LUME_SPECIMENS extends {
  length: infer L;
}
  ? L
  : never;
// Reference the assertion so noUnusedLocals (if enabled) stays happy.
export type LumeSpecimenAssertion = _AssertTwentyThree;

/** Stable lookup of every specimen, keyed by its 1..23 number. */
export const LUME_SPECIMENS_BY_NUMBER: Readonly<
  Record<LumeSpecimenNumber, LumeSpecimen>
> = LUME_SPECIMENS.reduce<Record<number, LumeSpecimen>>((acc, s) => {
  acc[s.number] = s;
  return acc;
}, {}) as Readonly<Record<LumeSpecimenNumber, LumeSpecimen>>;

/** Stable lookup of every specimen, keyed by its QR slug. */
export const LUME_SPECIMENS_BY_QR: Readonly<Record<string, LumeSpecimen>> =
  LUME_SPECIMENS.reduce<Record<string, LumeSpecimen>>((acc, s) => {
    acc[s.qr] = s;
    return acc;
  }, {});

/** Specimens grouped by floor, in canonical visitor order within each floor. */
export const LUME_SPECIMENS_BY_FLOOR: Readonly<
  Record<LumeFloor, readonly LumeSpecimen[]>
> = {
  1: LUME_SPECIMENS.filter((s) => s.floor === 1),
  2: LUME_SPECIMENS.filter((s) => s.floor === 2),
  3: LUME_SPECIMENS.filter((s) => s.floor === 3),
  4: LUME_SPECIMENS.filter((s) => s.floor === 4),
};

/**
 * Resolve a specimen by visitor number, returning `undefined` for an
 * out-of-range or non-integer input. Callers are expected to handle the
 * `undefined` case so consumers like `/specimen/[n]` can render a
 * "not yet collected" or 404 fallback safely.
 */
export function getSpecimenByNumber(n: number): LumeSpecimen | undefined {
  if (!(Number.isFinite(n) && Number.isInteger(n))) {
    return;
  }
  if (n < 1 || n > LUME_TOTAL_SPECIMENS) {
    return;
  }
  return LUME_SPECIMENS_BY_NUMBER[n as LumeSpecimenNumber];
}

/**
 * Resolve a specimen from a `?c=<code>` deep-link payload. The payload may
 * be a full URL (`https://.../scan?c=lu-08-mirage`) or a bare slug
 * (`lu-08-mirage`); both forms are normalised to the slug before lookup.
 * Returns `undefined` for unknown slugs.
 */
export function getSpecimenByQrPayload(
  payload: string
): LumeSpecimen | undefined {
  const slug = extractQrSlug(payload);
  if (!slug) {
    return;
  }
  return LUME_SPECIMENS_BY_QR[slug];
}

/**
 * Bare-slug shape used to detect QR codes that are not URL-wrapped. We
 * keep the regex at module scope so `extractQrSlug` can be called per
 * scanned frame without re-compiling the literal.
 */
const BARE_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/i;

/**
 * Pull the QR slug out of a payload. Accepts:
 *   - a bare slug — `"lu-08-mirage"`
 *   - a full URL with `?c=...` — `"https://lume.example/scan?c=lu-08-mirage"`
 *   - a relative path — `"/scan?c=lu-08-mirage"`
 *
 * Trims surrounding whitespace and lowercases the result so casing on
 * printed signage cannot break recognition.
 */
export function extractQrSlug(payload: string): string | undefined {
  const trimmed = payload.trim();
  if (trimmed.length === 0) {
    return;
  }
  // Try the URL parser first — it cleanly handles full URLs and relative paths.
  try {
    const url = new URL(trimmed, "https://lume.local");
    const c = url.searchParams.get("c");
    if (c) {
      return c.trim().toLowerCase();
    }
  } catch {
    // not a URL — fall through to bare-slug handling.
  }
  // Bare slugs only contain `lu-`-style characters; reject anything else
  // (we do not want to treat arbitrary text from misread QR codes as a
  // slug and risk a duplicate-toast for nonsense input).
  if (BARE_SLUG_PATTERN.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return;
}

/**
 * Seed of "already collected" specimen numbers used by the gallery and
 * card design previews. Six specimens (one or two from each floor) so the
 * grid renders a realistic mix of locked + found tiles before any real
 * scanning has happened.
 */
export const SAMPLE_FOUND: readonly LumeSpecimenNumber[] = [
  1, 4, 8, 11, 16, 21,
];

/**
 * Resolved per-render visual choice for a specimen — either an image
 * (when the catalogue has supplied one) or the generated glyph.
 *
 * The discriminator lets every renderer (gallery tile, detail plate,
 * scan-success sheet, achievement card) branch on `kind` without
 * duplicating the locale-resolution rules.
 */
export type LumeSpecimenVisual =
  | { alt: string; kind: "image"; src: string }
  | { form: LumeFormName; hue: LumeAccent; kind: "glyph" };

/**
 * Pick the visual rendering for a specimen. Returns the image branch
 * (with its alt text resolved against `lang`) when the specimen has an
 * `image` set; otherwise returns the abstract-glyph branch.
 *
 * Pure and side-effect-free so renderers can call it inside JSX without
 * worrying about render counts.
 */
export function getSpecimenVisual(
  specimen: LumeSpecimen,
  lang: LumeLocale
): LumeSpecimenVisual {
  if (specimen.image) {
    const alt = specimen.image.alt[lang] ?? specimen.image.alt.en;
    return { kind: "image", src: specimen.image.src, alt };
  }
  return { kind: "glyph", form: specimen.form, hue: specimen.hue };
}
