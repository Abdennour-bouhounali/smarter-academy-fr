import { useMemo } from 'react';
import { useTransformContext, vec } from 'mafs';
import { formatTerm } from './sequenceFormat.js';

/**
 * LA TOILE D'ARAIGNÉE (§9) — le diagramme qui rend la convergence VISIBLE.
 *
 * On y voit trois choses, et leur superposition est tout l'intérêt :
 *
 *   y = f(x)   la règle, tracée comme une courbe
 *   y = x      la diagonale, où l'on REPORTE un terme pour en faire l'antécédent
 *   le chemin  u₀ → u₁ → u₂ … en marches d'escalier
 *
 * Lire le chemin, c'est lire la récurrence : on monte verticalement jusqu'à la
 * courbe (on applique f), on va horizontalement jusqu'à la diagonale (le
 * résultat devient le nouveau point de départ), et on recommence. Là où le
 * chemin s'enroule, la suite converge ; là où il s'écarte, elle diverge ; là
 * où il fait un rectangle, elle cycle. §9 dit « extremely useful », et c'est
 * vrai parce qu'aucun tableau de nombres ne montre cela.
 *
 * ── Le dégradé du chemin ─────────────────────────────────────────────────
 * Les premiers pas sont pâles, les derniers vifs. Sans cela, une toile de
 * quarante pas est un écheveau où l'on ne sait plus dans quel SENS on tourne
 * — et le sens est précisément ce qu'on regarde. L'opacité croissante donne
 * la flèche du temps sans ajouter une seule flèche.
 */
export default function CobwebLayer({ path, step, fixedPoints = [], view, cursor = null, terms = [] }) {
  const { viewTransform } = useTransformContext();
  const project = ([x, y]) => vec.transform([x, y], viewTransform);

  /**
   * La courbe y = f(x), échantillonnée sur la fenêtre.
   *
   * On n'appelle pas l'échantillonneur du grapheur : il travaille en pixels
   * de largeur et gère les pôles d'une fonction de x, alors qu'ici la « règle »
   * est une fonction de u — même signature, autre sens. Deux cents points
   * suffisent largement pour une fenêtre de toile, et une valeur non finie
   * COUPE le trait, exactement comme là-bas.
   */
  const curve = useMemo(() => {
    if (typeof step !== 'function' || !view) return [];
    const segments = [];
    let current = [];
    const samples = 200;
    const span = view.xMax - view.xMin;
    for (let i = 0; i <= samples; i += 1) {
      const x = view.xMin + (span * i) / samples;
      let y;
      try {
        y = step(x, 0);
      } catch {
        y = Number.NaN;
      }
      if (typeof y !== 'number' || !Number.isFinite(y)) {
        if (current.length > 1) segments.push(current);
        current = [];
        continue;
      }
      // On borne l'ordonnée à trois hauteurs de fenêtre : le SVG n'a pas à
      // recevoir 1e300, et le trait sort du cadre de toute façon.
      const limit = (view.yMax - view.yMin) * 3;
      const clamped = Math.min(view.yMax + limit, Math.max(view.yMin - limit, y));
      current.push(project([x, clamped]));
    }
    if (current.length > 1) segments.push(current);

    return segments;
  }, [step, view, viewTransform]);

  const diagonal = useMemo(() => {
    if (!view) return null;
    const low = Math.max(view.xMin, view.yMin);
    const high = Math.min(view.xMax, view.yMax);
    if (!(high > low)) return null;

    return [project([low, low]), project([high, high])];
  }, [view, viewTransform]);

  const projected = path.map((point) => project([point.x, point.y]));

  // Le pas du chemin sur lequel le curseur est posé : deux segments par pas
  // (vertical puis horizontal), donc le pas k occupe les segments 2k et 2k+1.
  const cursorStep = cursor !== null && terms.length
    ? terms.findIndex((term) => term.n === cursor)
    : -1;

  return (
    <g className="sa-ml-seq__cobweb" data-ml-seq-cobweb>
      {/* y = x : la diagonale du report. */}
      {diagonal && (
        <line
          className="sa-ml-seq__diagonal"
          x1={diagonal[0][0]} y1={diagonal[0][1]} x2={diagonal[1][0]} y2={diagonal[1][1]}
          data-ml-seq-diagonal
        />
      )}

      {/* y = f(x) : la règle. */}
      {curve.map((segment, index) => (
        <polyline
          key={index}
          className="sa-ml-seq__rulecurve"
          points={segment.map(([px, py]) => `${px},${py}`).join(' ')}
          data-ml-seq-rulecurve={index}
        />
      ))}

      {/* Les points fixes : là où la règle croise la diagonale (§10). */}
      {fixedPoints.map((value, index) => {
        const [px, py] = project([value, value]);

        return (
          <g key={index} data-ml-seq-cobweb-fixed={value}>
            <circle className="sa-ml-seq__fixeddot" cx={px} cy={py} r={6}>
              <title>{`f(x) = x → ${formatTerm(value)}`}</title>
            </circle>
          </g>
        );
      })}

      {/* Le chemin, segment par segment : l'opacité dit le sens du temps. */}
      <g className="sa-ml-seq__web">
        {projected.slice(0, -1).map(([px, py], index) => {
          const [nx, ny] = projected[index + 1];
          const progress = projected.length > 2 ? index / (projected.length - 2) : 1;
          const stepIndex = Math.floor(index / 2);

          return (
            <line
              key={index}
              className={`sa-ml-seq__webline${stepIndex === cursorStep ? ' sa-ml-seq__webline--current' : ''}`}
              x1={px} y1={py} x2={nx} y2={ny}
              opacity={0.25 + progress * 0.75}
              data-ml-seq-webline={index}
            />
          );
        })}
      </g>

      {/* Le point de départ : c'est de LUI que tout part, et §26 fait varier u₀. */}
      {projected.length > 0 && (
        <circle
          className="sa-ml-seq__webstart"
          cx={projected[0][0]} cy={projected[0][1]} r={5}
          data-ml-seq-webstart
        />
      )}
    </g>
  );
}
