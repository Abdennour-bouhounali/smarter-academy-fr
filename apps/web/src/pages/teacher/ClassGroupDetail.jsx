import { lazy, Suspense, useCallback, useContext, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Archive, ArchiveRestore, UserPlus } from 'lucide-react';
import { ArrowBack } from '../../components/common/DirectionalIcons';
import { getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { useAdminResource } from '../../hooks/useAdminResource';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { ConfirmDialog } from '../../components/admin/ui/Modal';
import {
  fetchClassGroup,
  fetchTeacherEntitlements,
  updateClassGroup,
  archiveClassGroup,
  restoreClassGroup,
  rotateJoinCode,
  rotateJoinLink,
} from '../../services/teacher/classGroupService';
import JoinAccessCard from '../../features/teacher/members/JoinAccessCard';
import MembersTab from '../../features/teacher/members/MembersTab';
import LessonsTab from '../../features/teacher/classGroupLessons/LessonsTab';
import LearningPointsTab from '../../features/teacher/learningPoints/LearningPointsTab';
import OverviewTab from '../../features/teacher/overview/OverviewTab';
import InterventionsTab from '../../features/teacher/interventions/InterventionsTab';
// « Défi du jour » : lot et catalogue `challenge` chargés à l'ouverture de l'onglet.
const DailyChallengeTab = lazy(() => import('../../features/teacher/dailyChallenge/DailyChallengeTab'));
// « Espace jeux » : lot et catalogue `madar` chargés à l'ouverture de l'onglet.
const MadarTab = lazy(() => import('../../features/teacher/madar/MadarTab'));
import { isFeatureOn } from '../../config/features';
import { Loading, ErrorBox, useTableLabels, btnSecondary, btnPrimary, btnDanger, input } from './teacherUi';

/**
 * THE SECTIONS of a class page. Five, in the order of a teacher's questions — « what now? », « who? », « what do they
 * master? », « what do they play? », « how is the class set? » — instead of eight tabs side by side. A section with
 * several pages shows them as one small line under the tab bar. The address keeps `?tab=<page>` (old links still work).
 */
const SECTIONS = [
  { id: 'overview', tabs: ['overview'] },
  { id: 'students', tabs: ['students'] },
  { id: 'learning', tabs: ['learningPoints', 'interventions'] },
  // The daily challenge has no French content yet (config/features.js): its page is left out, its data never asked for.
  { id: 'activities', tabs: [...(isFeatureOn('dailyChallenge') ? ['dailyChallenge'] : []), 'madar'] },
  { id: 'settings', tabs: ['settings', 'lessons'] },
];
const TABS = SECTIONS.flatMap((section) => section.tabs);
const sectionOf = (tab) => SECTIONS.find((section) => section.tabs.includes(tab));

/**
 * THE PAGE OF A CLASS (owner, 2026-11-16: rebuilt « coherent, intelligent, organised, less repeated content »).
 *
 *   header   — back to « Mes classes », the class's name, ONE line of facts, « Inviter les élèves »;
 *   sections — five (`SECTIONS`); it opens on « Vue d'ensemble »: this week, what needs a look, what changed.
 *
 * How a student gets in (the link, the code — `JoinAccessCard`) is no longer pinned above every tab: it opens from
 * « Inviter les élèves », by itself while the class is empty, and lives in « Paramètres ».
 */
export default function ClassGroupDetail() {
  const { t } = useTranslation('teacher');
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const labels = useTableLabels();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'overview';
  const section = sectionOf(tab);
  const [focusPoint, setFocusPoint] = useState(null);
  const [inviting, setInviting] = useState(false);

  const loader = useCallback(
    async (tk) => {
      const [classroom, entitlements] = await Promise.all([fetchClassGroup(tk, id), fetchTeacherEntitlements(tk)]);
      return { classroom, entitlements };
    },
    [id],
  );
  const { data, loading, error, reload, setData } = useAdminResource(loader, [loader]);
  const classGroup = data?.classroom;
  useDocumentMeta(classGroup?.name ?? t('classes.title'));

  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const clearFocus = useCallback(() => setFocusPoint(null), []);
  const setTab = (next) => {
    const p = new URLSearchParams(searchParams);
    p.set('tab', next);
    setSearchParams(p, { replace: true });
  };
  const openPoint = (code) => {
    setFocusPoint(code);
    setTab('learningPoints');
  };
  const replaceClassroom = (classroom) => setData((cur) => ({ ...cur, classroom: { ...cur.classroom, ...classroom } }));

  const run = async (kind) => {
    setBusy(true);
    setActionError(null);
    try {
      if (kind === 'rotate') replaceClassroom(await rotateJoinCode(token, id));
      if (kind === 'rotateLink') replaceClassroom(await rotateJoinLink(token, id));
      if (kind === 'archive') {
        const r = await archiveClassGroup(token, id);
        replaceClassroom(r.classroom);
      }
      if (kind === 'restore') {
        const r = await restoreClassGroup(token, id);
        replaceClassroom(r.classroom);
      }
      setConfirm(null);
    } catch (err) {
      setActionError(t(`classes.errors.${err?.reason ?? 'generic'}`, { defaultValue: t('classes.errors.generic') }));
    } finally {
      setBusy(false);
    }
  };

  const gradeName = classGroup ? (getAllGrades().find((g) => g.id === classGroup.grade)?.name ?? classGroup.grade) : '';
  const count = classGroup?.studentsCount;
  const empty = count === 0;
  const joinCard = classGroup && (
    <JoinAccessCard
      classGroup={classGroup}
      onRotateLink={() => setConfirm('rotateLink')}
      onRotateCode={() => setConfirm('rotate')}
    />
  );
  const unavailable = (
    <p className="rounded-2xl border border-nav-line bg-white p-8 text-center text-sm text-nav-muted">
      {t('progress.unavailable')}
    </p>
  );
  const TAB = 'min-h-[44px] flex-shrink-0 border-b-2 px-3 font-inter text-sm font-bold transition-colors sm:px-4';

  return (
    <div className="sa-page py-5 sm:py-6" data-class-page>
      <Link
        to="/enseignant/classes"
        className="inline-flex min-h-[32px] items-center gap-1 font-inter text-xs font-bold text-nav-muted hover:text-nav-accent"
      >
        <ArrowBack size={13} /> {t('classes.title')}
      </Link>
      <header className="mb-4 mt-1 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-space text-2xl font-bold leading-tight text-nav-ink sm:text-3xl">
            {classGroup?.name ?? '…'}
          </h1>
          {classGroup && (
            <p
              className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-inter text-sm font-semibold text-nav-muted"
              data-class-facts
            >
              <span>{gradeName}</span>
              {count != null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{t('home.studentsCount', { count })}</span>
                </>
              )}
              {classGroup.description && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{classGroup.description}</span>
                </>
              )}
              {classGroup.status !== 'active' && (
                <span className="rounded-full bg-nav-now-soft px-2.5 py-0.5 text-xs font-bold text-[#8a5a00]">
                  {t(`classes.status.${classGroup.status}`)}
                </span>
              )}
            </p>
          )}
        </div>
        {classGroup?.status === 'active' && !empty && (
          <button
            type="button"
            onClick={() => setInviting((value) => !value)}
            aria-expanded={inviting}
            className={btnSecondary}
            data-invite-toggle
          >
            <UserPlus size={15} aria-hidden="true" /> {t('classes.invite')}
          </button>
        )}
      </header>

      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {classGroup && (
        <div className="space-y-4">
          {/* An empty class has ONE thing to do: bring the students in. Otherwise the card comes when asked. */}
          {(empty || inviting) && tab !== 'settings' && joinCard}

          <div className="sticky top-14 z-20 -mx-1 bg-nav-page px-1 pb-2 md:top-0" data-class-nav>
            <div
              role="tablist"
              data-tour="class.tabs"
              className="flex gap-1 overflow-x-auto border-b border-nav-line [scrollbar-width:none]"
            >
              {SECTIONS.map((item) => {
                const on = item.id === section.id;
                const single = item.tabs.length === 1;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={single ? tab === item.tabs[0] : on}
                    onClick={() => setTab(item.tabs[0])}
                    data-tab-group={item.id}
                    {...(single ? { 'data-tab': item.tabs[0] } : {})}
                    className={`${TAB} ${on ? 'border-nav-accent text-nav-accent' : 'border-transparent text-nav-muted hover:text-nav-ink'}`}
                  >
                    {t(`classes.sections.${item.id}`)}
                    {item.id === 'students' && count > 0 && (
                      <span
                        className="ms-1.5 rounded-full bg-nav-line px-1.5 py-0.5 text-xs font-bold text-nav-ink"
                        dir="ltr"
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {section.tabs.length > 1 && (
              <div role="tablist" className="mt-3 flex flex-wrap gap-2" data-class-subtabs={section.id}>
                {section.tabs.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => setTab(key)}
                    data-tab={key}
                    className={`min-h-[40px] rounded-full border px-4 font-inter text-sm font-bold transition-colors ${
                      tab === key
                        ? 'border-transparent bg-nav-accent-soft text-nav-accent'
                        : 'border-nav-line bg-white text-nav-muted hover:text-nav-ink'
                    }`}
                  >
                    {t(`classes.tabs.${key}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {actionError && (
            <p role="alert" className="rounded-xl bg-nav-alert-soft p-3 text-sm font-semibold text-[#9b2238]">
              {actionError}
            </p>
          )}

          {tab === 'overview' &&
            (data.entitlements?.features?.['progress.class'] === false ? (
              unavailable
            ) : (
              <OverviewTab classGroup={classGroup} onOpenTab={setTab} onOpenPoint={openPoint} />
            ))}
          {tab === 'students' && (
            <MembersTab
              classGroup={classGroup}
              entitlements={data.entitlements}
              onChanged={reload}
              onInvite={() => setInviting(true)}
            />
          )}
          {tab === 'learningPoints' &&
            (data.entitlements?.features?.['progress.class'] === false ? (
              unavailable
            ) : (
              <LearningPointsTab classGroup={classGroup} focusCode={focusPoint} onFocusConsumed={clearFocus} />
            ))}
          {tab === 'interventions' &&
            (data.entitlements?.features?.['progress.student'] === false ? (
              unavailable
            ) : (
              <InterventionsTab classGroup={classGroup} onOpenPoint={openPoint} />
            ))}
          {tab === 'dailyChallenge' && (
            <Suspense fallback={<Loading />}>
              <DailyChallengeTab classGroup={classGroup} onOpenPoint={openPoint} />
            </Suspense>
          )}
          {tab === 'madar' && (
            <Suspense fallback={<Loading />}>
              <MadarTab classGroup={classGroup} />
            </Suspense>
          )}
          {tab === 'lessons' && <LessonsTab classGroup={classGroup} entitlements={data.entitlements} />}
          {tab === 'settings' && (
            <SettingsTab
              classGroup={classGroup}
              joinCard={joinCard}
              onSaved={replaceClassroom}
              onArchive={() => setConfirm(classGroup.status === 'archived' ? 'restore' : 'archive')}
            />
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => (busy ? null : setConfirm(null))}
        onConfirm={() => run(confirm)}
        busy={busy}
        tone={confirm === 'archive' ? 'danger' : 'default'}
        title={
          confirm === 'rotate'
            ? t('classes.rotateConfirmTitle')
            : confirm === 'rotateLink'
              ? t('classes.rotateLinkConfirmTitle')
              : confirm === 'archive'
                ? t('classes.archiveConfirmTitle', { name: classGroup?.name ?? '' })
                : t('classes.restore')
        }
        message={
          <p>
            {confirm === 'rotate'
              ? t('classes.rotateConfirmBody')
              : confirm === 'rotateLink'
                ? t('classes.rotateLinkConfirmBody')
                : confirm === 'archive'
                  ? t('classes.archiveConfirmBody')
                  : ''}
          </p>
        }
        confirmLabel={
          confirm === 'rotate'
            ? t('classes.rotateJoinCode')
            : confirm === 'rotateLink'
              ? t('classes.rotateJoinLink')
              : confirm === 'archive'
                ? t('classes.archive')
                : t('classes.restore')
        }
        {...labels.dialog}
      />
    </div>
  );
}

/** « Classe »: how students get in, the class's name and year, and archiving — the three things set once. */
function SettingsTab({ classGroup, joinCard, onSaved, onArchive }) {
  const { t } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  const [name, setName] = useState(classGroup.name);
  const [description, setDescription] = useState(classGroup.description ?? '');
  const [academicYear, setAcademicYear] = useState(classGroup.academicYear ?? '');
  const [joinCodeEnabled, setJoinCodeEnabled] = useState(classGroup.joinCodeEnabled);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateClassGroup(token, classGroup.id, {
        name: name.trim(),
        description: description.trim() || null,
        academicYear: academicYear.trim() || null,
        joinCodeEnabled,
      });
      onSaved(updated);
      setSaved(true);
    } catch (err) {
      setError(t(`classes.errors.${err?.reason ?? 'generic'}`, { defaultValue: t('classes.errors.generic') }));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <div className="space-y-2">
        <h2 className="font-space text-base font-bold text-nav-ink">{t('classes.joinTitle')}</h2>
        {joinCard}
      </div>
      <div className="space-y-5">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-nav-line bg-white p-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-800">{t('classes.nameLabel')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-800">{t('classes.descriptionLabel')}</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={500}
              className={input}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-800">{t('classes.academicYearLabel')}</span>
            <input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              dir="ltr"
              pattern="\d{4}-\d{4}"
              placeholder={t('classes.academicYearPlaceholder')}
              className={input}
            />
          </label>
          {/* Un seul interrupteur ferme le LIEN et le CODE : les membres restent. */}
          <label className="flex items-start gap-2 text-sm text-slate-800" data-joining-toggle>
            <input
              type="checkbox"
              checked={joinCodeEnabled}
              onChange={(e) => setJoinCodeEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="font-semibold">{t('classes.joiningEnabled')}</span>
              <span className="block text-xs text-slate-500">{t('classes.joiningEnabledHint')}</span>
            </span>
          </label>
          {error && (
            <p role="alert" className="text-sm text-rose-700">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm text-emerald-700">
              {t('common.save')} ✓
            </p>
          )}
          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending ? t('common.saving') : t('common.save')}
          </button>
        </form>
        <div className="rounded-2xl border border-nav-line bg-white p-5 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {classGroup.status === 'archived' ? t('classes.status.archived') : t('classes.archiveConfirmBody')}
          </p>
          <button
            type="button"
            onClick={onArchive}
            className={classGroup.status === 'archived' ? btnSecondary : btnDanger}
          >
            {classGroup.status === 'archived' ? (
              <>
                <ArchiveRestore size={14} /> {t('classes.restore')}
              </>
            ) : (
              <>
                <Archive size={14} /> {t('classes.archive')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
