import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ScrollText } from 'lucide-react';
import { courseLevels, getFlatAvailableLessons } from '@smarter-academy/core';

const ALL_GRADES = courseLevels.flatMap((level) =>
  level.grades.map((grade) => ({ ...grade, levelId: level.id }))
);

/**
 * One section, two jobs: TRUST (a real, computed number — never a hardcoded
 * or invented stat — plus the one credibility line that matters) and
 * RELEVANCE (find your own grade). Kept together deliberately: "here's
 * proof this is real" and "here's yours" read as one thought, not two.
 */
export default function TrustRelevanceSection() {
  const lessonCount = getFlatAvailableLessons(courseLevels).length;

  return (
    <section className="section-wrapper">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-3 flex items-center justify-center gap-1.5">
            <ScrollText size={13} />
            Programme officiel de l'Éducation nationale
          </p>
          <h2 className="section-title !mb-3">De la 6e à la Terminale</h2>
          <p className="font-inter text-slate-500 text-base">
            {lessonCount} leçons interactives déjà disponibles — la 6e est aujourd'hui le niveau le plus complet.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2.5"
        >
          {ALL_GRADES.map((grade) => {
            const isFlagship = grade.id === '6e';
            return (
              <Link
                key={grade.id}
                to={`/courses?level=${grade.levelId}&grade=${grade.id}`}
                className={`px-5 py-3 rounded-2xl font-space font-bold text-sm transition-all ${
                  isFlagship
                    ? 'text-white shadow-md hover:-translate-y-0.5'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                style={isFlagship ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {}}
              >
                {grade.name}
              </Link>
            );
          })}
        </motion.div>

        <div className="text-center mt-8">
          <Link to="/courses" className="inline-flex items-center gap-2 font-inter text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Voir le programme complet
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
