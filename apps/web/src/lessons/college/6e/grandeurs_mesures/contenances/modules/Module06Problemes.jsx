import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ValidateButton, StepCard, MissionBrief, NumberField, QuantityCard } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import InfoSorter from '../../../../../common/components/InfoSorter';
import { parseDec, roundTo, formatCapacity } from '../components/capacityUtils';

const SCENARIOS = [
  { id: 'baignoire', emoji: '🛁', label: 'Une baignoire pleine', options: [{ v: 3, u: 'L' }, { v: 30, u: 'L' }, { v: 300, u: 'L' }], correct: 2 },
  { id: 'arrosoir', emoji: '🪣', label: 'Un arrosoir plein', options: [{ v: 5, u: 'cL' }, { v: 5, u: 'L' }, { v: 5, u: 'mL' }], correct: 1 },
  { id: 'cuillere', emoji: '🥄', label: 'Une cuillère à café de sirop', options: [{ v: 5, u: 'mL' }, { v: 5, u: 'cL' }, { v: 5, u: 'dL' }], correct: 0 },
  { id: 'piscine', emoji: '🏊', label: 'Une piscine de jardin', options: [{ v: 2, u: 'L' }, { v: 20, u: 'L' }, { v: 2000, u: 'L' }], correct: 2 },
];

function EstimateScenario({ scenario, done, onSolved }) {
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  const isRight = checked && pick === scenario.correct;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl" aria-hidden="true">{scenario.emoji}</span>
        <span className="text-sm font-semibold text-slate-700">{scenario.label}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {scenario.options.map((o, i) => (
          <QuantityCard key={i} label="Proposition" value={o.v} unit={o.u} selected={pick === i} onClick={done ? undefined : () => { setChecked(false); setPick(i); }} disabled={done} />
        ))}
      </div>
      {!done && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (pick === scenario.correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
        </div>
      )}
      {checked && !isRight && (
        <Feedback tone="hint">
          Compare à des repères connus, puis{' '}
          <button type="button" onClick={() => { setChecked(false); setPick(null); }} className="underline font-semibold">réessaie</button>.
        </Feedback>
      )}
      {checked && isRight && (
        <Feedback tone="ok">{scenario.options[scenario.correct].v} {scenario.options[scenario.correct].u} : le bon ordre de grandeur.</Feedback>
      )}
    </div>
  );
}

const INFO_ITEMS = [
  { id: 'bouteilles', text: 'On dispose de 4 bouteilles de 1,5 L de jus.', useful: true },
  { id: 'invites', text: 'Il y a 20 invités à la fête.', useful: false },
  { id: 'verre', text: 'Chaque verre servi contient 25 cL.', useful: true },
  { id: 'prix', text: 'Une bouteille de jus coûte 2,50 €.', useful: false },
  { id: 'heure', text: 'La fête commence à 15h.', useful: false },
];

const JUS_TOTAL_L = 1.5;
const VERRE_CL = 25;

function JusProblem({ done, onSolved }) {
  const [clVal, setClVal] = useState('');
  const [clChecked, setClChecked] = useState(false);
  const expectedCl = JUS_TOTAL_L * 100;
  const clOk = clChecked && parseDec(clVal) === expectedCl;

  const [verresVal, setVerresVal] = useState('');
  const [verresChecked, setVerresChecked] = useState(false);
  const expectedVerres = expectedCl / VERRE_CL;
  const verresOk = verresChecked && parseDec(verresVal) === expectedVerres;

  return (
    <div className="space-y-5">
      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
        Une bouteille contient <strong>1,5 L</strong> de jus. On veut remplir des verres de <strong>25 cL</strong>.
        Combien de verres peut-on remplir ?
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">D’abord, exprime les 1,5 L en cL — pour comparer avec la taille des verres.</p>
        <div className="flex items-center justify-center gap-2">
          <NumberField value={clVal} onChange={(v) => { setClChecked(false); setClVal(v); }} ariaLabel="Contenance de la bouteille en cL" width="w-32" />
          <span className="font-mono text-sm text-slate-500">cL</span>
        </div>
        {!clOk && (
          <div className="text-center">
            <ValidateButton onClick={() => setClChecked(true)} disabled={clVal === ''}>Valider</ValidateButton>
          </div>
        )}
        {clChecked && !clOk && <Feedback tone="hint">1 L = 100 cL, donc 1,5 L devient un nombre 100 fois plus grand.</Feedback>}
        {clOk && <Feedback tone="ok">1,5 L = <strong>{formatCapacity(expectedCl, 'cL')}</strong>.</Feedback>}
      </div>

      {clOk && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Maintenant, combien de verres de 25 cL peut-on remplir avec {expectedCl} cL ?</p>
          <div className="flex items-center justify-center gap-2">
            <NumberField value={verresVal} onChange={(v) => { setVerresChecked(false); setVerresVal(v); }} ariaLabel="Nombre de verres" width="w-24" />
            <span className="font-mono text-sm text-slate-500">verres</span>
          </div>
          {!done && (
            <div className="text-center">
              <ValidateButton onClick={() => { setVerresChecked(true); if (parseDec(verresVal) === expectedVerres) onSolved?.(); }} disabled={verresVal === ''}>
                Valider
              </ValidateButton>
            </div>
          )}
          {verresChecked && !verresOk && <Feedback tone="hint">{expectedCl} cL à répartir en verres de {VERRE_CL} cL : {expectedCl} ÷ {VERRE_CL} = ?</Feedback>}
          {(verresOk || done) && <Feedback tone="ok">{expectedCl} ÷ {VERRE_CL} = <strong>{expectedVerres} verres</strong>.</Feedback>}
        </div>
      )}
    </div>
  );
}

export default function Module06Problemes() {
  const navLinks = getNavLinks(6);
  const [scenarioDone, setScenarioDone] = useState({});
  const allScenariosDone = SCENARIOS.every((s) => scenarioDone[s.id]);
  const [infoDone, setInfoDone] = useState(false);
  const [jusDone, setJusDone] = useState(false);
  const allDone = allScenariosDone && infoDone && jusDone;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Problèmes et choix d’unité"
      moduleSubtitle="Jus, arrosage, piscine : mobilise tes réflexes de mesure."
      moduleNumber={6}
      estimatedTime="11 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 06" title="Avant de mesurer, essaie de deviner.">
          <p>Puis mobilise tout ce que tu sais pour résoudre un vrai problème.</p>
        </MissionBrief>

        <StepCard num={1} title="Le bon ordre de grandeur" done={allScenariosDone}>
          <div className="space-y-8">
            {SCENARIOS.map((s, i) => (
              (i === 0 || scenarioDone[SCENARIOS[i - 1].id]) && (
                <div key={s.id} className="border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                  <EstimateScenario scenario={s} done={!!scenarioDone[s.id]} onSolved={() => setScenarioDone((d) => ({ ...d, [s.id]: true }))} />
                </div>
              )
            ))}
          </div>
        </StepCard>

        <StepCard num={2} title="Les informations utiles" done={infoDone} locked={!allScenariosDone}>
          <InfoSorter items={INFO_ITEMS} solved={infoDone} onSolved={() => setInfoDone(true)} />
        </StepCard>

        <StepCard num={3} title="Le bar à jus" done={jusDone} locked={!infoDone}>
          <JusProblem done={jusDone} onSolved={() => setJusDone(true)} />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Target className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Estimer, trier les informations utiles, convertir puis calculer : c’est cette démarche complète que tu
              utiliseras dans la mission finale.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
