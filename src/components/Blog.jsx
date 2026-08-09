import { motion } from 'framer-motion';
import { Download, FileText, Sparkles, CheckCircle } from 'lucide-react';

const posts = [
  {
    title: "Les 10 formules indispensables du Bac Spécialité Maths",
    category: "Fiches PDF",
    readTime: "Fiche PDF",
    summary: "Un résumé ultra-synthétique des formules d'analyse, de géométrie vectorielle et de probabilités à maîtriser sur le bout des doigts pour le Bac.",
    tag: "Bac Spé Maths",
    gradient: "from-blue-600 via-indigo-500 to-cyan-400",
    icon: "📄"
  },
  {
    title: "Sujets types Brevet corrigés pas à pas",
    category: "Exercices Corrigés",
    readTime: "Exercices PDF",
    summary: "Sélection d'exercices d'annales du DNB avec rédactions détaillées et conseils pour ne perdre aucun point le jour J.",
    tag: "Brevet 3ème",
    gradient: "from-purple-600 via-pink-500 to-rose-400",
    icon: "✍️"
  },
  {
    title: "Comment réviser efficacement les maths au Lycée ?",
    category: "Conseils de Révision",
    readTime: "Guide Pédagogique",
    summary: "Méthodes de travail personnel, gestion du temps de révision, création de fiches actives et élimination des fautes d'inattention.",
    tag: "Méthodologie",
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    icon: "💡"
  },
  {
    title: "Astuces Calculatrice & Scripting Python pour le Bac",
    category: "Astuces Bac",
    readTime: "Guide Pratique",
    summary: "Les fonctionnalités clés de la calculatrice TI / Casio / NumWorks et les algorithmes Python incontournables au programme de Terminale.",
    tag: "Outils & Python",
    gradient: "from-emerald-500 via-teal-500 to-cyan-400",
    icon: "🚀"
  }
];

const tagColors = {
  "Bac Spé Maths": "bg-blue-100 text-blue-700",
  "Brevet 3ème": "bg-purple-100 text-purple-700",
  "Méthodologie": "bg-amber-100 text-amber-700",
  "Outils & Python": "bg-emerald-100 text-emerald-700",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function Blog() {
  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="blog" className="section-wrapper bg-slate-50/50">
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
            06. Support & Téléchargements
          </p>
          <h2 className="section-title">Ressources gratuites</h2>
          <p className="section-subtitle">
            Des fiches méthodologiques, exercices corrigés et guides pratiques offerts pour accompagner le travail des élèves.
          </p>

          {/* Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mt-2">
            <Sparkles size={16} className="text-emerald-500" />
            Accès libre et téléchargement gratuit
          </div>
        </motion.div>

        {/* Resource card grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {posts.map((post) => (
            <motion.div
              key={post.title}
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -6 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="glass-card overflow-hidden flex flex-col cursor-default relative"
            >
              {/* Free badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-xs font-inter font-semibold backdrop-blur-sm">
                  Gratuit
                </span>
              </div>

              {/* Card header gradient */}
              <div className={`h-32 bg-gradient-to-br ${post.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />
                <span className="text-5xl relative z-10">{post.icon}</span>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Tag */}
                <span className={`self-start font-inter text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${tagColors[post.tag] || 'bg-slate-100 text-slate-700'}`}>
                  {post.tag}
                </span>

                <h3 className="font-space font-bold text-slate-900 text-sm leading-snug mb-2 flex-1">
                  {post.title}
                </h3>

                <p className="font-inter text-slate-500 text-xs leading-relaxed mb-4">
                  {post.summary}
                </p>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={scrollToContact}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-colors"
                  >
                    <Download size={13} />
                    Demander cette fiche
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
