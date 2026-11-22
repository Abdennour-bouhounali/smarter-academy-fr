import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Brain, Check, RotateCcw, Eye } from 'lucide-react';
import { AuthContext } from '../../../../context/AuthContext';
import { useDocumentMeta } from '../../../../hooks/useDocumentMeta';
import { fetchNotes, reviewNote } from '../../../../services/practiceService';
import NotebookContent from '../NotebookContent';
import { typeOf, contextTrail, notebookPaths } from './noteMeta';
import { useWorkspaceBase } from '../../../learning/learningViewer';
import '../notebook.css';
import './notebookSpace.css';

/**
 * La révision ACTIVE : « à revoir » n'est pas une liste à relire, c'est une
 * file à se rappeler.
 *
 *   question (le titre, ou l'endroit de la note)
 *        ↓  l'élève écrit ce qu'il se rappelle
 *   « أظهر ملاحظتي »  →  sa propre note, en face de sa réponse
 *        ↓
 *   « أعرفها » (sort de la file)  |  « أعيدها لاحقًا » (revient plus tard)
 *
 * Le serveur tient le compte (review_count, last_reviewed_at, next_review_at)
 * : une répétition espacée viendra s'y greffer sans refaire cet écran.
 */
export default function ReviewSession() {
  const { t } = useTranslation('student');
  const r = (key, opts) => t(`notebook.space.review.${key}`, opts);
  useDocumentMeta(r('title'), t('notebook.space.metaDescription'));
  const { token } = useContext(AuthContext);
  const paths = notebookPaths(useWorkspaceBase());
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState({ known: 0, again: 0 });

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    fetchNotes(token, { view: 'review', sort: 'review', page: 1, perPage: 50 })
      .then((d) => !cancelled && setQueue(d.notes ?? []))
      .catch((e) => !cancelled && setError(e.message));

    return () => { cancelled = true; };
  }, [token]);

  const current = queue?.[index] ?? null;
  const next = () => { setIndex((i) => i + 1); setAnswer(''); setRevealed(false); };

  const answerWith = async (outcome) => {
    if (!current || busy) return;
    setBusy(true);
    setError(null);
    try {
      await reviewNote(token, current.id, outcome);
      setDone((d) => ({ ...d, [outcome]: d[outcome] + 1 }));
      next();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const back = (
    <Link to={paths.reviewView} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-violet-800 min-h-[44px]">
      <ArrowRight size={16} aria-hidden="true" /> {r('back')}
    </Link>
  );

  if (queue === null && !error) return <div className="sa-page py-10">{back}<div className="sa-ns-skeleton mt-6 !h-64" /></div>;

  if (error && !queue) {
    return <div className="sa-page py-10">{back}<p role="alert" className="mt-6 text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl p-4">{error}</p></div>;
  }

  if (queue.length === 0) {
    return (
      <div className="sa-page py-10">{back}
        <div className="sa-ns-empty mt-6" data-nb-review-empty>
          <span className="text-4xl" aria-hidden="true">✨</span>
          <p className="font-bold text-slate-800 text-lg">{r('nothingTitle')}</p>
          <p className="text-sm text-slate-500 max-w-md">{r('nothingBody')}</p>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="sa-page py-10">{back}
        <div className="sa-ns-empty mt-6" data-nb-review-done>
          <span className="text-4xl" aria-hidden="true">🎉</span>
          <p className="font-bold text-slate-800 text-lg">{r('doneTitle')}</p>
          <p className="text-sm text-slate-500 max-w-md">{r('doneBody', { count: done.known + done.again })}</p>
          <Link to={paths.root} className="sa-ns-btn sa-ns-btn--primary">{r('back')}</Link>
        </div>
      </div>
    );
  }

  const type = typeOf(current);
  const trail = contextTrail(current, t);
  const place = trail.filter((s) => s.kind !== 'exercise' && s.kind !== 'question').map((s) => s.label).join(' › ');
  const prompt = current.title
    ? r('promptTitled', { title: current.title })
    : place ? r('promptContext', { place }) : r('promptGeneric');

  return (
    <div className="sa-page py-8 sm:py-10" data-nb-review>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {back}
        <p className="font-mono-jetbrains text-sm text-slate-500 tabular-nums" dir="ltr" data-nb-review-progress>{r('progress', { current: index + 1, total: queue.length })}</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <p className="font-mono-jetbrains text-violet-600 text-xs font-semibold tracking-widest uppercase mb-2 inline-flex items-center gap-2">
          <Brain size={14} aria-hidden="true" /> {r('eyebrow')}
        </p>
        <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900 mb-1">{prompt}</h1>
        <p className="text-sm text-slate-500 mb-6 inline-flex items-center gap-2">
          <span className="sa-ns-type" data-tone={type.tone}><span aria-hidden="true">{type.emoji}</span> {t(`notebook.space.types.${type.id}`)}</span>
          {trail.length > 0 && <span>{trail.map((s) => s.label).join(' › ')}</span>}
        </p>

        <label className="block mb-5">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{r('answerLabel')}</span>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            placeholder={r('answerPlaceholder')}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white p-4 text-slate-800 focus:outline-none focus:border-violet-500"
            data-nb-review-answer
          />
        </label>

        {!revealed ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="sa-ns-btn sa-ns-btn--primary" onClick={() => setRevealed(true)} data-nb-review-reveal>
              <Eye size={18} aria-hidden="true" /> {r('reveal')}
            </button>
            <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={next}>{r('skip')}</button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{r('myAnswer')}</h2>
                <p className="whitespace-pre-wrap text-slate-700 text-sm">{answer.trim() || '—'}</p>
              </section>
              <section className="sa-ns-paper p-4" data-nb-review-note>
                <h2 className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">{r('myNote')}</h2>
                {current.title && <p className="font-extrabold text-slate-900 mb-1">{current.title}</p>}
                <NotebookContent content={current.content} />
              </section>
            </div>
            {error && <p role="alert" className="mb-3 text-sm font-semibold text-rose-700">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="sa-ns-btn sa-ns-btn--primary" onClick={() => answerWith('known')} disabled={busy} data-nb-review-known>
                <Check size={18} aria-hidden="true" /> {r('known')}
              </button>
              <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={() => answerWith('again')} disabled={busy} data-nb-review-again>
                <RotateCcw size={18} aria-hidden="true" /> {r('again')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
