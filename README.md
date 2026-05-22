# lume

Lume is a 23-specimen QR-scan field guide that visitors walk through across four floors of a venue, collecting light-form specimens until they reach 23/23 and take home a personalized achievement card. This repository is a Bun + Turborepo monorepo following the Maison-style template shape.

## Stack

- Bun workspace + Turborepo
- Next.js app in `apps/web` (the visitor-facing scanner experience)
- Bun CLI starter in `apps/cli`
- Shared specimen and locale data in `packages/data`
- Prisma/Postgres package in `packages/database`
- Shared TypeScript configs in `packages/config-typescript`
- Ultracite/Biome, Husky, Commitlint, Gitleaks, Typos, Dependabot, GitHub Actions CI

## Setup

```sh
brew install bun gitleaks typos-cli
bun install
cp .env.sample .env.local
docker compose up -d db
bun run generate
bun run db:push
bun run dev
```

## Common scripts

```sh
bun run check       # Ultracite lint/check
bun run fix         # Ultracite autofix
bun run typecheck   # Turbo typecheck across workspaces
bun run build       # Turbo build
bun run generate    # Prisma generate
bun run db:push     # Push Prisma schema to local DB
bun run db:seed     # Seed local DB
bun run dev         # Run persistent dev tasks
```

## Quality gates

| Gate | Runs | Bypass |
|---|---|---|
| `pre-commit` | lint-staged Ultracite fixes, staged Gitleaks scan | `git commit --no-verify` |
| `commit-msg` | Commitlint Conventional Commits | `git commit --no-verify` |
| `pre-push` | Ultracite check, Turbo typecheck, Typos, Gitleaks history scan | `git push --no-verify` |
| CI | Ultracite check, typecheck, Typos, Gitleaks, actionlint | Required for merge |
| Vercel preview | Hosted preview build/deploy | Advisory unless GitHub CI also fails or the PR changes deployment/build config |

Build is intentionally not in CI by default. Vercel previews are useful for smoke-testing and visual review, but they are not a hard merge gate when the failure is attributable to Vercel/platform behavior and GitHub CI is green. Treat Vercel failures as blocking only when they reproduce locally, coincide with CI failures, or the PR changes deployment/build/runtime configuration.

## Agent workflow

Read `AGENTS.md` before editing. Keep work issue-scoped, inspect code first, make atomic conventional commits, run checks, and document stack/base notes for dependent PRs.
