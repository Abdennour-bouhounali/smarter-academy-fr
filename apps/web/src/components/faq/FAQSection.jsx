import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, CheckCircle2 } from 'lucide-react';

const faqs = [
  {
    id: 'levels',
    question: 'À partir de quel niveau puis-je utiliser Smarter Academy ?',
    answer: "Smarter Academy couvre le programme officiel français, du Collège (6e à 3e) au Lycée (2nde à Terminale). La 6e est aujourd'hui le niveau le plus complet ; les autres niveaux s'enrichissent progressivement.",
  },
  {
    id: 'curriculum',
    question: 'Le contenu suit-il vraiment le programme français ?',
    answer: "Oui. Chaque leçon est construite à partir du programme officiel de l'Éducation nationale, domaine par domaine — rien n'est inventé à côté du programme.",
  },
  {
    id: 'how-lessons-work',
    question: 'Comment se déroule une leçon ?',
    answer: "Une situation concrète, de la manipulation, une découverte guidée, puis de la pratique avec feedback immédiat. Le détail complet est sur la page Notre méthode.",
  },
  {
    id: 'parent-supervision',
    question: 'Mon enfant doit-il être accompagné pour utiliser la plateforme ?',
    answer: "Non. Chaque leçon se suit en autonomie, avec des consignes claires et un feedback immédiat. Un parent peut suivre la progression, mais sa présence n'est pas nécessaire pour avancer.",
  },
  {
    id: 'every-level',
    question: 'Est-ce adapté si mon enfant est en difficulté — ou au contraire à l\'aise ?',
    answer: "Les deux. Un élève en difficulté avance à son rythme, sans jugement — l'erreur fait partie du chemin. Un élève à l'aise gagne en profondeur : comprendre plutôt que réciter construit des bases plus solides, quel que soit le niveau de départ.",
  },
  {
    id: 'whats-free',
    question: 'Qu\'est-ce qui est réellement gratuit ?',
    answer: "2 leçons complètes par niveau, avec un compte gratuit — sans limite de temps : leçons interactives, exercices, correction et suivi de progression inclus.",
  },
  {
    id: 'card-required',
    question: 'Faut-il une carte bancaire pour créer un compte gratuit ?',
    answer: "Non, jamais. Créer un compte gratuit ne demande aucune information de paiement.",
  },
  {
    id: 'locked-lessons',
    question: 'Pourquoi certaines leçons sont-elles verrouillées ?',
    answer: "Elles font partie de l'offre Premium et se débloquent avec l'abonnement. Elles restent visibles dans le catalogue pour que tu saches ce qui t'attend.",
  },
  {
    id: 'pricing',
    question: 'Pourquoi 35€ par an, et qu\'est-ce que le mois offert ?',
    answer: "35€/an débloque l'accès complet et illimité au programme, du Collège au Lycée — pensé pour rester accessible, pas pour être un luxe. Le premier mois est offert, pour juger sereinement avant de s'engager.",
  },
  {
    id: 'progress-tracking',
    question: 'Comment fonctionne le suivi de progression ?',
    answer: "Chaque module complété est enregistré sur ton compte : tu peux voir où tu en es, reprendre là où tu t'es arrêté, et suivre ta progression dans le temps.",
  },
  {
    id: 'devices',
    question: 'Sur quels appareils puis-je utiliser Smarter Academy ?',
    answer: "Dans le navigateur, sur ordinateur, tablette ou smartphone — aucune installation requise. Une application mobile dédiée est envisagée pour plus tard.",
  },
  {
    id: 'replaces-teacher',
    question: 'Est-ce que Smarter Academy remplace un professeur ?',
    answer: "Non. C'est un complément puissant pour comprendre et pratiquer en autonomie — rien ne remplace un enseignant en classe pour guider et adapter son enseignement à chaque élève.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="section-wrapper pt-0">
      <div className="max-w-4xl mx-auto">
        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 6) * 0.05 }}
              className="glass-card overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-space font-bold text-slate-800 text-base sm:text-lg hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset rounded-t-[20px]"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle size={20} className={`flex-shrink-0 transition-colors ${openIndex === i ? 'text-blue-600' : 'text-blue-500'}`} />
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === i ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 font-inter text-slate-600 text-sm leading-relaxed border-t border-slate-100/80 flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-1" />
                      <div>{faq.answer}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
