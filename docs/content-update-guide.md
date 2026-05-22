# Content-update guide

The Lume catalogue is intentionally an engineer-managed Level-1 content
table: every piece of game content (specimen names, glyph forms, QR
slugs, locale strings) lives in versioned source files in
`packages/data/src`. There is no CMS. This page is the runbook for
making content edits without breaking the running app or invalidating
printed signage.

## Where the content lives

| Concern | File | What it owns |
| --- | --- | --- |
| Specimen catalogue | `packages/data/src/specimens.ts` | The 23 specimens — number, floor, plate, form, hue, QR slug, per-language `name`, per-language `notes`. |
| Localized UI strings | `packages/data/src/locales.ts` | The five locale bundles (`en`, `zh-tw`, `zh-cn`, `ja`, `ko`) keyed by `LocaleKey`. Specimen display names live alongside the specimens, not here. |
| Specimen glyph forms | `packages/data/src/glyphs.ts` | The 12 abstract SVG forms used by `specimen.form`. |
| Design tokens | `packages/data/src/tokens.ts` | Aurora gradients, accent palette, glass tiers. |

## Editing a specimen

Open `packages/data/src/specimens.ts` and find the `LUME_SPECIMENS`
array. Each entry is a single object:

```ts
specimen({
  number: 8,
  floor: 2,
  plate: "I",
  form: "tide",
  hue: "cyan",
  qr: "lu-08-mirage",
  name: {
    en: "Mirage",
    "zh-tw": "海市",
    "zh-cn": "海市",
    ja: "蜃気楼",
    ko: "신기루",
  },
  notes: {
    en: "Three layered waves pass through one another like distant heat haze.",
    "zh-tw": "三層波浪互相穿越,有如遠方夏日的熱氣折射。",
    "zh-cn": "三层波浪互相穿越,有如远方夏日的热气折射。",
    ja: "三本の波が重なり抜けて、遠い夏の陽炎のように揺らぐ。",
    ko: "세 겹의 물결이 서로를 통과하며, 먼 여름날의 아지랑이처럼 흔들립니다.",
  },
}),
```

### Editing the name in any of the five languages

- Change the relevant string in `name`.
- Make sure the new string fits inside the gallery tile and the
  detail-plate heading. The gallery tile renders at ~96px wide; very
  long names (more than ~14 latin characters or ~7 CJK characters)
  will wrap awkwardly. If a translation is structurally longer than
  the others, prefer to abbreviate it rather than adjust the layout.

### Editing the field-guide notes

- Change the relevant string in `notes`.
- Notes target one or two sentences. Keep them short enough to read
  comfortably on the detail plate at mobile sizes — the body text
  caps at ~460px wide.

### Adding or removing a specimen

The catalogue is type-locked at 23 entries (`LUME_TOTAL_SPECIMENS`).
The unit tests assert the count, the QR-slug uniqueness, and that
every entry has all five locale strings. Changing the number of
specimens requires changes to:

1. `LUME_SPECIMENS` (add/remove the row).
2. `LUME_TOTAL_SPECIMENS` (the `as const` literal).
3. `LumeSpecimenNumber` (the union of allowed numbers).
4. The compile-time assertion `_AssertTwentyThree`.
5. The unit tests in `packages/data/src/specimens.test.ts`.

This is intentional friction — the visitor flow assumes 23 across the
gallery, the `23 / 23` chrome, the completion reveal, and the card.
Treat a count change as a product decision, not a content tweak.

### Reordering specimens within a floor

The visitor sees specimens in `number` order within each floor. To
reorder:

1. Decide the new sequence.
2. Update each affected entry's `number` field.
3. Verify visitor order still spans `1..23` with no gaps (the test
   in `packages/data/src/specimens.test.ts` asserts this).
4. Reprint the QR signage if floor metadata is also part of the print
   layout.

## Editing the QR mapping

The `qr` field on each specimen is the slug embedded in the printed
QR code (`?c=<qr>`). It is the only identifier the scanner uses to
look up a specimen.

> **Reprint required.** Changing a `qr` value invalidates the
> existing printed signage for that specimen. Always treat a QR-slug
> change as a deploy-and-reprint operation, not a content tweak.

Process:

1. Pick a new slug. Convention so far is `lu-NN-<short-name>` so the
   pattern stays readable when staff scan a code by accident.
2. Update the relevant specimen's `qr` field.
3. The unit tests will catch a duplicate slug and fail the build —
   fix the duplicate before continuing.
4. Regenerate the printable QR codes:
   - Run the dev server: `bun run dev`.
   - Open `http://localhost:3000/dev` (the dev QR-codes page).
   - Print or download the regenerated codes for the affected
     specimen(s).
5. Replace the printed signage in the venue alongside the deploy
   that ships the slug change. Out-of-sync slugs and signage will
   surface as `'invalid'` toasts during scanning.

## Editing locale strings

UI strings (chrome, buttons, recovery copy) live in
`packages/data/src/locales.ts`. The English bundle (`EN`) is the
canonical key set; every other bundle is statically required to
satisfy `LumeLocaleBundle`.

### Adding a new key

1. Add the key + English copy to `EN`.
2. Translate the new key in every other bundle (`ZH_TW`, `ZH_CN`,
   `JA`, `KO`). The TypeScript compiler will refuse to build until
   every bundle satisfies the new key, so a missing translation is a
   compile-time error rather than a runtime English fallback.
3. Use the new key in the consuming component via
   `useLocale().t.<key>` or `useLocale().format("<key>", { ... })`
   for templates with `{name}` placeholders.

### Editing an existing key

1. Update the English copy in `EN` and the equivalent in the four
   other bundles.
2. Sanity-check overflow on every screen that consumes the key —
   button copy, in particular, is bounded by the pill width.
3. Strings that include `{name}` placeholders are rendered via
   `format(key, vars)`; the placeholder must remain spelled exactly
   the same across all five languages or the placeholder leaks.

### Adding a new language

This is a structural change, not a content tweak — the
`LUME_LOCALES` tuple, `LumeLocale` type, the locale-label map, and
every consumer of `useLocale()` need to be touched. Open an issue
before starting.

## Editing the glyph language

Specimen forms (the abstract SVG shapes used in the gallery and
detail plate) live in `packages/data/src/glyphs.ts`. Each form is a
list of `LumeGlyphShape` primitives on a fixed `200x200` viewBox with
`(100, 100)` as the visual centre.

### Tweaking an existing form

1. Edit the relevant entry in `FORMS`.
2. View the changes locally at `/system/specimens` — every specimen
   that uses the form re-renders against the design system tile.
3. Keep the inner safe radius around 92px so the glow halo applied
   by `LumeSpecimen` does not clip the shape.

### Adding a new form

1. Add the form name to `LumeFormName` (literal union).
2. Add an entry in `FORMS` with `name`, `viewBox`, and `shapes`.
3. The exhaustive `getLumeForm` lookup will type-check that the
   new form is reachable.
4. Use the new form on a specimen by setting `specimen.form` to its
   name.

## Smoke checks before committing

Run the standard quality gates after any content change:

```sh
bun run check       # lint
bun run typecheck   # tsc across the workspace
bun test            # the catalogue assertions live in packages/data
```

The `bun test` run catches the most common content-edit mistakes:
missing translations, duplicate QR slugs, gaps in `number`, and
references to specimens that don't exist.

## Common pitfalls

- **Forgot to reprint after a slug change.** Visitors hit the `code
  not recognised` toast. Resolve by reverting the slug to the
  printed value or rolling out new signage.
- **Copy is too long for the gallery tile.** The grid wraps so the
  tile gets taller than its neighbours, breaking the floor section's
  visual rhythm. Shorten the localized name or split the issue into
  a layout change before merging.
- **Edited only the English string.** TypeScript catches missing
  keys in other bundles, but it does not catch stale translations.
  When the English copy changes meaning, audit every other bundle.
