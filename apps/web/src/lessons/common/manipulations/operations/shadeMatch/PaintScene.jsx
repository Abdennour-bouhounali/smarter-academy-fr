import KidFigure from '../../primitives/KidFigure';
import * as L from '../../logic/shadeMatch';
import { shadeColor, liquidLevel, tallyRungs } from './shadeArt';

/**
 * LE MAGASIN DE PEINTURE DU QUARTIER (thème `paintshop`) — la scène SVG de `shade-match`, dessinée en code, jamais générée. Tout y est HONNÊTE :
 *  - le seau de référence A est scellé, son étiquette dit « a أزرق : b أبيض » et son liquide a la teinte de a/(a + b) ;
 *  - le seau B montre son blanc (d barrettes blanches, à gauche) et son bleu (c barrettes bleues, à droite), du fond vers le haut : on peut les COMPTER ; son
 *    liquide est teinté de la part de bleu EXACTE c/(c + d) (`shadeArt.js › shadeColor`) — deux rapports égaux donnent la MÊME couleur ;
 *  - chaque mesure de bleu versée tombe du bec (une goutte), et la manette s'abaisse tant qu'on appuie.
 * Repère de conception : 440 × 232, tout est en unités de conception ; le composant parent le met à l'échelle.
 */
const W = 440;
const H = 232;
const GROUND = 214;
const AX = 118;
const BX = 252;
const POST = 392;
const TOP = 118;
const BOTTOM = 208;
const GRAB = 34;

const INK = '#1E1B4B';
const BRASS = '#C28A1E';
const BRASS_DARK = '#8A5E0E';

export const CSS = `
@keyframes sm-fall { 0% { transform: translateY(0); opacity: 1; } 85% { opacity: 1; } 100% { transform: translateY(var(--sm-fall, 60px)); opacity: 0; } }
.sm-drop { animation: sm-fall 300ms ease-in both; }
@keyframes sm-stamp { 0% { transform: scale(1.7) rotate(-14deg); opacity: 0; } 55% { transform: scale(0.94) rotate(-5deg); opacity: 1; } 100% { transform: scale(1) rotate(-7deg); opacity: 1; } }
.sm-stamp { animation: sm-stamp 340ms ease-out both; transform-box: fill-box; transform-origin: center; }
@keyframes sm-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
.sm-pulse { animation: sm-pulse 1.2s ease-in-out infinite; }
.sm-liquid, .sm-lever { transition: all 140ms ease-out; }
.sm-grab:focus-visible .sm-grab-ring { stroke: #4F46E5; stroke-width: 4; opacity: 1; }
.sm-grab { outline: none; }
@media (prefers-reduced-motion: reduce) { .sm-drop, .sm-stamp, .sm-pulse { animation: none !important; } .sm-liquid, .sm-lever { transition: none !important; } .sm-drop { display: none; } }
`;

const iso = (s) => `⁦${s}⁩`;

function Bucket({ cx, w0 = 46, w1 = 36, level, color, sealed, label, children, tag }) {
  const left0 = cx - w0; const right0 = cx + w0; const left1 = cx - w1; const right1 = cx + w1;
  const h = BOTTOM - TOP;
  const top = BOTTOM - level * (h - 6);
  return (
    <g data-sm-bucket={tag}>
      <ellipse cx={cx} cy={BOTTOM + 3} rx={w1 + 8} ry={5} fill="#1E1B4B" opacity={0.12} />
      <path d={`M${left0} ${TOP} L${right0} ${TOP} L${right1} ${BOTTOM} L${left1} ${BOTTOM} Z`} fill="rgba(255,255,255,0.7)" stroke="#475569" strokeWidth={2.4} strokeLinejoin="round" />
      <clipPath id={`clip-${tag}`}><path d={`M${left0 + 2} ${TOP} L${right0 - 2} ${TOP} L${right1 - 1.5} ${BOTTOM - 1.5} L${left1 + 1.5} ${BOTTOM - 1.5} Z`} /></clipPath>
      <g clipPath={`url(#clip-${tag})`}>
        <rect className="sm-liquid" x={left0} y={top} width={w0 * 2} height={BOTTOM - top} fill={color} data-sm-liquid data-fill={color} />
        {children}
      </g>
      <path d={`M${left0} ${TOP} L${right0} ${TOP} L${right1} ${BOTTOM} L${left1} ${BOTTOM} Z`} fill="none" stroke="#475569" strokeWidth={2.4} strokeLinejoin="round" />
      <ellipse cx={cx} cy={TOP} rx={w0} ry={6} fill={sealed ? '#CBD5E1' : 'rgba(255,255,255,0.35)'} stroke="#475569" strokeWidth={2.4} />
      {sealed && <ellipse cx={cx} cy={TOP - 1} rx={w0 - 8} ry={4} fill="#E2E8F0" stroke="#94A3B8" strokeWidth={1.2} />}
      {label && (
        <g transform={`translate(${cx} ${TOP - 14})`} data-sm-label={tag}>
          <rect x={-52} y={-12} width={104} height={20} rx={10} fill="#FFFFFF" stroke="#C7D2FE" strokeWidth={1.6} />
          <text y={3} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={INK} style={{ direction: 'rtl', unicodeBidi: 'isolate' }}>{label}</text>
        </g>
      )}
    </g>
  );
}

export default function PaintScene({ lab, k, uid, scale, mood, pressed, drop, grabProps, svgRef }) {
  const t = L.taskOf(lab);
  const free = L.isFree(lab);
  const B = L.bucketB(lab);
  const sh = L.shares(lab);
  const colA = shadeColor(L.depth(sh.ref));
  const colB = shadeColor(L.depth(sh.mix));
  const done = L.taskDone(lab);
  const j = L.judge(lab);
  const here = !!lab.settled && lab.settled.c === lab.c;
  const matchNow = !L.veiled(lab) && (t.kind === 'match' || free) && !j.empty && j.verdict === 'match' && (free ? here : done || here);
  const compareLike = !free && (t.kind === 'compare' || t.kind === 'pick');
  const levelB = liquidLevel(B.c, B.d);
  const levelA = 0.62;   // le seau de référence est scellé et plein : seule sa TEINTE compte
  const labelA = k('scene.refLabel', { a: iso(t.a), b: iso(t.b) });
  const labelB = compareLike && (t.kind === 'compare' || lab.loaded >= 0) ? k('scene.refLabel', { a: iso(B.c), b: iso(B.d) }) : null;
  const rungsH = BOTTOM - TOP - 8;
  const whiteRungs = tallyRungs(B.d, rungsH);
  const blueRungs = tallyRungs(B.c, rungsH);
  const noLever = compareLike;
  const armDeg = pressed ? 26 : 0;
  const tipY = 92;
  const fall = Math.max(24, BOTTOM - levelB * (BOTTOM - TOP - 6) - tipY - 6);
  const wall = 0;
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width={W * scale} height={H * scale} role="img" aria-label={k('scene.aria', { a: iso(t.a), b: iso(t.b) })} data-sm-svg style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <linearGradient id={`${uid}-floor`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#E0E7FF" /><stop offset="1" stopColor="#C7D2FE" /></linearGradient>
      </defs>
      <rect x={0} y={GROUND} width={W} height={H - GROUND} fill={`url(#${uid}-floor)`} />
      {/* l'esquisse de la fresque et le rouleau d'Amine */}
      <g aria-hidden="true">
        <rect x={10} y={wall + 8} width={150} height={84} rx={6} fill="#FFFFFF" stroke="#C7D2FE" strokeWidth={2} strokeDasharray="6 4" />
        <rect x={10} y={wall + 8} width={64} height={84} rx={6} fill={colA} />
        <circle cx={118} cy={wall + 36} r={14} fill="none" stroke="#A5B4FC" strokeWidth={2} strokeDasharray="4 3" />
        <path d={`M92 ${wall + 76}q16 -22 36 -4q12 8 24 -8`} fill="none" stroke="#A5B4FC" strokeWidth={2} strokeDasharray="4 3" />
      </g>
      <Bucket cx={AX} level={levelA} color={colA} sealed label={labelA} tag="A" />
      <g data-sm-kid aria-hidden="true">
        <KidFigure cx={42} top={GROUND - 92} foot={GROUND} hairStyle="short" outfit="blue" skin="light" mood={mood} data-sm-amine data-mood={mood} />
        <g transform={`translate(70 ${GROUND - 56}) rotate(-24)`}>
          <line x1={0} y1={0} x2={0} y2={-24} stroke="#78350F" strokeWidth={3} strokeLinecap="round" />
          <rect x={-13} y={-36} width={26} height={12} rx={4} fill={colA} stroke="#475569" strokeWidth={1.6} />
        </g>
      </g>

      {/* la machine : le poteau, le bras, le bec, la manette */}
      <g data-sm-machine>
        <rect x={POST - 9} y={56} width={18} height={GROUND - 56} rx={5} fill="#94A3B8" stroke="#64748B" strokeWidth={2} />
        <rect x={BX - 6} y={50} width={POST - BX + 6} height={14} rx={6} fill="#CBD5E1" stroke="#64748B" strokeWidth={2} />
        <g data-sm-nozzle>
          <rect x={BX - 14} y={58} width={28} height={20} rx={5} fill={BRASS} stroke={BRASS_DARK} strokeWidth={2} />
          <path d={`M${BX - 7} 78 L${BX + 7} 78 L${BX + 3} ${tipY} L${BX - 3} ${tipY} Z`} fill={BRASS} stroke={BRASS_DARK} strokeWidth={2} strokeLinejoin="round" />
        </g>
        {!noLever && (
          <g>
            <g className="sm-lever" style={{ transform: `rotate(${armDeg}deg)`, transformOrigin: `${POST}px 118px` }}>
              <line x1={POST} y1={118} x2={POST - 38} y2={118} stroke={BRASS_DARK} strokeWidth={7} strokeLinecap="round" />
              <circle cx={POST - 38} cy={118} r={11} fill="#E11D48" stroke="#9F1239" strokeWidth={2.4} />
            </g>
            <circle cx={POST} cy={118} r={7} fill="#64748B" stroke="#F1F5F9" strokeWidth={2} />
            <circle className={lab.c === 0 && !L.taskDone(lab) ? 'sm-pulse' : ''} cx={POST - 22} cy={118} r={GRAB - 4} fill="none" stroke="#F59E0B" strokeWidth={3} strokeDasharray="5 5" opacity={0.85} data-sm-grab-ring />
            <g className="sm-grab" data-sm-lever data-pressed={pressed ? 'true' : 'false'} data-frozen={done ? 'true' : 'false'} {...grabProps}>
              <circle cx={POST - 22} cy={118} r={GRAB} fill="transparent" style={{ cursor: done ? 'not-allowed' : 'pointer' }} />
            </g>
          </g>
        )}
      </g>
      {drop && !noLever && <circle className="sm-drop" key={`drop-${drop}`} cx={BX} cy={tipY + 4} r={5.5} fill="#1D4ED8" stroke="#FFFFFF" strokeWidth={1.5} style={{ '--sm-fall': `${fall}px` }} data-sm-drop />}

      <Bucket cx={BX} level={levelB} color={colB} label={labelB} tag="B">
        {!compareLike || t.kind === 'compare' || lab.loaded >= 0 ? (
          <g data-sm-tally aria-hidden="true">
            {whiteRungs.map((y) => <rect key={`w${y}`} x={BX - 34} y={BOTTOM - 5 - y} width={11} height={1.5} rx={0.7} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={0.4} />)}
            {blueRungs.map((y) => <rect key={`b${y}`} x={BX + 23} y={BOTTOM - 5 - y} width={11} height={1.5} rx={0.7} fill="#1D4ED8" />)}
          </g>
        ) : null}
      </Bucket>

      {matchNow && (
        <g transform={`translate(${BX} 112)`} data-sm-stamp aria-hidden="true">
          <g className="sm-stamp">
            <circle r={26} fill="#FFFFFF" fillOpacity={0.95} stroke="#059669" strokeWidth={3} strokeDasharray="6 3" />
            <path d="M-10 -5l6 6l12 -12" fill="none" stroke="#059669" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
            <text y={19} textAnchor="middle" fontSize={10.5} fontWeight={900} fill="#047857">{k('scene.stamp')}</text>
          </g>
        </g>
      )}
    </svg>
  );
}
