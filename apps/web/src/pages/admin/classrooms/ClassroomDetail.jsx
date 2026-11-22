import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import DataTable from '../../../components/admin/ui/DataTable';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchClassroom } from '../../../services/admin/classroomService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { AdminPage, AdminSection, useAdminLabels, Loading, ErrorBox, formatDate, btnSecondary, Num } from '../adminUi';

export default function AdminClassroomDetail() {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  useDocumentMeta(t('classrooms.detailMetaTitle', { id }));
  const L = useAdminLabels();
  const loader = useCallback((tok) => fetchClassroom(tok, id), [id]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);
  const c = data?.classroom;
  const lessons = data?.lessons?.chapters?.flatMap((ch) => ch.lessons.map((l) => ({ ...l, chapterTitle: ch.title }))) ?? [];

  return (
    <AdminPage
      eyebrow={t('classrooms.detailEyebrow')}
      title={c?.name ?? t('classrooms.detailFallbackTitle', { id })}
      subtitle={c ? `${c.grade}${c.academicYear ? ` · ${c.academicYear}` : ''} — ${c.teacher?.name || c.teacher?.email || ''}` : undefined}
      actions={<Link to="/admin/classes" className={btnSecondary}><ArrowBack size={14} /> {t('classrooms.backToList')}</Link>}
    >
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && c && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <dl className="grid grid-cols-2 gap-3 font-inter text-sm lg:grid-cols-5">
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('classrooms.columnTeacher')}</dt><dd className="mt-0.5"><Link to={`/admin/enseignants/${c.teacherId}`} className="text-violet-700 hover:underline">{c.teacher?.name || <span dir="ltr">{c.teacher?.email}</span>}</Link></dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('common.status')}</dt><dd className="mt-0.5"><StatusBadge status={c.status} /></dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('classrooms.joinCode')}</dt><dd className="mt-0.5"><code dir="ltr" className="font-mono-jetbrains">{c.joinCode}</code>{c.joinCodeEnabled ? '' : ` (${t('status.disabled')})`}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('classrooms.activeStudents')}</dt><dd className="mt-0.5"><Num>{c.studentsCount}</Num></dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('classrooms.columnCreated')}</dt><dd className="mt-0.5"><Num>{formatDate(c.createdAt)}</Num></dd></div>
            </dl>
          </section>

          <AdminSection title={t('classrooms.membersSection')}>
            <DataTable rows={data.students} labels={L.table} selectionLabel={(row) => L.selectRow(row.email ?? row.id)} empty={<EmptyState title={t('classrooms.noMembers')} />} columns={[
              { key: 'name', label: t('status.student'), render: (s) => <Link to={`/admin/eleves/${s.id}`} className="font-semibold text-violet-700 hover:underline">{[s.firstName, s.lastName].filter(Boolean).join(' ') || <span dir="ltr">{s.email}</span>}</Link> },
              { key: 'progress', label: t('classrooms.columnProgress'), render: (s) => (s.progressPercent === null ? t('common.dash') : <Num>{`${s.progressPercent} %`}</Num>) },
              { key: 'lessons', label: t('classrooms.columnLessonsDone'), render: (s) => <Num>{s.lessonsCompleted}</Num> },
              { key: 'success', label: t('classrooms.columnSuccessRate'), render: (s) => (s.successRate === null ? t('common.dash') : <Num>{`${s.successRate} %`}</Num>) },
              { key: 'joined', label: t('classrooms.columnJoinedAt'), render: (s) => <Num>{formatDate(s.joinedAt)}</Num> },
            ]} />
          </AdminSection>

          <AdminSection title={t('classrooms.lessonsSection')}>
            <p className="mb-2 font-inter text-xs text-slate-500">{t('classrooms.lessonsHint')}</p>
            <DataTable rows={lessons} labels={L.table} selectionLabel={(row) => L.selectRow(row.title ?? row.id)} empty={<EmptyState title={t('classrooms.noLessons')} />} columns={[
              { key: 'title', label: t('classrooms.columnLesson'), render: (l) => l.title },
              { key: 'chapterTitle', label: t('classrooms.columnDomain'), render: (l) => l.chapterTitle },
              { key: 'publicationStatus', label: t('classrooms.columnPublication'), render: (l) => <StatusBadge status={l.publicationStatus} /> },
              // Le troisième axe : le réglage de l'ENSEIGNANT, distinct de la publication.
              { key: 'classStatus', label: t('classrooms.columnClassStatus'), render: (l) => <StatusBadge status={l.classStatus} label={l.classStatus === 'hidden' ? t('classrooms.hiddenByTeacher') : t('status.visible')} /> },
              { key: 'effective', label: t('classrooms.columnSeenByStudents'), render: (l) => (l.effectiveForStudents ? t('common.yes') : t('common.no')) },
            ]} />
          </AdminSection>

          <AdminSection title={t('classrooms.historySection')}>
            <DataTable rows={data.membershipHistory} rowKey={(m) => `${m.studentId}-${m.status}-${m.joinedAt}`} labels={L.table} selectionLabel={(row) => L.selectRow(row.studentEmail ?? row.studentId)} empty={<EmptyState title={t('classrooms.noHistory')} />} columns={[
              { key: 'student', label: t('status.student'), render: (m) => <span dir="ltr">{m.studentEmail}</span> },
              { key: 'status', label: t('common.status'), render: (m) => <StatusBadge status={m.status} /> },
              { key: 'joinedAt', label: t('classrooms.columnJoined'), render: (m) => <Num>{formatDate(m.joinedAt)}</Num> },
              { key: 'leftAt', label: t('classrooms.columnLeft'), render: (m) => <Num>{formatDate(m.leftAt)}</Num> },
              { key: 'via', label: t('classrooms.columnVia'), render: (m) => m.joinedVia ?? t('common.dash') },
            ]} />
          </AdminSection>
        </div>
      )}
    </AdminPage>
  );
}
