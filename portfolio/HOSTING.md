# Hosting Olivia's Portfolio

Goal: a clean HTTPS link like `https://oliviakoeppen.com` that opens the portfolio in one click.

## What's free and what isn't

- **HTTPS is free everywhere.** GitHub Pages and Cloudflare Pages both issue and renew certificates automatically. You never buy an SSL certificate.
- **The domain name is the only cost.** About $10–12/year for a `.com`.
- **Fully free option:** a platform subdomain. Cloudflare gives `https://<project>.pages.dev` (for example `oliviakoeppen.pages.dev`). That has no "github" in it, is HTTPS, and costs $0. It's a reasonable fallback if you skip the domain.

## Best practices

1. **Buy the domain at least a day before sending the link.** DNS and certificates can take up to 24 hours.
2. **Use `.com` if it's available.** It reads as the most standard to an academic audience.
3. **Pick one canonical address** (`oliviakoeppen.com`) and redirect `www` to it.
4. **Always HTTPS.** Turn on "Always Use HTTPS" (Cloudflare) or "Enforce HTTPS" (GitHub).
5. **Keep it out of search results until she's ready:** a `noindex` meta tag plus `robots.txt`. Both are already in the site files.
6. **Nothing private in a public repo:** no phone number, no Boise State course content, no student information.
7. **Turn on auto-renew** for the domain. A lapsed domain can be bought by someone else.
8. **Test before sending:** a private browser window on laptop and phone, then email the link to yourself and click it from the email.

## Recommended setup: Cloudflare (domain + hosting in one place)

Why: domain at cost with no markup, DNS set up automatically, free HTTPS, works with public or private repos, and every branch gets its own preview link (handy for comparing prototype versions).

Note: Cloudflare now groups this under **Workers & Pages** in the dashboard. Labels below may differ slightly.

### Step 1. Create the GitHub repo (you, ~1 minute)
1. Go to https://github.com/new
2. Owner: `AngularPirate`. Name: `olivia-portfolio`. Visibility: **Public**.
3. Check **Add a README file**. Click **Create repository**.
4. Give Claude access: https://claude.ai/connect-github → make sure the Claude GitHub App is installed on `olivia-portfolio` (or on all repositories).
5. Tell Claude it's done. Claude attaches the repo and pushes the site files.

### Step 2. Create a Cloudflare account (~3 minutes)
1. Sign up at https://dash.cloudflare.com/sign-up (free plan).

### Step 3. Buy the domain (~5 minutes, ~$10–12/year)
1. Dashboard → **Domain Registration** → **Register Domains**.
2. Search `oliviakoeppen.com`. If taken, try `oliviakoeppen.net` or `koeppen.design`.
3. Buy it. Turn on **auto-renew**. Cloudflare sets up DNS automatically.

### Step 4. Connect the repo to Cloudflare (~5 minutes)
1. Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** (or **Import a repository**).
2. Authorize GitHub and pick `AngularPirate/olivia-portfolio`.
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/` (or leave empty)
   - Production branch: `main`
4. Project name: `oliviakoeppen` → free URL `https://oliviakoeppen.pages.dev`.
5. **Save and Deploy.** Live in about a minute.

### Step 5. Attach the domain (~2 minutes, then wait)
1. In the project → **Custom domains** → **Set up a custom domain** → `oliviakoeppen.com` → Activate. Cloudflare adds the DNS record for you.
2. Repeat for `www.oliviakoeppen.com`, then add a redirect from `www` to the bare domain: **Rules** → **Redirect Rules** → "Redirect from WWW to root" template.
3. SSL/TLS → Edge Certificates → turn on **Always Use HTTPS**.
4. Wait for the domain to show **Active** (minutes to a few hours).

### Step 6. Test and send
1. Open `https://oliviakoeppen.com` in a private window on laptop and phone.
2. Email the link to yourself and click it from the email.
3. Send it.

After this, every push to `main` updates the live site in about a minute. Other branches get preview links like `https://<branch>.oliviakoeppen.pages.dev`.

## Alternative: GitHub Pages + any registrar

Use this if you'd rather not have a Cloudflare account. Needs a **public** repo on the free plan.

1. Create the repo (Step 1 above).
2. Repo → **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save. Live at `https://angularpirate.github.io/olivia-portfolio/`.
3. Buy the domain at any registrar (Cloudflare, Porkbun, Namecheap).
4. At the registrar, add DNS records:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `angularpirate.github.io`
5. Repo → Settings → Pages → **Custom domain** → `oliviakoeppen.com` → Save. (This adds a `CNAME` file to the repo.) Check **Enforce HTTPS** once it's available (up to 24 hours).
6. GitHub → your profile **Settings** → **Pages** → **Add a domain** → verify `oliviakoeppen.com`, which prevents anyone else from claiming it.

With a custom domain, `angularpirate.github.io/...` redirects to `oliviakoeppen.com`, so "github" and "angularpirate" never appear in the link.

## Comparison

| | Cloudflare Pages | GitHub Pages |
|---|---|---|
| Cost (hosting + HTTPS) | Free | Free |
| Free URL without "github" | Yes (`*.pages.dev`) | No |
| Private repo on free plan | Yes | No |
| Preview link per branch | Yes | No |
| Domain + DNS in one place | Yes | No (separate registrar) |
| Accounts needed | GitHub + Cloudflare | GitHub only |
