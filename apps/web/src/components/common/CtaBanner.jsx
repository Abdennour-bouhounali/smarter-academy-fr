import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * The recurring "Commencer gratuitement" close — reused across Home,
 * Cours, Tarifs and À propos so the platform's single primary conversion
 * action always looks and reads the same way.
 */
export default function CtaBanner({
  eyebrow = 'Prêt à essayer ?',
  title = 'Commence à comprendre les maths dès aujourd\'hui',
  subtitle = 'Crée ton compte gratuit — sans carte bancaire — et accède tout de suite à l\'expérience 6e.',
  primaryLabel = 'Commencer gratuitement',
  primaryTo = '/register',
  secondaryLabel,
  secondaryTo,
}) {
  return (
    <section className="py-16 px-4 relative z-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 sm:p-14 text-center relative overflow-hidden bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-600/90 text-white shadow-2xl"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-50 text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-5">
              <Sparkles size={13} />
              {eyebrow}
            </div>
            <h2 className="font-space font-bold text-2xl sm:text-4xl text-white mb-4 leading-tight text-balance">
              {title}
            </h2>
            <p className="font-inter text-blue-100 text-sm sm:text-base mb-8 leading-relaxed max-w-xl mx-auto">
              {subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to={primaryTo}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-space font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-xl transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                {primaryLabel}
                <ArrowRight size={16} className="text-blue-600" />
              </Link>
              {secondaryLabel && secondaryTo && (
                <Link
                  to={secondaryTo}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-space font-semibold text-white border border-white/30 hover:bg-white/10 transition-all duration-300"
                >
                  {secondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
