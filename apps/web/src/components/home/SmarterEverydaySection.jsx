import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Des CLÉS, pas des libellés : pas d'appel à `t()` au niveau module.
const LINES = ['line1', 'line2', 'line3', 'line4', 'line5'];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};
const lineVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function SmarterEverydaySection() {
  const { t } = useTranslation('marketing');

  return (
    <section className="relative z-10 py-20 sm:py-28 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto text-center">
        <m.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-mono-jetbrains text-cyan-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-10"
        >
          {t('everyday.brand')}
        </m.p>

        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-3 mb-12"
        >
          {LINES.map((line) => (
            <m.p key={line} variants={lineVariants} className="font-space font-medium text-xl sm:text-2xl text-slate-200 leading-snug">
              {t(`everyday.${line}`)}
            </m.p>
          ))}
        </m.div>

        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 150 }}
          className="pt-8 border-t border-white/10 inline-block"
        >
          <p className="font-space font-bold text-2xl sm:text-3xl text-white leading-snug text-balance">
            {t('everyday.closing1')}
          </p>
          <p className="font-space font-bold text-2xl sm:text-3xl gradient-text leading-snug text-balance mt-1">
            {t('everyday.closing2')}
          </p>
        </m.div>
      </div>
    </section>
  );
}
