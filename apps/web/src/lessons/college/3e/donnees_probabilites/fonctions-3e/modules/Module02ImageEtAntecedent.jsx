import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FunctionMachine from '../components/FunctionMachine';
import { affine, square, imageOf, antecedentsOf, formatRule } from '../components/functionUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 2 — DÉCOUVERTE : « Image et antécédent ».
 *
 * Activity: remonter la machine à l'envers, d'abord sur une droite (un seul
 *   chemin de retour), puis sur le carré (deux chemins).
 * Mathematical objective: nommer image et antécédent APRÈS le geste, poser la
 *   notation f(x), et faire VOIR la dissymétrie : un nombre a une image, une
 *   image peut avoir plusieurs antécédents.
 * Student action: choisir une sortie visée et chercher quelle entrée la donne.
 * Controlled variable: la sortie visée (mode inverse), puis x à nouveau.
 * Mathematical state: { rule, x } ; les antécédents sont CALCULÉS par
 *   antecedentsOf, jamais devinés — c'est la même liste qui alimente le texte.
 * Visual consequence: sur x², deux pastilles d'entrée conduisent à la MÊME
 *   sortie ; le journal montre les deux colonnes avec la même valeur en bas.
 * Expected observation: « 2 et −2 sortent tous les deux à 4 ».
 * Misconception targeted: « à chaque sortie correspond une seule entrée » —
 *   défaite en manipulant, pas en l'affirmant.
 * Feedback: explainFor cible l'erreur de signe et l'oubli du second antécédent.
 * Formalization: étape 3, les trois mots posés sur les couples déjà obtenus.
 * Scaffolding: règle affichée dès le début (le mystère est fini) ; sens direct
 *   puis sens inverse ; droite puis carré.
 * Transfer: le tableau de valeurs du module 3 range ces mêmes couples.
 */

const F = affine(2, 1);        // f(x) = 2x + 1
const G = square();            // g(x) = x²

export default function Module02ImageEtAntecedent() {
  const [x, setX] = useState(3);
  const [tested, setTested] = useState([]);
  const [imageDone, setImageDone] = useState(false);
  const [vocabDone, setVocabDone] = useState(false);
  const [antDone, setAntDone] = useState(false);

  const [gx, setGx] = useState(2);
  const [gTested, setGTested] = useState([]);
  const [twoDone, setTwoDone] = useState(false);

  const record = (setter) => (vx, vy) =>
    setter((prev) => (prev.some((t) => t.x === vx) ? prev : [...prev, { x: vx, y: vy }]));

  // Deux entrées OPPOSÉES essayées : la dissymétrie devient visible.
  const sawBothSigns = gTested.some((t) => t.x > 0) && gTested.some((t) => t.x < 0);
  const done4 = twoDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Image et antécédent"
      moduleSubtitle="Un nombre a une seule image. Une image peut avoir deux antécédents."
      estimatedTime="9 min"
      brief={{
        tag: '🔁 Mission 02',
        title: 'Dans les deux sens',
        tone: 'indigo',
        body: (
          <p>
            La règle est maintenant affichée. Va dans le sens de la machine, puis
            remonte-la : c’est là que les mots deviennent utiles.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le sens direct',
          subtitle: 'Choisis une entrée et lis la sortie.',
          done: imageDone,
          content: (kit) => (
            <div className="space-y-3">
              <FunctionMachine
                rule={F}
                x={x}
                onXChange={setX}
                xs={[-2, -1, 0, 1, 2, 3, 4]}
                tested={tested}
                onRun={record(setTested)}
                showRule
              />
              <NumericQuestion
                prompt={<>Sans lancer la machine : que vaut <MathText>{'$f(6)$'}</MathText> ?</>}
                expected={imageOf(F, 6)}
                parse={parseDec}
                display={formatDec(imageOf(F, 6))}
                explain="f(6) = 2 × 6 + 1 = 13. Le nombre 13 est l’IMAGE de 6 par f."
                explainFor={(n) => {
                  if (n === 12) return 'Tu as multiplié par 2 mais oublié le « + 1 » : 2 × 6 = 12, puis 12 + 1 = 13.';
                  if (n === 14) return 'Attention : c’est 2 × 6 + 1, pas 2 × (6 + 1).';
                  return null;
                }}
                solved={imageDone}
                onAnswered={(ok) => { setImageDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le sens inverse',
          subtitle: 'Cette fois, on connaît la sortie et on cherche l’entrée.',
          done: antDone,
          content: (kit) => (
            <NumericQuestion
              prompt={<>Quelle entrée donne la sortie <strong>9</strong> ?</>}
              above={
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
                  <MathText>{`$${formatRule(F)}$`}</MathText>
                  <div className="font-mono text-slate-600">? &nbsp;→&nbsp; 9</div>
                </div>
              }
              expected={antecedentsOf(F, 9)[0]}
              parse={parseDec}
              display={formatDec(antecedentsOf(F, 9)[0])}
              explain="2 × 4 + 1 = 9 : l’entrée est 4. On dit que 4 est un ANTÉCÉDENT de 9 par f."
              explainFor={(n) => {
                if (n === 9) return 'Tu as redonné la sortie. On cherche ce qu’il faut ENTRER pour obtenir 9.';
                if (n === 5) return 'Tu as enlevé 1 puis oublié de diviser par 2 : (9 − 1) ÷ 2 = 4.';
                if (n === 4.5) return 'Tu as divisé 9 par 2 sans enlever d’abord le « + 1 » : (9 − 1) ÷ 2 = 4.';
                return null;
              }}
              solved={antDone}
              onAnswered={(ok) => { setAntDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 3,
          title: 'Les trois mots',
          done: vocabDone,
          content: (
            <TapQuestion
              prompt={<>On écrit <MathText>{'$f(4) = 9$'}</MathText>. Que dit cette ligne ?</>}
              options={[
                '9 est l’image de 4, et 4 est un antécédent de 9',
                '4 est l’image de 9, et 9 est un antécédent de 4',
                'f multiplie 4 par 9',
                '4 et 9 sont deux images de f',
              ]}
              correct={0}
              cols={1}
              explain="Dans f(4) = 9, on entre 4 et il sort 9 : 9 est l’image de 4 par f, et 4 est un antécédent de 9. L’image se lit à droite, l’antécédent à gauche."
              explainWrong="Le nombre entre parenthèses est ce qu’on ENTRE : c’est l’antécédent. Le résultat est l’image."
              solved={vocabDone}
              onAnswered={() => setVocabDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Une sortie, deux entrées ?',
          subtitle: 'Nouvelle machine : elle met au carré. Essaie des entrées opposées.',
          done: done4,
          content: (kit) => (
            <div className="space-y-3">
              <FunctionMachine
                rule={G}
                x={gx}
                onXChange={setGx}
                xs={[-3, -2, -1, 0, 1, 2, 3]}
                tested={gTested}
                onRun={record(setGTested)}
                showRule
                name="g"
              />
              {!sawBothSigns && !done4 && (
                <Feedback tone="info">
                  Essaie une entrée <strong>positive</strong> et une entrée <strong>négative</strong>,
                  puis compare les deux sorties.
                </Feedback>
              )}
              {sawBothSigns && (
                <Feedback tone="ok">
                  Deux entrées différentes, la même sortie. Ce n’est pas une panne : c’est
                  possible, et ça a un nom.
                </Feedback>
              )}
              <TapQuestion
                prompt={<>Combien d’antécédents le nombre <strong>4</strong> a-t-il par <MathText>{'$g$'}</MathText> ?</>}
                options={['Un seul : 2', 'Deux : −2 et 2', 'Aucun', 'Une infinité']}
                correct={1}
                cols={1}
                explain="g(2) = 4 et g(−2) = 4 : le nombre 4 a DEUX antécédents. Un nombre n’a qu’une image, mais une image peut avoir plusieurs antécédents — les deux sens ne se ressemblent pas."
                explainWrong="Un carré efface le signe : (−2)² = 4 tout autant que 2² = 4. Il y a donc deux entrées possibles."
                solved={done4}
                onAnswered={(ok) => { setTwoDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>À retenir.</strong> On écrit <MathText>{'$f(x)$'}</MathText> l’image de{' '}
          <MathText>{'$x$'}</MathText> par <MathText>{'$f$'}</MathText>. Chercher une image,
          c’est aller dans le sens de la machine ; chercher un antécédent, c’est la remonter —
          et il peut y avoir plusieurs chemins de retour.
        </Feedback>
      }
    />
  );
}
