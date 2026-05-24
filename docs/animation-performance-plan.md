# Lume — Animation Performance Plan (revises the Motion plan)

> Self-contained spec to fix laggy animation on the Lume PWA. It **revises** parts of
> `docs/animation-motion-plan.md` (notably it **removes the View Transitions API**).
> Written to be delegated to an agent (kiro). Read this whole file before starting.
> **Fold this into the open PR #100** — do not merge #100 first. The goal is that #100
> lands in its final, performant form.

## Why (diagnosis, already confirmed)

Symptom: page transitions stutter **on every navigation, including revisited (cached) routes,
on a flagship iPhone**; the collection gallery also feels heavy. Both reproduced; this is a
**structural** cost, not a weak-GPU budget problem. Root causes found in code:

1. **View Transitions snapshot cost.** `lib/use-view-transition-router.ts` calls
   `document.startViewTransition()` on every nav, and `globals.css` animates
   `::view-transition-old/new(root)` — i.e. the **whole document**. The keyframes themselves are
   cheap (`translateX`/opacity), so the stutter is the **snapshot step**: the browser
   force-rasterizes the entire page (blurred halos, big shadows, ~20 infinitely-breathing layers
   all "dirty") into old+new textures, then iOS Safari composites two full-viewport textures —
   every transition, cached or not. Plus a `specimen-hero` shared-element group.
2. **Breathing on blurred layers.** `components/specimen/lume-specimen.tsx` runs
   `animate-halo-breathe` (4s infinite scale+opacity) on a `filter: blur(6px)` layer for **every
   found gallery tile** (~20 on screen). Animating scale on a blurred layer forces per-frame
   re-rasterization of the blur, ×~20, continuously (battery + GPU even when idle). The halo is
   **already a soft radial-gradient**, so the `blur()` filter is largely redundant.
3. **No prefetch.** `router.prefetch` is used 0×; 20 of 23 navigations go through the custom
   `navigate()` hook (`router.push`, which does **not** prefetch). First visit to a route fetches
   the RSC payload + route JS on tap. (Secondary cause — does not explain the every-time stutter,
   but worth fixing.)

## Decisions (from grilling — these are settled, implement as written)

- **Drop the View Transitions API entirely.** Navigation becomes a cheap CSS **enter-only**
  transform animation (no full-page snapshot). The specimen tile→hero morph is reimplemented as a
  hand-rolled **FLIP** (no VT).
- **Keep the breathing effect, make it cheap.** De-blur the animated halo, make the loop
  opacity-led, and **pause off-screen tiles** so only visible specimens animate.
- **Broad blur/shadow diet, with a "keep the look" guardrail.** Cap blur radii and oversized
  shadows app-wide, but compensate by softening the *source* (gradient stops / alpha) so the aurora
  still reads soft at smaller radii. Re-verify the aurora screens visually.
- **Prefetch all static routes on idle**, and `/specimen/[n]` on tile-visibility/tap-intent.
- **Verification:** the user's iPhone is the real acceptance gate; additionally capture a CDP
  throttled frame-time **before/after baseline**; keep existing gates green; visual aurora pass.

## Constraints (unchanged from the Motion plan)

- Next.js 16 App Router, React 18, Tailwind v4 with `@theme inline` token bridge in `globals.css`.
- **No animation dependencies** — bundle stays ~0kb added. Pure CSS + tiny hooks + Web Animations API.
- `prefers-reduced-motion` must stay honored for **every** new animation (incl. the FLIP morph,
  which is JS-driven and is **not** covered by the global CSS reduced-motion rule — guard it
  explicitly with `matchMedia`).
- Engineering ethos: minimum code, surgical changes, match existing style, every changed line
  traces to this plan.
- **className-gluing hazard (known bug on this branch):** Tailwind arbitrary values
  (`backdrop-blur-[20px]`, `shadow-[0_…]`, `[animation-delay:…]`) get silently mangled by the
  class sorter when a conditional splits them at a template-literal boundary — dropping both the
  effect and surrounding layout while gates stay green. **Always edit arbitrary-value classes as
  complete strings** (full-string ternaries), and **grep + eyeball after** every edit that touches
  them.

## Execution order & dependency graph

```
PP1 Drop VT → CSS enter-only nav ──┬─> PP2 FLIP morph (specimen hero)
                                   └─> PP5 Route prefetch (complements enter anim)
PP3 Breathing optimize ── (independent) ──┐
PP4 Blur/shadow diet ──── (independent) ──┴─> both touch lume-specimen halos: coordinate
PP6 Verification ── after all phases
```

PP1 lands first (PP2 assumes no VT). PP3 and PP4 both touch the specimen halo — do PP3's de-blur
and PP4's radius caps in one coherent pass over `lume-specimen.tsx` to avoid stepping on each other.

Each phase ends with the **verification gate**: repo `check` (typecheck + lint + build) green,
24/24 e2e green, a visual pass on the dev server, and a reduced-motion emulation pass.

---

## PP1 — Drop View Transitions; CSS enter-only navigation

**Goal:** route changes animate via a cheap CSS transform on the *incoming* page only. No
`startViewTransition`, no full-page snapshot.

**Files:** `lib/use-view-transition-router.ts`, new `app/template.tsx`, `globals.css`.

1. **Hook** (`use-view-transition-router.ts`): keep the export name and signature
   (`useViewTransitionRouter` → `{ navigate, back }`) to avoid churning 20 call sites; update the
   doc comment to say it is now CSS-driven. Remove `runWithViewTransition` /
   `document.startViewTransition` / the `document.documentElement.dataset.vt` writes. Replace with:
   set a **module-scoped direction** synchronously, then `router.push/replace/back`.
   ```ts
   // module scope
   let pendingDirection: "forward" | "back" | "sheet" | "sheet-close" = "forward";
   export const consumeNavDirection = () => pendingDirection;
   // in navigate(): pendingDirection = options?.mode ?? "forward"; then router.push/replace
   // in back():     pendingDirection = "back"; then router.back()
   ```
   (The `"morph"` mode is no longer special-cased here — the FLIP in PP2 owns that.)
2. **`app/template.tsx`** (new, client component). `template.tsx` re-mounts on every navigation,
   so it's the idiomatic App Router hook for an enter animation. On mount, read
   `consumeNavDirection()` and apply the matching enter class to a wrapper around `children`:
   - `forward` → `nav-in-right`, `back` → `nav-in-left`, `sheet`/default-overlay → `nav-in-up`.
   - Enter-only (the previous page is already unmounted — no exit slide). This is the accepted
     trade for dropping the snapshot.
   - Respect reduced-motion automatically: the keyframes below are caught by the existing global
     `prefers-reduced-motion` rule.
3. **`globals.css`**: **delete** the `::view-transition-old/new(root)` blocks and the
   `::view-transition-group(specimen-hero)` rule. **Rename/repurpose** the existing `vt-in-right`,
   `vt-in-left`, `vt-in-up` keyframes to `nav-in-right/left/up` (drop `vt-out-*` — unused now).
   Keep `--lu-ease-out` for slides, clamp overshoot on full-screen translate (existing guardrail).
4. Remove any remaining `data-vt` references.

**Verify:** navigate every edge (home→onboarding→permission→language→scan→collection→specimen→
saved→settings→card→complete and back). Each shows a clean enter slide, no stutter at the start.

---

## PP2 — Specimen tile→hero morph via hand-rolled FLIP

**Goal:** tapping a gallery tile flies it into the `/specimen/[n]` hero, with **no VT**.
Transform/opacity only.

**Files:** `app/collection/index-page-client.tsx` (origin capture), `app/specimen/[n]/page.tsx`
(FLIP play), small helper `lib/morph-origin.ts`.

1. **Capture origin** on tile tap, *before* `navigate(...)`: read the tile hero element's
   `getBoundingClientRect()` and store `{ n, rect, hue, form, t: Date.now() }` in
   `sessionStorage` under `lume:morph-origin` (survives the route change; cleared after use).
2. **Play FLIP** on `/specimen/[n]`. In a `useLayoutEffect` (runs before paint → no flash):
   - Read+clear `lume:morph-origin`. Proceed only if it exists, `n` matches, and it's fresh
     (`Date.now() - t < 1500`).
   - **First/Last/Invert/Play**: `last = hero.getBoundingClientRect()`; compute
     `dx, dy, scale` from `origin.rect → last`; set `transform-origin: top left` and the inverted
     `transform: translate(dx,dy) scale(scale)` + a low opacity synchronously; then
     `hero.animate([{transform:…,opacity:…},{transform:'none',opacity:1}], {duration: 360,
     easing: 'var(--lu-ease-out)'} )` (or toggle a class). Clamp scale overshoot.
   - **Reduced-motion guard:** if `matchMedia('(prefers-reduced-motion: reduce)').matches`, skip
     the morph (let the standard template enter / a ≤150ms crossfade handle it).
3. **Deep-link / no-origin fallback:** if there is no stored origin (direct URL, refresh, back from
   a non-gallery route), **do not** morph from a guessed position — the hero just uses the normal
   template enter animation.
4. Decision: morph **position + size** (scale), nothing layout-affecting.

**Verify:** tap a tile → hero morphs smoothly from the tile's spot. Open `/specimen/3` directly →
no morph, clean enter. Reduced-motion → no morph.

---

## PP3 — Optimize the breathing loops (keep the effect)

**Goal:** same living-collection feel, a fraction of the GPU/battery cost.

**File:** `components/specimen/lume-specimen.tsx` (+ a tiny `lib/use-in-viewport.ts`).

1. **De-blur the animated halo.** Remove `filter: blur(6px/8px)` from the breathing halo span — the
   radial-gradient is already soft. If more softness is wanted, push it into the gradient stops
   (alpha/positions), **not** a filter.
2. **Make the loop opacity-led.** Adjust `halo-breathe` to drive mostly opacity; a small scale
   (1→1.04) is acceptable now that the layer isn't blurred. Avoid permanent `will-change`.
3. **Pause off-screen.** Add `useInViewport` (single shared `IntersectionObserver`) and only apply
   `animate-halo-breathe` to tiles in view; off-screen tiles get no loop (or
   `animation-play-state: paused`). Optionally add `content-visibility: auto` to gallery tiles as a
   cheap complementary win.
4. Keep `glyph-breathe` on the single hero (cheap) — but confirm it isn't sitting on a blurred layer.

**Verify:** gallery scrolls smoothly; visible tiles breathe, off-screen ones don't; effect looks
the same to the eye.

---

## PP4 — Broad blur / shadow diet (preserve the aurora)

**Goal:** cap expensive blur radii and oversized shadows app-wide, without flattening the look.

**Files:** `globals.css`, `app/page.tsx`, `app/complete/page.tsx`,
`components/scan/scan-overlays.tsx`, `lume-specimen.tsx`, `app/scan/page.tsx`.

Target caps (tune visually; **soften the source** to compensate for the smaller radius):

| Where | Now | → Target | Note |
|---|---|---|---|
| Cover halo (`page.tsx`) | `blur-[24px]` | `blur-[12px]` | soften gradient stops |
| Completion halo (`complete/page.tsx`) | `blur-[40px]` | `blur-[16px]` | rotating; fine once capped |
| Scan sheet backdrop (`scan-overlays.tsx`) | `backdrop-blur-[20px]` | `backdrop-blur-[10px]` | **+ pause/stop the camera paint while the sheet/toast is shown** so backdrop-filter isn't re-sampling a live feed |
| Sheet inner / toasts | `backdrop-blur-[20px]`/`[8px]` | `[10px]`/`[6px]` | |
| Specimen static (locked) halo | `blur(8px)` | drop / reduce | gradient already soft |
| Sheet shadow | `0_-32px_96px` | `0_-20px_48px` | |
| Toast shadow | `0_24px_60px` | `0_16px_36px` | |
| Frame chrome shadow (`globals.css`) | `0_40px_120px` | leave | desktop-only mockup, not on phones |
| Glyph drop-shadow ×23 (completion) | `drop-shadow(0 0 6px …)` | reduce/drop during cluster reveal | 23 instances |

**Guardrail (mandatory):** edit every arbitrary-value class as a **complete string** (no
conditional split at a `blur-[…]` / `shadow-[…]` boundary). After editing, run
`grep -rn "blur-\[\|backdrop-blur-\[\|shadow-\[\|drop-shadow" apps/web` and eyeball each hit, then
**screenshot the cover, completion, gallery, and scan-sheet** and confirm they still read as a soft
aurora, not flat.

---

## PP5 — Preload routes (prefetch)

**Goal:** with VT gone, a prefetched route lets the CSS enter animation start immediately instead of
after an RSC fetch; also fixes first-visit lag and warms gallery images.

**Files:** new `components/route-prefetcher.tsx` (mounted in `app/providers` / layout), reuse the
PP3 `IntersectionObserver` for specimen tiles.

1. **Static routes on idle:** mount a client `<RoutePrefetcher />`; in a `requestIdleCallback`
   (fallback `setTimeout`), `router.prefetch(route)` for each of `/`, `/onboarding`, `/permission`,
   `/language`, `/scan`, `/collection`, `/saved`, `/settings`, `/card`, `/complete`.
2. **`/specimen/[n]` on intent:** prefetch each specimen detail route when its tile scrolls into
   view (reuse PP3's observer) or on `pointerdown`/`touchstart`. **Do not** prefetch all 23 eagerly.
3. The SW already cache-firsts `/_next/static/` chunks, so repeat loads stay instant; prefetch
   covers the first hit. (No SW change required.)

**Verify:** DevTools Network shows route RSC/JS fetched during idle, not on tap; transitions begin
instantly.

---

## PP6 — Verification & acceptance

1. **CDP frame-time baseline (before/after).** Script (Playwright/Puppeteer over CDP) against the
   production build in headless Chrome with `Emulation.setCPUThrottlingRate` ~4–6×. Drive a fixed
   sequence (home→scan→collection→specimen→back) + a gallery scroll; capture frame durations; report
   **count of frames >16.7ms and long tasks >50ms** before vs after. It's Blink (approximate, not
   WebKit) — label it as a regression baseline, put the numbers in the PR. Seed `lume:state:v1` via
   CDP for gated pages (`/card`, `/saved`, `/complete` need 23/23).
2. **Existing gates:** repo `check` (typecheck + lint + build) green; 24/24 e2e green.
3. **Visual:** screenshot cover, completion, gallery, scan-sheet — confirm the blur diet didn't
   flatten the aurora.
4. **Real acceptance gate:** user smoke-tests transitions + gallery scroll on the flagship iPhone.

## Acceptance criteria

- [ ] No `startViewTransition` / `::view-transition-*` / `data-vt` left in the codebase.
- [ ] Every route edge animates as a clean CSS enter; no stutter at transition start on iPhone.
- [ ] Tile→hero morph works via FLIP; deep-link and reduced-motion fall back cleanly.
- [ ] Gallery scroll is smooth; only on-screen tiles breathe; effect looks unchanged.
- [ ] Blur/shadow capped app-wide; aurora screens still read soft (visual sign-off).
- [ ] Routes prefetch on idle / on intent.
- [ ] CDP before/after frame-time numbers recorded in PR #100; gates + e2e green.
- [ ] No className-gluing regressions (grep + eyeball pass done).
- [ ] All of the above folded into **PR #100**.
