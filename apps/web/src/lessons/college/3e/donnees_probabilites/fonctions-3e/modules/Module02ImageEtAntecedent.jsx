import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FunctionMachine from '../components/FunctionMachine';
import { affine, square, imageOf, antecedentsOf, formatRule } from '../components/functionUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 2 — DÉCOUVERTE : « Image et antécédent ».
 *
 * Activity: aller dans le sens de la machine, écrire ce qu'on vient de faire,
 *   puis la remonter — d'abord sur une droite (un seul chemin de retour),
 *   ensuite sur le carré (deux chemins).
 * Mathematical objective: nommer image, antécédent et f(x) APRÈS le geste qui
 *   leur donne un sens, et faire VOIR la dissymétrie : un nombre a une image,
 *   une image peut avoir plusieurs antécédents.
 * Student action: choisir une entrée et lancer ; puis viser une sortie et
 *   chercher l'entrée qui la donne.
 * Controlled variable: l'entrée x, puis la sortie visée (mode inverse).
 * Mathematical state: { rule, x } ; les antécédents sont CALCULÉS par
 *   antecedentsOf, jamais devinés — c'est la même liste qui alimente le texte.
 * Visual consequence: sur x², deux pastilles d'entrée conduisent à la MÊME
 *   sortie ; le journal montre les deux colonnes avec la même valeur en bas.
 * Expected observation: « 2 et −2 sortent tous les deux à 4 ».
 * Misconception targeted: « à chaque sortie correspond une seule entrée » —
 *   défaite en manipulant, pas en l'affirmant.
 * Feedback: explainFor cible l'erreur de signe et l'oubli du second antécédent.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Ce module posait autrefois « image », « antécédent » et f(x) dans ses
 *   `explain` et son `footer` — c'est-à-dire APRÈS les avoir exigés. L'ordre
 *   est maintenant : geste → brique qui nomme → essai immédiat, chaque mot
 *   étant établi avant la première question qui s'en sert :
 *     étape 1  manipuler, puis brique `image`      → essai « image de 3 »
 *     étape 2  brique `notation-fx`                → essai « f(6) »
 *     étape 3  remonter, puis brique `antecedent`  → essai « antécédent de 11 »
 *     étape 4  seulement là, les trois mots ensemble
 *   La règle reste dite en mots (« × 2 puis + 1 ») tant que f(x) n'est pas posé.
 * Transfer: le tableau de valeurs du module 3 range ces mêmes couples.
 */

const F = affine(2, 1);        // « × 2 puis + 1 », écrite f(x) = 2x + 1 à l'étape 2
const G = square();            // g(x) = x²
const RULE_WORDS = '× 2 puis + 1';

export default function Module02ImageEtAntecedent() {
  const [x, setX] = useState(3);
  const [tested, setTested] = useState([]);
  const [imageDone, setImageDone] = useState(false);
  const [notationDone, setNotationDone] = useState(false);

  const [inverseX, setInverseX] = useState(2);
  const [inverseTested, setInverseTested] = useState([]);
  const [antDone, setAntDone] = useState(false);
  const [vocabDone, setVocabDone] = useState(false);

  const [gx, setGx] = useState(2);
  const [gTested, setGTested] = useState([]);
  const [twoDone, setTwoDone] = useState(false);

  const record = (setter) => (vx, vy) =>
    setter((prev) => (prev.some((t) => t.x === vx) ? prev : [...prev, { x: vx, y: vy }]));

  // La brique n'apparaît qu'une fois le geste fait : on nomme ce que l'élève
  // vient d'obtenir, jamais ce qu'il n'a pas encore vu.
  const ranOnce = tested.length >= 1;
  const foundNine = inverseTested.some((t) => t.y === 9);
  // Deux entrées OPPOSÉES essayées : la dissymétrie devient visible.
  const sawBothSigns = gTested.some((t) => t.x > 0) && gTested.some((t) => t.x < 0);

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
            La règle de la machine est maintenant affichée : <strong>{RULE_WORDS}</strong>.
            Va dans son sens, puis remonte-la — c’est là que les mots des mathématiciens
            deviennent utiles.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le sens direct',
          subtitle: 'Choisis une entrée, lance, et regarde ce qui sort.',
          done: imageDone,
          content: (kit) => (
            <div className="space-y-3">
              <FunctionMachine
                rule={F}
                x={x}
                onXChange={setX}
                xs={[-2, -1, 0, 1, 2, 3, 4]}
                tested={tested}
                onRun={(vx, vy) => {
                  record(setTested)(vx, vy);
                  if (!tested.some((t) => t.x === vx)) kit.react(true);
                }}
                showRule={false}
                label={RULE_WORDS}
              />

              {!ranOnce && (
                <Feedback tone="info">
                  Lance la machine au moins une fois : le nombre qui sort a un nom.
                </Feedback>
              )}

              {ranOnce && (
                <KnowledgeBrick
                  id="image"
                  variant="new"
                  lead={(
                    <>
                      Tu viens de donner <strong>{formatDec(tested[tested.length - 1].x)}</strong> à
                      la machine, et <strong>{formatDec(tested[tested.length - 1].y)}</strong> est
                      sorti. Ce nombre de sortie porte un nom.
                    </>
                  )}
                >
                  <NumericQuestion
                    prompt={<>Cette machine donne 7 pour 3. Quelle est <strong>l’image de 3</strong> ?</>}
                    expected={7}
                    parse={parseDec}
                    display="7"
                    requires={['image']}
                    explain="L’image de 3, c’est ce qui SORT quand on entre 3 : ici 7."
                    explainFor={(n) => {
                      if (n === 3) return 'Tu as redonné l’entrée. L’image est le nombre qui SORT.';
                      return null;
                    }}
                    solved={imageDone}
                    onAnswered={(ok) => { setImageDone(true); kit.react(ok); }}
                  />
                </KnowledgeBrick>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Écrire ce qu’on vient de faire',
          subtitle: 'Les mathématiciens ont une écriture plus courte que la machine.',
          done: notationDone,
          content: (kit) => (
            <KnowledgeBrick
              id="notation-fx"
              variant="new"
              lead="Redessiner la machine à chaque fois serait long. Voici comment on écrit la même chose."
            >
              <div className="space-y-3">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    La machine de ce module s’appelle f
                  </p>
                  <MathText>{`$${formatRule(F)}$`}</MathText>
                </div>
                <NumericQuestion
                  prompt={<>Sans lancer la machine : que vaut <MathText>{'$f(6)$'}</MathText> ?</>}
                  expected={imageOf(F, 6)}
                  parse={parseDec}
                  display={formatDec(imageOf(F, 6))}
                  requires={['notation-fx', 'image']}
                  explain="f(6) = 2 × 6 + 1 = 13. Autrement dit : l’image de 6 par f est 13."
                  explainFor={(n) => {
                    if (n === 12) return 'Tu as multiplié par 2 mais oublié le « + 1 » : 2 × 6 = 12, puis 12 + 1 = 13.';
                    if (n === 14) return 'Attention : c’est 2 × 6 + 1, pas 2 × (6 + 1).';
                    if (n === 6) return 'Tu as redonné le nombre entre parenthèses : c’est l’entrée, pas la sortie.';
                    return null;
                  }}
                  solved={notationDone}
                  onAnswered={(ok) => { setNotationDone(true); kit.react(ok); }}
                />
              </div>
            </KnowledgeBrick>
          ),
        },
        {
          num: 3,
          title: 'Le sens inverse',
          subtitle: 'Cette fois on connaît la sortie visée — 9 — et on cherche l’entrée.',
          done: antDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
                <MathText>{`$${formatRule(F)}$`}</MathText>
                <div className="font-mono text-slate-600">? &nbsp;→&nbsp; 9</div>
              </div>

              <FunctionMachine
                rule={F}
                x={inverseX}
                onXChange={setInverseX}
                xs={[0, 1, 2, 3, 4, 5, 6]}
                tested={inverseTested}
                onRun={(vx, vy) => {
                  record(setInverseTested)(vx, vy);
                  if (!inverseTested.some((t) => t.x === vx)) kit.react(vy === 9);
                }}
                showRule
              />

              {!foundNine && (
                <Feedback tone="info">
                  Essaie des entrées jusqu’à obtenir <strong>9</strong> en sortie.
                </Feedback>
              )}

              {foundNine && (
                <KnowledgeBrick
                  id="antecedent"
                  variant="new"
                  lead="Tu as remonté la machine : tu es parti de la sortie pour retrouver l’entrée. Cette entrée a un nom."
                >
                  <NumericQuestion
                    prompt={<>Toujours avec cette machine : quel nombre a pour image <strong>11</strong> ? Autrement dit, quel est un <strong>antécédent</strong> de 11 ?</>}
                    expected={antecedentsOf(F, 11)[0]}
                    parse={parseDec}
                    display={formatDec(antecedentsOf(F, 11)[0])}
                    requires={['antecedent', 'image']}
                    explain="2 × 5 + 1 = 11 : l’entrée est 5. On dit que 5 est un antécédent de 11 par f."
                    explainFor={(n) => {
                      if (n === 11) return 'Tu as redonné la sortie. On cherche ce qu’il faut ENTRER pour obtenir 11.';
                      if (n === 5.5) return 'Tu as divisé 11 par 2 sans enlever d’abord le « + 1 » : (11 − 1) ÷ 2 = 5.';
                      if (n === 10) return 'Tu as enlevé 1 puis oublié de diviser par 2 : (11 − 1) ÷ 2 = 5.';
                      return null;
                    }}
                    solved={antDone}
                    onAnswered={(ok) => { setAntDone(true); kit.react(ok); }}
                  />
                </KnowledgeBrick>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Les trois mots ensemble',
          subtitle: 'Tu connais maintenant les deux sens et l’écriture. Relie-les.',
          done: vocabDone,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center space-y-2">
                <div className="font-mono text-lg text-slate-800">
                  <span className="font-bold text-indigo-800">4</span>
                  <span className="text-slate-400 mx-3">→ f →</span>
                  <span className="font-bold text-emerald-700">9</span>
                </div>
                <div className="flex justify-center gap-10 text-xs font-bold">
                  <span className="text-indigo-800">antécédent</span>
                  <span className="text-emerald-700">image</span>
                </div>
              </div>
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
                requires={['image', 'antecedent', 'notation-fx']}
                explain="Dans f(4) = 9, on entre 4 et il sort 9 : 9 est l’image de 4 par f, et 4 est un antécédent de 9. L’image se lit à droite, l’antécédent à gauche."
                explainWrong="Le nombre entre parenthèses est ce qu’on ENTRE : c’est l’antécédent. Le résultat est l’image."
                solved={vocabDone}
                onAnswered={() => setVocabDone(true)}
              />
            </div>
          ),
        },
        {
          num: 5,
          title: 'Une sortie, deux entrées ?',
          subtitle: 'Nouvelle machine : elle met au carré. Essaie des entrées opposées.',
          done: twoDone,
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
              {!sawBothSigns && !twoDone && (
                <Feedback tone="info">
                  Essaie une entrée <strong>positive</strong> et une entrée <strong>négative</strong>,
                  puis compare les deux sorties.
                </Feedback>
              )}
              {sawBothSigns && (
                <>
                  <Feedback tone="ok">
                    Deux entrées différentes, la même sortie. Ce n’est pas une panne : c’est
                    possible, et ça change tout pour les antécédents.
                  </Feedback>
                  <KnowledgeBrick
                    id="mem-image-antecedent"
                    variant="new"
                    compact
                    lead="Voilà la dissymétrie entre les deux sens, à retenir telle quelle."
                  />
                </>
              )}
              <TapQuestion
                prompt={<>Combien d’antécédents le nombre <strong>4</strong> a-t-il par <MathText>{'$g$'}</MathText> ?</>}
                options={['Un seul : 2', 'Deux : −2 et 2', 'Aucun', 'Une infinité']}
                correct={1}
                cols={1}
                requires={['antecedent']}
                explain="g(2) = 4 et g(−2) = 4 : le nombre 4 a DEUX antécédents. Un nombre n’a qu’une image, mais une image peut avoir plusieurs antécédents — les deux sens ne se ressemblent pas."
                explainWrong="Un carré efface le signe : (−2)² = 4 tout autant que 2² = 4. Il y a donc deux entrées possibles."
                solved={twoDone}
                onAnswered={(ok) => { setTwoDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Tu sais aller dans les deux sens, un nombre à la fois. Au
          module suivant, on range tous ces couples dans un tableau.
        </KnowledgeSnapshot>
      )}
    />
  );
}
