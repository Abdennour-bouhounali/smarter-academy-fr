import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProblemText from '../components/ProblemText';
import {
  evalLin, planCost, formatDec, formatEquation, solveLinear,
} from '../components/problemUtils';
import { FORFAIT } from '../components/problemsData';

/**
 * Module 1 — DÉCLENCHEUR : « Le forfait mystère ».
 *
 * Activity: chercher, en testant des nombres de séances, à partir de quand la
 *   carte B (24 € + 5 €/séance) devient plus avantageuse que la carte A
 *   (9 €/séance).
 * Mathematical objective: faire NAÎTRE le besoin d'une équation — les essais
 *   trouvent le point d'équilibre, mais lentement et seulement s'il tombe
 *   juste ; l'équation le donne en une ligne.
 * Student action: taper des puces « n = 1 … 8 » ; chaque puce remplit une
 *   ligne du tableau avec les deux prix.
 * Controlled variable: n, le nombre de séances testé.
 * Mathematical state: l'ensemble des n testés ; les deux colonnes sont
 *   `9n` et `24 + 5n`, évaluées par le modèle (aucun prix codé en dur).
 * Visual consequence: la ligne devient verte quand les deux colonnes
 *   coïncident — en n = 6, et là seulement.
 * Expected observation: avant 6 la carte A gagne, après 6 la carte B ; les
 *   prix ne doublent pas quand les séances doublent (2 séances 34 €, 4
 *   séances 44 €).
 * Misconception targeted: n° 4 du catalogue — « 2 fois plus de séances = 2
 *   fois plus cher » : la part fixe ne dépend pas de n.
 * Feedback: le tableau lui-même ; le module quantifie l'écart restant tant
 *   que la ligne verte n'est pas trouvée.
 * Formalization: étape 3, l'équation 9n = 24 + 5n et sa résolution en une
 *   ligne — nommée APRÈS les essais.
 * Scaffolding: puces toutes proposées, la puce 6 est atteignable dès le
 *   départ ; après 3 essais, l'énoncé rappelle où regarder.
 * Transfer: le module 4 construit cette équation carte par carte ; le module
 *   7 reprend la même situation avec 25 €, où les essais échouent.
 */
const XS = [1, 2, 3, 4, 5, 6, 7, 8];
const COLUMNS = [
  { id: 'a', label: 'Carte A (9 €/séance)', fn: (n) => evalLin(FORFAIT.quantities[0].lin.n, n) },
  { id: 'b', label: 'Carte B (24 € + 5 €/séance)', fn: (n) => evalLin(FORFAIT.quantities[1].lin.n, n) },
];

const SOL = solveLinear(FORFAIT.equation).x;

export default function Module01ForfaitMystere() {
  const [predicted, setPredicted] = useState(false);
  const [tested, setTested] = useState(() => new Set());
  const [revealDone, setRevealDone] = useState(false);
  const [lastDone, setLastDone] = useState(false);

  const found = tested.has(SOL);
  const tableDone = tested.size >= 4 && found;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le forfait mystère"
      moduleSubtitle="Deux cartes de cinéma. Trouve à partir de quand la deuxième devient plus intéressante."
      estimatedTime="8 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Deux cartes, un seul budget. Laquelle choisir ?',
        body: (
          <p>
            Le cinéma propose deux cartes. Tu ne connais pas encore le nombre de séances que tu iras voir —
            alors teste. Essaie des valeurs et regarde ce qui se passe.
          </p>
        ),
      }}
      intro={
        <ProblemText fragments={FORFAIT.fragments} title="L’offre du cinéma" />
      }
      steps={[
        {
          num: 1,
          title: 'Une intuition d’abord',
          subtitle: 'Sans rien calculer : pour 4 séances, laquelle est la moins chère ?',
          done: predicted,
          content: (
            <TapQuestion
              prompt="Pour 4 séances, quelle carte coûte le moins cher ?"
              options={['La carte A', 'La carte B', 'Le même prix']}
              cols={3}
              correct={0}
              explain={
                <>
                  Carte A : <MathText>{'$9 \\times 4 = 36$'}</MathText> €. Carte B :{' '}
                  <MathText>{'$24 + 5 \\times 4 = 44$'}</MathText> €. Pour 4 séances la carte A gagne —
                  mais les 24 € de la carte B se paient <em>une seule fois</em>, alors que la carte A
                  recompte 9 € à chaque séance. Reste à savoir quand ça bascule.
                </>
              }
              requires={['proportionnalite']}
              solved={predicted}
              onAnswered={() => setPredicted(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Teste des nombres de séances',
          subtitle: 'Touche des valeurs de n jusqu’à trouver le point d’équilibre.',
          done: tableDone,
          content: (kit) => (
            <div className="space-y-3">
              <ValueTable
                columns={COLUMNS}
                xs={XS}
                tested={tested}
                onTest={(n) => {
                  const next = new Set([...tested, n]);
                  setTested(next);
                  kit.react(n === SOL);
                }}
                variable="n"
                unit="€"
                caption="Prix total selon le nombre de séances"
                ariaLabel="Tableau des prix des deux cartes"
                disabled={tableDone}
              />
              {!tableDone && (
                <Feedback tone="info">
                  {tested.size === 0 ? (
                    'Touche une puce : les deux prix se calculent pour ce nombre de séances.'
                  ) : found ? (
                    <>
                      Tu as trouvé la ligne verte ! Il te faut encore{' '}
                      <strong>{4 - tested.size}</strong> essai{4 - tested.size > 1 ? 's' : ''} pour voir ce
                      qui se passe avant et après.
                    </>
                  ) : (
                    <>
                      {tested.size} essai{tested.size > 1 ? 's' : ''}, aucune ligne verte pour l’instant.
                      Pour n ={' '}
                      <strong className="font-mono">{Math.max(...tested)}</strong>, l’écart entre les deux
                      cartes est de{' '}
                      <strong className="font-mono">
                        {formatDec(Math.abs(
                          planCost(0, 9, Math.max(...tested)) - planCost(24, 5, Math.max(...tested)),
                        ))}
                      </strong>{' '}
                      €. {tested.size >= 3 ? 'Cherche entre 5 et 7 séances.' : 'Continue.'}
                    </>
                  )}
                </Feedback>
              )}
              {tableDone && (
                <Feedback tone="ok">
                  À <strong>6 séances</strong>, les deux cartes coûtent exactement{' '}
                  <strong className="font-mono">54 €</strong>. Avant, la carte A est moins chère ; après,
                  c’est la carte B. Remarque au passage : 2 séances coûtent 34 € avec la carte B, et 4
                  séances 44 € — <strong>pas le double</strong>, parce que les 24 € ne dépendent pas du
                  nombre de séances.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'La même chose en une ligne',
          subtitle: 'Ce que tu viens de chercher à tâtons s’écrit — et se trouve — d’un coup.',
          done: revealDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 space-y-2 text-sm text-slate-700">
                <p>
                  « Les deux cartes coûtent pareil » s’écrit :{' '}
                  <MathText>{`$${formatEquation(FORFAIT.equation, 'n')}$`}</MathText>.
                </p>
                <p className="font-mono text-center text-slate-800">
                  <MathText>{'$9n = 24 + 5n \\;\\Rightarrow\\; 4n = 24 \\;\\Rightarrow\\; n = 6$'}</MathText>
                </p>
                <p>
                  Trois écritures, et le point d’équilibre est trouvé. Pas de tableau, pas de tâtonnement.
                  C’est ça qu’on appelle <strong>modéliser</strong> : remplacer une recherche par une
                  égalité.
                </p>
              </div>
              <TapQuestion
                prompt={
                  <>
                    Dans cette équation, que représente <MathText>{'$n$'}</MathText> ?
                  </>
                }
                options={[
                  'Le prix payé au total',
                  'Le nombre de séances',
                  'La différence entre les deux cartes',
                ]}
                cols={1}
                correct={1}
                explain={
                  <>
                    <MathText>{'$n$'}</MathText> est le <strong>nombre de séances</strong> — c’est ce que
                    l’on cherche, et c’est ce qu’on a fait varier dans le tableau. Le prix, lui, est ce que
                    valent les deux membres : 54 € chacun quand n = 6.
                  </>
                }
                explainWrong={
                  <>
                    Regarde le tableau : c’est la colonne <MathText>{'$n$'}</MathText> qu’on a fait varier,
                    de 1 à 8 séances. Les prix sont les <em>résultats</em> —{' '}
                    <MathText>{'$9n$'}</MathText> et <MathText>{'$24 + 5n$'}</MathText>.
                  </>
                }
                requires={['calcul-litteral']}
                solved={revealDone}
                onAnswered={() => setRevealDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Et si la carte B coûtait 25 € ?',
          subtitle: 'Une seule pièce de plus. Les essais s’en sortiraient-ils ?',
          done: lastDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={
                  <>
                    Avec une carte B à 25 € (au lieu de 24 €), l’équation devient{' '}
                    <MathText>{'$9n = 25 + 5n$'}</MathText>. En testant des nombres entiers de séances,
                    trouverait-on une ligne où les deux prix sont égaux ?
                  </>
                }
                options={[
                  'Oui, il suffit de tester plus loin',
                  'Non : aucun nombre entier ne donne l’égalité',
                  'Oui, en n = 5',
                ]}
                cols={1}
                correct={1}
                explain={
                  <>
                    <MathText>{'$9n = 25 + 5n$'}</MathText> donne <MathText>{'$4n = 25$'}</MathText>, donc{' '}
                    <MathText>{'$n = 6{,}25$'}</MathText> : entre 6 et 7 séances. Aucune ligne du tableau ne
                    sera verte — et pourtant le problème a une réponse. C’est exactement là que le tableau
                    s’arrête et que l’équation continue. On y reviendra au module 7.
                  </>
                }
                explainWrong={
                  <>
                    Pour n = 6 : 54 € contre 55 €. Pour n = 7 : 63 € contre 60 €. Les deux prix se croisent{' '}
                    <em>entre</em> les deux — en{' '}
                    <MathText>{'$n = 6{,}25$'}</MathText>, une valeur qu’aucune puce du tableau ne propose.
                  </>
                }
                requires={['equation-premier-degre']}
                solved={lastDone}
                onAnswered={() => setLastDone(true)}
              />
              {lastDone && (
                <KnowledgeBrick
                  id="pourquoi-une-equation"
                  variant="new"
                  compact
                  lead="Le tableau finit par trouver ; l’équation, elle, ne dépend pas de la chance."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Une équation trouve en une ligne ce que les essais cherchent
          à tâtons. Toute la leçon consiste à savoir l’écrire.
        </KnowledgeSnapshot>
      )}
    />
  );
}
