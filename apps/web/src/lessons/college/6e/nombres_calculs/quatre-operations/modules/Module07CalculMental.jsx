import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import ConceptCard from '../../../../../common/components/ConceptCard';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 7 V2 — reconstruit sur le lesson kit.
 * Phase 0 (étapes 1 à 5) : une StepCard par stratégie — exemple animé
 * (reveal maison, pas de pédagogie ici) puis <NumericQuestion> pour le
 * quiz d'application, onAnswered inconditionnel.
 * Phase 1 (étape 6) : les deux défis finaux, chacun <TapQuestion> (choix de
 * la stratégie) suivi de <NumericQuestion> (calcul du résultat).
 */

/* ─── Stratégies de calcul mental (verbatim) ────────────────────── */
const STRATEGIES = [
  {
    id: 'plus10',
    title: '+9 = +10 puis −1',
    example: { calc: '47 + 9', steps: ['47 + 10 = 57', '57 − 1 = 56'], result: 56 },
    quiz: { q: '63 + 9 = ?', ans: 72, hint: 'Ajoute 10, puis retire 1.' },
    color: 'emerald',
  },
  {
    id: 'moins10',
    title: '−9 = −10 puis +1',
    example: { calc: '54 − 9', steps: ['54 − 10 = 44', '44 + 1 = 45'], result: 45 },
    quiz: { q: '83 − 9 = ?', ans: 74, hint: 'Retire 10, puis ajoute 1.' },
    color: 'blue',
  },
  {
    id: 'fois5',
    title: '×5 = ×10 ÷ 2',
    example: { calc: '14 × 5', steps: ['14 × 10 = 140', '140 ÷ 2 = 70'], result: 70 },
    quiz: { q: '26 × 5 = ?', ans: 130, hint: '26 × 10 = 260, puis ÷ 2.' },
    color: 'violet',
  },
  {
    id: 'double',
    title: 'Double / moitié',
    example: { calc: '17 × 2', steps: ['Double de 17 = 34'], result: 34 },
    quiz: { q: '24 ÷ 2 = ?', ans: 12, hint: 'Moitié de 24 : moitié de 20 + moitié de 4.' },
    color: 'amber',
  },
  {
    id: 'decompose',
    title: 'Décomposer pour additionner',
    example: { calc: '39 + 27', steps: ['39 + 20 + 7', '= 59 + 7', '= 66'], result: 66 },
    quiz: { q: '48 + 35 = ?', ans: 83, hint: '48 + 30 + 5 = 78 + 5 = ?' },
    color: 'cyan',
  },
];

const colorBtn = {
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  blue: 'bg-blue-600 hover:bg-blue-700 text-white',
  violet: 'bg-violet-600 hover:bg-violet-700 text-white',
  amber: 'bg-amber-600 hover:bg-amber-700 text-white',
  cyan: 'bg-cyan-600 hover:bg-cyan-700 text-white',
};

const colorCard = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  violet: 'bg-violet-50 border-violet-200 text-violet-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
};

/* ─── Exemple animé (reveal maison) + quiz kit ──────────────────── */
function StrategyExample({ strat, solved, onAnswered }) {
  const [exStep, setExStep] = useState(solved ? strat.example.steps.length - 1 : 0);
  const c = colorCard[strat.color];
  const btn = colorBtn[strat.color];
  const atLastStep = exStep >= strat.example.steps.length - 1;

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-4 border ${c} space-y-2`}>
        <div className="text-xs font-mono font-bold uppercase">Exemple : {strat.example.calc}</div>
        <div className="space-y-1">
          {strat.example.steps.slice(0, exStep + 1).map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-mono text-sm font-bold"
            >
              {i < strat.example.steps.length - 1 ? `→ ${s}` : `✓ ${s} = ${strat.example.result}`}
            </motion.div>
          ))}
        </div>
        {!atLastStep && (
          <button onClick={() => setExStep((v) => v + 1)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${btn}`}>
            Étape suivante →
          </button>
        )}
      </div>

      {atLastStep && (
        <NumericQuestion
          prompt={`À toi : ${strat.quiz.q}`}
          requires={['strategies-mentales']}
          expected={strat.quiz.ans}
          explain={strat.quiz.hint}
          solved={solved}
          onAnswered={onAnswered}
        />
      )}
    </div>
  );
}

/* ─── Défis finaux (verbatim) ────────────────────────────────────── */
const CHALLENGES = [
  {
    q: '39 + 27',
    opts: [
      { label: '39 + 20 + 7', correct: true, explain: 'Excellent ! Décomposer le second terme est très efficace ici.' },
      { label: '40 + 27 − 1', correct: true, explain: 'Très bien ! Arrondir à 40 puis corriger fonctionne aussi.' },
      { label: 'Poser le calcul', correct: false, explain: 'Ça marche, mais pour 39 + 27, le calcul mental est plus rapide !' },
    ],
    expectedAnswer: 66,
  },
  {
    q: '199 × 5',
    opts: [
      { label: '200 × 5 − 5', correct: true, explain: 'Parfait ! 200×5=1000, puis −5 = 995.' },
      { label: '199 × 10 ÷ 2', correct: true, explain: 'Bien joué ! 199×10=1990, ÷2=995.' },
      { label: 'Poser 199×5 colonnes', correct: false, explain: "Ça marche, mais c'est bien plus long. Les stratégies mentales sont à préférer ici !" },
    ],
    expectedAnswer: 995,
  },
];

function ChallengeBlock({ ch, index, stratSolved, onStratAnswered, numSolved, onNumAnswered }) {
  const correctIdx = ch.opts.findIndex((o) => o.correct);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>Défi {index + 1} / {CHALLENGES.length}</span>
      </div>
      <div className="bg-slate-800 text-white rounded-xl p-5 text-center text-3xl font-space font-bold">{ch.q} = ?</div>

      <TapQuestion
        prompt="Quelle stratégie choisis-tu ?"
        requires={['strategies-mentales']}
        options={ch.opts.map((o) => o.label)}
        correct={correctIdx}
        cols={1}
        explain={ch.opts[correctIdx].explain}
        solved={stratSolved}
        onAnswered={onStratAnswered}
      />

      {stratSolved && (
        <div className="border-t border-slate-100 pt-4">
          <NumericQuestion
            prompt="Maintenant calcule le résultat :"
            requires={['strategies-mentales']}
            expected={ch.expectedAnswer}
            explain={`${ch.q} = ${ch.expectedAnswer}`}
            solved={numSolved}
            onAnswered={onNumAnswered}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Module principal ────────────────────────────────────────── */
export default function Module07CalculMental() {
  const [masteredIds, setMasteredIds] = useState([]);
  const markMastered = (id) => setMasteredIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const [stratPicked, setStratPicked] = useState([false, false]);
  const [numAnswered, setNumAnswered] = useState([false, false]);

  const markStrat = (i) => setStratPicked((prev) => prev.map((v, idx) => (idx === i ? true : v)));
  const markNum = (i) => setNumAnswered((prev) => prev.map((v, idx) => (idx === i ? true : v)));

  const stepsDone = STRATEGIES.map((s) => masteredIds.includes(s.id));
  const s6done = numAnswered[0] && numAnswered[1];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Le laboratoire du calcul malin"
      moduleSubtitle="Apprendre des stratégies de calcul mental et choisir la plus efficace."
      estimatedTime="11 min"
      intro={
        <ConceptCard label="Principe du calcul malin" emoji="🧠" color="cyan">
          <p className="text-sm">
            Un bon calculateur ne pose pas <em>tous</em> les calculs. Il choisit la stratégie la plus efficace
            selon la situation. Explore les stratégies ci-dessous, puis teste-les dans les défis.
          </p>
        </ConceptCard>
      }
      steps={[
        {
          num: 1,
          title: STRATEGIES[0].title,
          done: stepsDone[0],
          content: (
            <div className="space-y-5">
              <StrategyExample
                strat={STRATEGIES[0]}
                solved={stepsDone[0]}
                onAnswered={() => markMastered(STRATEGIES[0].id)}
              />
              {/* La brique est posée dès que l'exemple animé a montré le
                  détour « +10 puis −1 » : le principe est le même pour les
                  quatre stratégies qui suivent. */}
              <KnowledgeBrick
                id="strategies-mentales"
                variant="new"
                lead="Le détour que tu viens de suivre : passer par un nombre facile, puis corriger."
              />
            </div>
          ),
        },
        {
          num: 2,
          title: STRATEGIES[1].title,
          done: stepsDone[1],
          content: (
            <StrategyExample
              strat={STRATEGIES[1]}
              solved={stepsDone[1]}
              onAnswered={() => markMastered(STRATEGIES[1].id)}
            />
          ),
        },
        {
          num: 3,
          title: STRATEGIES[2].title,
          done: stepsDone[2],
          content: (
            <StrategyExample
              strat={STRATEGIES[2]}
              solved={stepsDone[2]}
              onAnswered={() => markMastered(STRATEGIES[2].id)}
            />
          ),
        },
        {
          num: 4,
          title: STRATEGIES[3].title,
          done: stepsDone[3],
          content: (
            <StrategyExample
              strat={STRATEGIES[3]}
              solved={stepsDone[3]}
              onAnswered={() => markMastered(STRATEGIES[3].id)}
            />
          ),
        },
        {
          num: 5,
          title: STRATEGIES[4].title,
          done: stepsDone[4],
          content: (
            <StrategyExample
              strat={STRATEGIES[4]}
              solved={stepsDone[4]}
              onAnswered={() => markMastered(STRATEGIES[4].id)}
            />
          ),
        },
        {
          num: 6,
          title: 'Défi stratège',
          subtitle: 'Choisis ta stratégie, puis calcule. La stratégie compte autant que le résultat !',
          done: s6done,
          content: (
            <div className="space-y-6">
              {CHALLENGES.map((ch, i) => (
                <ChallengeBlock
                  key={ch.q}
                  ch={ch}
                  index={i}
                  stratSolved={stratPicked[i]}
                  onStratAnswered={() => markStrat(i)}
                  numSolved={numAnswered[i]}
                  onNumAnswered={() => markNum(i)}
                />
              ))}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Tu as des stratégies rapides. Reste à savoir quand les
          employer — et quand poser le calcul sans discuter.
        </KnowledgeSnapshot>
      }
    />
  );
}
