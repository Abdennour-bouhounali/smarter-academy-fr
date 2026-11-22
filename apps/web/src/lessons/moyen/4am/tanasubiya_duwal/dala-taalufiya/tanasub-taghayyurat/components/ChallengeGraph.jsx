import { CHALLENGE_READ } from '../content/textbook';

/**
 * Le BIAN du تحدّ (p. 77), redessiné en SVG : la droite qui ne passe pas par l'origine, l'axe des °C de 0 à 40
 * au pas de 5, l'axe des °F gradué comme le manuel (16, 32, 41, … 104), les pointillés de chaque abscisse à
 * son ordonnée. Les deux points que la leçon retient — (10 ; 50) et (30 ; 86) — sont marqués. Le dessin LIT
 * la figure du manuel (CHALLENGE_READ.points, recalculés de f(x) = 1,8x + 32 par l'extraction) ; il est en
 * LTR, les mots des axes en DOM n'y sont pas (unités seulement, comme le manuel).
 */
const W = 300; const H = 210;
const X0 = 34; const Y0 = 186; const XM = 286; const YT = 12;
const px = (x) => X0 + (x / 40) * (XM - X0 - 12);
const py = (y) => Y0 - (y / 110) * (Y0 - YT);
const Y_LABELS = [16, 32, 41, 50, 59, 68, 77, 86, 95, 104];

export default function ChallengeGraph({ className = '', plain = false }) {
  const pts = CHALLENGE_READ.points;
  // `plain` : la figure nue du manuel (ouverture d'unité), sans les deux points que la leçon retient.
  const kept = plain ? [] : [10, 30];
  return (
    <div dir="ltr" className={`mx-auto w-full max-w-sm ${className}`} data-challenge-graph>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="بيان التحدّي: مستقيم يربط الدرجة سلسيوس بالدرجة فهرنهايت ويمرّ بالنقطتين (10 ; 50) و (30 ; 86)">
        <rect x="0" y="0" width={W} height={H} rx="10" fill="#FFFFFF" />
        {/* pointillés du manuel */}
        {pts.filter(([x]) => x > 0).map(([x, y]) => (
          <path key={x} d={`M${px(x)} ${Y0} V${py(y)} H${px(0)}`} fill="none" stroke={kept.includes(x) ? '#D97706' : '#94A3B8'} strokeWidth={kept.includes(x) ? 1.4 : 1} strokeDasharray="3 3" />
        ))}
        {/* axes */}
        <line x1={px(0)} y1={Y0} x2={XM} y2={Y0} stroke="#334155" strokeWidth="1.6" />
        <path d={`M${XM + 2} ${Y0} l-7 -4 v8 z`} fill="#334155" />
        <line x1={px(0)} y1={Y0} x2={px(0)} y2={YT - 4} stroke="#334155" strokeWidth="1.6" />
        <path d={`M${px(0)} ${YT - 6} l-4 7 h8 z`} fill="#334155" />
        {[5, 10, 15, 20, 25, 30, 35, 40].map((x) => <text key={x} x={px(x)} y={Y0 + 13} textAnchor="middle" fontSize="10" fill="#475569" fontFamily="ui-monospace, monospace">{x}</text>)}
        <text x={px(0) - 4} y={Y0 + 13} textAnchor="end" fontSize="10" fill="#475569" fontFamily="ui-monospace, monospace">0</text>
        {Y_LABELS.map((y) => <text key={y} x={px(0) - 4} y={py(y) + 3.5} textAnchor="end" fontSize="9.5" fill="#475569" fontFamily="ui-monospace, monospace">{y}</text>)}
        <text x={XM - 4} y={Y0 - 6} textAnchor="end" fontSize="10" fontWeight="bold" fill="#334155">(°C)</text>
        <text x={px(0) + 6} y={YT + 2} fontSize="10" fontWeight="bold" fill="#334155">(°F)</text>
        {/* la droite */}
        <line x1={px(0)} y1={py(32)} x2={px(40)} y2={py(104)} stroke="#0EA5E9" strokeWidth="2.6" strokeLinecap="round" />
        {kept.map((x) => {
          const y = pts.find((p) => p[0] === x)[1];
          return <circle key={x} cx={px(x)} cy={py(y)} r="4.5" fill="#D97706" stroke="#fff" strokeWidth="1.5" data-kept={`${x}:${y}`} />;
        })}
      </svg>
    </div>
  );
}
