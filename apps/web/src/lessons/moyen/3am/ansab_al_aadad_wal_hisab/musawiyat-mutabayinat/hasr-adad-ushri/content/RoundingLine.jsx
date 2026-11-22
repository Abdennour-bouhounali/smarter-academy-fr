
/**
 * La droite d'un nombre dont on connaît le mudawwar (معارف, « حصر عدد علمنا مدوّره ») : trois repères (r − ½u, r, r + ½u), le segment peint entre eux,
 * un point PLEIN à gauche (le repère est un des nombres cherchés) et un point CREUX à droite (il n'en est pas un). Dessiné en SVG, parametré par ses données ;
 * les nombres sont des îlots LTR dans la page RTL.
 */
const mono = { direction: 'ltr', unicodeBidi: 'isolate' };

export default function RoundingLine({ figure, width = 340, ariaLabel }) {
  const { lo, r, hi } = figure;
  const x0 = 38;
  const x1 = width - 38;
  const xm = (x0 + x1) / 2;
  const y = 40;
  const label = (x, text, bold) => (
    <text x={x} y={y + 30} textAnchor="middle" fontSize={bold ? 17 : 15} fontWeight={bold ? 900 : 700} fill={bold ? '#3730A3' : '#334155'}
      fontFamily="ui-sans-serif, system-ui, sans-serif" style={mono}>{String(text).replace('.', ',')}</text>
  );
  return (
    <svg width="100%" viewBox={`0 0 ${width} 86`} style={{ maxWidth: width, display: 'block', margin: '0 auto' }} role="img" aria-label={ariaLabel} dir="ltr" data-rounding-line>
      <line x1={10} x2={width - 10} y1={y} y2={y} stroke="#94A3B8" strokeWidth={2.5} strokeLinecap="round" />
      <rect x={x0} y={y - 7} width={x1 - x0} height={14} rx={7} fill="#FBBF24" opacity={0.6} />
      {[x0, xm, x1].map((x, i) => <line key={i} x1={x} x2={x} y1={y - 14} y2={y + 14} stroke="#475569" strokeWidth={i === 1 ? 3 : 2} />)}
      <circle cx={x0} cy={y} r={7} fill="#B45309" stroke="#FFFFFF" strokeWidth={2} data-closed />
      <circle cx={x1} cy={y} r={7} fill="#FFFFFF" stroke="#B45309" strokeWidth={3} data-open />
      {label(x0, lo)}
      {label(xm, r, true)}
      {label(x1, hi)}
    </svg>
  );
}
