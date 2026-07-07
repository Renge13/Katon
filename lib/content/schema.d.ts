// Authoring contract for every Katon content cell.
// Keyed content[archetype(stem)][state][domain]. This file is for editor/authoring
// support ONLY — Next never compiles or bundles it. A content file opts in with one
// JSDoc line: /** @type {import('./schema').Archetype} */
//
// Beat HEADINGS are NOT in content — they live in lib/content/index.js as the locked
// BEAT_HEADINGS constant so all cells stay identical and the paywall accordion can be
// asserted against them.

export type Stem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';
export type State = 'balanced' | 'amplified' | 'governed' | 'overfueled' | 'depleted';
export type Domain = 'hubungan' | 'karier' | 'uang';
export type Element = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';

export interface Archetype {
  stem: Stem;
  archetypeName: string;        // e.g. "MATAHARI" (rendered uppercase)
  dayMasterChinese: Stem;       // e.g. "丙"
  dayMasterElement: Element;
  /** MVP fills balanced (+ amplified later). A missing state falls back to balanced. */
  states: Partial<Record<State, StateCell>>;
}

export interface StateCell {
  /** STATE-level, domain-independent, FREE. */
  card: {
    modifier: string;           // state image suffix, e.g. "yang Teduh" / "di Balik Awan". REQUIRED.
    dimension: string;          // Surface→Turn paragraph (flatters, withholds the ache)
    feed: string[];             // archetype NAMES that feed this state, e.g. ['Jati','Akar']
    drain: string[];            // archetype NAMES that drain this state, e.g. ['Samudra','Hujan']
  };
  river: { siapaKamu: string; kenapaBegini: string };
  domains: Partial<Record<Domain, DomainCell>>;
}

export interface DomainCell {
  river: { keMana: string };    // FREE: symptom + open loop; WITHHOLDS the driver
  bridge: string[];             // FREE: quoted inner voice, 1–3 sub-options (spike renders [0])
  paywallTeaser: {              // FREE: 1–2 line lead + exactly 3 accordion pairs
    lead: string;
    accordion: { title: string; helper: string }[];   // titles MUST equal BEAT_HEADINGS 3, 4, 6
  };
  ocean: Ocean;                 // PAID — server-only, never client-bundled
  closer: string;               // PAID — "ini bukan ramalan" + upsell loop
}

export interface Ocean {        // 7 beats. NO BaZi numbers anywhere (beat5 is a frame).
  beat1: string;                                       // Yang Perlu Kamu Dengar Dulu
  beat2: { intro: string; scenes: string[] };          // Bagaimana Ini Muncul (3–4 scenes)
  beat3: { body: string; pull: string };               // Yang Sebenarnya Terjadi (reframe + highlighted realization)
  beat4: { drain: string; feed: string; sign: string };// Yang Menenangkan vs Yang Melelahkan (names must match card)
  beat5: { explanation: string; hourNote: string };    // Empat Pilarmu — FRAME ONLY; bars/pillars/date injected by calc
  beat6: { lead: string; rule: string; body: string }; // Cara Memutuskannya (rule = highlighted one-liner)
  beat7: string;                                       // Apa Artinya
}
