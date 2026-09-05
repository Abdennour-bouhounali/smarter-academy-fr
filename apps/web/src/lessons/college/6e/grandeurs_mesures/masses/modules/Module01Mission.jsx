import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Balance from '../components/Balance';
import ItemBank from '../components/ItemBank';
import OrderingGame from '../../../../../common/components/OrderingGame';

/**
 * Module 1 — déclencheur, reconstruit sur le lesson kit.
 *
 * La balance à deux plateaux reste une manipulation maison : poser un objet
 * est un geste, pas un choix parmi des réponses. Elle ne peut pas produire
 * d'« état faux » — on pose, la balance penche, on observe. Le verdict, lui,
 * passe par TapQuestion : correction toujours révélée, jamais de
 * « Réessayer » qui efface la réponse (contrairement à la version pré-kit).
 */

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

function BalanceDiscovery({ solved, onAnswered }) {
  const [placement, setPlacement] = useState({});
  const [dragging, setDragging] = useState(false);
  const leftZoneRef = useRef(null);
  const rightZoneRef = useRef(null);

  const place = (id, zone) => {
    if (solved || !zone) return;
    setPlacement((p) => ({ ...p, [id]: zone }));
  };

  const handleRelease = (id, x, y) => place(id, zoneAt(x, y, leftZoneRef, rightZoneRef));

  const takeBack = (id) => {
    if (solved) return;
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
  const canAnswer = left.length > 0 && right.length > 0;
  const correctIndex = totalLeft === totalRight ? 2 : totalLeft > totalRight ? 0 : 1;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Pose des objets sur les deux plateaux. Touche un objet déjà posé pour le reprendre.
      </p>
      <ItemBank
        items={BANK}
        placement={placement}
        onDragRelease={handleRelease}
        onDraggingChange={setDragging}
        onPlace={place}
        disabled={solved}
      />
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
      {canAnswer && (
        <TapQuestion
          prompt="D’après la balance, que peux-tu dire ?"
          options={VERDICT_OPTIONS}
          correct={correctIndex}
          cols={1}
          explain="La balance penche toujours du côté le plus lourd : le plateau qui descend porte la plus grande masse."
          solved={solved}
          onAnswered={onAnswered}
        />
      )}
      {!canAnswer && (
        <p className="text-center text-xs text-slate-400 italic">
          Pose au moins un objet de chaque côté pour comparer.
        </p>
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
  const [balanceDone, setBalanceDone] = useState(false);
  const [rankDone, setRankDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Mission : le sac mystère"
      moduleSubtitle="Un crayon, une pomme, un cartable, un vélo : lequel est le plus lourd ?"
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Avant toute définition, regarde et compare.',
        body: <p>Une masse décrit la quantité de matière d’un objet. Découvre-le en comparant, pas en apprenant une règle.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'La balance ne ment pas',
          done: balanceDone,
          content: <BalanceDiscovery solved={balanceDone} onAnswered={() => setBalanceDone(true)} />,
        },
        {
          num: 2,
          title: 'Classe-les tous',
          done: rankDone,
          content: (kit) => (
            <OrderingGame
              items={RANK_ITEMS}
              direction="asc"
              instruction="Range maintenant les quatre objets, du plus léger au plus lourd — à l’œil, comme tu viens de le faire avec la balance."
              solved={rankDone}
              formative
              onError={() => kit.react(false)}
              onSolved={() => setRankDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Scale className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Tu sais déjà comparer des masses. Prochaine étape : apprendre à les mesurer et à les exprimer avec des
            unités précises.
          </p>
        </motion.div>
      }
    />
  );
}
