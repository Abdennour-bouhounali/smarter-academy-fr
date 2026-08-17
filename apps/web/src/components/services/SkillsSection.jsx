import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { skills } from '../../data/skills';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export default function SkillsSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...skills.map((s) => s.category)];

  const filteredSkills = activeCategory === 'All'
    ? skills
    : skills.filter((s) => s.category === activeCategory);

  return (
    <section id="skills" className="section-wrapper bg-slate-50/50">
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
            02. Niveaux & Programme
          </p>
          <h2 className="section-title">Ce que j'enseigne</h2>
          <p className="section-subtitle">
            Un enseignement rigoureux et adapté du Collège aux spécialités scientifiques du Lycée et du Supérieur.
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 justify-center mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-inter text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? 'text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
              }`}
              style={activeCategory === cat ? {
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                boxShadow: '0 4px 14px rgba(59,130,246,0.3)'
              } : {}}
            >
              {cat === 'All' ? '✦ Tous les niveaux' : skills.find(s => s.category === cat)?.icon + ' ' + cat}
            </button>
          ))}
        </motion.div>

        {/* Skills grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
          >
            {filteredSkills.map((skillCat) => (
              <motion.div
                key={skillCat.category}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="glass-card p-6 relative overflow-hidden"
              >
                {/* Background gradient accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${skillCat.color}`}
                />
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.06]"
                  style={{ background: `linear-gradient(135deg, ${skillCat.glowColor}, transparent)` }}
                />

                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{skillCat.icon}</span>
                  <div>
                    <h3 className="font-space font-bold text-slate-800 text-base leading-tight">
                      {skillCat.category}
                    </h3>
                    <p className="font-mono-jetbrains text-xs text-slate-400">
                      {skillCat.items.length} notions & formats
                    </p>
                  </div>
                </div>

                {/* Skill chips */}
                <div className="flex flex-wrap gap-2">
                  {skillCat.items.map((skill) => (
                    <motion.span
                      key={skill}
                      whileHover={{ scale: 1.05 }}
                      className={`tech-chip bg-gradient-to-r ${skillCat.color} text-white px-3 py-1.5 text-xs shadow-sm font-inter`}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
