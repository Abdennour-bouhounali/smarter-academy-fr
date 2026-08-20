import { motion } from 'framer-motion';
import {
  Compass, MapPin, Hand, Eye, HelpCircle, Lightbulb, FunctionSquare, Repeat2, Shuffle, Trophy, Sparkles,
} from 'lucide-react';
import CtaBanner from '../components/common/CtaBanner';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

// Each step already carries its "why" — no separate pillar grid repeating
// the same nine ideas from a second angle. One structure, not two.
const STEPS = [
  { icon: MapPin, title: 'Situation concrète', desc: "Tout part d'un problème réel — jamais d'une formule posée à froid." },
  { icon: Hand, title: 'Manipuler', desc: 'Avant toute règle, un geste : glisser, construire, découper. Les mains comprennent avant que la tête ne formalise.' },
  { icon: Eye, title: 'Observer', desc: "Une droite qui bouge, une fraction qui se partage — l'élève voit la notion avant de la nommer." },
  { icon: HelpCircle, title: 'Questionner', desc: 'Pourquoi ça marche ? Est-ce que ça marche toujours ? Se tromper ici fait partie du chemin, jamais une sanction.' },
  { icon: Lightbulb, title: 'Découvrir', desc: "La règle n'est jamais donnée en premier. Elle est trouvée — et ce qu'on trouve soi-même, on ne l'oublie pas." },
  { icon: FunctionSquare, title: 'Comprendre', desc: "Une fois le sens acquis vient l'écriture rigoureuse — la formule devient un résumé, pas un point de départ mystérieux." },
  { icon: Repeat2, title: 'Pratiquer', desc: 'Des exercices qui varient, jamais mécaniques — avec une correction immédiate, adaptée à l\'erreur précise commise.' },
  { icon: Shuffle, title: 'Appliquer', desc: 'Savoir résoudre un exercice type ne suffit pas : il faut reconnaître la même idée ailleurs.' },
  { icon: Trophy, title: 'Maîtriser', desc: "Résoudre seul, avec confiance, sans avoir besoin qu'on rappelle la méthode." },
];

export default function Methode() {
  useDocumentMeta(
    'Notre méthode',
    "Apprendre les mathématiques en les faisant : la méthode Smarter Academy, de la manipulation à la maîtrise."
  );

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="py-16 sm:py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-5">
              <Compass size={14} />
              Notre méthode
            </div>
            <h1 className="font-space font-bold text-4xl sm:text-5xl text-slate-900 mb-5 text-balance">
              Apprendre les mathématiques en les faisant
            </h1>
            <p className="font-inter text-slate-600 text-lg leading-relaxed">
              Pas de cours magistral à écouter en silence. Une boucle active, répétée à chaque leçon.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The loop — unified grid, one structure not two */}
      <section className="section-wrapper pt-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: (i % 3) * 0.07, duration: 0.4 }}
              whileHover={{ y: -3 }}
              className="glass-card p-6 relative overflow-hidden"
            >
              <span className="absolute top-4 right-5 font-mono-jetbrains text-2xl font-black text-slate-100 select-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4 relative"
                style={{ background: i === STEPS.length - 1 ? 'linear-gradient(135deg, #F59E0B, #F97316)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
              >
                <step.icon size={20} />
              </div>
              <h3 className="font-space font-bold text-slate-900 text-base mb-2 relative">{step.title}</h3>
              <p className="font-inter text-slate-500 text-sm leading-relaxed relative">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Core conviction */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center glass-card p-9 sm:p-12"
        >
          <Sparkles className="mx-auto mb-5 text-blue-400" size={26} />
          <p className="font-space font-bold text-xl sm:text-2xl text-slate-900 leading-snug text-balance mb-2">
            Nous ne voulons pas seulement que l'élève sache quoi faire.
          </p>
          <p className="font-space font-bold text-xl sm:text-2xl gradient-text-blue-purple leading-snug text-balance">
            Nous voulons qu'il sache pourquoi.
          </p>
        </motion.div>
      </section>

      <CtaBanner
        eyebrow="À toi d'essayer"
        title="Vis cette méthode plutôt que d'en lire la description"
        subtitle="La meilleure façon de comprendre notre méthode, c'est de commencer une leçon."
        primaryLabel="Explorer les cours"
        primaryTo="/courses"
        secondaryLabel="Commencer gratuitement"
        secondaryTo="/register"
      />
    </div>
  );
}
