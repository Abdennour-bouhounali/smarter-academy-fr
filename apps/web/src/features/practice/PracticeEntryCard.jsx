import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { ArrowForward } from '../../components/common/DirectionalIcons';
import { AuthContext } from '../../context/AuthContext';
import { practiceHubPath } from './practiceCapability';
import { useLearningViewer } from '../learning/learningViewer';
import { levelCounts } from './practiceCounts';
import { teacherBankPath } from './teacherBank';

/**
 * « Commencer à pratiquer » — le pont entre une leçon et son entraînement.
 *
 * Composant purement présentationnel : il ne va chercher aucune donnée. Il
 * est rendu par LessonIndex, qui sert les 132 leçons du catalogue, donc une
 * erreur ici mettrait à terre toutes les pages d'index. Le compte
 * d'exercices vient de l'index de contenu déjà chargé, pas d'un appel réseau.
 *
 * L'élève anonyme voit le bouton mais ne peut pas l'ouvrir : la pratique
 * enregistre des preuves d'apprentissage, et une preuve appartient à un
 * compte. C'est la même règle que pour le test final, dite ici plutôt que
 * découverte après coup.
 */
export default function PracticeEntryCard({ lessonId }) {
  // Plateforme arabophone : aucun texte français en dur dans cette carte,
  // qui s'affiche sur CHAQUE page de leçon.
  const { t } = useTranslation('student');
  const { token } = useContext(AuthContext);
  const counts = levelCounts(lessonId);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  // La pratique est un espace ÉLÈVE (/espace/pratique, TEACHER_CLASSROOM
  // § 8b) : un enseignant ou un administrateur qui lit la leçon n'y a pas de
  // route — le lien le renvoyait vers /login puis vers son accueil.
  // `tracksProgress` = élève ou visiteur (qui reçoit l'invitation à se connecter).
  const { tracksProgress, isTeacher } = useLearningViewer();

  if (total === 0) return null;

  if (isTeacher) return <TeacherPracticeEntry lessonId={lessonId} total={total} />;

  if (!tracksProgress) return null;

  const levelCount = Object.keys(counts).length;

  return (
    <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-indigo-200 text-nav-accent font-mono text-xs font-semibold">
            <Dumbbell className="w-3.5 h-3.5" aria-hidden="true" /> {t('practice.entryTag')}
          </div>
          <h2 className="text-xl sm:text-2xl font-space font-extrabold text-slate-900">
            {t('practice.entryTitle')}
          </h2>
          <p className="text-sm text-slate-600 max-w-lg">
            {t('practice.entryBody', { total, levels: levelCount })}
          </p>
        </div>

        {token ? (
          <Link
            to={practiceHubPath(lessonId)}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-nav-accent hover:bg-[#3350c4] text-white font-bold min-h-[52px] transition-colors"
          >
            {t('practice.entryStart')} <ArrowForward className="w-4 h-4" aria-hidden="true" />
          </Link>
        ) : (
          <div className="shrink-0 space-y-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-nav-accent hover:bg-[#3350c4] text-white font-bold min-h-[52px] transition-colors"
            >
              {t('practice.entryLogin')}
            </Link>
            <p className="text-xs text-slate-500 max-w-[16rem]">
              {t('practice.entryLoginNote')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * L'ENSEIGNANT a son propre بنك التمارين : parcourir et essayer, sans suivi (/enseignant/pratique).
 * L'administrateur, lui, n'a pas de carte. Composant À PART : `teacher` est un namespace à la demande
 * (BUNDLE_BOUNDARIES.md §3) — seul un enseignant le demande, jamais l'élève qui lit la même leçon.
 */
function TeacherPracticeEntry({ lessonId, total }) {
  const { t } = useTranslation('teacher');
  return (
    <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 sm:p-8" data-teacher-practice-entry>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 min-w-0">
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-space font-extrabold text-slate-900">
            <Dumbbell className="w-5 h-5 text-nav-accent" aria-hidden="true" /> {t('practice.entryTitle')}
          </h2>
          <p className="text-sm text-slate-600 max-w-lg">{t('practice.entryBody', { total })}</p>
        </div>
        <Link
          to={teacherBankPath(lessonId)}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-nav-accent hover:bg-[#3350c4] text-white font-bold min-h-[52px] transition-colors"
        >
          {t('practice.entryOpen')} <ArrowForward className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
