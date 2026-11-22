import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion, MotionConfig } from 'framer-motion';
import { TrendingUp, BookOpen, GraduationCap, SearchX } from 'lucide-react';
import { courseLevels, getAllGrades } from '@smarter-academy/core';
import { getStudentActivity } from '../../lessons/common/utils/progress/getStudentActivity';
import { getFirstModuleNumber } from '../../lessons/registry';
import { getResumeModulePath } from '../../lessons/common/utils/progress/getResumeLesson';
import { LESSON_PROGRESS_SYNCED_EVENT } from '../../hooks/useLessonProgressSync';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useLearningProfile } from '../../lessons/common/hooks/useLearningProfile';
import { buildProgressionTree } from '../../features/progression/buildProgressionTree';
import { applyProgressionView, DEFAULT_VIEW } from '../../features/progression/progressionView';
import { pickWorkNow, pickNextStep } from '../../features/progression/pickWorkNow';
import ProgressionStats from '../../features/progression/components/ProgressionStats';
import WorkNowSection from '../../features/progression/components/WorkNowSection';
import ProgressionToolbar from '../../features/progression/components/ProgressionToolbar';
import FieldProgressGroup from '../../features/progression/components/FieldProgressGroup';
import ProgressionEmptyState from '../../features/progression/components/ProgressionEmptyState';
import NoLessonYet from '../../components/student/NoLessonYet';
import MasteryExplanationDrawer from '../../features/progression/components/MasteryExplanationDrawer';

/**
 * « تقدّمي » — le tableau de bord de PROGRESSION de l'élève, dans l'ordre
 * de ses questions :
 *
 *   où en suis-je ?            → en-tête + indicateurs
 *   que dois-je faire là ?     → « للعمل الآن »
 *   où suis-je dans le programme ? → الميدان → الوحدة → الدرس → الكفاءات
 *
 * La page n'invente rien : la structure vient du catalogue, la progression
 * de getStudentActivity, la maîtrise du profil serveur (useLearningProfile).
 * Elle ne parle QUE de progression — les notes ont leur espace (« كرّاسي »),
 * la carte des connaissances le sien.
 */
export default function Progression() {
  const { t } = useTranslation('student');
  useDocumentMeta(t('progression.metaTitle'), t('progression.metaDescription'));

  const { user } = useContext(AuthContext);
  const gradeId = user?.grade || null;

  // Cette page ne montre QUE la classe courante de l'élève — le même cadrage
  // que l'accueil de l'espace, qui appelle déjà `getStudentActivity` avec
  // `gradeId`. Ce n'est PAS la restriction contre laquelle met en garde
  // ARCHITECTURE.md §10 (qui vise `getResumeLesson`, ce qu'on PROPOSE, pas ce
  // qu'un tableau de bord AFFICHE). La progression reste indexée par leçon :
  // changer de classe ne supprime rien. Un élève sans classe voit tout.
  //
  // L'activité est lue dans le stockage local au montage. Deux moments
  // peuvent la rendre obsolète sans changer `gradeId` : la fusion des lignes
  // du serveur (useLessonProgressSync, juste après le montage) et le retour
  // sur l'onglet après avoir travaillé une leçon — le même réflexe que
  // l'accueil de l'espace. `tick` force alors le recalcul.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(LESSON_PROGRESS_SYNCED_EVENT, bump);
    window.addEventListener('focus', bump);
    return () => {
      window.removeEventListener(LESSON_PROGRESS_SYNCED_EVENT, bump);
      window.removeEventListener('focus', bump);
    };
  }, []);
  const activity = useMemo(
    () => getStudentActivity(courseLevels, gradeId ? { gradeId } : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gradeId, tick],
  );
  const gradeLabel = useMemo(
    () => getAllGrades().find((g) => g.id === gradeId)?.name || null,
    [gradeId],
  );
  const { profile, status, reload } = useLearningProfile();
  // La maîtrise vient de l'API groupée par classe : on ne garde que la
  // sienne, sinon le compteur « compétences maîtrisées » compterait des
  // acquis invisibles sur cette page.
  const currentMastery = useMemo(() => {
    const all = profile?.currentMastery || [];
    return gradeId ? all.filter((g) => g.grade === gradeId) : all;
  }, [profile, gradeId]);

  // L'arbre complet (structure + progression + maîtrise), calculé une fois
  // par changement de données ; la vue (recherche/filtres/tri) est une
  // projection pure par-dessus, recalculée sans retoucher l'arbre.
  const tree = useMemo(
    () => buildProgressionTree(courseLevels, activity, currentMastery, { gradeId, getModulePath: getResumeModulePath, getFirstModuleNumber }),
    [activity, currentMastery, gradeId],
  );
  const [view, setView] = useState(DEFAULT_VIEW);
  const shown = useMemo(() => applyProgressionView(tree, view), [tree, view]);
  const workNow = useMemo(() => pickWorkNow(tree, { limit: 4 }), [tree]);
  const nextStep = useMemo(() => pickNextStep(tree), [tree]);

  const hasStarted = activity.lessons.some((l) => l.lastVisitedAt > 0);
  // His grade has no published lesson yet: an honest « no lesson yet », not an invitation to start one.
  const gradeEntry = gradeId ? getAllGrades().find((g) => g.id === gradeId) : null;
  const noLessonYet = gradeEntry?.lessonCount === 0;
  // Its lessons are announced (coming soon) though none is published: the programme below shows them unit by unit.
  const lessonsAnnounced = noLessonYet && gradeEntry.catalogueLessonCount > 0;
  const multiGrade = tree.grades.length > 1;

  // Le ميدان ouvert par défaut : celui du dernier travail, sinon le premier
  // qui a des leçons construites.
  const defaultFieldId = useMemo(() => {
    const fields = tree.grades.flatMap((g) => g.fields);
    const recent = fields.filter((f) => f.agg.lastVisitedAt > 0).sort((a, b) => b.agg.lastVisitedAt - a.agg.lastVisitedAt)[0];
    return recent?.id ?? fields.find((f) => f.agg.lessons > 0)?.id ?? null;
  }, [tree]);

  // Le point dont l'élève demande « لماذا؟ » — `{code, title}` ou null.
  const [explaining, setExplaining] = useState(null);
  const closeExplaining = useCallback(() => setExplaining(null), []);

  const curriculumRef = useRef(null);
  const showAllWork = useCallback(() => {
    setView((v) => ({ ...DEFAULT_VIEW, sort: v.sort, filter: 'work' }));
    curriculumRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const filterFields = useMemo(
    () => tree.grades.flatMap((g) => g.fields).filter((f) => f.agg.lessons > 0).map((f) => ({ id: f.id, title: f.title, groups: f.groups.map((gr) => ({ id: gr.id, title: gr.title, kind: gr.kind })) })),
    [tree],
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="sa-page py-8 sm:py-10" aria-busy={status === 'loading'} data-progression-page>
        {/* ── En-tête ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5">
            <TrendingUp size={13} aria-hidden="true" /> {t('progression.eyebrow')}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">{t('progression.title')}</h1>
              <p className="font-inter text-slate-500 text-sm mt-1 max-w-xl">
                {/* Le cadre est annoncé : sans cela, un élève qui a travaillé dans
                    une autre classe croirait ce travail perdu. */}
                {gradeLabel
                  ? <Trans i18nKey="progression.subtitleWithGrade" ns="student" values={{ grade: gradeLabel }} components={[<strong key="g" />]} />
                  : t('progression.subtitleLead')}
              </p>
            </div>
            {gradeLabel && (
              <span className="inline-flex items-center gap-2 self-start sm:self-auto rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-inter text-slate-700" data-progression-grade>
                <GraduationCap size={16} className="text-blue-500" aria-hidden="true" />
                <span className="text-xs text-slate-400">{t('progression.gradeChip')}</span>
                <strong className="font-space">{gradeLabel}</strong>
              </span>
            )}
          </div>
        </div>

        {/* ── Erreur de chargement du profil : jamais confondue avec un zéro ── */}
        {status === 'error' && (
          <div role="alert" className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 mb-6 flex items-center justify-between gap-3 flex-wrap" data-progression-error>
            <div>
              <p className="font-space font-bold text-rose-900 text-sm">{t('progression.errorTitle')}</p>
              <p className="font-inter text-rose-900/80 text-xs mt-0.5 max-w-xl">{t('progression.errorAcquis')}</p>
            </div>
            <button
              type="button"
              onClick={reload}
              className="min-h-[44px] px-4 rounded-xl border-2 border-rose-200 bg-white text-xs font-mono-jetbrains font-bold text-rose-800 hover:border-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              🔄 {t('retry', { ns: 'common' })}
            </button>
          </div>
        )}

        {/* ── Vue d'ensemble ─────────────────────────────────────────── */}
        {hasStarted ? (
          <>
            <div className="mb-10" data-tour="progression.stats">
              <ProgressionStats activity={activity} agg={tree.agg} profileStatus={status} gradeLabel={gradeLabel} />
            </div>
            <WorkNowSection
              items={workNow.items}
              total={workNow.total}
              nextStep={nextStep}
              unassessedCount={tree.agg.counts.unassessed}
              profileStatus={status}
              onShowAll={showAllWork}
            />
          </>
        ) : noLessonYet ? (
          <div className="mb-10">
            <NoLessonYet announced={lessonsAnnounced} />
          </div>
        ) : (
          <ProgressionEmptyState />
        )}

        {/* ── Le programme ───────────────────────────────────────────── */}
        <section ref={curriculumRef} aria-labelledby="curriculum-title" className="scroll-mt-6" data-progression-curriculum>
          <div className="mb-4">
            <h2 id="curriculum-title" className="font-space font-bold text-slate-900 text-lg flex items-center gap-2">
              <BookOpen size={18} className="text-blue-500" aria-hidden="true" /> {t('progression.curriculum.title')}
            </h2>
            <p className="font-inter text-slate-500 text-xs mt-0.5">{t('progression.curriculum.subtitle')}</p>
          </div>

          {tree.lessonCount > 0 && (
            <div className="mb-5">
              <ProgressionToolbar view={view} onChange={setView} fields={filterFields} matched={shown.matched} total={shown.total} />
            </div>
          )}

          {shown.grades.length === 0 ? (
            <div className="glass-card p-8 text-center" data-progression-no-match>
              <SearchX size={26} className="mx-auto text-slate-300 mb-3" aria-hidden="true" />
              <p className="font-space font-bold text-slate-800 text-sm">
                {tree.lessonCount === 0
                  ? (gradeLabel ? t('progression.noLessonsStartedGrade', { grade: gradeLabel }) : t('progression.noLessonsStarted'))
                  : t('progression.curriculum.noMatchTitle')}
              </p>
              {tree.lessonCount > 0 && <p className="font-inter text-slate-500 text-xs mt-1">{t('progression.curriculum.noMatchBody')}</p>}
            </div>
          ) : (
            <div className="space-y-8">
              {shown.grades.map((grade) => (
                <motion.div key={grade.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  {multiGrade && <h3 className="font-space font-bold text-slate-700 text-sm mb-3">{grade.label}</h3>}
                  <div className="space-y-4">
                    {grade.fields.map((field) => (
                      <FieldProgressGroup
                        key={field.id}
                        field={field}
                        defaultOpen={field.id === defaultFieldId}
                        profileStatus={status}
                        onExplain={setExplaining}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 text-xs text-slate-400 font-inter max-w-xl">
          {t('progression.footnote')}
        </p>

        {/* « لماذا؟ » — le tiroir d'explication d'un point (plan §18). */}
        <MasteryExplanationDrawer
          open={explaining !== null}
          code={explaining?.code ?? null}
          title={explaining?.title ?? ''}
          onClose={closeExplaining}
        />
      </div>
    </MotionConfig>
  );
}
