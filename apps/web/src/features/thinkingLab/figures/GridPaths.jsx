import { FIG, ltrText } from './palette';

/**
 * #340 « الطرق على الشبكة » — une grille de n × n carrés (props.n, 4 par défaut), le coin A
 * en bas à gauche, le coin B en haut à droite, un chemin exemple, le chemin écrit comme un
 * MOT de lettres « ي » (يمين) et « أ » (أعلى), et le nombre de chemins vers chaque nœud
 * (triangle de Pascal), CALCULÉ par la règle « gauche + dessous ».
 */
export const LAYERS = ['grid', 'ends', 'path', 'manyPaths', 'word', 'pascal'];
export const BASE_LAYERS = ['grid', 'ends'];

const SIZE = 216; // côté de la grille en px
const OX = 58;
const OY = 262; // bas de la grille

/** Le chemin exemple : R = droite, U = haut (n droites et n hauts). */
const samplePath = (n) => {
  const base = 'RRURUURU';
  if (n === 4) return base;
  return 'R'.repeat(n) + 'U'.repeat(n);
};
/** Quelques autres chemins (la piste abandonnée « je les dessine tous »). */
const otherPaths = (n) => {
  const half = Math.floor(n / 2);
  return [
    'U'.repeat(n) + 'R'.repeat(n),
    'R'.repeat(n) + 'U'.repeat(n),
    'RU'.repeat(n),
    'UR'.repeat(n),
    'R'.repeat(half) + 'U'.repeat(n) + 'R'.repeat(n - half),
    'U'.repeat(half) + 'R'.repeat(n) + 'U'.repeat(n - half),
  ];
};

function nodesOf(word) {
  const pts = [[0, 0]];
  for (const step of word) {
    const [i, j] = pts[pts.length - 1];
    pts.push(step === 'R' ? [i + 1, j] : [i, j + 1]);
  }
  return pts;
}

function pascal(n) {
  const w = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) w[i][j] = i === 0 || j === 0 ? 1 : w[i - 1][j] + w[i][j - 1];
  }
  return w;
}

function Label({ at, dx = 0, dy = 0, children, color = FIG.label, size = 15, ltr = true }) {
  return (
    <text x={at[0] + dx} y={at[1] + dy} fill={color} fontSize={size} fontWeight="600" textAnchor="middle" dominantBaseline="middle" style={ltr ? ltrText : undefined}>
      {children}
    </text>
  );
}

export default function GridPaths({ layers = BASE_LAYERS, props = {}, ariaLabel }) {
  const on = new Set(layers);
  const n = Math.max(1, Math.min(8, Math.round(Number(props.n ?? 4)) || 4));
  const cell = SIZE / n;
  const P = ([i, j], ox = 0, oy = 0) => [OX + i * cell + ox, OY - j * cell + oy];
  const poly = (word, off = 0) => nodesOf(word).map((p) => P(p, off, off)).map(([x, y], k) => `${k ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const path = samplePath(n);
  const counts = pascal(n);
  const A = P([0, 0]);
  const B = P([n, n]);
  return (
    <svg viewBox="0 0 330 300" role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[440px]" data-figure="GridPaths">
      <rect x="0" y="0" width="330" height="300" fill={FIG.paper} />
      {on.has('grid') && (
        <g stroke={FIG.muted} strokeWidth="1.4">
          {Array.from({ length: n + 1 }, (_, k) => (
            <g key={k}>
              <path d={`M ${P([k, 0]).join(' ')} L ${P([k, n]).join(' ')}`} />
              <path d={`M ${P([0, k]).join(' ')} L ${P([n, k]).join(' ')}`} />
            </g>
          ))}
        </g>
      )}
      {on.has('manyPaths') && (
        <g fill="none" stroke={FIG.deadEnd} strokeWidth="2.4" strokeLinejoin="round" opacity="0.75">
          {otherPaths(n).map((w, k) => <path key={w + k} d={poly(w, (k - 2.5) * 2.2)} />)}
        </g>
      )}
      {on.has('path') && (
        <path d={poly(path)} fill="none" stroke={FIG.sought} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      )}
      {on.has('word') && (
        <g>
          {nodesOf(path).slice(1).map((end, k) => {
            const start = nodesOf(path)[k];
            const right = path[k] === 'R';
            const m = P([(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]);
            return (
              <Label key={k} at={m} dx={right ? 0 : 13} dy={right ? -12 : 0} color={FIG.build} size={15} ltr={false}>
                {right ? 'ي' : 'أ'}
              </Label>
            );
          })}
        </g>
      )}
      {on.has('pascal') && (
        <g>
          {counts.flatMap((col, i) => col.map((v, j) => {
            const [x, y] = P([i, j]);
            const end = i === n && j === n;
            const w = String(v).length * 8 + 8;
            return (
              <g key={`${i}-${j}`}>
                <rect x={x - w / 2} y={y - 10} width={w} height="20" rx="6" fill={end ? FIG.sought : FIG.paper} stroke={end ? FIG.sought : FIG.build} strokeWidth="1.2" />
                <Label at={[x, y]} dy={1} color={end ? FIG.paper : FIG.build} size={12}>{v}</Label>
              </g>
            );
          }))}
        </g>
      )}
      {on.has('ends') && (
        <g>
          {!on.has('pascal') && <circle cx={A[0]} cy={A[1]} r="5.5" fill={FIG.ink} />}
          {!on.has('pascal') && <circle cx={B[0]} cy={B[1]} r="5.5" fill={FIG.ink} />}
          <Label at={A} dx={-16} dy={14}>A</Label>
          <Label at={B} dx={16} dy={-14}>B</Label>
        </g>
      )}
    </svg>
  );
}
