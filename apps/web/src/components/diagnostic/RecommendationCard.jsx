import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowRight } from 'lucide-react';

/**
 * The most important conversion in the whole feature: diagnostic completed
 * → first personalized mission started. Links to the recommended lesson's
 * own index page — not directly to `startingPoint.moduleNumber` — because
 * every 6e lesson has `sequentialUnlock: true` (LESSON_CONTRACT.md):
 * ModuleLayout locks any module beyond 1 until the previous one is
 * completed, regardless of how its URL was reached, for a student with no
 * progress yet. Deep-linking past that would mean changing the existing
 * lesson engine's locking behavior, which this feature doesn't touch.
 * Landing on the lesson index instead is also a better first look anyway —
 * the student sees the whole mission roadmap, not just one bare module.
 */
export default function RecommendationCard({ recommendation }) {
  const { reason, startingPoint } = recommendation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl p-6 sm:p-7 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
    >
      <p className="font-mono-jetbrains text-blue-100 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <Target size={13} /> Ta priorité
      </p>
      <p className="font-inter text-sm text-blue-50 mb-1.5 leading-relaxed">{reason}</p>
      {startingPoint.moduleTitle && (
        <p className="font-inter text-xs text-blue-100/80 mb-6">Au programme, notamment : « {startingPoint.moduleTitle} »</p>
      )}
      <Link
        to={startingPoint.lessonPath}
        className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white text-blue-700 font-space font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
      >
        🎯 Commencer ma première mission
        <ArrowRight size={16} />
      </Link>
    </motion.div>
  );
}
