import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, QuantityCard } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberLine from '../../../../../common/components/NumberLine';

const SCENARIOS = [
  { id: 'porte', emoji: '🚪', label: 'La hauteur d’une porte', options: [{ v: 20, u: 'cm' }, { v: 2, u: 'm' }, { v: 20, u: 'm' }], correct: 1 },
  { id: 'foot', emoji: '⚽', label: 'La longueur d’un terrain de foot', options: [{ v: 10, u: 'm' }, { v: 100, u: 'm' }, { v: 1000, u: 'm' }], correct: 1 },
  { id: 'cd', emoji: '💿', label: 'L’épaisseur d’un CD', options: [{ v: 1, u: 'mm' }, { v: 1, u: 'cm' }, { v: 10, u: 'cm' }], correct: 0 },
  { id: 'trajet', emoji: '🚗', label: 'Le trajet Paris–Marseille', options: [{ v: 8, u: 'km' }, { v: 80, u: 'km' }, { v: 800, u: 'km' }], correct: 2 },
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
          <QuantityCard
            key={i}
            label="Proposition"
            value={o.v}
            unit={o.u}
            selected={pick === i}
            onClick={done ? undefined : () => { setChecked(false); setPick(i); }}
            disabled={done}
          />
        ))}
      </div>
      {!done && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (pick === scenario.correct) onSolved?.(); }} disabled={pick === null}>
            Valider
          </ValidateButton>
        </div>
      )}
      {checked && !isRight && (
        <Feedback tone="hint">
          Compare à des repères connus, puis{' '}
          <button type="button" onClick={() => { setChecked(false); setPick(null); }} className="underline font-semibold">réessaie</button>.
        </Feedback>
      )}
      {checked && isRight && (
        <Feedback tone="ok">
          {scenario.options[scenario.correct].v} {scenario.options[scenario.correct].u} : le bon ordre de grandeur.
        </Feedback>
      )}
    </div>
  );
}

const NL_OPTIONS = ['A (proche de 0)', 'B (proche du milieu)', 'C (proche de la fin)'];

export default function Module05ChoisirEstimer() {
  const navLinks = getNavLinks(5);
  const [done, setDone] = useState({});
  const allScenariosDone = SCENARIOS.every((s) => done[s.id]);

  const [nlPick, setNlPick] = useState(null);
  const [nlChecked, setNlChecked] = useState(false);
  const nlOk = nlChecked && nlPick === 1;

  const allDone = allScenariosDone && nlOk;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Choisir et estimer"
      moduleSubtitle="Quelle unité choisir ? Quel ordre de grandeur attendre avant de mesurer ?"
      moduleNumber={5}
      estimatedTime="9 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="📋 Mission 05" title="Avant de sortir la règle, essaie de deviner.">
          <p>Pour chaque objet, choisis la proposition la plus réaliste — unité ET valeur en même temps.</p>
        </MissionBrief>

        <StepCard num={1} title="Le bon ordre de grandeur" done={allScenariosDone}>
          <div className="space-y-8">
            {SCENARIOS.map((s, i) => (
              (i === 0 || done[SCENARIOS[i - 1].id]) && (
                <div key={s.id} className="border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                  <EstimateScenario scenario={s} done={!!done[s.id]} onSolved={() => setDone((d) => ({ ...d, [s.id]: true }))} />
                </div>
              )
            ))}
          </div>
        </StepCard>

        <StepCard num={2} title="Vois-le sur une droite graduée" done={nlOk} locked={!allScenariosDone}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Cette droite va de 0 à 5 m. La hauteur d’une porte est d’environ 2 m : parmi ces trois repères, lequel
              correspond le mieux ?
            </p>
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
              <NumberLine
                min={0}
                max={5}
                step={1}
                labelEvery={1}
                height={150}
                markers={[
                  { value: 0.4, label: 'A', color: '#dc2626' },
                  { value: 2.1, label: 'B', color: '#2563eb' },
                  { value: 4.3, label: 'C', color: '#059669' },
                ]}
                ariaLabel="Droite graduée de 0 à 5 mètres avec trois repères A, B, C"
              />
            </div>
            <ChoiceGrid options={NL_OPTIONS} selected={nlPick} onSelect={(i) => { setNlChecked(false); setNlPick(i); }} revealed={nlChecked} correctIndex={1} cols={1} disabled={nlOk} />
            {!nlOk && (
              <div className="text-center">
                <ValidateButton onClick={() => setNlChecked(true)} disabled={nlPick === null}>Valider</ValidateButton>
              </div>
            )}
            {nlChecked && nlPick !== 1 && (
              <Feedback tone="hint">2 m, c'est un peu moins de la moitié de 5 m : cherche le repère le plus proche du milieu.{' '}
                <button type="button" onClick={() => { setNlChecked(false); setNlPick(null); }} className="underline font-semibold">Réessayer</button>
              </Feedback>
            )}
            {nlPick === 1 && nlChecked && (
              <Feedback tone="ok">B est bien proche de 2 m : c’est le repère qui correspond à la hauteur d’une porte.</Feedback>
            )}
          </div>
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Target className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Estimer avant de mesurer permet de repérer tout de suite un résultat impossible.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
