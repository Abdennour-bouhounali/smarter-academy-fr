import { useMemo } from 'react';
import KidFigure from '../../primitives/KidFigure';
import * as L from '../../logic/gearCrank';
import { pitchRadius, gearPath, chainGeometry, chainOffset, arcPath } from './gearArt';

/**
 * LA COUR DE L'ÉCOLE ET LA DRAPIÈRE DU NADI (thème `bikestand`) — la scène SVG de `gear-crank`, dessinée en code, jamais générée. Tout y est HONNÊTE :
 *  - le plateau et le pignon portent leur VRAI nombre de dents (F et R dents dessinées, au même pas) ; la chaîne a des maillons qui passent dent par dent ;
 *  - le rayon de la roue est fixe : un tour de roue fait avancer la drapière de 2π × 50 unités, et le drapeau est posé à (tours de roue demandés) × 2π × 50 :
 *    la distance au drapeau est DESSINÉE à l'échelle ; la caméra suit la drapière, la route défile (les repères de craie sont espacés d'un tour de roue) ;
 *  - la manivelle suit le doigt ; la valve rouge de la roue avant tourne ; l'anneau orange autour de l'axe se remplit à chaque tour de pédale, l'anneau
 *    vert autour du moyeu avant à chaque tour de roue.
 * Repère de conception : hauteur 244, largeur Wd = (largeur du labo) / échelle ; tout est en unités de conception.
 */
const H = 244;
const GROUND = 216;
const RT = 50; // rayon extérieur du pneu
const CIRC = 2 * Math.PI * RT; // un tour de roue
const HY = GROUND - RT; // hauteur des moyeux
const RX = 76; // moyeu arrière
const WB = 165; // empattement
const AX = RX + WB; // moyeu avant : l'ancre de la caméra
export const BB = { x: RX + 86, y: HY + 14 }; // le pédalier
const REAR = { x: RX, y: HY };
const CRANK = 32;
const CRANK0 = -35; // la manivelle au départ (degrés, sens horaire)
const GRAB = 58; // le disque de prise (≥ 56 px à l'écran avec l'échelle minimale)

const FRAME = '#4F46E5';
const ORANGE = '#F59E0B';
const TEAL = '#0D9488';

export const CSS = `
.gc-roll, .gc-spin { transition: transform 110ms linear; }
@keyframes gc-stamp { 0% { transform: scale(1.7) rotate(-16deg); opacity: 0; } 55% { transform: scale(0.94) rotate(-6deg); opacity: 1; } 100% { transform: scale(1) rotate(-8deg); opacity: 1; } }
.gc-stamp { animation: gc-stamp 340ms ease-out both; transform-box: fill-box; transform-origin: center; }
@keyframes gc-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
.gc-pulse { animation: gc-pulse 1.2s ease-in-out infinite; }
@keyframes gc-pop { 0% { transform: scale(0.82); } 70% { transform: scale(1.07); } 100% { transform: scale(1); } }
.gc-pop { animation: gc-pop 280ms ease-out both; display: inline-block; }
.gc-grab:focus-visible .gc-grab-ring { stroke: #4F46E5; stroke-width: 4; opacity: 1; }
.gc-grab { outline: none; }
@media (prefers-reduced-motion: reduce) { .gc-roll, .gc-spin { transition: none !important; } .gc-stamp, .gc-pulse, .gc-pop { animation: none !important; } }
`;

const rot = (deg) => ({ transform: `rotate(${deg}deg)` });

function Wheel({ cx, cy, deg, valve }) {
  return (
    <g transform={`translate(${cx} ${cy})`} data-gc-wheel-art>
      <circle r={46.5} fill="rgba(255,255,255,0.4)" stroke="#1F2937" strokeWidth={7} />
      <circle r={41} fill="none" stroke="#CBD5E1" strokeWidth={2.5} />
      <g className="gc-spin" style={rot(deg)}>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i * Math.PI * 2) / 16;
          return <line key={i} x1={Math.cos(a) * 6} y1={Math.sin(a) * 6} x2={Math.cos(a) * 41} y2={Math.sin(a) * 41} stroke="#94A3B8" strokeWidth={1} />;
        })}
        {valve && (
          <g data-gc-valve>
            <line x1={41} y1={0} x2={33} y2={0} stroke="#E11D48" strokeWidth={3} strokeLinecap="round" />
            <circle cx={31} cy={0} r={5.2} fill="#F43F5E" stroke="#FFFFFF" strokeWidth={1.6} />
          </g>
        )}
      </g>
      <circle r={5.5} fill="#64748B" stroke="#F1F5F9" strokeWidth={1.5} />
    </g>
  );
}

/** Un engrenage denté qui tourne de `deg` autour de (cx, cy) ; la dent repère (en haut au départ) est colorée. */
function Gear({ cx, cy, n, deg, tone, spokes }) {
  const g = useMemo(() => gearPath(n), [n]);
  return (
    <g transform={`translate(${cx} ${cy})`} data-gc-gear={n}>
      <g className="gc-spin" style={rot(deg)}>
        <path d={g.d} fill="#475569" stroke="#1E293B" strokeWidth={0.5} strokeLinejoin="round" />
        <circle r={Math.max(2, g.r - 4.2)} fill="#64748B" />
        {spokes ? Array.from({ length: 5 }, (_, i) => {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
          return <line key={i} x1={0} y1={0} x2={Math.cos(a) * (g.r - 3)} y2={Math.sin(a) * (g.r - 3)} stroke="#334155" strokeWidth={2.2} strokeLinecap="round" />;
        }) : [0, 1, 2].map((i) => {
          const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
          return <circle key={i} cx={Math.cos(a) * g.r * 0.5} cy={Math.sin(a) * g.r * 0.5} r={Math.max(1, g.r * 0.17)} fill="#334155" />;
        })}
        <path d={g.mark} fill={tone} stroke="#FFFFFF" strokeWidth={0.7} strokeLinejoin="round" />
        <circle r={2.2} fill="#CBD5E1" />
      </g>
    </g>
  );
}

function turnsPill(text, tone) {
  const w = Math.round(text.length * 7.6 + 30);
  return { w, fill: tone === 'over' ? '#DC2626' : '#B45309' };
}

export default function BikeScene({ lab, k, uid, width, scale, fl, mood, grabProps, svgRef, turnsText }) {
  const t = L.taskOf(lab);
  const free = L.isFree(lab);
  const teeth = lab.teeth;
  const j = L.judge(lab);
  const locked = L.locked(lab);
  const done = L.taskDone(lab);
  const Wd = Math.max(300, width / scale);
  const dist = (teeth * CIRC) / t.R; // distance parcourue par le contact de la roue avant
  const Xf = (Number(t.target.n) / Number(t.target.d)) * CIRC; // le drapeau, à l'échelle
  const flagScreen = AX + (Xf - dist);
  const edge = flagScreen > Wd - 26 ? 'right' : flagScreen < 20 ? 'left' : null;
  const ringDeg = (360 * (fl ?? teeth)) / t.F;
  const wheelDeg = (360 * teeth) / t.R;
  const crankDeg = CRANK0 + ringDeg;

  const rF = pitchRadius(t.F);
  const rR = pitchRadius(t.R);
  const chain = useMemo(() => chainGeometry(BB, rF, REAR, rR), [rF, rR]);
  const off = chainOffset(teeth, chain);

  // l'anneau orange (un tour de pédale) et l'anneau vert (un tour de roue) : la fraction du tour en cours
  const pedalFrac = teeth === 0 ? 0 : teeth % t.F === 0 ? 1 : (teeth % t.F) / t.F;
  const wheelFrac = teeth === 0 ? 0 : teeth % t.R === 0 ? 1 : (teeth % t.R) / t.R;

  // le monde défile : on dessine ce qui est entre la caméra - 160 et la caméra + largeur + 160
  const lo = dist - AX - 160; const hi = dist - AX + Wd + 160;
  const slabs = []; for (let x = Math.floor(lo / 56) * 56; x <= hi; x += 56) slabs.push(x);
  const ticks = []; for (let n = Math.max(0, Math.ceil(lo / CIRC)); n * CIRC <= hi; n += 1) ticks.push(n * CIRC);

  const settled = lab.settled && lab.teeth === lab.settled.teeth;
  const showGap = settled && !j.atFlag;
  const stamp = j.atFlag && (done || (free && settled) || (lab.settled && lab.settled.atFlag && lab.teeth === lab.settled.teeth));
  const gapText = showGap ? (j.over ? k('scene.over', { turns: turnsText(j.gap, true) }) : k('scene.short', { turns: turnsText(j.gap, true) })) : '';
  const pill = showGap ? turnsPill(gapText, j.over ? 'over' : 'short') : null;
  const pillX = pill ? Math.max(pill.w / 2 + 8, Math.min(Wd - pill.w / 2 - 8, AX - 78)) : 0;

  // la minicarte : départ → drapeau, la drapière avance
  const mapX0 = 20; const mapW = Wd - 40;
  const flagAt = mapX0 + mapW * 0.8;
  const bikeAt = mapX0 + Math.min(mapW, mapW * 0.8 * (dist / Xf));

  const sweat = settled && j.over;

  return (
    <svg ref={svgRef} width={width} height={H * scale} viewBox={`0 0 ${Wd} ${H}`} dir="ltr" role="group" aria-label={k('scene.aria', { F: t.F, R: t.R, turns: turnsText(t.target, false) })}
      style={{ display: 'block', touchAction: 'none' }} data-gc-svg data-teeth={teeth}>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BAE6FD" /><stop offset="1" stopColor="#F0F9FF" /></linearGradient>
        <linearGradient id={`${uid}-road`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A8A29E" /><stop offset="1" stopColor="#78716C" /></linearGradient>
        <pattern id={`${uid}-wall`} width="150" height="104" patternUnits="userSpaceOnUse" patternTransform={`translate(${-((dist * 0.22) % 150)} 112)`}>
          <rect width="150" height="104" fill="#FEF3C7" />
          <rect width="150" height="8" fill="#FCD34D" />
          {[16, 86].map((x) => (
            <g key={x}>
              <rect x={x} y={22} width={46} height={46} rx={6} fill="#93C5FD" stroke="#B45309" strokeWidth={3} />
              <line x1={x + 23} y1={22} x2={x + 23} y2={68} stroke="#B45309" strokeWidth={2.2} />
              <line x1={x} y1={45} x2={x + 46} y2={45} stroke="#B45309" strokeWidth={2.2} />
            </g>
          ))}
        </pattern>
      </defs>

      {/* le ciel, la façade de l'école, la route */}
      <rect width={Wd} height={H} fill={`url(#${uid}-sky)`} />
      <g opacity={0.9} aria-hidden="true">
        <ellipse cx={Wd * 0.62} cy={50} rx={30} ry={9} fill="#FFFFFF" opacity={0.85} />
        <ellipse cx={Wd * 0.62 + 20} cy={44} rx={20} ry={9} fill="#FFFFFF" opacity={0.85} />
        <ellipse cx={Wd * 0.2} cy={64} rx={24} ry={7} fill="#FFFFFF" opacity={0.7} />
      </g>
      <rect y={112} width={Wd} height={GROUND - 112} fill={`url(#${uid}-wall)`} aria-hidden="true" />
      <rect y={GROUND - 6} width={Wd} height={6} fill="#D6D3D1" aria-hidden="true" />
      <rect y={GROUND} width={Wd} height={H - GROUND} fill={`url(#${uid}-road)`} aria-hidden="true" />

      {/* le monde défile sous la drapière */}
      <g className="gc-roll" style={{ transform: `translateX(${AX - dist}px)` }} data-gc-world>
        <g aria-hidden="true">
          {slabs.map((x) => <line key={x} x1={x} y1={GROUND} x2={x} y2={H} stroke="#57534E" strokeOpacity={0.35} strokeWidth={1.5} />)}
          {ticks.map((x, i) => (i === 0 ? null : <rect key={x} x={x - 1.5} y={GROUND + 4} width={3} height={9} rx={1.5} fill="#FAFAF9" opacity={0.9} />))}
          {/* la ligne de départ à la craie */}
          <rect x={-3} y={GROUND - 1} width={6} height={H - GROUND + 1} fill="#FFFFFF" />
          <rect x={-3} y={GROUND - 1} width={6} height={H - GROUND + 1} fill="none" stroke="#1E1B4B" strokeOpacity={0.25} />
        </g>
        {!edge && (
          <g data-gc-flag data-edge="false" data-at={j.atFlag ? 'true' : 'false'}>
            <rect x={Xf - 3} y={GROUND - 1} width={6} height={H - GROUND + 1} fill="#FFFFFF" />
            <rect x={Xf - 3} y={GROUND - 1} width={6} height={H - GROUND + 1} fill="none" stroke="#E11D48" strokeWidth={1.6} />
            <line x1={Xf} y1={GROUND} x2={Xf} y2={GROUND - 100} stroke="#78350F" strokeWidth={4} strokeLinecap="round" />
            <path d={`M${Xf + 2} ${GROUND - 100}L${Xf + 40} ${GROUND - 90}L${Xf + 2} ${GROUND - 76}Z`} fill="#E11D48" stroke="#9F1239" strokeWidth={1.5} strokeLinejoin="round" />
            <circle cx={Xf} cy={GROUND - 102} r={4} fill="#F59E0B" />
            <g data-gc-lina data-mood={mood}>
              <KidFigure cx={Xf + 84} top={GROUND - 78} foot={GROUND} hairStyle="hijab" scarf="rose" outfit="pink" skin="light" mood={mood} />
              {sweat && <path d={`M${Xf + 104} ${GROUND - 74}q-5 8 0 11q5 -3 0 -11z`} fill="#38BDF8" stroke="#0369A1" strokeWidth={1} />}
            </g>
          </g>
        )}
      </g>
      {edge && (
        <g data-gc-flag data-edge={edge} transform={`translate(${edge === 'right' ? Wd - 22 : 22} ${GROUND - 34})`} aria-hidden="true">
          <line x1={0} y1={0} x2={0} y2={-46} stroke="#78350F" strokeWidth={3.5} strokeLinecap="round" />
          <path d={`M1.5 -46L${edge === 'right' ? 22 : -22} -40L1.5 -31Z`} fill="#E11D48" stroke="#9F1239" strokeWidth={1.4} strokeLinejoin="round" />
          <text x={0} y={18} textAnchor="middle" fontSize={20} fontWeight={900} fill="#BE123C" className="gc-pulse">{edge === 'right' ? '›››' : '‹‹‹'}</text>
        </g>
      )}

      {/* la drapière : roues, cadre, chaîne, engrenages, manivelle */}
      <g data-gc-bike>
        <ellipse cx={(RX + AX) / 2} cy={GROUND + 3} rx={WB / 2 + 52} ry={5} fill="#1C1917" opacity={0.18} aria-hidden="true" />
        <Wheel cx={RX} cy={HY} deg={wheelDeg} />
        <Wheel cx={AX} cy={HY} deg={wheelDeg} valve />
        <g stroke={FRAME} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" fill="none" aria-hidden="true">
          <path d={`M${RX} ${HY}L${BB.x} ${BB.y}`} />
          <path d={`M${RX} ${HY}L${RX + 70} ${HY - 62}`} />
          <path d={`M${BB.x} ${BB.y}L${RX + 70} ${HY - 62}`} />
          <path d={`M${RX + 70} ${HY - 62}L${AX - 18} ${HY - 68}`} />
          <path d={`M${BB.x} ${BB.y}L${AX - 12} ${HY - 52}`} />
          <path d={`M${AX - 18} ${HY - 70}L${AX - 10} ${HY - 50}L${AX} ${HY}`} />
        </g>
        <g aria-hidden="true">
          <line x1={RX + 70} y1={HY - 62} x2={RX + 66} y2={HY - 74} stroke="#334155" strokeWidth={4} strokeLinecap="round" />
          <path d={`M${RX + 52} ${HY - 78}q14 -7 30 -1q-6 7 -30 1z`} fill="#1E293B" />
          <path d={`M${AX - 18} ${HY - 70}l-3 -14`} stroke="#334155" strokeWidth={4} strokeLinecap="round" />
          <path d={`M${AX - 32} ${HY - 88}q16 -8 30 2`} fill="none" stroke="#334155" strokeWidth={4.5} strokeLinecap="round" />
        </g>

        {/* la chaîne : ses maillons avancent d'un pas par dent */}
        <g aria-hidden="true" data-gc-chain data-links={chain.links}>
          <path d={chain.d} fill="none" stroke="#111827" strokeWidth={3.2} strokeDasharray={`${chain.pEff * 0.6} ${chain.pEff * 0.4}`} style={{ strokeDashoffset: off }} />
          <path d={chain.d} fill="none" stroke="#D1D5DB" strokeWidth={1.1} strokeDasharray={`${chain.pEff * 0.2} ${chain.pEff * 0.8}`} style={{ strokeDashoffset: off - chain.pEff * 0.2 }} />
        </g>
        <Gear cx={REAR.x} cy={REAR.y} n={t.R} deg={wheelDeg} tone={TEAL} />
        <Gear cx={BB.x} cy={BB.y} n={t.F} deg={ringDeg} tone={ORANGE} spokes />

        {/* les anneaux : un tour de pédale (orange, autour de l'axe) et un tour de roue (vert, autour du moyeu avant) */}
        <g fill="none" strokeLinecap="round" aria-hidden="true" data-gc-rings>
          <circle cx={BB.x} cy={BB.y} r={40} stroke={ORANGE} strokeOpacity={0.22} strokeWidth={4} strokeDasharray={teeth === 0 ? '4 5' : undefined} />
          <path d={arcPath(BB.x, BB.y, 40, pedalFrac)} stroke={ORANGE} strokeWidth={4.5} data-gc-ring="pedal" />
          {teeth === 0 && !locked && <path d={`M${BB.x + 20} ${BB.y - 38}l9 -2l-4 9z`} fill={ORANGE} stroke={ORANGE} strokeWidth={1.5} strokeLinejoin="round" />}
          <circle cx={AX} cy={HY} r={36} stroke={TEAL} strokeOpacity={0.18} strokeWidth={4} />
          <path d={arcPath(AX, HY, 36, wheelFrac)} stroke={TEAL} strokeWidth={4.5} data-gc-ring="wheel" />
        </g>

        {/* la manivelle : elle suit le doigt ; la pédale reste à plat */}
        <g transform={`translate(${BB.x} ${BB.y})`} opacity={locked ? 0.55 : 1}>
          <g className="gc-spin" style={rot(crankDeg)} data-gc-arm>
            <path d={`M0 -5L${CRANK} -3.4L${CRANK} 3.4L0 5Z`} fill="#334155" stroke="#0F172A" strokeWidth={1} strokeLinejoin="round" />
            <circle r={6.5} fill="#64748B" stroke="#0F172A" strokeWidth={1.2} />
            <g transform={`translate(${CRANK} 0)`}>
              <g className="gc-spin" style={rot(-crankDeg)}>
                <rect x={-12} y={-4} width={24} height={8} rx={3} fill="#111827" stroke="#F8FAFC" strokeWidth={1.2} />
                <circle r={GRAB * (fl != null ? 0.5 : 0.4)} fill={fl != null ? 'rgba(245,158,11,0.18)' : 'none'} stroke={ORANGE} strokeWidth={fl != null ? 4 : 3} strokeDasharray={fl != null ? undefined : '5 5'} className={teeth === 0 && !locked && fl == null ? 'gc-pulse' : ''} opacity={locked ? 0.3 : 0.9} data-gc-grab-ring />
              </g>
            </g>
          </g>
        </g>
        {locked && (
          <g transform={`translate(${BB.x + 36} ${BB.y - 34}) scale(1.5)`} aria-hidden="true" data-gc-lock>
            <rect x={-9} y={-2} width={18} height={14} rx={3} fill="#475569" stroke="#FFFFFF" strokeWidth={1.4} />
            <path d="M-5 -2v-5a5 5 0 0 1 10 0v5" fill="none" stroke="#475569" strokeWidth={3} strokeLinecap="round" />
          </g>
        )}
        {/* la prise : tout le disque autour de l'axe saisit la manivelle (≥ 56 px, rien ne se voit dessus) */}
        <g className="gc-grab" data-gc-crank data-locked={locked ? 'true' : 'false'} data-frozen={done ? 'true' : 'false'} {...grabProps}>
          <circle cx={BB.x} cy={BB.y} r={GRAB} fill="transparent" style={{ cursor: locked || done ? 'not-allowed' : 'grab' }} />
        </g>
      </g>

      {/* le tampon ou l'écart au drapeau */}
      {stamp && (
        <g transform={`translate(${AX - 108} 62)`} data-gc-stamp aria-hidden="true">
          <g className="gc-stamp">
            <circle r={36} fill="#FFFFFF" fillOpacity={0.94} stroke="#059669" strokeWidth={3} strokeDasharray="6 3" />
            <path d="M-13 -8l8 9l16 -16" fill="none" stroke="#059669" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
            <text y={22} textAnchor="middle" fontSize={12} fontWeight={900} fill="#047857">{k('scene.stamp')}</text>
          </g>
        </g>
      )}
      {pill && (
        <g transform={`translate(${pillX} 56)`} data-gc-gap data-kind={j.over ? 'over' : 'short'} data-value={L_gap(j.gap)} role="status">
          <rect x={-pill.w / 2} y={-14} width={pill.w} height={30} rx={15} fill="#1E1B4B" opacity={0.14} transform="translate(0 2)" />
          <rect x={-pill.w / 2} y={-14} width={pill.w} height={30} rx={15} fill={pill.fill} />
          <path d={`M-6 16l6 8l6 -8z`} fill={pill.fill} />
          <text y={6} textAnchor="middle" fontSize={15} fontWeight={800} fill="#FFFFFF" style={{ direction: 'rtl', unicodeBidi: 'isolate' }}>{gapText}</text>
        </g>
      )}

      {/* la minicarte : du départ au drapeau, à l'échelle */}
      <g aria-hidden="true" data-gc-minimap>
        <rect x={mapX0} y={12} width={mapW} height={10} rx={5} fill="#FFFFFF" fillOpacity={0.75} stroke="#C7D2FE" />
        <rect x={mapX0} y={12} width={Math.max(0, bikeAt - mapX0)} height={10} rx={5} fill="#818CF8" />
        <circle cx={mapX0} cy={17} r={5} fill="#FFFFFF" stroke="#4338CA" strokeWidth={2} />
        <g transform={`translate(${flagAt} 17)`}>
          <line x1={0} y1={5} x2={0} y2={-12} stroke="#78350F" strokeWidth={2} strokeLinecap="round" />
          <path d="M0.5 -12L11 -8.5L0.5 -5Z" fill="#E11D48" />
        </g>
        <circle cx={bikeAt} cy={17} r={7} fill="#4F46E5" stroke="#FFFFFF" strokeWidth={2.5} />
        <circle cx={bikeAt} cy={17} r={2.2} fill="#FFFFFF" />
      </g>
    </svg>
  );
}

const L_gap = (g) => `${g.n}${g.d === 1n ? '' : `/${g.d}`}`;
