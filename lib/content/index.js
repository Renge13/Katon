import 'server-only';
// SERVER ONLY — re-exports paid content ('ocean'/'closer') and must never be imported
// by a Client Component. The 'server-only' guard fails a client import at build time,
// keeping paid copy out of the browser bundle (locked decision #5).

import { jati } from './jati.js';
import { akar } from './akar.js';
import { matahari } from './matahari.js';
import { pelita } from './pelita.js';
import { gunung } from './gunung.js';
import { ladang } from './ladang.js';
import { pedang } from './pedang.js';
import { permata } from './permata.js';
import { samudra } from './samudra.js';
import { hujan } from './hujan.js';
import { BEAT_HEADINGS } from './shared.js';

// Registry keyed by Day Master stem. Adding an archetype = add its file + a line.
const REGISTRY = {
  '甲': jati,
  '乙': akar,
  '丙': matahari,
  '丁': pelita,
  '戊': gunung,
  '己': ladang,
  '庚': pedang,
  '辛': permata,
  '壬': samudra,
  '癸': hujan,
};

// Re-export the locked headings so existing importers keep working.
export { BEAT_HEADINGS };

export function getArchetype(stem) {
  return REGISTRY[stem] || null;
}

export function hasArchetype(stem) {
  return Boolean(REGISTRY[stem]);
}

/**
 * Resolve the state cell with Balanced fallback. Path is content[stem][state][domain];
 * an unwritten state MISSES and falls back to the archetype's 'balanced' cell.
 * @returns {{ a, cell, requested: string, served: string } | null}
 */
function resolveCell(stem, state) {
  const a = getArchetype(stem);
  if (!a) return null;
  const requested = state || 'balanced';
  let served = requested;
  let cell = a.states?.[requested];
  if (!cell) {
    served = 'balanced';
    cell = a.states?.balanced;
  }
  if (!cell) return null;
  if (served !== requested) {
    console.info(`[content] state miss: requested=${requested} served=${served} stem=${stem}`);
  }
  return { a, cell, requested, served };
}

/**
 * Client-SAFE free content for a reading. Contains NO paid copy.
 */
export function getFreeContent(stem, state, domain) {
  const r = resolveCell(stem, state);
  if (!r) return null;
  const { a, cell, served } = r;
  const dc = domain ? cell.domains?.[domain] : null;
  return {
    dayMasterChinese: a.dayMasterChinese,
    dayMasterElement: a.dayMasterElement,
    archetypeName: a.archetypeName,
    card: cell.card,
    river: cell.river,
    keMana: dc?.river?.keMana ?? null,
    bridge: dc?.bridge ?? null,
    servedState: served,
  };
}

/**
 * The paywall teaser: a 1-2 line lead + the 3 accordion title/helper pairs. Client-SAFE.
 */
export function getTeaser(stem, state, domain) {
  const r = resolveCell(stem, state);
  if (!r || !domain) return null;
  const dc = r.cell.domains?.[domain];
  return dc?.paywallTeaser ?? null;
}

/**
 * Full paid domain content. SERVER-ONLY and GATED: called ONLY after row.paid === true.
 */
export function getPaidDomain(stem, state, domain) {
  const r = resolveCell(stem, state);
  if (!r || !domain) return null;
  const dc = r.cell.domains?.[domain];
  if (!dc) return null;
  if (process.env.NODE_ENV !== 'production') assertFeedDrainAgree(r.cell.card, dc.ocean, stem, domain);
  return { ...dc.ocean, closer: dc.closer };
}

// Dev-only: the card's feed/drain archetype NAMES must appear in beat4's prose.
function assertFeedDrainAgree(card, ocean, stem, domain) {
  if (!card || !ocean) return;
  const b4 = ocean.beat4;
  if (!b4) return;
  for (const name of card.feed || []) {
    if (b4.feed && !b4.feed.includes(name)) {
      console.warn(`[content] feed mismatch: card lists "${name}" but beat4.feed omits it (${stem}/${domain})`);
    }
  }
  for (const name of card.drain || []) {
    if (b4.drain && !b4.drain.includes(name)) {
      console.warn(`[content] drain mismatch: card lists "${name}" but beat4.drain omits it (${stem}/${domain})`);
    }
  }
}
