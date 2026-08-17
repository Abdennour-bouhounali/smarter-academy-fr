import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField, QuantityCard } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec, roundTo, formatMass } from '../components/massUtils';

const SCENARIOS = [
  { id: 'sac', emoji: '🎒', label: 'Un sac à dos plein', options: [{ v: 50, u: 'g' }, { v: 5, u: 'kg' }, { v: 500, u: 'kg' }], correct: 1 },
  { id: 'camion', emoji: '🚚', label: 'Un camion chargé', options: [{ v: 2, u: 'g' }, { v: 2, u: 'kg' }, { v: 2, u: 't' }], correct: 2 },
  { id: 'chocolat', emoji: '🍫', label: 'Une tablette de chocolat', options: [{ v: 10, u: 'g' }, { v: 100, u: 'g' }, { v: 1, u: 'kg' }], correct: 1 },
  { id: 'plume', emoji: '🪶', label: 'Une plume', options: [{ v: 1, u: 'mg' }, { v: 1, u: 'g' }, { v: 10, u: 'g' }], correct: 1 },
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

function CraiesProblem({ done, onSolved }) {
  const [gVal, setGVal] = useState('');
  const [gChecked, setGChecked] = useState(false);
  const gOk = gChecked && parseDec(gVal) === 2000;

  const [kgVal, setKgVal] = useState('');
  const [kgChecked, setKgChecked] = useState(false);
  const kgOk = kgChecked && !Number.isNaN(parseDec(kgVal)) && roundTo(parseDec(kgVal), 3) === 2;

  const [plausPick, setPlausPick] = useState(null);
  const [plausRevealed, setPlausRevealed] = useState(false);
  const plausOk = plausRevealed && plausPick === 0;

  return (
    <div className="space-y-5">
      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
        Une classe achète <strong>8 boîtes</strong> de craies. Chaque boîte contient <strong>250 g</strong> de craie.
        Quelle masse totale de craies la classe a-t-elle achetée ?
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <NumberField value={gVal} onChange={(v) => { setGChecked(false); setGVal(v); }} ariaLabel="Masse totale en grammes" width="w-32" />
          <span className="font-mono text-sm text-slate-500">g</span>
        </div>
        {!gOk && (
          <div className="text-center">
            <ValidateButton onClick={() => setGChecked(true)} disabled={gVal === ''}>Valider</ValidateButton>
          </div>
        )}
        {gChecked && !gOk && <Feedback tone="hint">8 boîtes de 250 g : additionne 250 g huit fois, ou pense à un raccourci.</Feedback>}
        {gOk && <Feedback tone="ok">8 × 250 g = <strong>2000 g</strong>.</Feedback>}
      </div>

      {gOk && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Exprime aussi ce résultat en kg.</p>
          <div className="flex items-center justify-center gap-2">
            <NumberField value={kgVal} onChange={(v) => { setKgChecked(false); setKgVal(v); }} ariaLabel="Masse totale en kg" width="w-32" />
            <span className="font-mono text-sm text-slate-500">kg</span>
          </div>
          {!kgOk && (
            <div className="text-center">
              <ValidateButton onClick={() => setKgChecked(true)} disabled={kgVal === ''}>Valider</ValidateButton>
            </div>
          )}
          {kgChecked && !kgOk && <Feedback tone="hint">1000 g = 1 kg.</Feedback>}
          {kgOk && <Feedback tone="ok">2000 g = <strong>{formatMass(2, 'kg')}</strong>.</Feedback>}
        </div>
      )}

      {kgOk && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">2 kg de craies pour toute une classe : cela te semble-t-il raisonnable ?</p>
          <ChoiceGrid
            options={['Oui, c’est raisonnable pour 8 boîtes', 'Non, c’est beaucoup trop lourd']}
            selected={plausPick}
            onSelect={setPlausPick}
            revealed={plausRevealed}
            correctIndex={0}
            cols={1}
            disabled={done}
          />
          {!done && !plausOk && (
            <div className="text-center">
              <ValidateButton onClick={() => { setPlausRevealed(true); if (plausPick === 0) onSolved?.(); }} disabled={plausPick === null}>Valider</ValidateButton>
            </div>
          )}
          {plausRevealed && (
            <Feedback tone={plausPick === 0 ? 'ok' : 'ko'}>2 kg, c’est un peu plus lourd qu’un sac de sucre : tout à fait raisonnable pour huit boîtes de craies.</Feedback>
          )}
        </div>
      )}
    </div>
  );
}

function ColisProblem({ done, onSolved }) {
  const [val, setVal] = useState('');
  const [checked, setChecked] = useState(false);
  const isRight = checked && parseDec(val) === 2800;

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
        Un colis plein pèse <strong>3,2 kg</strong>. Le colis vide (sans son contenu) pèse <strong>400 g</strong>.
        Quelle est la masse du contenu seul, en grammes ?
      </div>
      <div className="flex items-center justify-center gap-2">
        <NumberField value={val} onChange={(v) => { setChecked(false); setVal(v); }} ariaLabel="Masse du contenu en grammes" width="w-32" />
        <span className="font-mono text-sm text-slate-500">g</span>
      </div>
      {!done && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (parseDec(val) === 2800) onSolved?.(); }} disabled={val === ''}>Valider</ValidateButton>
        </div>
      )}
      {checked && !isRight && <Feedback tone="hint">Les deux masses doivent être dans la MÊME unité avant de soustraire : 3,2 kg = 3200 g.</Feedback>}
      {(isRight || done) && <Feedback tone="ok">3,2 kg = 3200 g. 3200 g − 400 g = <strong>2800 g</strong>.</Feedback>}
    </div>
  );
}

export default function Module06EstimationProblemes() {
  const navLinks = getNavLinks(6);
  const [scenarioDone, setScenarioDone] = useState({});
  const allScenariosDone = SCENARIOS.every((s) => scenarioDone[s.id]);
  const [craiesDone, setCraiesDone] = useState(false);
  const [colisDone, setColisDone] = useState(false);
  const allDone = allScenariosDone && craiesDone && colisDone;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Estimer et résoudre"
      moduleSubtitle="Ordre de grandeur, pièges à unité et problèmes concrets."
      moduleNumber={6}
      estimatedTime="11 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 06" title="Avant de peser, essaie de deviner.">
          <p>Puis mobilise tout ce que tu sais pour résoudre deux problèmes concrets.</p>
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

        <StepCard num={2} title="Le ravitaillement de craies" done={craiesDone} locked={!allScenariosDone}>
          <CraiesProblem done={craiesDone} onSolved={() => setCraiesDone(true)} />
        </StepCard>

        <StepCard num={3} title="Le colis" done={colisDone} locked={!craiesDone}>
          <ColisProblem done={colisDone} onSolved={() => setColisDone(true)} />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Target className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Estimer avant de calculer, et vérifier après : ce réflexe permet de repérer un résultat impossible.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
