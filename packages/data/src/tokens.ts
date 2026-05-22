/**
 * Lume design tokens — the typed source-of-truth for the dark aurora theme.
 *
 * Colors are organized into:
 *   - `base`: opaque backgrounds + text inks for the deep aurora canvas
 *   - `glass`: translucent surface tiers stacked over the base
 *   - `accent`: the six light-form accent hues (amber, cyan, magenta, mint,
 *     violet, rose) used for specimen glow halos and per-floor tints
 *   - `rule`: hairline divider colors for glassy plates
 *   - `aurora`: prebuilt CSS gradient strings for the cover/page/halo surfaces
 *
 * The same tokens are mirrored as CSS custom properties on `:root` in
 * `apps/web/app/globals.css` (e.g. `--lu-base-deep`, `--lu-accent-amber`,
 * `--lu-aurora-cover`). Either source can be consumed; the TS map exists so
 * non-React code (e.g. card export, SVG generators) has typed access without
 * reading the DOM.
 */
export const LU = {
  base: {
    /** Deepest canvas color, used for body/html background. */
    deep: "#08080d",
    /** Slightly raised secondary surface (sheets, cards behind glass). */
    night: "#0e0d18",
    /** Primary text ink, near-white for legibility on the deep canvas. */
    ink: "#f6f6fb",
    /** Secondary text ink (~72% opacity equivalent). */
    ink2: "rgba(246, 246, 251, 0.72)",
    /** Tertiary text ink (~48% opacity equivalent). */
    ink3: "rgba(246, 246, 251, 0.48)",
  },
  glass: {
    /** Tier-1 glass: lightest translucent fill. */
    surface1: "rgba(255, 255, 255, 0.04)",
    /** Tier-2 glass: standard sheet/card fill. */
    surface2: "rgba(255, 255, 255, 0.07)",
    /** Tier-3 glass: emphasized plate/dock fill. */
    surface3: "rgba(255, 255, 255, 0.10)",
  },
  accent: {
    amber: "#ffb755",
    cyan: "#69e0ff",
    magenta: "#ff7adf",
    mint: "#7ef0c4",
    violet: "#b390ff",
    rose: "#ff8da1",
  },
  rule: {
    /** Hairline glass border / divider. */
    hair: "rgba(255, 255, 255, 0.06)",
    /** Stronger glass border for emphasized chrome. */
    strong: "rgba(255, 255, 255, 0.12)",
  },
  aurora: {
    /**
     * Cover-screen aurora: a violet-cyan halo bias above the central glow,
     * fading into the deep base. Used as full-bleed background on `/`.
     */
    cover:
      "radial-gradient(60% 40% at 50% 35%, rgba(179, 144, 255, 0.35), transparent 70%), radial-gradient(50% 35% at 70% 70%, rgba(105, 224, 255, 0.18), transparent 70%), linear-gradient(180deg, #08080d 0%, #0e0d18 100%)",
    /**
     * Default page aurora: subtle violet wash from the top of the viewport,
     * used on most non-cover screens to keep the canvas alive.
     */
    page: "radial-gradient(80% 60% at 50% -10%, rgba(179, 144, 255, 0.18), transparent 60%), linear-gradient(180deg, #08080d 0%, #08080d 100%)",
    /**
     * Conic halo: the rotating amber→cyan→violet→magenta ring used behind
     * the central glow on cover and the completion reveal.
     */
    halo: "conic-gradient(from 90deg at 50% 50%, rgba(255, 183, 85, 0.40), rgba(105, 224, 255, 0.40), rgba(179, 144, 255, 0.40), rgba(255, 122, 223, 0.40), rgba(255, 183, 85, 0.40))",
  },
} as const;

/** The set of named accent hues (one per light-form floor / specimen group). */
export type LumeAccent = keyof typeof LU.accent;

/** Stable lookup of the accent palette for renderers iterating per-hue. */
export const LU_ACCENTS = Object.keys(LU.accent) as readonly LumeAccent[];

/** The full Lume token tree as a frozen literal type. */
export type LumeTokens = typeof LU;
