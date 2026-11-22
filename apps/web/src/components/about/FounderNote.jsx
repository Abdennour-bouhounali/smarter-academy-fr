import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import profileImg from '../../assets/myimage.webp';

/**
 * Deliberately restrained — the founder's story exists here to explain
 * *why* Smarter Academy exists, not to be the page's subject. No stat
 * counters, no CV timeline: one photo, one short note, one credential line.
 */
export default function FounderNote() {
  const { t } = useTranslation('marketing');

  return (
    <section className="section-wrapper">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="font-mono-jetbrains text-blue-500 text-sm font-semibold tracking-widest uppercase mb-3">
            {t('founder.eyebrow')}
          </p>
          <h2 className="section-title">{t('founder.title')}</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-7 sm:p-10"
        >
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-blue-50">
                <img src={profileImg} alt={t('founder.alt')} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="text-center sm:text-start">
              <p className="font-inter text-slate-600 leading-relaxed mb-4">
                {t('founder.bio1')}
              </p>
              <p className="font-inter text-slate-600 leading-relaxed">
                {t('founder.bio2')}
              </p>
              <p className="font-space font-semibold text-slate-800 text-sm mt-5">
                {t('founder.name')}
              </p>
              <p className="font-inter text-slate-400 text-xs mt-1">
                {t('founder.role')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
