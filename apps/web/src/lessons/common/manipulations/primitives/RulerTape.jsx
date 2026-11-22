import { tapeLayout, restFraction } from '../logic/rulerCompare';

/**
 * LE RUBAN D'UN SAUT (labo `ruler-compare`, MANIPULATION_CONTRACT §2quatervicies) — un mètre ruban jaune posé sur le sable, dans un îlot LTR.
 *
 * À la graduation courante, la longueur du saut se LIT : `count` cases ENTIÈRES (étiquetées par leur numéro, la dernière dans une pastille :
 * c'est la lecture) puis la case du RESTE, hachurée, dessinée en fraction EXACTE d'une graduation (`rest` = `{ n, k }`, jamais arrondi),
 * et le fanion planté à l'abscisse exacte du saut. Trop long pour tenir, le ruban est coupé à gauche (zigzag) : on ne dessine que
 * les dernières cases. Sinon il part de la planche d'appel.
 *
 * Le dessin ne donne pas le verdict : la fenêtre ne montre que les dernières cases (jamais la longueur totale à l'échelle).
 *
 * Props : `width`, `height`, `count`, `rest` ({ n, k }), `restIsZero`, `uid` (ids SVG uniques), `label` (aria), `hue` (couleur du fanion).
 * DOM : [data-rc-tape][data-count][data-shown][data-broken], [data-rc-cell=<i>], [data-rc-restcell][data-frac], [data-rc-flag].
 */
export default function RulerTape({ width, height = 66, count, rest, restIsZero, uid, label, flag = '#DC2626', board = true }) {
  const frac = restIsZero ? 0 : restFraction(rest);
  const T = tapeLayout({ width, count, frac });
  const top = Math.round(height * 0.3);
  const th = Math.round(height * 0.46);
  const cells = Array.from({ length: T.shown }, (_, i) => i);
  const fs = th >= 28 ? 14 : 12;
  const hatch = `${uid}h`;
  return (
    <svg width={Math.min(width, T.total)} height={height} viewBox={`0 0 ${Math.min(width, T.total)} ${height}`} role="img" aria-label={label} dir="ltr"
      data-rc-tape data-count={count} data-shown={T.shown} data-broken={T.broken ? 'true' : 'false'} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <pattern id={hatch} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="#FEF3C7" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#B45309" strokeWidth="3.2" />
        </pattern>
      </defs>

      {/* le début du ruban : la planche d'appel, ou la coupure */}
      {board && !T.broken && (
        <g>
          <rect x={1} y={top - 3} width={T.boardW - 3} height={th + 6} rx={3} fill="#A16207" stroke="#713F12" strokeWidth={1.5} />
          <rect x={1} y={top - 3} width={T.boardW - 3} height={4} rx={2} fill="#CA8A04" />
        </g>
      )}
      {T.broken && (
        <g aria-hidden="true">
          <path d={`M${T.boardW} ${top} l-7 ${th / 6} l7 ${th / 6} l-7 ${th / 6} l7 ${th / 6} l-7 ${th / 6} l7 ${th / 6} z`} fill="#FACC15" stroke="#713F12" strokeWidth={1.5} strokeLinejoin="round" />
          {[0, 1, 2].map((i) => <circle key={i} cx={4 + i * 6} cy={top + th / 2} r={1.8} fill="#92400E" />)}
        </g>
      )}

      {/* les cases entières : chacune porte son numéro, la dernière (la lecture) est foncée */}
      {cells.map((i) => {
        const x0 = T.boardW + i * T.cw;
        const lab = T.firstLabel + i;
        const isLast = i === T.shown - 1;
        const digits = String(lab).length;
        const size = Math.max(9, Math.min(fs, Math.floor((T.cw - 5) / (digits * 0.64))));
        return (
          <g key={i} data-rc-cell={i}>
            <rect x={x0} y={top} width={T.cw} height={th} fill={isLast ? '#4338CA' : i % 2 ? '#FDE047' : '#FACC15'} stroke="#713F12" strokeWidth={1.5} />
            <text x={x0 + T.cw / 2} y={top + th / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={900} fill={isLast ? '#FFFFFF' : '#713F12'}
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }} data-rc-lastlabel={isLast ? '' : undefined}>{lab}</text>
          </g>
        );
      })}

      {/* la case du reste : une fraction exacte d'une graduation, hachurée */}
      <g data-rc-restcell data-frac={restIsZero ? '0' : `${rest.n}/${10 ** rest.k}`} data-zero={restIsZero ? 'true' : 'false'}>
        <rect x={T.restX} y={top} width={T.restW} height={th} fill={restIsZero ? 'transparent' : '#FFFBEB'} stroke="#92400E" strokeWidth={1.5} strokeDasharray="4 3" opacity={restIsZero ? 0.45 : 1} />
        {!restIsZero && <rect x={T.restX} y={top} width={Math.max(1.5, frac * T.restW)} height={th} fill={`url(#${hatch})`} stroke="#B45309" strokeWidth={1} />}
      </g>

      {/* le fanion, à l'abscisse exacte du saut */}
      <g data-rc-flag>
        <line x1={T.flagX} x2={T.flagX} y1={top - 18} y2={top + th + 3} stroke="#1F2937" strokeWidth={2.2} strokeLinecap="round" />
        <path d={`M${T.flagX} ${top - 18} L${T.flagX + 15} ${top - 12.5} L${T.flagX} ${top - 7} Z`} fill={flag} stroke="#7F1D1D" strokeWidth={1} strokeLinejoin="round" />
        <circle cx={T.flagX} cy={top + th + 3} r={3} fill="#1F2937" />
      </g>
    </svg>
  );
}
