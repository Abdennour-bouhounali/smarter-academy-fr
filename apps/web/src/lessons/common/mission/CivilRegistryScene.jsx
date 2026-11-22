import KidFigure from '../manipulations/primitives/KidFigure';

const W = 480;
const H = 260;
const FLOOR = 204;
const DESKS = 4;

/**
 * LE GUICHET DE L'ÉTAT CIVIL (leçon `mafhum-jumla`, rollout 2026-11-12 ; conseil du 2026-11-11, verdict « L1 », X8 : aucun adulte dessiné) — en code
 * (CLAUDE.md : aucune image générée dans les leçons). La salle de la mairie : un comptoir sous l'enseigne « الحالة المدنية » (texte arabe VIVANT, dans
 * le DOM), une rangée de quatre bureaux VIDES aux plaques sans nom et aux lampes éteintes — on ne sait pas encore combien d'hommes et de femmes y
 * travaillent —, une horloge murale SANS chiffres, le drapeau national. Devant le comptoir, deux élèves de 4AM (par `KidFigure` : une fille en hijab
 * qui tient un dossier, un garçon) viennent chercher un extrait de naissance pour leur dossier du BEM. `fill` ∈ [0, 1] suit les quatre outils : une
 * lampe s'allume par outil ; à 1 les quatre plaques s'éclairent. Aucun nombre, aucune lettre « x » n'est dessiné.
 */
export default function CivilRegistryScene({ fill = 0, label, className = '', scene = 'civil-registry' }) {
  const f = Math.max(0, Math.min(1, fill));
  const lit = f >= 1 ? DESKS : Math.min(DESKS, Math.floor(f * DESKS + 1e-6));
  const done = f >= 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-fill={f.toFixed(2)}>
      {/* le mur, le sol */}
      <rect x="0" y="0" width={W} height={FLOOR} fill="#F5F3EF" />
      <rect x="0" y="118" width={W} height="6" fill="#E7E0D3" />
      <rect x="0" y={FLOOR} width={W} height={H - FLOOR} fill="#D6CFC2" />
      <rect x="0" y={FLOOR} width={W} height="4" fill="#B9AF9E" />
      {/* l'enseigne : texte arabe vivant */}
      <g data-sign>
        <rect x="150" y="10" width="180" height="34" rx="6" fill="#0F5132" />
        <text x="240" y="33" textAnchor="middle" fontSize="17" fontWeight="700" fill="#FFFFFF" direction="rtl" fontFamily="inherit">الحالة المدنية</text>
      </g>
      {/* l'horloge sans chiffres */}
      <g data-clock>
        <circle cx="404" cy="40" r="20" fill="#FFFFFF" stroke="#334155" strokeWidth="3" />
        {Array.from({ length: 12 }, (_, h) => <line key={h} x1="404" y1="23" x2="404" y2="27" stroke="#64748B" strokeWidth="1.5" transform={`rotate(${h * 30} 404 40)`} />)}
        <line x1="404" y1="40" x2="404" y2="28" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="404" y1="40" x2="414" y2="44" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* le drapeau national */}
      <g data-flag>
        <rect x="58" y="14" width="3" height="58" fill="#64748B" />
        <rect x="61" y="16" width="22" height="30" fill="#0B8A44" />
        <rect x="83" y="16" width="22" height="30" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.6" />
        <circle cx="84" cy="31" r="8" fill="#D21034" />
        <circle cx="86.6" cy="31" r="6.6" fill="#FFFFFF" />
        <polygon points="89,27.6 90,30.3 92.8,30.3 90.5,31.9 91.4,34.6 89,33 86.6,34.6 87.5,31.9 85.2,30.3 88,30.3" fill="#D21034" />
      </g>
      {/* les quatre bureaux vides : plaque sans nom, lampe (une par outil) */}
      <g data-desks={lit}>
        {Array.from({ length: DESKS }, (_, i) => {
          const x = 46 + i * 104;
          const on = i < lit;
          return (
            <g key={i} data-desk={i} data-lit={on ? 'true' : 'false'}>
              <rect x={x} y="84" width="84" height="34" rx="4" fill="#A47148" />
              <rect x={x + 4} y="118" width="6" height="22" fill="#7C5434" />
              <rect x={x + 74} y="118" width="6" height="22" fill="#7C5434" />
              <rect x={x + 22} y="70" width="40" height="13" rx="2" fill={on ? '#FEF3C7' : '#E2E8F0'} stroke={on ? '#D97706' : '#94A3B8'} />
              <line x1={x + 70} y1="84" x2={x + 70} y2="62" stroke="#475569" strokeWidth="2" />
              <path d={`M${x + 62} 62 L${x + 78} 62 L${x + 74} 52 L${x + 66} 52 Z`} fill={on ? '#FBBF24' : '#94A3B8'} />
              {on && <circle cx={x + 70} cy="66" r="7" fill="#FDE68A" opacity="0.55" />}
              <rect x={x + 30} y="96" width="22" height="10" rx="1" fill="#F8FAFC" opacity="0.85" />
            </g>
          );
        })}
      </g>
      {/* le comptoir */}
      <rect x="20" y="150" width="440" height="20" rx="4" fill="#8B5E3C" />
      <rect x="20" y="170" width="440" height={FLOOR - 170} fill="#9C6B45" />
      <rect x="196" y="140" width="56" height="10" rx="2" fill="#F8FAFC" stroke="#CBD5E1" />
      {/* deux élèves au comptoir */}
      <KidFigure cx={330} top={128} foot={FLOOR + 44} hairStyle="hijab" scarf="lavender" outfit="teal" mood={done ? 'proud' : 'wonder'} />
      <g data-folder>
        <rect x="346" y="178" width="22" height="16" rx="2" fill="#2563EB" transform="rotate(-8 357 186)" />
        <rect x="349" y="181" width="16" height="2" fill="#BFDBFE" transform="rotate(-8 357 186)" />
      </g>
      <KidFigure cx={400} top={124} foot={FLOOR + 44} outfit="blue" hair="black" mood={done ? 'happy' : 'neutral'} />
    </svg>
  );
}
