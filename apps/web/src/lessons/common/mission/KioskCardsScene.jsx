import KidFigure from '../manipulations/primitives/KidFigure';

const W = 480;
const H = 260;
const GROUND = 214;

/**
 * LE KIOSQUE DU QUARTIER ET SES DEUX CARTES (leçon `hall-jabri`, rollout 2026-11-12 ; conseil du 2026-11-11, verdict L2.13 — scène `kiosk-cards`) —
 * dessiné en code (CLAUDE.md : aucune image générée dans les leçons), sans rien importer de la leçon (le `KioskVignette` de la page reste à elle).
 * Un kiosque à l'auvent rouge et blanc, un comptoir avec un plateau de كرنتيكة et deux bouteilles de قازوز ; sur sa façade, deux CARTES BLANCHES
 * épinglées, chacune avec une tuile ambre et une tuile sarcelle (les couleurs x / y du labo), sans aucun nombre ni aucun texte. Deux clients dessinés par
 * `KidFigure` — une fille en hijab et un garçon en sweat — les regardent ; aucun adulte (le vendeur est derrière le volet). `fill` ∈ [0, 1] : à mesure
 * que les outils sont acquis, la tuile sarcelle de la première carte pâlit puis est barrée (« un prix disparaît ») et les enfants passent de l'étonnement
 * à la fierté. Aucun nombre ni aucune lettre n'est dessiné ; le texte arabe reste dans le DOM. Immobile (aucune animation).
 */
function PriceCard({ x, y, rot = 0, gone = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-34" y="-22" width="68" height="44" rx="5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="0" cy="-22" r="3" fill="#dc2626" />
      <rect x="-26" y="-9" width="20" height="20" rx="4" fill="#fbbf24" stroke="#b45309" strokeWidth="1.3" />
      <rect x="6" y="-9" width="20" height="20" rx="4" fill="#2dd4bf" stroke="#0f766e" strokeWidth="1.3" opacity={1 - 0.65 * gone} />
      {gone >= 1 && <path d="M4 -11 L28 13" stroke="#334155" strokeWidth="2.4" strokeLinecap="round" />}
    </g>
  );
}

export default function KioskCardsScene({ fill = 0, label, className = '', scene = 'kiosk-cards' }) {
  const f = Math.max(0, Math.min(1, fill));
  const done = f >= 1;
  const stripes = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-fill={f.toFixed(2)}>
      <rect x="0" y="0" width={W} height={H} fill="#fff7ed" />
      <rect x="0" y={GROUND} width={W} height={H - GROUND} fill="#e2e8f0" />
      {/* le kiosque : murs, auvent rayé, volet entrouvert */}
      <rect x="140" y="70" width="240" height={GROUND - 70} fill="#fde68a" stroke="#92400e" strokeWidth="2" />
      {stripes.map((i) => <rect key={i} x={130 + i * 22} y="48" width="22" height="26" fill={i % 2 ? '#ffffff' : '#dc2626'} />)}
      <path d={`M130 74 ${stripes.map((i) => `Q${141 + i * 22} 86 ${152 + i * 22} 74`).join(' ')}`} fill="none" stroke="#b91c1c" strokeWidth="2" />
      <rect x="160" y="84" width="200" height="40" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1="160" x2="360" y1={92 + i * 9} y2={92 + i * 9} stroke="#94a3b8" strokeWidth="1" />)}
      {/* le comptoir : un plateau de كرنتيكة et deux bouteilles de قازوز */}
      <rect x="150" y="124" width="220" height="12" fill="#b45309" />
      <rect x="168" y="112" width="60" height="12" rx="2" fill="#fcd34d" stroke="#b45309" />
      {[1, 2, 3].map((i) => <line key={i} x1={168 + i * 15} x2={168 + i * 15} y1="112" y2="124" stroke="#d97706" strokeWidth="1" />)}
      {[0, 1].map((b) => (
        <g key={b} transform={`translate(${318 + b * 20} 96)`}>
          <rect x="4" y="0" width="6" height="6" rx="1" fill={b ? '#f97316' : '#16a34a'} />
          <path d="M3 6 L11 6 L13 12 L13 28 L1 28 L1 12 Z" fill={b ? '#fdba74' : '#86efac'} stroke={b ? '#c2410c' : '#15803d'} />
        </g>
      ))}
      {/* les deux cartes blanches épinglées sur la façade */}
      <PriceCard x={206} y={168} rot={-4} gone={f} />
      <PriceCard x={314} y={168} rot={3} />
      {/* deux clients : une fille en hijab et un garçon */}
      <KidFigure cx={70} top={118} foot={GROUND - 2} hairStyle="hijab" scarf="rose" outfit="violet" mood={done ? 'proud' : 'wonder'} />
      <KidFigure cx={430} top={124} foot={GROUND - 2} outfit="blue" mood={done ? 'proud' : 'wonder'} />
    </svg>
  );
}
