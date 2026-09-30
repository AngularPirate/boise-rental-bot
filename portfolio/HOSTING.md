# Hosting Olivia's Portfolio on GitHub Pages with a Custom Domain

**Outcome:** `https://oliviakoeppen.com` serves the portfolio over HTTPS, `www.oliviakoeppen.com` and `http://` both redirect to it, and the link contains no "github" or "angularpirate".

**Stack:** GitHub Pages (hosting and HTTPS, free) plus a domain from a registrar (~$10–15/yr). HTTPS certificates are free: GitHub issues and renews them automatically through Let's Encrypt.

---

## 1. The pieces, in one paragraph each

**Registrar.** The company you pay for the name (Porkbun, Cloudflare, Namecheap). It records who owns `oliviakoeppen.com` and which **nameservers** answer DNS questions for it. By default the registrar's own nameservers do this, so you edit DNS records in the registrar's dashboard.

**DNS records.** Entries that map names to destinations. A browser asks "where is `oliviakoeppen.com`?" and gets back the records you set. Only four types matter here:

| Type | What it does | Used for |
|---|---|---|
| `A` | Name → IPv4 address | The apex (bare) domain → GitHub's 4 IPv4 addresses |
| `AAAA` | Name → IPv6 address | The apex → GitHub's 4 IPv6 addresses (optional, recommended) |
| `CNAME` | Name → another name ("alias") | `www` → `angularpirate.github.io` |
| `TXT` | Arbitrary text | Proving to GitHub that you own the domain |

**Why the apex can't be a CNAME.** DNS rules forbid a CNAME at the zone apex (`oliviakoeppen.com` itself), because the apex must also hold other records (SOA, NS). So the apex uses `A`/`AAAA` records pointing at GitHub's fixed IPs, and only `www` uses a CNAME. Some registrars offer `ALIAS`/`ANAME`, a CNAME-like record allowed at the apex; you don't need it here.

**The `CNAME` file in the repo.** Different from the DNS record with the same name. It's a one-line text file at the repo root containing `oliviakoeppen.com`. GitHub's servers receive requests for every Pages site on the same IPs; this file tells GitHub which site should answer for which domain. Setting the custom domain in the repo's Pages settings creates it for you.

**TTL.** "Time to live": how many seconds resolvers may cache a record. Use the registrar's default (often 600 seconds, or "Auto"). Lower TTL means changes show up faster.

**Propagation.** After you save records, resolvers pick them up as old cached answers expire. New domains usually work within minutes; allow up to 24 hours.

**HTTPS.** Once DNS points at GitHub and GitHub sees the `CNAME` file, it requests a Let's Encrypt certificate for `oliviakoeppen.com` and `www.oliviakoeppen.com`. That takes minutes to about an hour, occasionally up to 24 hours. Then you tick **Enforce HTTPS** so `http://` redirects to `https://`.

---

## 2. Exact values

**Apex `A` records** (all four; host/name field is `@` or blank):
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Apex `AAAA` records** (all four, optional but recommended):
```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

**`www` CNAME:**
```
Host: www    Answer/Target: angularpirate.github.io
```
Point it at the **account** host `angularpirate.github.io`, never at `angularpirate.github.io/olivia-portfolio`. DNS has no paths; GitHub works out the repo from the `CNAME` file.

**Domain verification `TXT`:** GitHub generates it in step 5. It looks like:
```
Host: _github-pages-challenge-angularpirate    Value: <random string from GitHub>
```

---

## 3. Step by step

### Step 1. Create the repo (you, 1 minute)
1. https://github.com/new
2. Owner `AngularPirate`, name `olivia-portfolio`, **Public**, check **Add a README file**, then **Create repository**.
3. Make sure the Claude GitHub App can reach it: https://claude.ai/connect-github (install on this repo or on all repos).
4. Tell Claude. Claude pushes the site files: `index.html`, `prototypes/`, `robots.txt`, `.nojekyll`.

`.nojekyll` tells GitHub to serve the files as-is instead of running them through Jekyll, its default site generator.

### Step 2. Turn on Pages (you or Claude, 1 minute)
1. Repo → **Settings** → **Pages**.
2. **Build and deployment** → Source: **Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)`, then **Save**.
4. Wait about 1 minute (watch the **Actions** tab for the "pages build and deployment" run to go green).
5. Check: `https://angularpirate.github.io/olivia-portfolio/` should load the placeholder page.

Don't continue until this URL works. It proves hosting is fine before DNS adds more variables.

### Step 3. Buy the domain (you, 5 minutes)
Recommended registrar: **Porkbun** (porkbun.com). Low prices, clean DNS editor, free WHOIS privacy. Cloudflare Registrar is cheaper at renewal; see the gotcha in section 5 if you use it.

1. Search the name, add to cart, check out.
2. Turn on **auto-renew**. An expired domain can be bought by someone else.
3. Leave **WHOIS privacy** on (it's free) so her home address isn't published.

### Step 4. Delete the registrar's default records (you, 2 minutes)
New domains come with parking records that conflict with GitHub.

1. Porkbun → **Domain Management** → your domain → **DNS**.
2. Delete any default `ALIAS`, `A`, or `CNAME` records for the apex and for `*` (a wildcard). On Porkbun they usually point to `pixie.porkbun.com` or `uixie.porkbun.com`.
3. Leave `NS` records, and any `MX`/`TXT` email records, alone.

Wildcard (`*`) records pointing at GitHub are a security risk: someone could attach their own Pages site to `anything.oliviakoeppen.com`. Never add one.

### Step 5. Verify the domain with GitHub (you, 5 minutes)
This locks the domain to your GitHub account, so no one else can point their Pages site at it.

1. GitHub → your avatar → **Settings** → **Pages** (in the left sidebar, under "Code, planning, and automation").
2. **Add a domain** → enter `oliviakoeppen.com` → **Add domain**.
3. GitHub shows a `TXT` record (host and value). In Porkbun DNS, add it:
   - Type `TXT`, Host `_github-pages-challenge-angularpirate` (Porkbun appends the domain automatically), Answer = the value GitHub shows.
4. Back in GitHub, click **Verify**. If it fails, wait 5–10 minutes and retry.
5. Keep this TXT record permanently.

### Step 6. Add the DNS records (you, 5 minutes)
In Porkbun DNS, add 9 records:

| Type | Host | Answer |
|---|---|---|
| A | *(blank)* | 185.199.108.153 |
| A | *(blank)* | 185.199.109.153 |
| A | *(blank)* | 185.199.110.153 |
| A | *(blank)* | 185.199.111.153 |
| AAAA | *(blank)* | 2606:50c0:8000::153 |
| AAAA | *(blank)* | 2606:50c0:8001::153 |
| AAAA | *(blank)* | 2606:50c0:8002::153 |
| AAAA | *(blank)* | 2606:50c0:8003::153 |
| CNAME | www | angularpirate.github.io |

TTL: leave the default.

### Step 7. Set the custom domain on the repo (you or Claude, 1 minute)
1. Repo → **Settings** → **Pages** → **Custom domain** → `oliviakoeppen.com` → **Save**.
2. This commits a `CNAME` file to `main`. If Claude later pushes, it keeps that file.
3. GitHub runs a DNS check. Wait for **"DNS check successful."** If it says the record can't be retrieved, DNS hasn't propagated yet; wait and refresh.

Use the apex (`oliviakoeppen.com`), not `www`. With both DNS records in place, GitHub automatically redirects `www` → apex.

### Step 8. Turn on HTTPS (you, after a wait)
1. Same page: once the certificate is issued, **Enforce HTTPS** becomes clickable. Tick it.
2. If it stays greyed out after an hour: clear the Custom domain field, save, re-enter `oliviakoeppen.com`, save. That re-triggers certificate issuance. Still stuck after 24 hours: check step 4 for leftover records.

### Step 9. Verify it end to end
From any terminal (or use https://dnschecker.org in a browser):
```
dig +short oliviakoeppen.com A          # expect the four 185.199.x.153 IPs
dig +short oliviakoeppen.com AAAA       # expect the four 2606:50c0:... IPs
dig +short www.oliviakoeppen.com CNAME  # expect angularpirate.github.io.
curl -sI http://oliviakoeppen.com       # expect 301 → https://oliviakoeppen.com/
curl -sI https://www.oliviakoeppen.com  # expect 301 → https://oliviakoeppen.com/
curl -sI https://oliviakoeppen.com      # expect HTTP/2 200
```
Then the human test: a private window on laptop and phone, and an email to yourself with the link, clicked from the email.

---

## 4. Timeline

| Step | Your time | Waiting |
|---|---|---|
| 1–2 Repo + Pages | 5 min | ~1 min |
| 3–4 Buy domain, clear defaults | 7 min | none |
| 5 Verify domain | 5 min | 5–10 min |
| 6–7 DNS + custom domain | 6 min | minutes to a few hours |
| 8 HTTPS | 1 min | minutes to 24 hours |

Plan on doing steps 1–7 in one sitting, then checking HTTPS the next morning. **Do it at least a day before sending the link.**

---

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "There isn't a GitHub Pages site here" (404) | `CNAME` file missing or a different domain, or Pages not enabled | Re-enter the custom domain in Settings → Pages; confirm `CNAME` file exists on `main` |
| "DNS check unsuccessful" / record can't be retrieved | Not propagated yet, or parking records still present | Wait; re-check step 4; confirm with `dig` |
| Browser warns "not secure" / certificate name mismatch | Certificate not issued yet | Wait; then step 8's re-trigger |
| `www` doesn't redirect | `www` CNAME missing or wrong target | CNAME must be `angularpirate.github.io` |
| Site loads without styles | Wrong paths | All links in this site are relative, so this shouldn't happen; tell Claude |
| Old version showing after a push | CDN cache | Wait 1–10 minutes; hard refresh |
| Using Cloudflare DNS and HTTPS won't issue | Cloudflare's proxy (orange cloud) is intercepting | Set every GitHub record to **DNS only** (grey cloud) |

---

## 6. Suggested domains

Checked 2026-09-30 by DNS lookup only (no records found, so very likely unregistered). Confirm on the registrar's search page before buying. Prices are approximate first-year prices; renewals can differ, so check the renewal price before paying.

| # | Domain | Notes | Approx. price/yr |
|---|---|---|---|
| 1 | `oliviakoeppen.com` | **First choice.** Most standard for an academic audience | $10–12 |
| 2 | `oliviakoeppen.net` | Solid fallback | $11–15 |
| 3 | `oliviakoeppen.org` | Reads a little like a nonprofit | $10–13 |
| 4 | `oliviakoeppen.me` | Common for personal sites | $5–20 (promo vs renewal varies) |
| 5 | `oliviakoeppen.co` | Easy to mistype as .com | $10–30 |
| 6 | `oliviakoeppen.page` | HTTPS-only by design | $10–15 |
| 7 | `oliviakoeppen.design` | Fits the field; pricier | $30–50 |
| 8 | `oliviakoeppenid.com` | ".com" with the field built in | $10–12 |
| 9 | `koeppenlearning.com` | Brand-style, no first name | $10–12 |
| 10 | `koeppendesign.com` | Brand-style, no first name | $10–12 |

`koeppen.com` is taken.

**Where to buy:**
- **Porkbun** (porkbun.com): recommended for this guide. Search box on the home page.
- **Cloudflare Registrar** (dash.cloudflare.com → Domain Registration): at-cost pricing, cheapest renewals; needs a Cloudflare account, and see the orange-cloud row above.
- **Namecheap** (namecheap.com): fine, similar pricing.

Avoid registrars that upsell heavily at checkout. Nothing extra is needed: no paid SSL, no hosting plan, no email bundle.
