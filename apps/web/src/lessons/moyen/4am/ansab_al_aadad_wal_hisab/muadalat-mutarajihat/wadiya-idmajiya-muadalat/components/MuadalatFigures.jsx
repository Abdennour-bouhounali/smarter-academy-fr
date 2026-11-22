
/**
 * Les figures de la synthèse, DESSINÉES (jamais une image) :
 *
 *   PoolScene   vignette DÉCORATIVE de la carte d'activité (aria-hidden) : le
 *               مسبح البلدي couvert de la photographie du manuel (p. 52),
 *               redessiné — toit, gradins, bassin à couloirs, plongeoirs.
 *               Aucune mesure : elle ne porte aucune information mathématique.
 *   NumberLine  un مستقيم مدرّج dans la convention du manuel (p. 48-49) : la partie des SOLUTIONS en rouge, un
 *               crochet à chaque borne, TOURNÉ VERS LE ROUGE quand la borne est
 *               une solution (≤, ≥) et vers l'extérieur sinon (<, >), une flèche
 *               au bout positif. La géométrie est `dir="ltr"` (les nombres
 *               croissent vers la droite, jamais miroités) ; le nom accessible est
 *               en arabe et la relation en notation latine.
 */

export function PoolScene() {
  const lanes = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true" focusable="false">
      {/* la halle : murs et grandes baies vitrées */}
      <rect width="160" height="90" fill="#E0F2FE" />
      <path d="M0 22 L80 6 L160 22 L160 40 L0 40 Z" fill="#CBD5E1" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={6 + i * 19.5} y="20" width="14" height="16" fill="#BAE6FD" stroke="#64748B" strokeWidth=".6" />
      ))}
      <path d="M0 22 L80 6 L160 22" fill="none" stroke="#475569" strokeWidth="1.4" />
      {/* les gradins à gauche */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={0} y={40 + i * 5} width={34 - i * 6} height="5" fill={i % 2 ? '#94A3B8' : '#64748B'} />
      ))}
      {/* la plage et le bassin en perspective */}
      <path d="M0 60 L160 44 L160 90 L0 90 Z" fill="#E7E5E4" />
      <path d="M16 66 L156 50 L160 86 L8 90 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="1" />
      {/* les lignes de couloir (flotteurs rouges et blancs) */}
      {lanes.map((i) => {
        const t = (i + 1) / (lanes.length + 1);
        const y1 = 66 + (90 - 66) * t; const y2 = 50 + (86 - 50) * t;
        return <line key={i} x1={14 - 6 * t} y1={y1} x2={157} y2={y2} stroke={i % 2 ? '#F8FAFC' : '#E11D48'} strokeWidth="1.1" strokeDasharray="3 2" />;
      })}
      {/* les plots de départ */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={150} y={50 + i * 6} width="5" height="3" fill="#F8FAFC" stroke="#334155" strokeWidth=".5" />
      ))}
      {/* reflets */}
      <path d="M40 76 q6 -2 12 0 t12 0 M90 70 q6 -2 12 0 t12 0" fill="none" stroke="#E0F2FE" strokeWidth="1" />
    </svg>
  );
}

const W = 300; const H = 64; const AX = 30; const PAD = 22;

/** Le crochet d'une borne : `toward` = +1 si son ouverture regarde la droite, −1 la gauche. */
function Bracket({ cx, toward, color }) {
  const s = 7 * toward;
  return <path d={`M${cx + s} ${AX - 10} L${cx} ${AX - 10} L${cx} ${AX + 10} L${cx + s} ${AX + 10}`} fill="none" stroke={color} strokeWidth="2.4" />;
}

/**
 * Un مستقيم مدرّج et ses solutions.
 *   demi-droite :  { bound, side: 'left' | 'right', included }
 *   segment     :  { lo, hi, loIncluded, hiIncluded }
 * `ticks` : les graduations écrites (défaut : les bornes et 0) ; `labels` : { [valeur]: texte }
 * pour une borne fractionnaire (« −1/3 », « 21/2 ») — jamais un décimal approché.
 */
export function NumberLine({ bound, side, included, lo, hi, loIncluded, hiIncluded, ticks, labels = {}, label, compact = false }) {
  const isSeg = lo !== undefined && hi !== undefined;
  const marks = ticks ?? [...new Set([...(isSeg ? [lo, hi] : [bound]), 0])].sort((a, b) => a - b);
  const min = Math.min(...marks) - 2; const max = Math.max(...marks) + 2;
  const X = (v) => PAD + ((v - min) / (max - min)) * (W - 2 * PAD);
  const red = '#DC2626'; const ink = '#334155';
  let seg; let brackets;
  if (isSeg) {
    seg = [X(lo), X(hi)];
    brackets = [
      { v: lo, toward: loIncluded ? 1 : -1 },
      { v: hi, toward: hiIncluded ? -1 : 1 },
    ];
  } else {
    seg = side === 'right' ? [X(bound), W - 8] : [6, X(bound)];
    const redDir = side === 'right' ? 1 : -1;
    brackets = [{ v: bound, toward: included ? redDir : -redDir }];
  }
  return (
    <span dir="ltr" className="inline-flex justify-center" data-number-line={isSeg ? `${lo}|${hi}` : `${bound}|${side}|${included ? 'in' : 'out'}`}>
      <svg width={compact ? 220 : W} height={compact ? 47 : H} viewBox={`0 0 ${W} ${H}`} className="max-w-full" role="img" aria-label={label}>
        <line x1="4" y1={AX} x2={W - 6} y2={AX} stroke={ink} strokeWidth="1.6" />
        <path d={`M${W - 12} ${AX - 5} L${W - 4} ${AX} L${W - 12} ${AX + 5}`} fill="none" stroke={ink} strokeWidth="1.6" />
        <line x1={seg[0]} y1={AX} x2={seg[1]} y2={AX} stroke={red} strokeWidth="4" strokeLinecap="round" />
        {marks.map((v) => (
          <g key={v}>
            <line x1={X(v)} y1={AX - 4} x2={X(v)} y2={AX + 4} stroke={ink} strokeWidth="1.2" />
            <text x={X(v)} y={AX + 24} fontSize="14" textAnchor="middle" fill="#0F172A">{labels[v] ?? (v < 0 ? `−${-v}` : v)}</text>
          </g>
        ))}
        {brackets.map((b) => <Bracket key={b.v} cx={X(b.v)} toward={b.toward} color={red} />)}
      </svg>
    </span>
  );
}
