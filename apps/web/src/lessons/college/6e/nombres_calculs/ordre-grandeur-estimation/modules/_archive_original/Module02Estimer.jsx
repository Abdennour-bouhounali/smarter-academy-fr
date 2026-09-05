import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RoundPicker from '../components/RoundPicker';

/* ─── Étape 1 : le laboratoire d'estimation, pas à pas ───────────── */
function Laboratoire({ solved, onSolved }) {
  const [r1, setR1] = useState(false);
  const [r2, setR2] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        On veut estimer <strong className="font-mono">197 + 302</strong>. On remplace chaque nombre par son ami
        le plus proche, un par un.
      </p>

      <RoundPicker value={197} step={10} solved={r1} onSolved={() => setR1(true)} label="197 est plus proche de quel nombre ami ?" />

      {r1 && (
        <div className="border-t border-slate-100 pt-5">
          <RoundPicker value={302} step={10} solved={r2} onSolved={() => setR2(true)} label="302 est plus proche de quel nombre ami ?" />
        </div>
      )}

      {r1 && r2 && !revealed && (
        <div className="text-center">
          <ValidateButton onClick={() => setRevealed(true)} tone="indigo">
            Assembler l'estimation <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" />
          </ValidateButton>
        </div>
      )}

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Estimation</div>
            <div className="font-mono text-2xl font-extrabold text-amber-300">200 + 300 = 500</div>
          </div>
          {!solved && (
            <div className="text-center">
              <ValidateButton onClick={() => onSolved?.()}>J'ai compris la démarche</ValidateButton>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 2 : la formule qui résume tout ───────────────────────── */
const FORMULE_Q = {
  q: "Quelle phrase résume ce que tu viens de faire ?",
  options: [
    "Je remplace temporairement les nombres par des nombres plus simples, pour avoir une idée rapide du résultat",
    'Je calcule le résultat exact, mais plus vite',
    "Je devine un nombre au hasard",
  ],
  correct: 0,
  explain:
    "Exactement : estimer, ce n'est pas calculer plus vite — c'est remplacer les nombres par des nombres FACILES, pour obtenir une idée fiable du résultat AVANT le calcul exact.",
};

/* ─── Étape 3 : estimation ≠ calcul exact ────────────────────────── */
function EstimVsExact({ solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const correct = 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="border-2 border-emerald-200 bg-emerald-50 rounded-2xl p-3 text-center">
          <div className="text-[10px] font-mono text-emerald-600 uppercase">Cas A</div>
          <div className="font-mono text-sm text-slate-700">198 + 302</div>
          <div className="font-mono text-xs text-slate-500">≈ 200 + 300 = 500</div>
          <div className="font-mono font-bold text-emerald-700">exact = 500</div>
        </div>
        <div className="border-2 border-amber-200 bg-amber-50 rounded-2xl p-3 text-center">
          <div className="text-[10px] font-mono text-amber-600 uppercase">Cas B</div>
          <div className="font-mono text-sm text-slate-700">198 + 297</div>
          <div className="font-mono text-xs text-slate-500">≈ 200 + 300 = 500</div>
          <div className="font-mono font-bold text-amber-700">exact = 495</div>
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-700">
        Dans le cas B, l'estimation (500) et le résultat exact (495) sont différents. Qu'est-ce que cela nous
        apprend ?
      </p>
      <ChoiceGrid
        options={[
          "L'estimation est fausse, il ne faut jamais l'utiliser",
          "Une estimation donne une valeur APPROCHÉE, pas forcément exacte — c'est normal et ça reste utile pour contrôler",
        ]}
        selected={pick}
        onSelect={setPick}
        revealed={revealed}
        correctIndex={correct}
        cols={1}
      />
      {!revealed && (
        <div className="text-center">
          <ValidateButton onClick={() => { setRevealed(true); if (pick === correct) onSolved?.(); }} disabled={pick === null}>
            Valider
          </ValidateButton>
        </div>
      )}
      {revealed && (
        <Feedback tone={pick === correct ? 'ok' : 'ko'}>
          Une estimation donne un ordre de grandeur, pas la valeur exacte. 495 reste tout à fait cohérent avec
          l'estimation 500 : l'écart est petit. L'estimation sert à repérer les erreurs GROSSIÈRES, pas à
          remplacer le calcul exact.
          {pick !== correct && (
            <>
              {' '}
              <button type="button" onClick={() => { setRevealed(false); setPick(null); }} className="underline font-semibold">
                Réessayer
              </button>
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

export default function Module02Estimer() {
  const navLinks = getNavLinks(2);
  const [labDone, setLabDone] = useState(false);
  const [formulePick, setFormulePick] = useState(null);
  const [formuleRevealed, setFormuleRevealed] = useState(false);
  const [distinctDone, setDistinctDone] = useState(false);

  const s1 = labDone;
  const s2 = formuleRevealed && formulePick === FORMULE_Q.correct;
  const s3 = distinctDone;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Estimer avant de calculer"
      moduleSubtitle="Remplacer temporairement des nombres compliqués par des nombres simples."
      moduleNumber={2}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="🧪 Laboratoire" title="Avant de calculer exactement, je peux prévoir à peu près.">
          <p>C'est le premier réflexe à construire : une estimation rapide, avant tout calcul détaillé.</p>
        </MissionBrief>

        <StepCard num={1} title="Estime 197 + 302, étape par étape" done={s1}>
          <Laboratoire solved={labDone} onSolved={() => setLabDone(true)} />
        </StepCard>

        <StepCard num={2} title="Ce que tu viens de faire, en une phrase" done={s2} locked={!s1}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{FORMULE_Q.q}</p>
            <ChoiceGrid options={FORMULE_Q.options} selected={formulePick} onSelect={setFormulePick} revealed={formuleRevealed} correctIndex={FORMULE_Q.correct} cols={1} />
            {!formuleRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setFormuleRevealed(true)} disabled={formulePick === null}>
                  Valider
                </ValidateButton>
              </div>
            )}
            {formuleRevealed && (
              <Feedback tone={formulePick === FORMULE_Q.correct ? 'ok' : 'ko'}>
                {FORMULE_Q.explain}
                {formulePick !== FORMULE_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setFormuleRevealed(false); setFormulePick(null); }} className="underline font-semibold">
                      Réessayer
                    </button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        <StepCard num={3} title="Estimation et calcul exact : pas la même chose" done={s3} locked={!s2}>
          <EstimVsExact solved={distinctDone} onSolved={() => setDistinctDone(true)} />
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
