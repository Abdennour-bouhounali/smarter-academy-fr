import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { image, coefficientFromPair, formatLinear, isProportionalTable } from '../components/linearUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 2 — DÉCOUVERTE : « Le coefficient ».
 *
 * Activity: comparer trois marchands dont seul le prix au kilo diffère, puis
 *   retrouver ce prix à partir d'un seul achat.
 * Mathematical objective: isoler `a` comme la SEULE donnée d'une fonction
 *   linéaire — le connaître, c'est connaître la fonction entière.
 * Student action: remplir des colonnes, puis calculer y ÷ x.
 * Controlled variable: le coefficient a, choisi parmi trois marchands.
 * Mathematical state: { a, tested } ; les prix viennent tous de `image`.
 * Visual consequence: à masse égale, les trois prix diffèrent, et l'écart
 *   grandit avec la masse — un coefficient plus grand « monte plus vite ».
 * Expected observation: « un seul nombre suffit à décrire tout le tableau ».
 * Misconception targeted: chercher a en soustrayant plutôt qu'en divisant ;
 *   et croire qu'il faut plusieurs points pour déterminer une linéaire.
 * Feedback: explainFor cible la soustraction et l'inversion x/y.
 * Formalization: « un seul point suffit » est nommé après l'avoir fait.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le mot « coefficient » — l'objet même de ce module — arrivait dans le
 *   Feedback de l'étape 1 puis dans un `explain`, sans jamais être posé.
 *   L'ordre est maintenant : comparer les trois étals → brique `coefficient`
 *   avec essai immédiat → division retrouvée → brique
 *   `coefficient-par-division` → « un seul point suffit » → brique
 *   `un-point-suffit` → brique `test-lineaire` avant le tri de l'étape 5.
 * Scaffolding: coefficient donné → coefficient à retrouver → tableau à trier.
 * Transfer: le module 3 montre au graphique ce que le tableau vient de dire.
 */

const MARCHANDS = [
  { id: 'a', nom: 'Marchand A', a: 3 },
  { id: 'b', nom: 'Marchand B', a: 4.5 },
  { id: 'c', nom: 'Marchand C', a: 6 },
];
const XS = [1, 2, 3, 4];

export default function Module02Coefficient() {
  const [tested, setTested] = useState(() => new Set());
  const [gapDone, setGapDone] = useState(false);
  const [findDone, setFindDone] = useState(false);
  const [oneDone, setOneDone] = useState(false);
  const [sortDone, setSortDone] = useState(false);
  const [namedDone, setNamedDone] = useState(false);

  const done1 = tested.size >= 3;

  const cols = MARCHANDS.map((m) => ({
    id: m.id,
    label: `${m.nom} (€)`,
    fn: (x) => image(m.a, x),
  }));

  const test = (x, kit) => {
    if (tested.has(x)) return;
    const next = new Set(tested);
    next.add(x);
    setTested(next);
    kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le coefficient"
      moduleSubtitle="Un seul nombre commande tout : celui par lequel on multiplie."
      estimatedTime="8 min"
      brief={{
        tag: '🔢 Mission 02',
        title: 'Trois marchands, trois prix',
        tone: 'indigo',
        body: (
          <p>
            Même produit, trois étals. Ce qui les distingue tient en un seul nombre —
            et ce nombre décide de tout le reste.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Compare les trois étals',
          subtitle: 'Touche trois masses.',
          done: done1 && namedDone,
          content: (kit) => (
            <div className="space-y-3">
              <ValueTable
                columns={cols}
                xs={XS}
                tested={tested}
                onTest={(x) => test(x, kit)}
                variable="Masse (kg)"
                compare={false}
                caption="Prix chez les trois marchands"
              />
              {!done1 && (
                <Feedback tone="info">
                  Encore <strong>{3 - tested.size}</strong> masse
                  {3 - tested.size > 1 ? 's' : ''} à comparer.
                </Feedback>
              )}
              {done1 && (
                <>
                  <Feedback tone="ok">
                    Les trois colonnes grandissent, mais pas à la même vitesse. Ce qui les
                    sépare tient en un seul nombre : celui par lequel chaque marchand multiplie.
                  </Feedback>
                  <KnowledgeBrick
                    id="coefficient"
                    variant="new"
                    lead="Ce nombre-là — 3, 4,5 ou 6 selon l’étal — porte un nom."
                  >
                    <NumericQuestion
                      prompt={<>Le marchand C vend à <MathText>{'$c(x) = 6x$'}</MathText>. Quel est le coefficient de cette fonction linéaire ?</>}
                      expected={6}
                      parse={parseDec}
                      display="6"
                      requires={['coefficient', 'fonction-lineaire']}
                      explain="Le coefficient est le nombre qui multiplie x : ici 6, c’est-à-dire 6 € le kilo."
                      explainFor={(n) => {
                        if (n === 1) return 'Tu as lu le coefficient de x tout seul. On demande celui de la fonction : le nombre écrit devant x.';
                        return null;
                      }}
                      solved={namedDone}
                      onAnswered={(ok) => { setNamedDone(true); kit.react(ok); }}
                    />
                  </KnowledgeBrick>
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'L’écart grandit',
          done: gapDone,
          content: (
            <TapQuestion
              prompt="Entre A (3 €/kg) et C (6 €/kg), l’écart de prix est-il le même pour 1 kg et pour 4 kg ?"
              options={[
                'Non : 3 € d’écart à 1 kg, 12 € à 4 kg',
                'Oui : l’écart est toujours de 3 €',
                'Non, mais l’écart diminue',
              ]}
              correct={0}
              cols={1}
              requires={['coefficient', 'proportionnalite']}
              explain="À 1 kg : 6 − 3 = 3 €. À 4 kg : 24 − 12 = 12 €. L’écart est lui aussi proportionnel à la masse — c’est ce que « deux fois plus cher » veut dire."
              explainWrong="Calcule les deux prix à 4 kg : 3 × 4 = 12 et 6 × 4 = 24. L’écart a quadruplé, comme la masse."
              solved={gapDone}
              onAnswered={() => setGapDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Retrouve le prix au kilo',
          subtitle: 'Un client a payé 13,50 € pour 3 kg chez un quatrième marchand.',
          done: findDone,
          content: (kit) => (
            <div className="space-y-3">
              <NumericQuestion
                prompt="Quel est le prix au kilo de ce marchand ?"
                expected={coefficientFromPair(3, 13.5)}
                parse={parseDec}
                display={formatDec(coefficientFromPair(3, 13.5))}
                suffix="€/kg"
                requires={['coefficient', 'proportionnalite']}
                explain="On divise le prix par la masse : 13,50 ÷ 3 = 4,50 €/kg."
                explainFor={(n) => {
                  if (n === 10.5) return 'Tu as soustrait (13,5 − 3). Le coefficient est un rapport : on DIVISE.';
                  if (Math.abs(n - 3 / 13.5) < 0.01) return 'Tu as divisé la masse par le prix. C’est le prix ÷ la masse : 13,5 ÷ 3.';
                  if (n === 40.5) return 'Tu as multiplié. Pour retrouver le prix d’un kilo, il faut diviser.';
                  return null;
                }}
                solved={findDone}
                onAnswered={(ok) => { setFindDone(true); kit.react(ok); }}
              />
              {findDone && (
                <KnowledgeBrick
                  id="coefficient-par-division"
                  variant="new"
                  compact
                  lead="Cette division-là marche à chaque fois, quel que soit le couple dont tu pars."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Un seul point suffit ?',
          done: oneDone,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt="Pour déterminer une fonction linéaire, combien de couples (x ; y) faut-il connaître ?"
              options={[
                'Un seul, à condition qu’il ne soit pas l’origine',
                'Deux au minimum',
                'Trois, pour vérifier l’alignement',
                'L’origine suffit',
              ]}
              correct={0}
              cols={1}
              requires={['coefficient', 'coefficient-par-division', 'mem-zero-donne-zero']}
              explain="Une fonction linéaire n’a qu’un paramètre : a. Un point (x ; y) avec x ≠ 0 le donne par division. Le couple (0 ; 0), lui, convient à TOUTES les fonctions linéaires : il n’en désigne aucune."
              explainWrong="Il faudrait deux données pour une machine à deux réglages — mais ici il n’y en a qu’un, et le couple (0 ; 0) est déjà connu d’avance."
              solved={oneDone}
              onAnswered={() => setOneDone(true)}
            />
            {oneDone && (
              <KnowledgeBrick
                id="un-point-suffit"
                variant="new"
                compact
                lead="C’est le privilège des fonctions linéaires : elles n’ont qu’un réglage."
              />
            )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Linéaire ou pas ?',
          done: sortDone,
          content: (
            <div className="space-y-3">
            <KnowledgeBrick
              id="test-lineaire"
              variant="new"
              compact
              lead="Tu as maintenant les deux gestes en main : les rapports, et l’image de 0. Voici le test complet."
            />
            <BatchChoiceQuestion
              requires={['test-lineaire', 'coefficient', 'mem-zero-donne-zero']}
              intro={<p className="text-sm text-slate-600">Chaque tableau décrit-il une fonction linéaire ?</p>}
              rows={[
                { id: 't1', label: '1 → 5 · 2 → 10 · 4 → 20', options: ['oui', 'non'], correct: 0,
                  correction: 'Tous les rapports valent 5 : linéaire, de coefficient 5.' },
                { id: 't2', label: '1 → 4 · 2 → 7 · 3 → 10', options: ['oui', 'non'], correct: 1,
                  correction: 'Les rapports valent 4 puis 3,5 puis 3,33… : ils ne coïncident pas, donc ce n’est pas une fonction linéaire.' },
                { id: 't3', label: '0 → 0 · 3 → 7,5 · 6 → 15', options: ['oui', 'non'], correct: 0,
                  correction: 'Rapport constant 2,5, et 0 donne bien 0 : linéaire.' },
                { id: 't4', label: '0 → 2 · 1 → 4 · 2 → 6', options: ['oui', 'non'], correct: 1,
                  correction: 'Pour 0 on obtient 2, pas 0 : une fonction linéaire donne toujours 0 pour 0.' },
              ]}
              feedback={({ allRight, nCorrect, total }) =>
                allRight
                  ? <>Les quatre sont justes. Le test tient en deux gestes : les rapports sont-ils égaux, et 0 donne-t-il 0 ?</>
                  : <>{nCorrect} sur {total}. Rappel : linéaire ⟺ rapports <MathText>{'$y \\div x$'}</MathText> tous égaux, et l’image de 0 vaut 0.</>
              }
              solved={sortDone}
              onAnswered={() => setSortDone(true)}
            />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Connaître <MathText>{'$a$'}</MathText>, c’est connaître la
          fonction entière. Reste à voir ce que ce nombre fait au <strong>graphique</strong>.
        </KnowledgeSnapshot>
      )}
    />
  );
}
