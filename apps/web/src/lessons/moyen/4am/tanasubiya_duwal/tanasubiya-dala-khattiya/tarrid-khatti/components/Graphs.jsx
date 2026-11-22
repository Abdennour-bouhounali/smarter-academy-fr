import MathText from '../../../../../../common/components/MathText';
import { ACT_4, CHALLENGE, METHOD_SPRING } from '../content/textbook';

/**
 * Les figures du manuel (pp. 65, 67, 71, 75) REDESSINÉES en SVG — jamais d'image. Le repère est
 * en LTR (les nombres ne se retournent pas) ; les titres des axes, en arabe, sont du texte DOM
 * sous / au-dessus du dessin. Chaque figure accompagne un énoncé qui la décrit : le dessin est
 * `aria-hidden`, et sa légende porte les mots. La largeur suit le conteneur.
 */
const W = 320; const H = 220; const L = 40; const R = 12; const T = 12; const B = 28;
const fmt = (v) => String(Math.round(v * 100) / 100).replace('.', ',');

function Plot({ xMax, yMax, xStep, yStep, xTick = xStep, yTick = yStep, series, xTitle, yTitle, label, extra }) {
  const px = (x) => L + (x / xMax) * (W - L - R);
  const py = (y) => H - B - (y / yMax) * (H - T - B);
  const xs = []; for (let x = 0; x <= xMax + 1e-9; x += xStep) xs.push(x);
  const ys = []; for (let y = 0; y <= yMax + 1e-9; y += yStep) ys.push(y);
  const isTick = (v, step) => Math.abs(v / step - Math.round(v / step)) < 1e-6;
  return (
    <figure className="mx-auto w-full max-w-[26rem] space-y-1" data-figure={label}>
      <figcaption className="text-xs font-bold text-slate-600">{yTitle}</figcaption>
      <div dir="ltr">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true" focusable="false" style={{ display: 'block' }}
          fontFamily="ui-sans-serif, system-ui" fontSize="11">
          {xs.map((x) => <line key={`gx${x}`} x1={px(x)} y1={py(0)} x2={px(x)} y2={py(yMax)} stroke="#FECACA" strokeWidth="0.8" />)}
          {ys.map((y) => <line key={`gy${y}`} x1={px(0)} y1={py(y)} x2={px(xMax)} y2={py(y)} stroke="#FECACA" strokeWidth="0.8" />)}
          <line x1={px(0)} y1={py(0)} x2={px(xMax)} y2={py(0)} stroke="#334155" strokeWidth="1.5" />
          <line x1={px(0)} y1={py(0)} x2={px(0)} y2={py(yMax)} stroke="#334155" strokeWidth="1.5" />
          {xs.filter((x) => x > 0 && isTick(x, xTick)).map((x) => <text key={`tx${x}`} x={px(x)} y={py(0) + 14} textAnchor="middle" fill="#334155">{fmt(x)}</text>)}
          {ys.filter((y) => y > 0 && isTick(y, yTick)).map((y) => <text key={`ty${y}`} x={px(0) - 4} y={py(y) + 4} textAnchor="end" fill="#334155">{fmt(y)}</text>)}
          <text x={px(0) - 4} y={py(0) + 14} textAnchor="end" fill="#334155">0</text>
          {series.map((s) => (
            <g key={s.name}>
              {s.line && <polyline points={s.points.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2.2" strokeDasharray={s.dashed ? '5 4' : undefined} />}
              {s.marks && s.points.map(([x, y]) => (
                <g key={`${x}-${y}`} stroke={s.color} strokeWidth="2">
                  <line x1={px(x) - 4} y1={py(y) - 4} x2={px(x) + 4} y2={py(y) + 4} />
                  <line x1={px(x) - 4} y1={py(y) + 4} x2={px(x) + 4} y2={py(y) - 4} />
                </g>
              ))}
              {s.tag && <text x={px(s.tag[0])} y={py(s.tag[1])} fill={s.color} fontWeight="bold" fontSize="13">{s.name}</text>}
            </g>
          ))}
          {extra?.(px, py)}
        </svg>
      </div>
      <figcaption className="text-xs font-bold text-slate-600 text-end">{xTitle}</figcaption>
    </figure>
  );
}

/**
 * نشاط 4 — les trois graphiques. (1) les points lus du manuel ; (2) et (3) n'ont pas de valeurs
 * lisibles dans le manuel : ils sont redessinés pour leur FORME (une droite qui ne passe pas par
 * O, une courbe), sans graduation, comme les questions les utilisent.
 */
export function Act4Graphs() {
  const pot = ACT_4.potatoes.map(([x, y]) => [Number(x.replace(',', '.')), Number(y)]);
  const [g1, g2, g3] = ACT_4.graphs;
  const perim = [0.25, 0.5, 0.75, 1].map((w) => [w, 2 * 1.5 + 2 * w]);
  const area = [0, 0.1, 0.2, 0.3].map((c) => [c, c * c]);
  const Card = ({ n, children }) => (
    <div className="rounded-xl border-2 border-rose-200 bg-white p-2" data-act4-graph={n}>
      <p className="text-sm font-extrabold text-rose-800">التمثيل <span dir="ltr">({n})</span></p>
      {children}
    </div>
  );
  return (
    <div className="grid gap-2 grid-cols-3" data-act4-graphs>
      <Card n={1}>
        <Plot label="act-4-1" xMax={4} yMax={200} xStep={0.5} yStep={25} xTick={1} yTick={25}
          series={[{ name: 'p', points: pot, color: '#DC2626', marks: true }]} xTitle={g1.x} yTitle={g1.y} />
      </Card>
      <Card n={2}>
        <Plot label="act-4-2" xMax={1.25} yMax={6} xStep={0.25} yStep={1} xTick={0.25} yTick={6}
          series={[{ name: 'e', points: [[0.25, 3.5], [1.25, 5.5]], color: '#DC2626', line: true, dashed: true }, { name: 'p', points: perim, color: '#DC2626', marks: true }]}
          xTitle={g2.x} yTitle={g2.y} />
      </Card>
      <Card n={3}>
        <Plot label="act-4-3" xMax={0.4} yMax={0.12} xStep={0.1} yStep={0.01} xTick={0.1} yTick={0.12}
          series={[{ name: 'c', points: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.33].map((c) => [c, c * c]), color: '#DC2626', line: true, dashed: true }, { name: 'p', points: area, color: '#DC2626', marks: true }]}
          xTitle={g3.x} yTitle={g3.y} />
      </Card>
    </div>
  );
}

/** طرائق p. 71 — le tableau du ressort ; `filled` : le tableau complété (après la question). */
export function SpringTable({ filled = false }) {
  const t = filled ? METHOD_SPRING.completed : METHOD_SPRING.table;
  return (
    <div className="overflow-x-auto" data-spring-table={filled ? 'filled' : 'textbook'}>
      <table className="mx-auto border-collapse text-sm" dir="rtl">
        <tbody>
          {[['$x$ (غرام)', t.x], ['$y$ (سنتيمتر)', t.y]].map(([head, row]) => (
            <tr key={head}>
              <th className="border border-slate-300 bg-slate-100 px-3 py-1.5 font-bold"><MathText>{head}</MathText></th>
              {row.map((v, i) => <td key={i} className="border border-slate-300 px-3 py-1.5 text-center font-mono" dir="ltr">{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** تحدّ p. 65 — les deux véhicules A (ligne brisée) et B (droite par O). */
export function ChallengeGraph() {
  return (
    <Plot label="challenge" xMax={4.5} yMax={300} xStep={0.5} yStep={25} xTick={0.5} yTick={50}
      series={[
        { name: 'A', points: CHALLENGE.A, color: '#2563EB', line: true, tag: [4.2, 280] },
        { name: 'B', points: CHALLENGE.B, color: '#DC2626', line: true, tag: [3.4, 280] },
      ]}
      yTitle="المسافة المقطوعة (km)" xTitle="المدة (h)" />
  );
}

/** تمرين 28 p. 75 — le cycliste : quatre étapes (1 ; 40), (2 ; 70), (3 ; 130), (4 ; 155). */
export function CyclistGraph() {
  return (
    <Plot label="ex-28" xMax={4} yMax={160} xStep={0.5} yStep={10} xTick={1} yTick={20}
      series={[{ name: 'd', points: [[0, 0], [1, 40], [2, 70], [3, 130], [4, 155]], color: '#7C3AED', line: true }]}
      yTitle="المسافة (km)" xTitle="المدة (h)" />
  );
}

/**
 * تمرين 31 p. 75 — le manuel demande à l'élève de TRACER les deux tarifs : la figure n'apparaît
 * qu'après sa réponse (la module la rend sous l'exercice), les deux droites et leur point commun.
 */
export function TariffGraph() {
  return (
    <Plot label="ex-31" xMax={500} yMax={10000} xStep={50} yStep={1000} xTick={100} yTick={2000}
      series={[
        { name: '1', points: [[0, 0], [500, 10000]], color: '#DC2626', line: true, tag: [380, 8600] },
        { name: '2', points: [[0, 4000], [500, 4000]], color: '#2563EB', line: true, tag: [440, 3500] },
      ]}
      extra={(px, py) => <circle cx={px(200)} cy={py(4000)} r="4" fill="#0F172A" />}
      yTitle="ثمن الرحلة (DA)" xTitle="المسافة (km)" />
  );
}
