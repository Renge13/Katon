#!/usr/bin/env node
// ============================================================
// scripts/count-portrait-claims.mjs - single-chart claims in stored drafts, vs the engine
// ============================================================
//   node --conditions=react-server scripts/count-portrait-claims.mjs [reports-root]
//
// Prompt AN §1.3, committed for Prompt AO §2 with its COUNTING LOGIC UNCHANGED (only the
// imports and the root became parameters). REPORT ONLY; spends nothing. For every stored
// draft and served reading under <reports-root> (default reports/voice-v2) and its
// first-level folders, every sentence claiming a birth month ("lahir di/pada bulan <Shio>"),
// a season element ("musim(nya) berelemen <E>") or an Aspek at a named pillar is marked
// true, false or subject-undetermined against the engine for the person it is about:
// glossary.shio for the month animal, the strength fact's season_ruler_element, and
// aspekOccurrences (lib/semantic/facts.js) for placement - a pillar is true if ANY stem or
// hidden stem there carries that Aspek. Subject: lib/validate/pairTruth.js namedSide on a
// pair (null when a sentence names both or neither), the reader on a mirror.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'GEMINI_API_KEY', 'VOICE']) delete process.env[k];
const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { aspekOccurrences, buildFactInventory } = await import('../lib/semantic/facts.js');
const { namedSide } = await import('../lib/validate/pairTruth.js');
const { sentences } = await import('../lib/validate/text.js');
const G = JSON.parse(fs.readFileSync(new URL('../docs/content/glossary.json', import.meta.url), 'utf8'));

const SHIO = Object.fromEntries(Object.entries(G.shio).filter(([k]) => !k.startsWith('_')).map(([b, c]) => [c.name_id, b]));
const SHIO_NAMES = Object.keys(SHIO);
const PILLAR = { Akar: 'year', Kerja: 'month', Diri: 'day', Arah: 'hour' };
const ASPEK = Object.fromEntries(Object.entries(G.aspek).filter(([k]) => !k.startsWith('_')).map(([h, c]) => [c.name_id, h]));
const ASPEK_RE = Object.keys(ASPEK).sort((a, b) => b.length - a.length).map((n) => n.replace(/^Aspek /u, '')).join('|');
const ELEM = ['Api', 'Air', 'Kayu', 'Logam', 'Tanah'];

const truthOf = (chart) => {
  const strength = buildFactInventory(chart).find((f) => f.provenance?.kind === 'strength');
  const occ = aspekOccurrences(chart);
  return {
    monthShio: G.shio[chart.month.branch]?.name_id,
    season: strength?.provenance?.season_ruler_element ?? null,
    placement: (hanzi) => new Set(occ.filter((o) => o.god === hanzi).map((o) => o.position)),
  };
};

const MONTH = new RegExp(`lahir\\s+(?:di|pada)\\s+bulan\\s+(${SHIO_NAMES.join('|')})`, 'giu');
const ANY_MONTH = new RegExp(`(?<![\\p{L}])bulan\\s+(${SHIO_NAMES.join('|')})(?![\\p{L}])`, 'gu');
const SEASON = new RegExp(`musim\\p{L}*\\s+(?:yang\\s+)?(?:ber)?elemen\\s+(${ELEM.join('|')})`, 'giu');
const ASPEK_AT = new RegExp(`Aspek\\s+(${ASPEK_RE})(?:-?(?:mu|nya))?[^.]{0,80}?\\bdi\\s+[Pp]ilar\\s+(Akar|Kerja|Diri|Arah)((?:\\s*(?:,|dan|serta)\\s*(?:[Pp]ilar\\s+)?(?:Akar|Kerja|Diri|Arah))*)`, 'gu');

const rows = [];
const root = process.argv[2] || 'reports/voice-v2';
const dirs = ['', ...fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)];
for (const d of dirs) {
  const dir = path.join(root, d);
  for (const file of fs.readdirSync(dir).filter((f) => /-v[12]\.json$/u.test(f))) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const charts = rec.kind === 'pair'
      ? { a: calculateBaziChart(rec.inputs.a), b: calculateBaziChart(rec.inputs.b) }
      : { self: calculateBaziChart(rec.inputs.a) };
    const truths = Object.fromEntries(Object.entries(charts).map(([k, c]) => [k, truthOf(c)]));
    const inputs = [...(rec.drafts || []).map((x, n) => [`draft${n + 1}`, x]), ...(rec.rendered ? [['served', rec.rendered]] : [])];
    for (const [label, draft] of inputs) {
      const texts = [...(draft.blocks || []).map((b) => b.text), draft.penutup];
      for (const s of texts.flatMap((t) => sentences(t || ''))) {
        const whose = rec.kind === 'pair' ? namedSide(s) : 'self';
        const t = whose ? truths[whose] : null;
        const push = (kind, claim, ok) => rows.push({ where: `${d || 'round2'}/${file}#${label}`, kind: rec.kind, voice: rec.voice, claim: kind, said: claim, whose: whose ?? '?', ok: t ? ok : null, s });
        for (const m of s.matchAll(MONTH)) push('month', m[1], t && m[1] === t.monthShio);
        for (const m of s.matchAll(ANY_MONTH)) if (!MONTH.test(s)) push('bulan <Shio> (other)', m[1], t && m[1] === t.monthShio);
        MONTH.lastIndex = 0;
        for (const m of s.matchAll(SEASON)) push('season', m[1], t && m[1] === t.season);
        for (const m of s.matchAll(ASPEK_AT)) {
          const name = `Aspek ${m[1]}`;
          const pillars = [m[2], ...[...(m[3] || '').matchAll(/(Akar|Kerja|Diri|Arah)/gu)].map((x) => x[1])];
          const where = t ? t.placement(ASPEK[name]) : null;
          const bad = t ? pillars.filter((p) => !where.has(PILLAR[p])) : [];
          push('aspek@pilar', `${name} @ ${pillars.join('+')}`, t && bad.length === 0);
        }
      }
    }
  }
}
const sum = (f) => rows.filter(f).length;
for (const kind of ['pair', 'mirror']) {
  console.log(`\n=== ${kind.toUpperCase()} drafts`);
  for (const c of ['month', 'bulan <Shio> (other)', 'season', 'aspek@pilar']) {
    const r = (x) => x.kind === kind && x.claim === c;
    console.log(`  ${c.padEnd(22)} claims ${String(sum(r)).padStart(3)} | false ${String(sum((x) => r(x) && x.ok === false)).padStart(3)} | true ${String(sum((x) => r(x) && x.ok === true)).padStart(3)} | subject undetermined ${sum((x) => r(x) && x.ok === null)}`);
  }
}
console.log('\n=== every FALSE claim');
for (const x of rows.filter((y) => y.ok === false)) console.log(`- [${x.kind} ${x.voice}] ${x.where} (${x.whose}) ${x.claim}: ${x.said}\n    "${x.s}"`);
console.log('\n=== every UNDETERMINED-subject claim (pair)');
for (const x of rows.filter((y) => y.ok === null)) console.log(`- ${x.where} ${x.claim}: ${x.said}\n    "${x.s}"`);
