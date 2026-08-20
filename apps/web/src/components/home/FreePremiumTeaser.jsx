import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * The entire free/premium concept, in one glance — not a 3-column plan
 * comparison (that's Tarifs's job). Just enough for DESIRE: here's what's
 * free, here's what unlocks more.
 */
export default function FreePremiumTeaser() {
  return (
    <section className="px-4 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-6" aria-hidden="true">
          <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="w-3 h-3 rounded-full border-2 border-slate-200" />
          ))}
        </div>
        <p className="font-space font-bold text-xl sm:text-2xl text-slate-900 leading-snug text-balance mb-2">
          2 leçons complètes, offertes, sur chaque niveau.
        </p>
        <p className="font-inter text-slate-500 text-base mb-6">
          Le reste du programme se débloque avec Premium — quand tu es prêt.
        </p>
        <Link to="/tarifs" className="inline-flex items-center gap-1.5 font-inter text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          Voir les tarifs
          <ArrowRight size={15} />
        </Link>
      </motion.div>
    </section>
  );
}
