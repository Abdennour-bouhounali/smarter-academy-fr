import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import InfoSorter from '../../../../../common/components/InfoSorter';
import GroupBuilder from '../../../../../common/components/GroupBuilder';
import { parseDec, roundTo, formatMass } from '../components/massUtils';

const INFO_ITEMS = [
  { id: 'eleves', text: '24 élèves participent à la sortie.', useful: true },
  { id: 'sachet', text: 'Chaque sachet de biscuits pèse 150 g.', useful: true },
  { id: 'heure', text: 'Le bus part à 8h30.', useful: false },
  { id: 'sac_prof', text: 'Le sac à dos du professeur pèse 3 kg.', useful: false },
  { id: 'prix', text: 'Un sachet de biscuits coûte 1,20 €.', useful: false },
  { id: 'distance', text: 'L’école se trouve à 2 km du site.', useful: false },
];

// Assessment metadata (docs/architecture/AI_LESSON_CONTRACT.md) — each
// checkpoint descriptor below certifies one or more learning points from
// this evaluation-stage module (StepCards 1-4 rendered further down). They
// are evidence-tagging metadata only, not consumed by the render logic.
const EVAL_INFO_SORTER = {
  id: 'masses-eval-info-sorter',
  title: 'StepCard 1 — Les informations utiles',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P6'] },
};
// Preparing the order requires reading each item's stated mass (150 g,
// 200 g...) and using it correctly — the same reading-a-displayed-mass
// skill module 3 introduces on a physical balance.
const EVAL_BUILD_ORDER = {
  id: 'masses-eval-build-order',
  title: 'StepCard 2 — Préparer la commande',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P3', '6e_masses_P4'] },
};
const EVAL_TOTAL_MASS_G = {
  id: 'masses-eval-total-mass-g',
  title: 'StepCard 3a — La masse totale (en g)',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P4'] },
};
const EVAL_TOTAL_MASS_KG = {
  id: 'masses-eval-total-mass-kg',
  title: 'StepCard 3b — La masse totale (conversion en kg, pour l’annoncer simplement)',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P5', '6e_masses_P2'] },
};

const BISCUIT_BOX_TARGET = 4; // boîtes de 6 sachets de 150 g
const BISCUIT_BOX_MASS = 6 * 150; // 900 g / boîte
const JUS_BOX_TARGET = 6; // boîtes de 4 briques de 200 g
const JUS_BOX_MASS = 4 * 200; // 800 g / boîte
const TOTAL_G = BISCUIT_BOX_TARGET * BISCUIT_BOX_MASS + JUS_BOX_TARGET * JUS_BOX_MASS; // 8400 g

function BuildOrder({ done, onSolved }) {
  const [biscuitBoxes, setBiscuitBoxes] = useState(0);
  const [jusBoxes, setJusBoxes] = useState(0);
  const reached = biscuitBoxes === BISCUIT_BOX_TARGET && jusBoxes === JUS_BOX_TARGET;
  const totalSoFar = biscuitBoxes * BISCUIT_BOX_MASS + jusBoxes * JUS_BOX_MASS;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Prépare la commande : <strong>{BISCUIT_BOX_TARGET} boîtes</strong> de biscuits (6 sachets de 150 g par boîte)
        et <strong>{JUS_BOX_TARGET} boîtes</strong> de jus (4 briques de 200 g par boîte).
      </p>
      <div className="space-y-1.5">
        <div className="text-xs font-mono font-bold text-slate-500 uppercase">🍪 Boîtes de biscuits</div>
        <GroupBuilder perGroup={BISCUIT_BOX_MASS} groups={done ? BISCUIT_BOX_TARGET : biscuitBoxes} onChange={setBiscuitBoxes} max={BISCUIT_BOX_TARGET} tone="amber" unit=" g" disabled={done} />
      </div>
      <div className="space-y-1.5">
        <div className="text-xs font-mono font-bold text-slate-500 uppercase">🧃 Boîtes de jus</div>
        <GroupBuilder perGroup={JUS_BOX_MASS} groups={done ? JUS_BOX_TARGET : jusBoxes} onChange={setJusBoxes} max={JUS_BOX_TARGET} tone="sky" unit=" g" disabled={done} />
      </div>
      <div className="text-center font-mono text-lg font-bold text-slate-800">
        Total en cours : {done ? TOTAL_G : totalSoFar} g
      </div>
      {(reached || done) && (
        <div className="text-center">
          {!done && <ValidateButton onClick={() => onSolved?.()}>La commande est prête</ValidateButton>}
          {done && <Feedback tone="ok">Commande complète : {TOTAL_G} g au total.</Feedback>}
        </div>
      )}
    </div>
  );
}

function TotalMass({ done, onSolved }) {
  const [gVal, setGVal] = useState('');
  const [gChecked, setGChecked] = useState(false);
  const gOk = gChecked && parseDec(gVal) === TOTAL_G;

  const [kgVal, setKgVal] = useState('');
  const [kgChecked, setKgChecked] = useState(false);
  const kgExpected = TOTAL_G / 1000;
  const kgOk = kgChecked && !Number.isNaN(parseDec(kgVal)) && roundTo(parseDec(kgVal), 3) === kgExpected;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Quelle est la masse totale de la commande, en grammes ?</p>
        <div className="flex items-center justify-center gap-2">
          <NumberField value={gVal} onChange={(v) => { setGChecked(false); setGVal(v); }} ariaLabel="Masse totale en grammes" width="w-32" />
          <span className="font-mono text-sm text-slate-500">g</span>
        </div>
        {!gOk && (
          <div className="text-center">
            <ValidateButton onClick={() => setGChecked(true)} disabled={gVal === ''}>Valider</ValidateButton>
          </div>
        )}
        {gChecked && !gOk && <Feedback tone="hint">{BISCUIT_BOX_TARGET} × {BISCUIT_BOX_MASS} g + {JUS_BOX_TARGET} × {JUS_BOX_MASS} g = ?</Feedback>}
        {gOk && <Feedback tone="ok">{BISCUIT_BOX_TARGET} × {BISCUIT_BOX_MASS} + {JUS_BOX_TARGET} × {JUS_BOX_MASS} = <strong>{TOTAL_G} g</strong>.</Feedback>}
      </div>

      {gOk && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Et en kg, pour l’annoncer simplement ?</p>
          <div className="flex items-center justify-center gap-2">
            <NumberField value={kgVal} onChange={(v) => { setKgChecked(false); setKgVal(v); }} ariaLabel="Masse totale en kg" width="w-32" />
            <span className="font-mono text-sm text-slate-500">kg</span>
          </div>
          {!done && (
            <div className="text-center">
              <ValidateButton onClick={() => { setKgChecked(true); if (!Number.isNaN(parseDec(kgVal)) && roundTo(parseDec(kgVal), 3) === kgExpected) onSolved?.(); }} disabled={kgVal === ''}>
                Valider
              </ValidateButton>
            </div>
          )}
          {kgChecked && !kgOk && <Feedback tone="hint">1000 g = 1 kg.</Feedback>}
          {(kgOk || done) && <Feedback tone="ok">{TOTAL_G} g = <strong>{formatMass(kgExpected, 'kg')}</strong>.</Feedback>}
        </div>
      )}
    </div>
  );
}

const ESTIM_Q = {
  id: 'masses-eval-estimation',
  q: 'Une commande de 8,4 kg pour 24 élèves : cela te semble-t-il cohérent ?',
  options: [
    'Oui : cela fait environ 350 g par élève, un goûter raisonnable',
    'Non : c’est beaucoup trop lourd pour un simple goûter',
  ],
  correct: 0,
  explain: '8,4 kg ÷ 24 élèves ≈ 350 g par élève — un sachet de biscuits et une brique de jus par personne, tout à fait cohérent.',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P6', '6e_masses_P1'] },
};

const RECAP = [
  { emoji: '⚖️', label: 'Comparer' },
  { emoji: '📟', label: 'Mesurer' },
  { emoji: '🎯', label: 'Choisir l’unité' },
  { emoji: '🧱', label: 'Relations d’unités' },
  { emoji: '🔁', label: 'Convertir' },
];

export default function Module07MissionFinale() {
  const navLinks = getNavLinks(7);
  const { xp } = useProgress(MODULE_CTX.lessonId);

  const [infoDone, setInfoDone] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [totalDone, setTotalDone] = useState(false);
  const [estimPick, setEstimPick] = useState(null);
  const [estimRevealed, setEstimRevealed] = useState(false);
  const s4 = estimRevealed && estimPick === ESTIM_Q.correct;

  const allDone = infoDone && orderDone && totalDone && s4;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="🏆 Mission finale : le ravitaillement"
      moduleSubtitle="Prépare le goûter de l’école : mobilise tout ce que tu as appris."
      moduleNumber={7}
      estimatedTime="16 min"
      xp={xp}
      prevLink={navLinks.prevLink}
      nextLink={navLinks.nextLink}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🏆 Mission finale" title="L’école prépare une sortie et doit commander le goûter pour 24 élèves." tone="amber">
          <p>Toutes les informations ne sont pas utiles. À toi de trier, construire, calculer et vérifier.</p>
        </MissionBrief>

        <StepCard num={1} title="Les informations utiles" done={infoDone}>
          <InfoSorter items={INFO_ITEMS} solved={infoDone} onSolved={() => setInfoDone(true)} />
        </StepCard>

        <StepCard num={2} title="Préparer la commande" done={orderDone} locked={!infoDone}>
          <BuildOrder done={orderDone} onSolved={() => setOrderDone(true)} />
        </StepCard>

        <StepCard num={3} title="La masse totale" done={totalDone} locked={!orderDone}>
          <TotalMass done={totalDone} onSolved={() => setTotalDone(true)} />
        </StepCard>

        <StepCard num={4} title="Est-ce cohérent ?" done={s4} locked={!totalDone}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{ESTIM_Q.q}</p>
            <ChoiceGrid options={ESTIM_Q.options} selected={estimPick} onSelect={setEstimPick} revealed={estimRevealed} correctIndex={ESTIM_Q.correct} cols={1} />
            {!estimRevealed && (
              <div className="text-center"><ValidateButton onClick={() => setEstimRevealed(true)} disabled={estimPick === null}>Valider</ValidateButton></div>
            )}
            {estimRevealed && (
              <Feedback tone={s4 ? 'ok' : 'ko'}>
                {ESTIM_Q.explain}
                {!s4 && <> <button type="button" onClick={() => { setEstimRevealed(false); setEstimPick(null); }} className="underline font-semibold">Réessayer</button></>}
              </Feedback>
            )}
          </div>
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-8 text-center space-y-4">
            <Trophy className="w-10 h-10 mx-auto" aria-hidden="true" />
            <div className="text-2xl font-space font-extrabold">Mission accomplie !</div>
            <p className="text-amber-50 text-sm leading-relaxed max-w-lg mx-auto">
              Du tri des informations à la vérification finale, tu as comparé, mesuré, choisi une unité, construit
              les relations entre unités, converti et estimé — sur une seule et même situation.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {RECAP.map((r) => (
                <div key={r.label} className="bg-white/15 rounded-xl py-2.5 px-1 text-xs font-bold flex flex-col items-center gap-1">
                  <span className="text-lg" aria-hidden="true">{r.emoji}</span>
                  {r.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
