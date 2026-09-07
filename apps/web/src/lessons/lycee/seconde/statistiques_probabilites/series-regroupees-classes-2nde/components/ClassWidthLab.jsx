import React from 'react';
import { groupIntoClasses, formatNumber, formatClass } from '../../../../../common/stats';

/**
 * ClassWidthLab — LE laboratoire d'ouverture : régler l'AMPLITUDE des classes
 * et voir la distribution apparaître, puis se dissoudre.
 *
 * Activité (INTERACTION_PEDAGOGY §24) :
 *  - objectif : faire découvrir le regroupement comme la SOLUTION à un
 *    problème réel (200 valeurs toutes distinctes, illisibles), et faire
 *    sentir qu'une amplitude trop fine ne résume rien tandis qu'une amplitude
 *    trop large efface la forme ;
 *  - action de l'élève : glisser un curseur d'amplitude ;
 *  - variable contrôlée : la largeur des tranches — la seule vraie variable
 *    de décision du statisticien ici ;
 *  - conséquence visuelle immédiate : les barres se recomposent pendant le
 *    glissement, et le nombre de classes est affiché.
 *
 * Le nuage des 200 points reste dessiné SOUS les barres : l'élève voit que le
 * regroupement ne modifie pas les données, il les range. C'est ce qui rend
 * ensuite compréhensible que les indicateurs deviennent « estimés ».
 *
 * RÈGLE GÉNÉRALE DU PROJET : jamais figé après validation de l'étape.
 */
export default function ClassWidthLab({
  values,
  width: amplitude,
  onWidthChange,
  min = 10,
  max = 90,
  amplitudes = [2, 5, 10, 20, 40],
  unit = 'min',
  showDots = true,
  showTable = false,
}) {
  const bornes = [];
  for (let b = min; b <= max + 1e-9; b += amplitude) bornes.push(Number(b.toFixed(6)));
  if (bornes[bornes.length - 1] < max) bornes.push(max);
  const classes = groupIntoClasses(values, bornes);

  const W = 1000;
  const H = 210;
  const pad = { left: 40, right: 16, top: 14, bottom: 54 };
  const IW = W - pad.left - pad.right;
  const IH = H - pad.top - pad.bottom;
  const span = max - min || 1;
  const toX = (v) => pad.left + ((v - min) / span) * IW;
  const maxCount = Math.max(1, ...classes.map((c) => c.count));
  const toY = (n) => pad.top + IH - (n / maxCount) * IH;

  const idx = amplitudes.indexOf(amplitude);

  return (
    <div className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`${values.length} valeurs regroupées en ${classes.length} classes d’amplitude ${amplitude} ${unit}`}
        className="select-none overflow-visible">
        {classes.map((c, i) => (
          <g key={i}>
            <rect x={toX(c.from)} y={toY(c.count)}
              width={Math.max(1, toX(c.to) - toX(c.from) - 1)} height={pad.top + IH - toY(c.count)}
              fill="#38bdf8" fillOpacity="0.55" stroke="#0284c7" strokeWidth="1.4" />
            {/* La barre la plus haute touche le haut du cadre : son étiquette
                passe alors À L'INTÉRIEUR, sinon elle sortirait du viewBox. */}
            {c.count > 0 && toX(c.to) - toX(c.from) > 26 && (
              toY(c.count) > pad.top + 14 ? (
                <text x={(toX(c.from) + toX(c.to)) / 2} y={toY(c.count) - 5}
                  textAnchor="middle" fontSize="13" fontWeight="700" fill="#0369a1">{c.count}</text>
              ) : (
                <text x={(toX(c.from) + toX(c.to)) / 2} y={toY(c.count) + 15}
                  textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{c.count}</text>
              )
            )}
          </g>
        ))}

        {/* Les 200 données brutes, sous les barres : le regroupement RANGE
            les valeurs, il ne les change pas. */}
        {showDots && values.map((v, i) => (
          <circle key={i} cx={toX(v)} cy={pad.top + IH + 12} r="1.8" fill="#1e293b" opacity="0.5" />
        ))}

        <line x1={pad.left} y1={pad.top + IH} x2={W - pad.right} y2={pad.top + IH} stroke="#475569" strokeWidth="1.5" />
        {bornes.filter((_, i) => bornes.length <= 12 || i % Math.ceil(bornes.length / 10) === 0).map((b) => (
          <g key={b}>
            <line x1={toX(b)} y1={pad.top + IH} x2={toX(b)} y2={pad.top + IH + 5} stroke="#94a3b8" strokeWidth="1" />
            <text x={toX(b)} y={pad.top + IH + 34} textAnchor="middle" fontSize="14" fill="#64748b">{formatNumber(b, 0)}</text>
          </g>
        ))}
        <text x={W - pad.right} y={pad.top + IH + 50} textAnchor="end" fontSize="13" fill="#94a3b8">{unit}</text>
        <text x={pad.left - 8} y={pad.top + 10} textAnchor="end" fontSize="13" fill="#94a3b8">{maxCount}</text>
      </svg>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <label htmlFor="cwl" className="text-sm font-semibold text-slate-700">
            Amplitude des classes — la largeur de chaque tranche :
          </label>
          <span className="font-mono font-black text-lg tabular-nums text-indigo-800">
            {amplitude} {unit} · {classes.length} classe{classes.length > 1 ? 's' : ''}
          </span>
        </div>
        <input id="cwl" type="range" min={0} max={amplitudes.length - 1} step={1}
          value={idx < 0 ? 2 : idx}
          onChange={(e) => onWidthChange(amplitudes[Number(e.target.value)])}
          aria-label="Amplitude des classes"
          aria-valuetext={`${amplitude} ${unit}, ${classes.length} classes`}
          className="sa-slider accent-indigo-600" />
        <div className="flex justify-between text-[13px] font-mono text-slate-400 -mt-1 px-0.5">
          {amplitudes.map((a) => (
            <span key={a} className={a === amplitude ? 'font-bold text-indigo-700' : ''}>{a}</span>
          ))}
        </div>
      </div>

      {showTable && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm" aria-label="Tableau des effectifs par classe">
            <thead>
              <tr>
                {['Classe', 'Effectif', 'Fréquence'].map((h) => (
                  <th key={h} scope="col" className="border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((c, i) => (
                <tr key={i}>
                  <td className="border border-slate-200 px-3 py-1.5 text-center font-mono text-slate-700">{formatClass(c)}</td>
                  <td className="border border-slate-200 px-3 py-1.5 text-center font-mono tabular-nums font-bold text-slate-800">{c.count}</td>
                  <td className="border border-slate-200 px-3 py-1.5 text-center font-mono tabular-nums text-slate-600">{formatNumber(c.frequency * 100, 1)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
