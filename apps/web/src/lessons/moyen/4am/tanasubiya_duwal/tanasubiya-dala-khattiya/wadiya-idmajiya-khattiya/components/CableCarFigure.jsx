
/**
 * Les figures de la synthèse, DESSINÉES (jamais une image) :
 *
 *   CableCarFigure   la figure du manuel (p. 74) redessinée À L'ÉCHELLE : A au départ (900 m),
 *                    B à l'arrivée (1400 m), H le pied de la verticale issue de B au niveau de A,
 *                    l'angle droit en H, AH = 2500 m, le câble [AB]. 1 px = 10 m sur les DEUX axes
 *                    (AH = 250 px, BH = 50 px) : la pente dessinée est la vraie. BH n'est PAS écrit
 *                    (l'élève le déduit des altitudes). Arbres et cabine décoratifs (`aria-hidden`
 *                    sur leur groupe) ; la cabine ne porte aucune mesure.
 *                    `params` permet de dessiner l'autre téléphérique de la plateforme avec la même
 *                    figure (mêmes conventions, autre échelle calculée pour tenir dans le cadre).
 *   CableCarVignette vignette DÉCORATIVE de la carte d'activité (aria-hidden) : montagne, câble,
 *                    cabine — sans aucun nombre.
 */
const SKY = '#E0F2FE';
const GRASS = '#BBF7D0';

function Tree({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-1.5" y="-4" width="3" height="5" fill="#92400E" />
      <path d="M0 -22 L9 -4 L-9 -4 Z" fill="#15803D" />
      <path d="M0 -28 L7 -14 L-7 -14 Z" fill="#16A34A" />
    </g>
  );
}

function Cabin({ x, y }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 9} stroke="#334155" strokeWidth="1.2" />
      <rect x={x - 9} y={y + 9} width="18" height="13" rx="4" fill="#38BDF8" stroke="#0369A1" strokeWidth="1" />
      <rect x={x - 6} y={y + 12} width="5" height="5" rx="1" fill="#F0F9FF" />
      <rect x={x + 1} y={y + 12} width="5" height="5" rx="1" fill="#F0F9FF" />
    </g>
  );
}

/**
 * @param {{ altA?: number, altB?: number, AH?: number, label?: string }} params  les nombres de la
 *   figure (défaut : ceux du manuel). La figure n'invente rien : elle écrit ce qu'on lui donne.
 */
export function CableCarFigure({ altA = 900, altB = 1400, AH = 2500, label = 'شكل المصعد الهوائي' }) {
  const rise = altB - altA;
  // Même échelle sur les deux axes : la largeur utile (250 px) porte AH.
  const k = 250 / AH;
  const A = { x: 40, y: 150 };
  const H = { x: A.x + AH * k, y: A.y };
  const B = { x: H.x, y: A.y - rise * k };
  const t = 0.42;
  const cab = { x: A.x + t * (B.x - A.x), y: A.y + t * (B.y - A.y) };
  const sq = 8;
  return (
    <svg viewBox="0 0 330 190" className="mx-auto block h-auto w-full max-w-md" role="img" aria-label={`${label}: الحبل AB، المسافة الأفقية AH تساوي ${AH} متر، الارتفاع عند A ${altA} متر وعند B ${altB} متر، والزاوية في H قائمة`} data-cablecar-figure>
      <rect width="330" height="190" fill={SKY} />
      <path d={`M0 ${A.y} L330 ${A.y} L330 190 L0 190 Z`} fill={GRASS} />
      {/* la colline qui porte B (décor) */}
      <path d={`M${H.x - 30} ${A.y} Q${H.x - 5} ${B.y - 4} ${H.x + 30} ${B.y + 2} L330 ${B.y + 6} L330 ${A.y} Z`} fill="#86EFAC" aria-hidden="true" />
      <g aria-hidden="true">
        {[12, 70, 98, 128, 196, 228].map((x, i) => <Tree key={x} x={x} y={A.y + 6 + (i % 2) * 8} s={0.8 + (i % 3) * 0.1} />)}
        <Tree x={H.x + 18} y={B.y + 4} s={0.8} />
        <Tree x={H.x + 36} y={B.y + 8} s={0.7} />
      </g>
      {/* le triangle AHB : horizontale AH, verticale HB, angle droit en H */}
      <line x1={A.x} y1={A.y} x2={H.x} y2={H.y} stroke="#1E293B" strokeWidth="1.2" strokeDasharray="4 3" />
      <line x1={H.x} y1={H.y} x2={B.x} y2={B.y} stroke="#B91C1C" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d={`M${H.x - sq} ${H.y} L${H.x - sq} ${H.y - sq} L${H.x} ${H.y - sq}`} fill="none" stroke="#1E293B" strokeWidth="1" />
      {/* le câble [AB] */}
      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#0F172A" strokeWidth="1.8" />
      <g aria-hidden="true"><Cabin x={cab.x} y={cab.y} /></g>
      {[A, H, B].map((p) => <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r="2.4" fill="#0F172A" />)}
      <text x={A.x - 6} y={A.y - 6} fontSize="13" fontWeight="700" textAnchor="end" fill="#0F172A">A</text>
      <text x={H.x + 6} y={H.y + 14} fontSize="13" fontWeight="700" fill="#0F172A">H</text>
      <text x={B.x + 6} y={B.y - 4} fontSize="13" fontWeight="700" fill="#0F172A">B</text>
      <text x={(A.x + H.x) / 2} y={A.y + 26} fontSize="12" fontWeight="700" textAnchor="middle" fill="#1E293B" direction="ltr">{`${AH} m`}</text>
      {/* les altitudes, en DOM : nombres et unité (lus de gauche à droite) */}
      <text x={A.x - 2} y={A.y + 22} fontSize="10.5" textAnchor="middle" fill="#334155" direction="ltr">{`${altA} m`}</text>
      <text x={B.x - 8} y={B.y - 14} fontSize="10.5" textAnchor="end" fill="#334155" direction="ltr">{`${altB} m`}</text>
    </svg>
  );
}

export function CableCarVignette() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true" focusable="false">
      <rect width="160" height="90" fill={SKY} />
      <circle cx="132" cy="18" r="9" fill="#FDE68A" />
      <path d="M0 90 L0 70 Q40 58 70 66 Q110 40 160 30 L160 90 Z" fill="#86EFAC" />
      <path d="M0 90 L0 80 Q60 70 160 74 L160 90 Z" fill={GRASS} />
      <line x1="14" y1="72" x2="148" y2="34" stroke="#0F172A" strokeWidth="1.2" />
      <Cabin x={78} y={53} />
      {[10, 26, 40, 120, 136].map((x, i) => <Tree key={x} x={x} y={i < 3 ? 84 : 52} s={0.6} />)}
    </svg>
  );
}
