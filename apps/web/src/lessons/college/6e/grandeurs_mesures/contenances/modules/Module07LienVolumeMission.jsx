import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LiquidContainer from '../components/LiquidContainer';
import { parseDec, formatCapacity } from '../components/capacityUtils';

/* ─── Étape 1 : le cube et le litre ──────────────────────────────── */
// Question-level assessment metadata (docs/architecture/AI_LESSON_CONTRACT.md):
// this evaluation module's checkpoints are hand-built step components rather
// than a single data-driven array, so each checkpoint's graded question is
// tagged here, adjacent to the logic it certifies.
const CUBE_LITRE_QUESTION = {
  id: 'eval-01-cube-litre',
  prompt: '1 dm³ = 1 L ?',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P6'] },
};

function CubeLitre({ done, onSolved }) {
  const [filled, setFilled] = useState(false);
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  const correct = 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Voici un cube dont chaque arête mesure exactement <strong>1 dm</strong> (10 cm). Remplis-le complètement.
      </p>
      <div className="flex justify-center">
        <LiquidContainer shape="cube" fillPct={filled ? 1 : 0} color="#8b5cf6" ariaLabel="Cube de 1 dm d’arête" height={180} />
      </div>
      {!filled && (
        <div className="text-center">
          <ValidateButton onClick={() => setFilled(true)}>Remplir le cube</ValidateButton>
        </div>
      )}
      {filled && (
        <div className="space-y-4">
          <Feedback tone="info">Ce cube de 1 dm × 1 dm × 1 dm, une fois plein, contient très exactement 1 L.</Feedback>
          <p className="text-sm font-semibold text-slate-700 text-center">Que peux-tu donc écrire ?</p>
          <ChoiceGrid options={['1 dm³ = 1 L', '1 dm³ = 1 mL', '1 dm³ = 100 L']} selected={pick} onSelect={(i) => { setChecked(false); setPick(i); }} revealed={checked} correctIndex={correct} cols={1} disabled={done} />
          {!done && (
            <div className="text-center">
              <ValidateButton onClick={() => { setChecked(true); if (pick === correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
            </div>
          )}
          {checked && (
            <Feedback tone={pick === correct ? 'ok' : 'ko'}>
              Un cube de 1 dm d’arête a un volume de 1 dm³, et il contient exactement 1 L : c’est le lien entre
              contenance et volume.
              {pick !== correct && (
                <>
                  {' '}
                  <button type="button" onClick={() => { setChecked(false); setPick(null); }} className="underline font-semibold">Réessayer</button>
                </>
              )}
            </Feedback>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Mission : le bar à jus ──────────────────────────────────────── */
const N_BOTTLES = 4;
const BOTTLE_L = 1;
const VERRE_CL = 20;
const CUVE_CAP_CL = 500;

const TOTAL_JUS_QUESTION = {
  id: 'eval-02-total-jus',
  prompt: 'Quantité totale de jus, puis conversion en cL.',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P1', '6e_contenances_P5'] },
};

function TotalJus({ done, onSolved }) {
  const [lVal, setLVal] = useState('');
  const [lChecked, setLChecked] = useState(false);
  const expectedL = N_BOTTLES * BOTTLE_L;
  const lOk = lChecked && parseDec(lVal) === expectedL;

  const [clVal, setClVal] = useState('');
  const [clChecked, setClChecked] = useState(false);
  const expectedCl = expectedL * 100;
  const clOk = clChecked && parseDec(clVal) === expectedCl;

  return (
    <div className="space-y-5">
      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
        L’école a acheté <strong>{N_BOTTLES} bouteilles</strong> de jus d’<strong>{BOTTLE_L} L</strong> chacune, pour
        servir des verres de <strong>{VERRE_CL} cL</strong>.
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Quelle est la quantité totale de jus, en L ?</p>
        <div className="flex items-center justify-center gap-2">
          <NumberField value={lVal} onChange={(v) => { setLChecked(false); setLVal(v); }} ariaLabel="Total en litres" width="w-24" />
          <span className="font-mono text-sm text-slate-500">L</span>
        </div>
        {!lOk && (
          <div className="text-center"><ValidateButton onClick={() => setLChecked(true)} disabled={lVal === ''}>Valider</ValidateButton></div>
        )}
        {lChecked && !lOk && <Feedback tone="hint">{N_BOTTLES} bouteilles de {BOTTLE_L} L chacune : additionne, ou multiplie.</Feedback>}
        {lOk && <Feedback tone="ok">{N_BOTTLES} × {BOTTLE_L} L = <strong>{expectedL} L</strong>.</Feedback>}
      </div>
      {lOk && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Convertis ce total en cL, pour le comparer aux verres.</p>
          <div className="flex items-center justify-center gap-2">
            <NumberField value={clVal} onChange={(v) => { setClChecked(false); setClVal(v); }} ariaLabel="Total en cL" width="w-28" />
            <span className="font-mono text-sm text-slate-500">cL</span>
          </div>
          {!done && (
            <div className="text-center"><ValidateButton onClick={() => { setClChecked(true); if (parseDec(clVal) === expectedCl) onSolved?.(); }} disabled={clVal === ''}>Valider</ValidateButton></div>
          )}
          {clChecked && !clOk && <Feedback tone="hint">1 L = 100 cL.</Feedback>}
          {(clOk || done) && <Feedback tone="ok">{expectedL} L = <strong>{formatCapacity(expectedCl, 'cL')}</strong>.</Feedback>}
        </div>
      )}
    </div>
  );
}

const VERRES_QUESTION = {
  id: 'eval-03-verres',
  prompt: 'Combien de verres peut-on servir avec la contenance totale ?',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P4'] },
};

function VerresProblem({ done, onSolved }) {
  const totalCl = N_BOTTLES * BOTTLE_L * 100;
  const [val, setVal] = useState('');
  const [checked, setChecked] = useState(false);
  const expected = totalCl / VERRE_CL;
  const isRight = checked && parseDec(val) === expected;

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">Avec {totalCl} cL de jus, combien de verres de {VERRE_CL} cL peut-on servir ?</p>
      <div className="flex items-center justify-center gap-2">
        <NumberField value={val} onChange={(v) => { setChecked(false); setVal(v); }} ariaLabel="Nombre de verres" width="w-24" />
        <span className="font-mono text-sm text-slate-500">verres</span>
      </div>
      {!done && (
        <div className="text-center"><ValidateButton onClick={() => { setChecked(true); if (parseDec(val) === expected) onSolved?.(); }} disabled={val === ''}>Valider</ValidateButton></div>
      )}
      {checked && !isRight && <Feedback tone="hint">{totalCl} ÷ {VERRE_CL} = ?</Feedback>}
      {(isRight || done) && <Feedback tone="ok">{totalCl} ÷ {VERRE_CL} = <strong>{expected} verres</strong>.</Feedback>}
    </div>
  );
}

const CUVE_QUESTION = {
  id: 'eval-04-cuve',
  prompt: 'Tout le jus tient-il dans la cuve graduée ?',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P2', '6e_contenances_P3'] },
};

function CuveCheck({ done, onSolved }) {
  const totalCl = N_BOTTLES * BOTTLE_L * 100;
  const [poured, setPoured] = useState(false);
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  const fits = totalCl <= CUVE_CAP_CL;
  const correct = fits ? 0 : 1;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Le bar à jus utilise une grande cuve. Verse-y tout le jus des {N_BOTTLES} bouteilles.</p>
      <div className="flex justify-center">
        <LiquidContainer shape="bucket" fillPct={poured ? Math.min(1, totalCl / CUVE_CAP_CL) : 0} overflowing={poured && !fits} color="#f97316" ariaLabel="Cuve du bar à jus" />
      </div>
      {!poured && (
        <div className="text-center"><ValidateButton onClick={() => setPoured(true)}>Verser tout le jus</ValidateButton></div>
      )}
      {poured && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-700 text-center">Tout le jus tient-il dans la cuve ?</p>
          <ChoiceGrid options={['Oui, tout rentre', 'Non, ça déborde']} selected={pick} onSelect={(i) => { setChecked(false); setPick(i); }} revealed={checked} correctIndex={correct} cols={2} disabled={done} />
          {!done && (
            <div className="text-center"><ValidateButton onClick={() => { setChecked(true); if (pick === correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton></div>
          )}
          {checked && (
            <Feedback tone={pick === correct ? 'ok' : 'ko'}>
              {fits ? `${totalCl} cL tiennent dans une cuve de ${CUVE_CAP_CL} cL : tout rentre, avec de la marge.` : `${totalCl} cL dépassent la capacité de ${CUVE_CAP_CL} cL de la cuve : ça déborde.`}
              {pick !== correct && (
                <>
                  {' '}
                  <button type="button" onClick={() => { setChecked(false); setPick(null); }} className="underline font-semibold">Réessayer</button>
                </>
              )}
            </Feedback>
          )}
        </div>
      )}
    </div>
  );
}

const RECAP = [
  { emoji: '💧', label: 'Comparer' },
  { emoji: '📏', label: 'Mesurer' },
  { emoji: '🧪', label: 'Choisir l’unité' },
  { emoji: '🔁', label: 'Convertir' },
  { emoji: '📦', label: '1 L = 1 dm³' },
];

export default function Module07LienVolumeMission() {
  const navLinks = getNavLinks(7);
  const { xp } = useProgress(MODULE_CTX.lessonId);

  const [cubeDone, setCubeDone] = useState(false);
  const [totalDone, setTotalDone] = useState(false);
  const [verresDone, setVerresDone] = useState(false);
  const [cuveDone, setCuveDone] = useState(false);
  const allDone = cubeDone && totalDone && verresDone && cuveDone;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="🏆 1 L = 1 dm³ + Mission finale"
      moduleSubtitle="Le lien avec le volume, puis le bar à jus de l’école."
      moduleNumber={7}
      estimatedTime="16 min"
      xp={xp}
      prevLink={navLinks.prevLink}
      nextLink={navLinks.nextLink}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🏆 Mission finale" title="Un dernier lien à découvrir, puis le bar à jus de la fête de l’école." tone="amber">
          <p>Tu vas mobiliser tout ce que tu as appris sur les contenances, dans une seule et même situation.</p>
        </MissionBrief>

        <StepCard num={1} title="Le cube et le litre" done={cubeDone}>
          <CubeLitre done={cubeDone} onSolved={() => setCubeDone(true)} />
        </StepCard>

        <StepCard num={2} title="Le total de jus" done={totalDone} locked={!cubeDone}>
          <TotalJus done={totalDone} onSolved={() => setTotalDone(true)} />
        </StepCard>

        <StepCard num={3} title="Combien de verres ?" done={verresDone} locked={!totalDone}>
          <VerresProblem done={verresDone} onSolved={() => setVerresDone(true)} />
        </StepCard>

        <StepCard num={4} title="Tout tient-il dans la cuve ?" done={cuveDone} locked={!verresDone}>
          <CuveCheck done={cuveDone} onSolved={() => setCuveDone(true)} />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-8 text-center space-y-4">
            <Trophy className="w-10 h-10 mx-auto" aria-hidden="true" />
            <div className="text-2xl font-space font-extrabold">Mission accomplie !</div>
            <p className="text-amber-50 text-sm leading-relaxed max-w-lg mx-auto">
              Du cube de 1 dm³ au bar à jus, tu as comparé, mesuré, choisi une unité, converti et vérifié — sur une
              seule et même situation.
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
