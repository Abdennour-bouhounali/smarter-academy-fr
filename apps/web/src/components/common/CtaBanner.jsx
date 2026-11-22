import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { ArrowForward } from './DirectionalIcons';

/**
 * The recurring "Commencer gratuitement" close — reused across Home,
 * Cours, Tarifs and À propos so the platform's single primary conversion
 * action always looks and reads the same way.
 *
 * Les valeurs par défaut sont résolues par `t()` DANS le composant : un
 * paramètre par défaut ne peut pas appeler un hook, et i18n n'est pas
 * garanti initialisé au moment où le module est évalué.
 */
export default function CtaBanner({
  eyebrow,
  title,
  subtitle,
  primaryLabel,
  primaryTo = '/register',
  secondaryLabel,
  secondaryTo,
}) {
  const { t } = useTranslation('marketing');

  const resolvedEyebrow = eyebrow ?? t('home.ctaEyebrow');
  const resolvedTitle = title ?? t('home.ctaTitle');
  const resolvedSubtitle = subtitle ?? t('home.ctaBody');
  const resolvedPrimaryLabel = primaryLabel ?? t('home.ctaButton');

  return (
    <section className="py-16 px-4 relative z-10">
      <div className="max-w-5xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 sm:p-14 text-center relative overflow-hidden bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-600/90 text-white shadow-2xl"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-50 text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-5">
              <Sparkles size={13} />
              {resolvedEyebrow}
            </div>
            <h2 className="font-space font-bold text-2xl sm:text-4xl text-white mb-4 leading-tight text-balance">
              {resolvedTitle}
            </h2>
            <p className="font-inter text-blue-100 text-sm sm:text-base mb-8 leading-relaxed max-w-xl mx-auto">
              {resolvedSubtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to={primaryTo}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-space font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-xl transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                {resolvedPrimaryLabel}
                <ArrowForward size={16} className="text-nav-accent" />
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
        </m.div>
      </div>
    </section>
  );
}
