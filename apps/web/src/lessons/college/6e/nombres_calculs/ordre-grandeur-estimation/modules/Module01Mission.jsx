import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { formatFr, calcText } from '../components/estimationUtils';

const CALC = { a: 398, b: 205, op: '+', wrong: 1203, correct: 603 };

/* ─── Étape 1 : le constat ────────────────────────────────────────── */
const CONSTAT_Q = {
  q: 'Un élève a calculé 398 + 205 et trouve 1 203. Sans reprendre le calcul en détail, que penses-tu de ce résultat ?',
  options: [
    "Il a sûrement raison, 1 203 est un grand nombre pour une addition de grands nombres",
    "Quelque chose ne va pas : ce résultat semble bien trop grand pour cette addition",
  ],
  correct: 1,
  explain:
    "398 et 205 sont deux nombres à 3 chiffres : leur somme ne peut pas dépasser 999 + 999 = 1998, mais surtout, elle devrait être proche de 600. 1 203, c'est presque le double de ce qu'on attend.",
};

/* ─── Étape 2 : estimer pour trancher ─────────────────────────────── */
function EstimationRapide({ solved, onSolved }) {
  const [aRound, setARound] = useState(null);
  const [bRound, setBRound] = useState(null);
  const [checked, setChecked] = useState(false);

  const isRight = aRound === 400 && bRound === 200;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Remplace chaque nombre par un « nombre ami » facile à calculer.
      </p>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="text-center space-y-1.5">
          <div className="font-mono text-xl text-slate-800">398 →</div>
          <div className="flex gap-1.5">
            {[400, 390, 300].map((v) => (
              <button
                key={v}
                type="button"
                disabled={solved}
                onClick={() => {
                  setChecked(false);
                  setARound(v);
                }}
                aria-pressed={aRound === v}
                className={`px-3 py-2 rounded-lg border-2 font-mono text-sm font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  aRound === v ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <div className="font-mono text-xl text-slate-800">205 →</div>
          <div className="flex gap-1.5">
            {[200, 210, 300].map((v) => (
              <button
                key={v}
                type="button"
                disabled={solved}
                onClick={() => {
                  setChecked(false);
                  setBRound(v);
                }}
                aria-pressed={bRound === v}
                className={`px-3 py-2 rounded-lg border-2 font-mono text-sm font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  bRound === v ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {aRound !== null && bRound !== null && (
        <div className="text-center font-mono text-lg text-slate-800">
          {aRound} + {bRound} = <strong>{aRound + bRound}</strong>
        </div>
      )}

      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              if (isRight) onSolved?.();
            }}
            disabled={aRound === null || bRound === null}
          >
            Valider mon estimation
          </ValidateButton>
        </div>
      )}

      {checked && !isRight && (
        <Feedback tone="hint">
          Choisis les nombres amis les plus proches et les plus simples : 398 est tout près de 400, 205 est tout
          près de 200.
        </Feedback>
      )}

      {solved && (
        <Feedback tone="ok">
          400 + 200 = <strong>600</strong>. On s'attend donc à un résultat proche de 600.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 3 : conclusion ────────────────────────────────────────── */
const CONCLUSION_Q = {
  q: 'Avec cette estimation (≈ 600), que peux-tu conclure sur 1 203 ?',
  options: [
    "1 203 est cohérent avec 600, l'élève a sûrement raison",
    "1 203 est bien trop loin de 600 : le résultat de l'élève est impossible, il y a une erreur",
  ],
  correct: 1,
  explain:
    'La vraie réponse est 603 — très proche de notre estimation de 600. 1 203 est presque le double : impossible pour cette addition. L\'élève a sans doute ajouté un chiffre en trop quelque part.',
};

export default function Module01Mission() {
  const navLinks = getNavLinks(1);
  const [constatPick, setConstatPick] = useState(null);
  const [constatRevealed, setConstatRevealed] = useState(false);
  const [estimDone, setEstimDone] = useState(false);
  const [concPick, setConcPick] = useState(null);
  const [concRevealed, setConcRevealed] = useState(false);

  const s1 = constatRevealed && constatPick === CONSTAT_Q.correct;
  const s2 = estimDone;
  const s3 = concRevealed && concPick === CONCLUSION_Q.correct;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Mission : Le résultat impossible"
      moduleSubtitle="398 + 205 = 1 203 ? Développe le réflexe qui permet de le voir avant même de recalculer."
      moduleNumber={1}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 01" title="Un camarade vient de terminer un calcul.">
          <div className="bg-white/10 rounded-xl p-4 text-center font-mono text-2xl font-bold text-white mt-2">
            {calcText(CALC.a, CALC.b, CALC.op)} = {formatFr(CALC.wrong)}
          </div>
          <p className="pt-2">
            Peux-tu savoir, <strong className="text-white">sans reprendre tout le calcul</strong>, si ce résultat
            est plausible ?
          </p>
        </MissionBrief>

        <StepCard num={1} title="Un premier constat, à l'œil" done={s1}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{CONSTAT_Q.q}</p>
            <ChoiceGrid options={CONSTAT_Q.options} selected={constatPick} onSelect={setConstatPick} revealed={constatRevealed} correctIndex={CONSTAT_Q.correct} cols={1} />
            {!constatRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setConstatRevealed(true)} disabled={constatPick === null}>
                  Valider
                </ValidateButton>
              </div>
            )}
            {constatRevealed && (
              <Feedback tone={constatPick === CONSTAT_Q.correct ? 'ok' : 'ko'}>
                {CONSTAT_Q.explain}
                {constatPick !== CONSTAT_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setConstatRevealed(false); setConstatPick(null); }} className="underline font-semibold">
                      Réessayer
                    </button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        <StepCard num={2} title="Estime, pour être sûr" done={s2} locked={!s1}>
          <EstimationRapide solved={estimDone} onSolved={() => setEstimDone(true)} />
        </StepCard>

        <StepCard num={3} title="Ta conclusion" done={s3} locked={!s2}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{CONCLUSION_Q.q}</p>
            <ChoiceGrid options={CONCLUSION_Q.options} selected={concPick} onSelect={setConcPick} revealed={concRevealed} correctIndex={CONCLUSION_Q.correct} cols={1} />
            {!concRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setConcRevealed(true)} disabled={concPick === null}>
                  Valider
                </ValidateButton>
              </div>
            )}
            {concRevealed && (
              <Feedback tone={concPick === CONCLUSION_Q.correct ? 'ok' : 'ko'}>
                {CONCLUSION_Q.explain}
                {concPick !== CONCLUSION_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setConcRevealed(false); setConcPick(null); }} className="underline font-semibold">
                      Réessayer
                    </button>
                  </>
                )}
              </Feedback>
            )}

            {s3 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
                <AlertTriangle className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
                <p className="text-sm text-slate-300">
                  Tu viens de contrôler un résultat <strong className="text-white">sans le recalculer</strong> —
                  juste en estimant. C'est exactement le réflexe que cette leçon va développer.
                </p>
              </motion.div>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
