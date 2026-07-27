"""Deterministic urgency scoring. No AI involved."""

from datetime import datetime, timezone

import config

SEPT_TERMS = ["sept 1", "september 1", "9/1", "sep 1"]
AUG_TERMS = ["mid-august", "mid august", "aug 15", "8/15", "august 15"]


def _age_hours(listing, now):
    posted_at = listing.get("posted_at")
    if posted_at:
        if posted_at.tzinfo is None:
            posted_at = posted_at.replace(tzinfo=timezone.utc)
        return (now - posted_at).total_seconds() / 3600
    return listing.get("hours_since_first_seen", 0.0)


def _move_in_match(text):
    text = text.lower()
    if any(t in text for t in SEPT_TERMS):
        return "target"
    if any(t in text for t in AUG_TERMS):
        return "fallback"
    return None


def score_listing(listing, now=None):
    now = now or datetime.now(timezone.utc)
    age_hours = _age_hours(listing, now)
    is_contact_today = age_hours <= 24

    score = 40.0 if is_contact_today else max(0.0, 20.0 - (age_hours / 24 - 1) * 3)

    score += (listing["price"] / config.MAX_RENT) * 15
    if listing.get("beds"):
        score += listing["beds"] * 5

    if listing.get("area_match"):
        score += 15

    move_in = _move_in_match(f"{listing.get('title', '')} {listing.get('description', '')}")
    if move_in == "target":
        score += 15
    elif move_in == "fallback":
        score += 8

    if listing.get("pet_cats") == "allowed":
        score += 10
    elif listing.get("pet_cats") == "unclear":
        score += 3

    listing["score"] = round(score, 1)
    listing["contact_today"] = is_contact_today
    listing["age_hours"] = round(age_hours, 1)
    return listing


def rank_listings(listings, now=None):
    now = now or datetime.now(timezone.utc)
    for listing in listings:
        score_listing(listing, now)
    return sorted(listings, key=lambda listing: listing["score"], reverse=True)
