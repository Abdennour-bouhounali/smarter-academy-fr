import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Données des 4 situations ──────────────────────────────────── */
const SITUATIONS = [
  {
    id: 'ajouter',
    emoji: '📦',
    situation:
      'Tu as 24 stylos dans le stock. Un camarade apporte 13 stylos supplémentaires. Combien y en a-t-il en tout ?',
    question: "Qu'est-ce qu'on fait avec les stylos ?",
    choices: ['On en rajoute', 'On en enlève', 'On les groupe par paquets', 'On les répartit'],
    correctIndex: 0,
    actionLabel: 'AJOUTER',
    symbol: '+',
    symbolColor: 'bg-emerald-500',
    expressionBefore: '24 stylos',
    expressionAfter: '+ 13 stylos = ?',
    result: '37 stylos',
    explanation:
      "On réunit deux quantités. C'est une ADDITION. Le symbole + traduit cette action.",
    color: 'emerald',
  },
  {
    id: 'retirer',
    emoji: '🎒',
    situation:
      'Il y a 36 cahiers en réserve. On en distribue 15 aux élèves. Combien en reste-t-il ?',
    question: 'Que se passe-t-il avec les cahiers ?',
    choices: ['On en rajoute', 'On en enlève', 'On les groupe par paquets', 'On les répartit'],
    correctIndex: 1,
    actionLabel: 'RETIRER',
    symbol: '−',
    symbolColor: 'bg-blue-500',
    expressionBefore: '36 cahiers',
    expressionAfter: '− 15 cahiers = ?',
    result: '21 cahiers',
    explanation:
      "On enlève une partie d'une quantité. C'est une SOUSTRACTION. Le symbole − traduit cette action.",
    color: 'blue',
  },
  {
    id: 'groupes',
    emoji: '📚',
    situation:
      'On prépare 6 pochettes de matériel. Dans chaque pochette, on met 8 feuilles. Combien de feuilles faut-il en tout ?',
    question: 'Comment va-t-on compter les feuilles ?',
    choices: ['On en rajoute', 'On en enlève', 'On les groupe par paquets', 'On les répartit'],
    correctIndex: 2,
    actionLabel: 'FORMER DES GROUPES',
    symbol: '×',
    symbolColor: 'bg-violet-500',
    expressionBefore: '6 groupes de 8 feuilles',
    expressionAfter: '6 × 8 = ?',
    result: '48 feuilles',
    explanation:
      "On a des groupes de taille égale. C'est une MULTIPLICATION. Le symbole × traduit cette action.",
    color: 'violet',
  },
  {
    id: 'repartir',
    emoji: '🖊️',
    situation:
      '40 crayons doivent être répartis équitablement entre 8 tables. Combien de crayons par table ?',
    question: 'Comment distribue-t-on les crayons ?',
    choices: ['On en rajoute', 'On en enlève', 'On les groupe par paquets', 'On les répartit'],
    correctIndex: 3,
    actionLabel: 'PARTAGER',
    symbol: '÷',
    symbolColor: 'bg-amber-500',
    expressionBefore: '40 crayons ÷ 8 tables',
    expressionAfter: '40 ÷ 8 = ?',
    result: '5 crayons par table',
    explanation:
      "On partage équitablement une quantité. C'est une DIVISION. Le symbole ÷ traduit cette action.",
    color: 'amber',
  },
];

const colorMap = {
  emerald: {
    bg: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-500 text-white',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    ring: 'ring-emerald-400',
    text: 'text-emerald-700',
    light: 'bg-emerald-100',
  },
  blue: {
    bg: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-500 text-white',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    ring: 'ring-blue-400',
    text: 'text-blue-700',
    light: 'bg-blue-100',
  },
  violet: {
    bg: 'bg-violet-50 border-violet-200',
    badge: 'bg-violet-500 text-white',
    btn: 'bg-violet-600 hover:bg-violet-700 text-white',
    ring: 'ring-violet-400',
    text: 'text-violet-700',
    light: 'bg-violet-100',
  },
  amber: {
    bg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-500 text-white',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white',
    ring: 'ring-amber-400',
    text: 'text-amber-700',
    light: 'bg-amber-100',
  },
};

/* ─── Carte d'une situation ───────────────────────────────────────── */
function SituationCard({ sit, index, isActive, onValidate, isValidated }) {
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const c = colorMap[sit.color];

  const handleChoice = (i) => {
    if (isValidated) return;
    setSelected(i);
  };

  const handleValidate = () => {
    if (selected === null || isValidated) return;
    setShowFeedback(true);
    if (selected === sit.correctIndex) {
      setTimeout(() => onValidate(), 900);
    }
  };

  const isCorrect = selected === sit.correctIndex;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className={`border-2 rounded-2xl p-5 sm:p-6 space-y-5 transition-all ${
        isValidated ? `${c.bg}` : 'bg-white border-slate-200'
      }`}
    >
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <span className="text-3xl">{sit.emoji}</span>
        <div>
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Situation {index + 1}
          </span>
          <p className="text-slate-800 font-medium mt-1 leading-relaxed text-sm sm:text-base">
            {sit.situation}
          </p>
        </div>
      </div>

      {/* Question + choix */}
      {!isValidated && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-600">{sit.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sit.choices.map((ch, i) => (
              <button
                key={i}
                onClick={() => handleChoice(i)}
                className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 ${
                  selected === i
                    ? `${c.light} border-current ${c.text} ring-2 ${c.ring}`
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-100'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {showFeedback && !isCorrect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3"
            >
              💡 Pas tout à fait. Relis la situation : que <em>fait-on</em> concrètement avec les objets ?
            </motion.div>
          )}

          <button
            onClick={handleValidate}
            disabled={selected === null}
            className={`px-5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              selected !== null
                ? `${c.btn} shadow-sm`
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Valider →
          </button>
        </div>
      )}

      {/* Révélation après validation */}
      {isValidated && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-2xl font-space font-extrabold px-4 py-1.5 rounded-xl text-white ${sit.symbolColor}`}
            >
              {sit.symbol}
            </span>
            <div>
              <div className="text-xs font-mono text-slate-500">{sit.expressionBefore}</div>
              <div className="text-base font-bold text-slate-800">{sit.expressionAfter}</div>
              <div className={`text-sm font-bold ${c.text}`}>= {sit.result}</div>
            </div>
          </div>
          <div className={`text-sm px-4 py-3 rounded-xl border ${c.bg}`}>
            <CheckCircle2 className="inline w-4 h-4 mb-0.5 mr-1" />
            {sit.explanation}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Module principal ────────────────────────────────────────────── */
export default function Module01Mission() {
  const [validated, setValidated] = useState([]); // indices validés
  const navLinks = getNavLinks(1);
  const allDone = validated.length === SITUATIONS.length;

  const handleValidate = (index) => {
    setValidated((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      sequentialUnlock={MODULE_CTX.sequentialUnlock}
      moduleTitle="Mission : Le calculateur malin"
      moduleSubtitle="Découvrir les quatre familles d'opérations à travers des situations réelles."
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      estimatedTime="5 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Intro narrative */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-2">
          <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest">
            📋 Mission
          </div>
          <h2 className="text-xl font-space font-bold">
            Tu es responsable de la réserve de matériel du collège.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Quatre situations se présentent à toi. Pour chacune, identifie quelle <strong className="text-white">action mathématique</strong> est
            nécessaire — avant même de penser à un calcul.
          </p>
        </div>

        {/* Les 4 situations */}
        <div className="space-y-4">
          {SITUATIONS.map((sit, i) => (
            <SituationCard
              key={sit.id}
              sit={sit}
              index={i}
              isActive={true}
              isValidated={validated.includes(i)}
              onValidate={() => handleValidate(i)}
            />
          ))}
        </div>

        {/* Bilan final */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl p-6 space-y-4"
            >
              <div className="text-2xl font-space font-extrabold">
                🎉 Tu as découvert les quatre opérations !
              </div>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Chaque opération traduit une <strong className="text-white">famille de situations</strong> différente :
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { sym: '+', label: 'Addition', desc: 'Réunir / augmenter', bg: 'bg-emerald-500' },
                  { sym: '−', label: 'Soustraction', desc: 'Retirer / comparer', bg: 'bg-blue-500' },
                  { sym: '×', label: 'Multiplication', desc: 'Groupes égaux', bg: 'bg-violet-500' },
                  { sym: '÷', label: 'Division', desc: 'Partager / grouper', bg: 'bg-amber-500' },
                ].map(({ sym, label, desc, bg }) => (
                  <div key={sym} className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                    <span className={`${bg} text-white font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
                      {sym}
                    </span>
                    <div>
                      <div className="text-sm font-bold">{label}</div>
                      <div className="text-xs text-indigo-200">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-indigo-200">
                Dans les modules suivants, tu vas explorer chaque opération en profondeur — en manipulant, en visualisant, en comprenant.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModuleLayout>
  );
}
