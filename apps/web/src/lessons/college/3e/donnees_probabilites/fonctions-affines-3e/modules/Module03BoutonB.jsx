import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import AffineExplorer from '../../../../../common/components/AffineExplorer';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { image, formatAffine } from '../components/affineUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

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
 * Formalization: le nom « ordonnée à l'origine » est posé à l'étape 2, par une
 *   <KnowledgeBrick> qui n'apparaît qu'une fois les trois hauteurs explorées.
 * Scaffolding: prédiction → exploration (positif, nul, négatif) → nom + essai
 *   immédiat → lecture graphique → parallélisme.
 * Transfer: le module 4 libère les deux réglages.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   « Ordonnée à l'origine » arrivait dans un `explain` de l'étape 3 — donc
 *   APRÈS la réponse — puis servait de DISTRACTEUR à l'étape 4 : le mot était
 *   demandé avant d'avoir jamais été posé. Désormais :
 *     étape 2  faire glisser la droite → brique `ordonnee-origine`
 *              + essai immédiat (lire b sur une expression)
 *     étape 3  la LECTURE graphique, le nom étant acquis, puis brique `role-de-b`
 *     étape 4  brique `droites-paralleles` avant la question qui l'exige
 */

const A_FIXED = 1;
const RANGE = { xMin: -5, xMax: 5, yMin: -7, yMax: 7 };

export default function Module03BoutonB() {
  const [b, setB] = useState(0);
  const [seen, setSeen] = useState(() => new Set(['0']));
  const [predicted, setPredicted] = useState(false);
  const [nameDone, setNameDone] = useState(false);
  const [readDone, setReadDone] = useState(false);
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
              requires={['forme-ax-b', 'coefficient-directeur']}
              explain="b est la hauteur de départ : l’augmenter soulève la droite entière. L’inclinaison, elle, est le travail de a — et a est bloqué."
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
          done: explored && nameDone,
          content: (kit) => (
            <div className="space-y-3">
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
                        Toutes ces positions ont la <strong>même inclinaison</strong> : seule la
                        hauteur a changé. Le point orange, lui, vaut toujours{' '}
                        <MathText>{'$b$'}</MathText>.
                      </>
                    ) : (
                      <>Il te reste à essayer <strong>{missing.map((k) => LABELS[k]).join(', ')}</strong>.</>
                    )}
                  </Feedback>
                }
              />

              {explored && (
                <KnowledgeBrick
                  id="ordonnee-origine"
                  variant="new"
                  lead="Le point orange que tu viens de faire monter et descendre est toujours posé sur l’axe vertical. Sa hauteur porte un nom."
                >
                  <NumericQuestion
                    prompt={<>Que vaut l’<strong>ordonnée à l’origine</strong> de <MathText>{'$f(x) = 4x - 7$'}</MathText> ?</>}
                    expected={-7}
                    parse={parseDec}
                    display={formatDec(-7)}
                    requires={['ordonnee-origine', 'forme-ax-b']}
                    explain="C’est le nombre qui ne multiplie pas x : b = −7. Autrement dit f(0) = −7, et la droite coupe l’axe vertical à −7."
                    explainFor={(n) => {
                      if (n === 7) return 'Attention au signe : l’expression est 4x − 7, donc b vaut −7.';
                      if (n === 4) return 'Tu as donné le coefficient directeur. L’ordonnée à l’origine est le nombre qui s’ajoute, pas celui qui multiplie x.';
                      if (n === 0) return 'La droite ne passe par 0 que si aucun nombre ne s’ajoute. Ici il y a un « − 7 ».';
                      return null;
                    }}
                    solved={nameDone}
                    onAnswered={(ok) => { setNameDone(true); kit.react(ok); }}
                  />
                </KnowledgeBrick>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Où lit-on b ?',
          done: readDone,
          content: (kit) => (
            <div className="space-y-3">
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
                requires={['ordonnee-origine']}
                explain="En x = 0, le terme ax vaut 0 : il ne reste que b. Donc f(0) = b, et c’est l’endroit où la droite croise l’axe vertical."
                explainWrong="Remplace x par 0 dans ax + b : il reste b. C’est donc sur l’axe vertical que ça se lit."
                solved={readDone}
                onAnswered={(ok) => { setReadDone(true); kit.react(ok); }}
              />
              {readDone && (
                <KnowledgeBrick
                  id="role-de-b"
                  variant="new"
                  compact
                  lead="Symétrique du module précédent : voilà ce que b fait, et ce qu’il ne fait pas."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Deux droites parallèles',
          subtitle: 'Toutes les positions essayées à l’étape 2 avaient la même inclinaison. Nomme ce qu’elles étaient.',
          done: parallelDone,
          content: (kit) => (
            <KnowledgeBrick
              id="droites-paralleles"
              variant="new"
              lead="Tu as fait glisser une seule droite ; imagine les positions essayées dessinées toutes ensemble."
            >
              <TapQuestion
                prompt={<>Parmi ces trois droites, laquelle n’est <strong>pas</strong> parallèle aux deux autres ?</>}
                options={[
                  'f(x) = 3x − 1',
                  'g(x) = 2x − 1',
                  'h(x) = 2x + 6',
                ]}
                correct={0}
                cols={1}
                requires={['droites-paralleles', 'coefficient-directeur', 'ordonnee-origine']}
                explain="g et h ont le même coefficient directeur (2) : elles sont parallèles, malgré des ordonnées à l’origine très différentes. f a un coefficient 3 : elle est plus raide, donc elle finit par les croiser."
                explainWrong="Ne regarde que le nombre devant x. Le nombre qui s’ajoute décale la droite en hauteur, il ne change pas son inclinaison — g et h ont beau démarrer à −1 et à 6, elles montent pareil."
                solved={parallelDone}
                onAnswered={(ok) => { setParallelDone(true); kit.react(ok); }}
              />
            </KnowledgeBrick>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> <MathText>{'$a$'}</MathText> incline,{' '}
          <MathText>{'$b$'}</MathText> soulève — deux commandes indépendantes. Au module
          suivant, les deux sont libres en même temps.
        </KnowledgeSnapshot>
      )}
    />
  );
}
