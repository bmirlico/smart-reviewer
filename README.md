# 🧠 Smart Reviewer

A small full-stack web app that searches recent news articles, analyzes any one of them with an LLM (summary + sentiment), and persists the results. Built as a take-home case study for an Aries Global software engineer interview.

## 🎥 Demo

- **🌐 Live app:** <https://smart-reviewer-web.onrender.com>
- **🎬 Walkthrough video:** 

https://github.com/user-attachments/assets/4a06ab21-4a2d-43e2-9308-ecb01582d582





> First load may take ~30s — the Render free tier puts the API to sleep after 15 min of inactivity.

## ✨ What it does

1. Search recent news from **GNews.io** by keyword.
2. Click **Analyze** on an article → its title + description go to **OpenAI gpt-4o-mini**, which returns `{ summary, sentiment }` in a single structured-JSON call.
3. Results are persisted in **MongoDB** and shown in a sortable table at `/results`. Re-analyzing the same URL is a no-op (the existing record is returned).

## 🏛️ Architecture

```
┌────────────────────────┐         ┌─────────────────────────────┐
│  React 19 + TS (Vite)  │  HTTPS  │  Rails 8.1 API (Puma)        │
│  TanStack Router/Query │ ──────▶ │  Mongoid 9                   │
│  Tailwind CSS          │         │  /api/articles               │
│                        │ ◀────── │  /api/analyses               │
│  Render Static Site    │         │  /api/results                │
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

Analysis is intentionally **synchronous** (3–5s blocking). At this scale, a background worker would have been over-engineering.

## 🧱 Stack

| Layer | Choice |
|---|---|
| Backend | Rails 8.1 (API-only) |
| ORM | Mongoid 9 (no ActiveRecord) |
| LLM | `ruby-openai` + gpt-4o-mini |
| News API | `httparty` against GNews.io |
| Frontend | Vite + React 19 + TypeScript |
| Routing / data | TanStack Router + TanStack Query |
| Validation | Zod schemas at the network boundary |
| Styling | Tailwind CSS 3 |
| DB (dev / prod) | Docker MongoDB / Atlas M0 |
| Deploy | Render (Web Service + Static Site) via `render.yaml` Blueprint |

## 🛠️ Local development

**Prereqs:** Ruby 3.3+, Node 20/22 LTS, Docker, GNews + OpenAI keys.

```bash
# 1. Mongo (Docker, persistent volume)
docker run -d --name smart-reviewer-mongo --restart unless-stopped \
  -p 27017:27017 -v smart-reviewer-mongo-data:/data/db mongo:7

# 2. Backend
cd api
bundle install
cp .env.example .env       # fill GNEWS_API_KEY + OPENAI_API_KEY
bundle exec rake db:mongoid:create_indexes
bundle exec rails s        # http://localhost:3000

# 3. Frontend (in another terminal)
cd web
npm install && npm run dev # http://localhost:5173
```

Open <http://localhost:5173> and use the app.

In dev, `VITE_API_URL` is empty so the frontend calls `/api/*` URL-relative; Vite proxies those to Rails. Result: same-origin in the browser, no CORS in dev. `rack-cors` is wired for prod where the two services live on different hosts.

**Optional Mongo UI:** `mongo-express` ([one-liner](https://github.com/mongo-express/mongo-express)) on `localhost:8081`, or [Compass](https://www.mongodb.com/products/compass) connected to `mongodb://localhost:27017`.

**API smoke test:**
```bash
curl http://localhost:3000/up
curl "http://localhost:3000/api/articles?q=openai" | jq
curl http://localhost:3000/api/results | jq
```

## 🚀 Production deployment (Render)

Defined entirely by **`render.yaml`** at the repo root + **`api/bin/render-build.sh`** for the Rails build — both files are commented. Strict separation from local dev: a different Atlas DB (`smart_reviewer_prod`), separate env vars, separate URLs.

1. **Atlas:** build a URI ending with `/smart_reviewer_prod?...&authSource=admin`. Allow `0.0.0.0/0` in Network Access.
2. **Blueprint:** push to GitHub → Render Dashboard → New + → Blueprint → select repo. Render prompts for the `sync: false` env vars (`MONGODB_URI`, `GNEWS_API_KEY`, `OPENAI_API_KEY`, `RAILS_MASTER_KEY`).
3. **Wire the two services** once they're live: set `FRONTEND_ORIGIN` on the api to the web URL, and `VITE_API_URL` on the web to the api URL. Both auto-redeploy on env-var change.

## ⚖️ Trade-offs

- **One LLM call returning JSON.** Summary + sentiment in a single chat completion via `response_format: json_object`. Half the latency, half the cost.

## 🔭 With more time

- Tests: RSpec request specs

