import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, KeyRound, Lock, Mountain, PauseCircle, Sparkles } from 'lucide-react';
import { stateLines, draftReady } from '../thinkingModel';
import { AnswerInput, ChallengeFigure, MathRun, PhaseChip, SoundToggle, prettyMath } from '../ThinkingParts';

/**
 * Écran 2 — l'espace de travail : la figure et l'énoncé, l'exemple résolu (tranche primaire),
 * la réponse (champ MathLive ou choix), la mesure « ماذا غيّرت هذه المرّة؟ », UNE action principale
 * « تحقّق », les clés (une par tentative comptée), l'historique et « أرجئه ».
 *
 * « ليس بعد » n'est JAMAIS rouge : ambre et ardoise. Le serveur juge ; cet écran n'affiche que
 * son verdict (THINKING_LAB.md §6).
 */
function Verdict({ result }) {
  const { t } = useTranslation('thinking');
  if (!result) return null;
  const { attempt } = result;
  if (attempt.correct) {
    return (
      <p role="status" className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 font-inter text-sm font-bold text-emerald-800 ring-1 ring-emerald-200" data-verdict="correct">
        <Check size={18} aria-hidden="true" /> {t('verdict.correct')}
      </p>
    );
  }
  const reasonText = attempt.reason && attempt.reason !== 'syntax' ? t(`verdict.reasons.${attempt.reason}`) : null;
  const replyText = attempt.reply?.kind === 'mistake' ? attempt.reply.text : attempt.reply ? t(`verdict.${attempt.reply.kind}`) : null;
  return (
    <div role="status" className="space-y-1 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200" data-verdict={attempt.reason ?? 'notyet'}>
      {attempt.reason === 'syntax' ? (
        <p className="font-inter text-sm text-slate-700">{t('verdict.reasons.syntax')}</p>
      ) : (
        <>
          <p className="font-space text-base font-black text-amber-900">{t('verdict.notYet')}</p>
          {replyText && <p className="font-inter text-sm leading-7 text-slate-800"><MathRun text={replyText} /></p>}
          {reasonText && <p className="font-inter text-xs text-slate-600">{reasonText}</p>}
        </>
      )}
    </div>
  );
}

export default function Workspace({ challenge, busy, result, error, onSubmit, onOpenKey, onPostpone, onOpenReplay }) {
  const { t } = useTranslation('thinking');
  const [answer, setAnswer] = useState('');
  const [draft, setDraft] = useState('');
  const state = challenge.state;
  const firstTry = state.attemptsCounted === 0;
  const submit = async () => {
    if (!answer.trim() || busy) return;
    const ok = await onSubmit(answer, draft);
    if (ok?.attempt?.counted) {
      setDraft('');
      if (!ok.attempt.correct) setAnswer('');
    }
  };

  return (
    <div className="space-y-5" data-thinking-workspace={challenge.number}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/espace/tafkir" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 font-inter text-xs font-bold text-slate-600 ring-1 ring-slate-200 hover:text-slate-900">
            <ArrowRight size={14} aria-hidden="true" /> {t('workspace.back')}
          </Link>
          <h1 className="font-space text-3xl font-black text-slate-900">
            {t('challengeNumber', { number: challenge.number })}
          </h1>
          {challenge.summit && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 font-inter text-xs font-bold text-violet-700 ring-1 ring-violet-200">
              <Mountain size={14} aria-hidden="true" /> {t('summit')}
            </span>
          )}
          {challenge.examTag && (
            <span className="rounded-full bg-sky-50 px-2.5 py-1 font-inter text-xs font-bold text-sky-700 ring-1 ring-sky-200">{t(`examTag.${challenge.examTag}`)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="font-inter text-sm text-slate-600" data-state-line>{stateLines(state).map((l) => t(l.key, l.params)).join(' · ')}</p>
          <SoundToggle />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
        <section className="space-y-4" aria-labelledby="tl-statement">
          {challenge.example && (
            <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-200" data-example>
              <h2 className="font-space text-base font-black text-sky-900">{t('workspace.example')}</h2>
              <p className="mt-1 font-inter text-xs text-sky-900/80">{t('workspace.exampleHint')}</p>
              <p className="mt-3 font-inter text-sm leading-7 text-slate-800"><MathRun text={challenge.example.statement} /></p>
              <ol className="mt-2 list-decimal space-y-1 ps-5 font-inter text-sm leading-7 text-slate-700">
                {challenge.example.steps.map((s, i) => <li key={i}><MathRun text={s} /></li>)}
              </ol>
              <p className="mt-2 font-inter text-sm font-bold text-sky-900"><MathRun text={t('workspace.exampleAnswer', { answer: challenge.example.answer })} /></p>
            </div>
          )}
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <h2 id="tl-statement" className="sr-only">{t('workspace.statement')}</h2>
            <p className="font-inter text-lg leading-9 text-slate-900" data-statement><MathRun text={challenge.statement} /></p>
          </div>
          {challenge.figure && <ChallengeFigure figure={challenge.figure} ariaLabel={t('challengeNumber', { number: challenge.number })} />}
        </section>

        <section className="space-y-4" aria-label={t('workspace.answerLabel')}>
          <div className="space-y-3 rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <label className="block">
              <span className="font-inter text-sm font-bold text-slate-800">{t('workspace.draftLabel')}</span>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} maxLength={2000}
                placeholder={firstTry ? t('workspace.draftFirst') : t('workspace.draftNext')}
                className={`mt-1 w-full resize-y rounded-2xl px-3 py-2 font-inter text-sm leading-7 ring-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${draftReady(state, draft) ? 'ring-slate-200' : 'ring-amber-300 bg-amber-50/40'}`} data-draft />
            </label>
            <div>
              <span className="font-inter text-sm font-bold text-slate-800">{t('workspace.answerLabel')}</span>
              <div className="mt-1"><AnswerInput format={challenge.answer} value={answer} onChange={setAnswer} onEnter={submit} disabled={busy} /></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button type="button" onClick={submit} disabled={busy || !answer.trim()} data-check
                className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-nav-accent px-8 font-space text-base font-black text-white transition hover:bg-[#3350c4] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 disabled:opacity-50">
                <Check size={18} aria-hidden="true" /> {busy ? t('workspace.checking') : t('workspace.check')}
              </button>
              {state.status !== 'open' && (
                <button type="button" onClick={onPostpone} disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-inter text-xs font-bold text-slate-500 hover:text-slate-800">
                  <PauseCircle size={16} aria-hidden="true" /> {t('workspace.postpone')}
                </button>
              )}
            </div>
            <div aria-live="polite">
              <Verdict result={result} />
              {error && <p role="alert" className="mt-2 rounded-2xl bg-slate-100 px-4 py-3 font-inter text-sm text-slate-700">{error}</p>}
            </div>
            {state.canReplay && (
              <button type="button" onClick={onOpenReplay} data-open-replay
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-space text-base font-black text-amber-950 transition hover:bg-amber-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200">
                <Sparkles size={18} aria-hidden="true" /> {t('workspace.openReplay')}
              </button>
            )}
          </div>

          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200" data-keys>
            <h2 className="font-space text-base font-black text-slate-900">{t('workspace.keysTitle')}</h2>
            <p className="mt-0.5 font-inter text-xs text-slate-500">{t('workspace.keysHint')}</p>
            <ul className="mt-3 space-y-2">
              {challenge.keys.map((key) => (
                <li key={key.k} data-key={key.state}>
                  {key.state === 'open' ? (
                    <div className="space-y-1.5 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                      <PhaseChip phase={key.phase} />
                      <p className="font-inter text-sm leading-7 text-slate-800"><MathRun text={key.text} /></p>
                    </div>
                  ) : (
                    <button type="button" disabled={key.state === 'locked' || busy} onClick={() => onOpenKey(key.k)}
                      className="flex w-full items-center justify-between gap-2 rounded-2xl px-4 py-3 font-inter text-sm font-bold ring-1 transition enabled:bg-white enabled:text-nav-accent enabled:ring-indigo-200 enabled:hover:bg-nav-accent-soft disabled:bg-slate-50 disabled:text-slate-400 disabled:ring-slate-200">
                      <span className="inline-flex items-center gap-2">
                        {key.state === 'locked' ? <Lock size={16} aria-hidden="true" /> : <KeyRound size={16} aria-hidden="true" />}
                        {key.state === 'locked' ? t('workspace.keyLocked', { k: key.k }) : t('workspace.keyOpen', { k: key.k })}
                      </span>
                      <PhaseChip phase={key.phase} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {challenge.attempts.length > 0 && (
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200" data-attempts>
              <h2 className="font-space text-base font-black text-slate-900">{t('workspace.attemptsTitle')}</h2>
              <ol className="mt-2 space-y-1.5">
                {challenge.attempts.map((a, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 font-inter text-sm">
                    <bdi dir="ltr" className={`truncate font-semibold ${a.correct ? 'text-emerald-700' : 'text-slate-800'}`}>{prettyMath(a.answer)}</bdi>
                    <span className="shrink-0 text-xs text-slate-500">
                      {a.correct ? '✓' : a.counted ? t('verdict.notYet') : t('workspace.notCounted')}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
