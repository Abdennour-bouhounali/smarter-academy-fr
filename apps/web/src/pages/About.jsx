import { motion } from 'framer-motion';
import { Search, Hand, FlaskConical, XCircle, Lightbulb, Brain, Quote } from 'lucide-react';
import ClosingStatement from '../components/home/ClosingStatement';
import FounderNote from '../components/about/FounderNote';
import CtaBanner from '../components/common/CtaBanner';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const wants = [
  { icon: Search, label: 'chercher' },
  { icon: Hand, label: 'manipuler' },
  { icon: FlaskConical, label: 'expérimenter' },
  { icon: XCircle, label: 'se tromper' },
  { icon: Lightbulb, label: 'découvrir' },
  { icon: Brain, label: 'comprendre' },
];

export default function AboutPage() {
  useDocumentMeta(
    'Notre mission',
    "Notre mission : rendre une éducation mathématique exceptionnelle accessible au plus grand nombre — au-delà des notes."
  );

  return (
    <div className="pt-16">
      {/* Opening statement */}
      <section className="py-20 sm:py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative max-w-3xl mx-auto"
        >
          <p className="font-mono-jetbrains text-blue-500 text-sm font-semibold tracking-widest uppercase mb-6">
            Notre mission
          </p>
          <h1 className="font-space font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight text-balance mb-8">
            Et si apprendre les mathématiques pouvait changer bien plus que les notes ?
          </h1>
          <p className="font-inter text-slate-600 text-lg leading-relaxed max-w-xl mx-auto">
            Les mathématiques ne sont pas faites pour être récitées. Elles sont faites pour être comprises.
          </p>
        </motion.div>
      </section>

      {/* What we want students to do + ambition — one moment, not two */}
      <section className="section-wrapper pt-0">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-inter text-slate-500 text-base mb-8"
          >
            Nous voulons que chaque élève ose
          </motion.p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {wants.map((w, i) => (
              <motion.span
                key={w.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm font-space font-semibold text-slate-700 text-sm sm:text-base"
              >
                <w.icon size={16} className="text-blue-500" />
                {w.label}
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card inline-flex flex-col items-center gap-3 px-10 py-8 max-w-md mx-auto mb-14"
          >
            <Quote size={22} className="text-blue-300" />
            <p className="font-space font-bold text-2xl sm:text-3xl gradient-text-blue-purple">
              « Je sais pourquoi. »
            </p>
            <p className="font-inter text-slate-400 text-xs uppercase tracking-widest font-semibold">
              Le sentiment que nous visons
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="font-space font-bold text-2xl sm:text-3xl text-slate-900 leading-snug text-balance mb-3">
              Nous ne voulons pas seulement préparer des élèves à réussir leurs examens.
            </p>
            <p className="font-space font-bold text-2xl sm:text-3xl gradient-text leading-snug text-balance">
              Former une génération capable de comprendre, d'imaginer et de construire.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission statement */}
      <section className="relative z-10 py-20 sm:py-28 px-4 bg-slate-900 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-2xl mx-auto"
        >
          <p className="font-mono-jetbrains text-blue-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-6">
            Ce que nous voulons construire
          </p>
          <p className="font-space font-bold text-3xl sm:text-4xl text-white leading-snug text-balance">
            Une éducation exceptionnelle.
          </p>
          <p className="font-space font-bold text-3xl sm:text-4xl gradient-text leading-snug text-balance mt-1">
            Accessible au plus grand nombre.
          </p>
        </motion.div>
      </section>

      <FounderNote />

      <ClosingStatement />

      <CtaBanner
        eyebrow="Rejoignez l'aventure"
        title="Aide-nous à donner le goût d'apprendre"
        subtitle="Crée ton compte gratuit et fais partie des premiers élèves Smarter Academy."
        primaryLabel="Commencer gratuitement"
        primaryTo="/register"
      />
    </div>
  );
}
