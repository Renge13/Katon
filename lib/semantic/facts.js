// ============================================================
// Stage 3, PHASE 1 — fact inventory. No scoring.
// ============================================================
// Emits every fact a chart supports, unranked, in a stable order. Phase 2 scores
// them; Phase 3 wraps them in the JSON contract. Nothing here decides importance,
// and nothing here writes a user-facing string.
//
// THE TARGET IS docs/content/provecell-01-USER.json — hand-authored for fixture
// chart 1 and the only shape validated against a real renderer.
//
// ── WHY provenance IS STRUCTURED AND NOT PROSE ─────────────
// The target file carries provenance as finished Indonesian sentences ("Cabang
// bulanmu adalah Ayam. Dihitung dari pilar harimu, Ayam justru jatuh di posisi
// kosong."). Those sentences exist nowhere in glossary.json, so producing them
// means Stage 3 authoring new user-facing copy — which D2 forbids ("do not
// generate any prose, every user-facing string comes from the glossary") and
// which Reyner alone can approve on register.
//
// Phase 1 therefore emits provenance as DATA: which positions, which branches,
// which elements, which palace. The sentence layer is a separate decision that
// belongs in Phase 3, flagged for register review, not smuggled in here. The data
// is strictly richer than the sentence, so nothing is lost by deferring.
//
// ── WHAT PHASE 1 DOES NOT DO ───────────────────────────────
// No importance, no ranking, no quiet_chart, no required_points, no cache key.
// gift/cost are the glossary SEEDS passed through unconditioned; see contentFrom.
// ============================================================

import { STEM_ELEMENTS, HIDDEN_STEMS } from '../bazi/stems.js';
import { tenGod } from '../bazi/tenGods.js';
import { mainProfile } from '../bazi/mainProfile.js';
import { computeBadges } from '../bazi/badges.js';
import { branchRelations } from '../bazi/relations.js';
import {
  computeStrength, seasonMultiplier, ELEMENTS, STRENGTH_PARAMS,
} from '../bazi/strength.ts';
import {
  GLOSSARY, ELEMENT_HANZI, contentFrom, elementId, palaceName, palacePhrase,
  palaceDomain, palaceDomainByName,
} from './glossary.js';

/**
 * Firing gates. NOT scoring weights — these decide whether a fact exists at all,
 * which is a Phase 1 question. Phase 2's HIERARCHY_PARAMS decides what a fact is
 * worth once it does. Kept separate on purpose: collapsing the two would let a
 * scoring tweak silently delete a finding.
 */
export const FACT_GATES = {
  /**
   * An element must hold at least this share of the chart to count as dominant.
   * D2 phase 2 calls "above ~35%" high and "15 to 25%" furniture; 35 is the low
   * edge of that, so the gate admits exactly what the scoring layer would then
   * rate as high. PROVISIONAL — it has not been fitted against anything, and the
   * first real measurement should be the fixture-wide fire rate, not a chart.
   */
  elementDominantPct: 35,

  /** An Aspek must appear in at least this many distinct positions to converge. */
  aspekConvergencePositions: 2,

  /** A void branch must carry at least this many notable things to be a stack. */
  voidStackNotables: 2,
};

/**
 * IS THIS KIND OF FACT SOMETHING THE READER CAN ACT ON?
 *
 * ── THE RULE, RATIFIED BY REYNER 2026-08-11 ────────────────
 *   A kind is actionable if it names a CONDITION THE READER CAN RESPOND TO,
 *   not a DISPOSITION SHE IS.
 *
 * ── WHY THIS IS DECLARED AND NOT INFERRED ──────────────────
 * The hierarchy's actionability axis used to read `fact.actionable`, which is
 * the PROSE from glossary.actionable_seed. So a fact counted as actionable if
 * and only if someone had written its sentence yet, and authoring content
 * re-ranked charts: the tranche-1 pass moved fact order on 11 of 13 charts for
 * reasons that had nothing to do with the charts.
 *
 * Rule 14 says the engine owns order, so order must be a function of the CHART.
 * The prose still renders and still appears in `must_cover`; it simply stops
 * being a ranking input. Writing an actionable no longer changes rank.
 *
 * ── WHY NOT DECLARE NEARLY EVERYTHING TRUE ─────────────────
 * Because that recreates the degeneracy this replaces. A binary bonus awarded to
 * every kind ranks nothing, which is exactly what the inferred version was
 * heading for as the content pass approached full coverage - the difference
 * being that it would then be permanent instead of transitional. 7 true and 5
 * false discriminates, and the line above is what decides which is which.
 *
 * Keyed on `provenance.kind`, the domain the fact came from. That is why the
 * table cannot reproduce the values the prose implied: five `aspek` cells gained
 * an actionable_seed in tranche 1 and sit under kinds declared false here. Their
 * prose still ships. It just no longer buys them rank.
 */
export const ACTIONABLE_KINDS = {
  // FALSE — a disposition. There is no move; this is who she is.
  day_stem: false,              // she IS Fire; the reading opens on it
  month_branch_rooting: false,  // the main profile: how she operates, not a lever
  coherence_rule: false,        // CR-1 supersedes the main profile and inherits its standing
  aspek_convergence: false,     // the same disposition, amplified across pillars
  day_branch_seat: false,       // the Fondasi Pasangan is a PLACE in the chart, not the reader

  // TRUE — a condition she can respond to.
  strength: true,               // a resource state to manage: where she thrives, where she drains
  element_absent: true,         // a gap to compensate for deliberately
  element_dominant: true,       // the same shape, the other direction: an excess to channel
  badge_anchor: true,           // something she HAS and can deploy
  branch_relation: true,        // a recurring dynamic to respond to
  punishment: true,             // 刑, the only self-authored friction in the system
  void_stack: true,             // a named condition with a named counter-move
};

/** Pillar positions present in a chart, in reading order. */
function positionsOf(chart) {
  const out = [['year', chart.year], ['month', chart.month], ['day', chart.day]];
  if (chart.hour) out.push(['hour', chart.hour]);
  return out;
}

/** Element presence as percent of the chart's total weight. Display quantity. */
export function elementPresence(chart) {
  const balance = chart.elementBalance;
  const total = Object.values(balance).reduce((a, b) => a + b, 0);
  const out = {};
  for (const [element, value] of Object.entries(balance)) {
    out[element] = total === 0 ? 0 : Math.round((value / total) * 1000) / 10;
  }
  return out;
}

/**
 * Every Ten God occurrence in the chart, with where it came from.
 *
 * THE DAY STEM IS EXCLUDED. It is the self, not a relation to the self, and
 * counting it inflates 比肩 by one on every chart ever computed. The target file
 * agrees: it reads chart 1's 比肩 as "dua cabang Ular", the two hidden 丙, not
 * three.
 */
export function aspekOccurrences(chart) {
  const dm = chart.day.stem;
  const out = [];
  for (const [position, pillar] of positionsOf(chart)) {
    if (position !== 'day') {
      out.push({
        position, source: 'stem', stem: pillar.stem, weight: 1.0,
        god: tenGod(dm, pillar.stem).hanzi,
      });
    }
    for (const { stem, weight } of HIDDEN_STEMS[pillar.branch] ?? []) {
      out.push({
        position, source: 'branch', branch: pillar.branch, stem, weight,
        god: tenGod(dm, stem).hanzi,
      });
    }
  }
  return out;
}

/**
 * A fact, with the glossary content merged in and the gap made visible.
 *
 * ── THE PALACE DOMAIN RIDES WITH THE PALACE ────────────────
 * Added 2026-08-12. QA finding 5 is that a palace name alone reads as an internal
 * variable, and the fix Reyner ruled is to WEAVE the life-domain gloss into the
 * first palace mention in prose. The renderer cannot weave what it cannot see, so
 * every fact that names a palace now carries that palace's domain beside it.
 *
 * Derived here rather than at each call site, so a fact cannot acquire a palace
 * without its domain: the two are one piece of provenance, not two fields to
 * remember. A multi-palace fact gets a MAP keyed by palace name, never a parallel
 * array - see the relation fact below for the mis-zip that would otherwise be
 * available to the renderer.
 *
 * IT IS DELIBERATELY NOT IN `must_cover`. That list is built from what a fact
 * carries (lib/semantic/index.js#requiredPoints), and adding the domain there would
 * demand the gloss on EVERY palace mention - the opposite of the ruling, which is
 * first mention only, once. Coverage stays a contract about the fact's own strings.
 */
function fact({ id, type, provenance, entry, palace = null, palaces = null, extra = {} }) {
  const content = contentFrom(entry);
  const domain = palace ? palaceDomainByName(palace) : null;
  const domains = palaces && palaces.length > 1
    ? Object.fromEntries(palaces
      .map((name) => [name, palaceDomainByName(name)])
      .filter(([name, value]) => name && value))
    : null;
  return {
    id,
    type,
    provenance,
    ...content,
    ...(palace ? { palace } : {}),
    ...(domain ? { palace_domain: domain } : {}),
    ...(palaces && palaces.length > 1 ? { palaces } : {}),
    ...(domains && Object.keys(domains).length ? { palace_domains: domains } : {}),
    // Machine-visible, so a missing glossary entry shows up in a test rather than
    // only in a report. Every true here is content Reyner still has to write.
    ...(entry ? {} : { glossary_gap: true }),
    ...extra,
  };
}

/**
 * The unranked fact inventory for a chart.
 *
 * @param {Object} chart output of calculateBaziChart
 * @param {Object} [strength] output of computeStrength; recomputed when omitted
 * @returns {Object[]} facts in a stable emission order
 */
export function buildFactInventory(chart, strength = computeStrength(chart)) {
  const facts = [];
  const dm = chart.day.stem;
  const dmElement = STEM_ELEMENTS[dm];
  const presence = elementPresence(chart);
  const profile = mainProfile(chart, { silent: true });

  // ── 1. Day Master. Always present, the spine of the whole reading. ──
  facts.push(fact({
    id: `day_master_${dmElement}`,
    type: 'core',
    provenance: { kind: 'day_stem', position: 'day', stem: dm, element: elementId(dmElement) },
    entry: GLOSSARY.elemen[ELEMENT_HANZI[dmElement]],
    extra: {
      archetype: {
        name_id: GLOSSARY.arketipe[dm]?.name_id ?? null,
        name_en: GLOSSARY.arketipe[dm]?.name_en ?? null,
      },
      // The verbatim sharecard line for this Day Master. A SEED in the reading,
      // used unchanged on the card. Carried here so the two surfaces read one
      // source; see glossary salah_dikira._note.
      salah_dikira: GLOSSARY.salah_dikira[dm]?.line ?? null,
    },
  }));

  // ── 2. Strength verdict. Always present. ──
  // Backed by glossary.kekuatan since 3b5685e (Reyner-reviewed 2026-08-02): weak /
  // balanced / strong each carry name_id, name_en, label_meaning, gift_seed and
  // cost_seed, so this fact is no longer a gap. The verdict keys and the glossary
  // keys are the same three strings, which is why the lookup is direct.
  //
  // THE THRESHOLDS STAY IN THE ENGINE. glossary.kekuatan._note is explicit that
  // 40/60 supportShare lives in strength.ts and never here; the glossary supplies
  // words for a verdict, never the verdict.
  //
  // STAGE 6 MUST ENFORCE THE SAME-BREATH RULE. Per that same _note and rule 21,
  // "lemah"/"kuat" may never render bare — the label only ships when its
  // label_meaning lands with it, and the sharecard carries no verdict at all.
  // Emitting label and label_meaning as separate fields makes it mechanically
  // possible to ship one without the other, so the post-validator is what keeps
  // that from happening. Nothing in Phase 1 can guarantee it.
  facts.push(fact({
    id: `strength_${strength.verdict}`,
    type: 'core',
    provenance: {
      kind: 'strength',
      verdict: strength.verdict,
      element: elementId(dmElement),
      month_branch: chart.month.branch,
      season_ruler_element: elementId(seasonRulerElement(chart.month.branch)),
      relation_to_season: elementRelation(
        seasonRulerElement(chart.month.branch), dmElement),
    },
    entry: GLOSSARY.kekuatan[strength.verdict],
    extra: {
      confidence: strength.confidence,
      // Engine diagnostics in ENGLISH WITH HANZI ("root 巳 pulled toward Metal
      // by 半合"). The renderer is banned from writing either, so this is
      // internal_only for the same reason support_share is: carried for QA,
      // never shown a model. lib/render/payload.js is what enforces the marker.
      confidence_reasons: strength.confidenceReasons,
      // supportShare is a SCORE. It is carried for QA and for Phase 2, and the
      // renderer prompt bans surfacing any number, so it must never reach prose.
      support_share: strength.supportShare,
      internal_only: ['support_share', 'confidence_reasons'],
    },
  }));

  // ── 3. Main profile (Track A, month-branch structural). Always present. ──
  facts.push(fact({
    id: 'main_profile',
    type: 'core',
    provenance: {
      kind: 'month_branch_rooting',
      position: 'month',
      branch: chart.month.branch,
      root_stem: profile.rootStem,
      root_qi: profile.rootQi,
      revealed: profile.revealed,
      element: elementId(profile.element),
    },
    entry: GLOSSARY.aspek[profile.hanzi],
    palace: palaceName('month'),
    extra: { god: profile.hanzi, fallback: profile.fallback },
  }));

  // ── 4. Missing elements. An absent element is a CONDITION, not a badge. ──
  for (const [element, pct] of Object.entries(presence)) {
    if (pct > 0) continue;
    const hanzi = ELEMENT_HANZI[element];
    facts.push(fact({
      id: `element_missing_${element}`,
      type: 'extremity',
      provenance: {
        kind: 'element_absent',
        element: elementId(element),
        percent: 0,
        relation_to_day_master: elementRelation(dmElement, element),
      },
      // elemen_hilang carries name_id: null by design, and contentFrom preserves
      // it. Giving a missing element a label produced the garble the target file
      // records in label_note.
      entry: GLOSSARY.elemen_hilang[hanzi],
      // The percent here is ALWAYS zero - that is what makes the fact fire - so
      // showing it to the provider offers nothing and invites "0%" into prose
      // where the glossary entry deliberately has no label at all.
      // element_dominant carries the same guard; this fact was missing it (found
      // in the Prompt H session, reported not fixed, landed 2026-08-07).
      extra: { internal_only: ['provenance.percent'] },
    }));
  }

  // ── 5. A dominant element. Gated, see FACT_GATES. ──
  {
    const [element, pct] = Object.entries(presence).sort((a, b) => b[1] - a[1])[0];
    if (pct >= FACT_GATES.elementDominantPct) {
      facts.push(fact({
        id: `element_dominant_${element}`,
        type: 'extremity',
        provenance: {
          kind: 'element_dominant',
          element: elementId(element),
          percent: pct,
          relation_to_day_master: elementRelation(dmElement, element),
        },
        // ── ITS OWN GROUP, KEYED BY RELATION, NOT BY ELEMENT ──────
        // This used to reuse GLOSSARY.elemen[hanzi] - the element's CHARACTER
        // entry - with the comment that it "is not wrong, but it does not say
        // and you have a great deal of it". It was worse than that in practice:
        // the entry describes what it is like to BE that element, so a reader
        // whose chart is merely saturated with it was served the paragraph
        // written for somebody else's day master. Fixture chart 5 is the case
        // Reyner caught reading the quiet-chart files - a FIRE day master whose
        // dominant-Earth block was the Earth person's description, which is why
        // her Pemijar block and her dominant block read as one mechanism said
        // twice.
        //
        // `elemen_dominan` is keyed by `relation_to_day_master`, so what the
        // reader is told is what the saturation DOES to her: too much of her own
        // element, of what feeds her, of what she pours into, of what she must
        // manage, or of what presses on her. Five keys, one per elementRelation()
        // return value.
        //
        // `name_id` is null throughout, like elemen_hilang: the element's
        // Indonesian name is already in provenance.element, and labelling a
        // condition is the garble that fact guard now rejects.
        entry: GLOSSARY.elemen_dominan[elementRelation(dmElement, element)],
        extra: { glossary_source: 'elemen_dominan', internal_only: ['provenance.percent'] },
      }));
    }
  }

  // ── 6. Aspek convergence. The strongest signal there is. ──
  {
    const occurrences = aspekOccurrences(chart);
    const byGod = {};
    for (const o of occurrences) (byGod[o.god] ??= []).push(o);
    for (const god of Object.keys(GLOSSARY.aspek)) {
      const hits = byGod[god] ?? [];
      const positions = [...new Set(hits.map((h) => h.position))];
      if (positions.length < FACT_GATES.aspekConvergencePositions) continue;
      facts.push(fact({
        id: `aspek_convergence_${god}`,
        type: 'convergence',
        provenance: {
          kind: 'aspek_convergence',
          god,
          element: elementId(STEM_ELEMENTS[hits[0].stem]),
          occurrences: hits.map((h) => ({
            position: h.position, source: h.source, stem: h.stem, weight: h.weight,
          })),
          positions,
          palaces: positions.map(palaceName),
        },
        entry: GLOSSARY.aspek[god],
        extra: {
          count: hits.length,
          // Total qi weight, so the hierarchy layer can tell three full stems
          // apart from three residual hidden stems at 0.1 each. Both converge on
          // "the same theme repeats"; they do not converge equally hard.
          presence: Math.round(hits.reduce((s, h) => s + h.weight, 0) * 100) / 100,
          internal_only: ['presence'],
        },
      }));
    }
  }

  // ── 7. Badges. One per badge present, carrying every palace it lands in. ──
  const badges = computeBadges(chart);
  for (const badge of badges) {
    const palaces = badge.hits.map((h) => palaceName(h.position));
    facts.push(fact({
      id: `badge_${badge.key}`,
      type: 'badge',
      provenance: {
        kind: 'badge_anchor',
        badge: badge.key,
        anchored_on: 'day_pillar',
        anchor_branches: badge.anchors,
        hits: badge.hits.map((h) => ({ position: h.position, branch: h.branch, palace: palaceName(h.position) })),
      },
      entry: GLOSSARY.bintang[badge.key],
      palace: palaces[0],
      palaces,
    }));
  }

  // ── 8. void_stack — a void branch carrying two or more notable things. ──
  // Chart 1 is the exemplar: 酉 is void AND is the main profile's source AND
  // carries Bunga Persik AND Bintang Penolong. That convergence is a far bigger
  // finding than any of the three separately, so it is emitted IN ADDITION to
  // them rather than instead of them, and Phase 2 is what makes it outrank them.
  {
    const voidBadge = badges.find((b) => b.key === '空亡');
    for (const hit of voidBadge?.hits ?? []) {
      const notables = [];
      if (hit.position === 'month') {
        notables.push({ kind: 'main_profile_source', god: profile.hanzi });
      }
      for (const other of badges) {
        if (other.key === '空亡') continue;
        if (other.hits.some((h) => h.position === hit.position)) {
          notables.push({ kind: 'badge', badge: other.key });
        }
      }
      // A convergent Aspek seated in this branch counts too: the repeated theme
      // lands in a place that does not feel owned. MAIN QI ONLY, and therefore at
      // most one. Counting all three hidden stems made a three-stem branch stack
      // almost automatically — chart 13's void 辰 scored 3 on 戊/乙/癸 alone, with
      // no badge and no profile source, which is not a convergence, just a branch
      // with three hidden stems in it.
      const mainQi = (HIDDEN_STEMS[hit.branch] ?? [])[0];
      if (mainQi) {
        const god = tenGod(chart.day.stem, mainQi.stem).hanzi;
        if (facts.some((f) => f.id === `aspek_convergence_${god}`)) {
          notables.push({ kind: 'aspek_convergence', god });
        }
      }
      if (notables.length < FACT_GATES.voidStackNotables) continue;
      facts.push(fact({
        id: `void_stack_${hit.position}`,
        type: 'tension',
        provenance: {
          kind: 'void_stack',
          position: hit.position,
          branch: hit.branch,
          palace: palaceName(hit.position),
          notables,
        },
        entry: GLOSSARY.bintang['空亡'],
        palace: palaceName(hit.position),
        extra: { stack_size: notables.length },
      }));
    }
  }

  // ── 9. Spouse palace — the day branch. Always present. ──
  {
    const branch = chart.day.branch;
    const mainHidden = (HIDDEN_STEMS[branch] ?? [])[0];
    const seatGod = mainHidden ? tenGod(dm, mainHidden.stem).hanzi : null;
    const seatElement = mainHidden ? STEM_ELEMENTS[mainHidden.stem] : null;
    const dayEntry = GLOSSARY.pilar.day;
    facts.push(fact({
      id: 'spouse_palace',
      type: seatElement && strength.unfavorable.includes(seatElement) ? 'tension' : 'core',
      provenance: {
        kind: 'day_branch_seat',
        position: 'day',
        branch,
        seat_stem: mainHidden?.stem ?? null,
        seat_god: seatGod,
        element: seatElement ? elementId(seatElement) : null,
        relation_to_day_master: seatElement ? elementRelation(dmElement, seatElement) : null,
      },
      // The day pillar entry keeps the branch's own strings under branch_*, since
      // the stem is the self and the branch is the partner seat.
      entry: {
        name_id: dayEntry.branch_name_id,
        name_en: dayEntry.branch_name_en,
        label_meaning: dayEntry.branch_label_meaning,
      },
      palace: palaceName('day'),
      extra: {
        seat_god: seatGod,
        // The seat's own gift/cost come from the Aspek sitting there, not from
        // the palace. Carried separately so the renderer can braid them without
        // Stage 3 merging two entries into one and losing which said what.
        seat_content: seatGod ? contentFrom(GLOSSARY.aspek[seatGod]) : null,
      },
    }));
  }

  // ── 10. Branch relations, one per instance. 刑 comes off chart.punishments. ──
  for (const relation of branchRelations(chart)) {
    facts.push(fact({
      id: `relation_${relation.type}_${relation.branches.join('')}`,
      type: relation.type === '冲' || relation.type === '害' ? 'tension' : 'combination',
      provenance: {
        kind: 'branch_relation',
        relation: relation.type,
        branches: relation.branches,
        positions: relation.positions,
        palaces: [...new Set(relation.positions)].map(palaceName),
        // The life domain of each palace above. A relation block is where many
        // readings make their FIRST palace mention, so the weave (QA finding 5)
        // needs the gloss here too - and a relation carries its palaces in
        // provenance rather than on the fact, so `fact()`'s join cannot reach it.
        //
        // KEYED BY PALACE NAME, NEVER A PARALLEL ARRAY. `palaces` is in emission
        // order and `positions_id` is in READING order (palacePhrase sorts), so on
        // chart 6 the array would pair "Pilar Akar dan Pilar Kerja" with
        // ["pekerjaan...", "asal-usul..."]. A renderer zipping those by index would
        // gloss the Root Pillar as career - a plain falsehood about the reader's
        // chart, and exactly the rule-14 failure where the LLM decides something
        // true. A map cannot be mis-zipped.
        //
        // DATA, NOT A FORMATTED PARENTHETICAL. The engine says WHICH domain; how to
        // weave it into a sentence is words, and words are the renderer's half of
        // rule 14. A pre-assembled "Pilar Kerja (pekerjaan dan kariermu)" would also
        // hard-code a bracket style that rule 23 governs per surface.
        palace_domains: Object.fromEntries([...new Set(relation.positions)]
          .map((position) => [palaceName(position), palaceDomain(position)])
          .filter(([name, domain]) => name && domain)),
        // The span, pre-verbalised. `positions` and `palaces` stay because the
        // gate checks against them and QA reads them; this is the field the
        // renderer is told to speak verbatim. See palacePhrase() for why the
        // engine says it instead of the renderer assembling it.
        positions_id: palacePhrase(relation.positions),
        ...(relation.element ? { element: elementId(relation.element) } : {}),
      },
      entry: GLOSSARY.relasi_cabang[relation.type],
      extra: relation.element
        ? { combines_into: elementId(relation.element), relation_to_day_master: elementRelation(dmElement, relation.element) }
        : {},
    }));
  }

  for (const punishment of chart.punishments ?? []) {
    const base = GLOSSARY.relasi_cabang['刑'];
    const sub = base.types[punishment.type];
    // Hoisted out of the provenance literal so the palace list and the phrase are
    // provably the same span. 刑 carries the phrase for the same reason 六合/冲/害
    // do: renderer-prompt tells the renderer to speak the supplied phrase when it
    // states a relation's span, and 刑 is a relation the reader sees as one.
    const punishmentPositions = [...new Set(positionsOf(chart)
      .filter(([, p]) => punishment.branches.includes(p.branch))
      .map(([pos]) => pos))];
    facts.push(fact({
      id: `relation_刑_${punishment.type}_${[...new Set(punishment.branches)].join('')}`,
      type: 'tension',
      provenance: {
        kind: 'punishment',
        punishment_type: punishment.type,
        branches: punishment.branches,
        palaces: punishmentPositions.map(palaceName),
        positions_id: palacePhrase(punishmentPositions),
      },
      // One badge name, three explanations: the sub-type overrides label_meaning
      // and cost, the base entry supplies the name and the gift.
      entry: {
        name_id: base.name_id,
        name_en: base.name_en,
        label_meaning: sub.label_meaning,
        gift_seed: base.gift_seed,
        cost_seed: sub.cost_seed,
      },
      extra: { punishment_type: punishment.type },
    }));
  }

  // ── 11. profile_vs_favorable (CR-1). Conditional, and deliberately narrow. ──
  // Fires when the main profile's element is unfavorable to the Day Master AND
  // the verdict is decisive. The second clause D2 gives ("or the profile Aspek
  // contradicts the strength verdict") is not a separate test: favorable and
  // unfavorable ARE derived from the verdict, so a drain-side profile on a weak
  // chart is exactly an unfavorable profile element.
  //
  // THE BALANCED EXCLUSION IS THE LOAD-BEARING PART. Without it CR-1 fires on 9
  // of the 13 fixture charts, because 8 of them are balanced and for a balanced
  // chart the engine picks the unfavourable side by whichever is merely less
  // scarce — then pushes 'balanced verdict' into confidenceReasons itself. D2 is
  // explicit that a forced tension is worse than no tension, and building the
  // emotional core of a reading on a split the engine has already flagged as
  // low-confidence is the definition of forcing it. With the exclusion it fires
  // on 4 of 13.
  //
  // Carry-forward: the fixture currently yields ZERO strong charts (a recorded
  // cost of the sqrt transform), so today this reads as "weak charts only". If
  // the 40/60 thresholds are ever revisited, re-measure the fire rate here.
  const decisiveVerdict = strength.verdict !== 'balanced';
  if (decisiveVerdict && strength.unfavorable.includes(profile.element)) {
    // ── THE SAME ASPEK, CONVERGING ────────────────────────────
    // When the profile Aspek ALSO converges, `aspek_convergence_<god>` reads the
    // same glossary entry as this fact, so both carry the identical label,
    // label_meaning, gift and cost. Measured 2026-08-04 by
    // structure.duplicate_sentence: charts 9 (正財, 6 duplicated sentences) and 12
    // (偏財, 7) rendered the whole entry TWICE, word for word. Chart 1's profile is
    // 正財 and it has no 正財 convergence, which is why 11 of 13 charts were clean.
    //
    // Same shape as the main_profile absorption below it, and the third instance of
    // the pattern collapseSuperseded() handles (the second is badge_空亡 inside a
    // void stack).
    const twin = facts.find((f) => f.provenance.kind === 'aspek_convergence'
      && f.provenance.god === profile.hanzi);

    facts.push(fact({
      id: 'profile_vs_favorable',
      type: 'tension',
      provenance: {
        kind: 'coherence_rule',
        rule: 'CR-1',
        god: profile.hanzi,
        element: elementId(profile.element),
        verdict: strength.verdict,
        relation_to_day_master: elementRelation(dmElement, profile.element),
        // CARRIED FORWARD FROM THE ABSORBED CONVERGENCE, so the collapse loses no
        // information. This fact's own `palace` is the structural month default;
        // the convergence knew WHERE the Aspek actually shows up (chart 9: year,
        // month and hour) and that is the one thing it held which this fact did
        // not. Dropping the fact without carrying these would trade a duplicated
        // paragraph for a silently missing finding - and the void_stack precedent
        // absorbs precisely BECAUSE the stack covers every position it hits.
        ...(twin ? {
          convergence_positions: twin.provenance.positions,
          convergence_palaces: twin.provenance.palaces,
        } : {}),
      },
      entry: GLOSSARY.aspek[profile.hanzi],
      palace: palaceName('month'),
      // This fact and main_profile read the SAME glossary entry — same label,
      // same label_meaning, same gift and cost — and differ only in that this one
      // frames them as a tension. Emitting both is correct for an inventory, and
      // sending both to the renderer would produce the same paragraph twice, so
      // the relationship is stated here rather than left to Phase 3's judgment.
      // The target file resolves it the same way: chart 1 has profile_drains_self
      // and no separate plain profile fact.
      //
      // `supersedes` is an ARRAY as of 2026-08-05. It was a bare string while
      // main_profile was the only absorbed fact; a second one made the string a
      // lie, and under-reporting what a fact absorbed is how a collapse becomes
      // untraceable.
      extra: {
        coherence_rule: 'CR-1',
        supersedes: ['main_profile', ...(twin ? [twin.id] : [])],
      },
    }));
    const plain = facts.find((f) => f.id === 'main_profile');
    if (plain) plain.superseded_by = 'profile_vs_favorable';
    if (twin) twin.superseded_by = 'profile_vs_favorable';
  }

  return facts;
}

// ── Helpers ────────────────────────────────────────────────

const GENERATES = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const CONTROLS = { Wood: 'Earth', Fire: 'Metal', Earth: 'Water', Metal: 'Wood', Water: 'Fire' };

/**
 * How `other` stands to the Day Master's element, as a structural token rather
 * than a word. The renderer turns it into Indonesian; the glossary's elemen
 * entries already carry fed_by / drained_by / controlled_by / controls for that.
 */
export function elementRelation(dmElement, other) {
  if (other === dmElement) return 'same';
  if (GENERATES[other] === dmElement) return 'feeds';       // 印 Resource
  if (GENERATES[dmElement] === other) return 'drains';      // 食傷 Output
  if (CONTROLS[dmElement] === other) return 'is_controlled'; // 財 Wealth
  return 'controls';                                         // 官殺 Officer
}

/**
 * The element ruling the birth month — the one the strength engine scores 旺.
 *
 * Asked of the engine rather than re-derived, so 土旺於四季 (辰 Wood, 未 Fire,
 * 戌 Metal, 丑 Water) is answered by the same table that scored the chart. A
 * second season table here would be free to disagree with the first.
 */
function seasonRulerElement(monthBranch) {
  const ruler = ELEMENTS.find(
    (e) => seasonMultiplier(monthBranch, e) === STRENGTH_PARAMS.season.prosperous,
  );
  if (!ruler) throw new Error(`No ruling element for month branch "${monthBranch}"`);
  return ruler;
}
