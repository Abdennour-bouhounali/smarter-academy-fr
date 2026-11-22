import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Printer } from 'lucide-react';
import NotebookContent from '../NotebookContent';
import { typeOf, contextTrail, formatDate } from './noteMeta';

/**
 * L'impression : un DOCUMENT, pas une capture d'écran.
 *
 * Un nœud `#nb-print-root` dans <body>, invisible à l'écran, seul visible à
 * l'impression (notebookSpace.css) — même mécanisme que la carte des
 * connaissances. On y rend les notes (contenu désinfecté, KaTeX dessiné),
 * puis `window.print()` ; à `afterprint`, le nœud disparaît.
 *
 * @param {object[]} notes
 * @param {{ context?: boolean, date?: boolean, subtitle?: string }} options
 * @param {() => void} onDone
 */
function PrintSheet({ notes, options = {}, onDone }) {
  const { t } = useTranslation('student');
  const root = useMemo(() => {
    let el = document.getElementById('nb-print-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'nb-print-root';
      document.body.appendChild(el);
    }
    return el;
  }, []);

  useEffect(() => {
    const done = () => onDone?.();
    window.addEventListener('afterprint', done);
    // Un tour de rendu pour que KaTeX soit dessiné avant la boîte d'impression.
    const timer = setTimeout(() => window.print(), 120);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('afterprint', done);
    };
  }, [onDone]);

  return createPortal(
    <div className="sa-ns-print">
      <h1>📓 {t('notebook.space.print.docTitle')}</h1>
      <p className="sa-ns-print-sub">
        {options.subtitle ? `${options.subtitle} · ` : ''}
        {t('notebook.space.print.docCount', { count: notes.length })}
        {options.date !== false ? ` · ${formatDate(new Date().toISOString())}` : ''}
      </p>
      {notes.map((note) => {
        const type = typeOf(note);
        const trail = options.context === false ? [] : contextTrail(note, t);
        return (
          <section key={note.id} className="sa-ns-print-note">
            <p className="sa-ns-print-type">{type.emoji} {t(`notebook.space.types.${type.id}`)}</p>
            {note.title && <h2>{note.title}</h2>}
            <NotebookContent content={note.content} />
            {(trail.length > 0 || options.date !== false) && (
              <p className="sa-ns-print-meta">
                {trail.map((step) => <span key={step.kind}>{TRAIL_EMOJI[step.kind]} {step.label}</span>)}
                {options.date !== false && <span>🗓 {formatDate(note.createdAt)}</span>}
              </p>
            )}
          </section>
        );
      })}
    </div>,
    root,
  );
}

const TRAIL_EMOJI = { lesson: '📚', place: '📍', exercise: '📝', question: '❓' };

/**
 * Le petit choix avant d'imprimer : quoi (cette note / la sélection / les
 * résultats) et deux cases (contexte, date). Pas un assistant.
 *
 * @param {{ this?: object[], selected?: object[], results?: object[] }} sets  les jeux disponibles (absents = non proposés)
 */
export function PrintDialog({ open, sets, defaultMode, subtitle, onClose }) {
  const { t } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  const p = (key, opts) => t(`notebook.space.print.${key}`, opts);
  const modes = ['this', 'selected', 'results'].filter((m) => Array.isArray(sets?.[m]) && sets[m].length > 0);
  const [mode, setMode] = useState(defaultMode ?? modes[0]);
  const [context, setContext] = useState(true);
  const [date, setDate] = useState(true);
  const [job, setJob] = useState(null);

  useEffect(() => { if (open) setMode(defaultMode ?? modes[0]); }, [open, defaultMode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  if (job) {
    return (
      <>
        <PrintSheet notes={job.notes} options={job.options} onDone={() => { setJob(null); onClose?.(); }} />
        <p className="sr-only" role="status">{p('preparing')}</p>
      </>
    );
  }

  const go = () => {
    const notes = sets[mode] ?? [];
    if (!notes.length) return;
    setJob({ notes, options: { context, date, subtitle } });
  };

  return createPortal(
    <div className="sa-ns-confirm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="sa-ns-confirm" role="dialog" aria-modal="true" aria-labelledby="sa-ns-print-title" style={{ borderColor: '#ddd6fe' }}>
        <p id="sa-ns-print-title" className="font-extrabold text-slate-900 inline-flex items-center gap-2">
          <Printer size={18} aria-hidden="true" /> {p('title')}
        </p>
        <div className="mt-3 space-y-1" role="radiogroup" aria-labelledby="sa-ns-print-title">
          {modes.map((m) => (
            <label key={m} className="sa-ns-choice">
              <input type="radio" name="nb-print-mode" value={m} checked={mode === m} onChange={() => setMode(m)} />
              {p(m === 'this' ? 'modeThis' : m === 'selected' ? 'modeSelected' : 'modeResults')}
              <span className="ms-auto text-xs text-slate-400 tabular-nums">{sets[m].length}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 space-y-1">
          <label className="sa-ns-choice"><input type="checkbox" checked={context} onChange={(e) => setContext(e.target.checked)} /> {p('withContext')}</label>
          <label className="sa-ns-choice"><input type="checkbox" checked={date} onChange={(e) => setDate(e.target.checked)} /> {p('withDate')}</label>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={onClose}>{tc('cancel')}</button>
          <button type="button" className="sa-ns-btn sa-ns-btn--primary" onClick={go} data-nb-print-go>
            <Printer size={16} aria-hidden="true" /> {p('go')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
