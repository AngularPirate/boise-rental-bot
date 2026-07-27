"""Search criteria and delivery config. Not secret — edit freely."""

# --- Hard criteria ---
MAX_RENT = 1600
MIN_BEDS = 1
MAX_BEDS = 2
NEIGHBORHOODS = ["bench", "north end", "southeast boise", "se boise", "garden city"]

# Approximate ZIP-code proxy for the target neighborhoods (used as a fallback when
# the listing text doesn't name the neighborhood outright). Not exact — several of
# these ZIPs extend past the informal neighborhood boundary — but far more reliable
# than hand-drawn lat/long boxes.
NEIGHBORHOOD_ZIPS = {
    "83702": "north end",
    "83705": "bench",
    "83709": "bench",
    "83706": "southeast boise",
    "83716": "southeast boise",
    "83714": "garden city",
}
MOVE_IN_TARGET = "2026-09-01"
MOVE_IN_FALLBACK = "2026-08-15"

# --- Delivery ---
RECIPIENTS = ["spencer.a.slavens@gmail.com", "jaredbrodd@gmail.com"]
SENDER_EMAIL = "jaredbrodd@gmail.com"

# --- Sources ---
CRAIGSLIST_SEARCH_URL = (
    "https://www.craigslist.org/search/area/boise?cat=apa"
    "&max_price={max_price}&min_bedrooms={min_beds}&max_bedrooms={max_beds}"
)

# AppFolio-hosted Boise-area property management companies.
# To add more: find "{name}.appfolio.com" in a PM company's page source,
# then confirm https://{name}.appfolio.com/listings returns listing cards.
APPFOLIO_SUBDOMAINS = [
    "alohapm",  # Aloha Property Management
]

DASHBOARD_TITLE = "Boise Rental Watch"
DASHBOARD_URL = "https://angularpirate.github.io/boise-rental-bot/"

# Email is a concise daily brief, not a full dump — cap how many cards get
# embedded inline per section; the rest are a count + link to the dashboard.
# (Matters most on the very first run, when every listing is "new" to the bot.)
EMAIL_CONTACT_TODAY_PREVIEW = 20
EMAIL_STILL_LIVE_PREVIEW = 8
