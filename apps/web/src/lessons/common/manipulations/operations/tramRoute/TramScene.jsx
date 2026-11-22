import * as C from '@smarter-academy/core/arithmetic/chainOps.js';
import KidFigure from '../../primitives/KidFigure';

/**
 * LE MONDE DESSINÉ du labo `tram-route` (thème `tramline`) — SVG en code, paramétré, jamais une image générée (root CLAUDE.md). Le tramway d'une ville
 * algérienne vu de face : la voie et le fil de contact tirés de GAUCHE à DROITE (le temps), un arrêt par terme de la chaîne avec son panneau et son abri,
 * la rame articulée à deux voitures dont l'afficheur lumineux est le COMPTEUR DE PASSAGERS (la vérité), des élèves (KidFigure : garçons en sweat, filles en
 * hijab et tunique) qui montent ou descendent, un fanion par groupe (avec sa taille), et — pour une chaîne × ÷ seule — le kiosque à tickets. Le texte arabe
 * est du texte vivant ; le décor est `aria-hidden`, le sens passe par le DOM du labo.
 *
 * Le plan refusé se DESSINE : à l'arrêt fautif, des groupes fantômes (`kind: 'groups'`), un panneau « ؟ » sur le nombre de descendus (`overflow`), un prix
 * rayé au kiosque (`price`). Rien d'autre n'est dit par le dessin : le verdict est écrit par le labo.
 */
const FONT = 'ui-sans-serif, system-ui, sans-serif';
export const SCENE_H = 236;
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const PEOPLE = [
  { skin: 'tan', hair: 'black', outfit: 'orange', hairStyle: 'short' },
  { skin: 'light', hair: 'brown', outfit: 'rose', hairStyle: 'hijab', scarf: 'rose' },
  { skin: 'brown', hair: 'chestnut', outfit: 'green', hairStyle: 'curly' },
  { skin: 'tan', hair: 'auburn', outfit: 'purple', hairStyle: 'hijab', scarf: 'teal' },
];

export const CSS = `
@keyframes tr-pop { 0% { transform: scale(0.85); } 60% { transform: scale(1.1); } 100% { transform: scale(1); } }
.tr-pop { animation: tr-pop 0.28s ease-out; }
.tr-tram { transition: transform 0.6s ease-in-out; }
@media (prefers-reduced-motion: reduce) { .tr-tram { transition: none; } .tr-pop { animation: none; } }
`;

/** x des arrêts : répartis sur la largeur, la rame (≈ 150 px) tient entre deux. */
function stationXs(n, width) {
  if (n <= 1) return [width / 2];
  const pad = Math.min(96, width * 0.17);
  return Array.from({ length: n }, (_, i) => pad + (i * (width - 2 * pad)) / (n - 1));
}

function Kids({ cx, n, foot, top, mood, seed = 0 }) {
  const count = Math.max(1, Math.min(3, n));
  const xs = count === 1 ? [cx] : count === 2 ? [cx - 14, cx + 14] : [cx - 24, cx, cx + 24];
  return xs.map((x, i) => <KidFigure key={i} cx={x} top={top} foot={foot} mood={mood} {...PEOPLE[(seed + i) % PEOPLE.length]} />);
}

function Flag({ x, foot, m, color, label }) {
  return (
    <g data-tr-flag={m}>
      <line x1={x} y1={foot} x2={x} y2={foot - 46} stroke="#475569" strokeWidth={2} />
      <path d={`M${x} ${foot - 46} h26 l-6 8 l6 8 h-26 z`} fill={color} stroke="#1E293B" strokeWidth={1} />
      <text x={x + 10} y={foot - 33} fontSize={10.5} fontWeight={900} fill="#fff" textAnchor="middle" fontFamily={FONT}>{label}</text>
    </g>
  );
}

function Station({ i, x, task, term, name, ghost, absurdKind, k, active, mood, plain }) {
  const foot = 170;
  const group = term?.grouped;
  const down = term?.sign === '−';
  const km = task.unit === 'km';
  const [kk, mm] = group ? term.text.split(/\s*[×÷]\s*/) : [];
  const badge = plain || i === 0 || !term ? null
    : km ? (group ? k('badge.legs', { k: iso(kk), m: iso(mm) }) : k('badge.leg', { n: iso(term.text) }))
      : group ? k(down ? 'badge.groupsOff' : 'badge.groupsOn', { k: iso(kk), m: iso(mm) }) : k(down ? 'badge.off' : 'badge.on', { n: iso(term.text) });
  const badgeW = badge ? Math.max(64, badge.length * 6.6) : 0;
  return (
    <g data-tr-station={i} data-active={active ? 'true' : 'false'}>
      {/* abri */}
      <rect x={x - 40} y={126} width={80} height={5} rx={2} fill="#64748B" />
      <rect x={x - 37} y={131} width={3} height={39} fill="#94A3B8" />
      <rect x={x + 34} y={131} width={3} height={39} fill="#94A3B8" />
      {/* quai */}
      <rect x={x - 50} y={foot} width={100} height={9} rx={2} fill="#94A3B8" />
      {/* panneau */}
      <rect x={x - 1.5} y={88} width={3} height={38} fill="#475569" />
      <rect x={x - 36} y={66} width={72} height={24} rx={6} fill="#0F766E" stroke="#134E4A" strokeWidth={1.5} />
      <text x={x} y={83} textAnchor="middle" fontSize={12.5} fontWeight={800} fill="#fff" fontFamily={FONT}>{name}</text>
      {/* les gens qui montent ou descendent */}
      {i > 0 && !km && !group && <Kids cx={x} n={Number(term.value.n)} foot={foot} top={foot - 36} mood={active ? mood : 'happy'} seed={i} />}
      {i > 0 && !km && group && (
        <g>
          {Array.from({ length: Math.min(3, Number(kk)) }, (_, g) => (
            <g key={g}>
              <Flag x={x - 30 + g * 24} foot={foot} m={mm} color={['#E11D48', '#0284C7', '#7C3AED'][g % 3]} label={mm} />
              <Kids cx={x - 22 + g * 24} n={1} foot={foot} top={foot - 26} mood={active ? mood : 'happy'} seed={i + g} />
            </g>
          ))}
          {ghost && absurdKind === 'groups' && (
            <g data-tr-ghost opacity={0.5}>
              {[0, 1, 2].map((g) => (
                <rect key={g} x={x - 40 + g * 28} y={foot - 54} width={22} height={52} rx={10} fill="none" stroke="#E11D48" strokeWidth={2} strokeDasharray="4 3" />
              ))}
              <text x={x} y={foot - 58} textAnchor="middle" fontSize={16} fontWeight={900} fill="#E11D48" fontFamily={FONT}>؟</text>
            </g>
          )}
        </g>
      )}
      {i > 0 && km && (
        <g>
          <rect x={x - 3} y={foot - 34} width={6} height={34} fill="#B45309" />
          <rect x={x - 26} y={foot - 54} width={52} height={22} rx={5} fill="#FEF3C7" stroke="#B45309" strokeWidth={1.5} />
          <text x={x} y={foot - 38} textAnchor="middle" fontSize={11.5} fontWeight={900} fill="#78350F" fontFamily={FONT}>{group ? iso(term.text) : iso(`${term.text} km`)}</text>
        </g>
      )}
      {/* l'étiquette de l'événement */}
      {badge && (
        <g data-tr-badge={i}>
          <rect x={x - badgeW / 2} y={38} width={badgeW} height={22} rx={11} fill={down ? '#FEE2E2' : '#DCFCE7'} stroke={down ? '#F87171' : '#4ADE80'} strokeWidth={1.5} />
          <text x={x} y={53.5} textAnchor="middle" fontSize={11.5} fontWeight={900} fill={down ? '#991B1B' : '#166534'} fontFamily={FONT}>{badge}</text>
          {ghost && absurdKind === 'overflow' && active && <text x={x + badgeW / 2 + 8} y={54} fontSize={18} fontWeight={900} fill="#E11D48" fontFamily={FONT}>؟</text>}
        </g>
      )}
      {i === 0 && !plain && (() => {
        const start = km ? k('badge.startKm', { n: iso(term.text) }) : k(group ? 'badge.startShare' : 'badge.start', { n: iso(C.numText(term.value)) });
        const w = Math.max(70, start.length * 6.6);
        return (
          <g data-tr-badge="0">
            <rect x={x - w / 2} y={38} width={w} height={22} rx={11} fill="#E0F2FE" stroke="#38BDF8" strokeWidth={1.5} />
            <text x={x} y={53.5} textAnchor="middle" fontSize={11.5} fontWeight={900} fill="#075985" fontFamily={FONT}>{start}</text>
          </g>
        );
      })()}
    </g>
  );
}

function Tram({ x, scale, counter, veiled, label, tone, pop }) {
  const color = tone === 'bad' ? '#F43F5E' : tone === 'ok' ? '#22C55E' : '#FBBF24';
  return (
    <g className="tr-tram" style={{ transform: `translate(${x}px, 0px) scale(${scale})`, transformOrigin: '0px 176px', transformBox: 'view-box' }} data-tr-tram>
      {[0, 1].map((c) => (
        <g key={c} transform={`translate(${-74 + c * 76}, 0)`}>
          <rect x={0} y={136} width={72} height={40} rx={8} fill={c === 1 ? '#0EA5E9' : '#38BDF8'} stroke="#075985" strokeWidth={1.5} />
          <rect x={0} y={160} width={72} height={9} fill="#0369A1" opacity={0.35} />
          {[0, 1, 2].map((w) => <rect key={w} x={7 + w * 21} y={142} width={16} height={14} rx={3} fill="#E0F2FE" stroke="#0C4A6E" strokeWidth={1} />)}
        </g>
      ))}
      <path d="M70 136 h12 q14 2 14 22 v18 h-26 z" fill="#0284C7" stroke="#075985" strokeWidth={1.5} />
      <rect x={76} y={144} width={13} height={14} rx={3} fill="#E0F2FE" stroke="#0C4A6E" strokeWidth={1} />
      {[-52, -24, 6, 38, 74].map((wx) => <circle key={wx} cx={wx} cy={180} r={6} fill="#1E293B" />)}
      {/* pantographe */}
      <path d="M-4 136 l10 -34 l12 0" fill="none" stroke="#334155" strokeWidth={2.2} />
      <line x1={-20} y1={102} x2={30} y2={102} stroke="#334155" strokeWidth={2.4} />
      {/* LE COMPTEUR : l'afficheur lumineux */}
      <g data-tr-led key={counter + String(veiled)} className={pop ? 'tr-pop' : ''}>
        <rect x={-58} y={106} width={116} height={28} rx={7} fill="#0F172A" stroke="#334155" strokeWidth={2} />
        <text x={-40} y={125} fontSize={9.5} fontWeight={800} fill="#94A3B8" textAnchor="middle" fontFamily={FONT}>{label}</text>
        <text x={22} y={127} fontSize={veiled ? 22 : 20} fontWeight={900} fill={color} textAnchor="middle" fontFamily="ui-monospace, monospace" style={{ letterSpacing: 1 }}>{veiled ? '؟' : iso(counter)}</text>
      </g>
    </g>
  );
}

function Kiosk({ width, task, replayValue, tone, k, ghost, mood }) {
  const cx = width / 2;
  const nums = task.numbers;           // « 150 ÷ 6 × 4 » : [150 DA, 6 tickets au carnet, 4 tickets voulus]
  return (
    <g data-tr-kiosk>
      <rect x={cx - 74} y={96} width={148} height={80} rx={8} fill="#FDE68A" stroke="#B45309" strokeWidth={2} />
      <path d={`M${cx - 84} 98 h168 l-10 -22 h-148 z`} fill="#DC2626" stroke="#7F1D1D" strokeWidth={1.5} />
      <rect x={cx - 60} y={108} width={120} height={46} rx={6} fill="#0F172A" stroke="#334155" strokeWidth={2} />
      <text x={cx} y={125} textAnchor="middle" fontSize={11.5} fontWeight={800} fill="#FDE68A" fontFamily={FONT}>{k('scene.tickets')}</text>
      <text x={cx} y={146} textAnchor="middle" fontSize={replayValue ? 17 : 16} fontWeight={900} fill={tone === 'bad' ? '#FB7185' : tone === 'ok' ? '#4ADE80' : '#FBBF24'} fontFamily="ui-monospace, monospace" data-tr-kiosk-price>
        {replayValue ? iso(`${replayValue} DA`) : iso(`${nums[1]} ← ${nums[0]} DA`)}
      </text>
      {ghost && <line x1={cx - 52} y1={142} x2={cx + 52} y2={142} stroke="#E11D48" strokeWidth={2.5} opacity={0.8} />}
      {/* le carnet de tickets */}
      <g>
        {Array.from({ length: Number(nums[1]) }, (_, i) => (
          <rect key={i} x={cx - 128 + i * 12} y={150 + (i % 2) * 2} width={10} height={20} rx={2} fill={i < Number(nums.at(-1)) ? '#FB923C' : '#FED7AA'} stroke="#9A3412" strokeWidth={1} />
        ))}
      </g>
      <KidFigure cx={cx + 112} top={118} foot={176} mood={mood} {...PEOPLE[0]} />
    </g>
  );
}

export default function TramScene({ plain = false, maxH, width, task, replay, at, counter, veiled, tone, k, uid, mood }) {
  const H = SCENE_H;
  const terms = task.terms;
  const n = task.kind === 'kiosk' ? 1 : terms.length;
  const xs = stationXs(n, width);
  const spacing = n > 1 ? xs[1] - xs[0] : 200;
  const trScale = Math.max(0.62, Math.min(1, spacing / 170));
  const label = k(task.kind === 'kiosk' ? 'counter.price' : task.unit === 'km' ? 'counter.km' : 'counter.pupils');
  const absurdKind = replay && !replay.ok ? replay.absurd?.kind : null;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${H}`} style={{ display: 'block', maxWidth: width, maxHeight: maxH, margin: '0 auto', direction: 'ltr' }} aria-hidden="true" data-tr-world>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BAE6FD" /><stop offset="1" stopColor="#F0F9FF" /></linearGradient>
      </defs>
      <rect x={0} y={0} width={width} height={H} fill={`url(#${uid}-sky)`} />
      {/* la ville au loin */}
      <g opacity={0.45} fill="#94A3B8">
        {[0.04, 0.16, 0.3, 0.46, 0.62, 0.78, 0.9].map((fx, i) => <rect key={i} x={width * fx} y={100 - (i % 3) * 14} width={width * 0.07} height={80 + (i % 3) * 14} rx={3} />)}
      </g>
      <rect x={0} y={179} width={width} height={H - 179} fill="#CBD5E1" />
      <rect x={0} y={191} width={width} height={4} fill="#64748B" />
      <rect x={0} y={199} width={width} height={4} fill="#64748B" />
      {Array.from({ length: Math.floor(width / 26) }, (_, i) => <rect key={i} x={i * 26 + 6} y={189} width={8} height={16} fill="#78716C" opacity={0.55} />)}
      {/* le fil de contact */}
      <line x1={0} y1={30} x2={width} y2={30} stroke="#334155" strokeWidth={2} />
      {task.kind === 'kiosk' ? (
        <Kiosk width={width} task={task} replayValue={replay ? replay.planText : null} tone={tone} k={k} ghost={absurdKind === 'price'} mood={mood} />
      ) : (
        <>
          {xs.map((x, i) => (
            <Station key={i} i={i} x={x} task={task} term={terms[i]} name={i === 0 ? k('scene.start') : k(`stop.${task.stops[i - 1] ?? 'station'}`)}
              ghost={!!replay && !replay.ok && replay.station === i} absurdKind={absurdKind} k={k} active={at === i} mood={mood} plain={plain} />
          ))}
          <Tram x={xs[Math.min(at, xs.length - 1)]} scale={trScale} counter={counter} veiled={veiled} label={label} tone={tone} pop />
        </>
      )}
    </svg>
  );
}
