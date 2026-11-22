
/**
 * Les essais de l'élève au clinomètre (`onTrial`), listés AU-DESSUS d'une question ([data-activity-evidence],
 * MANIPULATION_DNA §9 : l'orientation n'est pas une réponse — les options ne portent pas l'évidence, ses propres
 * essais si). Une ligne par essai, en écriture LTR (nombres, unités, symboles), jamais la réponse de la question.
 */
function evidenceLine(e) {
  if (!e) return null;
  switch (e.stage) {
    case 'miss': return `d = ${e.d} m ، α = ${e.alpha}° ✗`;
    case 'measure': return `d = ${e.d} m ، α = ${e.alpha}° → h ≈ ${e.h} m`;
    case 'ladder': return `L = ${e.L} m → ${e.top} m ${e.kind === 'below' ? '<' : e.kind === 'above' ? '>' : '='} ${e.hm} m`;
    case 'result': return `L ≈ ${e.L100} m`;
    case 'ratio': return `${e.ratio} ✓`;
    case 'refusal': return e.ratio ? `${e.ratio} ✗` : `${e.op === 'mul' ? '×' : '÷'} ✗`;
    default: return null;
  }
}

export default function LabEvidence({ trials, filter, title, empty, id }) {
  const shown = trials.filter((e) => !filter || filter(e)).map(evidenceLine).filter(Boolean).slice(-6);
  return (
    <div className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={id}>
      {shown.length === 0 && <p className="text-slate-500" data-tried="false">{empty}</p>}
      {shown.length > 0 && (
        <div data-tried="true">
          <p>{title}</p>
          <ul className="ms-4 list-disc">{shown.map((s, i) => <li key={i}><bdi dir="ltr" className="font-mono">{s}</bdi></li>)}</ul>
        </div>
      )}
    </div>
  );
}
