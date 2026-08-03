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
// Delivery is described the way the code actually works: the paid product is
// available at the reading link and the link goes to the WhatsApp number captured
// at checkout (`wa_number`, app/api/pay/[id]/route.js), because that is the only
// address Katon holds - there is no account and no email capture.

const q = SITE_COPY.syarat;

export const metadata = {
  title: 'Syarat Layanan · KATON',
  description:
    'Syarat pemakaian Katon: layanan konten digital, batas layanan, produk berbayar, dan hukum yang berlaku.',
};

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
      <P style={{ fontSize: 13, color: 'var(--muted-warm)' }}>
        {SITE_COPY.footer.operatorLabel} {ENTITY.name}. {ENTITY.address}.
      </P>
    </StaticPage>
  );
}
