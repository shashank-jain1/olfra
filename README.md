# OLFRA™

Fragrance intelligence for people who take scent seriously.

**Runs with zero configuration.** Clone, `npm install`, `npm run dev`. No API
key, no database, no signup — the scoring engines are deterministic and ship
with a curated seed catalogue.

```bash
npm install
npm run dev          # http://localhost:3000
```

---

## How it works

Four of the six intelligence modules are **pure computation**, not model
inference:

| Module | Method |
|---|---|
| **DupeShield** | Cosine similarity over 32-dimension accord vectors, plus IDF-weighted note overlap and performance proximity |
| **ScentDNA** | Fixed rule table over six skin/climate factors |
| **ScentMoment** | Blended occasion/mood/time/weather accord target, scored against the catalogue |
| **ScentLayer** | Accord overlap curve, intensity balance, shared-base anchoring, clash detection |

This matters more than cost. A dupe score that changes between page refreshes
is worthless to someone deciding whether to spend $300, and a model asked to
recall a price will invent one. These engines are deterministic, grounded in
real note data, and every score exposes the breakdown that produced it.

Two features genuinely need a model, and only two — reading a bottle from a
photo, and writing the weekly editorial. Both sit behind
[`lib/ai/port.ts`](lib/ai/port.ts) and degrade cleanly when unconfigured.

### Why IDF weighting

Cedar, musk and vanilla appear in a large share of the catalogue. Without
rarity weighting, two unrelated fragrances "share" them and score far too
high — Chanel No. 5 came back as a 62% match for Creed Aventus in testing.
Weighting each shared note by how rare it is fixed that: Aventus now returns
Armaf Club de Nuit Intense at 84%, with the next candidate 42 points behind.

---

## Architecture

Layered, with dependencies pointing inward. Feature code depends on
interfaces, never on vendors.

```
lib/
  fragrance/          Domain: types, accord space, similarity math
    repository/       Port + adapters (seed / Supabase / Fragella / composite)
    data/             Seed catalogue
  engines/            DupeShield · DNA · Moment · Layer — pure, injectable
  ai/                 Port + Gemini adapter (the only vendor-coupled code)
  supabase/           Clients (server = service role, browser = anon)
  http/               Response envelope, error mapping, rate-limit guards
  client/             Typed API client + React Query hooks
  config/             Validated environment + capability flags

app/api/              Thin route handlers — parse, delegate, respond
components/           Feature-scoped UI
supabase/migrations/  Schema with Row Level Security
```

**The repository port** is the seam that makes "own database primary,
Fragella for gaps" work: the composite adapter asks your Postgres first,
falls back to Fragella on a miss, and writes the result back so the same
lookup never costs a second upstream call. A Fragella outage degrades
results; it never fails a request.

**Engines take their repository by injection**, so they are testable against
the seed catalogue with no database and no network.

---

## Configuration

Everything is optional — see [`.env.example`](.env.example). Copy it to
`.env.local` and fill in only what you want.

| Variable | Unlocks | Without it |
|---|---|---|
| `SUPABASE_*` | Full catalogue, accounts, wardrobe sync, social, marketplace | Seed catalogue; wardrobe and DNA persist to localStorage |
| `FRAGELLA_API_KEY` | Catalogue gap-fill for fragrances you don't have | Local catalogue only |
| `GEMINI_API_KEY` | Bottle photo ID, weekly editorial | ScentSnap falls back to catalogue search; editorial hidden |

`GET /api/health` reports exactly what is wired up. The UI reads the same
endpoint and tells users when they are on seed data rather than implying a
catalogue it cannot reach.

### Database setup

```bash
# Apply in order against your Supabase project
supabase/migrations/0001_fragrance_catalogue.sql   # catalogue + pgvector
supabase/migrations/0002_accounts_and_social.sql   # accounts + RLS
```

Every user-data table has Row Level Security enabled. The browser holds an
anon key and talks to Postgres directly, so **the policies are the
authorisation boundary** — a missing policy is a data leak, not just a bug.

---

## API

All responses use one envelope: `{ ok: true, data }` or
`{ ok: false, error: { code, message, details? } }`.

| Route | Purpose |
|---|---|
| `GET  /api/dupes?q=` | Ranked dupes with score breakdown |
| `GET  /api/fragrances?q=` | Catalogue search / autocomplete |
| `GET  /api/dna` · `POST /api/dna` | Questionnaire definition · computed profile |
| `GET  /api/moment` · `POST /api/moment` | Option lists · recommendation |
| `POST /api/layer` | Layering compatibility |
| `POST /api/snap` | Bottle ID — text (no key) or photo (needs Gemini) |
| `GET  /api/health` | Live capability report |

Public routes are rate limited per client: 120/min for engine routes, 10/min
for AI routes.

---

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint
```

---

## Status

Working end to end: all four scoring engines, catalogue search, wardrobe
(local), and the full API surface.

Not yet built: authentication, the social feed and marketplace against real
data, and ScentCulture's trend aggregation. Those pages currently render
clearly-labelled placeholder content. See the roadmap for sequencing.
