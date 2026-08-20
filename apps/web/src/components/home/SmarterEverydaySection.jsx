import { motion } from 'framer-motion';

const LINES = [
  'Une petite découverte aujourd\'hui.',
  'Une difficulté surmontée demain.',
  'Une notion enfin comprise.',
  "Un problème que l'on réussit seul.",
  'Puis un autre.',
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};
const lineVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function SmarterEverydaySection() {
  return (
    <section className="relative z-10 py-20 sm:py-28 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-mono-jetbrains text-cyan-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-10"
        >
          Smarter Everyday
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-3 mb-12"
        >
          {LINES.map((line) => (
            <motion.p key={line} variants={lineVariants} className="font-space font-medium text-xl sm:text-2xl text-slate-200 leading-snug">
              {line}
            </motion.p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 150 }}
          className="pt-8 border-t border-white/10 inline-block"
        >
          <p className="font-space font-bold text-2xl sm:text-3xl text-white leading-snug text-balance">
            Chaque jour un peu plus loin.
          </p>
          <p className="font-space font-bold text-2xl sm:text-3xl gradient-text leading-snug text-balance mt-1">
            Chaque jour un peu plus capable.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
