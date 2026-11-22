import { useMemo } from 'react';
import { useTransformContext, vec } from 'mafs';
import FunctionCurve from '../functionGrapher/FunctionCurve.jsx';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * TOUT ce qui se dessine sur le plan du مختبر التحليل.
 *
 * Ce module ne calcule AUCUNE mathématique : il reçoit une scène déjà
 * résolue (AnalysisTool l'a obtenue de analysisMath.js) et la met en pixels.
 * C'est la séparation que MATH_LAB impose depuis le مختبر المثلثات :
 * « les étages dessinent un état résolu — ils ne calculent rien ».
 *
 * Toutes les couleurs sont posées en STYLE INLINE et non par attribut : la
 * feuille de mafs (`.MafsView path { stroke: var(--mafs-fg) }`) l'emporte
 * sur l'attribut `stroke`, et toutes les courbes sortiraient noires. Le
 * piège est documenté (MATH_LAB §5k.8) et il a déjà coûté une passe de QA
 * au مختبر المقاطع المخروطية.
 */

const COLORS = {
  curve: '#2563eb',
  second: '#db2777',
  secant: '#f59e0b',
  tangent: '#dc2626',
  derivative: '#16a34a',
  secondDerivative: '#7c3aed',
  area: '#2563eb',
  riemann: '#0ea5e9',
  negative: '#ef4444',
  asymptote: '#94a3b8',
  extremum: '#f97316',
  root: '#0f766e',
  original: '#94a3b8',
  antiderivative: '#9333ea',
};

export default function SceneLayer({ scene, view, width, layers }) {
  const { viewTransform } = useTransformContext();
  const toPixel = useMemo(() => (x, y) => vec.transform([x, y], viewTransform), [viewTransform]);

  if (!scene) return null;

  return (
    <g className="sa-ml-an__scene">
      {/* ── Les aires, tout au fond : elles ne doivent masquer aucune courbe ── */}
      {layers.area && scene.areaPath && (
        <AreaFill paths={scene.areaPath} toPixel={toPixel} view={view} />
      )}
      {layers.riemann && scene.riemann && (
        <RiemannRectangles rectangles={scene.riemann.rectangles} toPixel={toPixel} view={view} />
      )}
      {layers.betweenCurves && scene.betweenPath && (
        <AreaFill paths={scene.betweenPath} toPixel={toPixel} view={view} color={COLORS.second} />
      )}

      {/* ── Les bandes de variation et de signe (§16) ── */}
      {layers.increasing && scene.variation && (
        <VariationBands intervals={scene.variation} toPixel={toPixel} view={view} />
      )}

      {/* ── Les mesures : asymptotes et lignes de limite, sous les courbes ── */}
      {layers.asymptotes && scene.asymptotes && (
        <Asymptotes asymptotes={scene.asymptotes} toPixel={toPixel} view={view} />
      )}
      {layers.limitLines && scene.limitLines && (
        <LimitLines lines={scene.limitLines} toPixel={toPixel} view={view} />
      )}

      {/* ── Le manche original d'une transformation (§25) ── */}
      {layers.original && scene.originalFn && (
        <FunctionCurve
          fn={scene.originalFn} color={COLORS.original} view={view} width={width} name="original"
        />
      )}

      {/* ── Les courbes ── */}
      {layers.curve && scene.functions.map((entry) => (
        entry.visible && entry.fn ? (
          <FunctionCurve
            key={entry.id} fn={entry.fn} color={entry.color} view={view} width={width} name={entry.id}
          />
        ) : null
      ))}
      {layers.antiderivative && scene.antiderivativeFn && (
        <FunctionCurve
          fn={scene.antiderivativeFn} color={COLORS.antiderivative} view={view} width={width} name="antiderivative"
        />
      )}
      {layers.derivativeCurve && scene.derivativeFn && (
        <FunctionCurve
          fn={scene.derivativeFn} color={COLORS.derivative} view={view} width={width} name="derivative"
        />
      )}
      {layers.secondDerivative && scene.secondDerivativeFn && (
        <FunctionCurve
          fn={scene.secondDerivativeFn} color={COLORS.secondDerivative} view={view} width={width} name="second-derivative"
        />
      )}

      {/* ── Les droites de l'expérience ── */}
      {layers.secant && scene.secant && (
        <StraightLine line={scene.secant} color={COLORS.secant} view={view} toPixel={toPixel} name="secant" />
      )}
      {layers.riseRun && scene.secant && scene.riseRun && (
        <RiseRun riseRun={scene.riseRun} toPixel={toPixel} />
      )}
      {layers.tangent && scene.tangent && (
        <StraightLine line={scene.tangent} color={COLORS.tangent} view={view} toPixel={toPixel} name="tangent" />
      )}

      {/* ── L'approche d'une limite (§11) ── */}
      {layers.approach && scene.approach && (
        <ApproachMarks approach={scene.approach} toPixel={toPixel} view={view} />
      )}

      {/* ── Les points remarquables ── */}
      {layers.roots && scene.roots?.map((root, index) => (
        <MarkedPoint
          key={`root-${index}`} x={root.x} y={0} color={COLORS.root}
          shape={root.kind === 'touch' ? 'square' : 'circle'} toPixel={toPixel} name="root"
        />
      ))}
      {layers.extrema && scene.extrema?.map((point, index) => (
        <MarkedPoint
          key={`extremum-${index}`} x={point.x} y={point.y} color={COLORS.extremum}
          shape={point.kind === 'stationary' ? 'diamond' : 'circle'} toPixel={toPixel} name={`extremum-${point.kind}`}
        />
      ))}
      {layers.criticalPoints && scene.extrema?.map((point, index) => (
        <MarkedPoint
          key={`critical-${index}`} x={point.x} y={point.y} color={COLORS.extremum}
          shape={point.kind === 'stationary' ? 'diamond' : 'circle'} toPixel={toPixel} name={`critical-${point.kind}`}
        />
      ))}
      {layers.intersections && scene.intersections?.map((point, index) => (
        <MarkedPoint
          key={`inter-${index}`} x={point.x} y={point.y} color={COLORS.second}
          toPixel={toPixel} name="intersection"
        />
      ))}
      {layers.discontinuities && scene.discontinuities?.map((entry, index) => (
        <Discontinuity key={`break-${index}`} entry={entry} toPixel={toPixel} view={view} />
      ))}
    </g>
  );
}

/**
 * Une droite y = mx + p, tracée d'un bord à l'autre de la fenêtre.
 *
 * Elle est TIRETÉE et plus fine que la courbe, pour une raison qui n'est pas
 * décorative : sur une fonction AFFINE — l'ouverture du laboratoire — la
 * sécante COÏNCIDE avec la courbe. Tracée pleine et épaisse, elle la
 * recouvrait entièrement, et la QA visuelle n'a vu qu'une seule droite
 * orange là où il devait y en avoir deux. Le tireté laisse voir le bleu de f
 * en dessous : l'élève voit que la sécante EST la droite, ce qui est
 * exactement la leçon de la fonction affine.
 */
function StraightLine({ line, color, view, toPixel, name }) {
  const { slope, intercept } = line;
  if (!Number.isFinite(slope) || !Number.isFinite(intercept)) return null;
  const [x0, y0] = [view.xMin, slope * view.xMin + intercept];
  const [x1, y1] = [view.xMax, slope * view.xMax + intercept];
  const [px0, py0] = toPixel(x0, y0);
  const [px1, py1] = toPixel(x1, y1);

  return (
    <line
      x1={px0} y1={py0} x2={px1} y2={py1}
      stroke={color} style={{ stroke: color }} strokeWidth={2} strokeLinecap="round"
      strokeDasharray="9 5"
      data-ml-line={name}
    />
  );
}

/**
 * Le TRIANGLE Δx / Δy — ce qui rend la pente VISIBLE (§7).
 *
 * Sans lui, « m = Δy/Δx » reste une formule. Avec lui, l'élève voit
 * littéralement de combien on avance et de combien on monte.
 */
function RiseRun({ riseRun, toPixel }) {
  const { xA, yA, xB, yB } = riseRun;
  const [pax, pay] = toPixel(xA, yA);
  const [pbx, pby] = toPixel(xB, yB);
  const [pcx, pcy] = toPixel(xB, yA);

  return (
    <g data-ml-riserun>
      <path
        d={`M${pax} ${pay} L${pcx} ${pcy} L${pbx} ${pby}`}
        fill="none" stroke={COLORS.secant} style={{ stroke: COLORS.secant }}
        strokeWidth={1.5} strokeDasharray="5 4" opacity={0.85}
      />
      <text
        x={(pax + pcx) / 2} y={pay + 16} textAnchor="middle"
        className="sa-ml-an__measure" fill={COLORS.secant} style={{ fill: COLORS.secant }}
      >
        Δx = {formatValue(xB - xA, 2)}
      </text>
      <text
        x={pcx + 8} y={(pcy + pby) / 2} textAnchor="start"
        className="sa-ml-an__measure" fill={COLORS.secant} style={{ fill: COLORS.secant }}
      >
        Δy = {formatValue(yB - yA, 2)}
      </text>
    </g>
  );
}

/** L'aire sous la courbe : un remplissage, positif et négatif distingués (§21). */
function AreaFill({ paths, toPixel, color = COLORS.area }) {
  return (
    <g data-ml-area>
      {paths.map((piece, index) => {
        let d = '';
        for (let i = 0; i < piece.points.length; i += 1) {
          const [px, py] = toPixel(piece.points[i][0], piece.points[i][1]);
          d += `${i === 0 ? 'M' : 'L'}${px.toFixed(2)} ${py.toFixed(2)} `;
        }
        if (!d) return null;
        const fill = piece.sign < 0 ? COLORS.negative : color;

        return (
          <path
            key={index} d={`${d}Z`} fill={fill} style={{ fill }} fillOpacity={piece.sign < 0 ? 0.22 : 0.18}
            stroke="none" data-ml-area-sign={piece.sign < 0 ? 'negative' : 'positive'}
          />
        );
      })}
    </g>
  );
}

/**
 * Les RECTANGLES de Riemann (§20).
 *
 * Un rectangle dont la hauteur n'est pas définie n'est pas dessiné : il n'est
 * pas non plus dessiné « à zéro », ce qui mentirait sur l'aire.
 */
function RiemannRectangles({ rectangles, toPixel }) {
  if (!Array.isArray(rectangles) || rectangles.length === 0) return null;
  // Au-delà de ~400 rectangles le trait de contour mange le dessin : on le
  // retire, la masse des barres suffit à montrer la convergence.
  const thin = rectangles.length > 120;

  return (
    <g data-ml-riemann={rectangles.length}>
      {rectangles.map((rectangle, index) => {
        if (!rectangle.defined) return null;
        const [px0, pyTop] = toPixel(rectangle.x0, rectangle.height);
        const [px1, pyBase] = toPixel(rectangle.x1, 0);
        const x = Math.min(px0, px1);
        const y = Math.min(pyTop, pyBase);
        const w = Math.abs(px1 - px0);
        const h = Math.abs(pyBase - pyTop);
        const negative = rectangle.height < 0;
        const fill = negative ? COLORS.negative : COLORS.riemann;

        return (
          <rect
            key={index} x={x} y={y} width={Math.max(w, 0.5)} height={Math.max(h, 0)}
            fill={fill} style={{ fill, stroke: thin ? 'none' : '#ffffff' }}
            fillOpacity={0.45} stroke={thin ? 'none' : '#ffffff'} strokeWidth={thin ? 0 : 0.75}
          />
        );
      })}
    </g>
  );
}

/** Les bandes de croissance / décroissance, en fond (§16, §17). */
function VariationBands({ intervals, toPixel, view }) {
  return (
    <g data-ml-variation>
      {intervals.map((interval, index) => {
        const [px0] = toPixel(interval.from, 0);
        const [px1] = toPixel(interval.to, 0);
        const [, pyTop] = toPixel(0, view.yMax);
        const [, pyBottom] = toPixel(0, view.yMin);
        const fill = interval.direction === 'increasing' ? '#16a34a' : interval.direction === 'decreasing' ? '#f97316' : '#94a3b8';

        return (
          <rect
            key={index} x={Math.min(px0, px1)} y={pyTop}
            width={Math.abs(px1 - px0)} height={Math.abs(pyBottom - pyTop)}
            fill={fill} style={{ fill }} fillOpacity={0.08} stroke="none"
            data-ml-variation-direction={interval.direction}
          />
        );
      })}
    </g>
  );
}

/** Les asymptotes : verticales, horizontales, obliques (§13, §14, §16). */
function Asymptotes({ asymptotes, toPixel, view }) {
  const dash = '7 5';

  return (
    <g data-ml-asymptotes>
      {asymptotes.vertical.map((entry, index) => {
        const [px, pyTop] = toPixel(entry.x, view.yMax);
        const [, pyBottom] = toPixel(entry.x, view.yMin);

        return (
          <line
            key={`v-${index}`} x1={px} y1={pyTop} x2={px} y2={pyBottom}
            stroke={COLORS.asymptote} style={{ stroke: COLORS.asymptote }}
            strokeWidth={1.5} strokeDasharray={dash} data-ml-asymptote="vertical"
          />
        );
      })}
      {asymptotes.horizontal.map((entry, index) => {
        const [pxLeft, py] = toPixel(view.xMin, entry.y);
        const [pxRight] = toPixel(view.xMax, entry.y);

        return (
          <line
            key={`h-${index}`} x1={pxLeft} y1={py} x2={pxRight} y2={py}
            stroke={COLORS.asymptote} style={{ stroke: COLORS.asymptote }}
            strokeWidth={1.5} strokeDasharray={dash} data-ml-asymptote="horizontal"
          />
        );
      })}
      {asymptotes.oblique.map((entry, index) => {
        const [px0, py0] = toPixel(view.xMin, entry.slope * view.xMin + entry.intercept);
        const [px1, py1] = toPixel(view.xMax, entry.slope * view.xMax + entry.intercept);

        return (
          <line
            key={`o-${index}`} x1={px0} y1={py0} x2={px1} y2={py1}
            stroke={COLORS.asymptote} style={{ stroke: COLORS.asymptote }}
            strokeWidth={1.5} strokeDasharray={dash} data-ml-asymptote="oblique"
          />
        );
      })}
    </g>
  );
}

/** La verticale x = a et, quand elles existent, les horizontales des deux limites (§12). */
function LimitLines({ lines, toPixel, view }) {
  return (
    <g data-ml-limitlines>
      <line
        x1={toPixel(lines.at, view.yMax)[0]} y1={toPixel(lines.at, view.yMax)[1]}
        x2={toPixel(lines.at, view.yMin)[0]} y2={toPixel(lines.at, view.yMin)[1]}
        stroke={COLORS.tangent} style={{ stroke: COLORS.tangent }}
        strokeWidth={1.5} strokeDasharray="4 4" data-ml-limit-at
      />
      {lines.values.map((entry, index) => {
        const [pxLeft, py] = toPixel(view.xMin, entry.value);
        const [pxRight] = toPixel(view.xMax, entry.value);

        return (
          <line
            key={index} x1={pxLeft} y1={py} x2={pxRight} y2={py}
            stroke={COLORS.derivative} style={{ stroke: COLORS.derivative }}
            strokeWidth={1.25} strokeDasharray="4 4" opacity={0.8}
            data-ml-limit-value={entry.side}
          />
        );
      })}
    </g>
  );
}

/**
 * Les marques d'approche (§11) : les points successifs x = a ± 1, ±0,1, ±0,01…
 * portés SUR la courbe. C'est le mouvement qu'on veut faire voir, pas la table.
 */
function ApproachMarks({ approach, toPixel }) {
  return (
    <g data-ml-approach>
      {approach.map((entry, index) => {
        if (entry.y === null) return null;
        const [px, py] = toPixel(entry.x, entry.y);
        // Les derniers pas sont les plus proches : on les fait plus vifs.
        const opacity = 0.25 + (0.75 * (index + 1)) / approach.length;

        return (
          <circle
            key={index} cx={px} cy={py} r={4}
            fill={entry.side === 'left' ? COLORS.secant : COLORS.derivative}
            style={{ fill: entry.side === 'left' ? COLORS.secant : COLORS.derivative }}
            opacity={opacity} data-ml-approach-side={entry.side}
          />
        );
      })}
    </g>
  );
}

/**
 * Une discontinuité, dessinée selon son ESPÈCE (§15) :
 *   - un trou : un cercle CREUX, la convention du manuel ;
 *   - une asymptote : rien ici (la ligne est tracée par `Asymptotes`) ;
 *   - une marche : deux points, l'un creux, l'autre plein.
 */
function Discontinuity({ entry, toPixel }) {
  if (entry.kind === 'infinite') return null;
  const marks = [];
  if (Number.isFinite(entry.left)) marks.push({ y: entry.left, filled: false });
  if (Number.isFinite(entry.right) && entry.kind === 'jump') marks.push({ y: entry.right, filled: false });

  return (
    <g data-ml-discontinuity={entry.kind}>
      {marks.map((mark, index) => {
        const [px, py] = toPixel(entry.x, mark.y);

        return (
          <circle
            key={index} cx={px} cy={py} r={5}
            fill="#ffffff" style={{ fill: '#ffffff', stroke: COLORS.curve }}
            stroke={COLORS.curve} strokeWidth={2}
          />
        );
      })}
    </g>
  );
}

/** Un point remarquable : racine, extremum, intersection. */
function MarkedPoint({ x, y, color, shape = 'circle', toPixel, name }) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const [px, py] = toPixel(x, y);
  const common = {
    fill: color, style: { fill: color, stroke: '#ffffff' }, stroke: '#ffffff', strokeWidth: 2,
    'data-ml-point': name,
  };

  if (shape === 'square') {
    return <rect x={px - 5} y={py - 5} width={10} height={10} {...common} />;
  }
  if (shape === 'diamond') {
    return <path d={`M${px} ${py - 6} L${px + 6} ${py} L${px} ${py + 6} L${px - 6} ${py} Z`} {...common} />;
  }

  return <circle cx={px} cy={py} r={5.5} {...common} />;
}
