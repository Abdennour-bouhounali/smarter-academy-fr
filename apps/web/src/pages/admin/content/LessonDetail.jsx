import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Layers, Dumbbell, Target, ExternalLink } from 'lucide-react';
import { getLessonPath } from '@smarter-academy/core';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { AdminPage, AdminSection, useAdminLabels, Num, btnSecondary } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import { LoadingState, ErrorState, EmptyState } from '../../../components/admin/ui/states';
import PublicationControl from '../../../components/admin/PublicationControl';
import ExerciseBankControl from '../../../components/admin/ExerciseBankControl';
import TierControl from '../../../components/admin/TierControl';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchLesson } from '../../../services/admin/contentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

export default function AdminLessonDetail() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  const { code } = useParams();
  useDocumentMeta(t('lessons.detailMetaTitle', { code }));

  const loader = useCallback((token) => fetchLesson(token, code), [code]);
  const { data: lesson, loading, error, reload, setData } = useAdminResource(loader, [loader]);

  /** Le libellé arabe d'une étape, ou la clé brute si l'API en invente une. */
  const stageLabel = (key) => {
    if (!key) return t('common.dash');
    const translated = t(`modules.stage.${key}`);
    return translated === `modules.stage.${key}` ? key : translated;
  };

  const patch = (collection, id, changes) => {
    setData((current) => current && ({
      ...current,
      [collection]: current[collection].map((row) => (row.id === id ? { ...row, ...changes } : row)),
    }));
  };

  return (
    <AdminPage
      eyebrow={t('lessons.detailEyebrow')}
      title={lesson?.title ?? code}
      subtitle={lesson ? `${lesson.gradeName ?? lesson.grade ?? ''} · ${lesson.chapterTitle ?? ''}` : undefined}
      actions={(
        <div className="flex flex-wrap gap-2">
          {/* « Ouvrir la leçon » (spec §9) : l'administrateur relit tout,
              brouillon et masqué compris (ContentAccess::bypassesPublication). */}
          {getLessonPath(code) && (
            <Link to={getLessonPath(code)} className={btnSecondary} data-open-lesson>
              <ExternalLink size={14} /> {t('lessons.openLesson')}
            </Link>
          )}
          <Link to="/admin/contenu/lecons" className={btnSecondary}>
            {/* Flèche DIRECTIONNELLE : elle pointe vers l'arrière, donc elle
                se retourne en RTL. Voir DirectionalIcons. */}
            <ArrowBack size={14} /> {t('lessons.backToAll')}
          </Link>
        </div>
      )}
    >
      {loading && <LoadingState label={t('lessons.loadingLesson')} />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {lesson && (
        <div className="space-y-8">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                {/* Le code de la leçon est un identifiant technique : latin, LTR. */}
                <p dir="ltr" className="font-mono-jetbrains text-xs text-slate-400 text-start">{lesson.code}</p>
                <p className="font-inter text-sm text-slate-600">{lesson.description}</p>
                <p className="font-inter text-xs text-slate-500">
                  {t('lessons.moduleCount', { count: lesson.modulesCount ?? lesson.modules?.length ?? 0 })}
                  {' · '}
                  {t('lessons.exerciseCount', { count: lesson.exercisesCount ?? lesson.exercises?.length ?? 0 })}
                </p>
              </div>
              {/* Les deux dimensions côte à côte, et étiquetées : sans
                  étiquette, deux menus « Changer… » voisins ne disent pas
                  lequel vend et lequel publie. */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-1">
                  <p className="font-inter text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {t('lessons.tierLabel')}
                  </p>
                  <TierControl
                    type="lesson"
                    id={lesson.id}
                    tier={lesson.tier}
                    onChanged={(next) => setData((current) => ({ ...current, tier: next }))}
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-inter text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {t('lessons.publicationLabel')}
                  </p>
                  <PublicationControl
                    type="lesson"
                    id={lesson.id}
                    status={lesson.publicationStatus}
                    // La cascade a pu changer chaque étape : on relit la leçon
                    // plutôt que de deviner l'état de chacun.
                    onChanged={() => reload()}
                  />
                </div>
              </div>
            </div>
          </section>

          <AdminSection
            title={(
              <span className="inline-flex items-center gap-2">
                <Layers size={17} /> {t('modules.title')}
              </span>
            )}
          >
            <DataTable
              rows={lesson.modules ?? []}
              labels={L.table}
              empty={(
                <EmptyState
                  icon={Layers}
                  title={t('lessons.noModulesTitle')}
                  hint={t('lessons.noModulesHint')}
                />
              )}
              columns={[
                {
                  key: 'number',
                  label: t('lessons.columnNumber'),
                  render: (m) => <Num className="font-mono-jetbrains">{String(m.number).padStart(2, '0')}</Num>,
                },
                { key: 'title', label: t('lessons.columnTitle'), render: (m) => <span className="font-semibold text-slate-800">{m.title}</span> },
                { key: 'stage', label: t('modules.columnStage'), render: (m) => stageLabel(m.stage) },
                {
                  key: 'estimatedMin',
                  label: t('modules.columnDuration'),
                  render: (m) => (m.estimatedMin
                    ? <Num>{t('modules.minutes', { count: m.estimatedMin })}</Num>
                    : t('common.dash')),
                },
                {
                  key: 'learningPoints',
                  label: t('lessons.columnTaughtPoints'),
                  render: (m) => (m.teachesLearningPointCodes?.length
                    ? <Num className="font-mono-jetbrains text-xs text-slate-500">{m.teachesLearningPointCodes.length}</Num>
                    : <span className="text-slate-400">{t('common.dash')}</span>),
                },
              ]}
            />
          </AdminSection>

          <AdminSection
            title={(
              <span className="inline-flex items-center gap-2">
                <Dumbbell size={17} /> {t('exercises.title')}
              </span>
            )}
            actions={<ExerciseBankControl lesson={lesson} onChanged={() => reload()} />}
          >
            <DataTable
              rows={lesson.exercises ?? []}
              labels={L.table}
              empty={(
                <EmptyState
                  icon={Dumbbell}
                  title={t('lessons.noExercisesTitle')}
                  hint={t('exercises.emptyEngineHint')}
                />
              )}
              columns={[
                {
                  key: 'exerciseCode',
                  label: t('lessons.columnCode'),
                  render: (e) => <span dir="ltr" className="inline-block font-mono-jetbrains text-xs">{e.exerciseCode}</span>,
                },
                { key: 'level', label: t('exercises.columnLevel'), render: (e) => <Num>{e.level}</Num> },
                { key: 'title', label: t('lessons.columnTitle'), render: (e) => e.title ?? t('common.dash') },
                {
                  key: 'questionCount',
                  label: t('exercises.columnQuestions'),
                  render: (e) => (e.questionCount != null ? <Num>{e.questionCount}</Num> : t('common.dash')),
                },
                {
                  key: 'tier',
                  label: t('lessons.columnTier'),
                  cellClassName: 'min-w-[210px]',
                  render: (e) => (
                    <TierControl
                      type="exercise"
                      id={e.id}
                      tier={e.tier}
                      lessonTier={lesson.tier}
                      onChanged={(next) => patch('exercises', e.id, { tier: next })}
                      compact
                    />
                  ),
                },
                {
                  key: 'publicationStatus',
                  label: t('lessons.columnPublication'),
                  render: (e) => (
                    <PublicationControl
                      type="exercise" id={e.id} status={e.publicationStatus}
                      onChanged={(next) => patch('exercises', e.id, { publicationStatus: next })} compact
                    />
                  ),
                },
              ]}
            />
          </AdminSection>

          <AdminSection
            title={(
              <span className="inline-flex items-center gap-2">
                <Target size={17} /> {t('lessons.learningPointsTitle')}
              </span>
            )}
          >
            <DataTable
              rows={lesson.learningPoints ?? []}
              labels={L.table}
              empty={<EmptyState icon={Target} title={t('lessons.noLearningPointsTitle')} />}
              columns={[
                { key: 'order', label: t('lessons.columnNumber'), render: (lp) => <Num>{lp.order}</Num> },
                {
                  key: 'code',
                  label: t('lessons.columnCode'),
                  render: (lp) => <span dir="ltr" className="inline-block font-mono-jetbrains text-xs">{lp.code}</span>,
                },
                { key: 'title', label: t('lessons.columnHeading'), render: (lp) => lp.title },
              ]}
            />
          </AdminSection>
        </div>
      )}
    </AdminPage>
  );
}
