import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Protractor from '../components/Protractor';
import { classLabel, formatDeg } from '../components/angleUtils';

/**
 * Module 4 — manipulation : LE piège des deux graduations.
 *
 * Ce module EST le piège. L'élève lit un angle dont la graduation porte
 * deux nombres (50 et 130) ; quel que soit son choix, la correction
 * explique pourquoi une seule est bonne — puis lui donne le réflexe qui
 * tranche à tous les coups : CLASSER d'abord (aigu → < 90°).
 *
 * La dernière manche pose le zéro à GAUCHE : ce n'est pas l'habitude qui
 * décide, c'est le côté de l'angle.
 */
const TRAP = 50;

const REFLEXE_Q = {
  q: 'Avant même de lire le rapporteur : cet angle est-il aigu ou obtus ? Et donc, sa mesure est-elle plus petite ou plus grande que 90° ?',
  options: [
    'Aigu → sa mesure est plus PETITE que 90°',
    'Obtus → sa mesure est plus GRANDE que 90°',
  ],
  correct: 0,
  explain:
    'L’angle est visiblement plus fermé que l’équerre : il est AIGU, donc sa mesure est inférieure à 90°. Entre 50 et 130, seule 50 peut convenir. Ce réflexe élimine la mauvaise graduation à tous les coups.',
};

function TrapRound({ react, angle, zeroSide, index, intro, solved, onSolved }) {
  const [picked, setPicked] = useState(solved ? angle : null);
  const done = solved || picked !== null;
  const isRight = picked === angle;

  const handleRead = (value) => {
    if (done) return;
    setPicked(value);
    react(value === angle);
    onSolved?.();
  };

  return (
    <div className="space-y-3">
      {intro && <p className="text-sm text-slate-600">{intro}</p>}
      <Protractor
        angleDeg={angle}
        mode="read"
        zeroSide={zeroSide}
        onReadTick={handleRead}
        selectedValue={picked}
        disabled={done}
        ariaLabel={`Angle à mesurer, zéro placé à ${zeroSide === 'right' ? 'droite' : 'gauche'}`}
      />
      {done && (
        <Feedback tone={isRight ? 'ok' : 'ko'}>
          {isRight ? (
            <>
              Exact : <strong>{formatDeg(angle)}</strong>. Tu as suivi la graduation qui part du{' '}
              <strong>zéro posé sur le côté</strong> — et l'angle est bien {classLabel(angle)}.
            </>
          ) : (
            <>
              Tu as lu {formatDeg(picked)} : c'est l'AUTRE graduation. Il faut suivre celle qui part du{' '}
              <strong>zéro posé sur le côté de l'angle</strong> — ici la mesure est{' '}
              <strong>{formatDeg(angle)}</strong>. Vérification : l'angle est {classLabel(angle)}, donc{' '}
              {angle < 90 ? 'sa mesure doit être inférieure' : 'supérieure'} à 90° ✓.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

export default function Module04BonneGraduation() {
  const [trapDone, setTrapDone] = useState(false);
  const [reflexeDone, setReflexeDone] = useState(false);
  const [ex1Done, setEx1Done] = useState(false);
  const [ex2Done, setEx2Done] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le piège des deux graduations"
      moduleSubtitle="50 ou 130 ? Un réflexe simple élimine la mauvaise à tous les coups."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Chaque graduation du rapporteur porte DEUX nombres.',
        body: <p>C'est l'erreur la plus fréquente de toute la géométrie de 6e. Aujourd'hui, on la démonte pour de bon.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Le piège en direct',
          done: trapDone,
          content: (kit) => (
            <TrapRound
              react={kit.react}
              angle={TRAP}
              zeroSide="right"
              index={1}
              intro="Le second côté sort sur une graduation qui affiche 50 ET 130. Tape-la, puis choisis le nombre que tu penses être le bon."
              solved={trapDone}
              onSolved={() => setTrapDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Le réflexe qui sauve',
          done: reflexeDone,
          content: (
            <TapQuestion
              prompt={REFLEXE_Q.q}
              options={REFLEXE_Q.options}
              correct={REFLEXE_Q.correct}
              cols={1}
              explain={REFLEXE_Q.explain}
              solved={reflexeDone}
              onAnswered={() => setReflexeDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'À toi de jouer',
          done: ex1Done && ex2Done,
          content: (kit) => (
            <div className="space-y-8">
              <TrapRound
                react={kit.react}
                angle={130}
                zeroSide="right"
                index={2}
                intro="Celui-ci est OBTUS. Classe d'abord dans ta tête, puis lis."
                solved={ex1Done}
                onSolved={() => setEx1Done(true)}
              />
              {ex1Done && (
                <div className="border-t border-slate-100 pt-6">
                  <TrapRound
                    react={kit.react}
                    angle={40}
                    zeroSide="left"
                    index={3}
                    intro="Attention : ici le zéro est posé à GAUCHE. Ce n'est pas l'habitude qui décide, c'est le côté de l'angle."
                    solved={ex2Done}
                    onSolved={() => setEx2Done(true)}
                  />
                </div>
              )}
              {ex1Done && ex2Done && (
                <Feedback tone="ok">
                  Le zéro peut être à droite OU à gauche : on suit toujours la graduation qui part du côté sur
                  lequel le zéro est posé — et on vérifie avec la classe de l'angle.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <AlertTriangle className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Deux graduations, une seule bonne : celle qui part du zéro posé sur le côté. En cas de doute, classe
            d'abord (aigu &lt; 90° &lt; obtus) — la mauvaise réponse s'élimine toute seule.
          </p>
        </motion.div>
      }
    />
  );
}
