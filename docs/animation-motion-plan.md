# Lume — Motion & Animation Implementation Plan

> Self-contained spec for implementing app-wide animation: component micro-interactions,
> page transitions, and signature moments, for a "robust modern-app feel."
> Written to be delegated to an agent (kiro). Read this whole file before starting.
> Suggested home in repo: `docs/animation-motion-plan.md`.

## Context & constraints (read first)

- **Stack:** Next.js 16 App Router, React 18, Tailwind v4 with a `@theme inline` token bridge
  in `apps/web/app/globals.css`. Styling is Tailwind utility classes; the `LU` TS token map
  (`@lume/data/tokens`) is used **only** for SVG stroke/fill attrs, dynamic gradient strings,
  and the `/system` page — never for layout/color a utility could cover.
- **Animation today:** hand-rolled, per-route inline `<style>` + `@keyframes` (cover halo spin,
  `/complete` numeral/tile/halo, scan pulse). No shared motion system, no page transitions,
  almost no press feedback. `prefers-reduced-motion` is already honored where motion exists.
- **Shell:** `.lume-stage/.lume-frame/.lume-screen` (globals.css) render `display:contents` below
  768px and a centered iPhone frame at ≥768px. `.lume-screen` is the scroll container; pages read
  `min-height` from `--lu-screen-h`.
- **Audience:** visitors' own phones at a museum; offline PWA. iOS-Safari-heavy.
- **Engineering ethos (enforce):** minimum code that solves the problem; no speculative
  abstractions; surgical changes; match existing style (per-route inline `<style>` is an accepted
  pattern); every changed line traces to this plan. Bundle stays ~0kb — **no animation
  dependencies**.

## Global motion system (the decisions everything follows)

- **Authoring:** Hybrid. Components = dependency-free CSS/Tailwind keyframes. Route transitions =
  native **View Transitions API** + a ~20-line wrapper hook (no library, no experimental Next flag).
- **Personality:** spring-forward everywhere. Default curve `--lu-ease-spring:
  cubic-bezier(.34,1.56,.64,1)`. A non-overshoot curve `--lu-ease-out: cubic-bezier(.22,1,.36,1)`
  exists for cases where overshoot must be clamped (full-screen slides, progress bars).
- **Durations:** `instant 120ms / fast 200ms / base 320ms / slow 480ms`.
- **Overshoot guardrail:** never overshoot a full-screen *translate* (it exposes a gap at the frame
  edge). Overshoot opacity/scale only; clamp translateX, and back slides with `--lu-base-deep`.
- **Reduced motion (policy = "reduced not zero", OS-level only, NO in-app toggle):** under
  `prefers-reduced-motion: reduce` → all loops off; slides/springs/shake/bloom become instant or
  ≤150ms opacity fades; morphs degrade to a plain crossfade; keep gentle essential crossfades.
- **Perf budget (hard):** animate **transform/opacity only**. No per-frame `filter`/`box-shadow`/
  `width` animation in the 23× gallery. Single-instance width animations (progress bar) are fine.
  60fps on a mid-range phone; `will-change` used sparingly.

## Execution order & dependency graph

```
P1 Motion foundation ──┬─> P2 Page transitions ──┬─> P4 Content stagger
                       │                          └─> P7 Morphs + celebration count-up
                       ├─> P3 Component micro-interactions
                       ├─> P5 Glyph loop ─────────────> P7
                       └─> P6 Collect reveal + scan toasts ─> P7
```

P1 must land first (everything consumes its tokens/keyframes). P4 needs P2's nav-direction signal.
P7 needs P2 (VT wrapper), P5 (hero halo-breathe hand-off), P6 (SuccessSheet hero name).

Each phase ends with the **verification gate**: `turbo typecheck && turbo lint && turbo build`
(or the repo's `check` script) green, plus a visual pass on the dev server, plus a
reduced-motion emulation pass.

---

## Phase 1 — Motion foundation  *(blocks all)*

**Goal:** one source of truth for easing, durations, shared keyframes, and the reduced-motion
switch. Concentrating shared keyframes here keeps `globals.css` contention low; later phases mostly
*consume* these and add only page-local keyframes inline (the existing per-route pattern).

**File:** `apps/web/app/globals.css`

1. Add tokens to `:root` (next to the existing `--lu-*`):
   ```css
   --lu-ease-spring: cubic-bezier(.34, 1.56, .64, 1);
   --lu-ease-out:    cubic-bezier(.22, 1, .36, 1);
   --lu-dur-instant: 120ms;
   --lu-dur-fast:    200ms;
   --lu-dur-base:    320ms;
   --lu-dur-slow:    480ms;
   ```
2. Bridge easings + named animations into Tailwind v4 inside `@theme inline`:
   ```css
   --ease-spring: var(--lu-ease-spring);
   --ease-out-lu: var(--lu-ease-out);
   --animate-rise-in:      rise-in   var(--lu-dur-base) var(--lu-ease-spring) both;
   --animate-bloom:        bloom     var(--lu-dur-slow) var(--lu-ease-out)    both;
   --animate-halo-breathe: halo-breathe 4s ease-in-out infinite;
   --animate-shake:        shake     300ms ease-in-out both;
   --animate-collect-pop:  collect-pop var(--lu-dur-slow) var(--lu-ease-spring) both;
   --animate-toast-in:     toast-in  var(--lu-dur-base) var(--lu-ease-spring) both;
   ```
   (Tailwind v4 generates `ease-spring`, `animate-rise-in`, etc. from these keys.)
3. Define the shared `@keyframes` once in this file:
   ```css
   @keyframes rise-in      { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
   @keyframes bloom        { from { opacity:.9; transform:scale(.2) } to { opacity:0; transform:scale(1.6) } }
   @keyframes halo-breathe { 0%,100% { opacity:.7; transform:scale(1) } 50% { opacity:1; transform:scale(1.06) } }
   @keyframes shake        { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
   @keyframes collect-pop  { from { opacity:0; transform:scale(.6) } to { opacity:1; transform:scale(1) } }
   @keyframes toast-in     { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:none } }
   ```
4. Reduced-motion scaffolding (global; phases add their own targeted overrides too):
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::view-transition-old(*), ::view-transition-new(*) {
       animation-duration: .01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: .01ms !important;
     }
   }
   ```
   Per-phase, prefer explicit "snap to settled" overrides (as `/complete` already does) over relying
   solely on this blanket rule, especially for `shake`/`bloom`.
5. The per-index stagger helper: pages set `style={{ "--i": index }}` and use
   `[animation-delay:calc(var(--i)*60ms)]` (gallery breathe uses `*180ms`). No global rule needed.

**Verify:** build green; a throwaway element with `animate-rise-in` rises+settles; reduced-motion
emulation snaps it instantly.

---

## Phase 2 — Page transitions (VT wrapper + push/pop + sheets)  *(needs P1)*

**Goal:** route changes animate. Default = directional push/pop; `/settings`, `/scan`, `/saved`
present as bottom-up sheets.

**New file:** `apps/web/lib/use-view-transition-router.ts` (lib already holds `lume-state.ts`).
- Wrap `useRouter`. Expose `navigate(href, opts?)` and `back()`.
- A module-level `direction` value (`"forward" | "back" | "sheet"`); `navigate` defaults forward,
  `back` sets `"back"`, `navigate(href,{mode:"sheet"})` sets `"sheet"`.
- Before navigating: set `document.documentElement.dataset.vt = direction`, then
  `if (!document.startViewTransition) return router.push(href)` (fallback), else
  `document.startViewTransition(() => router.push(href))`. Same for `back()` with `router.back()`.

**File:** `apps/web/app/globals.css` — VT styles:
```css
::view-transition-old(root), ::view-transition-new(root) { animation-duration: var(--lu-dur-base); }
/* forward push: clamp translate (no overshoot on X), back with deep canvas */
[data-vt="forward"]::view-transition-old(root){ animation: vt-out-left  var(--lu-dur-base) var(--lu-ease-out) both; }
[data-vt="forward"]::view-transition-new(root){ animation: vt-in-right  var(--lu-dur-base) var(--lu-ease-out) both; }
[data-vt="back"]::view-transition-old(root)   { animation: vt-out-right var(--lu-dur-base) var(--lu-ease-out) both; }
[data-vt="back"]::view-transition-new(root)   { animation: vt-in-left   var(--lu-dur-base) var(--lu-ease-out) both; }
/* sheet: old stays, new slides up */
[data-vt="sheet"]::view-transition-old(root)  { animation: none; }
[data-vt="sheet"]::view-transition-new(root)  { animation: vt-in-up var(--lu-dur-base) var(--lu-ease-spring) both; }
```
Define `vt-*` keyframes here (translateX ±100% / translateY 100% → 0 + opacity). Use `--lu-ease-out`
(not spring) for X slides per the guardrail; sheets may use spring (Y overshoot is safe — it
overshoots *upward* past rest then settles, no edge gap because the sheet is bottom-anchored).

**Wire call sites:** replace `router.push(...)` with `navigate(...)` across the 22 nav edges
(cover→language, language→onboarding, onboarding→permission, permission→scan, scan→collection,
card→saved/collection, complete→card, collection→scan, saved→collection, specimen→collection, …).
- `/settings`, `/scan`, `/saved` entries use `navigate(href, {mode:"sheet"})`.
- "Back"/return-to-hub affordances use `back()` (or `navigate` with `back` when there's no history).
- **Onboarding nuance:** `permission → scan` is still a sheet, sliding up over `/permission`, so it
  reads as a first-run step; dismissing returns to `/permission`.
- **Sheets get an explicit close affordance** (Done / X) always. Drag-to-dismiss is a *progressive
  enhancement* — implement only if cheap; not required.

**Verify:** forward nav slides in from right, back pops left, the three sheet routes slide up;
unsupported browsers fall back to instant; reduced-motion → instant swaps. No edge gap on slides.

---

## Phase 3 — Component micro-interactions  *(needs P1)*

**Goal:** tactile feedback across the component inventory. Touch-first; desktop hover is secondary.

1. **Tactile press** — one shared treatment on every tappable: CTAs (cover Enter, language/onboarding/
   permission/complete/card buttons, SuccessSheet buttons), language rows, settings options, gallery
   tiles, gear/close icons. Use `active:scale-[.96] transition-transform duration-[120ms] ease-spring`
   (or a tiny `.lu-press` utility in globals if repetition is high). Ensure tappable wrappers are the
   element receiving `:active`.
2. **Selection-state** — language picker row: animate highlight/border-glow + bg fade-in on select
   (`/language`). Settings accent swatch: scale + fill on select (`/settings`, currently sets a
   border via `LU.accent.amber`). Any segmented control: slide the thumb to selection.
3. **Progress + counter** — unify the collection progress bar + the `SuccessSheet` bar
   (`scan-overlays.tsx:104` already `transition: width 240ms ease-out` → retune to `--lu-dur-base`
   / `--lu-ease-out`). The `N / 23` counter rolls or scale-pops when N increments (collection page,
   card, SuccessSheet). Keep it cheap (single element).
4. **Hover (desktop only)** — `@media (hover:hover)` lift `-2px` + soft glow on tiles/pills for the
   ≥768px iPhone-shell preview. No effect on touch.

**Verify:** press feedback on every interactive element; selection animates; progress fills and
counter ticks on a simulated collect; hover only affects desktop.

---

## Phase 4 — Content entrance stagger  *(needs P1, P2)*

**Goal:** forward (push) entrances cascade content in; back (pop) does not re-stagger.

- Read the nav direction from Phase 2 (`document.documentElement.dataset.vt`, or expose it from the
  hook). On a **forward** entrance only, the page's top-level content sections run `animate-rise-in`
  with `style={{ "--i": index }}` and `[animation-delay:calc(var(--i)*60ms)]`, starting partway
  through the 320ms slide so total entrance ≈ 500ms.
- On **back/pop**, render content settled (no stagger) — it should feel like it was always there.
- Apply to the standard pages (cover, language, onboarding, permission, collection, card, complete,
  specimen). A minimal `<Stagger>` wrapper or a small hook that toggles a `data-enter` attr is
  acceptable; keep it tiny and avoid a dependency.
- Reduced motion: content appears instantly (no rise, no stagger).

**Verify:** push into a page → header→body→footer cascade; press back into a prior page → no
re-cascade; revisited hub only staggers when pushed into.

---

## Phase 5 — Looping glyph animation on collected specimens  *(needs P1)*

**Goal:** collected specimens feel alive; locked stay static. Tiered by context.

**File:** `apps/web/components/specimen/lume-specimen.tsx`
- Add an optional `index?: number` prop (gallery passes the tile index) and a `hero?: boolean` prop.
- When `found` **and** not reduced-motion: the existing halo `<span>` (the `haloFill` layer) gets
  `animate-halo-breathe` with `style={{ "--i": index }}` and
  `[animation-delay:calc(var(--i)*180ms)]`. This animates **transform/opacity on the halo span only**
  (GPU-cheap, works for image-artwork specimens since it's the halo, not the glyph). Covers up to 23
  in the gallery without strobing.
- When `hero` (single-instance: specimen detail, achievement card, `/complete` reveal): additionally
  apply a richer glyph treatment — a `stroke-shimmer`/glow-breathe on the `GlyphSvg` strokes
  (glyph specimens only). Define that keyframe locally where used, or add to globals if reused 2+×.
- `found === false` (locked): no animation.

**Files touched by callers:** `collection/index-page-client.tsx` (pass `index`), specimen detail,
card, complete (pass `hero`).

**Verify:** gallery of collected specimens shimmers organically (desynced); locked stay still;
hero contexts get the richer glyph effect; reduced-motion → all loops off. Profile the gallery:
no layout/paint thrash, 60fps.

---

## Phase 6 — Collect reveal + scan toasts  *(needs P1; pairs with P2 sheet)*

**File:** `apps/web/components/scan/scan-overlays.tsx`

- **SuccessSheet (the reward beat):**
  - The sheet container rises as a bottom sheet (Phase 2 sheet transition, or a local `toast-in`/
    slide-up if it's rendered as an overlay rather than a route).
  - The hero `LumeSpecimenView` (currently absolutely positioned, static) gets `animate-collect-pop`
    (scale .6→1 spring + fade).
  - Add a one-shot **bloom** element behind the hero: an absolutely-positioned circle in the
    specimen hue with `animate-bloom` (scale .2→1.6, opacity .9→0). Transform/opacity only.
  - Progress bar fills (Phase 3 token) and the count ticks (Phase 3 counter).
  - After the pop settles, the hero hands off to the **looping halo-breathe** (Phase 5) — pass
    `hero`/found so the resting loop continues. Sequence so there's no double-trigger flash.
- **DuplicateToast / InvalidToast:** spring up from the bottom (`animate-toast-in`); auto-dismiss
  with a downward fade/slide. **InvalidToast** additionally gets `animate-shake` (the "rejected"
  signal). Reduced motion: invalid shows a static rose flash instead of shaking; toasts fade in
  place instead of springing.

**Verify:** scanning a new specimen → sheet up, hero pops with a hue bloom, bar fills, counter
ticks, hero settles into breathe. Dupe → amber toast springs up. Invalid → rose toast springs up +
shakes. Reduced-motion variants behave per policy.

---

## Phase 7 — Shared-element morphs + celebration count-up  *(needs P2, P5, P6)*

**Goal:** the highest-impact "modern app" moves.

- **Morph: collection tile → specimen detail hero.** In `collection/index-page-client.tsx`, on tile
  tap set `style={{ viewTransitionName: "specimen-hero" }}` on **only the tapped tile's**
  `LumeSpecimenView` (a name must be unique per transition), then navigate. In
  `specimen/[n]/page.tsx`, give the detail hero `view-transition-name: specimen-hero`. Use
  `data-vt="morph"` so the root does **not** also slide (rest of page crossfades); the named element
  tweens size/position. Back reverses it (clear the name after the transition).
- **Morph: SuccessSheet hero → specimen detail hero** on "View specimen". Apply the same
  `view-transition-name` to the sheet's hero just before navigating to `/specimen/[n]`.
- **Celebration count-up** (`complete/page.tsx`): the `23` numeral counts `0 → 23` (~700ms) via a
  small `useEffect` rAF/interval counter; on landing, fire a one-shot **bloom** (reuse Phase 1
  `animate-bloom`). Keep the existing halo spin + staggered tile spiral as-is. Reduced motion:
  render `23` immediately, no count, no bloom.

**Morph caveats to honor:** exactly one element per `view-transition-name` in the DOM at transition
time; names must be cleared/reset after navigation so the next morph is clean; if the VT API is
unsupported, navigation still works (no morph). Test the back direction.

**Verify:** tapping a gallery tile morphs it into the detail hero (rest crossfades); "View specimen"
from the collect sheet morphs the hero across; back reverses; `/complete` counts up then blooms;
reduced-motion degrades morphs to crossfade and shows static `23`.

---

## Cross-cutting checklist (apply in every phase)

- [ ] Transform/opacity only in hot paths; never animate `filter`/`box-shadow`/`width` across 23 tiles.
- [ ] Every new animation has a `prefers-reduced-motion: reduce` path ("reduced not zero").
- [ ] No new runtime dependency; no experimental Next flags.
- [ ] Shared keyframes/tokens live in `globals.css` (P1); page-specific keyframes stay in per-route
      inline `<style>` (existing pattern) to minimize `globals.css` merge contention.
- [ ] Match existing code style; changes trace to this plan; no unrelated refactors.
- [ ] Gate per phase: `typecheck` + `lint` + `build` green, dev-server visual pass, reduced-motion
      emulation pass. (A Playwright screenshot script exists in the repo for responsive checks.)
