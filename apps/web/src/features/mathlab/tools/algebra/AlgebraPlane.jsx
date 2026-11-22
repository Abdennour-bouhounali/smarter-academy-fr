import { useTransformContext, vec } from 'mafs';
import VectorPlane from '../vectors/VectorPlane.jsx';

/**
 * LE PLAN du مختبر الجبر — celui du مختبر الأشعة, réutilisé tel quel
 * (MATH_LAB.md §5f.2 : un seul repère sur la plateforme). VectorPlane
 * importe la caméra, la grille, les gestes et le format du grapheur ; on ne
 * fait ici que CADRER et poser des objets dessus.
 *
 * Cadrage : `frame` est la fenêtre qui montre les objets qui comptent
 * (intersection, sommet, racines). Elle ne s'applique qu'à l'OUVERTURE du
 * plan — `frameKey` change quand un nouvel objet est chargé (nouvelle
 * جملة, nouvelle famille, exemple), ce qui remonte le plan sur le nouveau
 * cadre. Un curseur qui bouge ne recadre pas : l'élève garde son zoom et
 * son déplacement. Le bouton ⌖ (resetView) revient au cadre des objets.
 *
 * Les objets sont dessinés en SVG brut avec des styles EN LIGNE : mafs
 * colore les `path` par une règle de classe (`.MafsView path`) qui l'emporte
 * sur l'attribut `stroke`.
 */
export default function AlgebraPlane({ frame, frameKey, label, children }) {
  return (
    <div className="sa-ml-alg__plane-host" data-ml-alg-plane>
      <VectorPlane key={frameKey} initialViewport={frame} defaultViewport={frame} canvasLabel={label}>
        {children}
      </VectorPlane>
    </div>
  );
}

function useToPx() {
  const { viewTransform } = useTransformContext();

  return (x, y) => vec.transform([x, y], viewTransform);
}

/** Une droite INFINIE par deux points, prolongée au-delà de la fenêtre. */
export function PlaneLine({ through, view, color, width = 2.5, dashed = false, dataAttr = undefined }) {
  const toPx = useToPx();
  const [[x1, y1], [x2, y2]] = through;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (!(length > 0) || ![x1, y1, x2, y2].every(Number.isFinite)) return null;
  const reach = (Math.abs(view.xMax - view.xMin) + Math.abs(view.yMax - view.yMin)) * 2 / length;
  const [ax, ay] = toPx(x1 - dx * reach, y1 - dy * reach);
  const [bx, by] = toPx(x1 + dx * reach, y1 + dy * reach);

  return (
    <line
      x1={ax} y1={ay} x2={bx} y2={by}
      style={{ stroke: color, strokeWidth: width, strokeDasharray: dashed ? '7 5' : undefined, strokeLinecap: 'round' }}
      {...(dataAttr ? { [dataAttr]: '' } : {})}
    />
  );
}

export function PlaneSegment({ from, to, color, width = 2, dashed = false }) {
  const toPx = useToPx();
  const [ax, ay] = toPx(from[0], from[1]);
  const [bx, by] = toPx(to[0], to[1]);

  return <line x1={ax} y1={ay} x2={bx} y2={by} style={{ stroke: color, strokeWidth: width, strokeDasharray: dashed ? '5 4' : undefined, strokeLinecap: 'round' }} />;
}

export function PlanePoint({ at, color, radius = 5.5, hollow = false, dataAttr = undefined }) {
  const toPx = useToPx();
  if (!at.every(Number.isFinite)) return null;
  const [cx, cy] = toPx(at[0], at[1]);

  return (
    <circle
      cx={cx} cy={cy} r={radius}
      style={{ fill: hollow ? '#ffffff' : color, stroke: hollow ? color : '#ffffff', strokeWidth: 2.5 }}
      {...(dataAttr ? { [dataAttr]: '' } : {})}
    />
  );
}

/** Une étiquette LTR (coordonnées, noms) : halo blanc, chiffres latins. */
export function PlaneLabel({ at, text, color = '#1A1A1A', dx = 8, dy = -10, anchor = 'start' }) {
  const toPx = useToPx();
  if (!at.every(Number.isFinite)) return null;
  const [x, y] = toPx(at[0], at[1]);

  return (
    <text x={x + dx} y={y + dy} textAnchor={anchor} className="sa-ml-alg__plane-label" style={{ fill: color }} direction="ltr">
      {text}
    </text>
  );
}

/** Une courbe échantillonnée dans la fenêtre courante (la parabole). */
export function PlaneCurve({ fn, view, color, width = 2.75 }) {
  const toPx = useToPx();
  const samples = 240;
  const span = view.yMax - view.yMin;
  let d = '';
  let pen = false;
  for (let i = 0; i <= samples; i += 1) {
    const x = view.xMin + ((view.xMax - view.xMin) * i) / samples;
    const y = fn(x);
    if (!Number.isFinite(y) || y > view.yMax + span * 4 || y < view.yMin - span * 4) { pen = false; continue; }
    const [px, py] = toPx(x, y);
    d += `${pen ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`;
    pen = true;
  }

  return <path d={d} style={{ fill: 'none', stroke: color, strokeWidth: width, strokeLinejoin: 'round', strokeLinecap: 'round' }} />;
}
