# Agent Instructions

## Operating rules

- Inspect existing code, configs, and docs before proposing or editing changes.
- Keep changes scoped to the current issue or explicit user request.
- Prefer one issue per branch/PR.
- Make atomic Conventional Commits.
- Run relevant checks before reporting completion.
- Update `CONTEXT.md` and ADRs when architecture or repo conventions change.
- Use `Closes #NN` only when the PR fully satisfies the issue; otherwise use `Refs #NN`.
- For stacked work, clearly document `Stacked on`, `Base branch`, and dependency notes in the PR.

## Repo shape

This is a Maison-style Bun/Turborepo full-stack workspace:

- `apps/web` — Next.js app.
- `apps/cli` — Bun CLI/scripts package.
- `packages/data` — shared static/domain data.
- `packages/database` — Prisma/Postgres client, schema, migrations, and seed.
- `packages/config-typescript` — shared TypeScript configs.

## Quality gates

Use these commands before handoff unless the task is docs-only and the narrower check is justified:

```sh
bun run check
bun run typecheck
```

Use database commands only with a configured local or remote `DATABASE_URL`/`DIRECT_URL`.
