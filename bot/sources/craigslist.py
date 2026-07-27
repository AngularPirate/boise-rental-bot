"""Craigslist scraper. Uses the plain HTML search page (RSS returns 403 as of 2026)."""

import re
import time
import json
import html
from datetime import datetime

import requests

import config

HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
REQUEST_DELAY_SECONDS = 1.5  # be polite; avoid tripping rate limits on a shared runner IP

RESULT_RE = re.compile(
    r'<li class="cl-static-search-result"[^>]*>\s*'
    r'<a href="(?P<url>[^"]+)">\s*'
    r'<div class="title">(?P<title>[^<]*)</div>\s*'
    r'<div class="details">\s*'
    r'<div class="price">\$(?P<price>[\d,]+)</div>\s*'
    r'<div class="location">\s*(?P<address>[^<]*?)\s*</div>',
    re.MULTILINE,
)

LD_JSON_RE = re.compile(
    r'<script type="application/ld\+json" id="ld_searchpage_results" >\s*(\{.*?\})\s*</script>',
    re.DOTALL,
)

# Craigslist only has a checkbox for "cats are OK" — there's no structured
# "cats not allowed" attribute, so explicit exclusion has to come from the free text.
PETS_CAT_ATTR_RE = re.compile(r'class="attr pets_cat"')
DATETIME_RE = re.compile(r'datetime="([^"]+)"')
NO_PETS_RE = re.compile(r'\bno (pets|cats|dogs)\b|\bcats not (ok|allowed)\b', re.IGNORECASE)


def _extract_id(url):
    match = re.search(r'/(\d+)\.html', url)
    if match:
        return f"craigslist:{match.group(1)}"
    return f"craigslist:{url}"


def _fetch(url):
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    return resp.text


def _parse_search_results(html_text):
    """Returns list of dicts with title/url/price/address, in page order."""
    results = []
    for m in RESULT_RE.finditer(html_text):
        price = int(m.group("price").replace(",", ""))
        results.append({
            "url": m.group("url"),
            "title": html.unescape(m.group("title")).strip(),
            "price": price,
            "address": html.unescape(m.group("address")).strip(),
        })
    return results


def _parse_bed_bath_by_position(html_text):
    """The ld+json block gives numberOfBedrooms/Bathrooms indexed by search position."""
    m = LD_JSON_RE.search(html_text)
    if not m:
        return {}
    try:
        data = json.loads(m.group(1))
    except json.JSONDecodeError:
        return {}
    out = {}
    for item in data.get("itemListElement", []):
        pos = item.get("position")
        inner = item.get("item", {})
        try:
            pos = int(pos)
        except (TypeError, ValueError):
            continue
        out[pos] = {
            "beds": inner.get("numberOfBedrooms"),
            "baths": inner.get("numberOfBathroomsTotal"),
        }
    return out


def _fetch_detail(url):
    """Pull posted datetime, pet policy, and full description from a listing's detail page."""
    try:
        detail_html = _fetch(url)
    except requests.RequestException:
        return {"posted_at": None, "pet_cats": "unclear", "description": ""}

    posted_at = None
    dm = DATETIME_RE.search(detail_html)
    if dm:
        try:
            posted_at = datetime.fromisoformat(dm.group(1))
        except ValueError:
            posted_at = None

    pet_cats = "allowed" if PETS_CAT_ATTR_RE.search(detail_html) else "unclear"

    body_m = re.search(r'id="postingbody">(.*?)</section>', detail_html, re.DOTALL)
    description = re.sub(r'<[^>]+>', ' ', body_m.group(1)) if body_m else ""
    description = html.unescape(re.sub(r'\s+', ' ', description)).strip()

    if pet_cats == "unclear" and NO_PETS_RE.search(description):
        pet_cats = "not_allowed"

    return {"posted_at": posted_at, "pet_cats": pet_cats, "description": description}


def fetch_listings():
    """Returns normalized listing dicts for Boise apa search matching price/bed criteria."""
    search_url = config.CRAIGSLIST_SEARCH_URL.format(
        max_price=config.MAX_RENT, min_beds=config.MIN_BEDS, max_beds=config.MAX_BEDS
    )
    search_html = _fetch(search_url)
    raw_results = _parse_search_results(search_html)
    bed_bath_by_pos = _parse_bed_bath_by_position(search_html)

    listings = []
    for pos, item in enumerate(raw_results):
        if item["price"] > config.MAX_RENT:
            continue
        bb = bed_bath_by_pos.get(pos, {})

        time.sleep(REQUEST_DELAY_SECONDS)
        detail = _fetch_detail(item["url"])

        listings.append({
            "id": _extract_id(item["url"]),
            "source": "craigslist",
            "title": item["title"],
            "url": item["url"],
            "price": item["price"],
            "beds": bb.get("beds"),
            "baths": bb.get("baths"),
            "address": item["address"],
            "pet_cats": detail["pet_cats"],
            "available_date": None,
            "posted_at": detail["posted_at"],
            "description": detail["description"],
        })
    return listings
