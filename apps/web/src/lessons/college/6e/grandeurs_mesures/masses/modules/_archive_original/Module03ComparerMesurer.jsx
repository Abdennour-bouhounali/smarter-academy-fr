import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Balance from '../components/Balance';
import ItemBank from '../components/ItemBank';
import Gauge from '../components/Gauge';

const WEIGHTS = [
  { id: 'w1', emoji: '⚫', label: '100 g', mass: 100 },
  { id: 'w2', emoji: '⚫', label: '100 g', mass: 100 },
  { id: 'w3', emoji: '⚫', label: '100 g', mass: 100 },
  { id: 'w300', emoji: '⬛', label: '300 g', mass: 300 },
];

/** Zone (gauche/droite/aucune) dont le rectangle contient le point (x, y). */
function zoneAt(x, y, leftZoneRef, rightZoneRef) {
  const l = leftZoneRef.current?.getBoundingClientRect();
  if (l && x >= l.left && x <= l.right && y >= l.top && y <= l.bottom) return 'left';
  const r = rightZoneRef.current?.getBoundingClientRect();
  if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return 'right';
  return null;
}

function EquivalenceBalance({ solved, onSolved }) {
  const [placement, setPlacement] = useState({});
  const [dragging, setDragging] = useState(false);
  const leftZoneRef = useRef(null);
  const rightZoneRef = useRef(null);
  const left = WEIGHTS.filter((it) => placement[it.id] === 'left');
  const right = WEIGHTS.filter((it) => placement[it.id] === 'right');
  const totalLeft = left.reduce((s, it) => s + it.mass, 0);
  const totalRight = right.reduce((s, it) => s + it.mass, 0);
  const allPlaced = WEIGHTS.every((it) => placement[it.id]);
  const equal = allPlaced && totalLeft === totalRight && totalLeft > 0;

  const handleRelease = (id, x, y) => {
    const zone = zoneAt(x, y, leftZoneRef, rightZoneRef);
    if (!zone) return;
    setPlacement((p) => ({ ...p, [id]: zone }));
  };

  const takeBack = (id) => {
    if (solved) return;
    setPlacement((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  };

  React.useEffect(() => {
    if (equal && !solved) onSolved?.();
  }, [equal, solved, onSolved]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Répartis les quatre poids sur les deux plateaux pour trouver un arrangement à l’équilibre.
      </p>
      <ItemBank items={WEIGHTS} placement={placement} onDragRelease={handleRelease} onDraggingChange={setDragging} disabled={solved} />
      <Balance
        left={left}
        right={right}
        unit="g"
        showValues={allPlaced}
        dragging={dragging}
        leftZoneRef={leftZoneRef}
        rightZoneRef={rightZoneRef}
        onItemTap={solved ? undefined : takeBack}
        ariaLabel="Balance avec des poids de 100 g et 300 g"
      />
      {(solved || equal) && (
        <Feedback tone="ok">
          100 g + 100 g + 100 g = <strong>300 g</strong> : trois poids de 100 g pèsent exactement comme un seul poids
          de 300 g. La balance s’équilibre.
        </Feedback>
      )}
    </div>
  );
}

const GAUGE_ROUNDS = [
  { value: 500, max: 1000, step: 100, labelEvery: 2, options: ['300 g', '500 g', '700 g'], correct: 1 },
  { value: 1000, max: 2000, step: 200, labelEvery: 1, options: ['800 g', '1 kg', '1 kg 200 g'], correct: 1 },
  { value: 1250, max: 2000, step: 250, labelEvery: 1, options: ['1 kg 250 g', '1 kg 500 g', '2 kg'], correct: 0 },
];

function GaugeRound({ round, done, onSolved }) {
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  const isRight = checked && pick === round.correct;

  return (
    <div className="space-y-3">
      <Gauge min={0} max={round.max} value={round.value} step={round.step} labelEvery={round.labelEvery} unit="g" revealValue={done || isRight} ariaLabel="Balance à affichage numérique" />
      <p className="text-sm font-semibold text-slate-700 text-center">Quelle masse la balance affiche-t-elle ?</p>
      <ChoiceGrid options={round.options} selected={pick} onSelect={(i) => { setChecked(false); setPick(i); }} revealed={checked} correctIndex={round.correct} cols={3} disabled={done} />
      {!done && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (pick === round.correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
        </div>
      )}
      {checked && !isRight && <Feedback tone="hint">Regarde jusqu’où la barre est remplie, puis compare aux graduations.</Feedback>}
      {(isRight || done) && checked && <Feedback tone="ok">C’est bien {round.options[round.correct]}.</Feedback>}
    </div>
  );
}

export default function Module03ComparerMesurer() {
  const navLinks = getNavLinks(3);
  const [equivDone, setEquivDone] = useState(false);
  const [gaugeDone, setGaugeDone] = useState({});
  const allGaugesDone = GAUGE_ROUNDS.every((_, i) => gaugeDone[i]);
  const allDone = equivDone && allGaugesDone;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Comparer et mesurer"
      moduleSubtitle="La balance à deux plateaux, puis la balance à affichage."
      moduleNumber={3}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="📋 Mission 03" title="Une balance permet de comparer… et de compter.">
          <p>Trois petits poids peuvent peser exactement comme un gros. Vérifie-le toi-même.</p>
        </MissionBrief>

        <StepCard num={1} title="Trois poids, un seul poids" done={equivDone}>
          <EquivalenceBalance solved={equivDone} onSolved={() => setEquivDone(true)} />
        </StepCard>

        <StepCard num={2} title="Lire une balance à affichage" done={allGaugesDone} locked={!equivDone}>
          <div className="space-y-8">
            {GAUGE_ROUNDS.map((r, i) => (
              (i === 0 || gaugeDone[i - 1]) && (
                <div key={i} className="border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                  <GaugeRound round={r} done={!!gaugeDone[i]} onSolved={() => setGaugeDone((d) => ({ ...d, [i]: true }))} />
                </div>
              )
            ))}
          </div>
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Deux outils, un même objectif : comparer des masses. La balance à plateaux montre un écart ; la balance
              à affichage donne un nombre.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
