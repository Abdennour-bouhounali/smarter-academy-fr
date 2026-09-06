import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AngleFigure from '../components/AngleFigure';
import { formatDeg } from '../components/angleUtils';


/**
 * Module 1 — déclencheur : l'angle est une OUVERTURE.
 *
 * L'élève ouvre la porte à la main : les côtés ne s'allongent pas, c'est
 * l'écartement qui grandit. Puis le piège maître de toute la leçon — deux
 * angles de 40°, l'un aux côtés courts, l'autre aux côtés très longs.
 */
const START_DEG = 20;
const TARGET_DEG = 90;

const RAYONS_Q = {
  q: 'Ces deux angles ont exactement la même ouverture (40°), mais les côtés du second sont bien plus longs. Lequel est le PLUS GRAND ?',
  options: [
    'Celui de gauche (côtés courts)',
    'Celui de droite (côtés longs)',
    'Ils sont égaux : la longueur des côtés ne change rien',
  ],
  correct: 2,
  explain:
    'Un angle mesure une OUVERTURE, pas une longueur. Prolonger ses côtés ne l’ouvre pas davantage : les deux angles mesurent 40°. C’est LE piège le plus fréquent des angles.',
};

const NOTATION_Q = {
  q: 'On note un angle avec trois lettres, par exemple ÂBC (ou l’angle ABC). Que représente la lettre du MILIEU ?',
  options: ['Le sommet de l’angle', 'Le côté le plus long', 'La mesure de l’angle'],
  correct: 0,
  explain: 'La lettre du milieu est toujours le SOMMET — le point d’où partent les deux demi-droites. Les deux autres lettres nomment un point sur chaque côté.',
};

function PorteOuvrante({ react, solved, onSolved }) {
  const [deg, setDeg] = useState(solved ? TARGET_DEG : START_DEG);
  const [maxSeen, setMaxSeen] = useState(solved ? TARGET_DEG : START_DEG);
  const done = solved || maxSeen >= TARGET_DEG;

  const handleChange = (d) => {
    if (done) return;
    setDeg(d);
    if (d > maxSeen) {
      setMaxSeen(d);
      if (d >= TARGET_DEG) {
        react(true);
        onSolved?.();
      }
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Voici une porte vue du dessus, fermée à {formatDeg(START_DEG)}. Fais glisser le battant (ou utilise les
        boutons ±10°) pour l'ouvrir en grand — au moins jusqu'à l'angle droit.
      </p>
      <AngleFigure
        deg={done ? Math.max(deg, TARGET_DEG) : deg}
        rotation={0}
        rayLengths={[95, 95]}
        arcLabel={formatDeg(done ? Math.max(deg, TARGET_DEG) : deg)}
        interactive={!done}
        onChange={handleChange}
        disabled={done}
        tone="sky"
        ariaLabel="Porte vue du dessus, à ouvrir"
      />
      {done && (
        <Feedback tone="ok">
          En ouvrant la porte, le battant n'est pas devenu plus LONG : c'est l'<strong>écartement</strong> entre le
          mur et le battant qui a grandi. Cette ouverture entre deux demi-droites partant d'un même point (le{' '}
          <strong>sommet</strong>) s'appelle un <strong>angle</strong>.
        </Feedback>
      )}
    </div>
  );
}

export default function Module01Ouverture() {
  const [porteDone, setPorteDone] = useState(false);
  const [rayonsDone, setRayonsDone] = useState(false);
  const [notationDone, setNotationDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La porte, la pizza et le skate"
      moduleSubtitle="Ouvre la porte : ce qui grandit, ce n’est pas la longueur."
      estimatedTime="7 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Qu’est-ce qui grandit exactement quand une porte s’ouvre ?',
        body: <p>Le battant garde la même taille, et pourtant « ça s'ouvre ». C'est cette grandeur-là qu'on va apprendre à mesurer.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Ouvre la porte',
          done: porteDone,
          content: (kit) => (
            <div className="space-y-5">
              <PorteOuvrante react={kit.react} solved={porteDone} onSolved={() => setPorteDone(true)} />
              {/* Le battant vient d'être ouvert sans jamais s'allonger :
                  c'est ICI que le mot « angle » a un sens, pas dans un
                  explain (docs/architecture/KNOWLEDGE_DEPENDENCY.md). */}
              {porteDone && (
                <KnowledgeBrick
                  id="angle-ouverture"
                  variant="new"
                  lead="Ce qui a grandi pendant que tu ouvrais la porte porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le piège des côtés longs',
          done: rayonsDone,
          content: (
            <div className="space-y-5">
            <TapQuestion
              above={
                <div className="grid grid-cols-2 gap-4" aria-hidden="true">
                  <div className="space-y-1">
                    <AngleFigure deg={40} rayLengths={[50, 50]} arcLabel="40°" tone="sky" size={180} />
                    <p className="text-center text-xs text-slate-500">Côtés courts</p>
                  </div>
                  <div className="space-y-1">
                    <AngleFigure deg={40} rayLengths={[100, 100]} arcLabel="40°" tone="violet" size={180} />
                    <p className="text-center text-xs text-slate-500">Côtés longs</p>
                  </div>
                </div>
              }
              prompt={RAYONS_Q.q}
              options={RAYONS_Q.options}
              correct={RAYONS_Q.correct}
              cols={1}
              explain={RAYONS_Q.explain}
              requires={['angle-ouverture']}
              solved={rayonsDone}
              onAnswered={() => setRayonsDone(true)}
            />
            {/* La comparaison vient d'être tranchée sur deux figures
                concrètes : la règle se pose sur ce constat. */}
            {rayonsDone && (
              <KnowledgeBrick
                id="longueur-cotes-sans-effet"
                variant="new"
                lead="Ce que tu viens de constater sur ces deux figures vaut pour tous les angles."
              />
            )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Comment on écrit un angle',
          done: notationDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                above={<AngleFigure deg={55} rayLengths={[90, 90]} labels={['A', 'B', 'C']} tone="emerald" />}
                prompt={NOTATION_Q.q}
                options={NOTATION_Q.options}
                correct={NOTATION_Q.correct}
                cols={1}
                explain={NOTATION_Q.explain}
                requires={['angle-ouverture', 'demi-droite']}
                solved={notationDone}
                onAnswered={() => setNotationDone(true)}
              />
              {/* La lettre du milieu vient d'être identifiée sur la figure :
                  la convention d'écriture peut être fixée. */}
              {notationDone && (
                <KnowledgeBrick
                  id="notation-angle"
                  variant="new"
                  lead="Tu as repéré le sommet dans ÂBC. Voilà la convention complète."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais ce qu'est un angle. Reste à comparer deux angles
          dessinés dans tous les sens — et à leur donner un nom.
        </KnowledgeSnapshot>
      }
    />
  );
}
