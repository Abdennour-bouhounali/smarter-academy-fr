import { TAXI } from '../content/textbook';

/**
 * Les deux applications de transport (module 2, étape 4) — dessinées en SVG, jamais une image : le prix
 * en fonction de la distance, A : 40x + 120, B : 60x, sur 0–10 km et 0–600 DA (graduations 1 km, 100 DA).
 * Les nombres viennent de content/textbook.js › TAXI. Lecture seulement : aucune réponse n'est écrite.
 */
const W = 300; const H = 210; const L0 = 40; const B0 = 24; const T0 = 12; const R0 = 12;
const px = (x) => L0 + (x / TAXI.xMax) * (W - L0 - R0);
const py = (y) => T0 + (1 - y / TAXI.yMax) * (H - T0 - B0);

export default function TaxiGraph() {
  const line = (p) => {
    const x2 = Math.min(TAXI.xMax, (TAXI.yMax - p.b) / p.a);
    return { x1: px(0), y1: py(p.b), x2: px(x2), y2: py(p.a * x2 + p.b) };
  };
  return (
    <figure className="mx-auto w-full max-w-sm" data-taxi-graph>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="تمثيل بياني: ثمن الرحلة بالتطبيقين A و B بدلالة المسافة" dir="ltr">
        {Array.from({ length: TAXI.xMax + 1 }, (_, i) => (
          <g key={`x${i}`}>
            <line x1={px(i)} x2={px(i)} y1={py(0)} y2={py(TAXI.yMax)} stroke="#E2E8F0" />
            <text x={px(i)} y={py(0) + 14} textAnchor="middle" fontSize="10" fill="#475569">{i}</text>
          </g>
        ))}
        {Array.from({ length: TAXI.yMax / 100 + 1 }, (_, j) => (
          <g key={`y${j}`}>
            <line x1={px(0)} x2={px(TAXI.xMax)} y1={py(j * 100)} y2={py(j * 100)} stroke="#E2E8F0" />
            {j > 0 && <text x={px(0) - 4} y={py(j * 100) + 3.5} textAnchor="end" fontSize="10" fill="#475569">{j * 100}</text>}
          </g>
        ))}
        <line x1={px(0)} x2={px(TAXI.xMax)} y1={py(0)} y2={py(0)} stroke="#334155" strokeWidth="1.5" />
        <line x1={px(0)} x2={px(0)} y1={py(0)} y2={py(TAXI.yMax)} stroke="#334155" strokeWidth="1.5" />
        <line {...line(TAXI.A)} stroke="#2563EB" strokeWidth="2.5" />
        <line {...line(TAXI.B)} stroke="#E11D48" strokeWidth="2.5" />
        <text x={px(9.6)} y={py(TAXI.A.a * 9.6 + TAXI.A.b) + 16} fontSize="12" fontWeight="bold" fill="#2563EB">A</text>
        <text x={px(8.2)} y={py(TAXI.B.a * 8.2) - 6} fontSize="12" fontWeight="bold" fill="#E11D48">B</text>
        <text x={px(TAXI.xMax)} y={H - 1} textAnchor="end" fontSize="10" fill="#334155">x (km)</text>
        <text x={4} y={10} fontSize="10" fill="#334155">DA</text>
      </svg>
      <figcaption className="text-center text-xs text-slate-600">ثمن الرحلة (DA) بدلالة المسافة (km): المستقيم الأزرق للتطبيق A، والأحمر للتطبيق B.</figcaption>
    </figure>
  );
}
