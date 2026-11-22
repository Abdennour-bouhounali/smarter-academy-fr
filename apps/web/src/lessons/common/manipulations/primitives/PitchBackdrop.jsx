
/**
 * LE TERRAIN — un vrai terrain de football, dessiné.
 *
 * Vue de dessus, en SVG paramétré : pelouse tondue en bandes alternées,
 * ligne médiane, rond central, deux surfaces de réparation avec leur
 * demi-cercle et leur point de penalty, buts et corners. C'est le dessin de
 * référence demandé par le propriétaire (2026-09-20), rendu en vectoriel.
 *
 * POURQUOI PAS UNE IMAGE. Root CLAUDE.md : aucune image matricielle sous
 * `lessons/`. Ici la raison est aussi pratique — le terrain doit :
 *   • se redimensionner sans flou du téléphone au vidéoprojecteur ;
 *   • accepter les joueurs POSÉS dessus par-dessus, en DOM, donc rester un
 *     fond qui ne capte aucun événement de pointeur ;
 *   • suivre le thème sans nouveau fichier.
 * Une photo de pelouse ne fait rien de tout cela, et pèserait plus que le
 * reste de la leçon.
 *
 * C'EST UN DÉCOR, ET IL SE TIENT À SA PLACE. Le terrain ne porte aucune
 * information mathématique : il rend la scène reconnaissable, rien de plus.
 * Il est donc `aria-hidden`, `pointer-events: none`, et il ne change jamais
 * quand les nombres changent — ce qui change, ce sont les joueurs.
 *
 * ORIENTATION VERTICALE, PROPORTIONS RÉELLES : largeur = 2/3 de la hauteur,
 * comme la référence. Le terrain n'est JAMAIS étiré pour remplir sa boîte —
 * un rond central devenu ellipse se voit au premier coup d'œil. La boîte
 * s'adapte au terrain, pas l'inverse.
 *   `full` (défaut) — le terrain entier, vertical ;
 *   `half`          — une moitié de terrain, pour une petite zone.
 */
export default function PitchBackdrop({ variant = 'full', stripes = 9, className = '', rounded = 14 }) {
  // PROPORTIONS RÉELLES : largeur = 2/3 de la hauteur. Un terrain de football
  // vu de dessus est plus haut que large dans ce cadrage, et c'est ce rapport
  // qui le rend reconnaissable — on ne l'étire jamais pour remplir une boîte.
  const W = 300;
  const H = variant === 'half' ? W : Math.round((W * 3) / 2);
  const band = H / stripes;  // hauteur d'une bande de tonte (cadrages verticaux)
  const line = '#FFFFFF';
  const lw = 2.2;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className={`pointer-events-none h-full w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Le grain de la pelouse : un bruit très doux, sinon le vert paraît plastique. */}
        <filter id="pitch-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" result="d" />
          <feComponentTransfer in="d" result="soft">
            <feFuncA type="linear" slope="0.10" />
          </feComponentTransfer>
          <feComposite in="soft" in2="SourceGraphic" operator="over" />
        </filter>
        <clipPath id={`pitch-clip-${variant}`}>
          <rect x="0" y="0" width={W} height={H} rx={rounded} />
        </clipPath>
      </defs>

      <g clipPath={`url(#pitch-clip-${variant})`}>
        {/* pelouse + bandes de tonte alternées */}
        <rect x="0" y="0" width={W} height={H} fill="#2E9E4F" />
        {Array.from({ length: stripes }, (_, i) => (
          <rect key={i} x="0" y={i * band} width={W} height={band}
            fill={i % 2 === 0 ? '#35AB58' : '#2A9149'} />
        ))}
        <rect x="0" y="0" width={W} height={H} fill="#FFFFFF" opacity="0.04" filter="url(#pitch-grain)" />

        {/* ── les tracés ─────────────────────────────────────────────── */}
        <g fill="none" stroke={line} strokeWidth={lw} opacity="0.92">
          {/* touche */}
          <rect x="10" y="10" width={W - 20} height={H - 20} />

          {variant === 'full' ? (
            <>
              {/* médiane + rond central */}
              <line x1="10" y1={H / 2} x2={W - 10} y2={H / 2} />
              <circle cx={W / 2} cy={H / 2} r="46" />
              <circle cx={W / 2} cy={H / 2} r="2.6" fill={line} stroke="none" />
              {/* surface haute */}
              <rect x={(W - 170) / 2} y="10" width="170" height="66" />
              <rect x={(W - 78) / 2} y="10" width="78" height="26" />
              <path d={`M ${(W - 56) / 2} 76 A 28 24 0 0 0 ${(W + 56) / 2} 76`} />
              <circle cx={W / 2} cy="52" r="2.2" fill={line} stroke="none" />
              {/* surface basse */}
              <rect x={(W - 170) / 2} y={H - 76} width="170" height="66" />
              <rect x={(W - 78) / 2} y={H - 36} width="78" height="26" />
              <path d={`M ${(W - 56) / 2} ${H - 76} A 28 24 0 0 1 ${(W + 56) / 2} ${H - 76}`} />
              <circle cx={W / 2} cy={H - 52} r="2.2" fill={line} stroke="none" />
            </>
          ) : (
            <>
              {/* moitié de terrain, même rapport, pour les petites zones */}
              <line x1="10" y1={H - 10} x2={W - 10} y2={H - 10} />
              <path d={`M ${W / 2 - 40} ${H - 10} A 40 34 0 0 1 ${W / 2 + 40} ${H - 10}`} />
              <rect x={(W - 170) / 2} y="10" width="170" height="60" />
              <rect x={(W - 78) / 2} y="10" width="78" height="24" />
              <path d={`M ${(W - 52) / 2} 70 A 26 22 0 0 0 ${(W + 52) / 2} 70`} />
              <circle cx={W / 2} cy="48" r="2.2" fill={line} stroke="none" />
            </>
          )}

          {/* corners */}
          <path d="M 10 20 A 10 10 0 0 0 20 10" />
          <path d={`M ${W - 20} 10 A 10 10 0 0 0 ${W - 10} 20`} />
          {variant === 'full' && (
            <>
              <path d={`M 10 ${H - 20} A 10 10 0 0 1 20 ${H - 10}`} />
              <path d={`M ${W - 20} ${H - 10} A 10 10 0 0 1 ${W - 10} ${H - 20}`} />
            </>
          )}
        </g>
      </g>
    </svg>
  );
}

