import React, { useState, useRef } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Balance from '../components/Balance';
import ItemBank from '../components/ItemBank';
import Gauge from '../components/Gauge';
import { formatMass } from '../components/massUtils';

/**
 * Module 3 — manipulation, reconstruit sur le lesson kit.
 *
 * Deux gestes, aucun QCM : on répartit des poids jusqu'à l'équilibre, puis
 * on LIT le cadran en tapant directement la graduation atteinte. Lire une
 * masse est un geste de mesure — le faire choisir dans une liste de trois
 * réponses (version pré-kit) transformait la lecture en devinette.
 */
const WEIGHTS = [
  { id: 'w1', emoji: '⚫', label: '100 g', mass: 100 },
  { id: 'w2', emoji: '⚫', label: '100 g', mass: 100 },
  { id: 'w3', emoji: '⚫', label: '100 g', mass: 100 },
  { id: 'w300', emoji: '⬛', label: '300 g', mass: 300 },
];

/** Le seul arrangement à l'équilibre : 3 × 100 g face à 300 g. */
const SOLUTION = { w1: 'left', w2: 'left', w3: 'left', w300: 'right' };

/** Zone (gauche/droite/aucune) dont le rectangle contient le point (x, y). */
function zoneAt(x, y, leftZoneRef, rightZoneRef) {
  const l = leftZoneRef.current?.getBoundingClientRect();
  if (l && x >= l.left && x <= l.right && y >= l.top && y <= l.bottom) return 'left';
  const r = rightZoneRef.current?.getBoundingClientRect();
  if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return 'right';
  return null;
}

function EquivalenceBalance({ react, solved, onSolved }) {
  const [placement, setPlacement] = useState(solved ? SOLUTION : {});
  const [dragging, setDragging] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const leftZoneRef = useRef(null);
  const rightZoneRef = useRef(null);
  const left = WEIGHTS.filter((it) => placement[it.id] === 'left');
  const right = WEIGHTS.filter((it) => placement[it.id] === 'right');
  const totalLeft = left.reduce((s, it) => s + it.mass, 0);
  const totalRight = right.reduce((s, it) => s + it.mass, 0);
  const allPlaced = WEIGHTS.every((it) => placement[it.id]);
  const equal = allPlaced && totalLeft === totalRight && totalLeft > 0;
  const done = solved || equal || revealed;

  const place = (id, zone) => {
    if (done || !zone) return;
    setPlacement((p) => ({ ...p, [id]: zone }));
  };
  const handleRelease = (id, x, y) => place(id, zoneAt(x, y, leftZoneRef, rightZoneRef));

  const takeBack = (id) => {
    if (done) return;
    setPlacement((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  };

  // L'équilibre atteint valide l'étape. Tant qu'il ne l'est pas, l'élève
  // continue de manipuler librement : rien ne se fige sur un arrangement
  // déséquilibré, et aucun message ne prétend le contraire.
  React.useEffect(() => {
    if (equal && !solved) {
      react?.(true);
      onSolved?.();
    }
  }, [equal, solved, react, onSolved]);

  /** Sortie de secours : montrer la solution sans jamais bloquer la suite. */
  const showSolution = () => {
    setPlacement(SOLUTION);
    setRevealed(true);
    react?.(false);
    onSolved?.();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Répartis les quatre poids sur les deux plateaux pour trouver un arrangement à l’équilibre.
      </p>
      <ItemBank
        items={WEIGHTS}
        placement={placement}
        onDragRelease={handleRelease}
        onDraggingChange={setDragging}
        onPlace={place}
        disabled={done}
      />
      <Balance
        left={left}
        right={right}
        unit="g"
        showValues={allPlaced || done}
        dragging={dragging}
        leftZoneRef={leftZoneRef}
        rightZoneRef={rightZoneRef}
        onItemTap={done ? undefined : takeBack}
        ariaLabel="Balance avec des poids de 100 g et 300 g"
      />

      {/* Déséquilibre : on nomme ce qu'on voit, on chiffre l'écart, et on
          laisse l'élève reprendre un poids. Aucun blocage, aucun message
          d'échec — la balance penchée EST l'information utile. */}
      {allPlaced && !equal && !done && (
        <Feedback tone="hint">
          Les plateaux ne s’équilibrent pas : {formatMass(totalLeft, 'g')} à gauche contre{' '}
          {formatMass(totalRight, 'g')} à droite, soit {formatMass(Math.abs(totalLeft - totalRight), 'g')} d’écart.
          Touche un poids posé pour le reprendre, puis essaie une autre répartition.
        </Feedback>
      )}

      {!allPlaced && !done && (
        <p className="text-center text-xs text-slate-400 italic">
          Il reste {WEIGHTS.length - Object.keys(placement).length} poids à poser.
        </p>
      )}

      {!done && allPlaced && (
        <div className="text-center">
          <button
            type="button"
            onClick={showSolution}
            className="text-xs text-slate-500 underline hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Je ne trouve pas — montre-moi l’équilibre
          </button>
        </div>
      )}

      {done && (
        <Feedback tone={revealed && !equal ? 'info' : 'ok'}>
          100 g + 100 g + 100 g = <strong>300 g</strong> : trois poids de 100 g pèsent exactement comme un seul poids
          de 300 g. La balance s’équilibre.
        </Feedback>
      )}
    </div>
  );
}

const GAUGE_ROUNDS = [
  { id: 'g1', value: 500, max: 1000, step: 100, labelEvery: 2 },
  { id: 'g2', value: 1000, max: 2000, step: 200, labelEvery: 1 },
  { id: 'g3', value: 1250, max: 2000, step: 250, labelEvery: 1 },
];

/**
 * GaugeReadRound — l'élève tape la graduation atteinte par le remplissage.
 * Le geste est la lecture ; la correction se révèle toujours, juste ou
 * fausse, sans jamais bloquer ni proposer de « Réessayer ».
 */
function GaugeReadRound({ round, index, react, solved, onSolved }) {
  const [picked, setPicked] = useState(solved ? round.value : null);
  const done = solved || picked !== null;
  const isRight = picked === round.value;

  const handleTick = (v) => {
    if (done) return;
    setPicked(v);
    react?.(v === round.value);
    onSolved?.();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-mono text-slate-500 uppercase tracking-wide">
        {done ? `Lecture ${index + 1} terminée` : `Lecture ${index + 1} · Tape la graduation atteinte par la barre`}
      </p>
      <Gauge
        min={0}
        max={round.max}
        value={round.value}
        step={round.step}
        labelEvery={round.labelEvery}
        unit="g"
        revealValue={done}
        mode={done ? 'display' : 'read'}
        selectedValue={picked}
        onTickClick={handleTick}
        disabled={done}
        ariaLabel="Balance à affichage numérique"
      />
      {done && (
        <Feedback tone={isRight ? 'ok' : 'ko'}>
          {isRight ? (
            <>Bien lu : la balance affiche <strong>{formatMass(round.value, 'g')}</strong>.</>
          ) : (
            <>
              Tu as lu {formatMass(picked, 'g')}, mais la barre s’arrête à <strong>{formatMass(round.value, 'g')}</strong>.
              Repère jusqu’où va le remplissage, puis lis la graduation juste en dessous.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

export default function Module03ComparerMesurer() {
  const [equivDone, setEquivDone] = useState(false);
  const [gaugeDone, setGaugeDone] = useState([]);
  const allGaugesDone = gaugeDone.length === GAUGE_ROUNDS.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Comparer et mesurer"
      moduleSubtitle="La balance à deux plateaux, puis la balance à affichage."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Deux balances, deux façons de connaître une masse.',
        body: <p>D’abord comparer sans chiffres, ensuite lire une mesure précise sur un cadran.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Trouve l’équilibre',
          done: equivDone,
          content: (kit) => (
            <div className="space-y-5">
              <EquivalenceBalance react={kit.react} solved={equivDone} onSolved={() => setEquivDone(true)} />
              {/* La balance vient de se remettre à l'horizontale : c'est
                  l'instant où « équilibre » veut dire « même total ». */}
              {equivDone && (
                <KnowledgeBrick
                  id="equilibre-egalite"
                  variant="new"
                  lead="Trois poids d'un côté, un seul de l'autre, et pourtant la balance ne penche plus."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Lis le cadran',
          subtitle: 'Trois pesées à lire, une par une.',
          done: allGaugesDone,
          content: (kit) => (
            <div className="space-y-8">
              {/* La méthode de lecture est posée AVANT la première pesée : le
                  mot « graduation » et le geste arrivent ensemble
                  (docs/architecture/KNOWLEDGE_DEPENDENCY.md). */}
              <KnowledgeBrick
                id="lire-graduation"
                establishes={['lire-graduation', 'echelle-axe']}
                variant="new"
                lead="Cette balance-ci ne penche pas : elle affiche. Voici comment on lit son cadran."
              />
              {GAUGE_ROUNDS.map((round, i) =>
                i === 0 || gaugeDone.includes(i - 1) ? (
                  <GaugeReadRound
                    key={round.id}
                    round={round}
                    index={i}
                    react={kit.react}
                    solved={gaugeDone.includes(i)}
                    onSolved={() => setGaugeDone((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                ) : null
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Tu sais lire une masse en grammes. Reste à comprendre d'où
          vient le 1 000 des conversions : au module suivant, tu le fabriques toi-même.
        </KnowledgeSnapshot>
      }
    />
  );
}
