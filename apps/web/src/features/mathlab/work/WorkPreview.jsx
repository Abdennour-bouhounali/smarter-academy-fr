import { memo } from 'react';

/**
 * L'APERÇU d'un travail — dessiné en SVG, à partir du seul RÉSUMÉ que
 * l'instrument a laissé (`work.summary`). Jamais depuis `data`, jamais en
 * montant l'instrument : une carte ne charge ni three.js, ni Excalidraw, ni
 * MathLive, ni mafs. C'est la règle §32 du cahier des charges, et c'est ce
 * qui permet d'afficher cent travaux sans que la page tousse.
 *
 * Le choix du dessin se fait sur `summary.kind` — la FORME de l'aperçu — et
 * non sur l'instrument : un futur instrument qui produit une courbe
 * réutilisera `curve` sans une ligne de plus ici (§30 : rien qui ressemble
 * à une cascade de `if (tool === …)` dispersée dans l'interface).
 *
 * Aucun aperçu n'est une faute : un document d'avant les résumés, ou un
 * instrument sans `summarize`, obtient le repli — son icône, en grand, sur
 * le fond de sa famille. La carte ne casse jamais.
 */

const VIEW = { w: 160, h: 90 };

function WorkPreview({ work, icon: Icon }) {
  const kind = work?.summary?.kind;
  const detail = work?.summary?.detail ?? {};
  const Drawing = DRAWINGS[kind];

  if (!Drawing) return <FallbackPreview icon={Icon} />;

  return (
    <svg
      className="sa-mlw-preview__svg"
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <Drawing detail={detail} />
    </svg>
  );
}

/** Le repli : l'icône de l'instrument. Propre, jamais cassé, jamais vide. */
function FallbackPreview({ icon: Icon }) {
  return (
    <span className="sa-mlw-preview__fallback" aria-hidden="true">
      {Icon ? <Icon size={30} strokeWidth={1.5} /> : null}
    </span>
  );
}

// ── Les dessins, un par FORME ────────────────────────────────────────────

/**
 * Le grapheur : les courbes, rééchantillonnées grossièrement dans la vignette.
 *
 * La forme « curve » accepte DEUX écritures, parce que deux sortes
 * d'instruments produisent des courbes :
 *
 *   `detail.curves`     des EXPRESSIONS `y = f(x)` que la vignette
 *                       rééchantillonne (le grapheur) ;
 *   `detail.polylines`  des POINTS déjà calculés (le مختبر المقاطع
 *                       المخروطية — un cercle n'est pas une fonction de x,
 *                       et l'échantillonner ici demanderait d'embarquer le
 *                       moteur des coniques dans une carte).
 *
 * Les deux se dessinent identiquement ; seul le chemin d'arrivée diffère.
 * C'est la promesse du contrat (`toolContract.js`) : `kind` nomme la FORME
 * de l'aperçu, pas l'instrument, et un nouvel instrument qui produit une
 * courbe n'ajoute pas un dessin de plus ici.
 */
function CurvePreview({ detail }) {
  const curves = Array.isArray(detail.curves) ? detail.curves.slice(0, 4) : [];
  const polylines = Array.isArray(detail.polylines) ? detail.polylines.slice(0, 4) : [];
  const viewport = readPreviewViewport(detail.viewport);

  return (
    <>
      <Axes />
      {curves.map((curve, i) => (
        <path
          key={`e${i}`}
          d={curvePath(curve.e, detail.viewport)}
          fill="none"
          stroke={curve.c || '#2563eb'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {polylines.map((curve, i) => (
        <path
          key={`p${i}`}
          d={polylinePath(curve.p, viewport)}
          fill="none"
          stroke={curve.c || '#2563eb'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </>
  );
}

/** Une fenêtre d'aperçu, qu'elle soit écrite en objet ou en quadruplet. */
function readPreviewViewport(raw) {
  if (Array.isArray(raw) && raw.length === 4 && raw.every(Number.isFinite)) {
    return { xMin: raw[0], xMax: raw[1], yMin: raw[2], yMax: raw[3] };
  }
  if (raw && [raw.xMin, raw.xMax, raw.yMin, raw.yMax].every(Number.isFinite)) return raw;

  return { xMin: -8, xMax: 8, yMin: -6, yMax: 6 };
}

/** Des points du plan → un chemin SVG, coupé hors cadre plutôt qu'étiré. */
function polylinePath(points, vp) {
  if (!Array.isArray(points) || points.length < 2) return '';
  const spanX = vp.xMax - vp.xMin;
  const spanY = vp.yMax - vp.yMin;
  if (!(spanX > 0) || !(spanY > 0)) return '';
  let d = '';
  let pen = false;
  for (const point of points) {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) { pen = false; continue; }
    const px = ((point.x - vp.xMin) / spanX) * VIEW.w;
    const py = VIEW.h - ((point.y - vp.yMin) / spanY) * VIEW.h;
    if (py < -VIEW.h || py > VIEW.h * 2 || px < -VIEW.w || px > VIEW.w * 2) { pen = false; continue; }
    d += `${pen ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`;
    pen = true;
  }

  return d;
}

/**
 * La courbe d'une expression, échantillonnée en 40 points — assez pour une
 * vignette de 160 px. On n'embarque pas l'analyseur du grapheur (il est
 * lourd et il vit derrière un import paresseux) : on reconnaît ici les
 * formes courantes du programme, et tout le reste devient une ligne droite
 * plutôt qu'une fausse courbe.
 */
function curvePath(expression, viewport) {
  const vp = viewport ?? { xMin: -8, xMax: 8, yMin: -6, yMax: 6 };
  const f = toFunction(expression);
  const steps = 40;
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const x = vp.xMin + ((vp.xMax - vp.xMin) * i) / steps;
    const y = f(x);
    if (!Number.isFinite(y)) { points.push(null); continue; }
    const px = ((x - vp.xMin) / (vp.xMax - vp.xMin)) * VIEW.w;
    const py = VIEW.h - ((y - vp.yMin) / (vp.yMax - vp.yMin)) * VIEW.h;
    // Une valeur très hors cadre casse le trait plutôt que de le tirer au loin.
    points.push(py < -VIEW.h || py > VIEW.h * 2 ? null : `${px.toFixed(1)},${py.toFixed(1)}`);
  }

  let d = '';
  let pen = false;
  for (const p of points) {
    if (p == null) { pen = false; continue; }
    d += `${pen ? 'L' : 'M'}${p} `;
    pen = true;
  }

  return d.trim();
}

/**
 * Une expression → une fonction, pour la SEULE vignette. Volontairement
 * minuscule : les formes du programme (polynômes, racine, inverse, sin/cos)
 * et rien d'autre. Ce n'est pas un évaluateur — celui du grapheur l'est
 * (expressionParser.js), et il n'a pas sa place dans une liste.
 */
function toFunction(expression) {
  const e = String(expression ?? '').replace(/\s+/g, '').toLowerCase();
  if (/^x\^?2$|^x\*x$/.test(e)) return (x) => x * x;
  if (/^x\^?3$/.test(e)) return (x) => x * x * x;
  if (/^-x\^?2$/.test(e)) return (x) => -x * x;
  if (/^sin\(x\)$/.test(e)) return Math.sin;
  if (/^cos\(x\)$/.test(e)) return Math.cos;
  if (/^tan\(x\)$/.test(e)) return Math.tan;
  if (/^(sqrt|racine)\(x\)$/.test(e)) return (x) => (x >= 0 ? Math.sqrt(x) : NaN);
  if (/^1\/x$/.test(e)) return (x) => (Math.abs(x) < 1e-6 ? NaN : 1 / x);
  if (/^\|x\|$|^abs\(x\)$/.test(e)) return Math.abs;

  // a·x + b (le cas le plus fréquent en 4AM : الدوال الخطية والتآلفية).
  const affine = /^(-?\d*(?:[.,]\d+)?)?\*?x(?:([+-])(\d+(?:[.,]\d+)?))?$/.exec(e);
  if (affine) {
    const a = affine[1] === '' || affine[1] === undefined ? 1 : affine[1] === '-' ? -1 : Number(affine[1].replace(',', '.'));
    const b = affine[2] ? Number(`${affine[2]}${affine[3].replace(',', '.')}`) : 0;

    return (x) => a * x + b;
  }
  const constant = Number(e.replace(',', '.'));
  if (Number.isFinite(constant)) return () => constant;

  // Inconnue : une horizontale discrète vaut mieux qu'une courbe inventée.
  return () => 0;
}

/** Le repère d'une vignette : deux axes, pas de graduation. */
function Axes() {
  return (
    <g stroke="#cbd5e1" strokeWidth="1">
      <line x1="0" y1={VIEW.h / 2} x2={VIEW.w} y2={VIEW.h / 2} />
      <line x1={VIEW.w / 2} y1="0" x2={VIEW.w / 2} y2={VIEW.h} />
    </g>
  );
}

/** La géométrie 3D : la silhouette du solide, en projection simple. */
function SolidPreview({ detail }) {
  const cx = VIEW.w / 2;
  const cy = VIEW.h / 2;
  const stroke = { fill: 'rgba(37, 99, 235, 0.10)', stroke: '#2563eb', strokeWidth: 1.6, strokeLinejoin: 'round' };

  switch (detail.shape) {
    case 'sphere':
      return (
        <g {...stroke}>
          <circle cx={cx} cy={cy} r="28" />
          <ellipse cx={cx} cy={cy} rx="28" ry="9" fill="none" strokeDasharray="3 3" />
        </g>
      );
    case 'cylinder':
      return (
        <g {...stroke}>
          <path d={`M${cx - 20},${cy - 22} L${cx - 20},${cy + 22} A20,7 0 0 0 ${cx + 20},${cy + 22} L${cx + 20},${cy - 22} Z`} />
          <ellipse cx={cx} cy={cy - 22} rx="20" ry="7" />
        </g>
      );
    case 'cone':
      return (
        <g {...stroke}>
          <path d={`M${cx},${cy - 26} L${cx - 22},${cy + 20} A22,7 0 0 0 ${cx + 22},${cy + 20} Z`} />
          <ellipse cx={cx} cy={cy + 20} rx="22" ry="7" fill="none" strokeDasharray="3 3" />
        </g>
      );
    case 'cuboid':
      return <Box {...stroke} w={46} h={30} d={14} />;
    case 'cube':
    default:
      return <Box {...stroke} w={34} h={34} d={14} />;
  }
}

/** Un pavé en perspective cavalière — le dessin du manuel. */
function Box({ w, h, d, ...style }) {
  const x = (VIEW.w - w) / 2 - d / 2;
  const y = (VIEW.h - h) / 2 + d / 2;

  return (
    <g {...style}>
      <rect x={x} y={y} width={w} height={h} />
      <path d={`M${x},${y} l${d},${-d} h${w} l${-d},${d}`} />
      <path d={`M${x + w},${y} l${d},${-d} v${h} l${-d},${d}`} />
    </g>
  );
}

/** La سبّورة : la silhouette des traits, ramenée dans le cadre. */
function StrokesPreview({ detail }) {
  const box = detail.box;
  const shapes = Array.isArray(detail.shapes) ? detail.shapes : [];
  if (!box || shapes.length === 0) return null;
  // Le dessin entier ramené dans la vignette, sans le déformer.
  const scale = Math.min((VIEW.w - 16) / box.w, (VIEW.h - 16) / box.h);
  const ox = (VIEW.w - box.w * scale) / 2 - box.x * scale;
  const oy = (VIEW.h - box.h * scale) / 2 - box.y * scale;

  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {shapes.map((s, i) => {
        const x = s.x * scale + ox;
        const y = s.y * scale + oy;
        const w = Math.abs(s.w * scale);
        const h = Math.abs(s.h * scale);
        // La clé reste HORS de l'objet répandu : React veut la recevoir
        // directement, et la répandre lui arrache un avertissement à chaque
        // trait (repéré par la recette de la سبّورة).
        const common = { stroke: s.c || '#1e1e1e', strokeWidth: 1.4, fill: 'none' };

        if (s.t === 'ellipse') return <ellipse key={i} {...common} cx={x + (s.w * scale) / 2} cy={y + (s.h * scale) / 2} rx={w / 2 || 1} ry={h / 2 || 1} />;
        if (s.t === 'line' || s.t === 'arrow' || s.t === 'freedraw') {
          return <line key={i} {...common} x1={x} y1={y} x2={x + s.w * scale} y2={y + s.h * scale} />;
        }
        if (s.t === 'text') return <rect key={i} {...common} x={x} y={y} width={Math.max(w, 6)} height={Math.max(h, 3)} opacity="0.45" />;

        return <rect key={i} {...common} x={x} y={y} width={Math.max(w, 2)} height={Math.max(h, 2)} />;
      })}
    </g>
  );
}

/** Les probabilités et statistiques : le diagramme en barres. */
function ChartPreview({ detail }) {
  const bars = Array.isArray(detail.bars) ? detail.bars.filter(Number.isFinite) : [];
  if (bars.length === 0) {
    // Une expérience pas encore lancée : le plateau vide, pas un faux graphe.
    return (
      <g stroke="#cbd5e1" strokeWidth="1.5" fill="none">
        <line x1="14" y1={VIEW.h - 16} x2={VIEW.w - 14} y2={VIEW.h - 16} />
        <rect x={VIEW.w / 2 - 14} y={VIEW.h / 2 - 14} width="28" height="28" rx="6" />
      </g>
    );
  }
  const max = Math.max(...bars, 1);
  const slot = (VIEW.w - 24) / bars.length;
  const width = Math.max(3, slot * 0.68);

  return (
    <g>
      {bars.map((value, i) => {
        const h = Math.max(2, (value / max) * (VIEW.h - 30));

        return (
          <rect
            key={i}
            x={12 + i * slot + (slot - width) / 2}
            y={VIEW.h - 16 - h}
            width={width}
            height={h}
            rx="2"
            fill="#6366f1"
            opacity={0.55 + 0.45 * (value / max)}
          />
        );
      })}
      <line x1="10" y1={VIEW.h - 16} x2={VIEW.w - 10} y2={VIEW.h - 16} stroke="#cbd5e1" strokeWidth="1" />
    </g>
  );
}

/**
 * Le مختبر الجبر : l'équation, en TEXTE — une équation se lit, elle ne se
 * dessine pas. Le texte est neutre en direction (`dir="ltr"`) : « 2x + 3 =
 * 11 » ne se renverse pas dans une page RTL.
 */
function EquationPreview({ detail }) {
  const first = detail.first;
  const current = detail.current;
  const same = !current || current === first;

  return (
    <g>
      <text x={VIEW.w / 2} y={same ? VIEW.h / 2 + 5 : VIEW.h / 2 - 6} textAnchor="middle" fill="#0f172a" fontSize="15" fontWeight="700" direction="ltr">
        {clip(first, 18)}
      </text>
      {!same && (
        <>
          <text x={VIEW.w / 2} y={VIEW.h / 2 + 9} textAnchor="middle" fill="#94a3b8" fontSize="12" direction="ltr">↓</text>
          <text x={VIEW.w / 2} y={VIEW.h / 2 + 26} textAnchor="middle" fill="#15803d" fontSize="15" fontWeight="700" direction="ltr">
            {clip(current, 18)}
          </text>
        </>
      )}
    </g>
  );
}

/** Le مختبر الأشعة : les أشعة du pas courant, dans leur repère. */
function VectorsPreview({ detail }) {
  const vectors = Array.isArray(detail.vectors) ? detail.vectors.slice(0, 6) : [];
  const points = Array.isArray(detail.points) ? detail.points.slice(0, 10) : [];
  const all = [
    ...vectors.flatMap((v) => [{ x: v.x1, y: v.y1 }, { x: v.x2, y: v.y2 }]),
    ...points.map((p) => ({ x: p.x, y: p.y })),
  ].filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (all.length === 0) return <Axes />;

  // Un cadre qui tient tout, centré sur l'origine tant que possible.
  const span = Math.max(2, ...all.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y)))) * 1.2;
  const px = (x) => VIEW.w / 2 + (x / span) * (VIEW.w / 2 - 8);
  const py = (y) => VIEW.h / 2 - (y / span) * (VIEW.h / 2 - 8);

  return (
    <>
      <Axes />
      <defs>
        <marker id="mlw-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="context-stroke" />
        </marker>
      </defs>
      {vectors.map((v, i) => (
        <line
          key={i}
          x1={px(v.x1)} y1={py(v.y1)} x2={px(v.x2)} y2={py(v.y2)}
          stroke={v.c || '#2563eb'} strokeWidth="2" strokeLinecap="round"
          markerEnd="url(#mlw-arrow)"
        />
      ))}
      {points.map((p, i) => <circle key={i} cx={px(p.x)} cy={py(p.y)} r="2.4" fill="#0f172a" />)}
    </>
  );
}

/** Le مختبر المثلثات : le triangle rectangle, ou le cercle. */
function TrianglePreview({ detail }) {
  const cx = VIEW.w / 2;
  const cy = VIEW.h / 2;

  if (detail.mode === 'circle') {
    const a = ((detail.angle ?? 30) * Math.PI) / 180;
    const r = 30;

    return (
      <>
        <Axes />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2563eb" strokeWidth="1.8" />
        <line x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy - r * Math.sin(a)} stroke="#be123c" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx + r * Math.cos(a)} cy={cy - r * Math.sin(a)} r="3" fill="#be123c" />
      </>
    );
  }

  // Le triangle rectangle du programme, à ses vraies proportions quand on
  // les connaît — sinon celles de l'angle.
  const sides = detail.sides ?? {};
  const a = ((detail.angle ?? 30) * Math.PI) / 180;
  const ratio = Number.isFinite(sides.opposite) && Number.isFinite(sides.adjacent) && sides.adjacent > 0
    ? sides.opposite / sides.adjacent
    : Math.tan(a);
  const base = 56;
  const height = Math.max(10, Math.min(52, base * (Number.isFinite(ratio) ? Math.abs(ratio) : 0.6)));
  const x0 = cx - base / 2;
  const y0 = cy + height / 2;

  return (
    <g>
      <path
        d={`M${x0},${y0} h${base} v${-height} Z`}
        fill="rgba(37, 99, 235, 0.10)" stroke="#2563eb" strokeWidth="1.8" strokeLinejoin="round"
      />
      {/* L'angle droit, là où il est : au sommet de la hauteur. */}
      <path d={`M${x0 + base - 8},${y0} v-8 h8`} fill="none" stroke="#2563eb" strokeWidth="1.2" />
      {/* L'angle étudié, à l'autre sommet. */}
      <path d={`M${x0 + 14},${y0} a14,14 0 0 0 ${-14 * (1 - Math.cos(a))},${-14 * Math.sin(a)}`} fill="none" stroke="#be123c" strokeWidth="1.6" />
    </g>
  );
}

/** Le مختبر المتتاليات : les premiers termes, en nuage de points. */
function SequencePreview({ detail }) {
  const terms = Array.isArray(detail.terms) ? detail.terms.filter(Number.isFinite) : [];
  if (terms.length === 0) return <Axes />;
  const min = Math.min(...terms);
  const max = Math.max(...terms);
  const span = max - min || 1;
  const slot = (VIEW.w - 24) / Math.max(1, terms.length - 1 || 1);

  const pts = terms.map((v, i) => ({
    x: 12 + i * slot,
    y: VIEW.h - 14 - ((v - min) / span) * (VIEW.h - 30),
  }));

  return (
    <g>
      <line x1="10" y1={VIEW.h - 14} x2={VIEW.w - 10} y2={VIEW.h - 14} stroke="#cbd5e1" strokeWidth="1" />
      <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.6" fill="#0284c7" />)}
    </g>
  );
}

/**
 * Le مختبر التحويلات : la figure et son IMAGE, superposées.
 *
 * C'est ce qui distingue deux documents de cet instrument l'un de l'autre —
 * pas la famille de transformation, mais le DESSIN qu'elle a produit. Le
 * trait plein est l'original, le pointillé l'image : la même distinction
 * qu'à l'écran (§46), pour qu'une vignette se lise comme le plan.
 */
function ShapesPreview({ detail }) {
  const source = Array.isArray(detail.a) ? detail.a.slice(0, 12) : [];
  const image = Array.isArray(detail.b) ? detail.b.slice(0, 12) : [];
  const all = [...source, ...image].filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y));
  if (all.length === 0) return <Axes />;

  // Un cadre qui tient tout, centré sur l'origine tant que possible.
  const span = Math.max(2, ...all.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y)))) * 1.25;
  const px = (x) => VIEW.w / 2 + (x / span) * (VIEW.w / 2 - 8);
  const py = (y) => VIEW.h / 2 - (y / span) * (VIEW.h / 2 - 8);
  const color = detail.c || '#2563eb';
  const path = (vertices) => vertices.map((p) => `${px(p.x)},${py(p.y)}`).join(' ');

  return (
    <>
      <Axes />
      {image.length > 2 && (
        <polygon points={path(image)} fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.75" strokeDasharray="5 3" />
      )}
      {image.length === 2 && (
        <line x1={px(image[0].x)} y1={py(image[0].y)} x2={px(image[1].x)} y2={py(image[1].y)} stroke={color} strokeWidth="1.75" strokeDasharray="5 3" />
      )}
      {source.length > 2 && (
        <polygon points={path(source)} fill={color} fillOpacity="0.12" stroke={color} strokeWidth="2" />
      )}
      {source.length === 2 && (
        <line x1={px(source[0].x)} y1={py(source[0].y)} x2={px(source[1].x)} y2={py(source[1].y)} stroke={color} strokeWidth="2" strokeLinecap="round" />
      )}
      {source.map((p, i) => <circle key={i} cx={px(p.x)} cy={py(p.y)} r="2.2" fill={color} />)}
    </>
  );
}

const DRAWINGS = {
  curve: CurvePreview,
  solid: SolidPreview,
  strokes: StrokesPreview,
  chart: ChartPreview,
  equation: EquationPreview,
  vectors: VectorsPreview,
  triangle: TrianglePreview,
  sequence: SequencePreview,
  shapes: ShapesPreview,
};

const clip = (text, max) => {
  const s = String(text ?? '');

  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

// La vignette ne dépend que du résumé : inutile de la redessiner quand la
// sélection ou le survol changent l'état de la carte.
export default memo(WorkPreview);
