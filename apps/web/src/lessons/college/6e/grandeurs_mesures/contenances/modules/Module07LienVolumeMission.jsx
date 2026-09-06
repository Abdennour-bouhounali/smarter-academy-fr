import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import LiquidContainer from '../components/LiquidContainer';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — Boss Final avec 10 QCM visuels.
 *
 * Renuméroté de 6 à 7 le jour où le module 6 (« L'atelier du bar à jus »,
 * stage `practice_lab`) a été inséré pour enseigner 6e_contenances_P6.
 * Les épreuves 9 et 10 s'appuient désormais sur des connaissances que la
 * leçon enseigne vraiment (la combinaison de mesures et le réflexe « même
 * unité »), au lieu de les demander sans les avoir posées.
 */

const REGISTRE = [
  { id: 'bouteilles', emoji: '🍾', label: 'Bouteille & Carafe', value: 'Divers' },
  { id: 'bols', emoji: '🥣', label: 'Bols & Gobelets', value: '1 dL & 1 cL' },
  { id: 'pipette', emoji: '💧', label: 'Pipette à sirop', value: '1 mL' },
  { id: 'pichets', emoji: '🫗', label: 'Pichets de service', value: '50 cL et 30 cL' },
];

const SKILLS = {
  comparer: { label: 'Comparer des contenances', module: 1 },
  mesurer: { label: 'Mesurer avec une même unité', module: 2 },
  unites: { label: 'Choisir la bonne unité', module: 3 },
  relations: { label: 'Relations entre les unités', module: 4 },
  convertir: { label: 'Convertir', module: 5 },
  problemes: { label: 'Résoudre des problèmes', module: 6 },
};

const EPREUVES = [
  {
    id: 'boss-q1',
    requires: ['contenance', 'meme-recipient-mesure'],
    skill: 'comparer',
    prompt: (
      <>
        On te donne une longue bouteille fine et un pichet large pour le bar. Peut-on savoir lequel contient le plus <strong>simplement en regardant</strong> sa forme ?
      </>
    ),
    options: [
      'Oui, le plus haut contient toujours plus',
      'Oui, le plus large contient toujours plus',
      'Non, il faut mesurer ou transvaser',
      'Ils contiennent forcément la même quantité'
    ],
    cols: 1,
    correct: 2,
    explain: "La forme trompe l'œil : un récipient fin et haut peut contenir moins qu'un récipient bas et large. Il faut toujours mesurer ou transvaser pour comparer.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P1'] },
  },
  {
    id: 'boss-q2',
    requires: ['meme-recipient-mesure', 'litre-repere'],
    skill: 'mesurer',
    prompt: (
      <>
        Pour comparer les recettes de deux cocktails avec des verres, que faut-il faire ?
      </>
    ),
    options: [
      'Utiliser des verres de tailles différentes',
      'Utiliser toujours le même verre',
      'Utiliser le récipient le plus grand',
    ],
    cols: 1,
    correct: 1,
    explain: "Pour comparer ou mesurer correctement, il faut une unité de référence commune (toujours le même verre) !",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P2'] },
  },
  {
    id: 'boss-q3',
    requires: ['litre-repere', 'unite-contenance-adaptee'],
    skill: 'unites',
    prompt: (
      <>
        Sur ta grande carte des boissons du bar, quelle est l'<strong>unité principale</strong> que tu vas utiliser pour les grandes bouteilles d'eau ou de jus ?
      </>
    ),
    options: ['Le mètre', 'Le gramme', 'Le litre', 'Le centimètre'],
    cols: 2,
    correct: 2,
    explain: "Le litre (L) est l'unité de base pour mesurer les contenances des liquides.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P3'] },
  },
  {
    id: 'boss-q4',
    requires: ['escalier-contenances'],
    skill: 'relations',
    prompt: (
      <>
        Tu partages exactement <strong className="font-mono">1 Litre</strong> de jus dans des bols de <strong className="font-mono">1 dL</strong>. Combien de bols remplis-tu ?
      </>
    ),
    options: ['2 bols', '5 bols', '10 bols', '100 bols'],
    cols: 2,
    correct: 2,
    explain: "Le préfixe déci veut dire 'dixième'. Il faut donc 10 décilitres (dL) pour faire 1 litre (L).",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P4'] },
  },
  {
    id: 'boss-q5',
    requires: ['escalier-contenances'],
    skill: 'relations',
    prompt: (
      <>
        Dans un bol de <strong className="font-mono">1 dL</strong>, combien de petits gobelets de <strong className="font-mono">1 cL</strong> peux-tu verser ?
      </>
    ),
    options: ['1 gobelet', '10 gobelets', '100 gobelets'],
    cols: 3,
    correct: 1,
    explain: "1 dL = 10 cL. Chaque échelon de l'échelle des unités correspond à un facteur 10.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P4'] },
  },
  {
    id: 'boss-q6',
    requires: ['escalier-contenances'],
    skill: 'relations',
    prompt: (
      <>
        Un client demande un "dash" (un petit trait) de sirop, ce qui correspond à <strong className="font-mono">1 cL</strong>. Quelle est cette contenance en millilitres (mL) ?
      </>
    ),
    options: ['1 mL', '5 mL', '10 mL', '100 mL'],
    cols: 2,
    correct: 2,
    explain: "1 cL = 10 mL. Le millilitre est 10 fois plus petit que le centilitre.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P4'] },
  },
  {
    id: 'boss-q7',
    requires: ['escalier-contenances'],
    skill: 'relations',
    prompt: (
      <>
        Le grand raccourci ! Combien y a-t-il de millilitres dans une bouteille de <strong className="font-mono">1 L</strong> ?
      </>
    ),
    options: ['10 mL', '100 mL', '500 mL', '1 000 mL'],
    cols: 2,
    correct: 3,
    explain: "Milli veut dire millième : il y a 1 000 millilitres (mL) dans 1 Litre.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P4'] },
  },
  {
    id: 'boss-q8',
    requires: ['convertir-contenance-methode', 'mem-sens-conversion-contenance', 'escalier-contenances'],
    skill: 'convertir',
    prompt: (
      <>
        Le grand pichet contient <strong className="font-mono">50 cL</strong> de cocktail. Le client veut lire la contenance en millilitres (mL).
      </>
    ),
    options: ['5 mL', '50 mL', '500 mL', '5 000 mL'],
    cols: 2,
    correct: 2,
    explain: "On passe des cL aux mL (une unité 10 fois plus petite). Le nombre devient 10 fois plus grand : 50 × 10 = 500 mL.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P5'] },
  },
  {
    id: 'boss-q9',
    requires: ['combiner-mesures', 'escalier-contenances'],
    skill: 'problemes',
    prompt: (
      <>
        Tu as préparé <strong className="font-mono">50 cL</strong> de cocktail. Combien de petits gobelets de <strong className="font-mono">10 cL</strong> peux-tu servir ?
      </>
    ),
    options: ['2', '5', '10', '50'],
    cols: 4,
    correct: 1,
    explain: "50 ÷ 10 = 5. Tu peux remplir exactement 5 gobelets.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P6'] },
  },
  {
    id: 'boss-q10',
    requires: ['combiner-mesures', 'mem-meme-unite-contenance'],
    skill: 'problemes',
    prompt: (
      <>
        Le défi ! Un client veut exactement <strong className="font-mono">80 cL</strong> de jus magique. Tu n'as qu'un pichet de <strong className="font-mono">50 cL</strong> et un de <strong className="font-mono">30 cL</strong>. Que fais-tu ?
      </>
    ),
    options: ['Je verse 50 + 50', 'Je verse 30 + 30', 'Je verse 50 + 30', 'Je verse 80 - 50'],
    cols: 2,
    correct: 2,
    explain: "50 cL + 30 cL = 80 cL ! En combinant différentes mesures, tu obtiens exactement ce qu'il te faut.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P6'] },
  }
];

const BADGES = [
  { id: 'transvaseur', emoji: '🏅', label: 'Maître du transvasement', test: (s) => (s.comparer ?? 0) === 0 },
  { id: 'lecteur', emoji: '🏅', label: 'Mesureur précis', test: (s) => (s.mesurer ?? 0) === 0 },
  { id: 'expert', emoji: '🏅', label: 'Expert des unités', test: (s) => (s.unites ?? 0) === 0 },
  { id: 'architecte', emoji: '🏅', label: 'Architecte des unités', test: (s) => (s.relations ?? 0) === 0 },
  { id: 'virtuose', emoji: '🏅', label: 'Virtuose des conversions', test: (s) => (s.convertir ?? 0) === 0 },
  { id: 'barman', emoji: '🏅', label: 'Chef du bar à jus', test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Service parfait', test: (s) => Object.values(s).every((v) => v === 0) },
];

/* ── Synthèse visuelle (propre à la leçon) — carte-mémoire, pas un cours ── */

const UNITS = ['L', 'dL', 'cL', 'mL'];

/** Échelle des unités interactive : survole/touche un maillon pour voir ×10 ou ÷10. */
function UnitLadder() {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(null); // index du maillon survolé (entre UNITS[i] et UNITS[i+1])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap" role="group" aria-label="Échelle des unités, du litre au millilitre">
        {UNITS.map((u, i) => (
          <React.Fragment key={u}>
            {i > 0 && (
              <button
                type="button"
                onMouseEnter={() => setHover(i - 1)}
                onMouseLeave={() => setHover((h) => (h === i - 1 ? null : h))}
                onFocus={() => setHover(i - 1)}
                onBlur={() => setHover((h) => (h === i - 1 ? null : h))}
                onClick={() => setHover((h) => (h === i - 1 ? null : i - 1))}
                aria-label={`1 ${UNITS[i - 1]} = 10 ${u} — clique pour voir la relation`}
                className="relative flex flex-col items-center justify-center px-1 sm:px-2 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <span className={`font-mono text-[10px] sm:text-xs font-extrabold transition-colors ${hover === i - 1 ? 'text-sky-600' : 'text-slate-300'}`}>×10</span>
                <span aria-hidden="true" className={`text-sm transition-colors ${hover === i - 1 ? 'text-sky-500' : 'text-slate-300'}`}>→</span>
              </button>
            )}
            <motion.div
              animate={hover != null && (i === hover || i === hover + 1) ? { scale: 1.08 } : { scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.15 }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center font-mono font-extrabold text-sm sm:text-base transition-colors ${
                hover != null && (i === hover || i === hover + 1)
                  ? 'bg-sky-600 border-sky-700 text-white shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              {u}
            </motion.div>
          </React.Fragment>
        ))}
      </div>

      <div className="min-h-[34px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {hover != null ? (
            <motion.div
              key={hover}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: reduced ? 0 : 0.15 }}
              className="font-mono font-bold text-sm text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-4 py-1.5"
            >
              1 {UNITS[hover]} = 10 {UNITS[hover + 1]}
            </motion.div>
          ) : (
            <div className="text-[11px] text-slate-400 text-center">
              Touche une flèche pour voir la relation entre deux unités voisines.
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">
        <span>vers une unité plus petite</span>
        <span className="text-sky-500">→ × 10</span>
        <span className="mx-1">·</span>
        <span className="text-orange-500">÷ 10 ←</span>
        <span>vers une unité plus grande</span>
      </div>
    </div>
  );
}

/** 1 L qui se décompose visuellement en 10 dL, 100 cL, 1 000 mL — au tap. */
function LitreDecomposition() {
  const reduced = useReducedMotion();
  const [level, setLevel] = useState(0); // 0: 1 L · 1: 10 dL · 2: 100 cL · 3: 1000 mL
  const ROWS = [
    { unit: 'L', n: 1, cols: 1 },
    { unit: 'dL', n: 10, cols: 10 },
    { unit: 'cL', n: 100, cols: 20 },
    { unit: 'mL', n: 1000, cols: 25 },
  ];
  const row = ROWS[level];
  const shown = Math.min(row.n, row.cols * 4); // on ne dessine jamais 1000 pastilles, juste assez pour "voir" la multiplication

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-1.5">
        {ROWS.map((r, i) => (
          <button
            key={r.unit}
            type="button"
            onClick={() => setLevel(i)}
            aria-pressed={level === i}
            className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              level === i ? 'bg-sky-600 border-sky-700 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {r.n} {r.unit}
          </button>
        ))}
      </div>
      <div className="min-h-[64px] flex flex-wrap items-center justify-center gap-1 bg-slate-50 rounded-xl border border-slate-200 p-3">
        <AnimatePresence mode="popLayout">
          {Array.from({ length: shown }, (_, i) => (
            <motion.span
              key={`${level}-${i}`}
              initial={reduced ? false : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.16, delay: reduced ? 0 : Math.min(i, 24) * 0.012 }}
              className="w-2.5 h-2.5 rounded-full bg-sky-400"
              aria-hidden="true"
            />
          ))}
        </AnimatePresence>
        {shown < row.n && (
          <span className="font-mono text-[10px] text-slate-400 pl-1">… {row.n} {row.unit} en tout</span>
        )}
      </div>
      <div className="text-center font-mono text-xs text-slate-500">
        1 L = <strong className="text-slate-700">{row.n} {row.unit}</strong>
      </div>
    </div>
  );
}

function Synthese() {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-4">
      {/* HERO — le concept central */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="text-center space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">💧 La contenance</div>
          <p className="text-sm text-slate-300 max-w-sm mx-auto">
            La quantité de liquide qu'un récipient peut contenir.
          </p>
        </div>
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <div className="flex flex-col items-center gap-1">
            <LiquidContainer shape="bottle" fillPct={0.85} height={92} color="#38bdf8" ariaLabel="Une bouteille haute et fine" />
            <span className="text-[10px] font-mono text-slate-400">haute, fine</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <LiquidContainer shape="jug" fillPct={0.55} height={92} color="#38bdf8" ariaLabel="Une cruche large et basse" />
            <span className="text-[10px] font-mono text-slate-400">large, basse</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs font-mono font-bold">
          <span className="text-slate-400">👀 la forme peut tromper</span>
          <span className="text-slate-600">→</span>
          <span className="text-sky-300">🧪 la mesure vérifie</span>
        </div>
      </div>

      {/* COMPARER */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 font-space font-bold text-slate-800 text-sm">👀 Comparer</div>
        <p className="text-xs sm:text-sm text-slate-600">Ne te fie pas seulement à tes yeux : vérifie en mesurant.</p>
        <div className="text-center font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded-full inline-block px-4 py-1.5 text-xs mx-auto block w-fit">
          même unité → comparaison juste
        </div>
      </div>

      {/* MESURER */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 font-space font-bold text-slate-800 text-sm">📏 Mesurer</div>
        <p className="text-xs sm:text-sm text-slate-600">Choisis une unité adaptée à la quantité.</p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { emoji: '💊', ex: 'quelques mL' },
            { emoji: '🥤', ex: 'une boisson → cL' },
            { emoji: '🧴', ex: 'une bouteille → L' },
          ].map((e) => (
            <div key={e.ex} className="rounded-xl bg-slate-50 border border-slate-200 p-2 text-center">
              <div className="text-lg" aria-hidden="true">{e.emoji}</div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5 leading-tight">{e.ex}</div>
            </div>
          ))}
        </div>
      </div>

      {/* UNITÉS — l'échelle interactive */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 font-space font-bold text-slate-800 text-sm">📐 Les unités</div>
        <UnitLadder />
      </div>

      {/* À RETENIR — la relation qui compte */}
      <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 font-space font-bold text-sm">⭐ À retenir</div>
        <div className="text-center font-mono font-extrabold text-lg sm:text-xl tabular-nums bg-white/10 rounded-xl py-2.5">
          1 L = 10 dL = 100 cL = 1 000 mL
        </div>
        <LitreDecomposition />
      </div>

      {/* CONVERTIR */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 font-space font-bold text-slate-800 text-sm">🔄 Convertir</div>
        <div className="flex items-center justify-center gap-2 flex-wrap font-mono text-xs sm:text-sm font-bold">
          {['0,7 L', '7 dL', '70 cL', '700 mL'].map((v, i) => (
            <React.Fragment key={v}>
              {i > 0 && <span className="text-sky-500">×10→</span>}
              <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800">{v}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap font-mono text-xs sm:text-sm font-bold">
          {['700 mL', '70 cL', '7 dL', '0,7 L'].map((v, i) => (
            <React.Fragment key={v}>
              {i > 0 && <span className="text-orange-500">←÷10</span>}
              <span className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800">{v}</span>
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-center text-slate-600 pt-1">
          Vers une unité <strong>plus petite</strong> → le nombre <strong>augmente</strong>. Vers une unité{' '}
          <strong>plus grande</strong> → le nombre <strong>diminue</strong>.
        </p>
      </div>

      {/* CALCULER */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 font-space font-bold text-slate-800 text-sm">🧮 Calculer</div>
        <div className="flex items-center justify-center gap-2 flex-wrap font-mono text-xs sm:text-sm">
          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500">1 L</span>
          <span className="text-slate-400">+</span>
          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500">50 cL</span>
          <span className="text-slate-400">→</span>
          <span className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">100 cL + 50 cL</span>
          <span className="text-slate-400">=</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold">150 cL</span>
        </div>
        <p className="text-xs sm:text-sm text-center text-slate-600">
          Avant de calculer, mets les contenances dans <strong>la même unité</strong>.
        </p>
      </div>

      {/* PIÈGES */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 font-space font-bold text-amber-900 text-sm">⚠️ Les pièges à éviter</div>
        {[
          { wrong: 'Ce récipient est plus haut, donc il contient plus.', right: 'La forme ne suffit pas : je mesure.' },
          { wrong: 'Je peux additionner 2 L + 30 cL directement.', right: "Je mets d'abord les deux quantités dans la même unité." },
          { wrong: 'Vers mL, je divise.', right: 'Vers une unité plus petite → ×10 à chaque marche.' },
        ].map((t) => (
          <div key={t.wrong} className="text-xs sm:text-sm space-y-0.5">
            <div className="text-rose-700">❌ {t.wrong}</div>
            <div className="text-emerald-700">✅ {t.right}</div>
          </div>
        ))}
      </div>

      {/* LES 4 RÉFLEXES */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { emoji: '🧪', title: 'Je vérifie', body: 'Je compare en mesurant.' },
          { emoji: '📏', title: 'Je choisis', body: 'Une unité adaptée.' },
          { emoji: '🔄', title: 'Je convertis', body: '×10 vers plus petit, ÷10 vers plus grand.' },
          { emoji: '🧮', title: 'Je calcule', body: 'Même unité avant de calculer.' },
        ].map((r) => (
          <div key={r.title} className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-1">
            <div className="text-xl" aria-hidden="true">{r.emoji}</div>
            <div className="font-space font-bold text-slate-800 text-xs">{r.title}</div>
            <div className="text-[11px] text-slate-500 leading-snug">{r.body}</div>
          </div>
        ))}
      </div>

      <Feedback tone="info">
        💧 Une contenance se mesure, se compare et se convertit. Pour calculer, je mets toujours les mêmes unités.
      </Feedback>

      {/* Les connaissances elles-mêmes : la carte complète, source unique. */}
      <KnowledgeSnapshot variant="complete" complete />
    </div>
  );
}

export default function Module07LienVolumeMission() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Le Grand Défi des Contenances"
      moduleSubtitle="Dix épreuves pour décrocher ta place de Chef du bar à jus de l'école."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: "Le bar à jus de la fête de l'école ouvre dans une heure.",
        tone: 'amber',
        body: (
          <p>
            Dix épreuves pour tout vérifier : comparer, mesurer, choisir une unité, convertir et résoudre.
            Réponds à toutes les épreuves, puis valide pour découvrir ta correction et tes badges de maîtrise.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Chef du Bar à Jus !',
        title: 'Mission accomplie !',
        message: (
          <>
            Tu sais comparer, mesurer, convertir et résoudre des problèmes de contenances.
            <strong className="block mt-2 text-white">💡 Le réflexe à garder : même unité avant de calculer.</strong>
          </>
        ),
        verbs: ['Comparer', 'Mesurer', 'Convertir', 'Résoudre'],
        masterBadgeLabel: 'Badge « Service parfait » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
