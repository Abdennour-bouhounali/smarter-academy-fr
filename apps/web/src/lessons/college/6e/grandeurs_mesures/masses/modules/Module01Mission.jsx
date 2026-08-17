import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Balance from '../components/Balance';
import ItemBank from '../components/ItemBank';
import OrderingGame from '../../../../../common/components/OrderingGame';

/** Zone (gauche/droite/aucune) dont le rectangle contient le point (x, y). */
function zoneAt(x, y, leftZoneRef, rightZoneRef) {
  const l = leftZoneRef.current?.getBoundingClientRect();
  if (l && x >= l.left && x <= l.right && y >= l.top && y <= l.bottom) return 'left';
  const r = rightZoneRef.current?.getBoundingClientRect();
  if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return 'right';
  return null;
}

const BANK = [
  { id: 'crayon', emoji: '✏️', label: 'Un crayon', mass: 10 },
  { id: 'pomme', emoji: '🍎', label: 'Une pomme', mass: 150 },
  { id: 'cartable', emoji: '🎒', label: 'Un cartable', mass: 5000 },
  { id: 'velo', emoji: '🚲', label: 'Un vélo', mass: 12000 },
];

const VERDICT_OPTIONS = ['Le plateau gauche est plus lourd', 'Le plateau droit est plus lourd', 'Les deux plateaux sont en équilibre'];

function BalanceDiscovery({ solved, onSolved }) {
  const [placement, setPlacement] = useState({});
  const [dragging, setDragging] = useState(false);
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  const leftZoneRef = useRef(null);
  const rightZoneRef = useRef(null);

  const handleRelease = (id, x, y) => {
    const zone = zoneAt(x, y, leftZoneRef, rightZoneRef);
    if (!zone) return;
    setChecked(false);
    setPick(null);
    setPlacement((p) => ({ ...p, [id]: zone }));
  };

  const takeBack = (id) => {
    if (solved) return;
    setChecked(false);
    setPick(null);
    setPlacement((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  };

  const left = BANK.filter((it) => placement[it.id] === 'left');
  const right = BANK.filter((it) => placement[it.id] === 'right');
  const totalLeft = left.reduce((s, it) => s + it.mass, 0);
  const totalRight = right.reduce((s, it) => s + it.mass, 0);
  const canValidate = left.length > 0 && right.length > 0;
  const correctIndex = totalLeft === totalRight ? 2 : totalLeft > totalRight ? 0 : 1;
  const isRight = checked && pick === correctIndex;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Fais glisser un objet sur un plateau. Touche un objet déjà posé pour le reprendre.
      </p>
      <ItemBank items={BANK} placement={placement} onDragRelease={handleRelease} onDraggingChange={setDragging} disabled={solved} />
      <Balance
        left={left}
        right={right}
        unit="g"
        dragging={dragging}
        leftZoneRef={leftZoneRef}
        rightZoneRef={rightZoneRef}
        onItemTap={solved ? undefined : takeBack}
        ariaLabel="Balance à deux plateaux"
      />
      {canValidate && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">D’après la balance, que peux-tu dire ?</p>
          <ChoiceGrid options={VERDICT_OPTIONS} selected={pick} onSelect={(i) => { setChecked(false); setPick(i); }} revealed={checked} correctIndex={correctIndex} cols={1} disabled={solved} />
          {!solved && (
            <div className="text-center">
              <ValidateButton onClick={() => { setChecked(true); if (pick === correctIndex) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
            </div>
          )}
          {checked && (
            <Feedback tone={isRight ? 'ok' : 'ko'}>
              {isRight ? 'Exactement : la balance penche du côté le plus lourd.' : 'Regarde bien de quel côté le plateau descend — c’est le côté le plus lourd.'}
              {!isRight && (
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

// Aucune unité n'a encore été enseignée à ce stade de la leçon : le
// classement se fait uniquement à partir de l'intuition du poids, sans
// vocabulaire (voir la règle « aucun prérequis caché »). Les masses réelles
// (en g) ne servent qu'à vérifier l'ordre en interne — elles ne sont
// jamais affichées à l'élève.
const RANK_ITEMS = BANK.map((it) => ({ id: it.id, value: it.mass, text: `${it.emoji} ${it.label}` }));

export default function Module01Mission() {
  const navLinks = getNavLinks(1);
  const [balanceDone, setBalanceDone] = useState(false);
  const [rankDone, setRankDone] = useState(false);
  const allDone = balanceDone && rankDone;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Mission : le sac mystère"
      moduleSubtitle="Un crayon, une pomme, un cartable, un vélo : lequel est le plus lourd ?"
      moduleNumber={1}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 01" title="Avant toute définition, regarde et compare.">
          <p>Une masse décrit la quantité de matière d’un objet. Découvre-le en comparant, pas en apprenant une règle.</p>
        </MissionBrief>

        <StepCard num={1} title="La balance ne ment pas" done={balanceDone}>
          <BalanceDiscovery solved={balanceDone} onSolved={() => setBalanceDone(true)} />
        </StepCard>

        <StepCard num={2} title="Classe-les tous" done={rankDone} locked={!balanceDone}>
          <OrderingGame
            items={RANK_ITEMS}
            direction="asc"
            instruction="Range maintenant les quatre objets, du plus léger au plus lourd — à l’œil, comme tu viens de le faire avec la balance."
            solved={rankDone}
            onSolved={() => setRankDone(true)}
          />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Scale className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Tu sais déjà comparer des masses. Prochaine étape : apprendre à les mesurer et à les exprimer avec des
              unités précises.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
