import StaticPage, { H2, P } from '@/components/StaticPage.jsx';
import { SITE_COPY } from '@/lib/site/copy';
import { ENTITY } from '@/lib/site/entity';

// /tentang — the business description Xendit's review asks for.
//
// Four short paragraphs, written so a reviewer who will never enter a birthdate
// understands the business in about 30 seconds: what it is, who it serves, the
// three steps, and who receives the money. The fourth is the one they are looking
// for, so it names the entity and the payment processor plainly.
//
// The entity name and the contact email are composed in from lib/site/entity.js
// rather than written into the prose, so there is exactly one copy of the
// NIB-matched string in the repo.

const q = SITE_COPY.tentang;

export const metadata = q.meta;

export default function TentangPage() {
  return (
    <StaticPage title={q.title} lead={q.lead}>
      {q.paragraphs.map((text) => (
        <P key={text.slice(0, 24)}>{text}</P>
      ))}

      <H2>{q.operatorHeading}</H2>
      <P>
        {q.operatorBefore}{' '}
        <strong style={{ fontWeight: 600, color: 'var(--tinta)' }}>{ENTITY.name}</strong>
        {q.operatorAfter}{' '}
        <a href={`mailto:${ENTITY.email}`} style={{ color: 'var(--clay)' }}>
          {ENTITY.email}
        </a>
        .
      </P>

      {/* Contact block. Serves the "address, and contact number" line in Xendit's
          second rejection (2026-08-05), which their first set of criteria did not
          ask for. Deliberately NOT in the footer - see lib/site/entity.js. The id
          is the anchor the footer's Kontak link points at. Plain <dl>, so all three
          values are in the HTML document without JS, same as every other page here. */}
      <H2 id="kontak">{q.kontakHeading}</H2>
      <P>{q.kontakLead}</P>
      <dl
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          lineHeight: 1.75,
          color: 'var(--tinta-soft)',
          margin: 0,
        }}
      >
        <dt style={{ fontWeight: 600, color: 'var(--tinta)' }}>{q.kontakWhatsappLabel}</dt>
        <dd style={{ margin: '0 0 12px' }}>
          <a
            href={`https://wa.me/${ENTITY.whatsappE164}`}
            style={{ color: 'var(--clay)' }}
          >
            {ENTITY.whatsapp}
          </a>
        </dd>

        <dt style={{ fontWeight: 600, color: 'var(--tinta)' }}>{q.kontakEmailLabel}</dt>
        <dd style={{ margin: '0 0 12px' }}>
          <a href={`mailto:${ENTITY.email}`} style={{ color: 'var(--clay)' }}>
            {ENTITY.email}
          </a>
        </dd>

        <dt style={{ fontWeight: 600, color: 'var(--tinta)' }}>{q.kontakAddressLabel}</dt>
        <dd style={{ margin: 0 }}>{ENTITY.address}</dd>
      </dl>
    </StaticPage>
  );
}
