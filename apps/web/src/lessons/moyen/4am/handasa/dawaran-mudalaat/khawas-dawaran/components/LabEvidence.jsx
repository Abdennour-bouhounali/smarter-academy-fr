import MathText from '../../../../../../common/components/MathText';

/**
 * Les gestes de l'élève sur la feuille calque (`onTrial` de shape-turn), listés AU-DESSUS d'une question
 * ([data-activity-evidence], MANIPULATION_DNA §9 : l'orientation n'est pas une réponse — les options ne portent pas
 * l'évidence, ses propres essais si). Une ligne par essai, dans les mots du laboratoire ; rien n'est écrit d'avance.
 */
const tx = (s) => String(s ?? '').replace(/(\d*)√(\d+)/, '$1\\sqrt{$2}').replace(',', '{,}');
const dir = (t) => (t < 0 ? 'في الاتجاه غير المباشر' : 'في الاتجاه المباشر');

function evidenceLine(e) {
  if (!e) return null;
  switch (e.kind) {
    case 'stamp': return `النسخة ${e.n} طُبعت في $${e.at}^\\circ$ ✓`;
    case 'turn': return `أدرت الورقة $${Math.abs(e.theta)}^\\circ$ ${dir(e.theta)}: الطول $${tx(e.length)}$ ، والزاوية بين المستقيم وصورته $${e.between}^\\circ$`;
    case 'stretch': return e.rotation ? null : `ورقة ممطّطة: $${e.seg} = ${tx(e.orig)}$ لكن $${e.seg[0]}'${e.seg[1]}' = ${tx(e.copy)}$ ✗`;
    case 'refuse': return e.reason === 'stretch' ? 'طباعة مرفوضة: الورقة ممطّطة ✗'
      : e.reason === 'angle' ? `طباعة مرفوضة في $${Math.abs(e.theta)}^\\circ$ : الزاوية $${e.measured}^\\circ$ ✗`
        : e.reason === 'sense' ? `طباعة مرفوضة في $${Math.abs(e.theta)}^\\circ$ : الاتجاه معاكس ✗` : null;
    case 'claim': return null;
    default: return null;
  }
}

export default function LabEvidence({ trials, title, empty, id, filter }) {
  const shown = trials.filter((e) => !filter || filter(e)).map(evidenceLine).filter(Boolean).slice(-6);
  return (
    <div className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={id} data-tried={shown.length ? 'true' : 'false'}>
      {shown.length === 0 && <p className="text-slate-500">{empty}</p>}
      {shown.length > 0 && (
        <>
          <p className="font-bold text-slate-700">{title}</p>
          <ul className="ms-4 list-disc">{shown.map((s, i) => <li key={i}><MathText>{s}</MathText></li>)}</ul>
        </>
      )}
    </div>
  );
}
