import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, BookOpen } from 'lucide-react';
import { ArrowBack } from '../../components/common/DirectionalIcons';
import { useAdminResource } from '../../hooks/useAdminResource';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import NotebookContent from '../../features/practice/notebook/NotebookContent';
import { NOTE_TYPES, typeOf, timeAgo } from '../../features/practice/notebook/space/noteMeta';
import { fetchClassStudentNotebook } from '../../services/teacher/classGroupService';
import '../../features/practice/notebook/space/notebookSpace.css';
import { Pagination } from '../../components/admin/ui/FilterBar';
import { TeacherPage, Loading, ErrorBox, btnSecondary, useTableLabels } from './teacherUi';
import { notebookPagerMeta } from './StudentNotebookPage.paging';

// Pas de vue « archivées » : le serveur ne rend plus à l'enseignant les
// notes que l'élève a archivées.
const VIEWS = ['all', 'errors', 'questions'];
const PER_PAGE = 50;

/**
 * LE CAHIER D'UN ÉLÈVE, LU PAR SON ENSEIGNANT.
 *
 * Ce que l'enseignant vient y chercher n'est pas un score : c'est ce que
 * l'élève a écrit AVEC SES MOTS — « je confonds toujours le signe », « je
 * n'ai pas compris pourquoi on divise ». Un pourcentage de réussite dit
 * qu'il se trompe ; le cahier dit où il se perd. La vue « Erreurs » est
 * donc offerte d'emblée : c'est celle qui sert.
 *
 * ── Lecture seule, et la page le DIT ─────────────────────────────────────
 * Aucun geste d'écriture n'est rendu — ni modifier, ni archiver, ni
 * supprimer — parce qu'aucune route ne l'accepterait
 * (TeacherClassroomNotebookController). Et le bandeau l'annonce, plutôt que
 * de laisser l'enseignant le découvrir : il lit le carnet de quelqu'un.
 *
 * ── Le périmètre est décidé par le SERVEUR ───────────────────────────────
 * Les notes rendues sont celles des leçons effectives de la classe. Cette page ne
 * filtre rien elle-même : elle ne saurait pas le faire honnêtement, et un
 * filtre côté client ne serait pas une sécurité.
 *
 * ── Paginé, et le pager le MONTRE ────────────────────────────────────────
 * Le serveur rend `PER_PAGE` notes et une meta `{ total, page, perPage,
 * hasMore }`. Sans pager, tout ce qui dépassait la première page était
 * caché sans le dire. Changer de vue ramène à la page 1.
 */
export default function StudentNotebookPage() {
  const { t } = useTranslation('teacher');
  const { id, studentId } = useParams();
  const labels = useTableLabels();
  const [view, setView] = useState('all');
  const [page, setPage] = useState(1);

  const loader = useCallback(
    (tk) => fetchClassStudentNotebook(tk, id, studentId, { view, page, perPage: PER_PAGE }),
    [id, studentId, view, page],
  );
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);
  const name = data ? [data.student.firstName, data.student.lastName].filter(Boolean).join(' ') : '';
  useDocumentMeta(name ? t('notebook.detailTitle', { name }) : t('notebook.title'));

  return (
    <TeacherPage
      eyebrow={t('notebook.title')}
      title={name || '…'}
      actions={(
        <Link to={`/enseignant/classes/${id}/eleves/${studentId}`} className={btnSecondary}>
          <ArrowBack size={14} /> {t('notebook.backToStudent')}
        </Link>
      )}
    >
      {/* L'enseignant lit le carnet de quelqu'un : on le dit, on ne le
          laisse pas le déduire de l'absence de boutons. */}
      <p className="mb-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-nav-accent-soft p-3 text-sm text-nav-accent">
        <Eye size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{t('notebook.readOnlyNotice')}</span>
      </p>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t('notebook.views')}>
        {VIEWS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => { setView(key); setPage(1); }}
            aria-pressed={view === key}
            className={`min-h-11 rounded-full border px-4 text-sm font-bold transition-colors ${
              view === key
                ? 'border-nav-accent bg-nav-accent text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
            }`}
          >
            {t(`notebook.view.${key}`)}
            {data?.counts?.[key] !== undefined && <span dir="ltr" className="ms-1.5 font-mono text-xs opacity-75">{data.counts[key]}</span>}
          </button>
        ))}
      </div>

      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}

      {data && data.notes.length === 0 && (
        <p className="rounded-2xl border border-nav-line bg-white p-6 text-center text-sm text-slate-500">{t('notebook.empty')}</p>
      )}

      {data && data.notes.length > 0 && (
        <ul className="space-y-3" data-teacher-notebook>
          {data.notes.map((note) => <NoteCard key={note.id} note={note} />)}
        </ul>
      )}

      {data && (
        <Pagination
          meta={notebookPagerMeta(data.meta, data.notes.length)}
          onPage={setPage}
          labels={labels.pagination}
        />
      )}
    </TeacherPage>
  );
}

/**
 * UNE note, telle que l'élève l'a écrite. Le contexte d'abord (quelle leçon,
 * quelle étape, quel exercice) : sans lui, « je me trompe ici » ne dit rien.
 */
function NoteCard({ note }) {
  const { t } = useTranslation('teacher');
  const type = NOTE_TYPES.find((candidate) => candidate.id === typeOf(note)) ?? NOTE_TYPES[0];

  return (
    <li className="rounded-2xl border border-nav-line bg-white p-4" data-teacher-note={note.id}>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        {/* La MÊME pastille que dans le cahier de l'élève (.sa-ns-type et
            ses sept teintes, notebookSpace.css) : un type d'erreur ne doit
            pas changer de couleur d'un écran à l'autre. */}
        <span className="sa-ns-type" data-tone={type.tone}>
          <span aria-hidden="true">{type.emoji}</span>
          {t(`notebook.type.${type.id}`, { defaultValue: type.id })}
        </span>
        {note.lessonTitle && (
          <span className="inline-flex items-center gap-1 text-slate-500">
            <BookOpen size={13} aria-hidden="true" />
            {note.lessonTitle}
            {note.moduleTitle && <span className="text-slate-400">› {note.moduleTitle}</span>}
          </span>
        )}
        {note.exerciseId && <span className="font-mono text-slate-400" dir="ltr">{note.exerciseId}</span>}
        <span className="ms-auto text-slate-400">{timeAgo(note.createdAt)}</span>
      </div>

      {note.title && <h3 className="mb-1 font-space font-bold text-slate-900">{note.title}</h3>}

      {/* Le MÊME rendu que dans le cahier de l'élève : HTML désinfecté par la
          même liste blanche, KaTeX sur les `$…$`. Deux rendus divergeraient. */}
      <NotebookContent content={note.content} />
    </li>
  );
}
