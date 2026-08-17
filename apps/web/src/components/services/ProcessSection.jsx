import { motion } from 'framer-motion';
import { Search, MessageSquare, Edit3, CheckCircle2, TrendingUp } from 'lucide-react';

const steps = [
  {
    step: "01",
    title: "Évaluation & Diagnostic",
    description: "Une première analyse permet d'identifier précisément les lacunes, le mode de fonctionnement de l'élève et ses objectifs (remise à niveau, Brevet, Bac).",
    icon: Search,
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50"
  },
  {
    step: "02",
    title: "Explications Claires & Intuitives",
    description: "Reprise des notions de cours mal comprises avec des schémas, des analogies simples et des méthodes visuelles pour déclencher le 'déclic'.",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50"
  },
  {
    step: "03",
    title: "Exercices Guidés Pas à Pas",
    description: "Mise en pratique immédiate sur des exercices d'application directe pour ancrer les réflexes de calcul et la rigueur de rédaction.",
    icon: Edit3,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50"
  },
  {
    step: "04",
    title: "Mise en Autonomie",
    description: "L'élève résout seul des problèmes types d'examen (Sujets Bac / Brevet) sous mon regard bienveillant pour valider l'acquisition.",
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50"
  },
  {
    step: "05",
    title: "Suivi & Bilan Parents",
    description: "Recommandations de travail personnel jusqu'à la séance suivante et compte-rendu systématique transmis aux parents.",
    icon: TrendingUp,
    color: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50"
  }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function ProcessSection() {
  return (
    <section id="process" className="section-wrapper bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono-jetbrains text-blue-500 text-sm font-semibold tracking-widest uppercase mb-3">
            04. Déroulement d'un cours
          </p>
          <h2 className="section-title">Comment se déroule un cours ?</h2>
          <p className="section-subtitle">
            Une méthode structurée en 5 étapes clés pour garantir la compréhension, l'autonomie et la progression continue.
          </p>
        </motion.div>

        {/* Grid steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {steps.map((item) => (
            <motion.div
              key={item.step}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className="glass-card p-6 flex flex-col relative overflow-hidden text-center cursor-default"
            >
              {/* Step Top Bar Gradient */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />

              {/* Number badge */}
              <div className="font-mono-jetbrains text-xs font-bold text-slate-400 mb-3 self-center px-3 py-1 rounded-full bg-slate-100">
                Étape {item.step}
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${item.color} shadow-md`}>
                <item.icon size={22} className="text-white" />
              </div>

              <h3 className="font-space font-bold text-slate-900 text-base mb-2">
                {item.title}
              </h3>

              <p className="font-inter text-slate-500 text-xs leading-relaxed flex-1">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Reassurance note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-6 rounded-2xl bg-white border border-blue-100 shadow-sm max-w-3xl mx-auto text-center"
        >
          <p className="font-inter text-sm text-slate-600 leading-relaxed">
            💡 <strong className="text-slate-800">Support continu entre les cours :</strong> Les élèves peuvent poser leurs questions par message (WhatsApp/Email) s'ils bloquent sur un exercice pendant leurs révisions autonomes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
