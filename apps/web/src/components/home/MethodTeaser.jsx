import { useState } from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowForward } from '../common/DirectionalIcons';


// On stocke des CLÉS, pas des libellés : `t()` ne doit pas être appelé au
// niveau module (i18n n'est pas garanti initialisé à l'évaluation du module).
// La résolution se fait au rendu.
const LOOP = [
  'situation',
  'manipulate',
  'observe',
  'question',
  'discover',
  'understand',
  'practice',
  'apply',
  'master',
];

/**
 * A homepage teaser, not the full explanation — that's /methode's job.
 * The loop is interactive (click a step, read its one line below) rather
 * than nine paragraphs stacked on the page: progressive disclosure instead
 * of a wall of text.
 */
export default function MethodTeaser() {
  const { t } = useTranslation('marketing');
  const [active, setActive] = useState(0);

  return (
    <section className="section-wrapper bg-slate-50/50">
      <div className="max-w-4xl mx-auto text-center">
        <m.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-3"
        >
          {t('method.eyebrow')}
        </m.p>
        <m.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="section-title !mb-10"
        >
          {t('method.teaserTitle')}
        </m.h2>

        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6"
        >
          {LOOP.map((step, i) => (
            <button
              key={step}
              onClick={() => setActive(i)}
              className={`px-3.5 py-2 rounded-full font-inter text-xs sm:text-sm font-semibold whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                active === i
                  ? 'text-white shadow-sm scale-105'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200'
              }`}
              style={active === i ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {}}
            >
              {t(`method.steps.${step}.title`)}
            </button>
          ))}
        </m.div>

        <div className="h-14 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <m.p
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="font-inter text-slate-600 text-base sm:text-lg max-w-lg px-4"
            >
              {t(`method.steps.${LOOP[active]}.desc`)}
            </m.p>
          </AnimatePresence>
        </div>

        <p className="font-inter text-slate-600 text-base sm:text-lg mb-2">
          {t('method.closingLead')}
        </p>
        <p className="font-space font-bold text-lg sm:text-xl gradient-text-blue-purple mb-6">
          {t('method.closingPunch')}
        </p>

        <Link to="/methode" className="inline-flex items-center gap-1.5 font-inter text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          {t('method.discoverCta')}
          <ArrowForward size={14} />
        </Link>
      </div>
    </section>
  );
}
