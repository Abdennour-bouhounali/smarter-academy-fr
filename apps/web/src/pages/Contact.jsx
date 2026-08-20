import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import ContactSection from '../components/contact/ContactSection';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function ContactPage() {
  useDocumentMeta('Contact', "Une question sur Smarter Academy ? Écrivez-nous, nous répondons sous 48h ouvrées.");

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
              <Mail size={14} className="text-blue-500" />
              Contact
            </div>
            <h1 className="font-space font-bold text-4xl sm:text-5xl text-slate-900 mb-4">
              Une question ?
            </h1>
            <p className="font-inter text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Écrivez-nous — nous répondons personnellement à chaque message, sous 48h ouvrées.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Contact Form & Cards Component */}
      <ContactSection />
    </div>
  );
}
