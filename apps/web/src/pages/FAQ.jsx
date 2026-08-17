import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, HelpCircle } from 'lucide-react';
import FAQSection from '../components/faq/FAQSection';

export default function FAQPage() {
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
              Réponses & Informations
            </div>
            <h1 className="font-space font-bold text-4xl sm:text-5xl text-slate-900 mb-4">
              Foire Aux Questions
            </h1>
            <p className="font-inter text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Toutes les réponses aux questions que vous vous posez sur les cours de mathématiques, les déplacements et la préparation aux examens.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main FAQ Component */}
      <FAQSection />

      {/* Contact CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-10"
          >
            <h2 className="font-space font-bold text-2xl text-slate-900 mb-3">
              Vous avez d'autres questions ?
            </h2>
            <p className="font-inter text-slate-600 text-sm max-w-lg mx-auto mb-6">
              N'hésitez pas à me contacter directement par téléphone ou par message pour échanger sur la situation spécifique de votre enfant.
            </p>
            <Link
              to="/contact"
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              <Calendar size={16} />
              Me contacter / Réserver un cours
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
