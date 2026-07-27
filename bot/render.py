"""Builds the static HTML dashboard. Plain string templating, no AI, no template deps."""

import html
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

import config

MOUNTAIN_TZ = ZoneInfo("America/Denver")

STYLE = """
:root {
  --bg: #faf6f0;
  --card: #ffffff;
  --ink: #2b2420;
  --ink-soft: #6b6058;
  --accent: #c96a3c;
  --accent-soft: #f0dcc8;
  --border: #ece3d8;
  --warn-bg: #fbeee2;
  --warn-ink: #9a5a1f;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 2.5rem 1.5rem 4rem;
  background: var(--bg);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}
.wrap { max-width: 780px; margin: 0 auto; }
header { margin-bottom: 2.5rem; }
h1 { font-size: 1.75rem; margin: 0 0 0.35rem; letter-spacing: -0.02em; }
.subtitle { color: var(--ink-soft); font-size: 0.95rem; }
h2 {
  font-size: 1rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--ink-soft); margin: 2.5rem 0 1rem; font-weight: 600;
}
.card {
  background: var(--card); border: 1px solid var(--border); border-radius: 14px;
  padding: 1.1rem 1.3rem; margin-bottom: 0.9rem;
}
.card-top { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; }
.card-title { font-weight: 600; font-size: 1.05rem; }
.card-title a { color: var(--ink); text-decoration: none; }
.card-title a:hover { color: var(--accent); }
.price { color: var(--accent); font-weight: 700; white-space: nowrap; }
.meta { color: var(--ink-soft); font-size: 0.9rem; margin-top: 0.3rem; }
.why { margin-top: 0.55rem; font-size: 0.92rem; }
.badges { margin-top: 0.6rem; display: flex; flex-wrap: wrap; gap: 0.4rem; }
.badge {
  font-size: 0.78rem; padding: 0.2rem 0.55rem; border-radius: 999px;
  background: var(--accent-soft); color: var(--accent);
}
.badge.warn { background: var(--warn-bg); color: var(--warn-ink); }
.empty { color: var(--ink-soft); font-style: italic; }
.updated-badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  margin-top: 0.7rem; font-size: 0.85rem; color: var(--ink-soft);
  background: var(--accent-soft); padding: 0.3rem 0.7rem; border-radius: 999px;
}
.updated-badge .dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--accent);
}
footer {
  margin-top: 3rem; padding-top: 1.2rem; border-top: 1px solid var(--border);
  color: var(--ink-soft); font-size: 0.85rem;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1c1815; --card: #262019; --ink: #f0e9e0; --ink-soft: #a89d90;
    --accent: #e08a5b; --accent-soft: #3a2a1c; --border: #3a3128;
    --warn-bg: #3a2a1c; --warn-ink: #e0a86a;
  }
}
"""


def _esc(text):
    return html.escape(text or "")


def _why_it_matters(listing):
    bits = []
    if listing["contact_today"]:
        bits.append("posted in the last 24h")
    if listing.get("area_match"):
        bits.append("exact neighborhood match")
    if listing.get("pet_cats") == "allowed":
        bits.append("cats explicitly OK")
    if listing.get("available_date") == config.MOVE_IN_TARGET:
        bits.append("available exactly Sept 1")
    if not bits:
        bits.append(f"scored {listing['score']} on price/area/timing")
    return ", ".join(bits).capitalize()


def _card_html(listing):
    beds = listing.get("beds")
    baths = listing.get("baths")
    bb = []
    if beds is not None:
        bb.append(f"{beds:g} bd")
    if baths is not None:
        bb.append(f"{baths:g} ba")
    bb_str = " / ".join(bb) if bb else "beds/baths unlisted"

    badges = "".join(f'<span class="badge warn">{_esc(f)}</span>' for f in listing.get("flags", []))

    return f"""
    <div class="card">
      <div class="card-top">
        <div class="card-title"><a href="{_esc(listing['url'])}" target="_blank" rel="noopener">{_esc(listing['title'])}</a></div>
        <div class="price">${listing['price']:,}/mo</div>
      </div>
      <div class="meta">{_esc(listing['address'])} &middot; {bb_str} &middot; {_esc(listing['source'])}</div>
      <div class="why">{_esc(_why_it_matters(listing))}</div>
      <div class="badges">{badges}</div>
    </div>
    """


def _section_html(title, listings):
    if not listings:
        return f'<h2>{_esc(title)}</h2><p class="empty">Nothing here right now.</p>'
    cards = "".join(_card_html(listing) for listing in listings)
    return f"<h2>{_esc(title)} ({len(listings)})</h2>{cards}"


def render_dashboard(ranked_listings, scanned_count, now=None):
    now = now or datetime.now(timezone.utc)
    contact_today = [listing for listing in ranked_listings if listing["contact_today"]]
    still_live = [listing for listing in ranked_listings if not listing["contact_today"]]

    updated_str = now.astimezone(MOUNTAIN_TZ).strftime("%b %-d, %Y at %-I:%M %p MT")

    body = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{_esc(config.DASHBOARD_TITLE)}</title>
<style>{STYLE}</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>{_esc(config.DASHBOARD_TITLE)}</h1>
    <div class="subtitle">Boise houses, townhomes &amp; condos under ${config.MAX_RENT:,}/mo &middot; cats OK &middot; move-in by {config.MOVE_IN_FALLBACK}</div>
    <div class="updated-badge"><span class="dot"></span>Updated {updated_str} &middot; refreshes daily at 8am MT</div>
  </header>

  {_section_html("Contact Today", contact_today)}
  {_section_html("Still Live", still_live)}

  <footer>
    {scanned_count} listings scanned &middot; next run tomorrow 8:00am MT
  </footer>
</div>
</body>
</html>
"""
    return body


def write_dashboard(ranked_listings, scanned_count, path, now=None):
    html_str = render_dashboard(ranked_listings, scanned_count, now=now)
    with open(path, "w") as f:
        f.write(html_str)
    return html_str
