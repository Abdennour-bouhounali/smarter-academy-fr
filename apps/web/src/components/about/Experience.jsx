import { motion } from 'framer-motion';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { experience } from '../../data/experience';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export default function Experience() {
  return (
    <section id="experience" className="section-wrapper">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono-jetbrains text-blue-500 text-sm font-semibold tracking-widest uppercase mb-3">
            Parcours & Expériences
          </p>
          <h2 className="section-title">Expérience Pédagogique</h2>
          <p className="section-subtitle">
            Plus de 5 ans d'enseignement des mathématiques au lycée et en cours particuliers.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px timeline-line hidden md:block" />

          <div className="space-y-10">
            {experience.map((exp, i) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: 'easeOut' }}
                className="relative md:ml-20"
              >
                {/* Timeline dot */}
                <div className="absolute -left-[4.75rem] top-6 hidden md:flex items-center justify-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-white shadow-md bg-gradient-to-br ${exp.color}`}
                  />
                  <div
                    className={`absolute w-8 h-8 rounded-full opacity-20 bg-gradient-to-br ${exp.color}`}
                  />
                </div>

                {/* Card */}
                <motion.div
                  whileHover={{ scale: 1.01, y: -3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="glass-card p-6 sm:p-8 relative overflow-hidden"
                >
                  {/* Top gradient line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${exp.color}`} />

                  {/* Company + Date row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-space font-bold text-xl text-slate-900">{exp.company}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin size={13} className="text-slate-400" />
                        <span className="font-inter text-slate-400 text-sm">{exp.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 self-start">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="font-mono-jetbrains text-xs text-slate-500">{exp.date}</span>
                    </div>
                  </div>

                  {/* Role */}
                  <p className={`font-space font-semibold text-base mb-4 bg-gradient-to-r ${exp.color} bg-clip-text text-transparent`}>
                    {exp.role}
                  </p>

                  {/* Description bullets */}
                  <ul className="space-y-2 mb-5">
                    {exp.description.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 font-inter text-slate-600 text-sm leading-relaxed">
                        <ChevronRight size={14} className="text-blue-400 flex-shrink-0 mt-1" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Tech chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {exp.tech.map((t) => (
                      <span
                        key={t}
                        className="font-inter text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Highlight */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${exp.color} bg-opacity-10`}
                    style={{ background: 'rgba(59,130,246,0.06)' }}>
                    <span className="text-sm">🏆</span>
                    <span className="font-inter text-sm font-semibold text-slate-700">{exp.highlight}</span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
