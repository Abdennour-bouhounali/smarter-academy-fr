import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import AffineExplorer from '../../../../../common/components/AffineExplorer';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { image, formatAffine } from '../components/affineUtils';
import { formatDec } from '@smarter-academy/core';

/**
 * Module 3 — DÉCOUVERTE : « Le bouton b » (a verrouillé).
 *
 * Activity: régler la seule ordonnée à l'origine et regarder la droite
 *   glisser sans jamais changer d'inclinaison.
 * Mathematical objective: isoler le rôle de b, symétriquement au module 2.
 *   L'expérience est la même, la variable change — c'est la comparaison des
 *   deux qui installe la dissociation.
 * Student action: glisser ou avancer pas à pas le réglage de b.
 * Controlled variable: b seul ; a est figé à 1.
 * Mathematical state: { a: 1, b } — la droite et le point (0 ; b) en dérivent.
 * Visual consequence: toutes les positions de la droite sont PARALLÈLES ; le
 *   point orange monte et descend le long de l'axe des ordonnées.
 * Expected observation: « elles ont toutes la même inclinaison ».
 * Misconception targeted: « b déplace la droite vers la droite » — non, vers
 *   le haut ; et « changer b change aussi la pente ».
 * Feedback: le compteur de positions visitées quantifie ce qui reste.
 * Formalization: le nom « ordonnée à l'origine » est posé à l'étape 3, avec
 *   sa lecture : b est l'image de 0.
 * Scaffolding: prédiction → exploration (positif, nul, négatif) → lecture.
 * Transfer: le module 4 libère les deux réglages.
 */

const A_FIXED = 1;
const RANGE = { xMin: -5, xMax: 5, yMin: -7, yMax: 7 };

export default function Module03BoutonB() {
  const [b, setB] = useState(0);
  const [seen, setSeen] = useState(() => new Set(['0']));
  const [predicted, setPredicted] = useState(false);
  const [nameDone, setNameDone] = useState(false);
  const [parallelDone, setParallelDone] = useState(false);

  const kinds = new Set();
  for (const v of seen) {
    const n = Number(v);
    if (n > 0) kinds.add('pos');
    else if (n < 0) kinds.add('neg');
    else kinds.add('zero');
  }
  const LABELS = { pos: 'une valeur positive', zero: 'la valeur 0', neg: 'une valeur négative' };
  const missing = ['pos', 'zero', 'neg'].filter((k) => !kinds.has(k));
  const explored = missing.length === 0;

  const change = ({ b: next }, kit) => {
    if (next === b) return;
    setB(next);
    setSeen((prev) => new Set(prev).add(String(next)));
    kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le bouton b"
      moduleSubtitle="On bloque a. La droite garde son inclinaison et glisse."
      estimatedTime="7 min"
      brief={{
        tag: '🎚️ Mission 03',
        title: 'L’autre réglage',
        tone: 'indigo',
        body: (
          <p>
            Cette fois c’est <MathText>{'$a$'}</MathText> qui est bloqué sur 1. Fais varier{' '}
            <MathText>{'$b$'}</MathText> et compare avec ce que tu viens de voir.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Prédis avant de régler',
          done: predicted,
          content: (
            <TapQuestion
              prompt="Si tu augmentes b, que va faire la droite ?"
              options={[
                'Elle va monter tout entière, sans changer d’inclinaison',
                'Elle va s’incliner davantage',
                'Elle va se déplacer vers la droite',
                'Elle va pivoter autour de l’origine',
              ]}
              correct={0}
              cols={1}
              explain="b est la hauteur de départ : l’augmenter soulève la droite entière. L’inclinaison, elle, appartient à a — et a est bloqué."
              explainWrong="Souviens-toi du module précédent : c’est a qui inclinait. Ici a ne bouge pas."
              solved={predicted}
              onAnswered={() => setPredicted(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Monte, descends, passe par zéro',
          subtitle: 'Essaie une valeur positive, la valeur 0, et une valeur négative.',
          done: explored,
          content: (kit) => (
            <AffineExplorer
              a={A_FIXED}
              b={b}
              showB
              lockA
              onChange={(v) => change(v, kit)}
              aRange={{ min: -3, max: 3, step: 0.5 }}
              bRange={{ min: -4, max: 4, step: 1 }}
              range={RANGE}
              showIntercept
              caption={
                <Feedback tone={explored ? 'ok' : 'info'}>
                  {explored ? (
                    <>
                      Toutes ces droites sont <strong>parallèles</strong> : même inclinaison,
                      hauteurs différentes. Le point orange, lui, vaut toujours{' '}
                      <MathText>{'$b$'}</MathText>.
                    </>
                  ) : (
                    <>Il te reste à essayer <strong>{missing.map((k) => LABELS[k]).join(', ')}</strong>.</>
                  )}
                </Feedback>
              }
            />
          ),
        },
        {
          num: 3,
          title: 'Où lit-on b ?',
          done: nameDone,
          content: (
            <TapQuestion
              prompt={<>Sur le graphique, où lit-on directement <MathText>{'$b$'}</MathText> ?</>}
              options={[
                'Là où la droite coupe l’axe vertical — c’est f(0)',
                'Là où la droite coupe l’axe horizontal',
                'À l’endroit le plus haut de la droite',
                'On ne peut pas le lire, il faut calculer',
              ]}
              correct={0}
              cols={1}
              explain="En x = 0, le terme ax vaut 0 : il ne reste que b. Donc f(0) = b, et c’est l’endroit où la droite croise l’axe vertical. On l’appelle l’ordonnée à l’origine."
              explainWrong="Remplace x par 0 dans ax + b : il reste b. C’est donc sur l’axe vertical que ça se lit."
              solved={nameDone}
              onAnswered={() => setNameDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Deux droites parallèles',
          done: parallelDone,
          content: (
            <TapQuestion
              prompt={<>Les droites de <MathText>{'$f(x) = 2x + 1$'}</MathText> et <MathText>{'$g(x) = 2x - 3$'}</MathText> sont-elles parallèles ?</>}
              options={[
                'Oui : même coefficient a, donc même inclinaison',
                'Non : elles n’ont pas la même ordonnée à l’origine',
                'Non : elles se croisent forcément quelque part',
              ]}
              correct={0}
              cols={1}
              explain="Deux fonctions affines de même a sont parallèles, quels que soient leurs b. Le b différent les décale simplement l’une par rapport à l’autre — elles ne se rencontrent jamais."
              explainWrong="Le b ne change pas l’inclinaison, seulement la hauteur. Deux droites de même inclinaison sont parallèles."
              solved={parallelDone}
              onAnswered={() => setParallelDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>À retenir.</strong> <MathText>{'$a$'}</MathText> incline,{' '}
          <MathText>{'$b$'}</MathText> soulève. Ce sont deux commandes indépendantes :
          changer l’une ne touche jamais au travail de l’autre.
        </Feedback>
      }
    />
  );
}
