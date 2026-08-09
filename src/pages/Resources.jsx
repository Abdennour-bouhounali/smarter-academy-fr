import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Edit3, RefreshCw, BookOpen, Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';

const resourceCategories = [
  {
    title: "Fiches de Cours",
    folder: "public/resources/fiches/",
    description: "Synthèses concises et fiches mémoire au format HTML / PDF.",
    icon: FileText,
    gradient: "from-blue-600 to-cyan-500",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    title: "Exercices Corrigés",
    folder: "public/resources/exercices/",
    description: "Séries d'exercices d'entraînement et corrigés pas à pas.",
    icon: Edit3,
    gradient: "from-purple-600 to-pink-500",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    title: "Annales Examen",
    folder: "public/resources/annales/",
    description: "Sujets officiels du Brevet et du Bac avec barèmes rédigés.",
    icon: RefreshCw,
    gradient: "from-amber-500 to-orange-500",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    title: "Conseils & Méthode",
    folder: "public/resources/conseils/",
    description: "Guides pratiques sur la rédaction, la calculatrice et Python.",
    icon: BookOpen,
    gradient: "from-emerald-500 to-teal-500",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200"
  }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function ResourcesPage() {
  return (
    <div className="pt-16 min-h-[85vh] flex flex-col justify-between">
      {/* Page Header */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-4">
              <Sparkles size={14} className="text-emerald-500" />
              Index des Ressources HTML
            </div>
            <h1 className="font-space font-bold text-4xl sm:text-5xl text-slate-900 mb-4">
              Ressources Gratuites
            </h1>
            <p className="font-inter text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Index des fiches, exercices, annales et conseils au format HTML autonome.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Empty State Banner */}
      <section className="pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-800 text-xs sm:text-sm font-inter font-medium flex items-center justify-center gap-2">
            <Clock size={16} className="text-amber-600 flex-shrink-0" />
            <span><strong>Aucune ressource disponible pour le moment :</strong> Les supports sont en cours de génération et seront automatiquement référencés ci-dessous.</span>
          </div>
        </div>
      </section>

      {/* Beautiful Placeholder Cards for each resource category */}
      <section className="py-6 px-4 flex-1">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {resourceCategories.map((item) => (
              <motion.div
                key={item.title}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card overflow-hidden flex flex-col justify-between relative cursor-default p-6"
              >
                {/* Accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient}`} />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${item.gradient} shadow-md`}>
                      <item.icon size={20} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono-jetbrains font-semibold border ${item.badgeBg}`}>
                      Coming Soon
                    </span>
                  </div>

                  <h2 className="font-space font-bold text-slate-900 text-lg mb-2">
                    {item.title}
                  </h2>

                  <p className="font-inter text-slate-500 text-xs leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100/80 flex items-center justify-between">
                  <span className="font-mono-jetbrains text-[11px] text-slate-400">0 fichier indexé</span>
                  <span className="font-inter text-xs text-blue-500 font-semibold">Bientôt disponible</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}
            >
              <Calendar size={14} />
              Demander des conseils ou réserver un cours
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
