import { useRef, useState } from 'react';
import {
  AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform,
} from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Compass, MapPin, Hand, Eye, HelpCircle, Lightbulb, FunctionSquare, Repeat2, Shuffle, Trophy, ChevronDown, ClipboardCheck,
} from 'lucide-react';
import CtaBanner from '../components/common/CtaBanner';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

// La page est un VOYAGE au défilement : un même élève traverse les neuf
// étapes de la boucle, regroupées en trois actes, jusqu'au sommet (الإتقان).
// Chaque étape garde son « pourquoi » (desc) et gagne un récit (story) — un
// seul fil narratif, VÉCU SUR LA PLATEFORME : la leçon réelle « التعرّف على
// قاسم لعدد طبيعي ». Le récit ne promet que ce que la leçon fait vraiment ; si
// elle change, le récit ET les captures suivent.
// Les libellés vivent dans le namespace `marketing` (method.*). Les STATIONS
// montrent des captures d'écran de la plateforme (public/images/methode/lesson/).
// Aucune image générée (décision du propriétaire, 2026-10-07) : le héros et le
// sommet sont typographiques — sobres, professionnels.
// Toute animation de déplacement se coupe sous prefers-reduced-motion.
const IMG = (id) => `/images/methode/lesson/${id}.webp`; // captures réelles

const ACTS = [
  { id: 'touch', steps: [{ id: 'situation', icon: MapPin }, { id: 'manipulate', icon: Hand }, { id: 'observe', icon: Eye }] },
  { id: 'grasp', steps: [{ id: 'question', icon: HelpCircle }, { id: 'discover', icon: Lightbulb }, { id: 'understand', icon: FunctionSquare }] },
  { id: 'own', steps: [{ id: 'practice', icon: Repeat2 }, { id: 'apply', icon: Shuffle }, { id: 'test', icon: ClipboardCheck }] },
];
const STATIONS = ACTS.flatMap((a) => a.steps);
// La dernière station, la seule en fond sombre : الإتقان, l'espace d'exercices
// réel (même leçon). Son image est la feuille d'examen : `shot` la désigne.
const GOLD = { id: 'master', icon: Trophy, n: STATIONS.length + 1, shot: 'exercises' };
const ALL_STOPS = [...STATIONS, GOLD];
const EXERCISE_LEVELS = [1, 2, 3, 4, 5];

const pad = (n) => String(n).padStart(2, '0');
const EASE = [0.22, 1, 0.36, 1];

// Révélation mot à mot : on découpe aux espaces (jamais à la lettre — les
// lettres arabes sont liées), chaque mot monte depuis un masque. Le déclencheur
// « in view » est sur le conteneur : un mot caché sous son masque n'intersecte
// jamais le viewport, il ne pourrait pas se déclencher lui-même.
const MotionTags = { span: motion.span, h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p };

function WordReveal({ text, className, delay = 0, reduce, as = 'span' }) {
  const Tag = MotionTags[as];
  const words = text.split(' ');
  const word = {
    hidden: reduce ? { opacity: 0 } : { y: '110%', opacity: 0 },
    show: (i) => ({ y: '0%', opacity: 1, transition: { duration: 0.7, ease: EASE, delay: delay + i * 0.06 } }),
  };
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
          <motion.span className="inline-block" custom={i} variants={word}>
            {w}
          </motion.span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </Tag>
  );
}

// Formes géométriques flottantes : chacune dérive à sa propre vitesse avec le
// défilement — le décor du voyage, rappel des carreaux de l'histoire.
const SHAPES = [
  { top: '6%', side: '4%', size: 46, kind: 'square', speed: -160, rot: 120, color: '#93C5FD' },
  { top: '18%', side: '88%', size: 34, kind: 'triangle', speed: -260, rot: -90, color: '#C4B5FD' },
  { top: '33%', side: '8%', size: 26, kind: 'circle', speed: -120, rot: 0, color: '#FCD34D' },
  { top: '47%', side: '92%', size: 52, kind: 'square', speed: -300, rot: 200, color: '#A5B4FC' },
  { top: '62%', side: '3%', size: 38, kind: 'triangle', speed: -200, rot: 140, color: '#93C5FD' },
  { top: '76%', side: '86%', size: 28, kind: 'circle', speed: -150, rot: 0, color: '#C4B5FD' },
  { top: '90%', side: '10%', size: 42, kind: 'square', speed: -240, rot: -160, color: '#FCD34D' },
];

function FloatingShape({ shape, progress, reduce }) {
  const y = useTransform(progress, [0, 1], [0, reduce ? 0 : shape.speed]);
  const rotate = useTransform(progress, [0, 1], [0, reduce ? 0 : shape.rot]);
  const s = shape.size;
  return (
    <motion.svg
      aria-hidden
      width={s}
      height={s}
      viewBox="0 0 40 40"
      style={{ y, rotate, top: shape.top, insetInlineStart: shape.side }}
      className="absolute hidden md:block opacity-60"
    >
      {shape.kind === 'square' && <rect x="6" y="6" width="28" height="28" rx="5" fill="none" stroke={shape.color} strokeWidth="3" />}
      {shape.kind === 'triangle' && <path d="M20 5 L36 34 L4 34 Z" fill="none" stroke={shape.color} strokeWidth="3" strokeLinejoin="round" />}
      {shape.kind === 'circle' && <circle cx="20" cy="20" r="14" fill="none" stroke={shape.color} strokeWidth="3" />}
    </motion.svg>
  );
}

function Hero({ reduce }) {
  const { t } = useTranslation('marketing');
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['0%', '-30%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const all = ALL_STOPS;

  return (
    <section ref={ref} className="relative min-h-[calc(100svh-4rem)] flex flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* Fond sobre : une grille de cahier qui s'efface vers les bords */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{ backgroundImage: 'linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 max-w-3xl text-center"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-6"
        >
          <Compass size={14} />
          {t('method.eyebrow')}
        </div>
        <h1 className="font-space font-bold text-4xl sm:text-6xl text-slate-900 mb-6 text-balance leading-tight">
          {t('method.title')}
        </h1>
        <p className="font-inter text-slate-600 text-lg sm:text-xl leading-relaxed mb-12">
          {t('method.subtitle')}
        </p>

        {/* Le héros s'affiche vite : UN SEUL fondu bref sur tout le bloc,
            jamais neuf animations en cascade (le lecteur attendait ~1,5 s la
            dernière pastille). Le défilement l'anime ensuite (fondu et montée). */}
        {/* La carte du voyage : les neuf stations, d'un coup d'œil */}
        <ol className="flex flex-wrap justify-center gap-2" aria-label={t('method.eyebrow')}>
          {all.map((s) => {
            const Icon = s.icon;
            const last = s.id === GOLD.id;
            return (
              <li
                key={s.id}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-inter font-semibold ${last ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600'}`}
              >
                <Icon size={14} className={last ? 'text-amber-500' : 'text-violet-500'} />
                {t(`method.steps.${s.id}.title`)}
              </li>
            );
          })}
        </ol>
      </motion.div>
      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute bottom-8 inset-x-0 z-10 flex flex-col items-center gap-1 text-slate-500 text-sm font-inter font-semibold"
      >
        {t('method.scrollHint')}
        <motion.span animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
          <ChevronDown size={22} />
        </motion.span>
      </motion.div>
    </section>
  );
}

function ActHeader({ act, index, reduce }) {
  const { t } = useTranslation('marketing');
  return (
    <div className="relative z-10 my-16 sm:my-28 flex justify-center">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="relative max-w-md w-full text-center glass-card !bg-white/95 px-8 py-8 overflow-hidden"
      >
        <span aria-hidden className="absolute -top-6 end-3 font-mono-jetbrains text-[7rem] font-black text-slate-100 leading-none select-none">
          {index + 1}
        </span>
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          style={{ transformOrigin: 'center' }}
          className="block mx-auto mb-3 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
        />
        <span className="relative font-mono-jetbrains text-xs font-semibold tracking-wider text-blue-600">{t(`method.acts.${act}.label`)}</span>
        <WordReveal
          as="h2"
          text={t(`method.acts.${act}.title`)}
          delay={0.15}
          reduce={reduce}
          className="relative block font-space font-bold text-3xl sm:text-4xl text-slate-900 mt-1 mb-2"
        />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative font-inter text-slate-500 leading-relaxed"
        >
          {t(`method.acts.${act}.lead`)}
        </motion.p>
      </motion.div>
    </div>
  );
}

// L'ÉCRAN RÉEL de la leçon, dans un cadre de fenêtre. Une capture plus haute
// que le cadre DÉFILE d'elle-même pendant que la station traverse la vue :
// l'élève-lecteur « parcourt » le module comme s'il le faisait défiler.
const FRAME_MAX = 520;
// Dimensions des captures : réservent la place avant le
// chargement, sinon la page saute sous le lecteur pendant le défilement.
const SHOT_SIZE = {
  situation: [1400, 623], manipulate: [1400, 1267], observe: [1400, 1376], question: [1400, 447],
  discover: [1400, 1320], understand: [1400, 1101], practice: [1400, 1261], apply: [1400, 1554],
  exercises: [1400, 619], test: [1400, 1685],
};

function ScreenFrame({ step, n, progress, reduce }) {
  const { t } = useTranslation('marketing');
  const overflow = useRef(0);
  const innerY = useTransform(progress, (p) => {
    if (reduce) return 0;
    const k = Math.min(1, Math.max(0, (p - 0.3) / 0.4));
    return -k * overflow.current;
  });
  const onLoad = (e) => {
    const img = e.currentTarget;
    overflow.current = Math.max(0, img.offsetHeight - FRAME_MAX);
  };

  return (
    <div className="group relative rounded-[22px] bg-white shadow-2xl shadow-violet-200/70 ring-1 ring-slate-200/80 overflow-hidden">
      <div dir="ltr" className="flex items-center gap-1.5 px-4 h-9 bg-slate-50 border-b border-slate-200/80">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
        <span dir="rtl" className="mx-auto text-[11px] font-inter font-semibold text-slate-400">{t('method.screenLabel')}</span>
        <span className="font-mono-jetbrains text-[11px] font-black text-violet-400">{pad(n)}</span>
      </div>
      <div className="relative overflow-hidden" style={{ maxHeight: FRAME_MAX }}>
        <motion.img
          src={IMG(step.shot ?? step.id)}
          alt={t(`method.steps.${step.id}.alt`)}
          loading="lazy"
          decoding="async"
          width={SHOT_SIZE[step.shot ?? step.id][0]}
          height={SHOT_SIZE[step.shot ?? step.id][1]}
          onLoad={onLoad}
          style={{ y: innerY }}
          className="block w-full h-auto"
        />
        {/* Reflet qui balaie l'écran à son apparition */}
        {!reduce && (
          <motion.div
            aria-hidden
            initial={{ x: '-120%' }}
            whileInView={{ x: '120%' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.6 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-12deg]"
          />
        )}
      </div>
    </div>
  );
}

function Station({ step, n, flip, reduce, onEnter, children }) {
  const { t } = useTranslation('marketing');
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const tilt = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [0, 0, 0] : [flip ? -3 : 3, 0, flip ? 2 : -2]);
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      onViewportEnter={() => onEnter(n)}
      viewport={{ margin: '-45% 0px -45% 0px' }}
      className="relative grid lg:grid-cols-2 gap-6 lg:gap-20 items-center ps-12 lg:ps-0 py-10 lg:py-16"
    >
      {/* Nœud sur le chemin : s'allume (ressort + halo) quand la station est au centre */}
      <span className="absolute z-10 start-[11px] lg:start-1/2 lg:-translate-x-1/2 rtl:lg:translate-x-1/2 top-12 lg:top-1/2 lg:-translate-y-1/2 w-4 h-4">
        <motion.span
          initial={{ scale: 0.4, backgroundColor: '#E2E8F0' }}
          whileInView={{ scale: 1, backgroundColor: '#8B5CF6' }}
          viewport={{ margin: '-45% 0px -45% 0px' }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="absolute inset-0 rounded-full ring-4 ring-[#FAFAFA]"
        />
        {!reduce && (
          <motion.span
            initial={{ scale: 1, opacity: 0 }}
            whileInView={{ scale: [1, 3.2], opacity: [0.55, 0] }}
            viewport={{ margin: '-45% 0px -45% 0px' }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-violet-400"
          />
        )}
      </span>

      <motion.figure
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        style={{ rotate: tilt }}
        className={`relative ${flip ? 'lg:order-2' : ''}`}
      >
        <ScreenFrame step={step} n={n} progress={scrollYProgress} reduce={reduce} />
      </motion.figure>

      <div className={flip ? 'lg:order-1' : ''}>
        <div className="flex items-center gap-3 mb-4">
          <motion.span
            initial={reduce ? { opacity: 0 } : { scale: 0, rotate: -120 }}
            whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.2 }}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-300/50"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          >
            <Icon size={20} />
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-mono-jetbrains text-xs font-semibold tracking-wider text-slate-400"
          >
            {t('method.station', { n: pad(n) })}
          </motion.span>
        </div>
        <WordReveal
          as="h3"
          text={t(`method.steps.${step.id}.title`)}
          delay={0.25}
          reduce={reduce}
          className="block font-space font-bold text-3xl sm:text-5xl text-slate-900 mb-5"
        />
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
          className="font-inter text-slate-700 text-lg leading-loose mb-6"
        >
          {t(`method.steps.${step.id}.story`)}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.65 }}
          className="relative font-inter text-blue-700 text-base font-semibold ps-4"
        >
          <motion.span
            aria-hidden
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.75 }}
            style={{ transformOrigin: 'top' }}
            className="absolute start-0 inset-y-0 w-1 rounded-full bg-gradient-to-b from-blue-500 to-violet-500"
          />
          {t(`method.steps.${step.id}.desc`)}
        </motion.p>
        {children}
      </div>
    </motion.div>
  );
}

// Les cinq niveaux de l'espace d'exercices, du plus simple au plus exigeant :
// les mêmes noms que l'interface élève (student › practice.levelNames).
function ExerciseLevels({ dark = false }) {
  const { t } = useTranslation('marketing');
  return (
    <motion.ol
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="mt-8 grid gap-2"
      aria-label={t('method.exercises.title')}
    >
      {EXERCISE_LEVELS.map((level) => (
        <li key={level} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${dark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
          <span className={`font-mono-jetbrains text-xs font-black w-6 ${dark ? 'text-amber-300' : 'text-violet-500'}`}>{level}</span>
          <span className={`font-inter font-semibold flex-1 ${dark ? 'text-white' : 'text-slate-800'}`}>{t(`method.exercises.levels.${level}`)}</span>
          <span className={`font-inter text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{t('method.exercises.perLevel')}</span>
        </li>
      ))}
    </motion.ol>
  );
}

// Boussole fixe en bas : neuf pastilles qui se remplissent et le nom de la
// station courante, visible seulement pendant le trajet.
function JourneyCompass({ active, visible }) {
  const { t } = useTranslation('marketing');
  const all = ALL_STOPS;
  return (
    <AnimatePresence>
      {visible && active > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
        >
          <div className="flex items-center gap-3 rounded-full bg-slate-900/85 backdrop-blur-md px-4 py-2.5 shadow-2xl shadow-slate-900/30 border border-white/10">
            <div className="flex items-center gap-1.5">
              {all.map((s, i) => (
                <motion.span
                  key={s.id}
                  animate={{
                    width: i + 1 === active ? 22 : 7,
                    backgroundColor: i + 1 <= active ? (all[i].id === GOLD.id ? '#F59E0B' : '#A78BFA') : '#475569',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="h-[7px] rounded-full"
                />
              ))}
            </div>
            <span className="w-px h-4 bg-white/20" />
            <AnimatePresence mode="wait">
              <motion.span
                key={active}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="font-inter text-sm font-semibold text-white whitespace-nowrap"
              >
                {t(`method.steps.${all[active - 1].id}.title`)}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Summit({ reduce, onEnter }) {
  const { t } = useTranslation('marketing');
  const Icon = GOLD.icon;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // La station 10 : الإتقان. Fond sombre, un seul accent ambre — la fin du
  // chemin. Elle montre l'espace d'exercices réel et ses cinq niveaux.
  return (
    <motion.section
      ref={ref}
      onViewportEnter={() => onEnter(GOLD.n)}
      viewport={{ margin: '-45% 0px -45% 0px' }}
      className="relative overflow-hidden bg-slate-950 px-4 py-24 sm:py-32"
    >
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.18),transparent_60%)]" />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.span
          initial={reduce ? { opacity: 0 } : { scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="inline-flex w-16 h-16 rounded-2xl items-center justify-center text-white mb-5 shadow-xl shadow-amber-500/30"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
        >
          <Icon size={30} />
        </motion.span>
        <p className="font-mono-jetbrains text-xs font-semibold tracking-wider text-amber-300 mb-2">
          {t('method.station', { n: pad(GOLD.n) })}
        </p>
        <WordReveal
          as="h2"
          text={t(`method.steps.${GOLD.id}.title`)}
          delay={0.15}
          reduce={reduce}
          className="block font-space font-bold text-4xl sm:text-6xl text-white mb-5"
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-inter text-slate-300 text-lg sm:text-xl leading-loose mb-2"
        >
          {t(`method.steps.${GOLD.id}.story`)}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-inter text-amber-200 font-semibold mb-10"
        >
          {t(`method.steps.${GOLD.id}.desc`)}
        </motion.p>
        <div className="mx-auto max-w-2xl mb-10">
          <ScreenFrame step={GOLD} n={GOLD.n} progress={scrollYProgress} reduce={reduce} />
        </div>
        <div className="mx-auto max-w-md text-start">
          <ExerciseLevels dark />
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
          className="mx-auto mt-14 mb-12 h-px w-40 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent"
        />
        <WordReveal
          as="p"
          text={t('method.closingLead')}
          delay={0.4}
          reduce={reduce}
          className="block font-space font-bold text-xl sm:text-2xl text-white leading-snug text-balance mb-3"
        />
        <WordReveal
          as="p"
          text={t('method.closingPunch')}
          delay={0.8}
          reduce={reduce}
          className="block font-space font-bold text-3xl sm:text-4xl text-amber-300 leading-snug text-balance"
        />
      </div>
    </motion.section>
  );
}

export default function Methode() {
  const { t } = useTranslation('marketing');
  const reduce = useReducedMotion();
  const pathRef = useRef(null);
  const journeyRef = useRef(null);
  const [active, setActive] = useState(0);
  const inJourney = useInView(journeyRef, { margin: '-30% 0px -30% 0px' });

  const { scrollYProgress } = useScroll({ target: pathRef, offset: ['start center', 'end center'] });
  const pathFill = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const { scrollYProgress: pageProgress } = useScroll();
  const pageBar = useSpring(pageProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  useDocumentMeta(t('method.metaTitle'), t('method.metaDescription'));

  let n = 0;

  return (
    <div className="pt-16">
      {/* Barre de progression du voyage, en haut de l'écran */}
      <motion.div
        aria-hidden
        style={{ scaleX: pageBar }}
        className="fixed top-0 inset-x-0 h-1 z-[60] origin-right ltr:origin-left bg-gradient-to-l from-blue-500 via-violet-500 to-amber-500"
      />

      <Hero reduce={reduce} />

      <div ref={journeyRef}>
        {/* Le chemin : une ligne qui se remplit au fil du défilement */}
        <section ref={pathRef} className="relative max-w-6xl mx-auto px-4 pb-24">
          {SHAPES.map((s, i) => <FloatingShape key={i} shape={s} progress={scrollYProgress} reduce={reduce} />)}
          <div aria-hidden className="absolute top-0 bottom-0 start-[34px] lg:start-1/2 w-[3px] -translate-x-1/2 rtl:translate-x-1/2 bg-slate-200 rounded-full" />
          <motion.div
            aria-hidden
            style={{ scaleY: pathFill, transformOrigin: 'top' }}
            className="absolute top-0 bottom-0 start-[34px] lg:start-1/2 w-[3px] -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500 via-violet-500 to-amber-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative z-10 max-w-xl mx-auto text-center font-inter text-lg text-slate-600 leading-relaxed pt-6 bg-[#FAFAFA]"
          >
            {t('method.journeyIntro')}
          </motion.p>
          {ACTS.map((act, ai) => (
            <div key={act.id}>
              <ActHeader act={act.id} index={ai} reduce={reduce} />
              {act.steps.map((step) => {
                n += 1;
                return <Station key={step.id} step={step} n={n} flip={n % 2 === 0} reduce={reduce} onEnter={setActive} />;
              })}
            </div>
          ))}
        </section>

        <Summit reduce={reduce} onEnter={setActive} />
      </div>

      <JourneyCompass active={active} visible={inJourney} />

      <CtaBanner
        eyebrow={t('method.ctaEyebrow')}
        title={t('method.ctaTitle')}
        subtitle={t('method.ctaBody')}
        primaryLabel={t('method.ctaPrimary')}
        primaryTo="/register"
      />
    </div>
  );
}
