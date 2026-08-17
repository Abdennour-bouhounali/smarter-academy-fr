import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Lightbulb, Sliders, LineChart, Target, MapPin, Mail, Phone } from 'lucide-react';
import profileImg from '../../assets/myimage.webp';

const whatIDo = [
  {
    icon: Lightbulb,
    label: 'Explications simples',
    desc: 'Démystifier les notions complexes avec une pédagogie claire, illustrée et accessible à chaque élève.'
  },
  {
    icon: Sliders,
    label: 'Méthode personnalisée',
    desc: 'Un accompagnement sur-mesure adapté au rythme, au niveau et au mode d\'apprentissage de votre enfant.'
  },
  {
    icon: LineChart,
    label: 'Suivi régulier',
    desc: 'Un bilan d\'avancement systématique après chaque séance pour mesurer les progrès et informer les parents.'
  },
  {
    icon: Target,
    label: 'Objectif réussite',
    desc: 'Préparation ciblée aux devoirs surveillés, contrôles et examens officiels (Brevet DNB et Baccalauréat).'
  },
];

const stats = [
  { value: 5, suffix: '+ ans', label: "D'expérience" },
  { value: 150, suffix: '+', label: 'Élèves accompagnés' },
  { value: 7, suffix: ' niveaux', label: 'Du Collège au Lycée' },
  { value: 100, suffix: '%', label: 'En ligne & À domicile' },
];

function CountUp({ target, suffix, inView }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span>{count}{suffix}</span>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function AboutSection() {
  const ref = useRef(null);
  const statsRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-50px' });

  return (
    <section id="about" className="section-wrapper">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={ref}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono-jetbrains text-blue-500 text-sm font-semibold tracking-widest uppercase mb-3">
            01. Présentation
          </p>
          <h2 className="section-title">À propos du Fondateur</h2>
          <p className="section-subtitle">
            Découvrez le parcours et la vision d'Abdennour BOUHOUNALI, créateur de Smarter Academy.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16"
        >
          {/* Left — Bio + Pillars */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg text-white"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                  👨‍🏫
                </div>
                <h3 className="font-space text-xl font-bold text-slate-800">Abdennour BOUHOUNALI</h3>
              </div>

              <p className="font-inter text-slate-600 leading-relaxed mb-4">
                En tant que fondateur de Smarter Academy, diplômé d'un Master 2 de l'Université de Toulouse III et d'un diplôme d'Ingénieur, ma mission est de rendre l'excellence accessible à tous. J'ai conçu cette plateforme pour transmettre la méthode, la rigueur et la confiance nécessaires à la réussite de chaque élève.
              </p>
              <p className="font-inter text-slate-600 leading-relaxed">
                Fort de plus de 5 ans d'expérience en lycée et en cours particuliers, j'adapte chaque séance au profil de l'élève pour débloquer les difficultés et viser l'excellence.
              </p>

              {/* Differentiator banner */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-150">
                <p className="font-inter text-xs text-slate-700 font-medium leading-relaxed">
                  💡 <strong className="text-blue-600">Mon atout :</strong> Mon double parcours scientifique me permet d'apporter une vision concrète, structurée et logique de chaque concept mathématique.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-5 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <MapPin size={14} className="text-blue-500" />
                  <span>Toulouse, Paris & En ligne (France)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Mail size={14} className="text-blue-500" />
                  <a href="mailto:abdennour.bouhounali@gmail.com" className="hover:text-blue-600 transition-colors">
                    abdennour.bouhounali@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Phone size={14} className="text-blue-500" />
                  <a href="tel:+33758103086" className="hover:text-blue-600 transition-colors font-medium">
                    +33 7 58 10 30 86
                  </a>
                </div>
              </div>
            </div>

            {/* 4 Pillars */}
            <div className="space-y-3">
              {whatIDo.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="glass-card p-4 flex items-start gap-4 cursor-default"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                    <item.icon size={17} className="text-white" />
                  </div>
                  <div>
                    <p className="font-space font-semibold text-slate-800 text-sm">{item.label}</p>
                    <p className="font-inter text-slate-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Glass card + Stats */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Profile Image with badges */}
            <div className="flex justify-center mb-6 md:mb-10">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
                {/* Gradient ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400" style={{ padding: '3px' }}>
                  <div className="w-full h-full rounded-full bg-white" />
                </div>

                {/* Profile image */}
                <div className="absolute inset-[4px] rounded-full overflow-hidden bg-slate-100">
                  <img
                    src={profileImg}
                    alt="Abdennour BOUHOUNALI — Enseignant"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Static badge — top right */}
                <div className="absolute -top-3 -right-3 bg-white rounded-2xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 shadow-lg border border-slate-100 flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg">📐</span>
                  <span className="font-space text-[10px] sm:text-xs font-bold text-slate-800">5+ Ans Exp.</span>
                </div>

                {/* Static badge — bottom left */}
                <div className="absolute -bottom-3 -left-3 bg-white rounded-2xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 shadow-lg border border-slate-100 flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg">🏆</span>
                  <span className="font-space text-[10px] sm:text-xs font-bold text-slate-800">Bac 17/20</span>
                </div>

                {/* IEEE/Degree badge */}
                <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 shadow-lg flex items-center gap-1">
                  <span className="text-white text-[10px] sm:text-xs font-bold">Ingénieur & M2</span>
                </div>
              </div>
            </div>

            {/* Animated counters */}
            <div ref={statsRef} className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="glass-card p-5 text-center"
                >
                  <div className="font-space font-bold text-3xl sm:text-4xl gradient-text-blue-purple mb-1">
                    <CountUp target={stat.value} suffix={stat.suffix} inView={statsInView} />
                  </div>
                  <p className="font-inter text-slate-500 text-xs font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
