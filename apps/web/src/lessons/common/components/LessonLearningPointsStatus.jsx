import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { getLessonById, getLessonPath } from '@smarter-academy/core';
import { useLearningProfile } from '../hooks/useLearningProfile';
import { AuthContext } from '../../../context/AuthContext';
import { fetchLessonRecommendations } from '../../../services/learningEvidenceService';
import { getModulePath } from '../../registry';
import { isPracticeActive, practiceHubPath } from '../../../features/practice/practiceCapability';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { buildNextSteps } from '../utils/nextSteps';
import { LearningPointCard, resolveMasteryState } from './LearningPointMastery';

// Des CLÉS, pas des phrases (évaluées avant l'initialisation d'i18next).
const MASTERY_MESSAGE_KEY = {
  unassessed: 'mastery.msgUnassessed',
  gap: 'mastery.msgGap',
  reinforce: 'mastery.msgReinforce',
  mastered: 'mastery.msgMastered',
};

/**
 * « حالتك على الكفاءات » — l'état de maîtrise des points d'UNE leçon, lu
 * dans le profil serveur (`?lesson=`), rendu avec les mêmes cartes que
 * « تقدّمي ». Ce bloc est la seule chose qui a le droit de parler de maîtrise
 * dans le test final : la « نتيجة التحدي » au-dessus est le score d'UNE
 * tentative, celui-ci est l'état calculé de TOUTES les preuves.
 *
 * Les preuves d'un test final partent en arrière-plan (fire-and-forget) :
 * `refreshToken` — un nombre qui change à chaque envoi — relance la lecture
 * après un court délai, et « تحديث » la relance à la main.
 *
 * « ما التالي؟ » (Mastery V2, phase 8a) : sous les cartes, au plus trois
 * suggestions du serveur (`/students/me/lessons/{code}/recommendations`),
 * relues à chaque rechargement du profil. Des liens, jamais un blocage ni
 * une fenêtre modale ; un échec de lecture ne montre simplement rien.
 *
 * Anonyme : rien (la maîtrise est une notion de compte). Le bloc n'est pas
 * rendu pour un lecteur qui ne suit pas sa progression (enseignant) : c'est
 * au parent d'en décider.
 */
export default function LessonLearningPointsStatus({ lessonId, refreshToken = 0, refreshDelayMs = 1500 }) {
  const { t } = useTranslation('lesson');
  const { tracksProgress } = useLearningViewer();
  const { t: ts } = useTranslation('student');
  const { profile, status, reload } = useLearningProfile({ lesson: lessonId });
  const catalogueLesson = getLessonById(lessonId);
  const firstToken = useRef(refreshToken);
  const { token } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);

  // Les recommandations suivent le PROFIL : chaque rechargement (automatique
  // après l'envoi des preuves, ou « تحديث ») les relit.
  useEffect(() => {
    if (!token || !profile || !lessonId) return undefined;
    let cancelled = false;
    fetchLessonRecommendations(token, lessonId)
      .then((recs) => { if (!cancelled) setRecommendations(recs); })
      .catch(() => { if (!cancelled) setRecommendations([]); });
    return () => { cancelled = true; };
  }, [token, profile, lessonId]);

  useEffect(() => {
    if (refreshToken === firstToken.current) return undefined;
    const id = setTimeout(reload, refreshDelayMs);
    return () => clearTimeout(id);
  }, [refreshToken, refreshDelayMs, reload]);

  if (status === 'anonymous') {
    return <p className="text-xs text-slate-500">{t('boss.learningPointsLogin')}</p>;
  }

  const learningPoints = catalogueLesson?.learningPoints ?? [];
  const nextSteps = buildNextSteps(recommendations, {
    modulePath: (n) => getModulePath(lessonId, n),
    // Le catalogue (core) connaît le chemin de toute leçon ; `null` si inconnue.
    lessonPath: (code) => getLessonPath(code),
    // Pas de lien vers la pratique pour qui n'y a pas de route (enseignant, admin).
    practicePath: tracksProgress && isPracticeActive(lessonId) ? practiceHubPath(lessonId) : null,
  });
  const rows = new Map(
    (profile?.currentMastery ?? [])
      .flatMap((g) => (g.lessons ?? []).flatMap((l) => l.learningPoints ?? []))
      .map((row) => [row.code ?? row.learningPointCode, row]),
  );

  return (
    <section className="space-y-3" data-lesson-learning-points-status>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-space font-bold text-slate-800 text-sm">{t('boss.learningPointsStatus')}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{t('boss.learningPointsStatusHint')}</p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3 py-2 min-h-[40px] text-xs font-bold text-slate-700 hover:border-slate-500 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          data-learning-points-refresh
        >
          <RefreshCw className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" />
          {t('boss.learningPointsRefresh')}
        </button>
      </div>

      {status === 'error' && (
        <p className="text-xs text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl p-3">{t('boss.learningPointsError')}</p>
      )}

      {status === 'loading' && !profile && (
        <div className="grid gap-3 grid-cols-2" aria-busy="true" aria-label={t('boss.learningPointsLoading')}>
          {learningPoints.map((lp) => <div key={lp.id} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      )}

      {profile && learningPoints.length > 0 && (
        <div className="grid gap-3 grid-cols-2" aria-busy={status === 'loading'}>
          {learningPoints.map((lp) => {
            const row = rows.get(lp.id);
            const state = resolveMasteryState(row);
            return (
              <LearningPointCard
                key={lp.id}
                title={row?.title || lp.title}
                state={state}
                confidence={row?.confidence}
                message={ts(MASTERY_MESSAGE_KEY[state])}
                row={row}
              />
            );
          })}
        </div>
      )}

      {profile && nextSteps.length > 0 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2" data-lesson-next-steps>
          <h4 className="font-space font-bold text-slate-800 text-sm">{t('boss.whatNext')}</h4>
          <p className="text-xs text-slate-500">{t('boss.whatNextHint')}</p>
          <ul className="space-y-1.5">
            {nextSteps.map((step) => {
              const label = t(step.labelKey, step.params);
              return (
                <li key={step.key} className="flex items-start gap-2 text-sm text-slate-700" data-next-step={step.kind}>
                  <span aria-hidden="true" className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>
                    {step.to
                      ? <Link to={step.to} className="font-bold text-blue-700 hover:text-blue-900 underline underline-offset-2">{label}</Link>
                      : <span className="font-bold">{label}</span>}
                    {step.learningPoint && <span className="text-xs text-slate-500"> — {step.learningPoint}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
