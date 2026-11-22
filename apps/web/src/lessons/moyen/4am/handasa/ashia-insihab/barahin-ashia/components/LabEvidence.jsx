import MathText from '../../../../../../common/components/MathText';

/**
 * Les gestes de l'élève au métro (`onTrial` de vector-chain), listés AU-DESSUS d'une question ([data-activity-evidence],
 * MANIPULATION_DNA §9 : l'orientation n'est pas une réponse — les options ne portent pas l'évidence, ses propres
 * gestes si). Une ligne par geste jugé : l'égalité écrite (île KaTeX) et ✓ / ✗ avec la raison en arabe. La réponse de
 * la question n'y est jamais écrite d'avance : seuls les gestes que l'élève a déjà faits.
 */
const vt = (n) => (n === '0' ? '\\overrightarrow{0}' : `\\overrightarrow{${n}}`);
const REFUSAL = { chainTail: 'لا يتتابعان', chainHead: 'لا يتتابعان', notGiven: 'غير معطاة: الشكل لا يبرهن', nowhere: 'لا يصل إلى محطة' };

function evidenceLine(e) {
  if (!e) return null;
  if (e.mode === 'construct') {
    const centre = `E_${e.build + 1}`;
    if (e.kind === 'carry') return e.ok ? `نقلت المجموع إلى E : $${centre}$ ✓` : `نقلت المجموع إلى ${e.zone.slice(3)} ✗ المركز هو E`;
    if (!e.ok) return `$${vt(e.card)}$ ✗ لا يبدأ من نهاية الممثّل السابق`;
    const from = e.zone.startsWith('st:') && !e.found ? `من ${e.zone.slice(3)}` : 'من نهاية السابق';
    return e.found ? `$${vt(e.card)}$ ${from} ✓ ← $${centre}$` : `$${vt(e.card)}$ ${from} ✓`;
  }
  if (e.mode !== 'reduce') return null;
  if (e.kind === 'couple') {
    if (!e.ok) return `$${e.end === 'tail' ? `${vt(e.train)} + ${vt(e.card)}` : `${vt(e.card)} + ${vt(e.train)}`}$ ✗ ${REFUSAL[e.reason]}`;
    if (e.reason === 'board') return null;
    return `$${e.terms.map(vt).join(' + ')} = ${vt(e.result)}$ ✓`;
  }
  if (e.kind === 'swap') {
    if (e.ok) return `$${vt(e.card)} = ${vt(e.to)}$ ✓`;
    return e.to ? `$${vt(e.card)} = ${vt(e.to)}$ ؟ ✗ ${REFUSAL.notGiven}` : `$${vt(e.card)}$ من ${e.station} ✗ ${REFUSAL.nowhere}`;
  }
  return null;
}

export default function LabEvidence({ trials, level, title, empty, id }) {
  const shown = trials.filter((e) => e.level === level).map(evidenceLine).filter(Boolean).slice(-6);
  return (
    <div className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={id}>
      {shown.length === 0 && <p className="text-slate-500" data-tried="false"><MathText>{empty}</MathText></p>}
      {shown.length > 0 && (
        <div data-tried="true">
          <p>{title}</p>
          <ul className="ms-4 list-disc">{shown.map((s, i) => <li key={i}><MathText>{s}</MathText></li>)}</ul>
        </div>
      )}
    </div>
  );
}
