import { useTranslation } from 'react-i18next';
import * as R from './rational.js';

/**
 * LA BALANCE — le dessin qui porte toute la leçon.
 *
 * Deux plateaux, un fléau. Tant que la relation est une ÉGALITÉ, le fléau
 * reste horizontal quoi qu'on fasse : c'est la promesse « la même opération
 * des deux côtés ». Pour une inégalité, il penche du côté lourd — et le
 * geste de l'élève, en retournant le sens, le fait basculer.
 *
 * Dessiné en SVG, jamais une image : les jetons sont des objets qui
 * réagissent (docs/architecture/MANIPULATION_CONTRACT.md), les nombres sont
 * du texte DOM, et le dessin se lit — il n'illustre pas.
 *
 * La représentation des jetons obéit à §4 du cahier des charges : `x` est un
 * jeton, la constante un autre, et l'ensemble reste sobre — un élève de
 * quatrième n'est pas un enfant de maternelle. Au-delà de MAX_TOKENS jetons
 * le dessin abandonne le comptage et n'écrit plus que la valeur : dix-sept
 * carrés alignés ne se lisent plus.
 *
 * Le SVG est explicitement `direction: ltr` (algebra.css) : la page est RTL
 * mais un repère mathématique ne se renverse pas, et SVG n'hérite pas de
 * `dir` (ARABIC_RTL_CONTRACT.md §4).
 */

const MAX_TOKENS = 8;
const WIDTH = 560;
const HEIGHT = 210;
const PAN_Y = 104;
const PIVOT_X = WIDTH / 2;

/** L'inclinaison du fléau, bornée : assez pour se voir, jamais assez pour sortir du cadre. */
const TILT = 7;

/** La demi-longueur du fléau : les plateaux doivent tenir dans le cadre avec leurs jetons. */
const ARM = 132;

/** La demi-largeur d'un plateau — le dessin ne doit jamais déborder du viewBox. */
const PAN_HALF = 96;

/** Les jetons d'un membre : n fois `x`, puis la constante. */
function tokensFor(form) {
  const tokens = [];
  const a = R.toNumber(form.a);
  const count = Math.abs(a);

  if (count > 0) {
    if (Number.isInteger(count) && count <= MAX_TOKENS) {
      for (let i = 0; i < count; i += 1) tokens.push({ kind: 'x', negative: a < 0, label: 'x' });
    } else {
      tokens.push({ kind: 'x', negative: a < 0, label: `${R.toPlainText(form.a)}·x`, wide: true });
    }
  }
  if (!R.isZero(form.b)) {
    tokens.push({ kind: 'num', negative: R.isNegative(form.b), label: R.toPlainText(form.b), wide: R.toPlainText(form.b).length > 3 });
  }
  if (tokens.length === 0) tokens.push({ kind: 'num', negative: false, label: '0' });

  return tokens;
}

/** Un plateau et ce qu'il porte. */
function Pan({ x, y, tokens, label }) {
  const gap = 5;
  // Les jetons se resserrent pour tenir dans le plateau plutôt que d'en
  // sortir : six « x » alignés restent lisibles, ils ne débordent pas.
  const natural = tokens.map((token) => (token.wide ? 68 : 34));
  const naturalTotal = natural.reduce((sum, w) => sum + w, 0) + gap * Math.max(0, tokens.length - 1);
  const maxWidth = PAN_HALF * 2 - 16;
  const scale = naturalTotal > maxWidth ? maxWidth / naturalTotal : 1;
  const widths = natural.map((w) => w * scale);
  const total = widths.reduce((sum, w) => sum + w, 0) + gap * scale * Math.max(0, tokens.length - 1);
  let cursor = x - total / 2;

  return (
    <g transform={`translate(0 ${y})`}>
      {/* Le fil et le plateau */}
      <line x1={x} y1={-34} x2={x} y2={0} stroke="#94a3b8" strokeWidth="2" />
      <path
        d={`M ${x - PAN_HALF} 0 L ${x + PAN_HALF} 0 L ${x + PAN_HALF - 18} 16 L ${x - PAN_HALF + 18} 16 Z`}
        fill="#e2e8f0"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <g aria-hidden="true">
        {tokens.map((token, index) => {
          const w = widths[index];
          const left = cursor;
          cursor += w + gap * scale;
          const isX = token.kind === 'x';
          const fill = token.negative ? '#fee2e2' : (isX ? '#ddd6fe' : '#e0f2fe');
          const stroke = token.negative ? '#ef4444' : (isX ? '#7c3aed' : '#0284c7');
          const text = token.negative && !token.label.startsWith('−') ? `−${token.label}` : token.label;

          return (
            <g key={index} className="sa-ml-alg__token">
              <rect x={left} y={-30} width={w} height={28} rx={isX ? 6 : 14} fill={fill} stroke={stroke} strokeWidth="1.5" />
              <text
                x={left + w / 2}
                y={-11}
                textAnchor="middle"
                fontSize={Math.max(11, (isX ? 15 : 14) * Math.min(1, scale * 1.15))}
                fontStyle={isX ? 'italic' : 'normal'}
                fontWeight="600"
                fill={stroke}
                fontFamily="'JetBrains Mono', 'Inter', sans-serif"
              >
                {text}
              </text>
            </g>
          );
        })}
      </g>
      <title>{label}</title>
    </g>
  );
}

/**
 * @param {{equation: object, verdict: object, animate?: boolean}} props
 */
export default function BalanceScale({ equation, verdict, animate = true }) {
  const { t } = useTranslation('mathlab');
  const leftTokens = tokensFor(equation.left);
  const rightTokens = tokensFor(equation.right);

  // Le fléau penche selon le SENS, pas selon les valeurs : une égalité est
  // toujours droite, même quand les deux membres n'ont pas encore l'air
  // pareils — c'est justement ce que l'élève doit croire.
  let tilt = 0;
  if (equation.relation === '<' || equation.relation === '<=') tilt = TILT;
  else if (equation.relation === '>' || equation.relation === '>=') tilt = -TILT;
  // « Aucune solution » : la balance ne peut pas tenir.
  if (verdict?.kind === 'none') tilt = equation.relation === '=' ? TILT * 1.6 : tilt;

  const rad = (tilt * Math.PI) / 180;
  const leftX = PIVOT_X - ARM * Math.cos(rad);
  const rightX = PIVOT_X + ARM * Math.cos(rad);
  const leftY = PAN_Y + ARM * Math.sin(rad);
  const rightY = PAN_Y - ARM * Math.sin(rad);

  return (
    <svg
      className={`sa-ml-alg__balance${animate ? ' sa-ml-alg__balance--animated' : ''}`}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={t('tools.algebra.balanceLabel')}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Le socle */}
      <path d={`M ${PIVOT_X - 40} ${HEIGHT - 8} L ${PIVOT_X + 40} ${HEIGHT - 8} L ${PIVOT_X + 22} ${HEIGHT - 26} L ${PIVOT_X - 22} ${HEIGHT - 26} Z`} fill="#cbd5e1" />
      <rect x={PIVOT_X - 6} y={PAN_Y} width="12" height={HEIGHT - 26 - PAN_Y} fill="#cbd5e1" />

      {/* Le fléau */}
      <g className="sa-ml-alg__beam">
        <line x1={leftX} y1={leftY} x2={rightX} y2={rightY} stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
        <circle cx={PIVOT_X} cy={PAN_Y} r="9" fill="#475569" />
        <Pan x={leftX} y={leftY} tokens={leftTokens} label={t('tools.algebra.leftSide')} />
        <Pan x={rightX} y={rightY} tokens={rightTokens} label={t('tools.algebra.rightSide')} />
      </g>
    </svg>
  );
}
