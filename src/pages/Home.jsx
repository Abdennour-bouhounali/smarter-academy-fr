import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import Hero from '../components/hero/Hero';
import AboutSection from '../components/about/AboutSection';
import SkillsSection from '../components/services/SkillsSection';
import CoursesSection from '../components/services/CoursesSection';
import ProcessSection from '../components/services/ProcessSection';
import TestimonialsSection from '../components/testimonials/TestimonialsSection';

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <SkillsSection />
      <CoursesSection />
      <ProcessSection />
      <TestimonialsSection />

      {/* Call To Action Banner */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-600/90 text-white shadow-2xl"
          >
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-space font-bold text-2xl sm:text-4xl text-white mb-4 leading-tight">
                Prêt à faire décoller les résultats en mathématiques ?
              </h2>
              <p className="font-inter text-blue-100 text-sm sm:text-base mb-8 leading-relaxed">
                Reservez dès aujourd'hui une première séance de diagnostic pour évaluer les besoins de votre enfant et fixer une stratégie de réussite.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-space font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Calendar size={18} className="text-blue-600" />
                  Réserver mon cours d'essai
                  <ArrowRight size={16} className="text-blue-600" />
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-xs font-inter text-blue-100 flex-wrap">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Toulouse & Paris à domicile</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Visioconférence HD France</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Sans engagement</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
