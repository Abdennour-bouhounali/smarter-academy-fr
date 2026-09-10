import React from 'react';
import { Link } from 'react-router-dom';
import { CircleCheckBig, TriangleAlert, Database } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import { LoadingState, ErrorState, EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { call, get } from '../../../services/admin/adminClient';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

/** Les clés techniques du diagnostic, en français lisible. */
const COUNT_LABELS = {
  lessons: 'Leçons',
  modules: 'Modules actifs',
  modulesRetired: 'Modules retirés',
  exercises: 'Exercices actifs',
  exercisesRetired: 'Exercices retirés',
  learningPoints: 'Points d’apprentissage',
};

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
  useDocumentMeta('Cohérence du registre — Administration');
  const { data, loading, error, reload } = useAdminResource(fetchHealth);

  return (
    <AdminPage
      eyebrow="Système"
      title="Cohérence du registre"
      subtitle="Ce que la base connaît, comparé à ce que le contenu déclare. Déterministe, sans interprétation."
    >
      {loading && <LoadingState label="Analyse du registre…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Object.entries(data.counts).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {COUNT_LABELS[key] ?? key}
                </p>
                <p className="mt-1 font-space text-xl font-black tabular-nums text-slate-900">{value}</p>
              </div>
            ))}
          </section>

          {!data.sourceAvailable && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-inter text-sm text-amber-900">
                L’export du contenu est introuvable : les contrôles source ↔ base sont ignorés.
                Lancez <code className="font-mono-jetbrains text-xs">smarter:import-content-registry</code>.
              </p>
            </div>
          )}

          {data.sourceAvailable && (
            <Section title="Structure">
              <Finding
                label="Leçons en base sans source"
                items={data.structural.lessonsWithoutSource}
                tone="info"
                hint="Normal pour une leçon annoncée au programme mais pas encore écrite."
              />
              <Finding label="Leçons source absentes du registre" items={data.structural.lessonsWithoutRegistry} tone="warn" />
              <Finding label="Modules en base sans source" items={data.structural.modulesWithoutSource} tone="warn" />
              <Finding label="Modules source absents du registre" items={data.structural.modulesWithoutRegistry} tone="warn" />
              <Finding label="Exercices en base sans source" items={data.structural.exercisesWithoutSource} tone="warn" />
              <Finding label="Exercices source absents du registre" items={data.structural.exercisesWithoutRegistry} tone="warn" />
            </Section>
          )}

          <Section title="Publication">
            <div className="grid gap-3 sm:grid-cols-3">
              {['lessonsByStatus', 'modulesByStatus', 'exercisesByStatus'].map((key) => (
                <div key={key} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-1 font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {{ lessonsByStatus: 'Leçons', modulesByStatus: 'Modules', exercisesByStatus: 'Exercices' }[key]}
                  </p>
                  {Object.entries(data.publication[key]).map(([status, count]) => (
                    <p key={status} className="font-inter text-xs text-slate-700">
                      {status} <span className="tabular-nums font-semibold">{count}</span>
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <Finding
              label="Leçons publiées dont AUCUN module n’est publié"
              items={data.publication.publishedLessonsWithNoPublishedModule}
              tone="warn"
              hint="L’élève ouvre la leçon et ne trouve rien."
            />
          </Section>

          <Section title="Points d’apprentissage">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="mb-1 font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">
                Modules sans point déclaré, par étape
              </p>
              {Object.entries(data.learningPoints.modulesWithoutLearningPointsByStage).map(([stage, count]) => (
                <p key={stage} className="font-inter text-xs text-slate-700">
                  {stage} <span className="tabular-nums font-semibold">{count}</span>
                  {(stage === 'prerequisite_check' || stage === 'evaluation') && (
                    <span className="ml-1 text-slate-400">— attendu, ces étapes n’enseignent pas</span>
                  )}
                </p>
              ))}
            </div>
            <Finding
              label="Modules qui ENSEIGNENT sans point déclaré"
              items={data.learningPoints.teachingModulesWithoutLearningPoints.map((m) => `${m.code} (${m.stage})`)}
              tone="warn"
              hint="Métadonnée manquante : le module enseigne, mais ne dit pas quoi."
            />
            <Finding
              label="Modules référençant un point inconnu"
              items={data.learningPoints.modulesReferencingUnknownLearningPoints.map((m) => `module #${m.module} → ${m.code}`)}
              tone="warn"
            />
          </Section>

          <Section title="Signalements">
            <div className="rounded-xl border border-slate-200 bg-white p-3 font-inter text-xs text-slate-700">
              <p>Non traités : <span className="font-semibold tabular-nums">{data.reporting.unresolved}</span></p>
              <p>Prioritaires en attente : <span className="font-semibold tabular-nums">{data.reporting.highOrCritical}</span></p>
              <p>Contexte orphelin : <span className="font-semibold tabular-nums">{data.reporting.orphanedContext}</span></p>
            </div>
          </Section>
        </div>
      )}
    </AdminPage>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="font-space text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

/** Un constat. Vide = tout va bien, et on le dit plutôt que de ne rien afficher. */
function Finding({ label, items, tone = 'warn', hint }) {
  const list = items ?? [];

  if (list.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-inter text-xs text-emerald-800">
        <CircleCheckBig size={14} /> {label} : aucun
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
        {label} : {list.length}
      </p>
      {hint && <p className="mt-0.5 font-inter text-xs opacity-80">{hint}</p>}
      <ul className="mt-1 space-y-0.5">
        {list.slice(0, 25).map((item) => (
          <li key={String(item)} className="font-mono-jetbrains text-xs">{String(item)}</li>
        ))}
        {list.length > 25 && <li className="font-inter text-xs opacity-70">…et {list.length - 25} de plus</li>}
      </ul>
    </div>
  );
}
