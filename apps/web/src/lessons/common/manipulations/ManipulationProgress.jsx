import { useTranslation } from 'react-i18next';

/**
 * Où en est l'élève : les trois temps du flux (جرّب → اكتشف → صِغ) et, quand
 * la manipulation a des étapes dénombrables, « الخطوة n من N ». Sobre : un
 * repère, pas une récompense.
 */
export default function ManipulationProgress({ state, stepLabel }) {
  const { t } = useTranslation('lesson');
  const phases = [
    { key: 'act', done: state.phase !== 'act', current: state.phase === 'act' },
    { key: 'discover', done: state.phase === 'formal', current: state.phase === 'discover' },
    { key: 'formal', done: false, current: state.phase === 'formal' },
  ];
  return (
    <div className="flex flex-wrap items-center justify-between gap-2" data-manipulation-progress data-phase={state.phase}>
      <ol className="flex items-center gap-1.5" aria-label={t('manipulation.progress.label')}>
        {phases.map((p, i) => (
          <li key={p.key} className="flex items-center gap-1.5">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${p.current ? 'bg-indigo-600 text-white' : p.done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`} aria-current={p.current ? 'step' : undefined}>
              {t(`manipulation.phase.${p.key}`)}
            </span>
            {i < phases.length - 1 && <span className="text-slate-300" aria-hidden="true">›</span>}
          </li>
        ))}
      </ol>
      {state.total > 0 && (
        <span className="font-mono text-xs text-slate-600" aria-live="polite">
          {stepLabel ?? t('manipulation.progress.step', { n: Math.min(state.revealed + (state.isFinished ? 0 : 1), state.total), total: state.total })}
        </span>
      )}
    </div>
  );
}
