import { FIG, ltrText } from './palette';

/**
 * #25 « السياج » (قمّة) — trois bandes, chacune à l'échelle calculée :
 *   1. le grillage droit de `length` m (l'énoncé n'en montre que les deux premiers poteaux,
 *      sinon on compterait la réponse sur le dessin) ;
 *   2. le petit cas d'essai : 4 m, un poteau tous les 2 m ;
 *   3. le jardin carré de périmètre `length` m, un poteau tous les 2 m depuis un coin.
 */
export const LAYERS = ['rail', 'posts', 'gaps', 'endPost', 'small', 'square', 'squareStart'];
export const BASE_LAYERS = ['rail'];

const GAP = 2; // m entre deux poteaux
const X0 = 30;
const X1 = 370;
const RAIL_Y = 66;

function Post({ x, y, h = 30, color = FIG.ink, fill = FIG.paper }) {
  return <rect x={x - 3.5} y={y - h / 2} width="7" height={h} rx="1.5" fill={fill} stroke={color} strokeWidth="1.8" />;
}

function Dim({ x1, x2, y, children, color = FIG.label, above = false }) {
  return (
    <g>
      <path d={`M ${x1} ${y} L ${x2} ${y} M ${x1} ${y - 5} L ${x1} ${y + 5} M ${x2} ${y - 5} L ${x2} ${y + 5}`} stroke={color} strokeWidth="1.2" />
      <text x={(x1 + x2) / 2} y={above ? y - 7 : y + 13} fill={color} fontSize="12" fontWeight="600" textAnchor="middle" style={ltrText}>{children}</text>
    </g>
  );
}

export default function FencePosts({ layers = BASE_LAYERS, props = {}, ariaLabel }) {
  const on = new Set(layers);
  const raw = Number(props.length);
  const length = Number.isFinite(raw) && raw >= 8 ? raw : 24;
  const scale = (X1 - X0) / length;
  const posts = Array.from({ length: Math.floor(length / GAP) + 1 }, (_, k) => X0 + k * GAP * scale);
  const lastX = posts[posts.length - 1];

  // petit cas : 4 m à 30 px/m
  const SX = 30;
  const SY = 132;
  const smallScale = 30;
  const smallPosts = [0, 2, 4].map((m) => SX + m * smallScale);

  // le carré : périmètre `length`, côté length/4, poteau tous les 2 m depuis le coin haut-gauche
  const side = length / 4;
  const SQ = 110;
  const QX = 145;
  const QY = 192;
  const corners = [[QX, QY], [QX + SQ, QY], [QX + SQ, QY + SQ], [QX, QY + SQ]];
  const onPerimeter = (t) => {
    const k = Math.min(3, Math.floor(t / side));
    const f = (t - k * side) / side;
    const [ax, ay] = corners[k];
    const [bx, by] = corners[(k + 1) % 4];
    return [ax + (bx - ax) * f, ay + (by - ay) * f];
  };
  const squarePosts = Array.from({ length: Math.round(length / GAP) }, (_, k) => onPerimeter(k * GAP));

  return (
    <svg viewBox="0 0 400 330" role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[460px]" data-figure="FencePosts">
      <rect x="0" y="0" width="400" height="330" fill={FIG.paper} />
      {on.has('rail') && (
        <g>
          <path d={`M ${X0} ${RAIL_Y - 7} L ${X1} ${RAIL_Y - 7} M ${X0} ${RAIL_Y + 7} L ${X1} ${RAIL_Y + 7}`} stroke={FIG.muted} strokeWidth="2.2" />
          <Post x={posts[0]} y={RAIL_Y} />
          <Post x={posts[1]} y={RAIL_Y} />
          <Dim x1={posts[0]} x2={posts[1]} y={RAIL_Y - 40} above>2 m</Dim>
          <Dim x1={X0} x2={X1} y={RAIL_Y + 28}>{`${length} m`}</Dim>
        </g>
      )}
      {on.has('gaps') && (
        <g fill="none" stroke={FIG.observe} strokeWidth="2">
          {posts.slice(1).map((x, k) => (
            <path key={`g${k}`} d={`M ${posts[k] + 4} ${RAIL_Y - 18} Q ${(posts[k] + x) / 2} ${RAIL_Y - 30} ${x - 4} ${RAIL_Y - 18}`} />
          ))}
        </g>
      )}
      {on.has('posts') && (
        <g>
          {posts.map((x) => <Post key={`p${x}`} x={x} y={RAIL_Y} color={FIG.sought} fill={FIG.soughtFill} />)}
        </g>
      )}
      {on.has('endPost') && (
        <g fill="none" stroke={FIG.observe} strokeWidth="2.4">
          <circle cx={posts[0]} cy={RAIL_Y} r="19" />
          <circle cx={lastX} cy={RAIL_Y} r="19" />
        </g>
      )}
      {on.has('small') && (
        <g>
          <path d={`M ${SX} ${SY - 6} L ${SX + 4 * smallScale} ${SY - 6} M ${SX} ${SY + 6} L ${SX + 4 * smallScale} ${SY + 6}`} stroke={FIG.build} strokeWidth="2" />
          {smallPosts.map((x, k) => (
            <g key={`s${k}`}>
              <Post x={x} y={SY} h={26} color={FIG.build} fill={FIG.buildFill} />
              <text x={x} y={SY - 22} fill={FIG.build} fontSize="12" fontWeight="700" textAnchor="middle" style={ltrText}>{k + 1}</text>
            </g>
          ))}
          <Dim x1={SX} x2={SX + 4 * smallScale} y={SY + 22} color={FIG.build}>4 m</Dim>
        </g>
      )}
      {on.has('square') && (
        <g>
          <rect x={QX} y={QY} width={SQ} height={SQ} fill={FIG.soughtFill} stroke={FIG.muted} strokeWidth="2.2" />
          {squarePosts.map(([x, y], k) => (
            <rect key={`q${k}`} x={x - 4} y={y - 4} width="8" height="8" rx="1.5" fill={FIG.paper} stroke={FIG.sought} strokeWidth="2" />
          ))}
          <text x={QX + SQ / 2} y={QY + SQ + 18} fill={FIG.label} fontSize="12" fontWeight="600" textAnchor="middle" style={ltrText}>{`${side} m`}</text>
        </g>
      )}
      {on.has('squareStart') && (
        <g fill="none" stroke={FIG.observe} strokeWidth="2.4">
          <circle cx={QX} cy={QY} r="13" />
          <path d={`M ${QX - 26} ${QY + 40} Q ${QX - 30} ${QY + 6} ${QX - 15} ${QY + 4}`} />
          <path d={`M ${QX - 21} ${QY - 1} L ${QX - 14} ${QY + 4} L ${QX - 21} ${QY + 10}`} />
        </g>
      )}
    </svg>
  );
}
