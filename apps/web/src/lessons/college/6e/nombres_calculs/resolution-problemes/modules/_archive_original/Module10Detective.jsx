import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2 } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * DetectiveTimeline — trouver la PREMIÈRE étape où un raisonnement dérape.
 * On ne demande jamais « est-ce juste ou faux ? » globalement : on demande
 * « à quel moment ça commence à se tromper ? », ce qui force à lire chaque
 * étape au lieu de juger seulement le résultat final.
 */
function DetectiveTimeline({ problem, steps, badIndex, repair, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  const [repairPick, setRepairPick] = useState(null);
  const [repairRevealed, setRepairRevealed] = useState(false);
  const foundBad = checked && pick === badIndex;

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
          const isSel = pick === i;
          const isBad = checked && i === badIndex;
          const isSelWrong = checked && isSel && i !== badIndex;
          return (
            <button
              key={i}
              type="button"
              disabled={solved}
              onClick={() => { setPick(i); setChecked(false); }}
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

      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (pick === badIndex) onSolved?.(); }} disabled={pick === null} tone="amber">
            Valider ma réponse
          </ValidateButton>
        </div>
      )}

      {checked && !foundBad && (
        <Feedback tone="hint">
          Regarde chaque étape dans l'ordre : à partir de quel moment le raisonnement ne colle plus à la
          situation ?
        </Feedback>
      )}

      {foundBad && !solved && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-700">{repair.q}</p>
          <ChoiceGrid options={repair.options} selected={repairPick} onSelect={setRepairPick} revealed={repairRevealed} correctIndex={repair.correct} cols={1} />
          {!repairRevealed && (
            <div className="text-center">
              <ValidateButton onClick={() => setRepairRevealed(true)} disabled={repairPick === null} tone="amber">Valider</ValidateButton>
            </div>
          )}
          {repairRevealed && (
            <Feedback tone={repairPick === repair.correct ? 'ok' : 'ko'}>
              {repair.explain}
              {repairPick !== repair.correct && (
                <>
                  {' '}
                  <button type="button" onClick={() => { setRepairRevealed(false); setRepairPick(null); }} className="underline font-semibold">Réessayer</button>
                </>
              )}
            </Feedback>
          )}
        </motion.div>
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
    problem: "Une boutique vend des stylos à 3 €. Le vendeur travaille 6 h par jour. Un client achète 5 stylos. Combien paie-t-il ?",
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
    problem: '9 boîtes contiennent 7 œufs chacune. Combien y a-t-il d\'œufs en tout ?',
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
      q: "Quelle est la bonne façon de répondre ?",
      options: ['Il reste 33 bus.', 'Il reste 33 passagers.', 'Il reste 33 arrêts.'],
      correct: 1,
      explain: "Le calcul (45 − 12 = 33) était juste. Mais l'unité était fausse : on compte des PASSAGERS, pas des bus.",
    },
  },
];

export default function Module10Detective() {
  const navLinks = getNavLinks(10);
  const [done, setDone] = useState([]);
  const allDone = done.length === CASES.length;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Détective des erreurs"
      moduleSubtitle="Repère la PREMIÈRE erreur dans le raisonnement d'un élève, pas seulement le résultat final."
      moduleNumber={10}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="🕵️ Enquête" title="Un raisonnement se lit étape par étape.">
          <p>Ne dis jamais « tout est faux ». Trouve exactement où ça commence à déraper — c'est ça, déboguer un raisonnement.</p>
        </MissionBrief>

        {CASES.map((c, i) =>
          i === 0 || done.includes(i - 1) ? (
            <StepCard key={c.problem} num={i + 1} title={`Enquête ${i + 1}`} done={done.includes(i)} locked={false}>
              <DetectiveTimeline
                problem={c.problem}
                steps={c.steps}
                badIndex={c.badIndex}
                repair={c.repair}
                solved={done.includes(i)}
                onSolved={() => setDone((d) => (d.includes(i) ? d : [...d, i]))}
              />
            </StepCard>
          ) : null
        )}
      </div>
    </ModuleLayout>
  );
}
