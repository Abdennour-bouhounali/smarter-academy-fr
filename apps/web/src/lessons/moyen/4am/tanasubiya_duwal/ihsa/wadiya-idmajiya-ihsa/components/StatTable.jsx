
/**
 * Le tableau statistique du manuel, redessiné (p. 100 : القيمة / التكرار ; la situation : عدد الميداليات
 * الذهبية / التكرار). Lu de droite à gauche comme dans le livre : l'en-tête de ligne à droite, puis les
 * valeurs. Une valeur `null` est l'hexagone coloré du manuel (une valeur cachée), dessiné en SVG et
 * annoncé « قيمة مخفية ». Le tableau défile seul sur un téléphone étroit (jamais la page).
 */
function HiddenHex({ n = 1 }) {
  return (
    <span role="img" aria-label={n === 1 ? 'القيمة المخفية الأولى' : 'القيمة المخفية الثانية'} className="inline-flex align-middle" data-hidden-cell={n}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill={n === 1 ? '#F43F5E' : '#F97316'} stroke="#9F1239" strokeWidth="1.2" />
      </svg>
    </span>
  );
}

export default function StatTable({ valueLabel = 'القيمة', countLabel = 'التكرار', values, counts, caption, id }) {
  let hiddenSeen = 0;
  const cells = values.map((v) => {
    if (v === null || v === undefined) { hiddenSeen += 1; return <HiddenHex n={hiddenSeen} />; }
    return String(v).replace('.', ',');
  });
  return (
    <div className="max-w-full overflow-x-auto" data-stat-table={id}>
      <table dir="rtl" className="mx-auto border-collapse text-center text-sm">
        {caption && <caption className="pb-1 text-xs text-slate-500">{caption}</caption>}
        <tbody>
          <tr>
            <th scope="row" className="whitespace-nowrap border border-slate-400 bg-rose-50 px-2 py-1 font-semibold">{valueLabel}</th>
            {cells.map((c, i) => <td key={i} className="border border-slate-400 px-2 py-1 font-mono">{c}</td>)}
          </tr>
          <tr>
            <th scope="row" className="whitespace-nowrap border border-slate-400 bg-rose-50 px-2 py-1 font-semibold">{countLabel}</th>
            {counts.map((c, i) => <td key={i} className="border border-slate-400 px-2 py-1 font-mono">{String(c)}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Vignette décorative de la carte d'activité : une médaille d'or et son ruban (aria-hidden). */
export function MedalVignette() {
  return (
    <svg viewBox="0 0 120 90" className="h-20 w-auto" aria-hidden="true" data-deco="medal">
      <polygon points="42,4 58,4 66,40 52,40" fill="#2563EB" />
      <polygon points="78,4 62,4 54,40 68,40" fill="#DC2626" />
      <circle cx="60" cy="58" r="24" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
      <circle cx="60" cy="58" r="16" fill="none" stroke="#FDE68A" strokeWidth="2" />
      <polygon points="60,47 63,55 71,55 65,60 67,68 60,63 53,68 55,60 49,55 57,55" fill="#FEF3C7" />
    </svg>
  );
}
