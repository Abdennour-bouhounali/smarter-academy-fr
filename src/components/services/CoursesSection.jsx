import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, ArrowRight, BookOpen } from 'lucide-react';
import { projects, domainGradients, domainIcons, domainColors } from '../../data/projects';

const domains = ['All', 'Collège', 'Lycée', 'Préparation Bac', 'Remise à niveau'];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } }
};

function CourseImage({ domain, images }) {
  const [idx, setIdx] = useState(0);
  const hasImages = images && images.length > 0;

  if (!hasImages) {
    const gradient = domainGradients[domain] || 'from-blue-600 to-indigo-500';
    const icon = domainIcons[domain] || '📚';
    return (
      <div className={`w-full h-44 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center relative overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
        <span className="text-5xl mb-2 relative z-10">{icon}</span>
        <span className="font-mono-jetbrains text-white/90 text-xs font-semibold tracking-wider uppercase relative z-10">{domain}</span>
      </div>
    );
  }

  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); };

  return (
    <div className="relative w-full h-44 overflow-hidden bg-slate-900 group">
      <img
        key={idx}
        src={images[idx]}
        alt={`Aperçu du cours ${idx + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={(e) => { e.target.style.display = 'none'; }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="Image précédente"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={next}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="Image suivante"
          >
            <ChevronRight size={15} />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === idx ? 'bg-white w-3' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursesSection() {
  const [activeDomain, setActiveDomain] = useState('All');

  const filtered = activeDomain === 'All'
    ? projects
    : projects.filter((p) => p.domain === activeDomain);

  return (
    <section id="projects" className="section-wrapper">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-mono-jetbrains text-blue-500 text-sm font-semibold tracking-widest uppercase mb-3">
            03. Offres de Cours
          </p>
          <h2 className="section-title">Mes cours</h2>
          <p className="section-subtitle">
            Des cours de mathématiques adaptés du Collège au Lycée, avec une préparation spécifique pour le Brevet et le Bac.
          </p>
        </motion.div>

        {/* Category filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 justify-center mb-10"
        >
          {domains.map((domain) => (
            <button
              key={domain}
              onClick={() => setActiveDomain(domain)}
              className={`px-4 py-2 rounded-full font-inter text-sm font-medium transition-all duration-300 ${
                activeDomain === domain
                  ? 'text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
              }`}
              style={activeDomain === domain ? {
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                boxShadow: '0 4px 14px rgba(59,130,246,0.3)'
              } : {}}
            >
              {domain === 'All' ? '✦ Tous les cours' : ((domainIcons[domain] || '📚') + ' ' + domain)}
            </button>
          ))}
        </motion.div>

        {/* Courses grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDomain}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((course) => (
              <motion.div
                key={course.id}
                variants={cardVariants}
                whileHover={{ scale: 1.03, y: -6 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="glass-card overflow-hidden flex flex-col"
              >
                {/* Course image / gradient placeholder */}
                <CourseImage domain={course.domain} images={course.images} />

                {/* Card content */}
                <div className="flex-1 p-6 flex flex-col">
                  {/* Category & Level badges */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`font-inter text-xs font-semibold px-2.5 py-1 rounded-full ${domainColors[course.domain]}`}>
                      {course.domain}
                    </span>
                    <span className="font-mono-jetbrains text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {course.level}
                    </span>
                    {course.featured && (
                      <span className="flex items-center gap-1 font-inter text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                        <Star size={10} fill="currentColor" />
                        Recommandé
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-space font-bold text-slate-900 text-lg mb-2 leading-snug">
                    {course.name}
                  </h3>

                  {/* Short description */}
                  <p className="font-inter text-slate-600 text-sm leading-relaxed flex-1 mb-4">
                    {course.description}
                  </p>

                  {/* Topics covered */}
                  <div className="mb-4">
                    <p className="font-mono-jetbrains text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                      Notions clés couvertes :
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {course.tech.map((topic) => (
                        <span
                          key={topic}
                          className="font-inter text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Award badge */}
                  {course.award && (
                    <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                      <span className="text-sm">🏆</span>
                      <span className="font-inter text-xs font-semibold text-amber-700">{course.award}</span>
                    </div>
                  )}

                  {/* CTA button: Découvrir */}
                  <div className="pt-4 border-t border-slate-100">
                    <Link
                      to="/contact"
                      className="w-full btn-primary text-xs flex items-center justify-center gap-2 py-2.5"
                    >
                      <BookOpen size={14} />
                      Découvrir ce cours
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
