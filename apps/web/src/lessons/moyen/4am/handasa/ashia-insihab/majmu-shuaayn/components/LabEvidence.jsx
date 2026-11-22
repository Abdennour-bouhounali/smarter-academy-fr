import MathText from '../../../../../../common/components/MathText';

/**
 * Les essais de l'élève au laboratoire vector-sum (`onTrial`), listés AU-DESSUS d'une question ([data-activity-evidence],
 * MANIPULATION_DNA §9 : les options ne portent pas l'évidence, ses propres essais si). Une ligne par essai ; les formules
 * et les nombres sont des îlots LTR (MathText), jamais la réponse de la question posée dessous.
 */
function evidenceLine(e) {
  if (!e) return null;
  if (e.mode === 'parallelogram') {
    if (e.side === 'target') return `$\\theta = ${e.theta}^{\\circ}$ : وصل السبّاح إلى B`;
    return `$\\theta = ${e.theta}^{\\circ}$ : وصل ${e.drift} m ${e.side === 'downstream' ? 'أسفل' : 'أعلى'} B`;
  }
  if (e.kind === 'refusal') return `مشوار ثانٍ من ${e.at}: رفض`;
  const path = e.path.replace(',', '{,}');
  if (e.kind === 'zero') return `$\\overrightarrow{AB} + \\overrightarrow{BA} = \\vec{0}$ ، العدّاد ≈ $${path}$`;
  return `$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ ، العدّاد ≈ $${path}$ و AC ≈ $${e.straight.replace(',', '{,}')}$`;
}

export default function LabEvidence({ trials, filter, title, empty, id }) {
  const shown = trials.filter((e) => !filter || filter(e)).map(evidenceLine).filter(Boolean).slice(-6);
  return (
    <div className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={id}>
      {shown.length === 0 && <p className="text-slate-500" data-tried="false">{empty}</p>}
      {shown.length > 0 && (
        <div data-tried="true">
          <p>{title}</p>
          <ul className="ms-4 list-disc">{shown.map((s, i) => <li key={i}><MathText>{s}</MathText></li>)}</ul>
        </div>
      )}
    </div>
  );
}
