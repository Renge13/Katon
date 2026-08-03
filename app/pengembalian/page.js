import StaticPage, { Bullets, H2, P } from '@/components/StaticPage.jsx';
import { SITE_COPY } from '@/lib/site/copy';
import { ENTITY } from '@/lib/site/entity';

// /pengembalian — the refund policy.
//
// Terms confirmed by Reyner 2026-08-03: claim within 7 days of payment, reply
// within 3 hari kerja. The window lives in the bank as `claimWindowDays`, once.
//
// Scope is delivery and defect, never dissatisfaction with the reading. That
// boundary is stated on the page rather than left implicit, and it is paired with
// a remedy that costs us little and helps the buyer more than money back: a wrong
// birth date gets recomputed.

const q = SITE_COPY.pengembalian;

// The claim window is stated twice on the page and lives once in the bank. Filling
// the placeholder here is what keeps the deadline to file and the cutoff that makes
// a working product non-refundable from ever disagreeing.
const days = (s) => s.replaceAll('{claimDays}', String(q.claimWindowDays));

export const metadata = q.meta;

export default function PengembalianPage() {
  return (
    <StaticPage title={q.title} lead={q.lead}>
      <P style={{ fontSize: 13, color: 'var(--muted-warm)' }}>{q.updated}</P>

      <H2>{q.freeHeading}</H2>
      <P>{q.free}</P>

      <H2>{q.eligibleHeading}</H2>
      <P>{q.eligibleLead}</P>
      <Bullets items={q.eligible} />
      <P>{q.eligibleNote}</P>

      <H2>{q.notEligibleHeading}</H2>
      <Bullets items={q.notEligible.map(days)} />

      <H2>{q.howHeading}</H2>
      <P>{days(q.howLead)}</P>
      <Bullets items={q.how} />
      <P>
        {q.contactBefore}{' '}
        <a href={`mailto:${ENTITY.email}`} style={{ color: 'var(--clay)' }}>
          {ENTITY.email}
        </a>
        {q.contactAfter}
      </P>

      <H2>{q.replyHeading}</H2>
      {q.reply.map((text) => (
        <P key={text.slice(0, 24)}>{text}</P>
      ))}
      {/* No entity block here. The site footer renders directly below with the
          same name and address. */}
    </StaticPage>
  );
}
