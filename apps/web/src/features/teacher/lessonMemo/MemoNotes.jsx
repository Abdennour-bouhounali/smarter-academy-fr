import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NotebookPen, Plus, Trash2, Pencil, Check, ExternalLink, Loader2 } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { createNote, deleteNote, fetchNotes, updateNote } from '../../../services/practiceService';
import { isRichContent } from '../../practice/notebook/noteContent';
import { timeAgo, notebookPaths } from '../../practice/notebook/space/noteMeta';
import { storage } from '../../../utils/storage';
import { WORKSPACE_BASE } from '../../learning/learningViewer';

const AUTOSAVE_MS = 900;
const draftKey = (lessonId) => `smarter_memo_draft_${lessonId}`;

/**
 * « كرّاسي » DANS la مذكرة الدرس — le cahier de l'enseignant, pas un second
 * système de notes.
 *
 * Mêmes données (`notebook_notes`), même API (`/practice/notes`), mêmes
 * règles : le serveur ne sert et ne modifie que les notes du compte
 * authentifié (PracticeNotebookController → `ownedBy()`), une note créée ici
 * porte le contexte `lessonCode` et réapparaît dans « كرّاسي »
 * (/enseignant/cahier) avec les notes prises dans la leçon elle-même. La
 * liste est `GET /practice/notes?lessonCode=…` : toutes les notes non
 * archivées de CE compte sur CETTE leçon.
 *
 * Enregistrement automatique : la note naît au premier arrêt de frappe
 * (POST), les suivants la modifient (PATCH) — jamais de doublon. Un
 * brouillon local (localStorage) garde le texte d'une note pas encore née
 * si la page se ferme ou si le serveur refuse (quota « الوصول والحدود »).
 *
 * Une note RICHE (HTML de l'éditeur du cahier, écrite dans la leçon) est
 * affichée en texte, et se modifie dans « كرّاسي » : un textarea la
 * réduirait à son balisage.
 */
export default function MemoNotes({ lessonId }) {
  const { t, i18n } = useTranslation('memo');
  const { token } = useContext(AuthContext);
  const [notes, setNotes] = useState(null);
  const [loadError, setLoadError] = useState(false);
  // La note en cours d'écriture est dans le compositeur : la liste ne la
  // répète pas en dessous.
  const [composingId, setComposingId] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadError(false);
    try {
      const data = await fetchNotes(token, lessonId);
      const list = (data?.notes ?? []).filter((n) => n.lessonCode === lessonId);
      list.sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')));
      setNotes(list);
    } catch {
      setLoadError(true);
      setNotes([]);
    }
  }, [token, lessonId]);
  useEffect(() => { load(); }, [load]);

  const onCreated = useCallback((note) => setNotes((prev) => [note, ...(prev ?? []).filter((n) => n.id !== note.id)]), []);
  const onChanged = useCallback((note) => setNotes((prev) => (prev ?? []).map((n) => (n.id === note.id ? note : n))), []);
  const onDeleted = useCallback((id) => setNotes((prev) => (prev ?? []).filter((n) => n.id !== id)), []);

  return (
    <section id="memo-notes" className="sa-memo-notebook scroll-mt-28 rounded-3xl border-2 border-amber-200 p-5 sm:p-6" aria-labelledby="memo-notes-title" data-memo-notes>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="memo-notes-title" className="flex items-center gap-2 font-space text-xl font-bold text-amber-950">
            <NotebookPen className="h-5 w-5" aria-hidden="true" /> {t('notes.title')}
          </h2>
          <p className="mt-1 text-sm text-amber-900/80">{t('notes.lead')}</p>
        </div>
        {notes && <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-amber-900" data-memo-notes-count={notes.length}>{t('notes.count', { count: notes.length })}</span>}
      </header>

      <NoteComposer lessonId={lessonId} token={token} onCreated={onCreated} onActive={setComposingId} />

      <div className="mt-5 space-y-3">
        {notes === null && <p className="flex items-center gap-2 text-sm text-amber-900/70"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /></p>}
        {loadError && (
          <p className="text-sm text-rose-700" role="alert">
            {t('notes.loadError')} <button type="button" onClick={load} className="font-bold underline">{t('notes.retry')}</button>
          </p>
        )}
        {notes?.length === 0 && !loadError && <p className="text-sm text-amber-900/70 sa-memo-no-print">{t('notes.empty')}</p>}
        {notes?.filter((note) => note.id !== composingId).map((note) => (
          <SavedNote key={note.id} note={note} token={token} locale={i18n.language} onChanged={onChanged} onDeleted={onDeleted} />
        ))}
      </div>
    </section>
  );
}

/** Le statut d'enregistrement, discret et annoncé (aria-live). */
function SaveStatus({ status }) {
  const { t } = useTranslation('memo');
  const text = { saving: t('notes.saving'), saved: t('notes.saved'), error: t('notes.error'), dirty: t('notes.unsaved') }[status] ?? '';
  return (
    <span className={`min-h-[1.25rem] text-xs font-bold ${status === 'error' ? 'text-rose-700' : status === 'saved' ? 'text-emerald-700' : 'text-amber-900/70'}`} aria-live="polite" data-memo-save-status={status || 'idle'}>
      {text}
    </span>
  );
}

/**
 * La note en cours d'écriture. Au premier enregistrement elle devient une
 * note du cahier (POST) ; « ملاحظة جديدة » la range dans la liste et rouvre
 * une page blanche.
 */
function NoteComposer({ lessonId, token, onCreated, onActive }) {
  const { t } = useTranslation('memo');
  const [text, setText] = useState(() => storage.getItem(draftKey(lessonId)) ?? '');
  const [noteId, setNoteId] = useState(null);
  const [status, setStatus] = useState('');
  const timer = useRef(null);
  const inFlight = useRef(Promise.resolve());
  const latest = useRef({ text, noteId });
  latest.current = { text, noteId };

  const save = useCallback(() => {
    const run = async () => {
      const { text: content, noteId: id } = latest.current;
      if (!token || !content.trim()) return;
      setStatus('saving');
      try {
        const data = id
          ? await updateNote(token, id, { content })
          : await createNote(token, { content, lessonCode: lessonId });
        const note = data?.note;
        if (note) {
          if (!id) { setNoteId(note.id); onActive(note.id); }
          latest.current.noteId = note.id;
          onCreated(note);
        }
        storage.removeItem(draftKey(lessonId));
        setStatus(latest.current.text === content ? 'saved' : 'dirty');
      } catch {
        setStatus('error');
      }
    };
    // Une seule écriture à la fois : la deuxième attend l'id de la première.
    inFlight.current = inFlight.current.then(run, run);
    return inFlight.current;
  }, [token, lessonId, onCreated, onActive]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onChange = (value) => {
    setText(value);
    setStatus('dirty');
    if (!noteId) storage.setItem(draftKey(lessonId), value);
    clearTimeout(timer.current);
    timer.current = setTimeout(save, AUTOSAVE_MS);
  };

  const startNew = async () => {
    clearTimeout(timer.current);
    if (latest.current.text.trim()) await save();
    setText('');
    setNoteId(null);
    onActive(null);
    setStatus('');
    storage.removeItem(draftKey(lessonId));
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-white/90 p-3 shadow-xs sa-memo-no-print">
      <label htmlFor={`memo-note-${lessonId}`} className="sr-only">{t('notes.placeholder')}</label>
      <textarea
        id={`memo-note-${lessonId}`}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => { if (status === 'dirty') { clearTimeout(timer.current); save(); } }}
        placeholder={t('notes.placeholder')}
        rows={4}
        maxLength={12000}
        className="sa-memo-lined w-full resize-y rounded-xl border-0 bg-transparent p-2 font-inter text-base leading-8 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        data-memo-note-input
      />
      <p className="px-2 text-[11px] text-slate-500">{t('notes.examples')}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <SaveStatus status={status} />
        <div className="flex items-center gap-2">
          {status === 'error' && (
            <button type="button" onClick={save} className="min-h-[40px] rounded-lg px-3 text-xs font-bold text-rose-700 hover:bg-rose-50">{t('notes.retry')}</button>
          )}
          <button
            type="button"
            onClick={startNew}
            disabled={!text.trim()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 border-amber-300 bg-white px-3 text-sm font-bold text-amber-900 hover:bg-amber-50 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            data-memo-note-new
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> {t('notes.add')}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Une note déjà dans le cahier : lue, modifiée sur place (texte brut), supprimée. */
function SavedNote({ note, token, locale, onChanged, onDeleted }) {
  const { t } = useTranslation('memo');
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.content ?? '');
  const [status, setStatus] = useState('');
  const timer = useRef(null);
  const rich = isRichContent(note.content);
  const paths = notebookPaths(WORKSPACE_BASE.teacher);

  useEffect(() => () => clearTimeout(timer.current), []);

  const save = async (value) => {
    if (!value.trim()) return;
    setStatus('saving');
    try {
      const data = await updateNote(token, note.id, { content: value });
      if (data?.note) onChanged(data.note);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };
  const onChange = (value) => {
    setText(value);
    setStatus('dirty');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(value), AUTOSAVE_MS);
  };
  const remove = async () => {
    if (typeof window !== 'undefined' && !window.confirm(t('notes.confirmDelete'))) return;
    try {
      await deleteNote(token, note.id);
      onDeleted(note.id);
    } catch {
      setStatus('error');
    }
  };

  return (
    <article className="rounded-2xl border border-amber-100 bg-white/80 p-4" data-memo-note={note.id}>
      {editing && !rich ? (
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          maxLength={12000}
          autoFocus
          aria-label={t('notes.edit')}
          className="sa-memo-lined w-full resize-y rounded-xl border border-amber-200 bg-white p-2 font-inter text-base leading-8 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
      ) : (
        <p className="whitespace-pre-wrap font-inter text-[15px] leading-7 text-slate-800">{rich ? (note.excerpt ?? '') : note.content}</p>
      )}
      {rich && <p className="mt-1 text-[11px] text-slate-500">{t('notes.richNote')}</p>}
      <footer className="mt-2 flex flex-wrap items-center justify-between gap-2 sa-memo-no-print">
        <span className="flex items-center gap-3 text-[11px] text-slate-500">
          {note.moduleTitle && <span>📍 {note.moduleTitle}</span>}
          {note.updatedAt && <span>{t('notes.updated', { when: timeAgo(note.updatedAt, locale) })}</span>}
          <SaveStatus status={status} />
        </span>
        <span className="flex items-center gap-1">
          {rich ? (
            <Link to={paths.note(note.id)} className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2 text-xs font-bold text-amber-900 hover:bg-amber-50">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> {t('notes.openInNotebook')}
            </Link>
          ) : (
            <button type="button" onClick={() => setEditing((v) => !v)} className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2 text-xs font-bold text-amber-900 hover:bg-amber-50" aria-pressed={editing}>
              {editing ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Pencil className="h-3.5 w-3.5" aria-hidden="true" />} {editing ? t('notes.done') : t('notes.edit')}
            </button>
          )}
          <button type="button" onClick={remove} aria-label={t('notes.deleteAria')} title={t('notes.delete')} className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </span>
      </footer>
    </article>
  );
}
