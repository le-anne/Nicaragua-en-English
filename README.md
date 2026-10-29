# Nicaragua News en English

API + frontend that gather English-language Nicaragua headlines from newsrooms around the world.

## Stack

- **API** — Express, Axios, Cheerio (`index.mjs`)
- **Frontend** — Vite + React (`client/`)

Originally published on [RapidAPI](https://rapidapi.com/leannevictoriaharris/api/nicaragua-news-en-english/). The companion frontend used to live in [nicaraguanews](https://github.com/le-anne/nicaraguanews); this repo now hosts both.

## Run locally

```bash
npm install
npm run start:api          # http://localhost:8000
npm run start:client       # http://localhost:5173 (proxies /api → :8000)
```

### API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info |
| GET | `/news` | All articles (cached ~5 min; `?refresh=1` forces scrape) |
| GET | `/news/:newspaperId` | One source (`al-jazeera`, `BBC`, …) |
| GET | `/sources` | Newspaper list |

Each article includes `title`, `str` (legacy), `url`, `source`, and `image`.
