import { useTranslation } from 'react-i18next';
import { CircleCheckBig, TriangleAlert, Database } from 'lucide-react';
import { AdminPage, AdminSection, Loading, ErrorBox, Num } from '../adminUi';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { call, get } from '../../../services/admin/adminClient';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

/**
 * Les clés techniques du diagnostic.
 *
 * Elles viennent du serveur telles quelles (`modulesRetired`, `learningPoints`)
 * et ne se traduisent PAS : elles se traduisent à l'affichage, via
 * `system.registryCounts.*`. Une clé hors vocabulaire retombe sur elle-même
 * plutôt que sur une chaîne vide — mieux vaut un identifiant technique lisible
 * qu'une case blanche.
 */
const COUNT_KEYS = ['lessons', 'modules', 'modulesRetired', 'exercises', 'exercisesRetired', 'learningPoints'];

const fetchHealth = (token) =>
  call('/admin/health', get(token), 'Impossible de charger le diagnostic.').then((d) => d.health);

/**
 * Le diagnostic de cohérence : ce que la base croit, comparé à ce que le
 * contenu déclare.
 *
 * Écran d'ADMINISTRATION uniquement — un élève n'a rien à faire avec des
 * identifiants de registre ou des orphelins.
 */
export default function AdminRegistryHealth() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('system.registryMetaTitle'));
  const { data, loading, error, reload } = useAdminResource(fetchHealth);

  /** Le libellé d'un compteur, ou sa clé serveur si elle sort du vocabulaire. */
  const countLabel = (key) => {
    const path = `system.registryCounts.${key}`;
    const translated = t(path);
    return COUNT_KEYS.includes(key) && translated !== path ? translated : key;
  };

  /** Idem pour un état de publication (`published`, `draft`…). */
  const statusLabel = (status) => {
    const path = `status.${status}`;
    const translated = t(path);
    return translated === path ? status : translated;
  };

  /** Et pour une étape de module (`prerequisite_check`, `evaluation`…). */
  const stageLabel = (stage) => {
    const path = `system.registryStages.${stage}`;
    const translated = t(path);
    return translated === path ? stage : translated;
  };

  return (
    <AdminPage
      eyebrow={t('system.eyebrow')}
      title={t('system.registryTitle')}
      subtitle={t('system.registrySubtitle')}
    >
      {loading && <Loading label={t('system.registryLoading')} />}
      {error && <ErrorBox message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Object.entries(data.counts).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {countLabel(key)}
                </p>
                <p className="mt-1 font-space text-xl font-black tabular-nums text-slate-900">
                  <Num>{value}</Num>
                </p>
              </div>
            ))}
          </section>

          {!data.sourceAvailable && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-inter text-sm text-amber-900">
                {t('system.registryNoSource')}{' '}
                {/* Le nom de la commande artisan est un identifiant : ni traduit,
                    ni retourné. */}
                <code dir="ltr" className="inline-block font-mono-jetbrains text-xs">smarter:import-content-registry</code>
              </p>
            </div>
          )}

          {data.sourceAvailable && (
            <AdminSection title={t('system.registryStructureTitle')} className="space-y-2">
              <Finding
                label={t('system.findingLessonsWithoutSource')}
                items={data.structural.lessonsWithoutSource}
                tone="info"
                hint={t('system.findingLessonsWithoutSourceHint')}
                t={t}
              />
              <Finding label={t('system.findingLessonsWithoutRegistry')} items={data.structural.lessonsWithoutRegistry} tone="warn" t={t} />
              <Finding label={t('system.findingModulesWithoutSource')} items={data.structural.modulesWithoutSource} tone="warn" t={t} />
              <Finding label={t('system.findingModulesWithoutRegistry')} items={data.structural.modulesWithoutRegistry} tone="warn" t={t} />
              <Finding label={t('system.findingExercisesWithoutSource')} items={data.structural.exercisesWithoutSource} tone="warn" t={t} />
              <Finding label={t('system.findingExercisesWithoutRegistry')} items={data.structural.exercisesWithoutRegistry} tone="warn" t={t} />
            </AdminSection>
          )}

          <AdminSection title={t('system.registryPublicationTitle')} className="space-y-2">
            <div className="grid gap-3 sm:grid-cols-3">
              {['lessonsByStatus', 'modulesByStatus', 'exercisesByStatus'].map((key) => (
                <div key={key} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-1 font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {{
                      lessonsByStatus: t('nav.lessons'),
                      modulesByStatus: t('nav.modules'),
                      exercisesByStatus: t('nav.exercises'),
                    }[key]}
                  </p>
                  {Object.entries(data.publication[key]).map(([status, count]) => (
                    <p key={status} className="font-inter text-xs text-slate-700">
                      {statusLabel(status)} <Num className="tabular-nums font-semibold">{count}</Num>
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <Finding
              label={t('system.findingPublishedLessonsNoModule')}
              items={data.publication.publishedLessonsWithNoPublishedModule}
              tone="warn"
              hint={t('system.findingPublishedLessonsNoModuleHint')}
              t={t}
            />
          </AdminSection>

          <AdminSection title={t('system.registryLearningPointsTitle')} className="space-y-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="mb-1 font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('system.modulesWithoutPointByStage')}
              </p>
              {Object.entries(data.learningPoints.modulesWithoutLearningPointsByStage).map(([stage, count]) => (
                <p key={stage} className="font-inter text-xs text-slate-700">
                  {stageLabel(stage)} <Num className="tabular-nums font-semibold">{count}</Num>
                  {(stage === 'prerequisite_check' || stage === 'evaluation') && (
                    <span className="ms-1 text-slate-400">{t('system.stageDoesNotTeach')}</span>
                  )}
                </p>
              ))}
            </div>
            <Finding
              label={t('system.findingTeachingModulesWithoutPoint')}
              items={data.learningPoints.teachingModulesWithoutLearningPoints.map((m) => `${m.code} (${m.stage})`)}
              tone="warn"
              hint={t('system.findingTeachingModulesWithoutPointHint')}
              t={t}
            />
            <Finding
              label={t('system.findingModulesUnknownPoint')}
              items={data.learningPoints.modulesReferencingUnknownLearningPoints.map((m) => `#${m.module} → ${m.code}`)}
              tone="warn"
              t={t}
            />
          </AdminSection>

          <AdminSection title={t('system.registryReportsTitle')} className="space-y-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3 font-inter text-xs text-slate-700">
              <p>{t('system.reportingUnresolved')} <Num className="font-semibold tabular-nums">{data.reporting.unresolved}</Num></p>
              <p>{t('system.reportingHighOrCritical')} <Num className="font-semibold tabular-nums">{data.reporting.highOrCritical}</Num></p>
              <p>{t('system.reportingOrphaned')} <Num className="font-semibold tabular-nums">{data.reporting.orphanedContext}</Num></p>
            </div>
          </AdminSection>
        </div>
      )}
    </AdminPage>
  );
}

/** Un constat. Vide = tout va bien, et on le dit plutôt que de ne rien afficher. */
function Finding({ label, items, tone = 'warn', hint, t }) {
  const list = items ?? [];

  if (list.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-inter text-xs text-emerald-800">
        <CircleCheckBig size={14} /> {t('system.findingNone', { label })}
      </p>
    );
  }

  const styles = tone === 'info'
    ? 'border-slate-200 bg-slate-50 text-slate-700'
    : 'border-amber-200 bg-amber-50 text-amber-900';

  return (
    <div className={`rounded-lg border px-3 py-2 ${styles}`}>
      <p className="flex items-center gap-2 font-inter text-xs font-semibold">
        {tone === 'info' ? <Database size={14} /> : <TriangleAlert size={14} />}
        {t('system.findingCount', { label, count: list.length })}
      </p>
      {hint && <p className="mt-0.5 font-inter text-xs opacity-80">{hint}</p>}
      <ul className="mt-1 space-y-0.5">
        {/* Les identifiants du registre sont techniques : LTR, non traduits. */}
        {list.slice(0, 25).map((item) => (
          <li key={String(item)} dir="ltr" className="font-mono-jetbrains text-xs">{String(item)}</li>
        ))}
        {list.length > 25 && (
          <li className="font-inter text-xs opacity-70">{t('system.andMore', { count: list.length - 25 })}</li>
        )}
      </ul>
    </div>
  );
}
