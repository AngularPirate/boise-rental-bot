"""Persisted dedupe/first-seen tracking across daily runs (committed to the repo)."""

import json
import os
from datetime import datetime, timezone

STATE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "state.json")
PRUNE_AFTER_DAYS = 14


def load_state(path=STATE_PATH):
    if not os.path.exists(path):
        return {"seen": {}}
    with open(path) as f:
        return json.load(f)


def save_state(state, path=STATE_PATH):
    with open(path, "w") as f:
        json.dump(state, f, indent=2, sort_keys=True)


def update_and_annotate(listings, state, now=None):
    """Mutates state in place; tags each listing with first_seen / hours_since_first_seen."""
    now = now or datetime.now(timezone.utc)
    seen = state.setdefault("seen", {})

    for listing in listings:
        entry = seen.get(listing["id"])
        if entry is None:
            entry = {"first_seen": now.isoformat()}
            seen[listing["id"]] = entry

        first_seen = datetime.fromisoformat(entry["first_seen"])
        listing["first_seen"] = entry["first_seen"]
        listing["hours_since_first_seen"] = (now - first_seen).total_seconds() / 3600

        entry["last_seen"] = now.isoformat()
        entry["last_price"] = listing["price"]

    cutoff = now.timestamp() - PRUNE_AFTER_DAYS * 24 * 3600
    stale_ids = [
        lid for lid, e in seen.items()
        if datetime.fromisoformat(e.get("last_seen", e["first_seen"])).timestamp() < cutoff
    ]
    for lid in stale_ids:
        del seen[lid]

    return listings
