import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';
import FAQSection from '../components/faq/FAQSection';
import CtaBanner from '../components/common/CtaBanner';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function FAQPage() {
  const { t } = useTranslation('marketing');

  useDocumentMeta(t('faq.metaTitle'), t('faq.metaDescription'));

  return (
    <div className="pt-16">
      {/* Page Header */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nav-accent-soft border border-blue-200 text-nav-accent text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-4">
              <HelpCircle size={14} className="text-blue-500" />
              {t('faq.eyebrow')}
            </div>
            <h1 className="font-space font-bold text-4xl sm:text-5xl text-slate-900 mb-4">
              {t('faq.title')}
            </h1>
            <p className="font-inter text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('faq.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main FAQ Component */}
      <FAQSection />

      <CtaBanner
        eyebrow={t('faq.ctaEyebrow')}
        title={t('faq.ctaTitle')}
        subtitle={t('faq.ctaBody')}
        primaryLabel={t('faq.ctaButton')}
        primaryTo="/register"
      />
    </div>
  );
}
