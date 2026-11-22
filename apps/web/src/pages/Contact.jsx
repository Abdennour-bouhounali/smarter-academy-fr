import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import ContactSection from '../components/contact/ContactSection';
import CtaBanner from '../components/common/CtaBanner';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function ContactPage() {
  const { t } = useTranslation('marketing');

  useDocumentMeta(t('contact.metaTitle'), t('contact.metaDescription'));

  return (
    <div className="pt-16">
      {/* En-tête */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nav-accent-soft border border-blue-200 text-nav-accent text-xs font-semibold tracking-wide mb-5">
              <MessageSquare size={14} className="text-blue-500" />
              {t('contact.eyebrow')}
            </div>
            <h1 className="font-space font-bold text-4xl sm:text-5xl text-slate-900 mb-4 leading-tight">
              {t('contact.title')}
            </h1>
            <p className="font-inter text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <ContactSection />

      <CtaBanner
        eyebrow={t('contact.ctaEyebrow')}
        title={t('contact.ctaTitle')}
        subtitle={t('contact.ctaBody')}
        primaryLabel={t('contact.ctaButton')}
        primaryTo="/register"
      />
    </div>
  );
}
