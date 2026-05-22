# Deployment guide

This guide covers the production release path for Lume, a mobile-web QR
scanner experience deployed on **Vercel** with Vercel's default edge CDN.
It is the operational companion to the QA checklist, content-update guide,
and warranty document.

## Production hosting decision

- **Host:** Vercel.
- **CDN:** Vercel's default edge CDN.
- **App root:** `apps/web` (Next.js).
- **Package manager:** Bun, as declared by the repository's
  `packageManager` field.
- **HTTPS:** mandatory. Browser camera APIs such as `getUserMedia` only work
  in secure contexts, so the production scanner must be served over `https://`.
  Vercel provides HTTPS automatically for both custom domains and
  `*.vercel.app` preview/production domains.
- **Analytics/accounts:** none today. There are no analytics-provider or
  account-system environment variables to configure.

## Release flow

1. **Prepare the branch.**
   - Start from an up-to-date `main` branch.
   - Make the application or content change in a focused branch.
   - Commit generated content files if a content-sync workflow has been used;
     production builds must not fetch exhibition content from the network at
     build time.
2. **Run local gates.**
   - For code/content changes, run:

     ```sh
     bun run check
     bun run typecheck
     ```

   - For catalogue changes, also run `bun test` so the specimen-count,
     locale-coverage, QR-slug, and ordering assertions execute.
3. **Open a pull request.**
   - Link the relevant GitHub issue with `Closes #NN` only when the PR fully
     satisfies that issue.
   - Use the Vercel preview deployment attached to the PR for browser/device
     smoke testing.
   - For scanner changes, verify the `/scan` path on a real mobile browser
     under HTTPS so the camera permission flow exercises `getUserMedia` in
     the same security context as production.
4. **Merge to `main`.**
   - Vercel should build the production deployment from `main`.
   - Confirm the production deployment URL loads, the service worker does not
     serve stale assets after refresh, and the key visitor flow works:
     cover -> permission -> scan/manual entry -> specimen -> index -> complete.
5. **Record the shipped deployment.**
   - Save the Vercel deployment URL, commit SHA, release time, and any
     smoke-test notes in the PR or release hand-off.
   - If a printed-signage change is involved, coordinate the deploy with the
     signage replacement window.

## Vercel project setup

Create or connect the Vercel project from the GitHub repository:

1. In Vercel, choose **Add New Project** and import
   `howard86-agents/lume`.
2. Set the framework preset to **Next.js**.
3. Set the root directory to `apps/web` if Vercel does not infer it from the
   monorepo.
4. Use Bun for install/build through the repository lockfile and package
   metadata. The expected build path is the workspace build command that
   produces the Next.js app in `apps/web`.
5. Enable production deployments from `main` and preview deployments for pull
   requests.
6. Add only the environment variables listed below. Do not add analytics,
   account, or tracking-provider configuration unless a future issue explicitly
   introduces it.

## Domain options

Lume can launch on either a Vercel subdomain or a custom domain. Both options
are valid for HTTPS and both encode the same scanner URLs:

```text
https://DOMAIN/?c=<slug>
```

> **QR-printing gate:** lock the production domain before QR signage is
> printed. The QR codes embed the full `https://DOMAIN/?c=<slug>` URL, so a
> late domain change requires reprinting every code that used the old domain.

### Option A: Vercel `*.vercel.app` domain

Use this path when the project does not need a branded domain before opening:

1. Deploy `main` to Vercel.
2. In the project dashboard, copy the production `*.vercel.app` domain.
3. Smoke-test the scanner over that exact HTTPS URL on target mobile devices.
4. Use that exact domain in the QR-code generation/signage workflow.
5. Treat any later move to a custom domain as a signage-impacting change.

### Option B: Custom domain attached in Vercel

Use this path when the exhibition needs a branded visitor URL:

1. In Vercel, open the project and go to **Settings -> Domains**.
2. Add the production domain or subdomain, for example
   `lume.example.org`.
3. Configure DNS as Vercel instructs:
   - apex domains usually use Vercel's recommended A records; and
   - subdomains usually use a CNAME to Vercel.
4. Wait for Vercel to show the domain as valid and HTTPS-enabled.
5. Visit the custom domain directly and run the scanner smoke test over
   `https://CUSTOM_DOMAIN/`.
6. Use the custom domain, not the fallback Vercel domain, when generating the
   final printed QR signage.

## Environment variables

Today the visitor-facing scanner has **minimal/no production environment
variables**. Progress is on-device, there are no visitor accounts, and analytics
are not configured.

| Variable | Required today? | Scope | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | No for the current scanner release | Future/server-side work only | The repository contains a Prisma package, but the scanner flow does not require a production database today. Configure only if a future server-backed feature uses it. |
| `DIRECT_URL` | No for the current scanner release | Future/server-side work only | Pair with `DATABASE_URL` only when Prisma migrations or direct database access are part of the deployed feature. |
| Content-sync CSV URL from #64 | Not yet; #64 is open | Developer sync workflow | If #64 lands, document the final variable/config name here. It should point at a published-to-web Google Sheet CSV URL used by the manual content-sync CLI. Builds should consume committed generated output, not fetch this URL during Vercel builds. |

When #64 is implemented, update this table with the exact configuration name,
where it is set (local `.env`, Vercel project environment variable, or CLI
config), and whether it is needed for Vercel builds. Until then, there is no
final CSV URL or production content-sync env var to set.

## Rollback procedure

Use Vercel's instant rollback/promote-previous-deployment flow when a production
deploy breaks the visitor experience.

1. **Triage impact.** Confirm whether the issue is a full outage, broken happy
   path, or cosmetic issue. Check the changed PR and the latest Vercel
   production deployment.
2. **Select the last-known-good deployment.** In Vercel, open the project
   deployments list and find the previous production deployment that passed
   smoke testing.
3. **Promote or roll back.** Use Vercel's rollback action or promote the
   previous deployment to production.
4. **Verify production.** Reload the production domain on target mobile devices
   and repeat the affected smoke path. For scanner regressions, verify camera
   permission and QR/manual-entry resolution over HTTPS.
5. **Follow up in GitHub.** Comment on the incident PR/issue with the rolled
   back deployment URL, the restored commit SHA, the observed impact, and the
   follow-up fix plan.
6. **Signage warning.** If the bad deploy changed QR slugs or the production
   domain, coordinate rollback with the physical signage state. A software
   rollback cannot make newly printed codes point back to an old domain or slug
   unless the printed material matches.

## Pre-launch deployment checklist

- [ ] Vercel production deployment is connected to `main`.
- [ ] Production URL is HTTPS and loads without mixed-content warnings.
- [ ] Final domain choice is locked before QR codes are printed.
- [ ] QR codes are generated with the final `https://DOMAIN/?c=<slug>` URL.
- [ ] No unexpected analytics/account/database env vars are configured.
- [ ] If #64 has landed, the CSV URL/config name is documented and the generated
      catalogue output is committed.
- [ ] Mobile smoke test passes on the production domain.
- [ ] Rollback target is known: the previous green Vercel deployment can be
      promoted if the launch deploy regresses.
