
/**
 * Les figures de la synthèse, DESSINÉES (jamais une image) :
 *
 *   LinesFigure   un repère quadrillé et une, deux ou trois DROITES y = ax + b, tracées à partir de leurs
 *                 coefficients (aucun nombre inventé) : les participants (y = −x + 36 et y = −x/2 + 20) et
 *                 les deux bus (150x + 6000 et 200x + 5000). Les graduations tombent sur les nœuds du
 *                 quadrillage, si bien que le point d'intersection se LIT ; la figure ne l'écrit pas.
 *                 `cross` dessine seulement le point (sans ses coordonnées) quand la question ne porte pas
 *                 sur sa lecture.
 *   BeachVignette vignette DÉCORATIVE de la carte d'activité (aria-hidden) : la mer, le soleil, un bus,
 *                 un kayak — sans aucun nombre.
 */
const COLORS = ['#2563EB', '#DC2626', '#059669'];
const fmt = (v) => String(v).replace('.', ',');

/**
 * @param {{ lines: { a: number, b: number, name: string }[], xMax: number, yMax: number, xStep: number,
 *   yStep: number, yLabelEvery?: number, xTitle: string, yTitle: string, label: string, cross?: {x:number,y:number} }} p
 */
function LinesFigure({ lines, xMax, yMax, xStep, yStep, yLabelEvery = 1, xTitle, yTitle, label, cross, figureId }) {
  const W = 340; const H = 250;
  const L = 48; const R = 14; const T = 22; const B = 34;
  const X = (v) => L + (v / xMax) * (W - L - R);
  const Y = (v) => H - B - (v / yMax) * (H - T - B);
  const xs = []; for (let v = 0; v <= xMax + 1e-9; v += xStep) xs.push(v);
  const ys = []; for (let v = 0; v <= yMax + 1e-9; v += yStep) ys.push(v);
  // Le segment visible de y = ax + b dans [0 ; xMax] × [0 ; yMax].
  const segment = ({ a, b }) => {
    const pts = [];
    const add = (x, y) => { if (x >= -1e-9 && x <= xMax + 1e-9 && y >= -1e-9 && y <= yMax + 1e-9) pts.push([x, y]); };
    add(0, b); add(xMax, a * xMax + b);
    if (a !== 0) { add(-b / a, 0); add((yMax - b) / a, yMax); }
    pts.sort((p, q) => p[0] - q[0]);
    return [pts[0], pts[pts.length - 1]];
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-md" role="img" aria-label={label} data-lines-figure={figureId}>
      <rect width={W} height={H} fill="#FFFFFF" />
      {xs.map((v) => <line key={`gx${v}`} x1={X(v)} y1={Y(0)} x2={X(v)} y2={Y(yMax)} stroke="#E2E8F0" strokeWidth="1" />)}
      {ys.map((v) => <line key={`gy${v}`} x1={X(0)} y1={Y(v)} x2={X(xMax)} y2={Y(v)} stroke="#E2E8F0" strokeWidth="1" />)}
      <line x1={X(0)} y1={Y(0)} x2={X(xMax) + 8} y2={Y(0)} stroke="#0F172A" strokeWidth="1.2" />
      <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(yMax) - 8} stroke="#0F172A" strokeWidth="1.2" />
      {xs.map((v) => (
        <text key={`lx${v}`} x={X(v)} y={Y(0) + 13} fontSize="9" textAnchor="middle" fill="#334155" direction="ltr">{fmt(v)}</text>
      ))}
      {ys.filter((_, i) => i % yLabelEvery === 0).map((v) => (
        <text key={`ly${v}`} x={X(0) - 4} y={Y(v) + 3} fontSize="9" textAnchor="end" fill="#334155" direction="ltr">{fmt(v)}</text>
      ))}
      {/* Titres d'axes : texte arabe en RTL explicite (« start » = bord droit, « end » = bord gauche). */}
      <text x={X(xMax)} y={H - 4} fontSize="10" textAnchor="start" direction="rtl" fill="#0F172A">{xTitle}</text>
      <text x={X(0) + 4} y={12} fontSize="10" textAnchor="end" direction="rtl" fill="#0F172A">{yTitle}</text>
      {lines.map((ln, i) => {
        const [p, q] = segment(ln);
        // L'étiquette au début de la droite (sur l'axe des ordonnées) ou à sa fin, décalée de `labelDy`.
        const at = ln.labelAt === 'end' ? q : p;
        const lx = ln.labelAt === 'end' ? X(at[0]) - 2 : X(at[0]) + 6;
        const anchor = ln.labelAt === 'end' ? (ln.rtl ? 'start' : 'end') : (ln.rtl ? 'end' : 'start');
        return (
          <g key={ln.name} data-line={ln.name}>
            <line x1={X(p[0])} y1={Y(p[1])} x2={X(q[0])} y2={Y(q[1])} stroke={COLORS[i % COLORS.length]} strokeWidth="2" />
            <text x={lx} y={Y(at[1]) + (ln.labelDy ?? -6)} fontSize="11" fontWeight="700" textAnchor={anchor} direction={ln.rtl ? 'rtl' : 'ltr'} fill={COLORS[i % COLORS.length]}>{ln.name}</text>
          </g>
        );
      })}
      {cross && <circle cx={X(cross.x)} cy={Y(cross.y)} r="3.5" fill="#0F172A" data-cross="true" />}
    </svg>
  );
}

/** Les participants : y = −x + 36 (personnes) et y = −x/2 + 20 (argent), quadrillage de 4 en 4. */
export function ParticipantsFigure({ persons = 36, intercept = 20, xMax = 40, yMax = 40, step = 4 }) {
  return (
    <LinesFigure
      figureId="participants"
      lines={[{ a: -1, b: persons, name: '(d₁)', labelDy: -6 }, { a: -0.5, b: intercept, name: '(d₂)', labelDy: -6 }]}
      xMax={xMax} yMax={yMax} xStep={step} yStep={step}
      xTitle="عدد التلاميذ x" yTitle="عدد المرافقين y"
      label={`مستقيمان: d1 يمثل y = −x + ${persons} و d2 يمثل y = −x/2 + ${intercept} ، والتدريج ${step} على المحورين`}
    />
  );
}

/** Les deux bus : f(x) = 150x + 6000 (« الأمل ») et g(x) = 200x + 5000 (« النورس »). */
export function BusFigure() {
  return (
    <LinesFigure
      figureId="bus"
      lines={[{ a: 150, b: 6000, name: 'الأمل', labelAt: 'end', rtl: true, labelDy: 16 }, { a: 200, b: 5000, name: 'النورس', labelAt: 'end', rtl: true, labelDy: -8 }]}
      xMax={40} yMax={14000} xStep={5} yStep={1000} yLabelEvery={2}
      xTitle="عدد التلاميذ" yTitle="الثمن (DA)"
      label="مستقيما ثمني الناقلين بدلالة عدد التلاميذ: الأمل يقطع محور التراتيب في 6000 والنورس في 5000 ، التدريج 5 تلاميذ أفقيا و 1000 DA عموديا"
    />
  );
}

export function BeachVignette() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true" focusable="false">
      <rect width="160" height="90" fill="#E0F2FE" />
      <circle cx="132" cy="18" r="10" fill="#FDE68A" />
      <path d="M0 52 Q40 46 80 52 T160 52 L160 70 L0 70 Z" fill="#38BDF8" />
      <path d="M0 58 Q40 54 80 58 T160 58" fill="none" stroke="#E0F2FE" strokeWidth="1.2" />
      <path d="M0 70 L160 70 L160 90 L0 90 Z" fill="#FDE68A" />
      {/* un kayak et sa pagaie */}
      <path d="M92 55 Q106 50 122 55 Q106 59 92 55 Z" fill="#F97316" />
      <line x1="100" y1="49" x2="114" y2="60" stroke="#334155" strokeWidth="1.2" />
      <circle cx="107" cy="51" r="2.2" fill="#7C2D12" />
      {/* le bus de la classe, garé sur le sable */}
      <rect x="14" y="66" width="46" height="16" rx="3" fill="#FACC15" stroke="#A16207" strokeWidth="1" />
      {[18, 27, 36, 45].map((x) => <rect key={x} x={x} y="69" width="7" height="5" rx="1" fill="#E0F2FE" />)}
      <circle cx="24" cy="83" r="3" fill="#1E293B" />
      <circle cx="50" cy="83" r="3" fill="#1E293B" />
      {/* un parasol */}
      <line x1="80" y1="86" x2="80" y2="68" stroke="#7C2D12" strokeWidth="1" />
      <path d="M70 70 Q80 60 90 70 Z" fill="#EF4444" />
    </svg>
  );
}
