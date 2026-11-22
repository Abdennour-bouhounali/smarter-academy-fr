import MathText from '../../../../../../common/components/MathText';

/**
 * Les constructions de l'élève au laboratoire (`onTrial` de segment-divider), listées AU-DESSUS des questions
 * (`[data-activity-evidence]`, MANIPULATION_DNA §9) : la question se décide sur ce que la main a fait, jamais
 * sur une option qui porterait la réponse.
 */
const ROW = {
  ok: (t) => `✓ عدد القطع ${t.n}، متقايسة`,
  count: (t) => `✗ وصلتَ العلامة ${t.n} بـ B : عدد القطع ${t.n}`,
  unequal: () => '✗ فتحة المدور تغيّرت: قطع غير متقايسة',
  inside: (t) => `✓ نقطة بين A و B : $\\dfrac{MA}{MB} = ${frac(t.ratio)}$`,
  outside: (t) => `✓ نقطة خارج [AB] : $\\dfrac{NA}{NB} = ${frac(t.ratio)}$`,
  inverted: (t) => `✗ $\\dfrac{MA}{MB} = ${frac(t.ratio)}$ (العددان مبدّلان)`,
  units: (t) => `✗ $\\dfrac{MA}{MB} = ${frac(t.ratio)}$ (وحدتان مختلفتان)`,
  other: (t) => `✗ $\\dfrac{MA}{MB} = ${frac(t.ratio)}$`,
  parallel: () => '✗ المسطرة توازي (AB)',
};
function frac(text) {
  if (!text) return '?';
  const [n, d] = String(text).split('/');
  return d ? `\\dfrac{${n}}{${d}}` : n;
}

export default function TrialsEvidence({ trials, empty = 'لم تُنهِ بعد أي إنشاء في المختبر أعلاه.' }) {
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trials.length ? 'true' : 'false'}>
      {trials.length === 0 ? (
        <p className="text-slate-500">{empty}</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">إنشاءاتك في المختبر:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="trials">
            {trials.map((t, i) => (
              <li key={i} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${t.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-800'}`} data-evidence-trial={t.kind}>
                <MathText>{(ROW[t.kind] ?? ROW.other)(t)}</MathText>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
