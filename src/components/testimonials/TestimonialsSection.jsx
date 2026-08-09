import { motion } from 'framer-motion';
import { Star, MessageSquareQuote, Calendar, UserCheck } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Sophie M. (Maman de Thomas)",
    level: "Terminale Spé Maths",
    review: "Grâce aux cours d'Abdennour, Thomas est passé de 9/20 à 16/20 en Spécialité Maths. Sa méthode très structurée et ses rédactions types ont redonné confiance à notre fils juste avant le Bac.",
    rating: 5,
    date: "Juin 2025",
    color: "from-blue-500 to-cyan-500",
    badgeColor: "bg-blue-100 text-blue-700"
  },
  {
    id: 2,
    name: "Lucas B.",
    level: "3ème — Préparation Brevet",
    review: "Un super professeur ! Les cours m'ont énormément aidé pour la géométrie et le calcul littéral. J'ai obtenu la mention Très Bien au Brevet avec 18/20 en mathématiques. Merci encore !",
    rating: 5,
    date: "Juillet 2025",
    color: "from-purple-500 to-pink-500",
    badgeColor: "bg-purple-100 text-purple-700"
  },
  {
    id: 3,
    name: "Claire & Marc D.",
    level: "1ère Spécialité Maths",
    review: "Un suivi extrêmement rigoureux avec un bilan clair envoyé après chaque séance. Abdennour sait parfaitement s'adapter et faire sauter les blocages. Nous le recommandons à 100%.",
    rating: 5,
    date: "Mai 2025",
    color: "from-emerald-500 to-teal-500",
    badgeColor: "bg-emerald-100 text-emerald-700"
  }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } }
};

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="section-wrapper bg-slate-50/50">
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
            Témoignages
          </p>
          <h2 className="section-title">Avis des élèves & Parents</h2>
          <p className="section-subtitle">
            Retours d'expérience et témoignages certifiés sur la progression et les résultats obtenus.
          </p>
        </motion.div>

        {/* Testimonials 3-Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -6 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="glass-card p-6 flex flex-col relative overflow-hidden justify-between"
            >
              {/* Top Accent Gradient Bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />

              <div>
                {/* Header info: Rating + Level badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>

                  <span className={`font-inter text-xs font-semibold px-2.5 py-1 rounded-full ${item.badgeColor}`}>
                    {item.level}
                  </span>
                </div>

                {/* Quote Icon */}
                <div className="mb-3 text-slate-300">
                  <MessageSquareQuote size={28} />
                </div>

                {/* Review Text */}
                <p className="font-inter text-slate-600 text-sm leading-relaxed mb-6 italic">
                  "{item.review}"
                </p>
              </div>

              {/* Card Footer: Student/Parent Name & Date */}
              <div className="pt-4 border-t border-slate-100/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${item.color}`}>
                    <UserCheck size={14} />
                  </div>
                  <div>
                    <h4 className="font-space font-bold text-slate-900 text-xs sm:text-sm">
                      {item.name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400 text-xs font-mono-jetbrains flex-shrink-0">
                  <Calendar size={12} />
                  <span>{item.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
