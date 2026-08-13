import StaticPage, { Bullets, H2, P } from '@/components/StaticPage.jsx';
import { SITE_COPY } from '@/lib/site/copy';
import { ENTITY } from '@/lib/site/entity';

// /syarat — terms of service.
//
// The clause that matters commercially is "Batas layanan": rule 25 written as a
// user-facing disclaimer. A payment reviewer decides a merchant's category from
// exactly that paragraph, so it is stated plainly and early rather than buried at
// the bottom in small print.
//
// Delivery is described the way the code actually works: the paid product unlocks
// in place, at the reading link, and the link is the only address Katon holds -
// there is no account and, as of 2026-08-13, no WhatsApp capture at checkout
// either. The clause used to promise a WhatsApp send; nothing behind
// app/api/pay/[id]/route.js could keep it, so both the field and the promise went.

const q = SITE_COPY.syarat;

export const metadata = q.meta;

export default function SyaratPage() {
  return (
    <StaticPage title={q.title} lead={q.lead}>
      <P style={{ fontSize: 13, color: 'var(--muted-warm)' }}>{q.updated}</P>

      <H2>{q.serviceHeading}</H2>
      <P>
        {q.serviceBefore}{' '}
        <strong style={{ fontWeight: 600, color: 'var(--tinta)' }}>{ENTITY.name}</strong>
        {q.serviceAfter}
      </P>

      <H2>{q.freeHeading}</H2>
      <P>{q.free}</P>

      <H2>{q.paidHeading}</H2>
      {q.paid.map((text) => (
        <P key={text.slice(0, 24)}>{text}</P>
      ))}

      <H2>{q.limitsHeading}</H2>
      {q.limits.map((text) => (
        <P key={text.slice(0, 24)}>{text}</P>
      ))}

      <H2>{q.conductHeading}</H2>
      <Bullets items={q.conduct} />
      <P>{q.conductNote}</P>

      <H2>{q.liabilityHeading}</H2>
      <P>{q.liability}</P>

      <H2>{q.lawHeading}</H2>
      <P>
        {q.lawBefore}{' '}
        <a href={`mailto:${ENTITY.email}`} style={{ color: 'var(--clay)' }}>
          {ENTITY.email}
        </a>
        {q.lawAfter}
      </P>
      {/* No entity block here. The site footer renders directly below with the
          same name and address; the entity is already named in "Tentang layanan
          ini" at the top, where a terms page is supposed to name it. */}
    </StaticPage>
  );
}
