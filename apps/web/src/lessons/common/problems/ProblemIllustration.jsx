import ItemFigure from '../manipulations/primitives/ItemFigure';
import { GENERIC_SCENES } from './situationDrawings';

/**
 * ProblemIllustration — l'ILLUSTRATION d'un énoncé de مسألة (`problem.illustration`, 2026-10-13) : le dessin
 * de la fiche « رياضيات ببساطة » (une pile de livres avec son étiquette, des bouquets, un champ clôturé, une
 * terre plantée d'arbres, une plaque de verre découpée, une salle carrelée), REDESSINÉ en SVG — jamais une image
 * générée ni une capture (CLAUDE.md « Images — where they may and may not be generated »).
 *
 * Elle illustre la SITUATION, jamais la solution : les cotes sont celles de l'énoncé, et le découpage de la
 * plaque / du carrelage est un quadrillage générique marqué « ؟ » (le vrai nombre de carreaux est la réponse).
 * Mots arabes = texte SVG vivant, chiffres = îlots LTR séparés ; direction LTR sur le SVG (piège RTL des SVG).
 *
 *   { kind: 'books',    notebooks: 3090, books: 1854, ariaLabel }
 *   { kind: 'bouquets', white: 161, red: 133, ariaLabel }
 *   { kind: 'field',    length: 612, width: 174, unit: 'م', ariaLabel }
 *   { kind: 'orchard',  sides: [183, 135, 99], unit: 'م', ariaLabel }       // base, côté gauche, côté droit
 *   { kind: 'glass',    length: '2.20', width: '1.40', unit: 'م', ariaLabel }
 *   { kind: 'hall',     length: '8.4', width: '4.4', unit: 'م', ariaLabel }
 */
const NUM = { direction: 'ltr', unicodeBidi: 'isolate' };
const lerp = (a, b, t) => a + (b - a) * t;

/** Une étiquette numérique (pastille) : le nombre en LTR, un mot arabe facultatif au-dessus. */
function Tag({ x, y, value, w = 64, word }) {
  return (
    <g>
      {word && <text x={x} y={y - 22} textAnchor="middle" fontSize="13" fontWeight="700" fill="#334155">{word}</text>}
      <rect x={x - w / 2} y={y - 14} width={w} height="26" rx="13" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="15" fontWeight="800" fill="#1E3A8A" style={NUM}>{value}</text>
    </g>
  );
}

/** Une cote : un nombre sur fond blanc, avec son unité arabe à côté. */
function Dim({ x, y, value, unit, anchor = 'middle', rotate }) {
  return (
    <g transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>
      <rect x={x - 32} y={y - 12} width="64" height="22" rx="11" fill="#fff" fillOpacity="0.92" stroke="#475569" strokeWidth="1.2" />
      <text x={x} y={y + 4} textAnchor={anchor} fontSize="13" fontWeight="800" fill="#0F172A" style={NUM}>{value}<tspan fontSize="12" fontWeight="700" dx="4" style={{ direction: 'rtl' }}>{unit}</tspan></text>
    </g>
  );
}

/* ── 1. une pile de cahiers et une pile de livres ─────────────────────────── */
const COVERS = [['#2563EB', '#1E3A8A'], ['#0EA5E9', '#075985'], ['#10B981', '#047857'], ['#F59E0B', '#B45309'], ['#EF4444', '#991B1B']];
function Stack({ x, y, w, h, covers, word, kind }) {
  return (
    <g>
      {covers.map(([c, d], i) => {
        const yy = y - (i + 1) * h;
        const off = i % 2 === 0 ? 0 : 4;
        return (
          <g key={i} transform={`translate(${off} 0)`}>
            <rect x={x} y={yy} width={w} height={h - 1} rx="3" fill={c} stroke={d} strokeWidth="1.5" />
            <rect x={x + 6} y={yy + h - 5} width={w - 8} height="3" fill="#F8FAFC" />
            {kind === 'book' && <rect x={x + 3} y={yy} width="5" height={h - 1} fill={d} opacity="0.55" />}
          </g>
        );
      })}
      <text x={x + w / 2} y={y - covers.length * h + h - 7} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{word}</text>
    </g>
  );
}
function Books({ il }) {
  const nb = COVERS.slice(0, 5);
  const bk = [COVERS[4], COVERS[2], COVERS[3], COVERS[0]];
  return (
    <>
      <rect x="0" y="128" width="360" height="10" fill="#E2E8F0" />
      <Stack x={36} y={128} w={110} h={17} covers={nb} word="كراريس" kind="notebook" />
      <Stack x={214} y={128} w={100} h={22} covers={bk} word="كتب" kind="book" />
      <Tag x={91} y={162} value={il.notebooks} />
      <Tag x={264} y={162} value={il.books} />
    </>
  );
}

/* ── 2. deux bouquets de fleurs ──────────────────────────────────────────── */
function Bouquet({ cx, tone, count }) {
  const pos = [[-26, -4], [0, -14], [26, -4], [-13, 14], [13, 14], [0, -36]];
  return (
    <g>
      {pos.map(([dx, dy], i) => (
        <g key={i} transform={`translate(${cx + dx - 16} ${86 + dy - 16})`}><ItemFigure kind="flower" tone={tone} width={32} /></g>
      ))}
      <path d={`M${cx - 36} 84 L${cx + 36} 84 L${cx + 10} 140 L${cx - 10} 140 Z`} fill="#D6A35C" stroke="#92400E" strokeWidth="2" />
      <path d={`M${cx - 30} 94 L${cx + 30} 94`} stroke="#92400E" strokeWidth="1" opacity="0.5" />
      <path d={`M${cx - 10} 118 L${cx + 10} 118 L${cx + 22} 134 L${cx} 124 L${cx - 22} 134 Z`} fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
      <circle cx={cx} cy="118" r="5" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.5" />
      <Tag x={cx} y={168} value={count} w={58} />
    </g>
  );
}
function Bouquets({ il }) {
  return (
    <>
      <Bouquet cx={86} tone="b" count={il.white} />
      <Bouquet cx={186} tone="a" count={il.red} />
      <g transform="translate(262 42)">
        <g transform="translate(0 0)"><ItemFigure kind="flower" tone="b" width={34} /></g>
        <text x="40" y="14" fontSize="13" fontWeight="700" fill="#334155" style={NUM}>{il.white}</text>
        <text x="40" y="30" fontSize="12" fontWeight="700" fill="#475569">زهرة بيضاء</text>
        <g transform="translate(0 56)"><ItemFigure kind="flower" tone="a" width={34} /></g>
        <text x="40" y="70" fontSize="13" fontWeight="700" fill="#334155" style={NUM}>{il.red}</text>
        <text x="40" y="86" fontSize="12" fontWeight="700" fill="#475569">زهرة حمراء</text>
      </g>
    </>
  );
}

/* ── 3. un champ rectangulaire clôturé (vue en perspective) ──────────────── */
function Post({ x, y, s = 1 }) {
  return <rect x={x - 2 * s} y={y - 14 * s} width={4 * s} height={16 * s} rx="1" fill="#A16207" stroke="#713F12" strokeWidth="0.8" />;
}
function Field({ il }) {
  const bl = [70, 62], br = [300, 62], fr = [336, 142], fl = [24, 142];
  const along = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
  const back = along(bl, br, 9), right = along(br, fr, 3), front = along(fl, fr, 10), left = along(bl, fl, 3);
  return (
    <>
      <polygon points={`${bl} ${br} ${fr} ${fl}`} fill="#86C97A" stroke="#4D8F46" strokeWidth="2" />
      {[0.25, 0.5, 0.75].map((t) => <polyline key={t} points={`${lerp(bl[0], fl[0], t)},${lerp(bl[1], fl[1], t)} ${lerp(br[0], fr[0], t)},${lerp(br[1], fr[1], t)}`} stroke="#7AB86D" strokeWidth="6" opacity="0.55" fill="none" />)}
      {[back, left, right].map((edge, k) => <polyline key={k} points={edge.map((p) => `${p[0]},${p[1] - 8}`).join(' ')} stroke="#A16207" strokeWidth="3" fill="none" />)}
      {[back, left, right].map((edge, k) => <polyline key={`b${k}`} points={edge.map((p) => `${p[0]},${p[1] - 3}`).join(' ')} stroke="#A16207" strokeWidth="2.5" fill="none" />)}
      {[...back, ...left, ...right].map((p, i) => <Post key={i} x={p[0]} y={p[1]} s={0.8} />)}
      <polyline points={front.map((p) => `${p[0]},${p[1] - 10}`).join(' ')} stroke="#A16207" strokeWidth="3.5" fill="none" />
      <polyline points={front.map((p) => `${p[0]},${p[1] - 4}`).join(' ')} stroke="#A16207" strokeWidth="3" fill="none" />
      {front.map((p, i) => <Post key={`f${i}`} x={p[0]} y={p[1]} />)}
      <Dim x={180} y={176} value={il.length} unit={il.unit} />
      <Dim x={322} y={104} value={il.width} unit={il.unit} />
    </>
  );
}

/* ── 4. une terre triangulaire plantée d'arbres ──────────────────────────── */
function Tree({ x, y }) {
  return (
    <g>
      <rect x={x - 1.5} y={y - 6} width="3" height="8" fill="#92400E" />
      <circle cx={x} cy={y - 11} r="7.5" fill="#2F9E44" stroke="#1B6B2E" strokeWidth="1.2" />
    </g>
  );
}
function Orchard({ il }) {
  const A = [180, 34], B = [26, 150], C = [334, 150];
  const along = (a, b, n) => Array.from({ length: n }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
  const trees = [...along(B, C, 9), ...along(C, A, 6), ...along(A, B, 6)];
  return (
    <>
      <polygon points={`${A} ${B} ${C}`} fill="#9BD58B" stroke="#C2410C" strokeWidth="5" strokeLinejoin="round" opacity="0.95" />
      <polygon points={`${A} ${B} ${C}`} fill="none" stroke="#FDBA74" strokeWidth="1.5" strokeDasharray="2 5" />
      {trees.map((p, i) => <Tree key={i} x={p[0]} y={p[1] + 2} />)}
      <Dim x={180} y={178} value={il.sides[0]} unit={il.unit} />
      <Dim x={74} y={74} value={il.sides[1]} unit={il.unit} rotate={-42} />
      <Dim x={286} y={74} value={il.sides[2]} unit={il.unit} rotate={42} />
    </>
  );
}

/* ── 5. une plaque de verre découpée en carrés ───────────────────────────── */
function Glass({ il }) {
  return (
    <>
      <rect x="22" y="48" width="132" height="84" fill="#BAE6FD" fillOpacity="0.75" stroke="#0369A1" strokeWidth="3" />
      <path d="M34 124 L70 56 M52 128 L94 52" stroke="#fff" strokeWidth="5" opacity="0.55" />
      <Dim x={88} y={152} value={il.length} unit={il.unit} />
      <Dim x={18} y={90} value={il.width} unit={il.unit} rotate={-90} />
      <path d="M168 90 L214 90 M204 80 L216 90 L204 100" stroke="#0F766E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, c) => (
        <rect key={`${r}-${c}`} x={228 + c * 26} y={48 + r * 26} width="26" height="26" fill="#E0F2FE" stroke="#0369A1" strokeWidth="2" />
      )))}
      <text x={293} y={160} textAnchor="middle" fontSize="20" fontWeight="800" fill="#0F766E">؟</text>
    </>
  );
}

/* ── 6. une salle carrelée avec canapé et plante ─────────────────────────── */
function Hall({ il }) {
  const bl = [92, 62], br = [292, 62], fr = [344, 150], fl = [36, 150];
  const pt = (u, v) => [lerp(lerp(bl[0], br[0], u), lerp(fl[0], fr[0], u), v), lerp(lerp(bl[1], br[1], u), lerp(fl[1], fr[1], u), v)];
  const cols = 8, rows = 5;
  return (
    <>
      <rect x="40" y="14" width="296" height="48" fill="#F1F5F9" stroke="#CBD5E1" />
      <rect x="150" y="22" width="90" height="32" fill="#BAE6FD" stroke="#64748B" strokeWidth="2" />
      <path d="M195 22 V54" stroke="#64748B" strokeWidth="2" />
      <rect x="56" y="34" width="62" height="28" rx="6" fill="#B45309" stroke="#78350F" strokeWidth="2" />
      <rect x="62" y="26" width="50" height="14" rx="5" fill="#C2680F" stroke="#78350F" strokeWidth="2" />
      <rect x="276" y="40" width="12" height="22" fill="#B45309" />
      <ellipse cx="282" cy="32" rx="14" ry="12" fill="#2F9E44" stroke="#1B6B2E" strokeWidth="1.5" />
      <polygon points={`${bl} ${br} ${fr} ${fl}`} fill="#7DD3FC" stroke="#0369A1" strokeWidth="3" />
      {Array.from({ length: cols - 1 }, (_, i) => { const a = pt((i + 1) / cols, 0), b = pt((i + 1) / cols, 1); return <line key={`c${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#fff" strokeWidth="2" />; })}
      {Array.from({ length: rows - 1 }, (_, i) => { const a = pt(0, (i + 1) / rows), b = pt(1, (i + 1) / rows); return <line key={`r${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#fff" strokeWidth="2" />; })}
      <Dim x={190} y={176} value={il.length} unit={il.unit} />
      <Dim x={322} y={112} value={il.width} unit={il.unit} />
      <text x={190} y={112} textAnchor="middle" fontSize="20" fontWeight="800" fill="#0369A1" opacity="0.8">؟</text>
    </>
  );
}

const SCENES = { books: Books, bouquets: Bouquets, field: Field, orchard: Orchard, glass: Glass, hall: Hall, ...GENERIC_SCENES };

export default function ProblemIllustration({ illustration }) {
  const Scene = SCENES[illustration.kind];
  if (!Scene) return null;
  return (
    <figure className="mx-auto my-2 block w-full max-w-md rounded-xl border border-slate-200 bg-white p-2" data-problem-illustration={illustration.kind}>
      <svg viewBox="0 0 360 200" className="block h-auto w-full" style={{ direction: 'ltr' }} role="img" aria-label={illustration.ariaLabel}>
        <Scene il={illustration} />
      </svg>
    </figure>
  );
}
