import MathText from '../../../../../../common/components/MathText';

/**
 * Les demandes de l'élève au فار (`onTrial` de shape-prover), listées AU-DESSUS d'une question ([data-activity-evidence],
 * MANIPULATION_DNA §9 : l'orientation n'est pas une réponse — les options ne portent pas l'évidence, ses propres
 * demandes si). Une ligne par demande : la position du plot (île KaTeX), ce qu'il affirmait, ✓ / ✗ et, pour un refus,
 * les nombres de la carte jugée ou la raison. Rien n'est écrit d'avance.
 */
const CLAIM = {
  'right:A': 'قائم في A', 'right:B': 'قائم في B', 'iso:C': 'متساوي الساقين رأسه C',
  para: 'متوازي أضلاع', rect: 'مستطيل', rhombus: 'معيّن', square: 'مربّع', circle: 'B و D على الدائرة',
};
const WHY = {
  watar: (e) => `بطاقة الزاوية في ${e.decides}`, apex: (e) => `بطاقة الرأس ${e.decides}`, flat: () => 'نقط على استقامة',
  noCard: () => 'بلا دليل', noClaim: () => 'بلا مطلوب',
  missing: (e) => ({ para: 'ينقص دليل متوازي الأضلاع', diag: 'ينقص دليل القطرين', side: 'ينقص دليل الضلعين المتتاليين', circ: 'ينقص دليل البعد عن المركز' }[e.need] ?? 'دليل ناقص'),
};

function evidenceLine(e) {
  if (!e) return null;
  const at = `$${e.held}(${e.at[0]}\\,;\\,${e.at[1]})$`;
  const claim = CLAIM[e.claim] ?? '';
  if (e.kind === 'ok') return `${at} — ${claim} ✓`;
  if (e.kind === 'false') return e.values ? `${at} — ${claim} ✗ $${e.values[0]} \\neq ${e.values[1]}$` : `${at} — ${claim} ✗`;
  return `${at} — ${claim} ✗ ${(WHY[e.kind] ?? (() => ''))(e)}`;
}

export default function LabEvidence({ trials, level, title, empty, id, filter }) {
  const shown = trials.filter((e) => e.level === level && (!filter || filter(e))).map(evidenceLine).filter(Boolean).slice(-6);
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
