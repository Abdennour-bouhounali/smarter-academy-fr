import MathText from '../../../../../../common/components/MathText';

/**
 * LES ESSAIS DE L'ÉLÈVE sur un terrain `pitch-expansion` (son `onTrial`),
 * listés AU-DESSUS de la question qu'ils servent (MANIPULATION_DNA §9 :
 * l'orientation n'est pas une réponse) : chaque x vérifié, avec SES nombres —
 * rien de ce qu'il n'a pas essayé. `line(x)` écrit l'égalité d'un essai juste
 * (un îlot `$…$`) ; un essai refusé montre la somme trop petite ou trop grande.
 *
 * `upsertTrial` garde un essai par valeur de x (le dernier), dans l'ordre de x.
 */
export const upsertTrial = (list, trial) => [...list.filter((t) => t.x !== trial.x), trial].sort((a, b) => a.x - b.x);

export default function TrialEvidence({ trials, line, empty }) {
  return (
    <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence>
      {trials.length === 0 && <li className="text-slate-500">{empty}</li>}
      {trials.map((t) => (
        <li key={t.x} data-evidence={t.x} data-ok={String(t.ok)} className={t.ok ? 'font-bold text-slate-800' : 'text-rose-800'}>
          {t.ok
            ? <MathText>{line(t.x)}</MathText>
            : <MathText>{`$x = ${t.x}$ : مجموع المناطق $${t.sum}$ لا يساوي مساحة الملعب $${t.product}$ — مناطق لم تُحسب أو لم تُجمع.`}</MathText>}
        </li>
      ))}
    </ul>
  );
}
