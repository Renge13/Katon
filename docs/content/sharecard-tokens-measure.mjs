// Derivation analysis for the archetype colour tokens.
// Reads the 5 FIXED triples out of docs/content/sharecard-mockups-02.html and measures them,
// then measures 5 candidates against the same rule. OKLCh + WCAG contrast.
//
// MOVED INTO THE REPO 2026-08-13 from a Claude scratchpad, together with the proposal it produced,
// `sharecard-tokens-proposal.html` in this directory. Every number on that page came out of this
// file, so the two are useless apart.
//
//   node docs/content/sharecard-tokens-measure.mjs
//   node docs/content/sharecard-tokens-measure.mjs '{"Name":{"f":"#RRGGBB","i":"#RRGGBB","a":"#RRGGBB"}}'
//
// The second form measures a candidate triple against the same rule as the locked five, which is
// what a colour-token decision needs: field hue = element family, ink = field hue with chroma
// collapsed, accent = field hue between the two. The floors it must clear are the locked set's own
// (ink contrast 3.04, accent 2.22, closest field pair dE 0.09), not an abstract WCAG target.

const FIXED = {
  'Matahari / The Sun':   { f: '#FF4F12', i: '#FFF4EC', a: '#FFC9A8' },
  'Samudra / The Ocean':  { f: '#0E3A5C', i: '#EAF3F9', a: '#7FB6D9' },
  'Permata / The Jewel':  { f: '#EDEAE4', i: '#1C1A17', a: '#8A7B5C' },
  'Bambu / The Bamboo':   { f: '#1F7A43', i: '#EFF8EF', a: '#A8DBB4' },
  'Besi Tempa / The Forge':{ f: '#26282D', i: '#E8E9EC', a: '#9BA1AD' },
};

const CAND = process.argv[2] ? JSON.parse(process.argv[2]) : {};

const hex2rgb = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255);
const lin = c => c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4;
const lum = h => { const [r,g,b] = hex2rgb(h).map(lin); return 0.2126*r+0.7152*g+0.0722*b; };
const contrast = (x,y) => { const a=lum(x),b=lum(y); return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05); };

function oklch(h) {
  const [r,g,b] = hex2rgb(h).map(lin);
  const l = Math.cbrt(0.4122214708*r + 0.5363325363*g + 0.0514459929*b);
  const m = Math.cbrt(0.2119034982*r + 0.6806995451*g + 0.1073969566*b);
  const s = Math.cbrt(0.0883024619*r + 0.2817188376*g + 0.6299787005*b);
  const L = 0.2104542553*l + 0.7936177850*m - 0.0040720468*s;
  const A = 1.9779984951*l - 2.4285922050*m + 0.4505937099*s;
  const B = 0.0259040371*l + 0.7827717662*m - 0.8086757660*s;
  const C = Math.hypot(A,B);
  let H = Math.atan2(B,A) * 180/Math.PI; if (H < 0) H += 360;
  return { L, C, H };
}

const f2 = n => n.toFixed(2);
const row = (name, t) => {
  const F = oklch(t.f), I = oklch(t.i), A = oklch(t.a);
  return {
    name,
    field: t.f, 'F L': f2(F.L), 'F C': f2(F.C), 'F H': Math.round(F.H),
    ink: t.i, 'I L': f2(I.L), 'I C': f2(I.C), 'I H': Math.round(I.H),
    'ink/field': f2(contrast(t.i,t.f)),
    accent: t.a, 'A L': f2(A.L), 'A C': f2(A.C), 'A H': Math.round(A.H),
    'acc/field': f2(contrast(t.a,t.f)),
    'dH i-f': Math.round(Math.min(Math.abs(I.H-F.H), 360-Math.abs(I.H-F.H))),
    'dH a-f': Math.round(Math.min(Math.abs(A.H-F.H), 360-Math.abs(A.H-F.H))),
  };
};

const all = { ...FIXED, ...CAND };
console.log('=== PER-TOKEN MEASUREMENT ===');
console.table(Object.entries(all).map(([k,v]) => row(k,v)));

// field-vs-field separation: how distinguishable are the 10 colour fields as a set
console.log('=== FIELD SEPARATION (OKLab dE, and dL / dH components) ===');
const keys = Object.keys(all);
const pairs = [];
for (let i=0;i<keys.length;i++) for (let j=i+1;j<keys.length;j++) {
  const A = oklch(all[keys[i]].f), B = oklch(all[keys[j]].f);
  const dL = Math.abs(A.L-B.L), dC = Math.abs(A.C-B.C);
  let dH = Math.abs(A.H-B.H); if (dH>180) dH = 360-dH;
  // OKLab dE via polar -> cartesian
  const ax=A.C*Math.cos(A.H*Math.PI/180), ay=A.C*Math.sin(A.H*Math.PI/180);
  const bx=B.C*Math.cos(B.H*Math.PI/180), by=B.C*Math.sin(B.H*Math.PI/180);
  const dE = Math.hypot(A.L-B.L, ax-bx, ay-by);
  pairs.push({ pair: `${keys[i].split(' /')[0]} vs ${keys[j].split(' /')[0]}`, dE: f2(dE), dL: f2(dL), dC: f2(dC), dH: Math.round(dH) });
}
pairs.sort((x,y)=>x.dE-y.dE);
console.table(pairs);
