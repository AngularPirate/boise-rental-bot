# Skills map: what Jared can rebuild in public

Goal: write down the technical and product skills behind his real work, then apply them to a **new, unrelated use case** he can build openly on GitHub. Nothing below references his employer's prompts, code, data, or configuration.

## 1. Skills inventory

| # | Skill | What it means in practice | Evidence (private work, described generically) |
|---|---|---|---|
| 1 | Streaming speech-to-text | Turn live audio into a running transcript (e.g. Deepgram-style STT) | Real-time call transcription feeding AI features |
| 2 | Chunking and windowing | Decide how often and how much transcript to send to a model; different cadences per task | Different intervals for action items vs. content recommendations over 30–45 min calls |
| 3 | Structured extraction | Prompts that return reliable JSON (commitments, owners, due dates) rendered in a UI | Commitments pipeline shown live in product |
| 4 | Retrieval-augmented generation (RAG) | Embed a content library into a vector database, retrieve and rank relevant items per chunk | Content recommendations from a vectorized library (Pinecone-style) |
| 5 | Parallel pipelines | Run multiple prompts on the same stream at different cadences without blocking each other | Action items and recommendations running side by side |
| 6 | Production prompt engineering | Iterate on prompts against real outputs, without regressions | Prompt tweaks shipped to a high-volume production pipeline |
| 7 | Model evaluation and selection | Compare models (incl. open-source Llama via Groq / DeepInfra) on quality, latency, cost; plan fallbacks | Model selection when an incumbent model was decommissioned |
| 8 | Cost and latency at scale | Reason about per-call cost and response time at high volume | Pipeline at very high daily call volume *(exact figure: confirm before publishing)* |
| 9 | Output quality analysis and quality gates | Review large samples of AI output, define a quality bar, stage rollouts behind it | 54,000+ AI outputs analyzed; staged rollout recommendation |
| 10 | Summarization | Turn long sessions into useful recaps | AI recap capability sizing |
| 11 | Data modeling and SQL | Model the data behind the feature; validate with real queries | Unified progress model; direct PostgreSQL validation |
| 12 | Interface design and prototyping | Design the UI and prototype it on realistic data | Team designer; design system; prototypes on real data |
| 13 | Shipping code | Open PRs under engineering standards | PRs reviewed and merged by engineering |
| 14 | Agent and skill authoring | Build reusable AI workflows (skills, agents, MCP) | 35+ custom skills/agents for the product team |
| 15 | Discovery and research | Turn interviews into evidence for roadmap decisions | Research program and shared repository |

## 2. New use cases that exercise all 15 skills

### A. Customer Call Copilot (recommended)
Live **customer support or customer success calls**.
- Streaming transcript (1, 2) → **follow-up commitments** extracted live ("I'll refund the order by Friday") (3) → **help-center answers** suggested via RAG over a public or self-written knowledge base (4), both running in parallel at different cadences (5).
- After the call: a summary (10) and a **drafted follow-up email** that must pass a **quality gate** before it can auto-send (9). This is where the earlier "Gatekeeper" idea fits.
- Model bake-off across Llama via Groq/DeepInfra and a closed model, with quality, latency, and cost per 1,000 calls (6, 7, 8).
- Data model for calls, commitments, and follow-ups with SQL views (11); designed UI and replay demo (12); built in public via PRs (13); packaged as reusable Claude skills/agents (14); a short "user research" write-up with 3–5 support or CS people (15).
- **Why it's the pick:** relevant to almost every B2B SaaS company (support, success, sales), and a direct fit for messaging and lifecycle companies like Customer.io (the follow-up email and its quality gate).

### B. Sales Discovery Call Assistant
Same architecture on **sales discovery calls**: extract pain points, objections, and next steps; RAG over case studies and product docs to suggest proof points; draft the follow-up. Strong for sales-tech and CRM roles. Slightly narrower audience than A.

### C. Lecture and Office-Hours Assistant
Live **class or lecture** transcription: key concepts and student action items; RAG over course materials to recommend readings. Strong for edtech roles; weaker for general B2B SaaS.

### D. Podcast Episode Intelligence
Run the pipeline on **public podcast audio** (real data, no synthetic calls needed): extract claims and recommendations, RAG over related episodes and articles. Easiest to demo with real data, but less "product" and no follow-up action to gate.

## 3. Recommendation
Build **A, Customer Call Copilot**, as the flagship public project. It uses all 15 skills, relates to the widest range of AI PM roles, and its quality-gated follow-up email maps directly to Customer.io-style lifecycle messaging. Keep B–D as "the same engine, different use case" variants. Swapping the knowledge base and prompts to show B or D is a cheap second artifact that proves the system generalizes.

## 4. NDA guardrails for the build
- Write all prompts, code, and data models from scratch; never copy production prompts or configuration.
- Use synthetic or public calls only (e.g. scripted calls you record yourself, or TTS-generated audio).
- Describe the architecture as an industry pattern, not as "how my company does it."
- Confirm before publicly citing employer-specific facts (daily call volume, vendors used, exact intervals).
