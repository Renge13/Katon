// ============================================================
// The rendered reading's prose, one renderer
// ============================================================
// Extracted from `components/Funnel.jsx#Reading` on 2026-09-08, when the compat
// report needed the same blocks. NOT FORKED, deliberately: the reveal cadence is
// a ruled behaviour (`proseDelayMs`, and the running index that made it read as
// one sequence down the page rather than nine paragraphs starting at once), and
// a second copy of it is a second place that ruling can rot.
//
// ── WHAT THE COMPAT REPORT ADDS, AND WHY IT IS A PROP ──────
// Two of its blocks carry a glossary NAME - the P4 pattern badge and the P5
// quadrant - shown as an eyebrow'd label above the block. The names are the
// glossary's (`kompatibilitas.p4_*.name_id`, `p5_q*.name_id`) and never strings
// in a copy bank. `labelFor` is how the caller supplies them; the mirror passes
// nothing and renders exactly as it did.
// ============================================================

import { useMemo } from 'react';
import { Reveal, Eyebrow } from './kit.jsx';
import { splitParagraphs } from '../lib/render/paragraphs.js';

/**
 * The reveal cadence, MOVED HERE UNCHANGED with the renderer it governs.
 *
 * `Funnel.jsx` re-exports all four, because existing specs import them from
 * there and none of their values or behaviour has moved. A first draft of this
 * extraction RE-WROTE `proseDelayMs` from memory as a fixed per-item step, which
 * is precisely the shape the budget below exists to replace - caught by reading
 * the original instead of trusting the reconstruction.
 */
export const PROSE_FADE_MS = 450; //          one paragraph's own fade
export const PROSE_REVEAL_BUDGET_MS = 1200; // first start -> last end, ALWAYS
export const PROSE_STEP_MAX_MS = 90; //       the step a short reading gets to use

export function proseDelayMs(i, total) {
  if (total <= 1) return 0;
  const room = PROSE_REVEAL_BUDGET_MS - PROSE_FADE_MS;
  return i * Math.min(PROSE_STEP_MAX_MS, room / (total - 1));
}

function Para({ children, style }) {
  return <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15.5, lineHeight: 1.75, color: 'var(--tinta-soft)', margin: 0, ...style }}>{children}</p>;
}

function Section({ eyebrow, children, style }) {
  return (
    <div style={{ marginTop: 40, paddingTop: 34, borderTop: '1px solid var(--divider)', ...style }}>
      {eyebrow && <Reveal><Eyebrow style={{ marginBottom: 16 }}>{eyebrow}</Eyebrow></Reveal>}
      {children}
    </div>
  );
}

/**
 * A block's paragraphs, however the caller shaped it.
 *
 * ── THIS IS THE BLANK-REPORT FIX, 2026-09-08 ───────────────
 * **A paying customer received six headings and no prose.** This component read
 * `block.paragraphs`; the render contract (`lib/render/schema.js`) is
 * `{fact_ids, heading, text}`, and `lib/pair/serveReading.js` sends exactly
 * that. The MIRROR happens to work because `lib/mirror/view.js:206` runs
 * `splitParagraphs` on its way out - so the adapter existed, on one of the two
 * paths, and the component believed every caller had already applied it.
 *
 * THE ADAPTER MOVES HERE rather than being copied in front of the second caller,
 * which is the choice the prompt asked for and the right one: a second copy is a
 * second thing to forget on the third caller. `paragraphs` is still honoured
 * when present, so the mirror's payload - which carries no `text` at all - is
 * untouched and its floor-rate fixtures cannot move.
 */
function paragraphsOf(block) {
  if (Array.isArray(block.paragraphs)) return block.paragraphs;
  return splitParagraphs(block.text || '');
}

/**
 * @param {Object} reading   `{ blocks, penutup }` as the serve payload carries it
 * @param {Function} [labelFor] block => ({ eyebrow, name }) | null. The block's
 *   two-level heading: a chrome SECTION label over a glossary name. The compat
 *   report supplies one per block; the mirror passes nothing.
 * @param {boolean} [modelHeadings] render `block.heading` (the MODEL's words).
 *
 * ── WHY `modelHeadings` IS A PROP AND NOT A DELETION ───────
 * Y-2 Addendum 2 item 2: the compat report carries NO model-written heading
 * anywhere - every block is a ruled section label over an engine name, because
 * the model titling a block after the badge produced `Pola Kontras` three times
 * in three lines (eyebrow, glossary name, and the model's own heading). Rule 14
 * says the engine owns structure, so the heading is not the model's to choose.
 *
 * The MIRROR still renders its own headings and is untouched here: Y-2 commit 4
 * is explicit that nothing structural changes in the funnel, and its blocks have
 * no glossary name to put in a heading's place. So this is a per-caller switch
 * rather than a removal, and the default is the mirror's existing behaviour.
 */
export function ProseBlocks({ reading, labelFor = null, modelHeadings = true }) {
  // The reveal's running index, computed once per render rather than by mutating
  // a counter inside the JSX. `offsets[i]` is how many paragraphs precede block
  // `i` DOWN THE PAGE, so a block-local `j` still keys the map while the delay
  // comes from the global position - the index used to be block-local and reset
  // at every heading, which started nine first paragraphs simultaneously.
  // `penutup` is one more item at the end.
  const { offsets, total } = useMemo(() => {
    const out = [];
    let n = 0;
    for (const b of (reading.blocks || [])) { out.push(n); n += paragraphsOf(b).length; }
    return { offsets: out, total: n + (reading.penutup ? 1 : 0) };
  }, [reading.blocks, reading.penutup]);

  return (
    <>
      {(reading.blocks || []).map((b, i) => {
        const label = labelFor ? labelFor(b) : null;
        return (
          <Section
            key={i}
            eyebrow={(modelHeadings && b.heading) || undefined}
            style={i === 0 ? { marginTop: 34 } : undefined}
          >
            {label && (label.eyebrow || label.name) && (
              <Reveal>
                <div style={{ marginBottom: 14 }}>
                  {label.eyebrow && <Eyebrow style={{ marginBottom: 4 }}>{label.eyebrow}</Eyebrow>}
                  {/* The big serif line is the GLOSSARY's name for this block's
                      primary fact. Absent when the cell has none (p0, p7), and
                      absent means nothing renders - never the key, never the
                      model's heading standing in for it. */}
                  {label.name && (
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1.2, color: 'var(--tinta)' }}>{label.name}</div>
                  )}
                </div>
              </Reveal>
            )}
            {paragraphsOf(b).map((p, j) => (
              <div key={j} className="k-prose" style={{ animationDelay: `${proseDelayMs(offsets[i] + j, total)}ms` }}>
                <Para style={{ marginTop: j ? 14 : 0 }}>{p}</Para>
              </div>
            ))}
          </Section>
        );
      })}
      {reading.penutup && (
        <div className="k-prose" style={{ animationDelay: `${proseDelayMs(total - 1, total)}ms`, marginTop: 34 }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.6, color: 'var(--kayu)', margin: 0 }}>{reading.penutup}</p>
        </div>
      )}
    </>
  );
}
