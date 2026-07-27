"""AppFolio public 'available rentals' page scraper.

AppFolio is a common property-management platform; each company gets a public,
server-rendered listings page at https://{subdomain}.appfolio.com/listings —
no JS execution required. Confirmed working against alohapm.appfolio.com.
"""

import re
import html
from datetime import datetime

import requests

HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

BLOCK_RE = re.compile(
    r'class="listing-item result js-listing-item" id="listing_(?P<id>\d+)"(?P<block>.*?)'
    r'(?=class="listing-item result js-listing-item"|\Z)',
    re.DOTALL,
)
DETAIL_LINK_RE = re.compile(r'href="(/listings/detail/[^"]+)"')
IMAGE_ALT_RE = re.compile(r'<img[^>]*alt="([^"]*)"')
RENT_RE = re.compile(r'js-listing-blurb-rent">\s*\$([\d,]+)')
BED_BATH_RE = re.compile(r'js-listing-blurb-bed-bath">\s*([^<]+?)\s*<')
AVAILABLE_RE = re.compile(r'js-listing-available">([^<]*)<')
PET_POLICY_RE = re.compile(r'js-listing-pet-policy">.*?</span>\s*([^<]*)', re.DOTALL)
TITLE_RE = re.compile(r'js-listing-title">\s*<a[^>]*>([^<]*)</a>', re.DOTALL)


def _parse_bed_bath(text):
    beds = baths = None
    m = re.search(r'([\d.]+)\s*bd', text, re.IGNORECASE)
    if m:
        beds = float(m.group(1))
    m = re.search(r'([\d.]+)\s*ba', text, re.IGNORECASE)
    if m:
        baths = float(m.group(1))
    return beds, baths


def _parse_pet_cats(pet_policy_text):
    text = pet_policy_text.lower()
    if not text.strip():
        return "unclear"
    if "cats not allowed" in text or "no cats" in text:
        return "not_allowed"
    if "cats allowed" in text:
        return "allowed"
    return "unclear"


def _parse_available_date(text):
    text = text.strip()
    for fmt in ("%m/%d/%y", "%m/%d/%Y"):
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            continue
    return None


def fetch_listings_for_subdomain(subdomain):
    url = f"https://{subdomain}.appfolio.com/listings"
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    page_html = resp.text

    listings = []
    for m in BLOCK_RE.finditer(page_html):
        block = m.group("block")

        link_m = DETAIL_LINK_RE.search(block)
        detail_url = f"https://{subdomain}.appfolio.com{link_m.group(1)}" if link_m else url

        alt_m = IMAGE_ALT_RE.search(block)
        address = html.unescape(alt_m.group(1)).strip() if alt_m else ""

        rent_m = RENT_RE.search(block)
        price = int(rent_m.group(1).replace(",", "")) if rent_m else None

        beds = baths = None
        bb_m = BED_BATH_RE.search(block)
        if bb_m:
            beds, baths = _parse_bed_bath(bb_m.group(1))

        available_m = AVAILABLE_RE.search(block)
        available_date = _parse_available_date(available_m.group(1)) if available_m else None

        pet_m = PET_POLICY_RE.search(block)
        pet_cats = _parse_pet_cats(pet_m.group(1)) if pet_m else "unclear"

        title_m = TITLE_RE.search(block)
        title = html.unescape(title_m.group(1)).strip() if title_m else address

        if price is None:
            continue

        listings.append({
            "id": f"appfolio:{subdomain}:{m.group('id')}",
            "source": f"appfolio:{subdomain}",
            "title": title,
            "url": detail_url,
            "price": price,
            "beds": beds,
            "baths": baths,
            "address": address,
            "pet_cats": pet_cats,
            "available_date": available_date,
            "posted_at": None,  # AppFolio doesn't expose a "posted" timestamp
            "description": "",
        })
    return listings


def fetch_listings(subdomains):
    listings = []
    for subdomain in subdomains:
        try:
            listings.extend(fetch_listings_for_subdomain(subdomain))
        except requests.RequestException:
            continue
    return listings
