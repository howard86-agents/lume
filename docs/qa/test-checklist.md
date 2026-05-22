# Lume test checklist

This checklist is the QA bar Lume needs to clear before each on-venue release. Walk it once per release candidate. Tick checkboxes when running it as a release artifact; copy the relevant section into release notes when reporting failures.

The checklist is organized into four families:

1. [Functional flows](#1-functional-flows)
2. [Browser, device, and persistence](#2-browser-device-and-persistence)
3. [Localization](#3-localization)
4. [Venue conditions](#4-venue-conditions)

Each item describes the precondition, the action, and the pass criterion.

> Conventions
>
> - "Specimen" = one of the 23 light-form entries.
> - "Index" = the visitor's collection (`/index`).
> - "Card" = the savable achievement card (`/card`).
> - "Locale" = one of `en`, `zh-tw`, `zh-cn`, `ja`, `ko`.
> - "Permission denied" = the OS- or browser-level camera permission was refused or revoked.

---

## 1. Functional flows

End-to-end coverage of the visitor experience and supporting tools. Run once per locale at minimum, plus a full run in `en`.

### 1.1 Cover and onboarding

- [ ] **Cover render.** `/` renders the central glow, conic halo, eyebrow metadata, intro copy, and primary "Enter" CTA. Copy reflects the active locale.
- [ ] **Language picker.** From `/language`, selecting each of the five locales updates the highlight state and persists the choice to the next screen.
- [ ] **Onboarding primer.** All three steps render with the matching preview art; `Next`, `Skip`, and `Begin` advance, exit, and route to `/permission` respectively.

### 1.2 Camera permission

- [ ] **Pre-prompt.** `/permission` shows the rationale card before any browser prompt fires (no `getUserMedia` invocation on this screen).
- [ ] **Allow.** Tapping "Allow camera" navigates to `/scan`, and the live camera preview renders inside the circular scan frame.
- [ ] **Not now.** Tapping "Not now" routes to the manual-entry fallback (or back, per the design) without invoking the camera API.
- [ ] **Permission denied recovery.** When the OS-level permission is denied, `/scan` shows browser-aware guidance to re-enable the camera in site / OS settings, plus a Retry that re-issues `getUserMedia`.
- [ ] **No-camera device.** Devices without a camera show the dedicated "no camera" message that points to manual entry, not the generic denied-state copy.
- [ ] **Insecure context.** Loading `/scan` over plain `http://` (or another non-secure context) shows the "HTTPS required" guidance.
- [ ] **Stream cleanup.** Navigating away from `/scan` releases the camera (no hardware indicator / no second tab capture conflict).

### 1.3 Scan resolution

- [ ] **Scan success ("new").** A valid in-frame QR code is decoded, the corresponding specimen is collected (deduped), `NN/23` increments, and the success sheet shows the glowing specimen, name, plate/floor, notes, progress bar, and `View specimen` / `Continue scanning` actions.
- [ ] **Scan duplicate ("dupe").** Re-scanning an already-collected code shows the "already in the index" toast and does not double-count.
- [ ] **Scan invalid.** An unknown QR payload (e.g. an external URL or a code outside the 23-set) shows the rose-tinted "code not recognised" toast.
- [ ] **Decode payload formats.** Both a full URL payload (`...?c=<code>`) and a bare code resolve to the same specimen.
- [ ] **Decode loop.** When the user is not actively scanning (e.g. a result sheet is open), the decode loop pauses; the camera does not continuously sample frames.
- [ ] **Continue / View actions.** `Continue scanning` dismisses the sheet and resumes decoding; `View specimen` opens `/specimen/[n]` and Back returns to `/index`.

### 1.4 Manual entry fallback

- [ ] **Reachable without camera.** "Enter code" is reachable when permission is denied, when no camera is available, and as a deliberate alternative from the scan UI.
- [ ] **Manual code success.** Submitting a valid code from the manual input collects it (new) and shows the same success sheet as the camera path.
- [ ] **Manual code duplicate.** Submitting an already-collected code shows the same dupe toast as the camera path.
- [ ] **Manual code invalid.** Submitting an unknown code shows the same invalid toast as the camera path.

### 1.5 Deep-link

- [ ] **Bare code deep-link.** Opening `/scan?c=<code>` (e.g. via the OS camera app) auto-resolves the same `collect()` path: new shows the success sheet, dupe shows the toast, invalid shows the toast.
- [ ] **Deep-link from a fresh load.** Visiting `/scan?c=<code>` as the first navigation in a new session works without requiring camera permission first (the auto-collect runs without invoking `getUserMedia`).

### 1.6 Index, specimen detail, and per-floor counts

- [ ] **Index render.** `/index` renders four floor groups in the 3-column grid. Found tiles glow + show the localized name; locked tiles render a dimmed silhouette.
- [ ] **Header counts.** The header reads `NN / 23`, the progress bar matches, and per-floor "found / total" counts are correct.
- [ ] **Bottom dock states.** While in progress, the dock shows the "scan" CTA. At 23/23 the dock switches to "view card" + mint styling.
- [ ] **Tile navigation.** Tapping a found tile opens `/specimen/[n]`; tapping a locked tile is a no-op (or shows a locked hint per the design).
- [ ] **Specimen detail.** `/specimen/[n]` renders the plate (large LumeSpecimen), localized name + English translation, plate / floor / NO. metadata, field notes, and the `collectedAt` timestamp.
- [ ] **Locked guard.** Visiting `/specimen/[n]` for a not-yet-collected number redirects to `/index` (or shows the locked empty state) — never the unlocked detail.

### 1.7 Completion final reveal

- [ ] **Reveal trigger.** Reaching 23/23 enables / locates `/complete`, which renders the central conic halo + numeral, scattered glowing specimens, and the "you found all twenty-three" copy.
- [ ] **Entrance animation.** The reveal animates via transform/opacity only (no layout-shifting / paint-heavy properties) and settles into the static composition.
- [ ] **Reduced motion.** With `prefers-reduced-motion: reduce`, the reveal snaps to the static composition without entrance animation.
- [ ] **Index complete variant.** `/index` shows its complete variant (mint progress, "view card" dock).
- [ ] **`finalSeen` flag.** Reaching `/complete` records the `finalSeen` flag so future visits don't re-play the reveal.

### 1.8 Achievement card generation and save

- [ ] **Card render.** `/card` renders the glassy 3/4 card on a solid aurora background with the conic glow, `23/23`, the 23-glow-dot grid, the visitor name, and the date.
- [ ] **Card export readiness.** Capture waits for `document.fonts.ready` so CJK glyphs render in the exported PNG.
- [ ] **Save via Web Share.** On a device that supports `navigator.share` with a `file`, save invokes the share sheet with the PNG attached.
- [ ] **Save fallback.** On a device without `navigator.share` (or without file sharing), save downloads the PNG via a download link.
- [ ] **Saved confirmation.** `/saved` is shown after save; the `cardSaved` flag is recorded.
- [ ] **Mobile legibility.** The exported PNG is legible at typical phone widths with safe margins on all sides.

### 1.9 Optional nickname

- [ ] **Nickname prefilled.** The nickname input on `/card` is prefilled with the localized "Visitor" label for the active locale.
- [ ] **Nickname persistence.** Edits to the nickname persist across reloads via the provider.
- [ ] **Export reflects nickname.** The exported PNG reflects the entered nickname (or the localized fallback when blank).
- [ ] **Locale-aware fallback.** If the nickname is unset, switching language re-localizes the fallback. If the nickname is set, switching language does not overwrite it.

### 1.10 Settings surface

- [ ] **Reachable.** A settings entry point is reachable (e.g. from `/index` or the cover) and renders localized.
- [ ] **Live language switch.** Changing the language from settings updates every visible string immediately (no reload required) and persists.
- [ ] **Reset progress.** "Reset progress" is gated by a confirmation, clears collected / nickname / completion / saved state, and returns the visitor to the cover or onboarding entry.
- [ ] **Recovery note.** The "progress is kept on this device" recovery note is displayed in the settings surface.

### 1.11 Dev / engineering surfaces

- [ ] **Dev QR page.** `/dev` renders all 23 scannable QR codes (matching the data's `qr` field) with the code and localized name beneath each. Scanning any of them in `/scan` collects the right specimen.
- [ ] **System preview.** `/system` renders the type scale and palette swatches without runtime errors after token retunes.

### 1.12 Content correctness

- [ ] **23 specimens.** Exactly 23 specimens render (no more, no fewer) and each has number / floor / plate / form / hue / per-language names / `qr` populated.
- [ ] **QR uniqueness.** All 23 `qr` codes are unique and each maps to exactly one specimen.
- [ ] **Floor distribution.** Specimens are distributed across the four floors per the design (per-floor counts on `/index` match).
- [ ] **Per-language names.** Every specimen has a non-empty name in each of the five locales.
- [ ] **No-orphan locale strings.** Every locale string referenced in the UI exists in the LOCALES bundle for every locale (no missing key warnings in the console / logs).

---

## 2. Browser, device, and persistence

The visitor-facing matrix. Aim for one full pass per browser, then sample localization + venue scenarios on top.

### 2.1 Browser matrix

For each browser, run the [Cover and onboarding](#11-cover-and-onboarding), [Camera permission](#12-camera-permission), [Scan resolution](#13-scan-resolution), [Manual entry fallback](#14-manual-entry-fallback), and [Card generation](#18-achievement-card-generation-and-save) sections.

- [ ] **iOS Safari** (latest stable) — primary target.
- [ ] **iOS Chrome** (latest stable) — uses WebKit under the hood; verify camera permission UI and Web Share fallback.
- [ ] **Android Chrome** (latest stable) — verify Web Share with file attachment and `navigator.share` behavior.

### 2.2 Camera permission states

- [ ] **Granted.** From a clean install (no prior permission decision), allowing the camera on the first prompt yields a working scanner.
- [ ] **Denied at prompt.** Refusing the first prompt routes through the [Permission denied recovery](#12-camera-permission) flow.
- [ ] **Revoked after grant.** Revoking the camera permission in OS / site settings between sessions causes `/scan` to fall back to the denied-state guidance with a working Retry.
- [ ] **Re-grant after revoke.** Re-granting the camera permission (without clearing site data) restores the live preview after Retry.

### 2.3 Persistence and recovery

- [ ] **Refresh mid-flow.** Refreshing the page mid-flow restores: collected count, language, nickname (if set), and `finalSeen` / `cardSaved` flags.
- [ ] **Close and reopen.** Closing the browser tab and reopening Lume restores the same state.
- [ ] **Same-device restore.** Coming back to Lume on the same device (e.g. after lunch) restores progress with no data loss; the recovery note is consistent with reality.
- [ ] **Reset wipes state.** After "Reset progress" from settings, refreshing yields a fresh visitor (no leftover collected / nickname / flags).
- [ ] **Versioned localStorage.** A simulated old localStorage payload (mismatched version key) does not crash the app; the visitor either sees a fresh start or a documented migration.
- [ ] **No SSR mismatch.** The first paint after page load shows hydrated state with no React hydration warning in the console (incognito + first paint sample).

### 2.4 Network and PWA-ish behavior

- [ ] **Offline soft handling.** Triggering offline mid-flow does not blank the UI for already-loaded routes; manual entry still resolves codes against in-memory data.
- [ ] **Slow 3G.** On Slow 3G simulation, the cover and language screens still render with a usable LCP; non-preloaded CJK fonts swap in once the corresponding locale is selected.

---

## 3. Localization

Run for each of the five locales: `en`, `zh-tw`, `zh-cn`, `ja`, `ko`.

### 3.1 String coverage

- [ ] **Every screen localizes.** Every visible string on every screen reflects the active locale; no untranslated `en` fallbacks leak through.
- [ ] **Live switch.** Changing the locale from settings updates the entire UI in place — no stale strings, no reload, no flicker beyond the font swap.
- [ ] **Persistence across navigation.** The active locale persists across `/scan`, `/index`, `/specimen/[n]`, `/complete`, `/card`, and back.

### 3.2 Layout overflow

- [ ] **Header overflow.** Long localized titles do not break header layouts on mobile widths (≤ 360 px).
- [ ] **Button overflow.** CTAs accommodate longer translations (e.g. KR / JP) without truncating mid-glyph or wrapping ungracefully.
- [ ] **Toast and sheet overflow.** Result toasts and the success sheet wrap multi-line content cleanly.
- [ ] **Specimen plate overflow.** `/specimen/[n]` accommodates long localized names + English translation without overlapping the plate metadata.

### 3.3 Card rendering

- [ ] **CJK glyphs in card.** The exported PNG renders Chinese / Japanese / Korean glyphs correctly (no `tofu` / box characters).
- [ ] **Visitor fallback in card.** When no nickname is set, the card export shows the localized "Visitor" label correctly in each locale.
- [ ] **Date format in card.** The date on the card uses a sensible format for the active locale.

### 3.4 Font fallback

- [ ] **CJK fonts load on demand.** On switching to a CJK locale (zh-tw / zh-cn / ja / ko), the matching Noto Sans family is fetched (network panel shows the request only after the switch).
- [ ] **Latin-only path stays light.** Loading and using `en` does not trigger the CJK Noto fonts.
- [ ] **Fallback while loading.** During the brief CJK-font fetch window, text falls back to a system CJK family rather than `tofu`.

---

## 4. Venue conditions

Real-world conditions on the venue floor. Run once on-site before the first public day.

### 4.1 Print + scan ergonomics

- [ ] **Print size.** QR codes print at the chosen size (per the venue install spec) and scan reliably with the in-app scanner from typical viewing distance.
- [ ] **Print contrast.** Codes printed against the venue's chosen substrate (paper / vinyl / wall paint) maintain enough contrast for fast detection — no inversions, no glare-killed contrast.
- [ ] **Scan distance.** Visitors can scan from a comfortable hand-held distance (≈ 20–40 cm); too-close fails are rare, and too-far fails surface the "no QR detected" feedback rather than spinning indefinitely.
- [ ] **Scan angle.** Angles up to ±30° from perpendicular still resolve within ~2 seconds.

### 4.2 Lighting

- [ ] **Bright ambient.** Under bright venue lighting (well-lit gallery), codes scan reliably without glare.
- [ ] **Dim ambient.** Under intentionally dim venue lighting (darker rooms, mood lighting), the scanner still detects codes; if the device flashlight is exposed, it works.
- [ ] **Mixed glare.** Codes near windows / spotlights with partial glare still resolve — visitors are not stuck on a glare hot spot.

### 4.3 Concurrency

- [ ] **Multiple visitors.** Multiple devices scanning the same code in quick succession all resolve correctly; one visitor's scan does not affect another's progress.
- [ ] **Crowd density.** During peak crowd density, performance does not degrade noticeably (the scanner stays responsive on visitor's own devices; this is a client-side check).

### 4.4 Low-end devices

- [ ] **Older iOS.** On the oldest iOS version the venue admits (per the venue's audience), the cover, scan, index, complete, and card flows all function with no JS errors.
- [ ] **Older Android.** Same on the oldest Android Chrome version the venue admits.
- [ ] **Low-end CPU.** On a low-end device, the scan decode loop still runs without locking the UI; the completion animation degrades gracefully (or respects reduced-motion automatically).
- [ ] **Battery / thermals.** Sustained 5-minute scanning sessions do not noticeably drain battery beyond expectations or trigger thermal throttling that breaks the scanner.

---

## How to use this checklist

1. Pick the matrix slice that matches the release scope (e.g. "iOS Safari + en + 23 specimens").
2. Run section 1 first; defer 2–4 only if a section-1 regression is found.
3. Log failures with: section number, browser/device, locale, repro steps, and a screenshot or screen recording.
4. Block the release on any unticked item in sections 1.3, 1.4, 1.5, 1.7, 1.8, 2.2, 2.3, 3.3, or 4.1.
