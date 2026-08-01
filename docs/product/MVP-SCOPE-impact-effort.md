# Katon — MVP Scope (impact/effort, "acceptable state" not over-built)

GOAL: launch ASAP with a product good enough to not embarrass the concept, cheap enough to not
over-invest before validation. Principle: validate the LOOP (does a stranger pay + share?) with the
LEAST content that still feels real. Everything else is post-validation.

## The core scoping insight
- ARCHETYPE is not foldable: a user IS their Day Master. All 10 archetypes must exist at launch.
- STATE is the 5x cost axis AND is foldable: an unwritten state can fall back to that archetype's
  BALANCED reading (Balanced = "no strong imbalance" = least-wrong floor). Fallback is degraded, not broken.
- DOMAIN is the 3x cost axis on the PAID tier only. Free (card+river) is domain-independent.
- => The cheapest real launch: all 10 archetypes, BALANCED state only, ONE paid domain. Then add states/domains by prevalence.

## IMPACT / EFFORT MATRIX

### DO NOW (high impact, bounded effort) — the MVP
1. **Wire the schema (Matahari slice).** Unblocks everything. [in progress]
2. **10 Balanced state-cores** (card + free river) — covers 40% exactly + serves as fallback for the
   other 60%. This is the single highest-leverage content block: 10 readings = nobody gets a 501.
3. **10 Amplified state-cores** — pushes exact-state coverage 40% -> 64%. Amplified is the easiest to
   write (vivid, hooks on the dominant element), so high impact / low effort.
4. **ONE paid domain: Hubungan** for those 20 cores. Safest, most-developed, broadest live-question.
   = 20 free cores + 20 Hubungan paid arcs. (Free cores already include the card.)
5. **Niche launch distribution (cheap half of advisor play 3):** 1-2 niche landing pages (framing only,
   same product) + outreach to a few career/relationship micro-influencers. Marketing, not product.
6. **Pre-launch security checklist** (already written) + the schema wiring.

MVP TOTAL CONTENT: ~20 state-cores + ~20 Hubungan paid readings. NOT 50, NOT 150.
Coverage: 64% get their exact state, 36% get a graceful Balanced fallback, 100% get SOMETHING real.
One domain live; "Karier & Uang — segera" shown as honest coming-soon.

### DO NEXT (post-launch, validation-gated) — only if the loop works
7. Add **Governed + Over-fueled + Depleted** cores by prevalence (-> 90%, 100%). 30 more cores.
8. Add **Karier + Uang** paid domains across written states.
9. Card share-rate instrumentation (new-sessions ÷ completed-readings).

### PHASE 2 (validated demand required) — the advisor plays
10. **Compatibility / two-chart** (advisor play 1) — ONLY after single-card share rate is proven.
11. **Time-layer / "energetic weather"** (advisor play 2) — the renewable tier; REQUIRES careful
    no-prediction guardrails ("this month's energy tends toward X", never "act on the 14th"). Justifies
    the Rp 249k/year SKU. Build only when retention is the proven bottleneck.
12. **Per-niche tailored content** (expensive half of play 3) — bespoke readings per niche.

### DON'T BUILD (until much later / maybe never)
- All 50×3 = 150 full state×domain paid readings. You may never need full depth; deepen only
  archetype-states that prove worth it.
- Rarity/foil/collectible card mechanics (no collection/competition loop; doesn't fit self-discovery).
- Runtime AI generation (kills the moat; see determinism decision).

## EFFORT REALITY CHECK (why MVP is ~20+20, cheaper than it sounds)
- Within a state, the 10 archetypes share STRUCTURE (same beats, same card layout) — only driver+copy
  change. After the first 2-3 per state, it's pattern-fill.
- Free card+river is written ONCE per state-core, reused across all 3 domains. So adding Karier/Uang
  later only costs the beat-3-onward fork, not new cores.
- The driver matrix (50 one-liners) already did the differentiation work — each core starts from a
  proven-distinct driver, no per-reading derivation from scratch.
- Pipeline: Claude scaffold -> helper naturalize -> founder validate. Founder is sole bar (no cold-read
  gating). So throughput is limited by founder review time, not by finding test subjects.

## DECISION (locked)
MVP line = **20-core: Balanced + Amplified × all 10 archetypes, Hubungan domain only.** 64% exact-state,
36% Balanced-fallback, Karier/Uang shown as honest "segera". Email capture for "segera" domains +
launch-notify (see below). 


## DEMAND CAPTURE (locked — cheap, high-ROI, built in the schema-spike pass)
- CAPTURE now (near-zero effort): on the locked Karier/Uang "segera" tiles, a "kabarin aku pas ini buka"
  action. PREFER reusing the WhatsApp number already collected at payment (checkbox at the existing WA
  step: "boleh aku kabarin pas Karier/Uang buka?") over a new email field — WA is the market's channel
  and already in the flow. Writes to a Supabase table (domain_interest: reading_id, wa_number/email,
  domain_wanted, created_at). One table + one field + one insert. Doubles as phase-2 PRIORITIZATION
  data (which domain to build next, ranked by demand).
- BROADCAST later (deferred): the SEND capability (email service / WA Business API, deliverability,
  consent/unsubscribe) is real cost — build only when the next domain is actually ready to announce.
  Capturing demand you cannot yet act on is fine; the rows sit in Supabase until then. Do NOT bundle
  send-infra into the MVP.
- Slot: fast-follow inside the schema-spike (same Supabase session), NOT a launch-blocker.

## THE LAUNCH GATE (what "acceptable" means, concretely)
Ship when: schema wired + 20 cores (Bal+Amp ×10) + 20 Hubungan paid + security checklist passed +
1 niche landing page live + WA demand-capture on locked tiles. That's a product where 100% of users get a real card+reading, 64% get
their sharp state, one domain is purchasable, and the loop (pay + share) can be measured. Everything
past that is bought with validation data, not speculation.
