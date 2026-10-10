# Portfolio Brief: Jared Brodd, AI Product Manager

Source of truth for facts: `resume.md` (a rough draft, so use it for facts only, not for wording or framing). Bracketed items are unknowns (section 8). **Never publish his phone number.**

---

## 1. Positioning

Three different angles. Each uses the same résumé facts but makes a different claim about who Jared is.

### Option A: The AI trust PM
- **One-liner:** *I decide when AI is good enough to put in front of customers, and then I ship it.*
- **2–3 sentences:** Getting a model to produce something is easy now. The hard part is knowing whether it's good enough for real users, what happens when it isn't, and how to roll it out without losing their trust. That's the part of AI product work I own: I've read through tens of thousands of model outputs before a launch, replaced a production model on a deadline, and shipped an assistant people spend half an hour in.
- **Lands best with:** companies putting AI in front of *their customers' customers*, where a bad output costs money or trust: messaging, support, fintech, health, HR. Customer.io fits closely: its 2026 AI agent drafts emails and builds automations behind approval flows.
- **Evidence:** reviewed 54,000+ AI outputs across 3,400+ clients and recommended a staged rollout behind a quality gate rather than a full launch; led model and vendor selection plus a fallback plan when the production model was decommissioned; AI coaching assistant at 100–120 DAU, peak 223, 20–30+ min sessions; at Vessel, defined KPIs and launch instrumentation for an AI recommendation engine.
- **Risk:** It's narrower, and it rests on two or three decisions. It can read as cautious ("the PM who says no"). To offset that, pair it with the shipped assistant and a public eval project (section 7), and frame the gate as *how to ship faster safely*, not as a brake.

### Option B: The PM who closes the loop himself
- **One-liner:** *I take a product idea from sketch to merged PR without waiting on a hand-off.*
- **2–3 sentences:** On my team I'm also the designer, I write the data model, I check specs against production with SQL, and I open pull requests that engineers review and ship. That means fewer meetings where everyone guesses. Feasibility conversations start from real data and a working prototype.
- **Lands best with:** startups and small teams, eng-led orgs, founding-PM or "PM who can prototype" roles, AI-tool companies whose users are builders.
- **Evidence:** serves as the team's designer and maintains the production design system; builds prototypes against real data; queries production PostgreSQL to size and audit; opens PRs under the engineering team's standards; unified progress model spec that reconciled four data sources and locked 12 decisions before build.
- **Risk:** Hiring managers at larger companies may read it as "wants to be an engineer or designer" or "won't scale." It also doesn't say *AI* until the second sentence, so it's a weaker fit for an AI PM title. Strong supporting evidence, weak headline.

### Option C: The AI-native operator
- **One-liner:** *I rebuild how a product team works with AI, then hand it off so it runs without me.*
- **2–3 sentences:** I turned my own product workflow, from discovery to release notes, into 35+ skills and agents, then wrote it down well enough that a second PM runs it on their own. I do the same with research: standardized interviews and a shared, queryable repository instead of notes in one person's head. I'm interested in AI that changes how teams work, not just what they ship.
- **Lands best with:** Heads of Product building a team, product ops, internal AI and developer-productivity platforms, companies selling agents to teams.
- **Evidence:** 35+ custom skills/agents across discovery, spec, QA planning, release comms and reporting; onboarding package a teammate runs independently; standardized interview prep and scoring so a second PM matches quality; research repository the product org uses for roadmap decisions; ran an AI prototyping workshop for Boise's product meetup.
- **Risk:** It sounds like product ops, not product outcomes, and its key metric (cycle-time change) is still missing. "I use Claude Code a lot" is becoming common, so without numbers it's easy to discount.

### Recommendation: lead with A, prove it with B, show C in "How I work"
For AI PM roles, the skill hiring managers worry about most is judgment: when to ship a model, when to hold it back, how to measure it, and what to do when it breaks. Most AI PM candidates can say they shipped a feature. Fewer can say they read 54,000 outputs and argued for a staged rollout. That's Jared's most uncommon fact, and it's what Customer.io needs as its agent starts writing customer-facing messages. B is the supporting evidence: he can *execute* the judgment himself (prototype, SQL, PR), which keeps A from sounding cautious. C is the best "how I work" story and the best GitHub material, but it isn't the headline.

**Recommended hero copy:**
> **I decide when AI is good enough to put in front of customers, and then I ship it.**
> I own the AI roadmap for a coaching platform with 3,600+ active clients. I've reviewed tens of thousands of model outputs before launch, replaced a production model on a deadline, and shipped an assistant people work in for half an hour at a time. I design it, check it against production data, and open the PR myself.

The tailoring config (section 3) can switch the headline to B or C for jobs where those fit better.

---

## 2. Audience and what they scan for

AI PM hiring managers (Director/VP/Group PM), recruiters skimming dozens of links, sometimes an eng lead. In under 60 seconds they need:
1. **A shipped AI feature with real usage** (100–120 DAU, peak 223, 20–30+ min sessions).
2. **AI judgment** (quality gate, staged rollout, model migration). Lead with it.
3. **Technical range they can verify** (public GitHub, SQL, PRs).
4. **Business results** (0→1: $350K revenue, $150K ARR, 6 enterprise clients, 100% retention).
5. **Fit for this job** (headline and first case study match the posting).

Recruiters read the hero and the first card. Hiring managers open one case study and skim the headings.

---

## 3. Site structure

Static HTML/CSS/JS on GitHub Pages. Home page plus case-study pages.

**Home (in order)**
1. **Hero:** name, headline, one "currently" line, buttons: Case studies, Résumé PDF, GitHub, Email.
2. **Proof strip:** `3,600+ active clients` · `223 peak daily users of AI assistant` · `54,000+ AI outputs reviewed` · `$150K ARR, 100% retention (0→1)`.
3. **Featured case studies:** 3 cards (order set by config). Title, hook, 2–3 tags.
4. **How I work:** interactive agent-pipeline diagram (section 6, #1).
5. **Side projects:** public repo cards with "last shipped" dates.
6. **Skills:** résumé groups, reordered by config.
7. **About + contact:** short and human (Boise, backcountry, meetup workshop). Email, LinkedIn, GitHub. No phone.

**Case-study template:** Hook → Context → Problem → My role → Decisions (each with the trade-off) → Outcome → Artifact (redrawn/synthetic) → What I'd do next → confidentiality footnote.

**Tailoring mechanism:** one `profiles.json`, selected by `?for=<key>`, fallback `default`.
```json
"customerio": {
  "angle": "A",
  "headline": "I decide when AI is good enough to put in front of customers, and then I ship it.",
  "featured": ["quality-gate", "ai-assistant", "pm-os"],
  "skillsOrder": ["AI Product", "Data & Analytics", "Engineering Collaboration"],
  "whyNote": "Why Customer.io: …"
}
```
JS swaps headline/subhead, case-study order, skills order, and shows an optional "Why {Company}" card. Unknown keys fall back silently. Variants carry a canonical tag to the default page. No target-company logos. Adding a target means copying one block.

---

## 4. Case studies

**A. The quality gate: deciding not to fully launch** *(lead for angle A)*
- **Hook:** I reviewed 54,000+ AI outputs and recommended a staged rollout instead of a launch.
- **Problem:** Is a new AI recap capability good enough across 3,400+ real clients?
- **Decisions:** sized it from real production outputs, not a demo; defined an explicit quality gate; chose staged rollout over full launch.
- **Outcome:** recommendation only, unless Jared confirms what happened.
- **Artifact:** redrawn flow (outputs → sample → rubric → gate → staged cohorts) plus the gate simulator (section 6, #2).
- **NDA:** no real outputs, prompts, rubric text, or client data.

**B. Model retired: picking a replacement under a deadline**
- **Hook:** The model behind our production summaries was going away. I led the replacement.
- **Decisions:** vendor/model selection; fallback strategy with engineering. (Need his criteria.)
- **Artifact:** redrawn decision matrix with "Model A/B/C," and a fallback sequence diagram.
- **NDA:** no vendor names or pricing unless cleared. Can merge with A as "AI platform judgment."

**C. An AI coaching assistant people stay in**
- **Hook:** 20–30+ minute sessions, 100–120 daily users, peak 223.
- **Problem:** accountability is the product thesis, so the assistant has to help people do real work.
- **Decisions:** owns the AI and coaching-intelligence track; scoped natural-language and voice logging next. (Need 2–3 specific decisions.)
- **Outcome:** the usage numbers above; `[METRIC: % of eligible base]`.
- **Artifact:** synthetic "concept recreation" in the portfolio's own style, not the product's UI.
- **NDA:** no screenshots, conversations, or prompts.

**D. One progress model from four data sources** *(strong for angle B)*
- **Hook:** I wrote the spec that reconciled four production sources into one view and closed 12 contested decisions before the build.
- **Decisions:** pacing logic, eight-segment taxonomy, edge cases; validated math against real clients before dev kickoff.
- **Artifact:** redrawn data-flow diagram plus a decision-log of decision *types*.
- **NDA:** no schema, table names, or segment names.

**E. 35+ skills and agents: an AI-native PM operating system** *(angle C)*
- **Hook:** I turned my workflow into 35+ skills and agents, and a teammate now runs them without me.
- **Outcome:** second team member runs it independently; `[METRIC: cycle-time/throughput]`.
- **Artifact:** pipeline diagram plus the public `pm-os-starter` repo (rewritten from scratch).
- **NDA:** don't copy internal files.

**Also mention (card, not full study):** Vessel 0→1 ($350K revenue, $150K ARR, 6 enterprise clients, 100% retention), AI recommendation engine, onboarding time cut 50%.

---

## 5. NDA-safe sharing rules

**Recommendation: name the company** in the role line (it's already public on LinkedIn). Inside case studies, say "a B2B coaching platform," with no logo, brand colors, or product UI. Recruiters get verifiable context and the employer's assets stay out. If his agreement or manager says no, switch to "B2B coaching platform (current employer)." Nothing else changes.

1. **Name:** employer, title, dates, industry, team shape, his role.
2. **Describe:** problem, decisions, trade-offs, process, what he'd change. Reasoning matters more than pixels.
3. **Anonymize:** vendors/models, internal tools, segments, partners, clients, coaches.
4. **Numbers:** only résumé figures. For anything new, use relative change ("about half"), ranges ("100–120"), or rounded floors ("3,600+"). No current-employer revenue, pricing, or cost unless cleared. Don't confuse percentage points with percent change.
5. **Visuals:** redraw everything in the portfolio's style. Use obviously synthetic data, labeled "Recreated with synthetic data."
6. **Never show:** screenshots, dashboards, Figma files, customer data or conversations, prompts, schema, unreleased roadmap, company code, internal docs, Slack, Jira.
7. **No password-gated pages.** If it needs a password, keep it for the interview.
8. **Footnote each case study:** "Details are generalized and visuals recreated to respect confidentiality."

**Check with your employer.** Reread the confidentiality section of your employment agreement and anything you signed at Vessel. Then send your manager the drafts: "I'm updating my professional portfolio. These describe my role and decisions in general terms, with no screenshots or internal data, and only use figures already on my public LinkedIn. Anything you'd want changed?" A written okay protects you and the relationship. Cut anything they object to. This isn't legal advice.

---

## 6. Interactive ideas (ranked by impact vs. effort)

| # | Idea | Impact | Effort |
|---|------|--------|--------|
| 1 | **"How I work" pipeline:** clickable SVG (Discover → Spec → Prototype → Validate in SQL → PR → QA → Release → Report). Each node shows the skill/agent, inputs/outputs, and where a human checks. | High | Low–Med |
| 2 | **Quality-gate simulator:** ~200 synthetic outputs with scores. Drag a threshold to see pass rate, held-back cohort, and example pass/fail. Directly supports angle A. | High | Med |
| 3 | **"Viewing as" toggle** tied to `profiles.json` (General / AI platform / Lifecycle). Keep it subtle. | Med | Low |
| 4 | **Skills catalog:** filterable grid of *public* skills linking to GitHub. | Med | Low |
| 5 | **Decision log** (case D): question → options → decision → why. | Med | Low |
| 6 | **Synthetic coaching-session prototype** (case C). Do last because it could look too much like the real product. | Med | High |

**Avoid:** "chat with my résumé" bots (common, and they can get facts wrong), terminal UIs, particle backgrounds, autoplay, fake live counters.

---

## 7. Side-project roadmap

**Ship cadence:** one public artifact every 2 weeks (release + short write-up + portfolio card + LinkedIn post). Commit weekly.

### Week 1: "Gatekeeper", a quality gate for AI-drafted lifecycle messages
- **What:** Synthetic customer events for a fake SaaS trial-to-paid journey. An LLM drafts lifecycle messages (onboarding nudge, win-back). A rubric scores each one on brand voice, grounding in the customer's data, personalization, compliance, and tone, then routes it to auto-send, human review, or block, with a staged-rollout view by segment. The GitHub Pages demo runs on precomputed outputs, so there's no backend or key. The repo has the script to regenerate the outputs.
- **Why Customer.io would care:** their 2026 agent drafts emails and builds automations behind approval flows, and LLM Actions put models inside workflows. Their hard question is when AI-written messages can go out without a human. Jared has already made that call at work. This project shows the same judgment in their domain, in public code. It is angle A made concrete.
- **Write-up:** "Where I'd put the human in the loop for AI-written lifecycle messages, and how I'd measure it."

### Follow-ons (~3 months)
1. **`pm-os-starter`** (wk 2–4): 5–8 public Claude Code skills (PRD from interview notes, QA plan from spec, release notes, SQL sanity check) plus an onboarding README. *Shows:* angle C. *Write-up:* "Turning a PM workflow into files a teammate can run."
2. **Lifecycle analytics MCP server** (wk 4–6): read-only, permission-scoped tools over a synthetic DuckDB event store ("who stalled in onboarding this week?"). *Shows:* agent tool design, guardrails, SQL. *Write-up:* "Designing tools an agent can't misuse."
3. **Summarization eval harness** (wk 6–8): compare models on synthetic notes, with cost, latency, and quality, plus a fallback policy. *Shows:* case B in public. *Write-up:* "How I'd pick a model when the current one is retired."
4. **Natural-language/voice logging prototype** (wk 8–10): "ran 3 miles, skipped stretching" → structured log with confidence and a confirm step. *Shows:* UX for AI uncertainty. *Write-up:* "Designing confirmation for AI-parsed input."
5. **The portfolio repo itself** (ongoing): public source, `profiles.json`, changelog.

---

## 8. Open questions for Jared

- **Positioning:** does angle A feel true to him? Which angle does he *want* to be hired for?
- **Bracketed facts:** current [TITLE], [COMPANY], [LOCATION], [START DATE]; Vessel [END DATE].
- **Metrics (supply or drop):** adoption/engagement/retention lift; assistant DAU as % of eligible base; PRs shipped; cycle-time/throughput change from the skills/agents.
- **Confirm:** did the AI recap roll out staged, and with what result? Was the model migration completed? 2–3 specific assistant design decisions? Can he name vendors/models? Are the 35+ skills his IP or the company's?
- **Decide:** name the employer (recommended: yes, after checking); GitHub username and domain; first 3 `profiles.json` targets; comfort with an "open to roles" signal his employer may see.

---

## 9. Notes for the design agent

- **Produce 3 distinct design directions** (e.g. editorial/typographic; technical-diagrammatic; warm/human with light Idaho texture). Each shows the hero, proof strip, a case-study card, and the pipeline diagram.
- **Tone:** confident, plain, first person, short sentences. Avoid words like "passionate," "leverage," and "AI-powered."
- **Must-haves:** WCAG 2.2 AA (contrast, visible focus, full keyboard access, `prefers-reduced-motion`, text equivalents for diagrams). Fast: no required framework, small JS, at most one web font. Works at 360px. Static, relative paths, GitHub Pages ready. Light and dark mode. Case studies print cleanly.
- **Must not:** phone number; employer logo, colors, or UI; real screenshots; invented metrics; stock laptop photos; AI portraits; chatbots; carousels.
- **Unknown metrics render nothing,** not "XX%". Label synthetic visuals.

---

### What I could and couldn't verify
- **Couldn't** open the Customer.io posting (job 8259617). Greenhouse was unreachable from this environment and the ID wasn't indexed. Confirm the title, team, and requirements before tailoring.
- **Verified via search summaries:** Customer.io is a remote, AI-forward customer engagement platform (founded 2012). In April 2026 it launched an in-product AI agent (automations, email drafting, Routines, memory, business-context hub, permission-scoped actions with approval flows) plus LLM Actions. Its current PM roles list remote US pay of about $137K–$187K (PM) and $166K–$224K (Senior PM) and ask for AI tooling experience.

### Sources
NDA research: https://uxdesign.cc/how-to-add-an-nda-project-to-your-portfolio-d2932684be01 · https://uxplanet.org/nda-how-to-show-confidential-work-in-your-portfolio-ea165058bb96 · https://maven.com/p/52e683/3-ways-to-handle-nda-projects-in-your-ux-portfolio · https://www.teamblind.com/post/how-to-best-showcase-nda-design-work-onjful3q · https://uxdesign.cc/show-not-tell-how-to-make-use-of-restricted-or-scrapped-design-work-0df64dd28ea8 · https://uxplanet.org/your-work-their-data-navigating-gdpr-and-nda-in-design-portfolios-40a21ea0b64d · https://www.ideaplan.io/qa/what-makes-a-good-pm-portfolio · https://gopractice.io/data/percentages-in-product-management/

Customer.io: https://docs.customer.io/release-notes/2026-04-08-agent-rebrand/ · https://customer.io/learn/lifecycle-marketing/this-changes-everything-replay · https://www.builtincolorado.com/job/product-manager/10672263 · https://www.builtinchicago.org/job/senior-product-manager/10487546 · https://wellfound.com/company/customer-io
