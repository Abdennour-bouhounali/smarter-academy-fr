import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 V2 — reconstruit sur le lesson kit.
 *
 * L'original n'a ni StepCard ni machine à phases : c'est une liste plate de
 * 4 situations indépendantes, toutes visibles et jouables en même temps,
 * sans ordre imposé entre elles. On respecte cette forme en les regroupant
 * dans une UNIQUE étape du kit (plutôt que 4 étapes verrouillées en
 * séquence) : rien dans le contenu ne justifie qu'il faille résoudre la
 * situation "ajouter" avant de pouvoir tenter "retirer" — un verrouillage
 * séquentiel ajouterait une contrainte artificielle absente de l'esprit
 * original (une découverte libre des quatre familles d'opérations).
 *
 * Chaque situation devient une <TapQuestion> formative : le tap EST la
 * réponse, la correction (juste ou fausse) s'affiche immédiatement, et
 * onAnswered est inconditionnel. Le bloc symbole/expression/résultat — qui
 * était auparavant réservé à une réponse correcte — est maintenant le
 * contenu pédagogique lui-même : il s'affiche dès qu'on a répondu, juste ou
 * faux, jamais comme une récompense de justesse.
 */

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

const EXPLAIN_WRONG =
  '💡 Pas tout à fait. Relis la situation : que fait-on concrètement avec les objets ?';

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

/* ─── Carte d'une situation (formative) ───────────────────────────── */
function SituationCard({ sit, index, answered, onAnswered }) {
  const c = colorMap[sit.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className={`border-2 rounded-2xl p-5 sm:p-6 space-y-5 transition-all ${
        answered ? `${c.bg}` : 'bg-white border-slate-200'
      }`}
    >
      <TapQuestion
        above={
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
        }
        prompt={sit.question}
        options={sit.choices}
        correct={sit.correctIndex}
        cols={2}
        explain={sit.explanation}
        explainWrong={EXPLAIN_WRONG}
        solved={answered}
        onAnswered={() => onAnswered(index)}
      />

      {/* Révélation du symbole/expression : contenu pédagogique, montré
          dès qu'on a répondu — juste ou faux, jamais conditionné. */}
      {answered && (
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
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Module principal ────────────────────────────────────────────── */
export default function Module01Mission() {
  const [answered, setAnswered] = useState([]); // indices ayant répondu (juste ou faux)

  const handleAnswered = (index) => {
    setAnswered((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  const allDone = answered.length === SITUATIONS.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Mission : Le calculateur malin"
      moduleSubtitle="Découvrir les quatre familles d'opérations à travers des situations réelles."
      estimatedTime="5 min"
      brief={{
        tag: '📋 Mission',
        title: 'Tu es responsable de la réserve de matériel du collège.',
        tone: 'slate',
        body: (
          <p>
            Quatre situations se présentent à toi. Pour chacune, identifie quelle{' '}
            <strong className="text-white">action mathématique</strong> est nécessaire — avant
            même de penser à un calcul.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Les quatre situations',
          subtitle: 'Réponds à chacune, dans l\'ordre que tu veux.',
          done: allDone,
          content: (
            <div className="space-y-4">
              {SITUATIONS.map((sit, i) => (
                <SituationCard
                  key={sit.id}
                  sit={sit}
                  index={i}
                  answered={answered.includes(i)}
                  onAnswered={handleAnswered}
                />
              ))}
            </div>
          ),
        },
      ]}
      footer={
        <AnimatePresence>
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
        </AnimatePresence>
      }
    />
  );
}
