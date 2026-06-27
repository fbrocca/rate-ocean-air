# 🚗 Audi Deal Scraper

A daily agent that scans **Audi inventory nationwide**, finds the **best deals
on the models you care about** (default: e‑tron GT / S e‑tron GT / RS e‑tron GT),
and **emails you** when a car is either:

1. **Heavily discounted off MSRP** (e.g. ≥ 8% below sticker), or
2. **Dropping in price fast** day‑over‑day (e.g. a same‑VIN price fell ≥ $1,500 or ≥ 2% since yesterday).

It runs automatically every morning via **GitHub Actions** — no server to keep
running — and commits a price‑history file back to the repo so the
day‑over‑day comparison works across runs.

> Goal: catch the cheapest possible deal the moment it appears.

---

## How it works

```
sources ──► dedupe ──► deal finder ──► report (md + html) ──► email
   │                        │                                    │
   ▼                        ▼                                    ▼
MarketCheck API     compares vs. yesterday's          data/report-latest.md
cars.com (exp.)     prices in data/history.json        committed back to repo
```

- **Nationwide, not per‑dealer.** Instead of scraping hundreds of dealer
  websites (each with different markup and bot protection), it queries an
  aggregator that already indexes every US Audi dealer's inventory with **MSRP
  and the dealer's asking price**.
- **Per‑VIN history.** `data/history.json` records each car's price each day, so
  a sudden drop on a specific VIN is detected even if it's still near MSRP.
- **Two alert triggers, OR'd together** — tune them in `config.yaml`.

### Data sources

| Source | Key needed | Reliability | Notes |
|--------|-----------|-------------|-------|
| **MarketCheck** (default) | `MARKETCHECK_API_KEY` | ⭐ High | Clean JSON, nationwide new/used, MSRP + price. [Free trial tier.](https://www.marketcheck.com/apis) |
| **cars.com** (experimental) | none | ⚠️ Brittle | HTML scraping; selectors may need updates if the site changes. Check their Terms of Use. |

The default is MarketCheck. To run with **no API key**, set `sources: [cars_com]`
in `config.yaml` (and expect occasional maintenance of the parser in
`audi_deals/sources/cars_com.py`).

---

## Setup (≈ 10 minutes)

### 1. Get a MarketCheck API key
Sign up at <https://www.marketcheck.com/apis> and copy your key.

### 2. Add GitHub repository secrets
Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Example | Purpose |
|--------|---------|---------|
| `MARKETCHECK_API_KEY` | `abc123…` | inventory data |
| `SMTP_HOST` | `smtp.gmail.com` | email server |
| `SMTP_PORT` | `587` | email port (`465` for SSL) |
| `SMTP_USER` | `you@gmail.com` | email login |
| `SMTP_PASSWORD` | *app password* | email password ([Gmail App Password](https://support.google.com/accounts/answer/185833), **not** your normal one) |
| `EMAIL_FROM` | `you@gmail.com` | from address |
| `EMAIL_TO` | `fabio@inperaco.com` | where alerts go |

### 3. Pick your models & thresholds
Edit [`config.yaml`](./config.yaml) — models, `new`/`used`, discount %, and the
day‑over‑day drop sensitivity all live there.

### 4. Turn it on
The workflow ([`.github/workflows/audi-deals.yml`](../.github/workflows/audi-deals.yml))
runs daily at 13:00 UTC. Trigger it manually any time from the **Actions** tab →
*Audi deal scan* → **Run workflow**.

---

## Run it locally

```bash
cd audi-deal-scraper
pip install -r requirements.txt
cp .env.example .env          # fill in your keys, then: export $(grep -v '^#' .env | xargs)

# Real run:
python -m audi_deals.cli --config config.yaml

# Offline smoke test against bundled sample data (no key/network needed):
python -m audi_deals.cli --sample tests/fixtures/marketcheck_sample.json --dry-run
```

Every run writes a human‑readable report to **`data/report-latest.md`**.

## Tests

```bash
pip install pytest && python -m pytest -q
```

---

## Configuration reference (`config.yaml`)

```yaml
search:
  models: ["e-tron GT", "RS e-tron GT", "S e-tron GT"]
  condition: new          # new | used | all
  year_min: 2022
  # zip / radius_miles omitted = nationwide
thresholds:
  min_discount_pct: 8.0   # ≥8% under MSRP
  min_day_drop_pct: 2.0   # OR a ≥2% same-VIN drop vs. last run
  min_day_drop_usd: 1500  # OR a ≥$1,500 drop
notify:
  email_to: fabio@inperaco.com
  always_send_digest: false   # true = email daily even with no alerts
sources: [marketcheck]
```

---

## Notes & limitations

- **MSRP availability:** discount alerts require the source to report MSRP. New
  cars usually have it; many used listings don't (those still get day‑over‑day
  tracking and show in the "cheapest" table).
- **cars.com scraping is best‑effort.** It's an unofficial source; markup changes
  can break the parser. MarketCheck is the supported path.
- **Respect site terms & rate limits.** This is built for personal, low‑volume,
  once‑a‑day use.
- **History persistence** relies on the workflow committing `data/history.json`
  back to the repo. Don't delete it, or day‑over‑day resets.

## Project layout

```
audi-deal-scraper/
├── audi_deals/
│   ├── cli.py            # entrypoint: scrape → detect → email → persist
│   ├── config.py         # YAML + env config
│   ├── models.py         # Listing / Deal data classes + discount math
│   ├── dealfinder.py     # dedupe + threshold logic
│   ├── storage.py        # per-VIN price history (history.json)
│   ├── report.py         # markdown + HTML rendering
│   ├── notifier.py       # SMTP email
│   └── sources/          # marketcheck (default), cars_com (experimental)
├── config.yaml
├── tests/
└── data/                 # history.json + report-latest.md (committed by CI)
```
