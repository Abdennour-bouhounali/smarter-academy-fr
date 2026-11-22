import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Star, RotateCcw, Archive, ArchiveRestore, Trash2, Printer, EllipsisVertical, ExternalLink, ArrowUpRight, BookOpen, MapPin, PencilLine, CircleHelp,
} from 'lucide-react';
import NotebookContent from '../NotebookContent';
import { useWorkspaceBase } from '../../../learning/learningViewer';
import {
  typeOf, contextTrail, sourceLinkFor, timeAgo, notebookPaths,
} from './noteMeta';

const TRAIL_ICON = { lesson: BookOpen, place: MapPin, exercise: PencilLine, question: CircleHelp };

/**
 * Une note dans « Mon cahier ». Ce qu'elle dit, dans cet ordre : MON texte
 * (l'aperçu), ce qu'elle EST (le type), d'OÙ elle vient (le fil de
 * contexte — seulement les niveaux qui existent), QUAND.
 *
 * Le menu « ⋮ » porte les gestes de rangement (importante, à revoir,
 * archiver, supprimer, imprimer) ; « افتح » ouvre la page de la note ; le
 * lien de source ramène dans la leçon ou vers l'exercice.
 *
 * @param {(action: string, note: object) => void} onAction  pin | review | archive | delete | print
 */
export default function NoteCard({ note, selected = false, onToggleSelect, onAction }) {
  const { t } = useTranslation('student');
  const c = (key, opts) => t(`notebook.space.card.${key}`, opts);
  const type = typeOf(note);
  const trail = contextTrail(note, t);
  const base = useWorkspaceBase();
  const paths = notebookPaths(base);
  const source = sourceLinkFor(note, base);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Le menu se ferme au clic ailleurs et à Échap — sans piéger le focus.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const act = (action) => {
    setMenuOpen(false);
    onAction?.(action, note);
  };

  const titleId = `note-${note.id}-title`;

  return (
    <article
      className="sa-ns-card"
      data-note-card={note.id}
      data-selected={selected}
      data-pinned={note.isPinned || undefined}
      data-type={type.id}
      aria-labelledby={titleId}
    >
      <div className="sa-ns-card-top">
        {onToggleSelect && (
          <label className="sa-ns-check-label">
            <input
              type="checkbox"
              className="sa-ns-check"
              checked={selected}
              onChange={() => onToggleSelect(note)}
              aria-label={c('select')}
            />
          </label>
        )}
        <span className="sa-ns-type" data-tone={type.tone}>
          <span aria-hidden="true">{type.emoji}</span> {t(`notebook.space.types.${type.id}`)}
        </span>
        {note.isPinned && <span className="sa-ns-flag" data-kind="pinned"><Star size={13} aria-hidden="true" fill="currentColor" /> {c('pinnedBadge')}</span>}
        {note.isToReview && !note.isArchived && <span className="sa-ns-flag" data-kind="review"><RotateCcw size={13} aria-hidden="true" /> {c('reviewBadge')}</span>}
        {note.isArchived && <span className="sa-ns-flag"><Archive size={13} aria-hidden="true" /> {c('archivedBadge')}</span>}
      </div>

      {/* 1. Mon texte — le titre s'il y en a un, puis l'aperçu de la note. */}
      <h3 id={titleId} className="sa-ns-card-title">
        <Link to={paths.note(note.id)}>{note.title || textStart(note.excerpt) || c('untitled')}</Link>
      </h3>
      <Link to={paths.note(note.id)} className="sa-ns-preview" aria-hidden="true" tabIndex={-1}>
        <NotebookContent content={note.content} />
      </Link>

      {/* 3. D'où elle vient — seulement les niveaux qui existent. */}
      {trail.length > 0 && (
        <p className="sa-ns-trail">
          {trail.map((step, i) => {
            const Icon = TRAIL_ICON[step.kind];
            return (
              <span key={step.kind} data-kind={step.kind}>
                {i > 0 && <span className="sa-ns-sep" aria-hidden="true">›</span>}
                <Icon size={13} aria-hidden="true" />
                <span title={step.label}>{step.label}</span>
              </span>
            );
          })}
        </p>
      )}

      {/* 4. Quand — et les gestes. */}
      <div className="sa-ns-card-foot">
        <time dateTime={note.updatedAt ?? note.createdAt} title={note.updatedAt ?? note.createdAt}>
          {timeAgo(note.updatedAt ?? note.createdAt)}
        </time>
        <div className="sa-ns-card-actions">
          {source && (
            <Link
              to={source.to}
              className="sa-ns-btn sa-ns-btn--icon"
              title={source.kind === 'exercise' ? c('viewExercise') : c('viewLesson')}
              aria-label={source.kind === 'exercise' ? c('viewExercise') : c('viewLesson')}
              data-note-source={source.kind}
            >
              <ExternalLink size={16} aria-hidden="true" />
            </Link>
          )}
          <Link to={paths.note(note.id)} className="sa-ns-btn sa-ns-btn--link" data-note-open={note.id}>
            {c('open')} <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              className="sa-ns-btn sa-ns-btn--icon"
              aria-label={c('menu')}
              title={c('menu')}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <EllipsisVertical size={18} aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="sa-ns-menu" role="menu" aria-label={c('menu')}>
                <button type="button" role="menuitem" onClick={() => act('pin')}>
                  <Star size={16} aria-hidden="true" fill={note.isPinned ? 'currentColor' : 'none'} /> {note.isPinned ? c('unpin') : c('pin')}
                </button>
                <button type="button" role="menuitem" onClick={() => act('review')}>
                  <RotateCcw size={16} aria-hidden="true" /> {note.isToReview ? c('removeReview') : c('toReview')}
                </button>
                <button type="button" role="menuitem" onClick={() => act('print')}>
                  <Printer size={16} aria-hidden="true" /> {c('print')}
                </button>
                <button type="button" role="menuitem" onClick={() => act('archive')}>
                  {note.isArchived ? <ArchiveRestore size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}
                  {' '}{note.isArchived ? c('unarchive') : c('archive')}
                </button>
                <button type="button" role="menuitem" data-danger onClick={() => act('delete')}>
                  <Trash2 size={16} aria-hidden="true" /> {c('delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/** La première phrase de l'aperçu, comme titre de secours. */
function textStart(excerpt) {
  const s = String(excerpt ?? '').trim();
  if (!s) return '';
  const cut = s.split(/[.!?؟\n]/)[0].trim();

  return (cut.length > 3 ? cut : s).slice(0, 80);
}
