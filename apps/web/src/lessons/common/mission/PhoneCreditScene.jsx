import KidFigure from '../manipulations/primitives/KidFigure';

const W = 480;
const H = 260;
const GROUND = 206;

/**
 * LE TÉLÉPHONE ET SA JAUGE DE CRÉDIT (leçon `mutarajiha-ula`, rollout 2026-11-11 ; conseil du 2026-11-11, verdict L3 — scène `phone-credit`) —
 * dessiné en code (CLAUDE.md : aucune image générée dans les leçons). Un grand téléphone légèrement incliné ; sur son écran une JAUGE verticale de
 * crédit (une colonne arrondie, un dégradé) avec un repère pointillé « plancher » vers le bas ; un garçon, dessiné par `KidFigure` (sweat), le tient.
 * De petites enveloppes quittent le téléphone en arc vers une maisonnette à la fenêtre allumée (chez les grands-parents ; aucun adulte n'est dessiné :
 * les personnes sont `KidFigure` seulement). `fill` ∈ [0, 1] : les enveloppes apparaissent une à une, la jauge DESCEND vers le repère et s'arrête juste
 * AU-DESSUS à `fill = 1`. Le repère est gris ardoise, jamais rouge (le rouge est la couleur des solutions de cette leçon). Aucun nombre ni aucune lettre
 * n'est dessiné ; le texte arabe reste dans le DOM. Immobile sous prefers-reduced-motion (aucune animation).
 */
const GAUGE = { x: 205, y: 62, w: 50, h: 108 };
const ENVELOPES = 6;

function Envelope({ x, y, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-9" y="-6" width="18" height="12" rx="2" fill="#fff" stroke="#475569" strokeWidth="1.2" />
      <path d="M-9 -6 L0 1 L9 -6" fill="none" stroke="#475569" strokeWidth="1.2" />
    </g>
  );
}

export default function PhoneCreditScene({ fill = 0, label, className = '', scene = 'phone-credit' }) {
  const f = Math.max(0, Math.min(1, fill));
  const done = f >= 1;
  // la jauge descend de 100 % à ~ 28 % du fond : elle s'arrête AU-DESSUS du repère (à 22 %)
  const level = 1 - 0.72 * f;
  const lvH = GAUGE.h * level;
  const floorY = GAUGE.y + GAUGE.h * (1 - 0.22);
  const sent = Math.round(f * ENVELOPES);
  // l'arc des enveloppes, du téléphone (255, 70) à la maisonnette (420, 120)
  const arc = (i) => {
    const t = (i + 1) / (ENVELOPES + 1);
    return { x: 262 + t * 150, y: 78 - Math.sin(Math.PI * t) * 34 + t * 40 };
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-credit={f.toFixed(2)}>
      <rect x="0" y="0" width={W} height={H} fill="#eff6ff" />
      <rect x="0" y={GROUND} width={W} height={H - GROUND} fill="#e2e8f0" />
      {/* la maisonnette, fenêtre allumée à la fin */}
      <g transform="translate(398 118)">
        <rect x="0" y="22" width="62" height="66" fill="#fde68a" stroke="#92400e" strokeWidth="1.5" />
        <path d="M-6 24 L31 -2 L68 24 Z" fill="#b45309" />
        <rect x="22" y="40" width="18" height="20" fill={done ? '#fef08a' : '#cbd5e1'} stroke="#92400e" strokeWidth="1.2" />
        <rect x="8" y="58" width="12" height="30" fill="#92400e" />
      </g>
      {/* les enveloppes envoyées */}
      {Array.from({ length: sent }, (_, i) => { const p = arc(i); return <Envelope key={i} x={p.x} y={p.y} rot={-14 + i * 5} />; })}
      {/* le téléphone */}
      <g transform="rotate(-6 230 116)">
        <rect x="178" y="30" width="104" height="170" rx="16" fill="#1e293b" />
        <rect x="186" y="44" width="88" height="142" rx="8" fill="#e0f2fe" />
        <rect x={GAUGE.x} y={GAUGE.y} width={GAUGE.w} height={GAUGE.h} rx="10" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.4" />
        <defs>
          <linearGradient id="phone-credit-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <rect x={GAUGE.x + 4} y={GAUGE.y + GAUGE.h - lvH + 4} width={GAUGE.w - 8} height={Math.max(0, lvH - 8)} rx="7" fill="url(#phone-credit-grad)" />
        <line x1={GAUGE.x - 8} x2={GAUGE.x + GAUGE.w + 8} y1={floorY} y2={floorY} stroke="#475569" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="230" cy="193" r="3.2" fill="#64748b" />
      </g>
      <KidFigure cx={120} top={104} foot={GROUND - 2} outfit="green" mood={done ? 'proud' : 'wonder'} />
    </svg>
  );
}
