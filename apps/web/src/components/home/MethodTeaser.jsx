import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const LOOP = [
  { title: 'Situation concrète', desc: "Tout part d'un problème réel — jamais d'une formule posée à froid." },
  { title: 'Manipuler', desc: "L'élève touche, déplace, construit — avant toute règle." },
  { title: 'Observer', desc: 'Il remarque des régularités, des motifs qui se répètent.' },
  { title: 'Questionner', desc: 'Pourquoi ça marche ? Est-ce que ça marche toujours ?' },
  { title: 'Découvrir', desc: "La règle n'est pas donnée : elle émerge de ce qu'il vient de voir." },
  { title: 'Comprendre', desc: 'Il relie la règle à ce qu\'il sait déjà — elle prend enfin sens.' },
  { title: 'Pratiquer', desc: "Des exercices progressifs pour ancrer ce qui vient d'être compris." },
  { title: 'Appliquer', desc: 'Il réutilise la notion ailleurs — la vraie preuve de compréhension.' },
  { title: 'Maîtriser', desc: 'Il résout seul, avec assurance, même les cas complexes.' },
];

/**
 * A homepage teaser, not the full explanation — that's /methode's job.
 * The loop is interactive (click a step, read its one line below) rather
 * than nine paragraphs stacked on the page: progressive disclosure instead
 * of a wall of text.
 */
export default function MethodTeaser() {
  const [active, setActive] = useState(0);

  return (
    <section className="section-wrapper bg-slate-50/50">
      <div className="max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-3"
        >
          Notre méthode
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="section-title !mb-10"
        >
          Apprendre en le faisant
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6"
        >
          {LOOP.map((step, i) => (
            <button
              key={step.title}
              onClick={() => setActive(i)}
              className={`px-3.5 py-2 rounded-full font-inter text-xs sm:text-sm font-semibold whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                active === i
                  ? 'text-white shadow-sm scale-105'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200'
              }`}
              style={active === i ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {}}
            >
              {step.title}
            </button>
          ))}
        </motion.div>

        <div className="h-14 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="font-inter text-slate-600 text-base sm:text-lg max-w-lg px-4"
            >
              {LOOP[active].desc}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="font-space font-bold text-lg sm:text-xl gradient-text-blue-purple mb-6">
          Nous voulons qu'il sache pourquoi.
        </p>

        <Link to="/methode" className="inline-flex items-center gap-1.5 font-inter text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          Découvrir notre méthode
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
