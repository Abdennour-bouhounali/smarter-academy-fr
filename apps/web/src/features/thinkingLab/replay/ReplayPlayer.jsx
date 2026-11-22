import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { ChevronBack, ChevronForward } from '../../../components/common/DirectionalIcons';
import useStepReveal from '../../mathlab/shared/useStepReveal';
import { playSfx } from '../../../lessons/common/utils/playEffect';
import { ChallengeFigure, MathRun, PhaseChip } from '../ThinkingParts';

/**
 * La RELECTURE d'une pensée (THINKING_LAB.md §7) : les pas `replay[]` découverts un à un sur le
 * curseur du labo (useStepReveal — l'état d'interface n'est jamais sérialisé). Chaque pas allume
 * ses couches de la figure ; les lignes de calcul s'accumulent dans le « cahier de calcul » ; un pas `ask`
 * (« Explique-toi ») bloque « Suivant » tant que l'élève n'a pas choisi.
 * Sons (éteints par défaut) : stepTick, spark (👁), slide (↩).
 */
function StepCard({ step: s, index: i, answers, setAnswers, current = false }) {
  const { t } = useTranslation('thinking');
  return (
    <div className={`rounded-3xl p-5 ring-1 ${current ? 'bg-white shadow-sm ring-2 ring-indigo-300' : 'bg-white/70 ring-slate-200'} ${s.phase === 'B' ? 'border-s-4 border-slate-300' : ''}`} data-step={s.phase} data-current={current || undefined}>
      <PhaseChip phase={s.phase} />
      <p className={`mt-2 font-inter leading-8 text-slate-800 ${current ? 'text-base' : 'text-sm'}`}><MathRun text={s.think} /></p>
      {s.ask && (
        <fieldset className="mt-3 space-y-2 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200" data-ask>
          <legend className="font-space text-sm font-black text-amber-900">{t('replay.explainTitle')}</legend>
          <p className="font-inter text-sm leading-7 text-slate-800"><MathRun text={s.ask.q} /></p>
          {answers[i] === undefined && <p className="font-inter text-xs text-amber-900/80">{t('replay.explainHint')}</p>}
          {s.ask.options.map((opt, k) => {
            const picked = answers[i] === k;
            const right = k === s.ask.correct;
            return (
              <button key={k} type="button" disabled={answers[i] !== undefined}
                onClick={() => { setAnswers((a) => ({ ...a, [i]: k })); playSfx(right ? 'correct' : 'notyet'); }}
                className={`block w-full rounded-2xl px-4 py-2.5 text-start font-inter text-sm leading-7 ring-1 transition ${picked ? (right ? 'bg-emerald-50 ring-emerald-300' : 'bg-amber-100 ring-amber-300') : answers[i] !== undefined && right ? 'bg-emerald-50 ring-emerald-200' : 'bg-white ring-slate-200 enabled:hover:ring-indigo-300'}`}>
                <MathRun text={opt} />
              </button>
            );
          })}
          {answers[i] !== undefined && (
            <p className="font-inter text-sm leading-7 text-slate-800">
              <span className="font-bold">{answers[i] === s.ask.correct ? t('replay.explainRight') : t('replay.explainNotYet')}</span>{' '}
              <MathRun text={s.ask.why} />
            </p>
          )}
        </fieldset>
      )}
    </div>
  );
}

export default function ReplayPlayer({ steps, figure, onDone }) {
  const { t } = useTranslation('thinking');
  const player = useStepReveal(steps.length, { resetKey: steps });
  const [answers, setAnswers] = useState({});
  const shown = steps.slice(0, Math.max(1, player.cursor));
  const index = Math.max(0, player.cursor - 1);
  const step = steps[index];

  // La figure garde les dernières couches allumées par un pas qui en déclarait.
  const layers = useMemo(() => {
    for (let i = index; i >= 0; i--) if (steps[i].layers?.length) return steps[i].layers;
    return null;
  }, [index, steps]);
  const notebook = shown.flatMap((s) => s.math ?? []);
  const blocked = Boolean(step?.ask) && answers[index] === undefined;

  useEffect(() => { if (!player.started) player.start(); }, [player]);
  useEffect(() => {
    if (!step || player.cursor === 0) return;
    playSfx(step.phase === 'O' ? 'spark' : step.phase === 'B' ? 'slide' : 'stepTick');
    if (step.ask && player.playing) player.pause();
  }, [player.cursor]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (player.done) onDone?.(); }, [player.done, onDone]);

  if (!step) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]" data-replay>
      <div className="space-y-4">
        {figure && <ChallengeFigure figure={figure} layers={layers} ariaLabel={t('replay.title')} />}
        {notebook.length > 0 && (
          <div className="rounded-3xl bg-slate-900 p-5 text-slate-50" data-notebook>
            <h3 className="font-inter text-xs font-bold text-slate-300">{t('replay.notebook')}</h3>
            <ul className="mt-2 space-y-1.5">
              {notebook.map((line, i) => (
                <li key={i} className="font-inter text-base leading-8"><MathRun text={line} className="[&_bdi]:text-amber-200" /></li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="order-first space-y-4 lg:order-none">
        <div className="flex items-center justify-between">
          <p className="font-inter text-xs font-bold text-slate-500">{t('replay.step', { n: player.cursor, total: steps.length })}</p>
          <ol className="flex gap-1" dir="ltr" aria-hidden="true">
            {steps.map((s, i) => (
              <li key={i} className={`h-2 w-5 rounded-full ${i < player.cursor ? (s.phase === 'B' ? 'bg-slate-400' : s.phase === 'O' ? 'bg-amber-400' : 'bg-indigo-500') : 'bg-slate-200'}`} />
            ))}
          </ol>
        </div>

        <StepCard step={step} index={index} answers={answers} setAnswers={setAnswers} current />
        {index > 0 && (
          <details className="rounded-2xl bg-slate-50 px-4 py-2 ring-1 ring-slate-200" data-previous-steps>
            <summary className="cursor-pointer font-inter text-xs font-bold text-slate-500">{t('replay.previous', { count: index })}</summary>
            <ol className="mt-2 space-y-2">
              {shown.slice(0, index).reverse().map((s, k) => (
                <li key={index - 1 - k}><StepCard step={s} index={index - 1 - k} answers={answers} setAnswers={setAnswers} /></li>
              ))}
            </ol>
          </details>
        )}

        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/95 p-2 shadow ring-1 ring-slate-200 backdrop-blur">
          <button type="button" onClick={player.previous} disabled={player.cursor <= 1}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3 font-inter text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40">
            <ChevronBack size={18} aria-hidden="true" /> {t('replay.prev')}
          </button>
          <button type="button" onClick={player.next} disabled={blocked || player.done} data-replay-next
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-xl bg-nav-accent px-5 font-space text-sm font-black text-white enabled:hover:bg-[#3350c4] disabled:opacity-40">
            {player.done ? t('replay.done') : t('replay.next')} {!player.done && <ChevronForward size={18} aria-hidden="true" />}
          </button>
          {player.playing ? (
            <button type="button" onClick={player.pause} className="inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3 font-inter text-sm font-bold text-slate-600 hover:bg-slate-100">
              <Pause size={16} aria-hidden="true" /> {t('replay.pause')}
            </button>
          ) : (
            <button type="button" disabled={blocked || player.done} onClick={() => { player.setMode('auto'); player.resume(); }}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3 font-inter text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40">
              <Play size={16} aria-hidden="true" /> {t('replay.auto')}
            </button>
          )}
          <button type="button" onClick={() => { setAnswers({}); player.setMode('manual'); player.restart(); }}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3 font-inter text-sm font-bold text-slate-600 hover:bg-slate-100">
            <RotateCcw size={16} aria-hidden="true" /> {t('replay.restart')}
          </button>
        </div>
      </div>
    </div>
  );
}
