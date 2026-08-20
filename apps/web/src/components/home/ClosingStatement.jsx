import { motion } from 'framer-motion';

export default function ClosingStatement() {
  return (
    <section className="relative z-10 py-24 sm:py-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto text-center"
      >
        <p className="font-space font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-snug text-balance mb-3">
          Le monde de demain aura besoin de personnes capables de comprendre, d'imaginer et de construire.
        </p>
        <p className="font-space font-semibold text-lg sm:text-xl text-slate-500 leading-snug text-balance">
          Commençons par leur donner le goût d'apprendre.
        </p>
      </motion.div>
    </section>
  );
}
