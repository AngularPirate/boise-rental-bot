# Boise Rental Bot

Daily automated scan for Boise rentals (house/townhouse/condo, 1-2bd, $1,600/mo or less,
cats allowed, Bench/North End/SE Boise/Garden City, move-in by mid-Aug/Sept 1).

Delivers a daily email to Jared + Spencer and publishes a live HTML dashboard via GitHub Pages.
Zero AI cost — the whole pipeline (fetch/filter/rank/render) is deterministic Python.

## Sources (v1)

- **Craigslist** (`bot/sources/craigslist.py`) — scrapes the plain HTML search page
  (Craigslist's RSS feed returns 403 as of 2026; the HTML page still works).
- **AppFolio-hosted PM companies** (`bot/sources/appfolio.py`) — many Boise property
  management companies run on AppFolio, which serves a public, server-rendered
  listings page at `https://{subdomain}.appfolio.com/listings`. Currently configured
  for Aloha Property Management (`alohapm`). Add more in `config.APPFOLIO_SUBDOMAINS`
  once you confirm a company uses AppFolio (look for `{name}.appfolio.com` in their
  site source) and that their `/listings` page returns listing cards.

**Not included in v1** (researched, deliberately skipped for cost/reliability):
Rentvine and Rent Manager-based PM sites render listings via client-side JS and would
need a headless browser (Playwright) to scrape — heavier and more fragile. Zillow,
Trulia, Apartments.com, Realtor.com, and Redfin all run aggressive anti-bot protection
and prohibit scraping in their ToS; getting that data legally means a paid API like
RentCast.

## Local setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 main.py --no-email   # writes docs/index.html, skips email
python3 main.py              # also emails, if GMAIL_ADDRESS/GMAIL_APP_PASSWORD are set
```

## One-time GitHub setup

1. **Gmail app password** — go to https://myaccount.google.com/apppasswords, generate
   an app password for "Mail", and add these two repo secrets yourself
   (Settings → Secrets and variables → Actions → New repository secret):
   - `GMAIL_ADDRESS` = jaredbrodd@gmail.com
   - `GMAIL_APP_PASSWORD` = the generated app password
2. **GitHub Pages** — Settings → Pages → Source: "Deploy from a branch" → Branch: `main`,
   folder: `/docs`. The dashboard will be live at
   `https://<username>.github.io/boise-rental-bot/`.
3. The `.github/workflows/daily.yml` cron fires daily and commits the refreshed
   dashboard + `state.json` back to the repo. Trigger a run manually anytime from the
   Actions tab (`workflow_dispatch`) to test without waiting for the schedule.

## How ranking works

- **Contact Today**: posted (Craigslist) or first seen by the bot (AppFolio) within
  the last 24 hours.
- Score rewards: recency, price closer to the $1,600 ceiling with more beds (more
  space for the money), exact neighborhood match, Sept 1 move-in mention, and
  explicit "cats OK" pet policy.
- Listings with unclear pet policy, unconfirmed bed count, or unconfirmed
  neighborhood are still shown, flagged for manual confirmation — never silently
  dropped just because the scrape couldn't confirm a soft detail.
