import type { LumeSpecimen } from "./specimens";

/** Stable specimen identity, deliberately separate from generated copy. */
export type LumeSpecimenIdentity = Omit<LumeSpecimen, "name" | "notes">;

/**
 * The 23 light-forms in canonical visitor order. Distribution:
 *   Floor 1: NO. 01..06 (6 specimens, plates I..III)
 *   Floor 2: NO. 07..12 (6 specimens, plates I..III)
 *   Floor 3: NO. 13..18 (6 specimens, plates I..III)
 *   Floor 4: NO. 19..23 (5 specimens, plates I..III)
 */
export const LUME_SPECIMEN_IDENTITIES: readonly LumeSpecimenIdentity[] = [
  // ── Floor 1 ────────────────────────────────────────────────────────────
  {
    number: 1,
    floor: 1,
    plate: "I",
    form: "halo",
    hue: "amber",
    qr: "lu-01-aurum",
    image: {
      // Placeholder artwork shipping under apps/web/public so the
      // image-vs-glyph fallback path is exercised end-to-end. Real
      // exhibition artwork lands via issue #63.
      src: "/images/specimens/lu-01-aurum.svg",
      alt: {
        en: "Aurum — a warm amber halo of layered light",
        "zh-tw": "金光 — 層層相疊的溫暖琥珀色光環",
        "zh-cn": "金光 — 层层相叠的温暖琥珀色光环",
        ja: "金の灯 — 重なり合う暖かな琥珀色のヘイロー",
        ko: "금빛 — 겹겹이 퍼지는 따뜻한 호박빛 헤일로",
      },
    },
  },
  {
    number: 2,
    floor: 1,
    plate: "I",
    form: "orb",
    hue: "amber",
    qr: "lu-02-ember",
  },
  {
    number: 3,
    floor: 1,
    plate: "II",
    form: "ring",
    hue: "amber",
    qr: "lu-03-laurel",
  },
  {
    number: 4,
    floor: 1,
    plate: "II",
    form: "petal",
    hue: "rose",
    qr: "lu-04-petal",
  },
  {
    number: 5,
    floor: 1,
    plate: "III",
    form: "mote",
    hue: "amber",
    qr: "lu-05-mote",
  },
  {
    number: 6,
    floor: 1,
    plate: "III",
    form: "bloom",
    hue: "rose",
    qr: "lu-06-bloom",
  },

  // ── Floor 2 ────────────────────────────────────────────────────────────
  {
    number: 7,
    floor: 2,
    plate: "I",
    form: "ring",
    hue: "cyan",
    qr: "lu-07-tide",
  },
  {
    number: 8,
    floor: 2,
    plate: "I",
    form: "tide",
    hue: "cyan",
    qr: "lu-08-mirage",
  },
  {
    number: 9,
    floor: 2,
    plate: "II",
    form: "comet",
    hue: "cyan",
    qr: "lu-09-comet",
  },
  {
    number: 10,
    floor: 2,
    plate: "II",
    form: "lattice",
    hue: "cyan",
    qr: "lu-10-lattice",
  },
  {
    number: 11,
    floor: 2,
    plate: "III",
    form: "prism",
    hue: "violet",
    qr: "lu-11-prism",
  },
  {
    number: 12,
    floor: 2,
    plate: "III",
    form: "shard",
    hue: "violet",
    qr: "lu-12-shard",
  },

  // ── Floor 3 ────────────────────────────────────────────────────────────
  {
    number: 13,
    floor: 3,
    plate: "I",
    form: "halo",
    hue: "magenta",
    qr: "lu-13-rosa",
  },
  {
    number: 14,
    floor: 3,
    plate: "I",
    form: "petal",
    hue: "magenta",
    qr: "lu-14-fold",
  },
  {
    number: 15,
    floor: 3,
    plate: "II",
    form: "spire",
    hue: "magenta",
    qr: "lu-15-spire",
  },
  {
    number: 16,
    floor: 3,
    plate: "II",
    form: "bloom",
    hue: "violet",
    qr: "lu-16-vesper",
  },
  {
    number: 17,
    floor: 3,
    plate: "III",
    form: "lattice",
    hue: "magenta",
    qr: "lu-17-vault",
  },
  {
    number: 18,
    floor: 3,
    plate: "III",
    form: "tide",
    hue: "violet",
    qr: "lu-18-cadence",
  },

  // ── Floor 4 ────────────────────────────────────────────────────────────
  {
    number: 19,
    floor: 4,
    plate: "I",
    form: "orb",
    hue: "mint",
    qr: "lu-19-fern",
  },
  {
    number: 20,
    floor: 4,
    plate: "I",
    form: "mote",
    hue: "mint",
    qr: "lu-20-meadow",
  },
  {
    number: 21,
    floor: 4,
    plate: "II",
    form: "shard",
    hue: "mint",
    qr: "lu-21-pact",
  },
  {
    number: 22,
    floor: 4,
    plate: "II",
    form: "comet",
    hue: "violet",
    qr: "lu-22-vigil",
  },
  {
    number: 23,
    floor: 4,
    plate: "III",
    form: "spire",
    hue: "amber",
    qr: "lu-23-keep",
  },
];
