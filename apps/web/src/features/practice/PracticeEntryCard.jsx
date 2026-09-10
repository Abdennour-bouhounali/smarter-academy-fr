import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { practiceHubPath } from './practiceCapability';
import { levelCounts } from './practiceContent';

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
  const { token } = useContext(AuthContext);
  const counts = levelCounts(lessonId);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  if (total === 0) return null;

  const levelCount = Object.keys(counts).length;

  return (
    <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-indigo-200 text-indigo-700 font-mono text-xs font-semibold">
            <Dumbbell className="w-3.5 h-3.5" aria-hidden="true" /> Entraînement
          </div>
          <h2 className="text-xl sm:text-2xl font-space font-extrabold text-slate-900">
            Commencer à pratiquer
          </h2>
          <p className="text-sm text-slate-600 max-w-lg">
            {total} exercices répartis sur {levelCount} niveaux, des bases au défi type bac.
            Ce que tu montres ici compte dans la même évaluation que le test final.
          </p>
        </div>

        {token ? (
          <Link
            to={practiceHubPath(lessonId)}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold min-h-[52px] transition-colors"
          >
            Commencer à pratiquer <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        ) : (
          <div className="shrink-0 space-y-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold min-h-[52px] transition-colors"
            >
              Se connecter pour pratiquer
            </Link>
            <p className="text-xs text-slate-500 max-w-[16rem]">
              Tes progrès sont enregistrés sur ton compte.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
