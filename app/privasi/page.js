import StaticPage, { Bullets, H2, P } from '@/components/StaticPage.jsx';
import { SITE_COPY } from '@/lib/site/copy';
import { ENTITY } from '@/lib/site/entity';

// /privasi — the privacy policy.
//
// Every factual claim in the copy bank was checked against the code on
// 2026-08-03; the checks are recorded next to the strings in lib/site/copy.js so
// the next person can re-run them instead of trusting this comment.
//
// The page deliberately does NOT claim we avoid storing birth data. We store it,
// the caching section says so, and the reader is told what to do about it. An
// overpromise here is a legal exposure, not a nicety.

const q = SITE_COPY.privasi;

export const metadata = {
  title: 'Privasi · KATON',
  description:
    'Apa yang Katon simpan, untuk apa, siapa yang ikut memproses, dan bagaimana kamu meminta datamu dihapus.',
};

export default function PrivasiPage() {
  return (
    <StaticPage title={q.title} lead={q.lead}>
      <P style={{ fontSize: 13, color: 'var(--muted-warm)' }}>{q.updated}</P>

      <H2>{q.collectHeading}</H2>
      <Bullets items={q.collect} />
      <P>{q.collectNote}</P>

      <H2>{q.purposeHeading}</H2>
      <Bullets items={q.purpose} />

      <H2>{q.cacheHeading}</H2>
      {q.cache.map((text) => (
        <P key={text.slice(0, 24)}>{text}</P>
      ))}

      <H2>{q.processorHeading}</H2>
      <P>{q.processorLead}</P>
      <Bullets items={q.processors} />
      <P>{q.processorNote}</P>

      <H2>{q.retentionHeading}</H2>
      <Bullets items={q.retention} />

      <H2>{q.rightsHeading}</H2>
      <P>{q.rightsLead}</P>
      <Bullets items={q.rights} />
      <P>
        {q.rightsHowBefore}{' '}
        <a href={`mailto:${ENTITY.email}`} style={{ color: 'var(--clay)' }}>
          {ENTITY.email}
        </a>
        {q.rightsHowAfter}
      </P>

      <H2>{q.changesHeading}</H2>
      <P>{q.changes}</P>
      <P style={{ fontSize: 13, color: 'var(--muted-warm)' }}>
        {SITE_COPY.footer.operatorLabel} {ENTITY.name}. {ENTITY.address}.
      </P>
    </StaticPage>
  );
}
