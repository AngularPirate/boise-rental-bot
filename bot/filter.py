"""Deterministic hard-criteria filtering. No AI involved."""

import re

import config

ZIP_RE = re.compile(r'\b(\d{5})\b')


def _area_match(text):
    if any(n in text for n in config.NEIGHBORHOODS):
        return True
    for zip_code in ZIP_RE.findall(text):
        if zip_code in config.NEIGHBORHOOD_ZIPS:
            return True
    return False


def _is_apartment(text):
    return any(kw in text for kw in config.APARTMENT_KEYWORDS)


def apply_filters(listings):
    kept = []
    for listing in listings:
        if listing["price"] > config.MAX_RENT:
            continue
        if listing["pet_cats"] == "not_allowed":
            continue

        type_text = f"{listing['title']} {listing.get('description', '')}".lower()
        if _is_apartment(type_text):
            continue

        beds = listing.get("beds")
        if beds is not None and not (config.MIN_BEDS <= beds <= config.MAX_BEDS):
            continue

        flags = []
        if beds is None:
            flags.append("beds unconfirmed")
        if listing["pet_cats"] == "unclear":
            flags.append("pet policy unclear — confirm cats allowed before contacting")

        text = f"{listing['title']} {listing['address']} {listing.get('description', '')}".lower()
        area_match = _area_match(text)
        if not area_match:
            flags.append("area unconfirmed — verify it's Bench/North End/SE Boise/Garden City")

        listing["flags"] = flags
        listing["area_match"] = area_match
        kept.append(listing)
    return kept
