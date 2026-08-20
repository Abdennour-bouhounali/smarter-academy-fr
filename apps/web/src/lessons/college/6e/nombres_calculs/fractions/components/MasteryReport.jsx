import React from 'react';
import { Link } from 'react-router-dom';
import { LearningPointCard, resolveMasteryState, findLessonMasteryRows } from '../../../../../common/components/LearningPointMastery';
import { LESSON_LEARNING_POINTS } from './learningPoints';
import { LESSON_CONFIG, LESSON_BASE_PATH } from '../lesson.config';

const STATE_MESSAGE = {
  unassessed: "Pas encore assez de réponses enregistrées pour évaluer cette compétence.",
  gap: 'Tes réponses montrent une vraie difficulté sur cette compétence.',
  reinforce: 'Tu as des bases, mais ce n’est pas encore solide.',
  mastered: 'Tu démontres une maîtrise solide de cette compétence.',
};

/**
 * 🎯 Mes acquis — one card per Learning Point of this lesson, built entirely
 * from real evidence (`profile.currentMastery`, see useLearningProfile).
 * Never renders a state for a Learning Point the API didn't report.
 *
 * @param {{profile: object|null, status: 'loading'|'anonymous'|'ready'|'error', reload: () => void}} props
 */
export default function MasteryReport({ profile, status, reload }) {
  if (status === 'anonymous') {
    return (
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3">
        <p className="text-sm text-slate-600">
          Connecte-toi pour enregistrer et suivre tes acquis sur cette compétence, leçon après leçon.
        </p>
        <Link
          to="/login"
          className="inline-flex px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  if (status === 'loading') {
    return <div className="text-center text-sm text-slate-400 py-8">Chargement de ton profil…</div>;
  }

  if (status === 'error') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center space-y-2">
        <p className="text-sm text-rose-700">Impossible de récupérer ton profil pour le moment.</p>
        <button type="button" onClick={reload} className="text-xs font-mono font-bold text-rose-700 hover:text-rose-900 underline decoration-dotted">
          Réessayer
        </button>
      </div>
    );
  }

  const rows = findLessonMasteryRows(profile.currentMastery, LESSON_CONFIG.grade, LESSON_CONFIG.id);
  const byCode = new Map(rows.map((r) => [r.code, r]));

  return (
    <div className="space-y-4">
      {LESSON_LEARNING_POINTS.map((lp) => {
        const row = byCode.get(lp.code);
        const state = resolveMasteryState(row);
        const target = `${LESSON_BASE_PATH}/${lp.recommendedSlug}`;

        const action =
          state === 'mastered' ? (
            <Link to={LESSON_BASE_PATH} className="text-xs font-mono font-bold text-emerald-700 hover:text-emerald-900 underline decoration-dotted">
              ✓ Tu peux continuer
            </Link>
          ) : state === 'unassessed' ? (
            <button type="button" onClick={reload} className="text-xs font-mono font-bold text-slate-500 hover:text-slate-700 underline decoration-dotted">
              🔄 Rafraîchir mon profil
            </button>
          ) : (
            <Link to={target} className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 underline decoration-dotted">
              → {state === 'gap' ? 'Je m’entraîne' : 'Refaire une activité'}
            </Link>
          );

        return (
          <LearningPointCard
            key={lp.code}
            title={lp.title}
            state={state}
            confidence={row?.confidence}
            message={STATE_MESSAGE[state]}
            action={action}
          />
        );
      })}
    </div>
  );
}
