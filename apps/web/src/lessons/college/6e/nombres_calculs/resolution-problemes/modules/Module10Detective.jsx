import React, { useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 10 — practice lab, reconstruit sur le lesson kit.
 *
 * DetectiveTimeline — trouver la PREMIÈRE étape où un raisonnement dérape.
 * On ne demande jamais « est-ce juste ou faux ? » globalement : on demande
 * « à quel moment ça commence à se tromper ? », ce qui force à lire chaque
 * étape au lieu de juger seulement le résultat final. Le pick initial révèle
 * la correction sans bouton Valider séparé ; seule la réparation (repair)
 * utilise TapQuestion.
 */
function DetectiveTimeline({ react, problem, steps, badIndex, repair, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [repairDone, setRepairDone] = useState(false);
  const foundBad = pick === badIndex;

  const choose = (i) => {
    if (solved || pick !== null) return;
    setPick(i);
    react(i === badIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 bg-white border-2 border-slate-200 rounded-2xl p-3">
        <Search className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
        <p className="text-sm text-slate-700">{problem}</p>
      </div>

      <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
        Solution proposée par un élève — touche la PREMIÈRE étape fausse
      </p>

      <div className="space-y-1.5">
        {steps.map((s, i) => {
          const isSel = (solved ? badIndex : pick) === i;
          const isBad = (pick !== null || solved) && i === badIndex;
          const isSelWrong = pick !== null && !solved && isSel && i !== badIndex;
          return (
            <button
              key={i}
              type="button"
              disabled={solved || pick !== null}
              onClick={() => choose(i)}
              className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm transition-all min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isBad ? 'border-rose-400 bg-rose-50 text-rose-800' : isSelWrong ? 'border-amber-300 bg-amber-50 text-amber-700' : isSel ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              <span className="font-mono font-bold text-xs text-slate-400 shrink-0">{i + 1}.</span>
              {s}
            </button>
          );
        })}
      </div>

      {pick !== null && !foundBad && !solved && (
        <Feedback tone="ko">
          L'étape fautive est en réalité l'étape {badIndex + 1}. Regarde chaque étape dans l'ordre : à partir de
          quel moment le raisonnement ne colle plus à la situation ?
        </Feedback>
      )}

      {(foundBad || solved) && !repairDone && !solved && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <TapQuestion
            prompt={repair.q}
            requires={['premiere-erreur']}
            options={repair.options}
            correct={repair.correct}
            cols={1}
            explain={repair.explain}
            solved={repairDone}
            onAnswered={() => {
              setRepairDone(true);
              onSolved?.();
            }}
          />
        </div>
      )}

      {solved && (
        <Feedback tone="ok">
          <CheckCircle2 className="inline w-4 h-4 mr-1" aria-hidden="true" />
          Erreur repérée à l'étape {badIndex + 1}, et solution réparée : {repair.options[repair.correct]}
        </Feedback>
      )}
    </div>
  );
}

const CASES = [
  {
    problem: 'Une boutique vend des stylos à 3 €. Le vendeur travaille 6 h par jour. Un client achète 5 stylos. Combien paie-t-il ?',
    steps: ['Je note : prix = 3 €, durée de travail = 6 h, stylos achetés = 5.', 'Je calcule 6 × 5 = 30.', 'Le client paie 30 €.'],
    badIndex: 1,
    repair: {
      q: 'Quel calcul aurait-il fallu faire ?',
      options: ['3 × 5', '6 × 3', '6 + 5'],
      correct: 0,
      explain: "La durée de travail du vendeur (6 h) n'a rien à voir avec le prix payé. Il fallait utiliser le prix (3 €) et le nombre de stylos (5) : 3 × 5 = 15 €.",
    },
  },
  {
    problem: "9 boîtes contiennent 7 œufs chacune. Combien y a-t-il d'œufs en tout ?",
    steps: ['Je dois calculer 9 × 7, car ce sont des groupes égaux.', '9 × 7 = 54.', 'Il y a 54 œufs.'],
    badIndex: 1,
    repair: {
      q: 'Quel est le bon résultat de 9 × 7 ?',
      options: ['54', '63', '72'],
      correct: 1,
      explain: 'Le raisonnement (9 × 7, groupes égaux) était le bon choix ! Seul le calcul est faux : 9 × 7 = 63, pas 54.',
    },
  },
  {
    problem: 'Un bus part avec 45 passagers. 12 personnes descendent au premier arrêt. Combien de passagers reste-t-il ?',
    steps: ['45 − 12 = 33.', 'La réponse est 33 bus.'],
    badIndex: 1,
    repair: {
      q: 'Quelle est la bonne façon de répondre ?',
      options: ['Il reste 33 bus.', 'Il reste 33 passagers.', 'Il reste 33 arrêts.'],
      correct: 1,
      explain: "Le calcul (45 − 12 = 33) était juste. Mais l'unité était fausse : on compte des PASSAGERS, pas des bus.",
    },
  },
];

export default function Module10Detective() {
  const [done, setDone] = useState([]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(10)}
      moduleNumber={10}
      moduleTitle="Détective des erreurs"
      moduleSubtitle="Repère la PREMIÈRE erreur dans le raisonnement d'un élève, pas seulement le résultat final."
      estimatedTime="8 min"
      brief={{
        tag: '🕵️ Enquête',
        title: 'Un raisonnement se lit étape par étape.',
        body: <p>Ne dis jamais « tout est faux ». Trouve exactement où ça commence à déraper — c'est ça, déboguer un raisonnement.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Enquête 1',
          done: done.includes(0),
          content: (kit) => (
            <div className="space-y-5">
              {/* La méthode est posée AVANT la première enquête : sans elle,
                  « la première erreur » n'est qu'une consigne de plus. Elle
                  vient de la manipulation qui suit immédiatement, dans la
                  même étape — l'élève lit la règle puis l'applique. */}
              <KnowledgeBrick
                id="premiere-erreur"
                variant="new"
                lead="Une solution fausse est presque toujours juste au début. C'est le point de bascule qu'on cherche."
              />
              <DetectiveTimeline
                react={kit.react}
                problem={CASES[0].problem}
                steps={CASES[0].steps}
                badIndex={CASES[0].badIndex}
                repair={CASES[0].repair}
                solved={done.includes(0)}
                onSolved={() => setDone((d) => (d.includes(0) ? d : [...d, 0]))}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Enquête 2',
          done: done.includes(1),
          content: (kit) => (
            <DetectiveTimeline
              react={kit.react}
              problem={CASES[1].problem}
              steps={CASES[1].steps}
              badIndex={CASES[1].badIndex}
              repair={CASES[1].repair}
              solved={done.includes(1)}
              onSolved={() => setDone((d) => (d.includes(1) ? d : [...d, 1]))}
            />
          ),
        },
        {
          num: 3,
          title: 'Enquête 3',
          done: done.includes(2),
          content: (kit) => (
            <DetectiveTimeline
              react={kit.react}
              problem={CASES[2].problem}
              steps={CASES[2].steps}
              badIndex={CASES[2].badIndex}
              repair={CASES[2].repair}
              solved={done.includes(2)}
              onSolved={() => setDone((d) => (d.includes(2) ? d : [...d, 2]))}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={10}>
          <strong>La suite.</strong> Ta carte est complète. La Grande Mission ne te demandera rien
          d'autre que ce qui s'y trouve.
        </KnowledgeSnapshot>
      }
    />
  );
}
