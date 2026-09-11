import React, { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Layers, Dumbbell, Target } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../../components/admin/ui/states';
import PublicationControl from '../../../components/admin/PublicationControl';
import TierControl from '../../../components/admin/TierControl';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchLesson } from '../../../services/admin/contentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

const STAGE_LABELS = {
  prerequisite_check: 'Vérification des acquis',
  trigger: 'Déclencheur',
  discovery: 'Découverte',
  manipulation: 'Manipulation',
  formalization: 'Formalisation',
  practice_lab: 'Entraînement',
  evaluation: 'Évaluation',
};

export default function AdminLessonDetail() {
  const { code } = useParams();
  useDocumentMeta(`Leçon ${code} — Administration`);

  const loader = useCallback((token) => fetchLesson(token, code), [code]);
  const { data: lesson, loading, error, reload, setData } = useAdminResource(loader, [loader]);

  const patch = (collection, id, changes) => {
    setData((current) => current && ({
      ...current,
      [collection]: current[collection].map((row) => (row.id === id ? { ...row, ...changes } : row)),
    }));
  };

  return (
    <AdminPage
      eyebrow="Contenu"
      title={lesson?.title ?? code}
      subtitle={lesson ? `${lesson.gradeName ?? lesson.grade ?? ''} · ${lesson.chapterTitle ?? ''}` : undefined}
      actions={(
        <Link
          to="/admin/contenu/lecons"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 font-inter text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Toutes les leçons
        </Link>
      )}
    >
      {loading && <LoadingState label="Chargement de la leçon…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {lesson && (
        <div className="space-y-8">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-mono-jetbrains text-xs text-slate-400">{lesson.code}</p>
                <p className="font-inter text-sm text-slate-600">{lesson.description}</p>
                <p className="font-inter text-xs text-slate-500">
                  {lesson.modulesCount ?? lesson.modules?.length} module(s) ·{' '}
                  {lesson.exercisesCount ?? lesson.exercises?.length} exercice(s)
                </p>
              </div>
              {/* Les deux dimensions côte à côte, et étiquetées : sans
                  étiquette, deux menus « Changer… » voisins ne disent pas
                  lequel vend et lequel publie. */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-1">
                  <p className="font-inter text-[11px] font-semibold uppercase tracking-wide text-slate-400">Accès</p>
                  <TierControl
                    type="lesson"
                    id={lesson.id}
                    tier={lesson.tier}
                    onChanged={(next) => setData((current) => ({ ...current, tier: next }))}
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-inter text-[11px] font-semibold uppercase tracking-wide text-slate-400">Publication</p>
                  <PublicationControl
                    type="lesson"
                    id={lesson.id}
                    status={lesson.publicationStatus}
                    onChanged={(next) => setData((current) => ({ ...current, publicationStatus: next }))}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 font-space text-lg font-bold text-slate-900">
              <Layers size={17} /> Modules
            </h2>
            <DataTable
              rows={lesson.modules ?? []}
              empty={<EmptyState icon={Layers} title="Aucun module enregistré" hint="Lancez « php artisan smarter:import-content-registry » pour synchroniser le registre." />}
              columns={[
                { key: 'number', label: 'N°', render: (m) => <span className="font-mono-jetbrains">{String(m.number).padStart(2, '0')}</span> },
                { key: 'title', label: 'Titre', render: (m) => <span className="font-semibold text-slate-800">{m.title}</span> },
                { key: 'stage', label: 'Étape', render: (m) => STAGE_LABELS[m.stage] ?? m.stage ?? '—' },
                { key: 'estimatedMin', label: 'Durée', render: (m) => (m.estimatedMin ? `${m.estimatedMin} min` : '—') },
                {
                  key: 'learningPoints',
                  label: 'Points enseignés',
                  render: (m) => (m.teachesLearningPointCodes?.length
                    ? <span className="font-mono-jetbrains text-xs text-slate-500">{m.teachesLearningPointCodes.length}</span>
                    : <span className="text-slate-400">—</span>),
                },
                {
                  key: 'publicationStatus',
                  label: 'Publication',
                  render: (m) => (
                    <PublicationControl
                      type="module" id={m.id} status={m.publicationStatus}
                      onChanged={(next) => patch('modules', m.id, { publicationStatus: next })} compact
                    />
                  ),
                },
              ]}
            />
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 font-space text-lg font-bold text-slate-900">
              <Dumbbell size={17} /> Exercices
            </h2>
            <DataTable
              rows={lesson.exercises ?? []}
              empty={(
                <EmptyState
                  icon={Dumbbell}
                  title="Aucun exercice pour cette leçon"
                  hint="Le moteur d’exercices s’active leçon par leçon (content/practice/active.json). Ce n’est pas une erreur."
                />
              )}
              columns={[
                { key: 'exerciseCode', label: 'Identifiant', render: (e) => <span className="font-mono-jetbrains text-xs">{e.exerciseCode}</span> },
                { key: 'level', label: 'Niveau', render: (e) => e.level },
                { key: 'title', label: 'Titre', render: (e) => e.title ?? '—' },
                { key: 'questionCount', label: 'Questions', render: (e) => e.questionCount },
                {
                  key: 'tier',
                  label: 'Accès',
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
                  label: 'Publication',
                  render: (e) => (
                    <PublicationControl
                      type="exercise" id={e.id} status={e.publicationStatus}
                      onChanged={(next) => patch('exercises', e.id, { publicationStatus: next })} compact
                    />
                  ),
                },
              ]}
            />
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 font-space text-lg font-bold text-slate-900">
              <Target size={17} /> Points d’apprentissage
            </h2>
            <DataTable
              rows={lesson.learningPoints ?? []}
              empty={<EmptyState icon={Target} title="Aucun point d’apprentissage" />}
              columns={[
                { key: 'order', label: 'N°', render: (lp) => lp.order },
                { key: 'code', label: 'Code', render: (lp) => <span className="font-mono-jetbrains text-xs">{lp.code}</span> },
                { key: 'title', label: 'Intitulé', render: (lp) => lp.title },
              ]}
            />
          </section>
        </div>
      )}
    </AdminPage>
  );
}
