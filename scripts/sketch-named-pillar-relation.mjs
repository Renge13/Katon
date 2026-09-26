#!/usr/bin/env node
// ============================================================
// scripts/sketch-named-pillar-relation.mjs — Prompt AG item 2, REPORT ONLY
// ============================================================
//   node --conditions=react-server scripts/sketch-named-pillar-relation.mjs
//
// NOT A GATE. Nothing in lib/ imports this. It sketches the seed-S2 class - a
// relation stated between two NAMED pillars that the engine does not relate - and
// counts what it would fire on over the stored drafts, so Cowork can decide
// whether it is worth enabling (AF called it brittle to paraphrase). Spends
// nothing: reports/voice-v2 is local (gitignored) and the gate is deterministic.
//
// The sketch, per sentence that carries a relation word:
//   refs = every pillar named in it, with its owner (-mu / milikmu = A, -nya /
//          miliknya = B, kalian = both, bare = the mirror's one chart or unknown);
//   MIRROR, two or more positions: fire unless one branch_relation fact covers two
//          of them (provenance.positions);
//   PAIR, a non-day pillar of one person and the other's day seat: fire unless a
//          p2_palace_frame hit runs from that position, in that direction;
//   PAIR, both day seats: fire unless p2_day_pair.relations is non-empty;
//   PAIR, two pillars of one person: unverifiable on v1 (no per-person relation
//          facts), counted, not fired.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'GEMINI_API_KEY']) delete process.env[k];
const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { buildSemanticJson } = await import('../lib/semantic/index.js');
const { buildPairSemantic } = await import('../lib/semantic/pair.js');
const { sentences } = await import('../lib/validate/text.js');

const DATA = process.argv[2] || '.';
const DIRS = ['reports/voice-v2', 'reports/voice-v2/run1-stage6-1.29.0', 'reports/voice-v2/round3'];

const RELATION_WORD = /(?<![\p{L}])(berbenturan|benturan|bentrok|bertabrakan|mengikat|terikat|ikatan|berikatan|bergabung|gabungan|bergesekan|gesekan|bersimpul|simpul|berseberangan|saling tarik)(?![\p{L}])/iu;
const PILLAR = /(?<![\p{L}])(?:Pilar (Akar|Kerja|Diri|Arah)|(Fondasi Pasangan)|(kursi)(?:\s+pasangan)?)(?:-?(mu|nya)(?![\p{L}])|\s+(milikmu|miliknya|kamu|dia|kalian))?/giu;
const POS = { akar: 'year', kerja: 'month', diri: 'day', arah: 'hour' };

function refsIn(sentence) {
  const refs = [];
  for (const m of sentence.matchAll(PILLAR)) {
    const position = m[1] ? POS[m[1].toLowerCase()] : 'day';
    const o = (m[4] || m[5] || '').toLowerCase();
    const owner = ['mu', 'milikmu', 'kamu'].includes(o) ? 'a'
      : ['nya', 'miliknya', 'dia'].includes(o) ? 'b'
        : o === 'kalian' ? 'both' : null;
    refs.push({ position, owner, text: m[0] });
  }
  return refs;
}

function verdict(sentence, sj) {
  if (!RELATION_WORD.test(sentence)) return null;
  const refs = refsIn(sentence);
  if (refs.length < 2 && !refs.some((r) => r.owner === 'both')) return null;
  if (sj.kind !== 'pair') {
    const named = new Set(refs.map((r) => r.position));
    if (named.size < 2) return null;
    const covered = (sj.facts || []).some((f) => f.provenance?.kind === 'branch_relation'
      && (f.provenance.positions || []).filter((p) => named.has(p)).length >= 2);
    return covered ? { fire: false } : { fire: true, why: `no relation fact covers two of [${[...named]}]` };
  }
  const byId = new Map(sj.facts.map((f) => [f.id, f]));
  const frame = byId.get('p2_palace_frame')?.provenance || { a_hits_b: [], b_hits_a: [] };
  const dayRel = byId.get('p2_day_pair')?.provenance?.relations || [];
  const a = refs.filter((r) => r.owner === 'a' || r.owner === 'both');
  const b = refs.filter((r) => r.owner === 'b' || r.owner === 'both');
  if (!a.length || !b.length) return { fire: false, unverifiable: true };
  for (const x of a) for (const y of b) {
    if (x.position === 'day' && y.position === 'day') { if (dayRel.length) return { fire: false }; continue; }
    if (y.position === 'day' && frame.a_hits_b.some((h) => h.from.position === x.position)) return { fire: false };
    if (x.position === 'day' && frame.b_hits_a.some((h) => h.from.position === y.position)) return { fire: false };
  }
  return { fire: true, why: `no engine relation between [${a.map((r) => r.text)}] and [${b.map((r) => r.text)}]` };
}

// CONTROL FIRST: the instrument must fire on calibrate-j1's seed-S2, planted on its
// own chart (A 1989-09-13 09:00: day 子, year 巳, one relation 半合 over
// year+hour+month, none touching the day), or its zero counts mean nothing.
const s2Chart = buildSemanticJson(calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00', gender: 'female' }));
const control = verdict('Cabang di Pilar Dirimu juga berbenturan dengan cabang di Pilar Akarmu.', s2Chart);
const truthful = verdict('Pilar Akarmu, Pilar Arahmu dan Pilar Kerjamu membentuk Setengah Gabungan.', s2Chart);
console.log(`control seed-S2: ${control?.fire ? 'FIRES' : 'DOES NOT FIRE'}; true relation sentence: ${truthful?.fire ? 'FIRES (false positive)' : 'passes'}`);
if (!control?.fire || truthful?.fire) { process.exitCode = 1; }

const rows = [];
let read = 0;
for (const dir of DIRS) {
  const abs = path.join(DATA, dir);
  for (const file of fs.readdirSync(abs).filter((f) => /-v[12]\.json$/u.test(f)).sort()) {
    const rec = JSON.parse(fs.readFileSync(path.join(abs, file), 'utf8'));
    const ca = calculateBaziChart(rec.inputs.a);
    const sj = rec.kind === 'pair' ? buildPairSemantic(ca, calculateBaziChart(rec.inputs.b)) : buildSemanticJson(ca);
    const texts = [...(rec.drafts || []), ...(rec.rendered ? [rec.rendered] : [])];
    texts.forEach((t, n) => {
      for (const block of t.blocks || []) {
        for (const s of sentences(block.text)) {
          const v = verdict(s, sj);
          if (!v) continue;
          read += 1;
          rows.push({ key: `${dir}/${file}#${n + 1}`, kind: rec.kind, voice: rec.voice, sentence: s, ...v });
        }
      }
    });
  }
}
const fires = rows.filter((r) => r.fire);
console.log(`${read} relation sentences naming pillars; ${fires.length} would fire; ${rows.filter((r) => r.unverifiable).length} unverifiable`);
for (const k of ['pair', 'mirror']) {
  const all = rows.filter((r) => r.kind === k);
  console.log(`  ${k}: ${all.length} read, ${all.filter((r) => r.fire).length} fire`);
}
for (const r of fires) console.log(`FIRE [${r.kind} ${r.voice}] ${r.key}\n  ${r.sentence}\n  -> ${r.why}`);
