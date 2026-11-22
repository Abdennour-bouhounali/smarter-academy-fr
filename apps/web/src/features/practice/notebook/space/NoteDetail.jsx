import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, Star, RotateCcw, Archive, ArchiveRestore, Trash2, Printer, ExternalLink, Check, Circle, LoaderCircle, CloudOff, BookOpen, MapPin, PencilLine, CircleHelp,
} from 'lucide-react';
import { AuthContext } from '../../../../context/AuthContext';
import { useDocumentMeta } from '../../../../hooks/useDocumentMeta';
import { fetchNote, updateNote, deleteNote } from '../../../../services/practiceService';
import NotebookEditor from '../NotebookEditor';
import NotebookToolbar from '../NotebookToolbar';
import NotebookContent from '../NotebookContent';
import { useWorkspaceBase } from '../../../learning/learningViewer';
import { MISTAKE_TYPES } from '../NotebookWindow';
import {
  isRichContent, plainTextToHtml, sanitizeHtml, isEmptyContent, MAX_CONTENT_LENGTH,
} from '../noteContent';
import ConfirmDialog from './ConfirmDialog';
import { PrintDialog } from './PrintSheet';
import {
  NOTE_TYPES, typeOf, contextTrail, sourceLinkFor, formatDate, notebookPaths,
} from './noteMeta';
import '../notebook.css';
import './notebookSpace.css';

const TRAIL_ICON = { lesson: BookOpen, place: MapPin, exercise: PencilLine, question: CircleHelp };

/**
 * La page d'UNE note : le même éditeur que le cahier flottant (NotebookEditor
 * + NotebookToolbar), posé sur une vraie page — titre, type, importance, file
 * de révision, archive, impression, suppression, retour à la source.
 *
 * Le contexte de la note est affiché, jamais modifié : il appartient à sa
 * création. Enregistrer est explicite ; l'état (modifié / enregistrement /
 * enregistré) est dit, et une fermeture de l'onglet avec des changements
 * non enregistrés est retenue par le navigateur.
 */
export default function NoteDetail() {
  const { t } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  const s = (key, opts) => t(`notebook.space.${key}`, opts);
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const base = useWorkspaceBase();
  const paths = notebookPaths(base);

  const [note, setNote] = useState(null);
  const [missing, setMissing] = useState(false);
  const [title, setTitle] = useState('');
  const [noteType, setNoteType] = useState('note');
  const [mistakeType, setMistakeType] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | dirty | saving | saved | error
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [toolState, setToolState] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const editorRef = useRef(null);
  const htmlRef = useRef('');
  const [initialHtml, setInitialHtml] = useState(null);

  useDocumentMeta(note?.title || s('detail.heading'), s('metaDescription'));

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    fetchNote(token, noteId)
      .then(({ note: n }) => {
        if (cancelled) return;
        setNote(n);
        setTitle(n.title ?? '');
        setNoteType(n.noteType ?? 'note');
        setMistakeType(n.mistakeType ?? null);
        const html = isRichContent(n.content) ? n.content : plainTextToHtml(n.content ?? '');
        htmlRef.current = html;
        setInitialHtml(html);
      })
      .catch(() => !cancelled && setMissing(true));

    return () => { cancelled = true; };
  }, [token, noteId]);

  // Des changements non enregistrés retiennent la fermeture de l'onglet.
  useEffect(() => {
    if (status !== 'dirty') return undefined;
    const guard = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', guard);

    return () => window.removeEventListener('beforeunload', guard);
  }, [status]);

  const markDirty = () => { setStatus((st) => (st === 'saving' ? st : 'dirty')); setError(null); };
  const onEditorChange = useCallback((html) => {
    if (html === htmlRef.current) return;
    htmlRef.current = html;
    markDirty();
  }, []);

  const save = async () => {
    if (status === 'saving' || !note) return;
    const clean = sanitizeHtml(htmlRef.current);
    if (isEmptyContent(clean)) { setStatus('error'); setError(t('notebook.window.emptyCannotSave')); return; }
    if (clean.length > MAX_CONTENT_LENGTH) { setStatus('error'); setError(t('notebook.window.tooLong')); return; }
    setStatus('saving');
    setError(null);
    try {
      const { note: updated } = await updateNote(token, note.id, { content: clean, title: title.trim() || null, noteType, mistakeType });
      setNote(updated);
      setStatus('saved');
    } catch (e) {
      setStatus('error');
      setError(e.message || t('notebook.window.statusError'));
    }
  };

  const toggle = async (body) => {
    try {
      const { note: updated } = await updateNote(token, note.id, body);
      setNote(updated);
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    try {
      await deleteNote(token, note.id);
      navigate(paths.root, { replace: true });
    } catch (e) {
      setError(e.message);
    }
  };

  if (missing) {
    return (
      <div className="sa-page py-10">
        <BackLink />
        <div className="sa-ns-empty mt-6"><p className="font-bold text-slate-800">{s('detail.notFound')}</p></div>
      </div>
    );
  }
  if (!note || initialHtml === null) {
    return <div className="sa-page py-10"><BackLink /><div className="sa-ns-skeleton mt-6 !h-72" /></div>;
  }

  const type = typeOf({ ...note, noteType });
  const trail = contextTrail(note, t);
  const source = sourceLinkFor(note, base);
  const STATUS = {
    dirty: { Icon: Circle, label: t('notebook.window.statusDirty') },
    saving: { Icon: LoaderCircle, label: t('notebook.window.statusSaving') },
    saved: { Icon: Check, label: t('notebook.window.statusSaved') },
    error: { Icon: CloudOff, label: t('notebook.window.statusDirty') },
  };
  const st = STATUS[status];

  return (
    <div className="sa-page py-8 sm:py-10" data-nb-detail={note.id}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <BackLink />
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" className="sa-ns-btn sa-ns-btn--icon" aria-pressed={note.isPinned} title={note.isPinned ? s('card.unpin') : s('card.pin')} aria-label={note.isPinned ? s('card.unpin') : s('card.pin')} onClick={() => toggle({ pinned: !note.isPinned })} data-nb-pin>
            <Star size={18} aria-hidden="true" fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>
          <button type="button" className="sa-ns-btn sa-ns-btn--icon" aria-pressed={note.isToReview} title={note.isToReview ? s('card.removeReview') : s('card.toReview')} aria-label={note.isToReview ? s('card.removeReview') : s('card.toReview')} onClick={() => toggle({ review: !note.isToReview })} data-nb-review-toggle>
            <RotateCcw size={18} aria-hidden="true" />
          </button>
          <button type="button" className="sa-ns-btn sa-ns-btn--icon" title={s('card.print')} aria-label={s('card.print')} onClick={() => setPrintOpen(true)}>
            <Printer size={18} aria-hidden="true" />
          </button>
          <button type="button" className="sa-ns-btn sa-ns-btn--icon" title={note.isArchived ? s('card.unarchive') : s('card.archive')} aria-label={note.isArchived ? s('card.unarchive') : s('card.archive')} onClick={() => toggle({ archived: !note.isArchived })}>
            {note.isArchived ? <ArchiveRestore size={18} aria-hidden="true" /> : <Archive size={18} aria-hidden="true" />}
          </button>
          <button type="button" className="sa-ns-btn sa-ns-btn--icon hover:!text-rose-700" title={s('card.delete')} aria-label={s('card.delete')} onClick={() => setConfirmDelete(true)} data-nb-delete>
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8 items-start">
        <div>
          <p className="font-mono-jetbrains text-violet-600 text-xs font-semibold tracking-widest uppercase mb-2 inline-flex items-center gap-2">
            <span className="sa-ns-type" data-tone={type.tone}><span aria-hidden="true">{type.emoji}</span> {s(`types.${type.id}`)}</span>
            {note.isArchived && <span className="sa-ns-flag"><Archive size={13} aria-hidden="true" /> {s('card.archivedBadge')}</span>}
          </p>
          <input
            className="sa-ns-title-input mb-4"
            value={title}
            onChange={(e) => { setTitle(e.target.value); markDirty(); }}
            placeholder={s('detail.titlePlaceholder')}
            aria-label={s('detail.titleAria')}
            maxLength={160}
            data-nb-title
          />

          <div className="sa-ns-paper">
            <div className="sa-nb-sheet">
              <div style={{ display: preview ? 'none' : 'block' }}>
                <NotebookEditor
                  ref={editorRef}
                  initialHtml={initialHtml}
                  onChange={onEditorChange}
                  onStateChange={setToolState}
                  placeholder={t('notebook.notePlaceholder')}
                  ariaLabel={s('detail.editorAria')}
                />
              </div>
              {preview && (isEmptyContent(previewHtml) ? <p className="text-slate-500 text-sm">{t('notebook.window.previewEmpty')}</p> : <NotebookContent content={previewHtml} />)}
            </div>
            <NotebookToolbar
              exec={(cmd, value) => editorRef.current?.exec(cmd, value)}
              state={toolState}
              preview={preview}
              onTogglePreview={() => { if (!preview) setPreviewHtml(htmlRef.current); setPreview((p) => !p); }}
            />
          </div>

          {error && <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">{error}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="sa-nb-status" data-state={status} role="status" aria-live="polite">
              {st ? <><st.Icon size={14} aria-hidden="true" fill={status === 'dirty' ? 'currentColor' : 'none'} /> {st.label}</> : <span className="opacity-0" aria-hidden="true">·</span>}
            </span>
            <button type="button" className="sa-ns-btn sa-ns-btn--primary" onClick={save} disabled={status === 'saving' || status === 'saved' || preview} data-nb-save>
              {status === 'saved' ? <><Check size={18} aria-hidden="true" /> {t('notebook.window.statusSaved')}</> : tc('save')}
            </button>
          </div>
        </div>

        {/* ── Colonne : ce qu'elle est, d'où elle vient, quand ─────────── */}
        <aside className="mt-8 lg:mt-0 space-y-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="nb-type">{s('typeLabel')}</label>
            <select id="nb-type" className="sa-ns-select" value={noteType} onChange={(e) => { setNoteType(e.target.value); markDirty(); }} data-nb-type>
              {NOTE_TYPES.map((tp) => <option key={tp.id} value={tp.id}>{tp.emoji} {s(`types.${tp.id}`)}</option>)}
            </select>
          </div>
          {(note.origin === 'exercise' || mistakeType) && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="nb-mistake">{s('detail.mistakeType')}</label>
              <select id="nb-mistake" className="sa-ns-select" value={mistakeType ?? ''} onChange={(e) => { setMistakeType(e.target.value || null); markDirty(); }}>
                <option value="">{s('detail.mistakeNone')}</option>
                {MISTAKE_TYPES.map((m) => <option key={m.id} value={m.id}>{t(m.labelKey)}</option>)}
              </select>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{s('detail.origin')}</p>
            <p className="text-sm text-slate-600 mb-2">{note.origin === 'exercise' ? s('detail.originExercise') : note.lessonCode ? s('detail.originLesson') : s('detail.originPersonal')}</p>
            {trail.length > 0 && (
              <ul className="space-y-1">
                {trail.map((step) => {
                  const Icon = TRAIL_ICON[step.kind];
                  return (
                    <li key={step.kind} className={`flex items-start gap-2 text-sm ${step.kind === 'place' ? 'font-bold text-slate-800' : 'text-violet-800'}`}>
                      <Icon size={15} className="mt-0.5 flex-none" aria-hidden="true" /> <span>{step.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            {source && (
              <Link to={source.to} className="sa-ns-btn sa-ns-btn--ghost mt-3 w-full" data-nb-source>
                <ExternalLink size={16} aria-hidden="true" /> {source.kind === 'exercise' ? s('card.viewExercise') : s('card.viewLesson')}
              </Link>
            )}
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <p>{s('detail.created', { date: formatDate(note.createdAt) })}</p>
            {note.updatedAt && note.updatedAt !== note.createdAt && <p>{s('detail.updated', { date: formatDate(note.updatedAt) })}</p>}
            <p>{s('detail.reviewed', { count: note.reviewCount ?? 0 })}</p>
          </div>
        </aside>
      </div>

      <ConfirmDialog open={confirmDelete} title={s('detail.deleteTitle')} body={s('detail.deleteBody')} confirmLabel={s('detail.deleteConfirm')} onConfirm={remove} onCancel={() => setConfirmDelete(false)} />
      <PrintDialog open={printOpen} sets={{ this: [{ ...note, title: title || note.title }] }} defaultMode="this" onClose={() => setPrintOpen(false)} />
    </div>
  );
}

function BackLink() {
  const { t } = useTranslation('student');
  const paths = notebookPaths(useWorkspaceBase());

  return (
    <Link to={paths.root} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-violet-800 min-h-[44px]" data-nb-back>
      <ArrowRight size={16} aria-hidden="true" /> {t('notebook.space.detail.back')}
    </Link>
  );
}
