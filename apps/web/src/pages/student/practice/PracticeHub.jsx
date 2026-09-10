import { useContext, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Dumbbell } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchPracticeOverview, startPracticeSession } from '../../../services/practiceService';
import LevelSelector from '../../../features/practice/LevelSelector';
import { MASTERY_STATES, resolveMasteryState } from '../../../lessons/common/components/LearningPointMastery';
import { getLessonPath } from '@smarter-academy/core';

// Les tons de MASTERY_STATES sont des NOMS de couleur, pas des classes :
// la table de correspondance est privée à LearningPointMastery, on la refait
// ici pour la mise en page compacte du Hub.
const TONE = {
  slate: 'border-slate-200 bg-slate-50',
  rose: 'border-rose-200 bg-rose-50',
  amber: 'border-amber-200 bg-amber-50',
  emerald: 'border-emerald-200 bg-emerald-50',
};

/**
 * Le Hub de pratique d'une leçon : les niveaux, et l'état des connaissances
 * qu'ils travaillent.
 *
 * Rien de ludique ici — pas de pièces, pas de classement. La récompense
 * affichée est la seule qui compte : voir un point d'apprentissage passer de
 * « à renforcer » à « maîtrisé ».
 */
export default function PracticeHub() {
  const { lessonCode } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);
  const [busyLevel, setBusyLevel] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    setError(null);
    fetchPracticeOverview(token, lessonCode)
      .then((data) => !cancelled && setOverview(data))
      .catch((e) => !cancelled && setError(e.message));

    return () => { cancelled = true; };
  }, [token, lessonCode]);

  const start = useCallback(async (level) => {
    setBusyLevel(level);
    setError(null);
    try {
      const sessionId = crypto.randomUUID();
      await startPracticeSession(token, lessonCode, sessionId, level);
      navigate(`/espace/pratique/${lessonCode}/session/${sessionId}`);
    } catch (e) {
      setError(e.message);
      setBusyLevel(null);
    }
  }, [token, lessonCode, navigate]);

  if (error && !overview) {
    return (
      <div className="sa-page py-8 sm:py-10 space-y-8">
        <p className="text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl p-4">{error}</p>
        <Link to="/espace/cours" className="text-sm font-bold text-slate-600 hover:text-slate-900">
          ← Retour à mes cours
        </Link>
      </div>
    );
  }

  if (!overview) {
    return <div className="sa-page py-8 sm:py-10 space-y-8"><div className="h-64 rounded-2xl bg-slate-100 animate-pulse" /></div>;
  }

  const { lesson, levels, recommendedLevel, learningPoints, openSession } = overview;
  // L'API de pratique ne renvoie que le code de la leçon ; le chemin de son
  // cours vient du catalogue, seule source de vérité des URLs de leçon.
  const lessonPath = getLessonPath(lessonCode);

  return (
    <div className="sa-page py-8 sm:py-10 space-y-8">
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-slate-500" aria-label="Fil d'Ariane">
        <Link to="/espace/cours" className="hover:text-blue-600 inline-flex items-center gap-1 whitespace-nowrap">
          <ArrowLeft className="w-3 h-3" aria-hidden="true" /> Mes cours
        </Link>
        {lessonPath && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={lessonPath} className="hover:text-blue-600 whitespace-nowrap">
              {lesson.title}
            </Link>
          </>
        )}
      </nav>

      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-xs font-semibold">
          <Dumbbell className="w-3.5 h-3.5" aria-hidden="true" /> Pratique
        </div>
        <h1 className="text-2xl sm:text-3xl font-space font-extrabold text-slate-900">{lesson.title}</h1>
        <p className="text-sm text-slate-600">
          Choisis un niveau. Tu peux revenir sur un niveau déjà terminé autant de fois que tu veux.
        </p>
        {/* Le retour au cours. La pratique n'est pas une impasse : l'élève qui
            butte sur un niveau doit pouvoir relire la leçon en un geste, sans
            repasser par « Mes cours ». `lessonPath` est nul quand la leçon
            n'est pas (encore) au catalogue — on n'affiche alors aucun lien
            plutôt qu'un lien mort. */}
        {lessonPath && (
          <Link
            to={lessonPath}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus:outline-none"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Revoir la leçon
          </Link>
        )}
      </header>

      {error && <p className="text-sm text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl p-3">{error}</p>}

      {openSession && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-indigo-900">
            Tu as une séance en cours au <strong>niveau {openSession.level}</strong>.
          </p>
          <Link
            to={`/espace/pratique/${lessonCode}/session/${openSession.sessionId}`}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm min-h-[44px] inline-flex items-center"
          >
            Reprendre
          </Link>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-space font-bold text-slate-900">Les niveaux</h2>
        <LevelSelector levels={levels} recommendedLevel={recommendedLevel} onSelect={start} busyLevel={busyLevel} />
      </section>

      {learningPoints.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-space font-bold text-slate-900">Ce que tu as déjà montré</h2>
          <p className="text-sm text-slate-500">
            Ces états viennent de ton test final et de ta pratique — c’est la même évaluation.
          </p>
          <ul className="space-y-2">
            {learningPoints.map((lp) => {
              // resolveMasteryState attend la LIGNE entière, pas le statut seul.
              const state = MASTERY_STATES[resolveMasteryState(lp)];

              return (
                <li key={lp.code} className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 ${TONE[state.tone]}`}>
                  <span aria-hidden="true">{state.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">{lp.title}</p>
                    <p className="text-xs text-slate-600">{state.label}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
