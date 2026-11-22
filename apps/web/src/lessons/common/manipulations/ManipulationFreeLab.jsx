import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';
import NumberInput from './primitives/NumberInput';

const toNumber = (s) => Number(String(s).replace(/[٠-٩]/g, (ch) => String(ch.charCodeAt(0) - 0x0660)));

/**
 * Le « مختبر حر » (§17) — des nombres choisis par l'élève.
 *
 * Ce n'est PAS un niveau : les niveaux sont deux (مبتدئ / متقدم, voir
 * ManipulationLevelSelector). Le laboratoire libre ne s'ouvre qu'après la
 * découverte (l'élève a d'abord vu l'idée sur les nombres du manuel) ; les
 * nombres saisis passent par les bornes du registre (`changeNumbers`) ET par
 * `validate` (contrainte croisée du type), donc aucun cas pathologique n'est
 * généré. `alwaysOpen` lève cette porte : le type où tester SON propre nombre
 * est le geste même (factor-pairs, 2026-10-09) l'offre dès le premier écran.
 *
 * CONTRAT DOM (e2e) : [data-manipulation-free-lab]
 */
export default function ManipulationFreeLab({ state, numberFields = [], constraints, validate, allowFreeLab = true, alwaysOpen = false, lead }) {
  const { t } = useTranslation('lesson');
  const [draft, setDraft] = useState(() => Object.fromEntries(numberFields.map((f) => [f.key, String(state.numbers?.[f.key] ?? '')])));
  const [error, setError] = useState('');
  const canFree = allowFreeLab && constraints && numberFields.length > 0 && (alwaysOpen || state.isDiscovered || state.isClass);

  const apply = () => {
    const next = {};
    for (const f of numberFields) {
      const v = toNumber(draft[f.key]);
      const [min, max] = constraints?.[f.key] ?? [f.min ?? 0, f.max ?? Number.MAX_SAFE_INTEGER];
      if (!Number.isInteger(v) || v < min || v > max) { setError(t('manipulation.invalidNumber', { label: f.label, min, max })); return; }
      next[f.key] = v;
    }
    const problem = validate?.(next);
    if (problem) { setError(problem); return; }
    setError('');
    state.setNumbers({ ...state.numbers, ...next });
  };

  if (!canFree) return null;
  if (alwaysOpen) {
    // Version EN TÊTE : un champ toujours visible (« جرّب عددًا آخر »), Entrée valide.
    return (
      <form data-manipulation-free-lab data-free-lab-inline className="flex flex-wrap items-end gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/80 px-3 py-2"
        onSubmit={(e) => { e.preventDefault(); apply(); }}>
        <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
          <FlaskConical className="h-4 w-4" aria-hidden="true" /> {t('manipulation.freeLab.title')}
        </span>
        {numberFields.map((f) => (
          <NumberInput key={f.key} id={`manip-free-${state.type}-${f.key}`} label={f.label} value={draft[f.key]} min={constraints?.[f.key]?.[0]} max={constraints?.[f.key]?.[1]} invalid={!!error} onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))} />
        ))}
        <button type="submit" className="min-h-[44px] rounded-xl border-2 border-blue-600 bg-blue-600 px-4 py-2 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{t('manipulation.apply')}</button>
        <p className="min-w-[12rem] flex-1 text-xs text-slate-600">{lead ?? t('manipulation.freeLab.lead')}</p>
        {error && <p role="alert" className="w-full text-sm text-rose-700">{error}</p>}
      </form>
    );
  }
  return (
    <div data-manipulation-free-lab>
      <button type="button" onClick={() => state.setFreeLab(!state.freeLab)} aria-pressed={state.freeLab}
        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${state.freeLab ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>
        <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> {t('manipulation.freeLab.title')}
      </button>
      {state.freeLab && (
        <div className="mt-2 flex flex-wrap items-end gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-3">
          <p className="w-full text-xs text-slate-600">{lead ?? t('manipulation.freeLab.lead')}</p>
          {numberFields.map((f) => (
            <NumberInput key={f.key} id={`manip-free-${state.type}-${f.key}`} label={f.label} value={draft[f.key]} min={constraints?.[f.key]?.[0]} max={constraints?.[f.key]?.[1]} invalid={!!error} onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))} />
          ))}
          <button type="button" onClick={apply} className="min-h-[40px] rounded-xl border-2 border-blue-600 bg-blue-600 px-4 py-2 text-sm font-bold text-white">{t('manipulation.apply')}</button>
          {error && <p role="alert" className="w-full text-sm text-rose-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
