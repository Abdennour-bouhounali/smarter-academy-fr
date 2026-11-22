import MathText from '../../../../../../common/components/MathText';

/**
 * Les constructions de l'élève au laboratoire (`onTrial` d'angle-compass), listées AU-DESSUS des questions
 * (`[data-activity-evidence]`, MANIPULATION_DNA §9) : la question se décide sur ce que la main a fait, jamais sur
 * une option qui porterait la réponse. Une ligne = les trois côtés du triangle et les rapports de l'angle désigné.
 */
const KIND = { cos: '\\cos', sin: '\\sin', tan: '\\tan' };
const t = (s) => (s.includes('/') ? `\\dfrac{${s.split('/')[0].replace(/√(\d+)/, '\\sqrt{$1}')}}{${s.split('/')[1]}}` : s.replace(/√(\d+)/, '\\sqrt{$1}'));

export default function TrialsEvidence({ trials, empty = 'لم تُنهِ بعد أي إنشاء في المختبر أعلاه.' }) {
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trials.length ? 'true' : 'false'}>
      {trials.length === 0 ? (
        <p className="text-slate-500">{empty}</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">إنشاءاتك في المختبر:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="trials">
            {trials.map((e, i) => (
              <li key={i} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${e.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-800'}`} data-evidence-trial={e.kind}>
                <MathText>{`${e.ok ? '✓' : '✗'} الأضلاع $${t(e.h)}$ و $${t(e.v)}$ والوتر $${t(e.c)}$ : $${KIND.cos} = ${e.cosTex}$ ، $${KIND.sin} = ${e.sinTex}$ ، $${KIND.tan} = ${e.tanTex}$`}</MathText>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
