import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Ruler from '../components/Ruler';

/**
 * Module 2 — découverte, reconstruit sur le lesson kit.
 *
 * Le piège du zéro : un objet posé sur une règle ne commence pas toujours à
 * 0. RulerReadRound reste une manipulation maison — taper une graduation
 * est un geste de mesure, pas un choix parmi des réponses — mais elle
 * révèle toujours la lecture correcte, jamais de blocage sur une lecture
 * fausse (kit.react/onSolved inconditionnels une fois la vérification
 * faite, à l'image de RoundPicker dans la leçon Ordre de grandeur).
 */
const PIEGE = { min: 0, max: 15, object: { start: 3, end: 9, label: '✏️', color: '#f97316' } };
const PIEGE_Q = {
  q: 'Un élève regarde seulement où se termine le crayon et annonce : « il mesure 9 cm ». A-t-il raison ?',
  options: [
    'Oui : le crayon se termine à la graduation 9, donc il mesure 9 cm',
    "Non : le crayon ne commence pas à 0, il faut regarder où il commence ET où il se termine",
  ],
  correct: 1,
  explain:
    "Le crayon commence à la graduation 3 et se termine à la graduation 9. Sa longueur, c'est la distance entre les deux bords : 9 − 3 = 6 cm, pas 9 cm.",
};

const ROUNDS = [
  { min: 0, max: 15, object: { start: 3, end: 9, label: '✏️', color: '#f97316' } },
  { min: 0, max: 15, object: { start: 5, end: 13, label: '🖌️', color: '#0ea5e9' } },
  { min: 0, max: 15, object: { start: 2, end: 14, label: '🔑', color: '#8b5cf6' } },
];

function RulerReadRound({ round, index, react, solved, onSolved }) {
  const [phase, setPhase] = useState(solved ? 'done' : 'start'); // 'start' | 'end' | 'done'
  const [startVal, setStartVal] = useState(solved ? round.object.start : null);
  const [endVal, setEndVal] = useState(solved ? round.object.end : null);

  const trueStart = round.object.start;
  const trueEnd = round.object.end;
  const readCorrect = solved || (startVal === trueStart && endVal === trueEnd);

  const handleTick = (v) => {
    if (solved) return;
    if (phase === 'start') {
      setStartVal(v);
      setPhase('end');
    } else if (phase === 'end') {
      setEndVal(v);
      setPhase('done');
      react(v === trueEnd && startVal === trueStart);
      onSolved?.();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-mono text-slate-500 uppercase tracking-wide">
        {phase === 'start' && 'Étape 1 · Tape la graduation où l’objet COMMENCE'}
        {phase === 'end' && 'Étape 2 · Tape la graduation où l’objet SE TERMINE'}
        {phase === 'done' && 'Lecture terminée'}
      </p>
      <Ruler
        min={round.min}
        max={round.max}
        labelEvery={1}
        object={round.object}
        mode={phase === 'done' ? 'display' : 'read'}
        selectedValues={[startVal, endVal].filter((v) => v !== null)}
        onTickClick={handleTick}
        disabled={phase === 'done'}
        ariaLabel={`Règle, mesure ${index + 1}`}
      />
      {phase === 'done' && (
        <Feedback tone={readCorrect ? 'ok' : 'ko'}>
          {readCorrect ? (
            <>Bien lu : {trueStart} cm → {trueEnd} cm, donc une longueur de <strong>{trueEnd - trueStart} cm</strong>.</>
          ) : (
            <>
              La bonne lecture est {trueStart} cm → {trueEnd} cm, soit <strong>{trueEnd - trueStart} cm</strong>.
              Regarde bien où le trait pointillé gauche touche la règle (le début), puis où le trait pointillé
              droit la touche (la fin).
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

/**
 * DragThenReadRound — variante de RulerReadRound pour la toute première
 * manche : l'élève doit d'abord GLISSER l'objet (senti physiquement : il
 * ne part pas de zéro) avant d'enchaîner sur la lecture tap-based
 * habituelle. Le geste de glisser ne « valide » rien en lui-même — c'est
 * la découverte du piège, pas un test — la lecture reste le seul geste
 * noté, exactement comme dans RulerReadRound.
 */
function DragThenReadRound({ round, index, react, solved, onSolved }) {
  const [dragPhase, setDragPhase] = useState(solved ? 'settled' : 'dragging'); // 'dragging' | 'settled'
  const [objectPos, setObjectPos] = useState(round.object);

  if (dragPhase === 'dragging') {
    return (
      <div className="space-y-3">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-wide">
          Étape 0 · Fais glisser l'objet le long de la règle
        </p>
        <Ruler
          min={round.min}
          max={round.max}
          labelEvery={1}
          object={objectPos}
          mode="place-object"
          objectDraggable
          onObjectChange={setObjectPos}
          readStep={1}
          ariaLabel={`Règle, objet à déplacer, mesure ${index + 1}`}
        />
        <p className="text-sm text-slate-600 text-center">
          Remarque : l'objet ne se place pas forcément à 0. Quand tu es prêt·e, valide sa position.
        </p>
        <div className="text-center">
          <button
            type="button"
            onClick={() => setDragPhase('settled')}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700"
          >
            Valider la position
          </button>
        </div>
      </div>
    );
  }

  return (
    <RulerReadRound
      round={{ ...round, object: objectPos }}
      index={index}
      react={react}
      solved={solved}
      onSolved={onSolved}
    />
  );
}

export default function Module02MesurerComparer() {
  const [constatDone, setConstatDone] = useState(false);
  const [roundsDone, setRoundsDone] = useState([]);

  const allRoundsDone = roundsDone.length === ROUNDS.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Mesurer et comparer"
      moduleSubtitle="La règle ne commence pas toujours où l’objet commence : attention au piège du zéro."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Un crayon posé sur une règle graduée.',
        body: <p>Regarde bien où il commence, pas seulement où il se termine.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Le piège du zéro',
          done: constatDone,
          content: (
            <TapQuestion
              above={<Ruler {...PIEGE} mode="display" ariaLabel="Règle avec un crayon qui ne commence pas à zéro" />}
              prompt={PIEGE_Q.q}
              options={PIEGE_Q.options}
              correct={PIEGE_Q.correct}
              cols={1}
              explain={PIEGE_Q.explain}
              solved={constatDone}
              onAnswered={() => setConstatDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'À toi de mesurer',
          subtitle: 'Longueur = position de fin − position de début',
          done: allRoundsDone,
          content: (kit) => (
            <div className="space-y-8">
              {ROUNDS.map((round, i) => {
                if (i !== 0 && !roundsDone.includes(i - 1)) return null;
                const RoundComponent = i === 0 ? DragThenReadRound : RulerReadRound;
                return (
                  <RoundComponent
                    key={i}
                    round={round}
                    index={i}
                    react={kit.react}
                    solved={roundsDone.includes(i)}
                    onSolved={() => setRoundsDone((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                );
              })}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <AlertTriangle className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Retiens ce réflexe : sur une règle, une longueur se lit toujours comme une DIFFÉRENCE entre deux
            positions, pas comme un seul nombre.
          </p>
        </motion.div>
      }
    />
  );
}
