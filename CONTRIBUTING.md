# Contributing to PRD Autopilot

## Branch naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/description` | `feat/notion-export` |
| Bug fix | `fix/description` | `fix/question-ordering` |
| Chore | `chore/description` | `chore/update-deps` |

## Commit format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Notion export
fix: handle malformed Claude JSON response
chore: upgrade Supabase client to v2.40
docs: update API reference for /prd/generate
```

## PR checklist

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes  
- [ ] `npm run build` passes locally
- [ ] New API routes have been tested with a real Supabase project
- [ ] No `.env.local` values hardcoded anywhere in the diff

## Team ownership

| Area | Owner | Branch prefix |
|---|---|---|
| API routes + Claude | Person A | `feat/api-*` |
| Pages + components | Person B | `feat/ui-*` |
| Auth + infra | Person C | `feat/auth-*` or `feat/infra-*` |

## Environment setup

See [README.md](./README.md#getting-started) for full setup instructions.

The fastest way to test API routes locally is with the Supabase CLI:

```bash
npx supabase start
```

This spins up a local Postgres + Auth instance that mirrors your cloud project.
