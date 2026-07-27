"""Daily pipeline: fetch -> filter -> rank -> render dashboard -> email digest -> save state."""

import os
import sys
from datetime import datetime, timezone

import config
from bot import filter as filter_mod
from bot import rank, render, state
from bot.sources import craigslist, appfolio

DOCS_INDEX_PATH = os.path.join(os.path.dirname(__file__), "docs", "index.html")


def fetch_all():
    listings = []
    listings += craigslist.fetch_listings()
    listings += appfolio.fetch_listings(config.APPFOLIO_SUBDOMAINS)
    return listings


def main():
    now = datetime.now(timezone.utc)

    raw_listings = fetch_all()
    scanned_count = len(raw_listings)

    kept = filter_mod.apply_filters(raw_listings)

    bot_state = state.load_state()
    state.update_and_annotate(kept, bot_state, now=now)

    ranked = rank.rank_listings(kept, now=now)

    render.write_dashboard(ranked, scanned_count, DOCS_INDEX_PATH, now=now)
    state.save_state(bot_state)

    print(f"Scanned {scanned_count}, matched {len(ranked)}. Dashboard written to {DOCS_INDEX_PATH}.")

    if "--no-email" in sys.argv:
        print("Skipping email (--no-email passed).")
        return

    if not os.environ.get("GMAIL_ADDRESS") or not os.environ.get("GMAIL_APP_PASSWORD"):
        print("GMAIL_ADDRESS / GMAIL_APP_PASSWORD not set — skipping email.")
        return

    from bot import emailer
    emailer.send_digest(ranked, scanned_count, now=now)
    print(f"Email sent to {', '.join(config.RECIPIENTS)}.")


if __name__ == "__main__":
    main()
