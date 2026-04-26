# 🧠 Smart Reviewer

A small full-stack web app that lets you search recent news articles, send any one of them through an LLM for summary + sentiment, and browse the persisted analyses. Built as a take-home case study for an Aries Global software engineer interview.

## ✨ What it does

1. Search recent news from **GNews.io** by keyword.
2. Click **Analyze** on any article to send its title + description to **OpenAI gpt-4o-mini**, which returns a 2–3 sentence summary and a sentiment label (`positive` / `neutral` / `negative`) in a single structured JSON response.
3. Results are persisted in **MongoDB** and shown in a sortable table at `/results`. Re-analyzing the same URL is a no-op — the existing record is returned.

## 🏛️ Architecture

```
┌────────────────────────┐         ┌─────────────────────────────┐
│  React 19 + TS (Vite)  │  HTTPS  │  Rails 8.1 API (Puma)        │
│  TanStack Router/Query │ ──────▶ │  Mongoid 9                   │
│  Tailwind CSS          │         │  /api/articles               │
│                        │ ◀────── │  /api/analyses               │
│  hosted: Render Static │         │  /api/results                │
└────────────────────────┘         └────────────┬────────────────┘
                                                │
                          ┌─────────────────────┼──────────────────────┐
                          ▼                     ▼                      ▼
                   ┌────────────┐        ┌────────────┐         ┌──────────────┐
                   │  GNews.io  │        │  OpenAI    │         │  MongoDB     │
                   │  /search   │        │ gpt-4o-mini│         │  Docker (dev)│
                   └────────────┘        └────────────┘         │  Atlas (prod)│
                                                                └──────────────┘
```

The flow is intentionally synchronous: the frontend POSTs an article to `/api/analyses`, the backend hits OpenAI inline (3–5s typical), persists the row, and returns it. No background workers — at this scale, chasing async machinery would have been over-engineering.

## 🧱 Stack & rationale

| Layer | Choice | Why |
|---|---|---|
| Backend | **Rails 8.1 (API-only)** | The brief asks for Rails; API-only mode strips views/assets we don't need. |
| ORM | **Mongoid 9** (no ActiveRecord) | The brief explicitly required MongoDB; Mongoid is the idiomatic Rails ↔ Mongo mapper. |
| LLM client | `ruby-openai` | Maintained, supports `response_format: { type: 'json_object' }` so we get guaranteed JSON back. |
| News API | `httparty` against GNews.io | Free tier is enough for a demo; small footprint vs a full `Faraday` setup. |
| Frontend | **Vite + React 19 + TypeScript** | Fastest dev loop; React 19 is current LTS in 2026. |
| Routing | **TanStack Router** | File-based, type-safe, integrates cleanly with TanStack Query. |
| Server state | **TanStack Query** | Built-in caching, retries, mutation invalidation — saves a lot of glue code for "fetch list, mutate, refresh list". |
| Styling | **Tailwind CSS 3** | Quickest path to a clean, neutral look without bikeshedding a component library. |
| DB (dev) | **MongoDB 7 in Docker** | Local container, persistent volume, zero impact on prod data. |
| DB (prod) | **MongoDB Atlas (M0 free tier)** | Managed, free, separate from local — see Trade-offs below. |
| Deploy | **Render** (Static Site + Web Service) | Two free tiers, zero-config for Rails + Vite, no Docker/Kamal needed. |

### 🤖 One LLM call per article

The brief asks for both summary and sentiment. Rather than two round trips, we use a single chat completion with `response_format: { type: 'json_object' }` and ask the model to return `{ summary, sentiment }`. Half the latency, half the cost, and the model still has the full article context for both fields.

### 🪞 Backend dedup on URL

`Result` has a unique index on `url`. The `analyses#create` controller does a `find_by(url:)` first and short-circuits if the article was already analyzed, so the OpenAI call only runs once per URL. The frontend trusts the backend on this — it doesn't try to dedup client-side.

---

## 🛠️ Local development

### 📋 Prerequisites

- **Ruby 3.3+** (project is built on 3.4.1 via [`mise`](https://mise.jdx.dev))
- **Node 20 LTS** or **22 LTS** (project uses 22)
- **Docker** (for the local MongoDB container)
- API keys: [GNews](https://gnews.io) and [OpenAI](https://platform.openai.com)

### 🐳 1. Start MongoDB locally (Docker)

```bash
docker run -d \
  --name smart-reviewer-mongo \
  --restart unless-stopped \
  -p 27017:27017 \
  -v smart-reviewer-mongo-data:/data/db \
  mongo:7
```

Mongo is now running on `localhost:27017`. The named volume `smart-reviewer-mongo-data` persists data across container restarts and reboots.

| Command | Purpose |
|---|---|
| `docker start smart-reviewer-mongo` | Start it again after a reboot |
| `docker stop smart-reviewer-mongo` | Stop it (data preserved) |
| `docker exec -it smart-reviewer-mongo mongosh smart_reviewer_dev` | Open the Mongo shell |
| `docker rm -f smart-reviewer-mongo && docker volume rm smart-reviewer-mongo-data` | Wipe everything |

### 🛤️ 2. Backend (`api/`)

```bash
cd api
bundle install
cp .env.example .env       # then fill in GNEWS_API_KEY and OPENAI_API_KEY
bundle exec rake db:mongoid:create_indexes
bundle exec rails s
```

`api/.env` should look like this for local dev:

```env
MONGODB_URI=mongodb://localhost:27017/smart_reviewer_dev
GNEWS_API_KEY=...
OPENAI_API_KEY=...
FRONTEND_ORIGIN=http://localhost:5173
```

The API listens on `http://localhost:3000`. Health check: `GET /up`.

> **Heads-up:** `dotenv-rails` reads `.env` once at boot. If you change a value, restart `rails s` for it to take effect (Rails hot-reloads `app/` code, but not env vars or `config/`).

### ⚛️ 3. Frontend (`web/`)

In a second terminal:

```bash
cd web
npm install
npm run dev                # no .env needed in dev — see CORS note below
```

Open <http://localhost:5173> in your browser and you should be able to search → analyze → view results end-to-end.

#### 🔁 The CORS-free dev setup

The frontend's API client (`src/api/client.ts`) builds requests as `fetch(\`${VITE_API_URL}${path}\`)`. In dev, `VITE_API_URL` is intentionally empty, so calls become URL-relative (`fetch('/api/articles')`) and stay **same-origin** with the Vite dev server on `http://localhost:5173`.

`vite.config.ts` sets up a proxy: any request to `/api/*` is forwarded server-to-server to Rails on `:3000`. The browser only ever sees same-origin traffic, so no CORS preflight, no headers to debug, no `rack-cors` involvement.

`rack-cors` is still configured (`config/initializers/cors.rb`) — it just doesn't fire in dev. It's there to allow the **production** frontend (`https://...onrender.com`) to call the **production** backend (a different origin), which is a real cross-origin request the browser does check. See the deployment section.

### 🔍 4. (Optional) Browse Mongo from a UI

If you want a graphical view of your local data, spin up [`mongo-express`](https://github.com/mongo-express/mongo-express):

```bash
docker run -d \
  --name smart-reviewer-mongo-express \
  --restart unless-stopped \
  -e ME_CONFIG_MONGODB_URL=mongodb://host.docker.internal:27017 \
  -e ME_CONFIG_BASICAUTH=false \
  -e ME_CONFIG_MONGODB_ENABLE_ADMIN=true \
  -p 8081:8081 \
  mongo-express
```

Then open <http://localhost:8081> → click `smart_reviewer_dev` → `results`. Useful for verifying that the analyses you trigger from the UI are actually persisted, and for inspecting the indexes (`url_1` unique, `created_at_-1`).

[MongoDB Compass](https://www.mongodb.com/products/compass) is a polished native alternative — same idea, native macOS app, connect to `mongodb://localhost:27017`.

### 🧪 Quick API smoke test

```bash
curl -s "http://localhost:3000/up"
curl -s "http://localhost:3000/api/articles?q=openai" | jq
curl -s -X POST "http://localhost:3000/api/analyses" \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com/x","title":"Test","description":"Some content","source":"Demo","published_at":"2026-04-25T12:00:00Z"}' | jq
curl -s "http://localhost:3000/api/results" | jq
```

### 🪟 Local ports cheatsheet

| Port | Service |
|---|---|
| `3000` | Rails API |
| `5173` | Vite dev server (frontend) |
| `8081` | mongo-express (optional UI) |
| `27017` | MongoDB (Docker) |

---

## 🚀 Production deployment (Render)

Production is **completely isolated** from local dev: a different MongoDB cluster (Atlas), separate env vars, separate URLs. No shared state.

The repo ships a **`render.yaml` Blueprint** at the root that declares both services (the Rails API as a Web Service, the Vite SPA as a Static Site) along with their build commands, regions, env vars and SPA rewrite. The Rails build itself is delegated to **`api/bin/render-build.sh`** so the YAML stays declarative and the script is reproducible locally. See those two files for per-field rationale — every line is commented.

### 🍃 1. Prepare a MongoDB Atlas database

Use your existing M0 cluster (or create one on [cloud.mongodb.com](https://cloud.mongodb.com)). Build the URI with `/smart_reviewer_prod` as the DB name (separate from local dev's `smart_reviewer_dev`):

```
mongodb+srv://<user>:<pass>@cluster.xxxx.mongodb.net/smart_reviewer_prod?retryWrites=true&w=majority
```

> Without a DB name in the path, Mongoid falls back to `admin` and Atlas refuses the write. The DB name is required.

> **Never commit this URI.** It only lives in Render's env vars (set in step 3 below).

### 🚀 2. Apply the Blueprint

1. Push this repo to GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New +** → **Blueprint** → connect this repo, branch `main`.
3. Render parses `render.yaml` and shows the two services it will create. Click **Apply**.

### 🔐 3. Fill in the prompted env vars

Render shows a form for each variable marked `sync: false` in `render.yaml`. Paste:

| Service | Key | Value |
|---|---|---|
| `smart-reviewer-api` | `MONGODB_URI` | Atlas prod URI from step 1 |
| `smart-reviewer-api` | `GNEWS_API_KEY` | your GNews key |
| `smart-reviewer-api` | `OPENAI_API_KEY` | your OpenAI key |
| `smart-reviewer-api` | `RAILS_MASTER_KEY` | contents of `api/config/master.key` |
| `smart-reviewer-api` | `FRONTEND_ORIGIN` | _leave empty_ — set in step 4 |
| `smart-reviewer-web` | `VITE_API_URL` | _leave empty_ — set in step 4 |

Click **Apply** and wait for both services to go live (~5 min).

### 🔗 4. Wire the two services together

Once both services have a public URL:

1. **api** service → Environment → `FRONTEND_ORIGIN = https://smart-reviewer-web.onrender.com`
2. **web** service → Environment → `VITE_API_URL = https://smart-reviewer-api.onrender.com`

Render auto-redeploys each service on env-var changes (~1-2 min each). After that, the frontend can talk to the API cross-origin (CORS handled by `rack-cors`), and the API allowlists the frontend's origin.

---

## ⚖️ Trade-offs & decisions

- **Single OpenAI call returning JSON.** Summary + sentiment in one round trip via `response_format: { type: 'json_object' }`. Cheaper, faster, and the JSON shape is enforced by the API.
- **Sync analysis, no background jobs.** A 3–5s blocking request is fine for a demo and fits the brief. Adding Sidekiq/Solid Queue here would be ceremony with no payoff at this scale.
- **Dedup at the backend.** Unique index on `url` plus an explicit `find_by` check in `analyses#create`. The frontend trusts the response — it doesn't try to track "already analyzed" state in the client.
- **Strict local/prod DB separation.** Local dev hits a Docker MongoDB (`smart_reviewer_dev`); production hits a separate Atlas cluster (`smart_reviewer_prod`). No risk of a stray `Result.destroy_all` in a console wiping production data, no test garbage polluting prod, and the Atlas free-tier quota stays untouched while developing. The cost is a tiny bit of setup (one `docker run`).
- **No tests** (intentional, mentioned upfront). With more time I'd add RSpec request specs covering the three endpoints, plus Vitest + React Testing Library for the components and hooks.
- **No auth, no rate limiting.** Out of scope for a demo, but obvious next steps if this were ever public.
- **TanStack Query, not Redux.** Server state is 95% of this app's state; a query cache solves the problem more directly than a global store + manual fetch glue.

## 🔭 What I'd add with more time

- **Tests**: RSpec request specs for the 3 endpoints, mocking GNews + OpenAI. Vitest + RTL for `ArticleCard`, `ResultsTable`, `useAnalyze`.
- **Async analysis** with Solid Queue or Sidekiq if the analysis grew (e.g. multi-step, vector embeddings, or batch).
- **Pagination + search history** on `/results`, and a per-URL detail page.
- **Sentry** (or similar) on both sides for production error visibility.
- **Auth + rate limiting** (`rack-attack`) before exposing this publicly.
- **GitHub Actions CI**: Ruby lint + frontend typecheck/build on every PR.
- **Tighter Atlas IP allowlist** scoped to Render's outbound IPs only (currently open to `0.0.0.0/0` for setup convenience).
