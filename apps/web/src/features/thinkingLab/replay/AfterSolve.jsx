import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Mountain, Sparkles, Wrench } from 'lucide-react';
import { ArrowBack, ArrowForward } from '../../../components/common/DirectionalIcons';
import { AuthContext } from '../../../context/AuthContext';
import { checkExtra } from '../../../services/thinkingLabService';
import { playSfx } from '../../../lessons/common/utils/playEffect';
import { AnswerInput, MathRun, SoundToggle, answerText } from '../ThinkingParts';
import ReplayPlayer from './ReplayPlayer';

/**
 * Écran 3 — après la porte (THINKING_LAB.md §7) :
 *   résolu SEUL      → les « keyMoves » d'abord (expertise reversal), le replay complet sur demande ;
 *   appris / clés    → le replay pas à pas ;
 * puis « Ce que tu emportes » (la carte du mouvement), les suites du sommet, le jumeau, « Plus haut ».
 * Les suites et le plafond se vérifient au serveur, sans limite de tentatives : c'est l'entraînement.
 */
function ExtraQuestion({ challengeId, kind, index = 0, prompt, format, solved: solvedInitially, title }) {
  const { t } = useTranslation('thinking');
  const { token } = useContext(AuthContext);
  const [value, setValue] = useState('');
  const [solved, setSolved] = useState(solvedInitially);
  const [verdict, setVerdict] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    try {
      const r = await checkExtra(token, challengeId, kind, value, index);
      setVerdict(r.correct ? 'right' : r.outcome === 'syntax_error' ? 'syntax' : 'notyet');
      if (r.correct) { setSolved(true); playSfx('correct'); } else playSfx('notyet');
    } catch {
      setVerdict('error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200" data-extra={kind}>
      <h3 className="flex items-center gap-2 font-space text-base font-black text-slate-900">
        {kind === 'ceiling' ? <Sparkles size={18} className="text-violet-600" aria-hidden="true" /> : <Mountain size={18} className="text-violet-600" aria-hidden="true" />}
        {title}
        {solved && <Check size={18} className="text-emerald-600" aria-label={t('after.extraRight')} />}
      </h3>
      <p className="mt-2 font-inter text-base leading-8 text-slate-800"><MathRun text={prompt} /></p>
      {!solved && (
        <div className="mt-3 space-y-2">
          <AnswerInput format={format} value={value} onChange={setValue} onEnter={submit} disabled={busy} />
          <button type="button" onClick={submit} disabled={busy || !value.trim()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-violet-600 px-6 font-space text-sm font-black text-white enabled:hover:bg-violet-700 disabled:opacity-50">
            {t('after.extraCheck')}
          </button>
        </div>
      )}
      {verdict && (
        <p role="status" className={`mt-2 rounded-2xl px-4 py-2 font-inter text-sm ${verdict === 'right' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
          {verdict === 'right' ? t('after.extraRight') : verdict === 'syntax' ? t('verdict.reasons.syntax') : verdict === 'error' ? t('errors.generic') : t('after.extraNotYet')}
        </p>
      )}
    </div>
  );
}

export default function AfterSolve({ replay }) {
  const { t } = useTranslation('thinking');
  const [full, setFull] = useState(!replay.solvedAlone);
  const [finished, setFinished] = useState(replay.solvedAlone);

  return (
    <div className="space-y-6" data-after-solve={replay.number}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/espace/tafkir" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 font-inter text-xs font-bold text-slate-600 ring-1 ring-slate-200 hover:text-slate-900">
            <ArrowBack size={14} aria-hidden="true" /> {t('workspace.back')}
          </Link>
          <h1 className="font-space text-2xl font-black text-slate-900 sm:text-3xl">
            {t(replay.outcome === 'alone' || replay.outcome === 'keys' ? 'after.solvedTitle' : 'after.learnedTitle', { number: replay.number })}
          </h1>
          {(replay.outcome === 'alone' || replay.outcome === 'keys') && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-inter text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
              {replay.outcome === 'alone' ? `★ ${t('state.solvedAlone')}` : t('state.solvedKeys')}
            </span>
          )}
        </div>
        <SoundToggle />
      </header>

      <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
        <p className="font-inter text-base leading-8 text-slate-800"><MathRun text={replay.statement} /></p>
        <p className="mt-3 font-inter text-sm text-slate-500">
          {t('after.answer')} : <bdi dir="ltr" className="font-space text-lg font-black text-slate-900" data-answer>{answerText(replay.answer)}</bdi>
        </p>
      </div>

      {replay.solvedAlone && !full && (
        <section className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-key-moves>
          <h2 className="font-space text-lg font-black text-emerald-900">{t('after.keyMovesTitle')}</h2>
          <p className="mt-1 font-inter text-xs text-emerald-900/80">{t('after.keyMovesHint')}</p>
          <ol className="mt-3 grid gap-3 md:grid-cols-3">
            {replay.keyMoves.map((m, i) => (
              <li key={i} className="rounded-2xl bg-white p-4 font-inter text-sm leading-7 text-slate-800 ring-1 ring-emerald-200">
                <span className="font-space text-xl font-black text-emerald-600" dir="ltr">{i + 1}</span>
                <p className="mt-1"><MathRun text={m} /></p>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => setFull(true)} data-watch-full
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white px-5 font-space text-sm font-black text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-100">
            {t('after.watchFull')}
          </button>
        </section>
      )}

      {full && (
        <section aria-labelledby="tl-replay">
          <h2 id="tl-replay" className="mb-3 font-space text-lg font-black text-slate-900">{t('replay.title')}</h2>
          <ReplayPlayer steps={replay.replay} figure={replay.figure} onDone={() => setFinished(true)} />
        </section>
      )}

      {finished && (
        <div className="space-y-4" data-after-replay>
          {replay.move && (
            <section className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 ring-1 ring-amber-200" data-move-card>
              <h2 className="font-inter text-sm font-bold text-amber-900">{t('after.takeAway')}</h2>
              <div className="mt-3 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-200">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-amber-950"><Wrench size={22} aria-hidden="true" /></span>
                <div>
                  <p className="font-inter text-xs font-bold text-amber-700">{t('after.moveCard')}</p>
                  <p className="font-space text-lg font-black text-slate-900"><MathRun text={replay.move.title} /></p>
                </div>
              </div>
            </section>
          )}

          {replay.parts.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-space text-lg font-black text-slate-900">{t('after.partsTitle')}</h2>
              {replay.parts.map((p) => (
                <ExtraQuestion key={p.index} challengeId={replay.id} kind="part" index={p.index} prompt={p.prompt} format={p.answer} solved={p.solved}
                  title={`${t('after.partsTitle')} ${p.index + 1}`} />
              ))}
            </section>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {replay.twin && (
              <section className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-200" data-twin>
                <h2 className="font-space text-lg font-black text-sky-900">{t('after.twinTitle')}</h2>
                <p className="mt-1 font-inter text-sm text-sky-900/80">{t('after.twinHint')}</p>
                <Link to={`/espace/tafkir/${replay.twin.id}`}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-sky-600 px-5 font-space text-sm font-black text-white hover:bg-sky-700">
                  {t('after.twinGo', { number: replay.twin.number })} <ArrowForward size={16} aria-hidden="true" />
                </Link>
              </section>
            )}
            {replay.ceiling && (
              <ExtraQuestion challengeId={replay.id} kind="ceiling" prompt={replay.ceiling.statement} format={replay.ceiling.answer}
                solved={replay.ceiling.solved} title={t('after.ceilingTitle')} />
            )}
          </div>

          <Link to="/espace/tafkir" className="inline-flex items-center gap-2 font-inter text-sm font-bold text-nav-accent hover:underline">
            <ArrowBack size={16} aria-hidden="true" /> {t('after.backToLadder')}
          </Link>
        </div>
      )}
    </div>
  );
}
