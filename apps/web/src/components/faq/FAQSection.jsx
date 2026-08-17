import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, CheckCircle2 } from 'lucide-react';

const faqs = [
  {
    id: 'process',
    question: "Comment se déroule un cours ?",
    answer: "Un cours s'articules en 5 étapes clés : diagnostic rapide des difficultés, explications claires des notions mal comprises avec des méthodes visuelles, exercices d'application guidés, mise en autonomie sur des sujets d'examen, et bilan final avec exercices à faire pour la séance suivante."
  },
  {
    id: 'online',
    question: "Proposez-vous des cours en ligne ?",
    answer: "Oui, absolument ! Les cours en ligne se déroulent en visioconférence HD avec un tableau blanc interactif virtuel partagé en temps réel (GeoGebra, écriture d'équations). À la fin de chaque séance, l'élève reçoit le support complet de cours annoté au format PDF."
  },
  {
    id: 'bac-brevet',
    question: "Préparez-vous au Brevet et au Baccalauréat ?",
    answer: "Oui, la préparation aux examens officiels est l'une de mes spécialités principales. J'accompagne les élèves de 3ème pour le Brevet (DNB) ainsi que les lycéens de Première et Terminale (Spécialité Maths & Maths Expertes) pour le Baccalauréat avec des sujets d'annales corrigés et une méthode de rédaction rigoureuse."
  },
  {
    id: 'travel',
    question: "Vous déplacez-vous à domicile ?",
    answer: "Oui, je me déplace à domicile à Toulouse et dans son agglomération proche tout au long de l'année. Je me déplace également à Paris pour des stages intensifs de révision pendant les vacances scolaires."
  },
  {
    id: 'duration',
    question: "Quelle est la durée d'un cours ?",
    answer: "La durée recommandée est de 1h30 par séance pour les collégiens et de 1h30 à 2h00 pour les lycéens. Cette durée permet de revoir la théorie sans précipitation, de réaliser des exercices d'application et de valider les acquis."
  },
  {
    id: 'pricing',
    question: "Quels sont les tarifs et modalités ?",
    answer: "Les tarifs sont adaptés au niveau de l'élève (Collège, Lycée, Supérieur) et au format choisi (à domicile ou en ligne). N'hésite pas à me contacter par téléphone ou via le formulaire pour obtenir un tarif exact et échanger sur les besoins de votre enfant."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="section-wrapper">
      <div className="max-w-4xl mx-auto">


        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-space font-bold text-slate-800 text-base sm:text-lg hover:text-blue-600 transition-colors"
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
