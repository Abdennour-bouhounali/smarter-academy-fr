import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Award, Languages, BookOpen, CheckCircle2 } from 'lucide-react';
import AboutSection from '../components/about/AboutSection';
import Experience from '../components/about/Experience';
import Education from '../components/about/Education';

const languages = [
  { name: 'Français', level: 'C1 — Courant / Langue d\'enseignement' },
  { name: 'Anglais', level: 'C2 — Bilingue' },
  { name: 'Arabe', level: 'C2 — Bilingue' },
  { name: 'Berbère', level: 'Langue Maternelle' },
];

export default function AboutPage() {
  return (
    <div className="pt-16">


      {/* Philosophy & Pillars */}
      <AboutSection />

      {/* Detailed Experience Timeline */}
      <Experience />

      {/* Academic Qualifications & Degrees */}
      <Education />

      {/* Languages & Distinction Badges */}
      <section className="section-wrapper">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500 text-white shadow-md">
                <Languages size={20} />
              </div>
              <h2 className="font-space font-bold text-2xl text-slate-900">Langues & Engagement Pédagogique</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {languages.map((lang) => (
                <div key={lang.name} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-space font-bold text-slate-800 text-sm">{lang.name}</p>
                    <p className="font-inter text-slate-500 text-xs">{lang.level}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 text-center">
              <p className="font-inter text-sm text-slate-700 leading-relaxed font-medium">
                🤝 <strong className="text-slate-900">Engagement associatif & STEM :</strong> Participation active à des ateliers scolaires bénévoles avec la Fondation TAGEMI et NAPTAKIR pour promouvoir la logique scientifique et l'égalité des chances.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-12"
          >
            <h3 className="font-space font-bold text-2xl sm:text-3xl text-slate-900 mb-3">
              Envie d'échanger sur les besoins de votre enfant ?
            </h3>
            <p className="font-inter text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-6">
              Contactez-moi directement pour planifier un cours d'évaluation ou poser vos questions.
            </p>
            <Link
              to="/contact"
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              <Calendar size={16} />
              Réserver un cours d'essai
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
