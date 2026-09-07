import React, { useState, useRef } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
  // L'arrangement SUR LEQUEL le verdict a été rendu. La balance reste
  // manipulable après la réponse (règle du 2026-09-06), mais la question,
  // elle, a été posée sur une pesée précise : on la fige au moment où
  // l'élève répond, sinon un déplacement ultérieur changerait après coup la
  // bonne réponse d'une question DÉJÀ corrigée.
  const [verdictOn, setVerdictOn] = useState(null);
  const leftZoneRef = useRef(null);
  const rightZoneRef = useRef(null);

  // Poser et reprendre restent TOUJOURS possibles, même après que l'élève a
  // répondu au verdict (règle projet du 2026-09-06). Le module 1 est un
  // laboratoire : c'est en essayant crayon contre vélo, puis pomme contre
  // cartable, que « plus lourd » prend un sens — une seule pesée ne suffit pas.
  const place = (id, zone) => {
    if (!zone) return;
    setPlacement((p) => ({ ...p, [id]: zone }));
  };

  const handleRelease = (id, x, y) => place(id, zoneAt(x, y, leftZoneRef, rightZoneRef));

  const takeBack = (id) => {
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
  const verdictFor = (l, r) => (l === r ? 2 : l > r ? 0 : 1);
  // Tant que rien n'est répondu, la question suit la balance en direct ; une
  // fois répondue, elle reste attachée à la pesée qui l'a produite.
  const correctIndex = verdictOn
    ? verdictFor(verdictOn.left, verdictOn.right)
    : verdictFor(totalLeft, totalRight);

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
      />
      <Balance
        left={left}
        right={right}
        unit="g"
        dragging={dragging}
        leftZoneRef={leftZoneRef}
        rightZoneRef={rightZoneRef}
        onItemTap={takeBack}
        ariaLabel="Balance à deux plateaux"
      />
      {canAnswer && (
        <TapQuestion
          requires={[]}
          prompt="D’après la balance, que peux-tu dire ?"
          options={VERDICT_OPTIONS}
          correct={correctIndex}
          cols={1}
          explain="La balance penche toujours du côté le plus lourd : le plateau qui descend porte la plus grande masse."
          solved={solved}
          onAnswered={() => {
            if (!verdictOn) setVerdictOn({ left: totalLeft, right: totalRight });
            onAnswered();
          }}
        />
      )}
      {!canAnswer && (
        <p className="text-center text-xs text-slate-400 italic">
          Pose au moins un objet de chaque côté pour comparer.
        </p>
      )}
      {solved && (
        <p className="text-center text-xs text-slate-500">
          Continue à peser : reprends un objet et essaie une autre paire.
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
        body: <p>Quatre objets, aucune étiquette, aucun chiffre. Comment savoir lequel est le plus lourd ? Pose-les sur la balance et regarde ce qui se passe.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'La balance ne ment pas',
          done: balanceDone,
          content: (
            <div className="space-y-5">
              <BalanceDiscovery solved={balanceDone} onAnswered={() => setBalanceDone(true)} />
              {/* La balance vient de pencher sous les yeux de l'élève : c'est
                  ici, et pas dans le brief, que « masse » et « lire la
                  balance » ont un sens. Ces deux briques servent de socle au
                  classement de l'étape 2 et au test final. */}
              {balanceDone && (
                <KnowledgeBrick
                  id="masse-comparable"
                  variant="new"
                  lead="Ce que la balance vient de comparer, sans afficher le moindre nombre, porte un nom."
                />
              )}
              {balanceDone && (
                <KnowledgeBrick
                  id="balance-plateaux"
                  variant="new"
                  lead="Et voilà comment se lit l'instrument que tu viens d'utiliser."
                />
              )}
            </div>
          ),
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
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais comparer sans chiffres. Reste à mettre des nombres
          dessus — et à découvrir qu'une seule unité ne peut pas tout peser.
        </KnowledgeSnapshot>
      }
    />
  );
}
