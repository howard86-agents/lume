# Warranty and remote-standby support

This document captures the warranty (保固) terms for the Lume exhibition
build. It is the operational counterpart to the engineering deliverables
in [`docs/qa/test-checklist.md`](./qa/test-checklist.md) and the
deployment guide that ships with [issue #29][issue-29].

It is intentionally a draft assembled from the known engagement facts —
a 3–6 month exhibition run, launch plus pre-show testing, and 2 weeks of
post-launch remote standby. Owner-decided values (contact channel,
response-time targets, support hours, exact standby dates) appear as
clearly-marked **`<!-- OWNER -->`** placeholders so they can be filled
in during review without further engineering work.

---

## 1. Coverage period

The warranty covers Lume from **public launch** through the end of the
2-week remote-standby window.

| Phase | Window | Notes |
| --- | --- | --- |
| Pre-launch testing | Up to and including the public-launch date | Includes the device QA pass (#61) and any owner-signoff cycle. |
| Public launch | Day 0 of the exhibition | Standby window starts on this day. |
| Remote standby | 14 calendar days from public launch | <!-- OWNER --> Confirm exact start/end dates once the launch date is locked. |
| Exhibition run (post-standby) | Through the end of the 3–6 month run | Covered by the post-standby hand-off in §6, not by this warranty. |

> The exhibition is expected to run for **3 to 6 months** in total. The
> standby window above covers only the first 2 weeks of that run; what
> happens after standby ends is described in §6.

---

## 2. What is included

Within the standby window, the engineering team will:

- **Fix breakages in the visitor flow** — anything that prevents a
  visitor from going from the cover at `/` through to a saved
  achievement card at `/card`. Worked examples: the camera permission
  prompt failing on a supported browser, the QR decoder not resolving
  valid printed codes, persisted progress being lost on reload, the
  achievement-card export producing a blank or corrupted PNG.
- **Restore on-call deploys** when a hotfix is required. The agreed
  hosting platform (per the deployment guide in #29) handles its own
  rollouts; engineering owns building, verifying, and shipping the
  patch through that platform.
- **Roll back a bad deploy** to the last-known-good build, following the
  rollback procedure in the deployment guide.
- **Triage incoming reports** routed through the contact channel below
  (§4) within the agreed response window (§5).
- **Run a smoke test** before applying any non-trivial fix — at minimum
  the items in §1.1–§1.3 of the QA checklist for the affected surface.
- **Update content fixes** that are scoped to typos or wording in the
  five locale bundles (`en`, `zh-tw`, `zh-cn`, `ja`, `ko`). Larger
  copy changes (see §3) are out of scope.

## 3. What is **not** included

Out of scope for warranty-period support — these become a new
engagement / change request:

- **New features**, including any item already filed as a future-scope
  GitHub issue (e.g. analytics #65, original character art #63, the
  build-time editable content source #64).
- **Net-new translations** or rewrites of the existing locale bundles
  beyond minor fixes. Adding a 6th language is a feature.
- **Visual / interaction redesigns** of any existing surface.
- **Changes to printed signage** or the QR-slug-to-specimen mapping.
  Printed codes are stable by contract — see the deployment guide and
  [`docs/content-update-guide.md`](./content-update-guide.md).
- **Hardware support** (visitor devices, in-venue Wi-Fi, kiosk
  hardware). Engineering will help diagnose but is not responsible for
  hardware remediation.
- **Operational responsibilities** that the owner already runs day-to-day
  during the exhibition (signage placement, on-floor staffing, content
  moderation, social posts, etc.).
- **Browser / OS bugs** that affect Lume only because the underlying
  platform regressed. We will advise on workarounds; the underlying fix
  is out of scope.
- **24/7 monitoring or pager rotation.** Standby is best-effort within
  the response window of §5, not a paid pager rotation.

## 4. How to report an issue

The owner reports issues through the agreed channel:

- **Primary channel:** <!-- OWNER --> Confirm primary contact (e.g. a
  shared email alias, a Slack/Teams DM/channel, a phone number, or a
  shared chat thread). Include who on the owner side is authorised to
  open a report.
- **Backup channel:** <!-- OWNER --> Confirm secondary contact for cases
  where the primary channel is unavailable.
- **Issue tracker:** As a fall-back the owner can open a GitHub issue
  on this repository; engineering monitors it during standby hours.

Each report should include:

1. **What broke** — the surface (e.g. `/scan`, `/card`), the action that
   triggered it, and the visible symptom.
2. **Reproduction** — at minimum the device, OS version, and browser. A
   short video or screenshot from a visitor device is the gold standard.
3. **Impact** — how many visitors are affected (one device, one floor,
   the whole venue).
4. **Time** — when it started, and whether it is ongoing.

> The QA checklist's section structure (functional flows / browser
> + persistence / localization / venue conditions) is a good prompt
> for what to capture.

## 5. Response targets

Within the standby window:

| Severity | Definition | First-response target | Resolution target |
| --- | --- | --- | --- |
| **P1 — full outage** | The visitor flow is unusable for a meaningful share of visitors (e.g. cover does not load, scan never resolves, card export always fails). | <!-- OWNER --> e.g. within 1 working hour of the report being received during support hours. | <!-- OWNER --> e.g. same business day. |
| **P2 — broken happy-path** | A specific path is broken but visitors can still finish (e.g. one locale's copy is wrong, manual entry fails on Android Chrome only). | <!-- OWNER --> e.g. within the next working day. | <!-- OWNER --> e.g. within 2–3 working days. |
| **P3 — cosmetic / non-blocking** | A cosmetic glitch or low-impact bug. | <!-- OWNER --> e.g. acknowledged within 2 working days. | <!-- OWNER --> e.g. fix bundled into the next planned deploy. |

**Support hours:** <!-- OWNER --> Confirm the support window (e.g.
"weekdays, 10:00–18:00 Asia/Taipei, excluding national holidays").
Reports outside support hours are queued for the next support day.

> "Working hour" / "working day" above always refers to the support hours
> the owner confirms here.

## 6. End of standby and hand-off

When the 14-day standby window ends, engineering will:

1. **File a hand-off summary** in this repository (a closing PR or a
   pinned issue) listing every issue raised during standby, what was
   done, and any deferred items.
2. **Hand back the deploy keys / credentials** — on the deployment
   platform agreed in #29 — to the owner-nominated maintainer.
3. **Archive the on-call channel** (§4) so reports do not silently fall
   on a deprecated alias.

After standby, this warranty no longer applies. Continued support, new
features, and content updates require a new engagement; the existing
[`docs/content-update-guide.md`](./content-update-guide.md) covers the
engineer-managed catalogue edits the owner can request as one-off
change-orders if there is no ongoing retainer.

## 7. Known limitations

These are the constraints we know about today, captured here so the
owner does not raise them as bugs during standby:

- **HTTPS is mandatory** for `getUserMedia`. The `/scan` page renders an
  "HTTPS required" guidance card on insecure contexts; this is by
  design, not a bug. The deployment guide (#29) ensures the production
  domain is HTTPS-only.
- **Progress is on-device only.** Lume persists state in `localStorage`
  on the visitor's phone — there is no server-side account. If the
  visitor clears site data, switches devices, or uses private browsing,
  their collection resets. This is the documented design (see
  [`CONTEXT.md`](../CONTEXT.md)) and out of scope for the warranty.
- **Five locales only.** Visitors whose browser language is none of the
  five (e.g. French, Spanish) see the English fallback. This is
  by-design.
- **Camera-permission UX is browser-dependent.** Once a visitor denies
  camera access at the OS level, the only way to recover is via system
  settings; we surface guidance copy but cannot override the OS prompt.
- **Card export depends on `modern-screenshot`.** A small fraction of
  edge-case browsers may produce a degraded export (e.g. font fallback
  rendering). The download path is the fallback when the Web Share API
  rejects the file payload.

## 8. Cross-references

- [`docs/qa/test-checklist.md`](./qa/test-checklist.md) — the
  pre-release test bar engineering walks before any standby fix is
  shipped.
- Deployment guide (issue [#29][issue-29]) — build/release steps,
  hosting choice, environment variables, and rollback procedure that
  this warranty depends on. Once #29 lands, the file lives at
  `docs/deployment-guide.md` and replaces this reference.
- [`docs/content-update-guide.md`](./content-update-guide.md) —
  engineer-managed catalogue edits the owner may request during the
  engagement.
- [`CONTEXT.md`](../CONTEXT.md) — product and architecture context
  underpinning the assumptions in this warranty.

[issue-29]: https://github.com/howard86-agents/lume/issues/29
