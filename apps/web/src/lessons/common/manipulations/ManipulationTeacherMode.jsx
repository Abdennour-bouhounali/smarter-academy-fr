import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Presentation, User, Eye, EyeOff, Play, Pause, Hash, Undo2 } from 'lucide-react';
import { ChevronForward, ChevronBack } from '../../../components/common/DirectionalIcons';
import NumberInput from './primitives/NumberInput';

const toNumber = (s) => Number(String(s).replace(/[٠-٩]/g, (ch) => String(ch.charCodeAt(0) - 0x0660)));

export function Btn({ onClick, disabled, children, tone = 'slate', pressed, ariaLabel, title, small = false, ...data }) {
  return (
    <button
      {...data} type="button" onClick={onClick} disabled={disabled} aria-pressed={pressed} aria-label={ariaLabel} title={title}
      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 ${small ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'} font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 ${
        tone === 'blue' ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
          : tone === 'amber' ? 'border-amber-500 bg-amber-100 text-amber-900 hover:bg-amber-200'
          : pressed ? 'border-slate-800 bg-slate-800 text-white'
          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Le MODE CLASSE (§20) — la manipulation sur un projecteur.
 *
 * La bascule « وضع التلميذ / وضع القسم » est en tête de la manipulation. En
 * mode classe l'enseignant garde TOUS les gestes de l'élève (il montre en
 * faisant) et gagne la RÉVÉLATION contrôlée :
 *   الخطوة التالية   le geste canonique suivant, exécuté pour lui (`autoStep`)
 *   السابقة          un pas en arrière quand le type le permet (`canPrev`)
 *   إعادة العرض ⏵     rejouer les étapes une à une, ⏸ pour suspendre
 *   إظهار/إخفاء النتيجة   la conclusion masquée pour que la classe la formule
 *   إظهار الحل       la solution complète (jamais offerte à l'élève seul)
 *   تغيير الأعداد    dans les CONTRAINTES du registre + `validate` du type
 *
 * Aucune mathématique ici : chaque geste est délégué au type via `controller`.
 */
export default function ManipulationTeacherMode({
  state, controller = {}, controls = {}, numberFields = [], constraints, validate, allowModeSwitch = true,
}) {
  const { t } = useTranslation('lesson');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => Object.fromEntries(numberFields.map((f) => [f.key, String(state.numbers?.[f.key] ?? '')])));
  const [error, setError] = useState('');
  const isClass = state.isClass;

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
    setEditing(false);
  };

  const canAuto = controller.canAutoStep ? controller.canAutoStep() : !state.isFinished;

  return (
    <div className="space-y-2" data-manipulation-teacher>
      <div className="flex flex-wrap items-center gap-2">
        {allowModeSwitch && (
          <div className="inline-flex overflow-hidden rounded-xl border-2 border-slate-300" role="group" aria-label={t('manipulation.mode')}>
            <button type="button" onClick={() => { state.stopPlaying(); state.setMode('student'); }} aria-pressed={!isClass}
              className={`inline-flex min-h-[44px] items-center gap-1 px-3 py-2 text-sm font-bold ${!isClass ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}>
              <User className="h-4 w-4" aria-hidden="true" /> {t('manipulation.modeStudent')}
            </button>
            <button type="button" onClick={() => state.setMode('class')} aria-pressed={isClass}
              className={`inline-flex min-h-[44px] items-center gap-1 px-3 py-2 text-sm font-bold ${isClass ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}>
              <Presentation className="h-4 w-4" aria-hidden="true" /> {t('manipulation.modeClass')}
            </button>
          </div>
        )}

        {isClass && (
          <>
            {controls.prevStep && controller.prevStep && (
              <Btn onClick={controller.prevStep} disabled={controller.canPrev ? !controller.canPrev() : state.revealed === 0} ariaLabel={t('manipulation.prevStep')}>
                <ChevronBack className="h-4 w-4" aria-hidden="true" /> {t('manipulation.prevStep')}
              </Btn>
            )}
            {controller.autoStep && (
              <Btn tone="blue" onClick={() => { state.stopPlaying(); controller.autoStep(); }} disabled={!canAuto}>
                {t('manipulation.nextStep')} <ChevronForward className="h-4 w-4" aria-hidden="true" />
              </Btn>
            )}
            {controller.autoStep && (
              state.playing
                ? <Btn onClick={state.stopPlaying} ariaLabel={t('manipulation.teacher.pause')}><Pause className="h-4 w-4" aria-hidden="true" /> {t('manipulation.teacher.pause')}</Btn>
                : <Btn onClick={() => { if (!canAuto) state.reset(); state.play(controller.autoStep); }} ariaLabel={t('manipulation.teacher.replay')}><Play className="h-4 w-4" aria-hidden="true" /> {t('manipulation.teacher.replay')}</Btn>
            )}
            {controls.hideConclusion !== false && (
              <Btn onClick={state.toggleAnswer} pressed={state.answerHidden}>
                {state.answerHidden ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
                {state.answerHidden ? t('manipulation.showConclusion') : t('manipulation.hideConclusion')}
              </Btn>
            )}
            {controller.showSolution && (
              <Btn tone="amber" onClick={controller.showSolution} ariaLabel={t('manipulation.teacher.showSolution')}>
                <Undo2 className="h-4 w-4 rotate-180" aria-hidden="true" /> {t('manipulation.teacher.showSolution')}
              </Btn>
            )}
            {constraints && numberFields.length > 0 && (
              <Btn onClick={() => setEditing((e) => !e)} pressed={editing}><Hash className="h-4 w-4" aria-hidden="true" /> {t('manipulation.changeNumbers')}</Btn>
            )}
          </>
        )}
      </div>

      {editing && isClass && constraints && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-3">
          {numberFields.map((f) => (
            <NumberInput key={f.key} id={`manip-num-${state.type}-${f.key}`} label={f.label} value={draft[f.key]} min={constraints[f.key]?.[0]} max={constraints[f.key]?.[1]} invalid={!!error} onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))} />
          ))}
          <Btn tone="blue" onClick={apply}>{t('manipulation.apply')}</Btn>
          {error && <p role="alert" className="w-full text-sm text-rose-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
