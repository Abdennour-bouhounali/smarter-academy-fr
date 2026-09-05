import React from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 8 V2 — reconstruit sur le lesson kit.
 * Chaque défi devient : choix de l'outil (TapQuestion) puis calcul (NumericQuestion).
 */
const CHALLENGES = [
  {
    q: '25 + 100',
    answer: 125,
    tools: ['🧠 Mental', '✏️ En ligne', '📐 Posé', '🔎 Estimation'],
    bestIndex: 0,
    bestExplain: 'Ajouter 100 est immédiat mentalement : on fait juste +1 dans les centaines.',
    otherExplains: [
      '',
      'Possible, mais inutilement long pour +100.',
      'Inutilement complexe. Le calcul posé est pour des calculs difficiles.',
      "L'estimation convient pour des ordres de grandeur, pas pour une réponse exacte aussi simple.",
    ],
    category: 'Addition',
  },
  {
    q: '398 + 487',
    answer: 885,
    tools: ['🧠 Mental', '✏️ En ligne', '📐 Posé', '🔎 Estimation'],
    bestIndex: 2,
    bestExplain: 'Trois chiffres avec retenues multiples → le calcul posé évite les erreurs.',
    otherExplains: [
      'Calculable mentalement, mais risqué pour ces nombres. Préférer le posé ou en ligne.',
      "En ligne c'est possible, mais le posé est plus sûr avec des retenues multiples.",
      '',
      "L'estimation donne ≈ 400+500=900, utile pour vérifier, mais pas pour la réponse exacte.",
    ],
    category: 'Addition',
  },
  {
    q: '83 − 9',
    answer: 74,
    tools: ['🧠 Mental', '✏️ En ligne', '📐 Posé', '🔎 Estimation'],
    bestIndex: 0,
    bestExplain: 'Stratégie mentale : −9 = −10+1 → 83−10+1 = 74. Très rapide !',
    otherExplains: [
      '',
      'Fonctionne, mais inutilement long pour ce calcul simple.',
      'Beaucoup trop complexe pour 83−9.',
      'Estimation donne ≈70, utile pour vérifier mais pas pour répondre exactement.',
    ],
    category: 'Soustraction',
  },
  {
    q: '199 × 5',
    answer: 995,
    tools: ['🧠 Mental', '✏️ En ligne', '📐 Posé', '🔎 Estimation'],
    bestIndex: 0,
    bestExplain: '199×5 = 200×5 − 5 = 1000−5 = 995. La stratégie mentale est ici la plus élégante !',
    otherExplains: [
      '',
      'Possible, mais la stratégie mentale est bien plus efficace.',
      "Ça marche, mais cherche d'abord une stratégie mentale.",
      '≈200×5=1000 — utile pour contrôler le résultat, pas pour la réponse exacte.',
    ],
    category: 'Multiplication',
  },
  {
    q: '49,7 + 12,38',
    answer: 62.08,
    displayAnswer: '62,08',
    tools: ['🧠 Mental', '✏️ En ligne', '📐 Posé', '🔎 Estimation'],
    bestIndex: 2,
    bestExplain: 'Les décimaux avec des rangs différents nécessitent un tableau de valeur de position → calcul posé.',
    otherExplains: [
      "Très difficile mentalement avec des centièmes. Risque d'erreur important.",
      "Possible mais difficile d'aligner correctement en ligne.",
      '',
      '≈50+12=62 — utile pour vérifier (62,08 est bien proche de 62 ✓), mais pas pour la précision.',
    ],
    category: 'Addition décimaux',
  },
];

export default function Module08ChoisirOperation() {
  const [toolPicks, setToolPicks] = React.useState({});
  const [answerDone, setAnswerDone] = React.useState({});

  const steps = CHALLENGES.map((ch, i) => {
    const toolDone = toolPicks[i] != null;
    const done = !!answerDone[i];
    return {
      num: i + 1,
      title: ch.q + ' = ?',
      subtitle: ch.category,
      done,
      content: () => (
        <div className="space-y-5">
          <TapQuestion
            prompt="Quel outil choisis-tu pour ce calcul ?"
            options={ch.tools}
            correct={ch.bestIndex}
            cols={2}
            explain={ch.bestExplain}
            explainWrong={ch.otherExplains.find((t) => t) || ch.bestExplain}
            solved={toolDone}
            onAnswered={() => setToolPicks((p) => ({ ...p, [i]: true }))}
          />
          {toolDone && (
            <NumericQuestion
              prompt="Calcule le résultat :"
              expected={ch.answer}
              display={ch.displayAnswer ?? String(ch.answer)}
              parse={parseDec}
              explain={`${ch.tools[ch.bestIndex]} est l'outil le plus adapté ici.`}
              solved={done}
              onAnswered={() => setAnswerDone((p) => ({ ...p, [i]: true }))}
            />
          )}
        </div>
      ),
    };
  });

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="Choisir l'outil de calcul"
      moduleSubtitle="Pour chaque calcul : mental, en ligne, posé ou estimation ? La stratégie compte autant que le résultat !"
      estimatedTime="8 min"
      brief={{
        tag: '🧭 Stratège',
        title: 'Quel outil pour quel calcul ?',
        body: (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {[
              { icon: '🧠', label: 'Mental', desc: 'Calcul simple ou stratégie connue' },
              { icon: '✏️', label: 'En ligne', desc: 'Petit calcul à écrire sans poser' },
              { icon: '📐', label: 'Posé', desc: 'Grands nombres ou décimaux' },
              { icon: '🔎', label: 'Estimation', desc: "Contrôler l'ordre de grandeur" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="font-bold text-white text-sm">{label}</div>
                <div className="text-[11px] text-slate-300 leading-tight mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        ),
      }}
      steps={steps}
      footer={
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl p-6 text-center space-y-2">
          <div className="text-3xl">🏅 Stratège du calcul</div>
          <div className="text-xl font-space font-bold">Tu sais choisir le bon outil !</div>
          <p className="text-pink-100 text-sm">Mental, en ligne, posé, estimation — chaque outil à sa place.</p>
        </div>
      }
    />
  );
}
