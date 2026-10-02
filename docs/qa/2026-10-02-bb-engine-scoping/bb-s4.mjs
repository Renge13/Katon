// BB s4 scratch measurement. REPORT ONLY. Reads repo modules, writes nothing in the repo.
// Reproduces scripts/compat-base-rates.mjs's draw exactly (same PRNG, same order),
// asserts the V0 quadrant counts and the P4 pattern counts equal the harness's
// printed run, then measures P4 options and E11 joins on the same 5000 pairs.
const R = 'file:///D:/claude-projects/katon/';
const { calculateBaziChart } = await import(R + 'lib/bazi/buildChart.js');
const { compatBranchRelations } = await import(R + 'lib/compat/branchRelations.js');
const { compatComplementarity } = await import(R + 'lib/compat/complementarity.js');
const { compatStemRelation } = await import(R + 'lib/compat/stemRelation.js');
const { compatTemperament, tenGodRelation } = await import(R + 'lib/compat/temperament.js');
const { compatPullFit } = await import(R + 'lib/compat/pullFit.js');
const { mainProfile } = await import(R + 'lib/bazi/mainProfile.js');
const { computeStrength } = await import(R + 'lib/bazi/strength.ts');
const { elementPresence, elementRelation, FACT_GATES } = await import(R + 'lib/semantic/facts.js');
const { STEM_ELEMENTS, STEM_POLARITY, HIDDEN_STEMS, BRANCH_ELEMENTS, BRANCHES, branchPunishments } = await import(R + 'lib/bazi/stems.js');
const { TRINE_SETS } = await import(R + 'lib/bazi/relations.js');

const CHARTS = 2000; const PAIRS = 5000; const SEED = Number(process.env.SEED ?? 20260907);

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const FIRST_DAY = Date.UTC(1960, 0, 1) / 86400000;
const LAST_DAY = Date.UTC(2005, 11, 31) / 86400000;
const SPAN = LAST_DAY - FIRST_DAY + 1;
const pad = (n) => String(n).padStart(2, '0');
function randomBirth(rand) {
  const d = new Date((FIRST_DAY + Math.floor(rand() * SPAN)) * 86400000);
  return {
    birthDate: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    birthTime: `${pad(Math.floor(rand() * 24))}:${pad(Math.floor(rand() * 60))}`,
  };
}

// ── Branch element: two definitions in the repo; check they agree on all 12 ──
// (a) BRANCH_ELEMENTS, lib/bazi/stems.js:24  (b) main qi of HIDDEN_STEMS, which is
// what the emitted spouse_palace fact uses (lib/semantic/facts.js:473-475).
const mainQiElement = (branch) => STEM_ELEMENTS[HIDDEN_STEMS[branch][0].stem];
const disagree = BRANCHES.filter((b) => BRANCH_ELEMENTS[b] !== mainQiElement(b));
console.log('BRANCH_ELEMENTS vs main-qi element disagreements:', disagree.length ? disagree : 'none (12/12 agree)');

// family index along the generating cycle from the Day Master
const FAMILY_K = { companion: 0, output: 1, wealth: 2, officer: 3, resource: 4 };
const cycleBucket = (rel) => (rel === 'same' ? 'same' : (rel === 'drains' || rel === 'feeds') ? 'generating' : 'controlling');

const rand = mulberry32(SEED);
const built = [];
for (let i = 0; i < CHARTS; i += 1) {
  const birth = randomBirth(rand);
  const chart = calculateBaziChart(birth);
  const profile = mainProfile(chart, { silent: true });
  const strength = computeStrength(chart);
  const presence = elementPresence(chart);
  const [domEl, domPct] = Object.entries(presence).sort((x, y) => y[1] - x[1])[0];
  built.push({
    birth, chart, profile, strength, presence,
    dmEl: STEM_ELEMENTS[chart.day.stem],
    family: tenGodRelation(STEM_ELEMENTS[chart.day.stem], profile.element),
    seatEl: mainQiElement(chart.day.branch),
    absent: Object.keys(presence).filter((e) => presence[e] === 0),
    dominant: domPct >= FACT_GATES.elementDominantPct ? domEl : null,
  });
}

const C = {}; const inc = (k) => { C[k] = (C[k] ?? 0) + 1; };
const pairsList = [];
for (let n = 0; n < PAIRS; n += 1) {
  const i = Math.floor(rand() * built.length);
  let j = Math.floor(rand() * built.length);
  while (j === i) j = Math.floor(rand() * built.length);
  pairsList.push([i, j]);
}

const pct = (k) => `${(((C[k] ?? 0) / PAIRS) * 100).toFixed(1)}%`;

for (const [i, j] of pairsList) {
  const A = built[i]; const B = built[j];
  const branches = compatBranchRelations(A.chart, B.chart);
  const comp = compatComplementarity(A.chart, B.chart, A.strength, B.strength);
  const stems = compatStemRelation(A.chart, B.chart);
  const pf = compatPullFit(branches, comp, stems);
  const temp = compatTemperament(A.chart, B.chart);

  // V0 (shipped)
  inc(`P5.${pf.quadrant}`); if (pf.pull === 'high') inc('P5.pullHigh'); if (pf.fit === 'high') inc('P5.fitHigh');
  for (const c of pf.pull_reasons) inc(`pull.${c}`);
  if (pf.pull_reasons.length === 1) inc(`pullAlone.${pf.pull_reasons[0]}`);
  for (const { clause, held } of pf.fit_reasons) if (held) inc(`fitHeld.${clause}`);
  // old 2.1.d (all eight palace pairings) and old 2.2.a, standalone, for the record
  const palace = [...branches.bHitsASpousePalace, ...branches.aHitsBSpousePalace];
  if (palace.some((e) => e.relation === '六合' || e.relation === '冲')) inc('old.2.1.d.anyPalace');
  if (comp.aSupplies !== null || comp.bSupplies !== null) inc('old.2.2.a.either');

  // P1 cycle (already emitted): a_controls_b means B's DM element is A's 財 element
  inc(`P1.${stems.cycle}`);
  // single-chart 三合/半合 and 三刑 presence, and a cross-chart 三刑 count (NOT a rule:
  // just how often the union of both charts' branches would complete a punishment trine
  // that neither chart completes alone; measured to size E10, not proposed)
  const brs = (ch) => [ch.year, ch.month, ch.day, ch.hour].filter(Boolean).map((p) => p.branch);
  const trinesOf = (list) => branchPunishments(list).filter((p) => p.type === 'trine').map((p) => p.branches.join(''));
  const own = new Set([...trinesOf(brs(A.chart)), ...trinesOf(brs(B.chart))]);
  if (trinesOf([...brs(A.chart), ...brs(B.chart)]).some((t) => !own.has(t))) inc('size.cross三刑.unionOnly');
  const fullSan = (list) => TRINE_SETS.filter((t) => t.members.every((m) => list.includes(m))).map((t) => t.key);
  const ownSan = new Set([...fullSan(brs(A.chart)), ...fullSan(brs(B.chart))]);
  if (fullSan([...brs(A.chart), ...brs(B.chart)]).some((t) => !ownSan.has(t))) inc('size.cross三合.unionOnly');
  if (own.size) inc('size.single三刑.eitherChart');
  if (ownSan.size) inc('size.single三合.eitherChart');
  // P4 current
  inc(`P4.${temp.pattern}`);
  if (A.family === B.family) inc('P4.sameFamily');

  // P4 option A: matching / related kept; contrasting split by the two families'
  // distance on the generating cycle (1 or 4 = neighbours, 2 or 3 = control step).
  const d = (FAMILY_K[B.family] - FAMILY_K[A.family] + 5) % 5;
  let optA;
  if (temp.pattern !== 'contrasting') optA = temp.pattern;
  else optA = (d === 1 || d === 4) ? 'contrasting_generating' : 'contrasting_controlling';
  inc(`optA.${optA}`);
  // P4 option B: three patterns, same family merged
  const optB = d === 0 ? 'same_family' : (d === 1 || d === 4) ? 'generating_family' : 'controlling_family';
  inc(`optB.${optB}`);
  // P4 option C: absolute element of each main profile (profile.element = root stem element)
  const optC = cycleBucket(elementRelation(A.profile.element, B.profile.element));
  inc(`optC.${optC}`);
  // P4 option D: contrasting split by the two gods' polarity relative to own DM (same vs different)
  const polA = STEM_POLARITY[A.chart.day.stem] === A.profile.polarity;
  const polB = STEM_POLARITY[B.chart.day.stem] === B.profile.polarity;
  const optD = temp.pattern !== 'contrasting' ? temp.pattern : (polA === polB ? 'contrasting_samepol' : 'contrasting_diffpol');
  inc(`optD.${optD}`);
  // P4 option E (directional, 6 patterns): matching / related kept; contrasting split by
  // the DIRECTED step on the generating cycle, d = (kB - kA) mod 5:
  //   1 A's family generates B's | 2 A's controls B's | 3 B's controls A's | 4 B's generates A's
  const DIR = { 1: 'a_generates_b', 2: 'a_controls_b', 3: 'b_controls_a', 4: 'b_generates_a' };
  inc(`optE.${temp.pattern !== 'contrasting' ? temp.pattern : DIR[d]}`);
  // P4 option F (directional, 5 patterns): same family merged + the four directed steps
  inc(`optF.${d === 0 ? 'same_family' : DIR[d]}`);
  // P4 option G (directional, 5 patterns, absolute root element): elementRelation(A, B)
  //   same | drains = A generates B | feeds = B generates A | is_controlled = A controls B | controls = B controls A
  const G = { same: 'same_element', drains: 'a_generates_b', feeds: 'b_generates_a', is_controlled: 'a_controls_b', controls: 'b_controls_a' };
  inc(`optG.${G[elementRelation(A.profile.element, B.profile.element)]}`);

  // ── E11 joins ──
  // (a) one person's DM element == the other's main-profile root element
  const aA = A.dmEl === B.profile.element; const aB = B.dmEl === A.profile.element;
  if (aA) inc('E11.a.dirAtoB'); if (aB) inc('E11.a.dirBtoA'); if (aA || aB) inc('E11.a.either'); if (aA && aB) inc('E11.a.both');
  // (a') stem level: DM stem == other's root stem
  const asA = A.chart.day.stem === B.profile.rootStem; const asB = B.chart.day.stem === A.profile.rootStem;
  if (asA || asB) inc('E11.a_stem.either');
  // (b) element supplied == supplier's own spouse-seat element (main qi of day branch)
  const bA = comp.aSupplies && comp.aSupplies.element === A.seatEl;
  const bB = comp.bSupplies && comp.bSupplies.element === B.seatEl;
  if (bA) inc('E11.b.A'); if (bB) inc('E11.b.B'); if (bA || bB) inc('E11.b.either');
  // (b'') element supplied is ANY hidden stem element of supplier's day branch
  const anyHidden = (ch, el) => HIDDEN_STEMS[ch.day.branch].some((h) => STEM_ELEMENTS[h.stem] === el);
  const bAx = comp.aSupplies && anyHidden(A.chart, comp.aSupplies.element);
  const bBx = comp.bSupplies && anyHidden(B.chart, comp.bSupplies.element);
  if (bAx || bBx) inc('E11.b_anyqi.either');
  // (c) the two spouse-seat elements on the cycle (partition)
  inc(`E11.c.${cycleBucket(elementRelation(A.seatEl, B.seatEl))}`);
  // (c2) one DM element == the other's spouse-seat element
  const c2A = A.dmEl === B.seatEl; const c2B = B.dmEl === A.seatEl;
  if (c2A || c2B) inc('E11.c2.either');
  // (d) one DM element is the other's rank-0 favourable / in favourable list
  const d0 = B.strength.favorable[0] === A.dmEl || A.strength.favorable[0] === B.dmEl;
  const dl = B.strength.favorable.includes(A.dmEl) || A.strength.favorable.includes(B.dmEl);
  const du = B.strength.unfavorable.includes(A.dmEl) || A.strength.unfavorable.includes(B.dmEl);
  if (d0) inc('E11.d.rank0.either'); if (dl) inc('E11.d.favList.either'); if (du) inc('E11.d.unfavList.either');
  // (e) element supplied == supplier's DM element
  const eA = comp.aSupplies && comp.aSupplies.element === A.dmEl;
  const eB = comp.bSupplies && comp.bSupplies.element === B.dmEl;
  if (eA || eB) inc('E11.e.either');
  // (f) one DM element is absent from the other chart (presence 0, the element_missing fact)
  if (B.absent.includes(A.dmEl) || A.absent.includes(B.dmEl)) inc('E11.f.either');
  // (g) one chart's dominant element (element_dominant fact, >=35%) == the other's DM element
  if ((A.dominant && A.dominant === B.dmEl) || (B.dominant && B.dominant === A.dmEl)) inc('E11.g.either');
  // (h) both main profiles in the same family AND same root element (sanity: same_god subset)
  // (i) shared spouse seat branch (identical day branch)
  if (A.chart.day.branch === B.chart.day.branch) inc('E11.i.sameSeatBranch');
}

// Guards: must equal the harness run of 2026-10-02 on this seed.
const expect = { 'P5.q1': process.env.BREAKQ ? 1075 : 1074, 'P5.q2': 1284, 'P5.q3': 1047, 'P5.q4': 1595, 'P4.matching': 526, 'P4.related': 445, 'P4.contrasting': 4029 };
if (SEED === 20260907) for (const [k, v] of Object.entries(expect)) if (C[k] !== v) throw new Error(`GUARD: ${k}=${C[k]} expected ${v}`);
const sum = (pre) => Object.entries(C).filter(([k]) => k.startsWith(pre)).reduce((a, [, v]) => a + v, 0);
for (const pre of ['optA.', 'optB.', 'optC.', 'optD.', 'optE.', 'optF.', 'optG.', 'E11.c.']) if (sum(pre) !== PAIRS) throw new Error(`GUARD sum ${pre}=${sum(pre)}`);
// optA: matching/related unchanged
if (C['optA.matching'] !== C['P4.matching'] || C['optA.related'] !== C['P4.related']) throw new Error('GUARD optA kept buckets moved');
if (C['optB.same_family'] !== C['P4.sameFamily'] || C['P4.sameFamily'] !== C['P4.matching'] + C['P4.related']) throw new Error('GUARD optB same_family');
const genE = (C['optE.a_generates_b'] ?? 0) + (C['optE.b_generates_a'] ?? 0);
if (genE !== C['optA.contrasting_generating']) throw new Error(`GUARD optE generating ${genE} != optA ${C['optA.contrasting_generating']}`);
if (process.env.BREAK) throw new Error('GUARD (deliberate red run): BREAK set');
console.log('guards: V0 and P4 reproduce the harness run; option partitions sum to 5000');

// marginals
const fam = {}; const godC = {}; const rootEl = {};
for (const b of built) { fam[b.family] = (fam[b.family] ?? 0) + 1; godC[b.profile.hanzi] = (godC[b.profile.hanzi] ?? 0) + 1; rootEl[b.profile.element] = (rootEl[b.profile.element] ?? 0) + 1; }
const pc = (n) => `${((n / CHARTS) * 100).toFixed(1)}%`;
console.log('\nper-chart family marginal (2000 charts):', Object.entries(fam).map(([k, v]) => `${k} ${pc(v)}`).join(', '));
console.log('per-chart god marginal:', Object.entries(godC).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${pc(v)}`).join(', '));
console.log('per-chart main-profile root element:', Object.entries(rootEl).map(([k, v]) => `${k} ${pc(v)}`).join(', '));
const expSame = Object.values(fam).reduce((a, v) => a + (v / CHARTS) ** 2, 0);
console.log(`expected same-family rate from marginals: ${(expSame * 100).toFixed(1)}%`);

console.log('\nall counters:');
for (const k of Object.keys(C).sort()) console.log(`  ${k.padEnd(32)} ${String(C[k]).padStart(5)}  ${pct(k).padStart(6)}`);
