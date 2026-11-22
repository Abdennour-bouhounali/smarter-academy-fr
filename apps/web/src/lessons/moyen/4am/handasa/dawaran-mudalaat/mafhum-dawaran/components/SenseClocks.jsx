
/**
 * Les deux horloges de معارف 1 (p. 154) : « الاتجاه المباشر » (+, contre les aiguilles) et « الاتجاه غير المباشر » (−, avec
 * les aiguilles). Dessinées en SVG ; les mots sont du texte DOM (arabe), le signe et l'arc sont dessinés. Chaque horloge
 * porte la flèche de son sens autour du cadran.
 */
function Clock({ sense }) {
  const c = 40; const R = 26; const r2 = 34;
  const ccw = sense === 'direct';
  // l'arc fléché autour du cadran : de 20° à 160° (repère math), dans le sens de l'horloge
  const P = (deg, r) => [c + r * Math.cos((deg * Math.PI) / 180), c - r * Math.sin((deg * Math.PI) / 180)];
  const [x1, y1] = P(ccw ? 20 : 160, r2); const [x2, y2] = P(ccw ? 160 : 20, r2);
  const end = ccw ? 160 : 20;
  const [ex, ey] = [x2, y2];
  const tdeg = ccw ? end + 90 : end - 90; // tangente dans le sens du parcours
  const tx = Math.cos((tdeg * Math.PI) / 180); const ty = -Math.sin((tdeg * Math.PI) / 180);
  const head = `${ex},${ey} ${ex - tx * 7 - ty * 4},${ey - ty * 7 + tx * 4} ${ex - tx * 7 + ty * 4},${ey - ty * 7 - tx * 4}`;
  const color = ccw ? '#059669' : '#E11D48';
  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20" aria-hidden="true" focusable="false">
      <circle cx={c} cy={c} r={R} fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => { const [a, b] = P(i * 30, R - 3); const [d, e] = P(i * 30, R); return <line key={i} x1={a} y1={b} x2={d} y2={e} stroke="#64748B" strokeWidth="1.2" />; })}
      <line x1={c} y1={c} x2={c} y2={c - 17} stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
      <line x1={c} y1={c} x2={c + 11} y2={c + 4} stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M ${x1} ${y1} A ${r2} ${r2} 0 0 ${ccw ? 0 : 1} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="2.6" />
      <polygon points={head} fill={color} />
      <text x={c} y={76} textAnchor="middle" fontSize="13" fontWeight="800" fill={color} style={{ direction: 'ltr' }}>{ccw ? '+' : '−'}</text>
    </svg>
  );
}

export default function SenseClocks() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6" data-sense-clocks>
      <figure className="flex flex-col items-center gap-1">
        <Clock sense="direct" />
        <figcaption className="text-center text-sm font-bold text-emerald-800">الاتجاه المباشر (الموجب)</figcaption>
        <span className="text-xs text-slate-600">عكس اتجاه عقارب الساعة</span>
      </figure>
      <figure className="flex flex-col items-center gap-1">
        <Clock sense="indirect" />
        <figcaption className="text-center text-sm font-bold text-rose-800">الاتجاه غير المباشر (السالب)</figcaption>
        <span className="text-xs text-slate-600">اتجاه حركة عقارب الساعة</span>
      </figure>
    </div>
  );
}
