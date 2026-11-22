import { Suspense, lazy, useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, UserMinus, UserPlus, NotebookPen, Printer, QrCode, Search } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { ConfirmDialog } from '../../../components/admin/ui/Modal';
import { fetchClassStudents, removeClassStudent } from '../../../services/teacher/classGroupService';
import { useTableLabels, formatDate, btnSecondary, Loading, ErrorBox } from '../../../pages/teacher/teacherUi';
import CredentialsDialog from './CredentialsDialog';
import { studentName } from '../insights/insights';
import { usePayments } from '../../../context/PaymentsContext';
import { useManagedAccounts } from '../../../hooks/useManagedAccounts';
import { LOCALE } from '../../../locale.js';

// « Cartes pour les parents » : paresseux — il tire qrcode-generator et le namespace `family` (PARENT_SPACE.md §2bis).
const ParentCardsDialog = lazy(() => import('./ParentCardsDialog'));

/**
 * « Élèves »: who is in the class and where each one is. ONE line of filters (all · started · not started yet) answers
 * « who has not begun? » without reading 35 rows; the row's actions are two quiet icons (the notebook, take out of the
 * class). The seats line shows only when the plan is nearly full. The login cards and the parents' cards open from the
 * top line. The login cards issue new passwords: while the administrator keeps the accounts created by a teacher
 * closed (useManagedAccounts), their button and dialog are absent and one sentence points to the class's code or link.
 */
const NEAR_FULL = 0.9;
/** student · progress · lessons · success · actions on a wide screen; on a phone: student and actions, progress under them. */
const GRID = 'grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_7rem_6rem_6.5rem]';
const initialsOf = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('\u200c');
const SORTS = {
  progress: (a, b) => (b.progressPercent ?? -1) - (a.progressPercent ?? -1),
  activity: (a, b) => String(b.lastActivityAt ?? '').localeCompare(String(a.lastActivityAt ?? '')),
};
const ICON_BTN =
  'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-nav-line bg-white text-nav-muted';

export default function MembersTab({ classGroup, entitlements, onChanged, onInvite }) {
  const { t } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  const labels = useTableLabels();
  const loader = useCallback((tk) => fetchClassStudents(tk, classGroup.id), [classGroup.id]);
  const { data: students, loading, error, reload } = useAdminResource(loader, [loader]);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [removeError, setRemoveError] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [parentCards, setParentCards] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('progress');

  const confirmRemove = async () => {
    setBusy(true);
    setRemoveError(null);
    try {
      await removeClassStudent(token, classGroup.id, removing.id);
      setRemoving(null);
      reload();
      onChanged?.();
    } catch (err) {
      setRemoveError(t(`classes.errors.${err?.reason ?? 'generic'}`, { defaultValue: t('classes.errors.generic') }));
    } finally {
      setBusy(false);
    }
  };

  const fullName = (s) => studentName(s, t('common.unnamedStudent'));

  // Payments closed: no seat cap and no « widen your plan » — a teacher's seats are not sold (§4ter).
  const { paymentsOpen } = usePayments();
  const managed = useManagedAccounts();
  const seats = paymentsOpen ? entitlements?.students : null;
  const seatsFull = seats && seats.maximum != null && seats.current >= seats.maximum;
  const seatsNear = seats && seats.maximum != null && seats.current >= seats.maximum * NEAR_FULL;
  const all = students ?? [];
  const groups = { all, active: all.filter((st) => st.lastActivityAt), idle: all.filter((st) => !st.lastActivityAt) };
  const needle = query.trim().toLowerCase();
  const byName = (a, b) => fullName(a).localeCompare(fullName(b), LOCALE);
  const rows = groups[filter]
    .filter((st) => !needle || fullName(st).toLowerCase().includes(needle))
    .sort(SORTS[sortBy] ?? byName);

  return (
    <div className="space-y-4">
      {seatsNear && (
        <p
          className={`rounded-xl border p-3 text-sm ${seatsFull ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
          role="status"
          data-seats-hint
        >
          {seatsFull
            ? t('students.seatsFull')
            : t('students.seatsHint', { current: seats.current, limit: seats.maximum ?? '∞' })}
          {seatsFull && (
            <>
              {' '}
              <Link to="/enseignant/offre" className="font-semibold text-nav-accent hover:underline">
                {t('subscription.title')}
              </Link>
            </>
          )}
        </p>
      )}
      {all.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" data-students-bar>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('students.filter.label')}>
            {['all', 'active', 'idle'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                data-students-filter={key}
                className={`min-h-[40px] rounded-full border px-3.5 font-inter text-sm font-bold ${
                  filter === key
                    ? 'border-transparent bg-nav-accent-soft text-nav-accent'
                    : 'border-nav-line bg-white text-nav-muted hover:text-nav-ink'
                }`}
              >
                {t(`students.filter.${key}`)} <span dir="ltr">{groups[key].length}</span>
              </button>
            ))}
          </div>
          <label className="flex min-h-[40px] min-w-[11rem] flex-1 items-center gap-2 rounded-full border border-nav-line bg-white px-3 focus-within:border-nav-accent sm:max-w-xs">
            <Search size={15} className="shrink-0 text-nav-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('students.search')}
              aria-label={t('students.search')}
              className="min-w-0 flex-1 bg-transparent font-inter text-sm text-nav-ink outline-none"
              data-students-search
            />
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label={t('students.sort.label')}
            className="min-h-[40px] rounded-full border border-nav-line bg-white px-3 font-inter text-sm font-bold text-nav-muted"
            data-students-sort
          >
            {['progress', 'activity', 'name'].map((key) => (
              <option key={key} value={key}>
                {t(`students.sort.${key}`)}
              </option>
            ))}
          </select>
          {classGroup.status === 'active' && (
            <div className="ms-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setParentCards(true)}
                className={btnSecondary}
                data-parent-cards-open
              >
                <QrCode size={14} aria-hidden="true" /> {t('students.parentCards.open')}
              </button>
              {managed.open && (
                <button type="button" onClick={() => setPrinting(true)} className={btnSecondary} data-credentials-open>
                  <Printer size={14} aria-hidden="true" /> {t('students.credentials.open')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {all.length > 0 && classGroup.status === 'active' && managed.loaded && !managed.open && (
        <p
          className="flex flex-wrap items-center gap-x-3 gap-y-2 font-inter text-sm text-nav-muted"
          data-credentials-closed
        >
          {t('students.credentials.closed')}
          {onInvite && (
            <button type="button" onClick={onInvite} className={btnSecondary} data-students-invite>
              <UserPlus size={15} aria-hidden="true" /> {t('classes.invite')}
            </button>
          )}
        </p>
      )}
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {!loading && !error && all.length === 0 && (
        <div className="rounded-2xl border border-dashed border-nav-line bg-white p-10 text-center">
          <Users size={26} className="mx-auto mb-3 text-nav-muted" aria-hidden="true" />
          <p className="font-space font-bold text-nav-ink">{t('students.empty')}</p>
          {classGroup.status === 'active' && onInvite && (
            <button type="button" onClick={onInvite} className={`${btnSecondary} mt-4`} data-students-invite>
              <UserPlus size={15} aria-hidden="true" /> {t('classes.invite')}
            </button>
          )}
        </div>
      )}
      {all.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-nav-line bg-white" data-students-list>
          <div
            className={`hidden border-b border-nav-line px-4 py-2.5 font-inter text-xs font-bold text-nav-muted md:grid ${GRID}`}
          >
            <span>{t('students.name')}</span>
            <span>{t('students.progress')}</span>
            <span>{t('students.lessonsCompleted')}</span>
            <span>{t('students.successRate')}</span>
            <span />
          </div>
          {rows.length === 0 && (
            <p className="p-6 text-center font-inter text-sm font-semibold text-nav-muted">{t('students.noMatch')}</p>
          )}
          <ul className="divide-y divide-nav-line">
            {rows.map((s) => {
              const name = fullName(s);
              const started = Boolean(s.lastActivityAt);
              return (
                <li
                  key={s.id}
                  className={`grid items-center gap-x-4 gap-y-2 px-4 py-2.5 ${GRID}`}
                  data-student-line={s.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-space text-xs font-bold ${
                        started ? 'bg-nav-accent-soft text-nav-accent' : 'bg-nav-page text-nav-muted'
                      }`}
                      aria-hidden="true"
                    >
                      {initialsOf(name)}
                    </span>
                    <span className="min-w-0">
                      <Link
                        to={`/enseignant/classes/${classGroup.id}/eleves/${s.id}`}
                        className="block truncate font-inter text-sm font-bold text-nav-ink hover:text-nav-accent"
                      >
                        {name}
                      </Link>
                      <span className="block truncate font-inter text-xs font-semibold text-nav-muted">
                        {started
                          ? `${t('students.lastActivity')} · ${formatDate(s.lastActivityAt)}`
                          : t('students.never')}
                      </span>
                    </span>
                  </div>
                  <div className="order-3 col-span-2 flex items-center gap-2 md:order-none md:col-span-1">
                    {s.progressPercent === null ? (
                      <span className="text-nav-muted">—</span>
                    ) : (
                      <>
                        <span
                          className="flex h-2 min-w-0 flex-1 justify-start overflow-hidden rounded-full bg-nav-line"
                          aria-hidden="true"
                        >
                          <span
                            className="block h-full rounded-full bg-nav-accent"
                            style={{ width: `${Math.min(100, s.progressPercent)}%` }}
                          />
                        </span>
                        <span className="w-10 shrink-0 text-end font-inter text-xs font-bold text-nav-ink" dir="ltr">
                          {s.progressPercent}%
                        </span>
                      </>
                    )}
                  </div>
                  <span className="hidden font-space text-sm font-bold text-nav-ink md:block" dir="ltr">
                    {s.lessonsCompleted}
                  </span>
                  <span className="hidden font-space text-sm font-bold text-nav-ink md:block" dir="ltr">
                    {s.successRate === null ? '—' : `${s.successRate}%`}
                  </span>
                  <div className="order-2 flex justify-end gap-1.5 md:order-none">
                    <Link
                      to={`/enseignant/classes/${classGroup.id}/eleves/${s.id}/cahier`}
                      className={`${ICON_BTN} hover:border-nav-accent hover:text-nav-accent`}
                      aria-label={t('notebook.detailTitle', { name })}
                      title={t('notebook.open')}
                    >
                      <NotebookPen size={15} aria-hidden="true" />
                    </Link>
                    {classGroup.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => {
                          setRemoving(s);
                          setRemoveError(null);
                        }}
                        className={`${ICON_BTN} hover:border-nav-alert hover:text-nav-alert`}
                        aria-label={`${t('students.remove')} — ${name}`}
                        title={t('students.remove')}
                        data-student-take-out
                      >
                        <UserMinus size={15} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
        busy={busy}
        tone="danger"
        title={t('students.removeConfirmTitle', { name: removing ? fullName(removing) : '' })}
        message={
          <div className="space-y-2">
            <p>{t('students.removeConfirmBody')}</p>
            {removeError && (
              <p role="alert" className="text-rose-700">
                {removeError}
              </p>
            )}
          </div>
        }
        confirmLabel={t('students.remove')}
        {...labels.dialog}
      />

      {managed.open && (
        <CredentialsDialog
          open={printing}
          onClose={() => setPrinting(false)}
          classGroup={classGroup}
          students={students ?? []}
        />
      )}
      {parentCards && (
        <Suspense fallback={null}>
          <ParentCardsDialog
            open
            onClose={() => setParentCards(false)}
            classGroup={classGroup}
            students={students ?? []}
          />
        </Suspense>
      )}
    </div>
  );
}
