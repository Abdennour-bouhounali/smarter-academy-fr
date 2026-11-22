import { FIG, ltrText } from './palette';

/**
 * #325 « الدائرة في المثلّث القائم » — le triangle ABC rectangle en C (CB = b horizontal,
 * CA = a vertical), son cercle inscrit de centre I et de rayon r, les rayons vers les
 * points de contact, le carré de côté r à l'angle droit, et les tangentes égales.
 *
 * Tout est CALCULÉ à partir des deux cathètes (props.a, props.b ; 3 et 4 par défaut) :
 * c = √(a² + b²), r = aire / demi-périmètre (Héron), I = (r, r), et le point de contact
 * sur l'hypoténuse à la distance a − r de A.
 */
export const LAYERS = ['triangle', 'circle', 'radii', 'square', 'tangents'];
export const BASE_LAYERS = ['triangle', 'circle'];

function geometry(a, b) {
  const c = Math.hypot(a, b);
  const s = (a + b + c) / 2;
  const r = (a * b) / 2 / s;
  const k = 220 / Math.max(a, b); // px par unité : la plus grande cathète fait 220 px
  const origin = [62, 34 + a * k];
  const P = (u, v) => [origin[0] + u * k, origin[1] - v * k];
  const ta = (a - r) / c; // fraction de AB parcourue depuis A jusqu'au point de contact
  return {
    a, b, c, r, k,
    C: P(0, 0), A: P(0, a), B: P(b, 0), I: P(r, r),
    tOnCB: P(r, 0), tOnCA: P(0, r), tOnAB: P(b * ta, a - a * ta),
    height: 34 + a * k + 46,
  };
}

const pt = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`;
const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
const fmt = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/0+$/, ''));

function Label({ at, dx = 0, dy = 0, children, color = FIG.label, size = 15 }) {
  return (
    <text x={at[0] + dx} y={at[1] + dy} fill={color} fontSize={size} fontWeight="600" textAnchor="middle" dominantBaseline="middle" style={ltrText}>
      {children}
    </text>
  );
}

export default function IncircleRight({ layers = BASE_LAYERS, props = {}, ariaLabel }) {
  const on = new Set(layers);
  const g = geometry(Number(props.a ?? 3), Number(props.b ?? 4));
  const { A, B, C, I, r, k } = g;
  const n = [g.a / g.c, g.b / g.c]; // normale extérieure de AB (repère mathématique)
  const outAB = (p, d) => [p[0] + n[0] * d, p[1] - n[1] * d];
  const m = 14; // marqueur d'angle droit en px
  return (
    <svg viewBox={`0 0 340 ${g.height.toFixed(0)}`} role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[460px]" data-figure="IncircleRight">
      <rect x="0" y="0" width="340" height={g.height.toFixed(0)} fill={FIG.paper} />
      {on.has('square') && (
        <path d={`M ${pt(C)} L ${pt(g.tOnCB)} L ${pt(I)} L ${pt(g.tOnCA)} Z`} fill={FIG.buildFill} stroke={FIG.build} strokeWidth="1.6" />
      )}
      {on.has('circle') && (
        <g>
          <circle cx={I[0]} cy={I[1]} r={r * k} fill={FIG.soughtFill} stroke={FIG.sought} strokeWidth="2.4" />
          <circle cx={I[0]} cy={I[1]} r="3.5" fill={FIG.sought} />
          <Label at={I} dx={11} dy={12} color={FIG.sought} size={14}>I</Label>
        </g>
      )}
      {on.has('radii') && (
        <g stroke={FIG.build} strokeWidth="2" strokeDasharray="5 4">
          {[g.tOnCB, g.tOnCA, g.tOnAB].map((t) => <path key={pt(t)} d={`M ${pt(I)} L ${pt(t)}`} />)}
        </g>
      )}
      {(on.has('radii') || on.has('tangents')) && (
        <g fill={FIG.ink}>
          {[g.tOnCB, g.tOnCA, g.tOnAB].map((t) => <circle key={pt(t)} cx={t[0]} cy={t[1]} r="3.2" />)}
        </g>
      )}
      {on.has('radii') && !on.has('square') && (
        <Label at={mid(I, g.tOnAB)} dx={-9} dy={-7} color={FIG.build} size={13}>r</Label>
      )}
      {on.has('tangents') && (
        <g strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d={`M ${pt(A)} L ${pt(g.tOnCA)} M ${pt(A)} L ${pt(g.tOnAB)}`} stroke={FIG.observe} />
          <path d={`M ${pt(B)} L ${pt(g.tOnCB)} M ${pt(B)} L ${pt(g.tOnAB)}`} stroke={FIG.sought} />
          <path d={`M ${pt(C)} L ${pt(g.tOnCB)} M ${pt(C)} L ${pt(g.tOnCA)}`} stroke={FIG.build} />
        </g>
      )}
      {on.has('triangle') && (
        <g>
          <path d={`M ${pt(A)} L ${pt(B)} L ${pt(C)} Z`} fill="none" stroke={FIG.ink} strokeWidth="2.2" strokeLinejoin="round" />
          <path d={`M ${C[0] + m} ${C[1]} L ${C[0] + m} ${C[1] - m} L ${C[0]} ${C[1] - m}`} fill="none" stroke={FIG.ink} strokeWidth="1.4" />
          <Label at={A} dx={-14} dy={-6}>A</Label>
          <Label at={B} dx={14} dy={8}>B</Label>
          <Label at={C} dx={-14} dy={10}>C</Label>
          {!on.has('tangents') && (
            <>
              <Label at={mid(A, C)} dx={-16}>{fmt(g.a)}</Label>
              <Label at={mid(C, B)} dy={18}>{fmt(g.b)}</Label>
              <Label at={outAB(mid(A, B), 16)}>{fmt(g.c)}</Label>
            </>
          )}
        </g>
      )}
      {on.has('square') && (
        <>
          <Label at={mid(C, g.tOnCB)} dy={16} color={FIG.build} size={13}>r</Label>
          <Label at={mid(C, g.tOnCA)} dx={-14} color={FIG.build} size={13}>r</Label>
        </>
      )}
      {on.has('tangents') && (
        <g>
          <Label at={mid(A, g.tOnCA)} dx={-30} color={FIG.observe} size={13}>{`${fmt(g.a)} − r`}</Label>
          <Label at={outAB(mid(A, g.tOnAB), 22)} color={FIG.observe} size={13}>{`${fmt(g.a)} − r`}</Label>
          <Label at={mid(B, g.tOnCB)} dy={18} color={FIG.sought} size={13}>{`${fmt(g.b)} − r`}</Label>
          <Label at={outAB(mid(B, g.tOnAB), 22)} color={FIG.sought} size={13}>{`${fmt(g.b)} − r`}</Label>
          <Label at={mid(C, g.tOnCB)} dy={18} color={FIG.build} size={13}>r</Label>
          <Label at={mid(C, g.tOnCA)} dx={-14} color={FIG.build} size={13}>r</Label>
          {[A, B, C].map((v) => <circle key={pt(v)} cx={v[0]} cy={v[1]} r="3" fill={FIG.ink} />)}
        </g>
      )}
    </svg>
  );
}
