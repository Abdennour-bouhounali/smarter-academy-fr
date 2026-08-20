import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import FAQSection from '../components/faq/FAQSection';
import CtaBanner from '../components/common/CtaBanner';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function FAQPage() {
  useDocumentMeta(
    'FAQ',
    "Toutes les réponses aux questions fréquentes sur Smarter Academy : niveaux, méthode, gratuité, tarifs et suivi de progression."
  );

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-4">
              <HelpCircle size={14} className="text-blue-500" />
              Questions fréquentes
            </div>
            <h1 className="font-space font-bold text-4xl sm:text-5xl text-slate-900 mb-4">
              Foire Aux Questions
            </h1>
            <p className="font-inter text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Les questions que se posent le plus souvent les élèves et les parents avant de commencer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main FAQ Component */}
      <FAQSection />

      <CtaBanner
        eyebrow="Encore une question ?"
        title="Écris-nous, ou essaie directement"
        subtitle="La meilleure réponse est souvent d'essayer par toi-même — gratuitement, sans engagement."
        primaryLabel="Commencer gratuitement"
        primaryTo="/register"
        secondaryLabel="Nous contacter"
        secondaryTo="/contact"
      />
    </div>
  );
}
