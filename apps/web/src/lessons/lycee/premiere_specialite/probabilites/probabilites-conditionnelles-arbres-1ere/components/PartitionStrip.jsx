import React from 'react';

/**
 * PartitionStrip — la population entière en UNE bande, découpée par les cas,
 * chaque part montrant la portion qui réalise l'événement.
 *
 * CE QUE LA FIGURE DOIT FAIRE VOIR, et qui est vrai par construction :
 *   · les parts se suivent sans se chevaucher et remplissent toute la bande —
 *     c'est la PARTITION, rendue littérale au lieu d'être affirmée ;
 *   · dans chaque part, un liseré foncé marque les individus qui réalisent
 *     l'événement ; mis bout à bout, ces liserés donnent exactement le total.
 * C'est le constat qui rend la formule des probabilités totales inévitable :
 * additionner les trois portions, c'est recompter la bande sans rien oublier.
 *
 * LES NOMBRES VIVENT DANS LE DOM. La bande ne porte aucun `<text>` : les
 * effectifs sont dans la légende sous la figure. Une part peut donc devenir
 * arbitrairement fine — 100 sur 10 000 fait 1 % de la largeur — sans qu'aucune
 * étiquette ne déborde ni ne se superpose à sa voisine.
 *
 * `focus` isole une part : les autres passent en gris clair, et seule la part
 * choisie garde sa couleur. Cliquer à nouveau la même part la relâche. La
 * figure n'est jamais figée : `onFocus` reste actif quoi qu'ait validé l'élève.
 */
export default function PartitionStrip({
  total,
  parts,                 // [{ id, label, count, hit, color }]
  focus = null,
  onFocus = null,
  hitLabel = 'concernés',
  height = 58,
}) {
  const W = 1000;
  const sum = parts.reduce((a, p) => a + p.count, 0);
  const hitSum = parts.reduce((a, p) => a + p.hit, 0);

  // La figure ne doit jamais mentir : si les parts ne remplissent pas la
  // population, la partition n'en est pas une et on refuse de la dessiner
  // comme si elle l'était.
  const complete = sum === total;

  let x = 0;
  const segs = parts.map((p) => {
    const w = (p.count / total) * W;
    const hw = (p.hit / total) * W;
    const seg = { ...p, x, w, hw };
    x += w;
    return seg;
  });

  return (
    <div className="space-y-2 rounded-2xl border-2 border-rose-100 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        Les {total} individus, découpés par les {parts.length} cas
        {onFocus ? ' — clique une part pour l’isoler' : ''}
      </p>

      <svg
        width="100%" viewBox={`0 0 ${W} ${height}`} role="img"
        aria-label={`Population de ${total} découpée en ${parts.length} parts qui se suivent sans se chevaucher`}
        className="select-none w-full h-auto"
      >
        <rect x={0} y={0} width={W} height={height} rx="8" fill="#f1f5f9" />
        {segs.map((s) => {
          const dim = focus !== null && focus !== s.id;
          return (
            <g
              key={s.id}
              onClick={onFocus ? () => onFocus(focus === s.id ? null : s.id) : undefined}
              style={onFocus ? { cursor: 'pointer' } : undefined}
            >
              <title>{`${s.label} : ${s.count} individus, dont ${s.hit} ${hitLabel}`}</title>
              {/* la part */}
              <rect
                x={s.x + 1} y={0} width={Math.max(0, s.w - 2)} height={height} rx="5"
                fill={dim ? '#e2e8f0' : s.color} fillOpacity={dim ? 1 : 0.28}
                stroke={dim ? '#cbd5e1' : s.color} strokeWidth="2"
              />
              {/* la portion qui réalise l'événement, calée à gauche de la part */}
              <rect
                x={s.x + 1} y={0} width={Math.max(0, s.hw - 2)} height={height} rx="5"
                fill={dim ? '#94a3b8' : s.color}
              />
            </g>
          );
        })}
      </svg>

      {/* LES NOMBRES — dans le DOM, une ligne par part. */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="px-2 py-1 text-left font-semibold">cas</th>
              <th className="px-2 py-1 text-right font-semibold">individus</th>
              <th className="px-2 py-1 text-right font-semibold">dont {hitLabel}</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p) => {
              const dim = focus !== null && focus !== p.id;
              return (
                <tr key={p.id} className={`border-t border-slate-100 ${dim ? 'text-slate-400' : 'text-slate-700'}`}>
                  <td className="px-2 py-1 text-left">
                    <span
                      aria-hidden="true"
                      className="inline-block w-3 h-3 rounded-sm mr-1.5 align-middle"
                      style={{ background: dim ? '#cbd5e1' : p.color }}
                    />
                    {p.label}
                  </td>
                  <td className="px-2 py-1 text-right font-mono">{p.count}</td>
                  <td className="px-2 py-1 text-right font-mono font-bold">{p.hit}</td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-rose-300 bg-rose-50 font-black text-rose-900">
              <td className="px-2 py-1.5 text-left">
                {complete ? 'total — la bande entière' : 'total — découpage INCOMPLET'}
              </td>
              <td className="px-2 py-1.5 text-right font-mono">{sum}</td>
              <td className="px-2 py-1.5 text-right font-mono">{hitSum}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {!complete && (
        <p className="text-xs font-bold text-rose-700">
          Ces parts ne recouvrent pas les {total} individus : elles n’en font que {sum}. Le
          découpage n’est pas une partition, et la somme des portions ne veut rien dire.
        </p>
      )}
    </div>
  );
}
