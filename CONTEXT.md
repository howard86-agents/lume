# Project Context

## Product

Lume is a 23-specimen QR-scan field guide that visitors walk through across four floors of a venue. Each floor hosts a set of printed QR codes; scanning a code reveals a localized light-form specimen and contributes to the visitor's index. At 23/23 the experience reveals a completion moment and lets the visitor save a personalized achievement card. The app is mobile-web first, supports five languages (en, zh-tw, zh-cn, ja, ko), and persists progress on-device so visitors can put their phone away and resume.

## Architecture

Maison-style full-stack TypeScript monorepo:

- Bun is the package manager and runtime for scripts.
- Turborepo coordinates workspace tasks.
- Next.js powers `apps/web` (the visitor-facing PWA-style scanner experience).
- Prisma/Postgres lives in `packages/database` (currently unused by the scanner experience but kept for future server-side needs).
- Shared specimen data, locale strings, and the SVG glyph renderer live in `packages/data`.
- Shared TypeScript compiler settings live in `packages/config-typescript`.

## Current conventions

- Ultracite/Biome for linting and formatting.
- Commitlint with Conventional Commits.
- Husky local gates for commit, commit message, and push checks.
- Gitleaks and Typos in local hooks and CI.
- GitHub Issues and PRs carry repo continuation state.

## Non-goals

- Server-side specimen state or accounts; progress is on-device only by design.
- Mandatory CI builds; Vercel previews can own build validation unless this repo opts in.
