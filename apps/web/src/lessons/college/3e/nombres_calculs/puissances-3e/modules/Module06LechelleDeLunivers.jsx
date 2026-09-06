import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UniverseScale from '../components/UniverseScale';
import { UNIVERSE_ITEMS } from '../components/universeItems';
import {
  formatDec, formatScientific, magnitudeRatio, orderOfMagnitude, parseDec, toScientific,
} from '../components/powerUtils';

/**
 * Module 6 — LABO : « L'échelle de l'univers ».
 *
 * Activity: parcourir six objets réels, de la galaxie à l'atome, puis
 *   comparer leurs tailles en ne regardant que les exposants.
 * Mathematical objective: comparer des nombres à l'aide des puissances de 10
 *   et résoudre des problèmes de rapport d'échelle.
 * Student action: taper les puces d'objets (ou le stepper de zoom), puis
 *   répondre aux comparaisons.
 * Controlled variable: l'objet observé.
 * Mathematical state: l'indice courant + l'ensemble visité ; toutes les
 *   écritures scientifiques viennent de toScientific(meters).
 * Visual consequence: chaque objet affiche sa taille décimale complète (vite
 *   illisible) et son écriture scientifique (toujours lisible).
 * Expected observation: la différence d'exposants EST le rapport de taille,
 *   en puissances de 10.
 * Misconception targeted: comparer les coefficients avant les exposants
 *   (« 8 × 10⁻⁶ > 1,7 × 10⁰ parce que 8 > 1,7 ») et croire qu'un écart de 14
 *   exposants signifie « 14 fois plus grand ».
 * Feedback: le nombre d'objets restant à découvrir est affiché ; les erreurs
 *   de rapport sont corrigées en montrant la soustraction d'exposants.
 * Formalization: la règle « on soustrait les exposants pour un rapport » est
 *   celle du quotient, déjà établie au module 3.
 * Scaffolding: puces tap-first ; l'écriture scientifique est fournie, seule
 *   la comparaison est à faire.
 * Transfer: la synthèse du boss reprend cette bande figée.
 */
const ITEMS = UNIVERSE_ITEMS;
const TERRE = ITEMS.find((i) => i.id === 'terre');
const GALAXIE = ITEMS.find((i) => i.id === 'galaxie');
const GLOBULE = ITEMS.find((i) => i.id === 'globule');
const HUMAIN = ITEMS.find((i) => i.id === 'humain');

const RATIO_GALAXIE_TERRE = magnitudeRatio(GALAXIE.meters, TERRE.meters); // 14

export default function Module06LechelleDeLunivers() {
  const [index, setIndex] = useState(2);
  const [visited, setVisited] = useState([ITEMS[2].id]);
  const [compareDone, setCompareDone] = useState(false);
  const [ratioDone, setRatioDone] = useState(false);
  const [problemDone, setProblemDone] = useState(false);

  const exploreDone = visited.length === ITEMS.length;

  // Le calcul du prochain état est fait HORS updater : appeler react() dans un
  // updater setState est un effet dans une fonction qui doit rester pure
  // (playbook §10.10) — React le signale et le double en StrictMode.
  const goTo = (i, kitReact) => {
    setIndex(i);
    const id = ITEMS[i].id;
    if (visited.includes(id)) return;
    const next = [...visited, id];
    setVisited(next);
    if (next.length === ITEMS.length) kitReact?.(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="L'échelle de l'univers"
      moduleSubtitle="De l’atome à la galaxie : compare des tailles en ne regardant que les exposants."
      estimatedTime="10 min"
      brief={{
        tag: '🔭 Mission 06',
        title: 'Six objets, trente et un ordres de grandeur.',
        body: (
          <p>
            Explore les six objets de l’échelle. Regarde à chaque fois la taille écrite en entier, puis son
            écriture scientifique — et compte les zéros que tu n’as plus à écrire.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Découvre les six objets',
          subtitle: 'Tape une vignette, ou zoome avec les deux flèches.',
          done: exploreDone,
          content: (kit) => (
            <div className="space-y-3">
              <UniverseScale
                items={ITEMS}
                index={index}
                onChange={(i) => goTo(i, kit.react)}
                visited={visited}
              />
              {!exploreDone && (
                <Feedback tone="info">
                  <strong className="font-mono">{formatDec(visited.length)}</strong> objet
                  {visited.length > 1 ? 's' : ''} découvert{visited.length > 1 ? 's' : ''} sur{' '}
                  <strong className="font-mono">{formatDec(ITEMS.length)}</strong>. Il en reste{' '}
                  <strong className="font-mono">{formatDec(ITEMS.length - visited.length)}</strong>.
                </Feedback>
              )}
              {exploreDone && (
                <Feedback tone="ok">
                  De <MathText>{`$${formatScientific(toScientific(GALAXIE.meters))}$`}</MathText> m à{' '}
                  <MathText>{`$${formatScientific(toScientific(ITEMS[ITEMS.length - 1].meters))}$`}</MathText>{' '}
                  m : 31 ordres de grandeur, et pourtant chaque taille tient en une ligne. C’est exactement
                  à ça que sert l’écriture scientifique.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Comparer sans calculer',
          done: compareDone,
          content: (
            <div className="space-y-3">
            <KnowledgeBrick
              id="comparer-par-exposant"
              variant="new"
              compact
              lead="Comparer deux nombres écrits en puissances de dix : l’exposant décide d’abord."
            />
            <TapQuestion
              prompt={
                <>
                  Un globule rouge mesure{' '}
                  <MathText>{`$${formatScientific(toScientific(GLOBULE.meters))}$`}</MathText> m, un être
                  humain <MathText>{`$${formatScientific(toScientific(HUMAIN.meters))}$`}</MathText> m.
                  Lequel est le plus grand ?
                </>
              }
              options={['Le globule rouge (8 > 1,7)', "L'être humain", 'Impossible à dire sans calculer']}
              cols={1}
              correct={1}
              explain={
                <>
                  On regarde d’abord les exposants :{' '}
                  <MathText>{`$10^{${orderOfMagnitude(HUMAIN.meters)}}$`}</MathText> contre{' '}
                  <MathText>{`$10^{${orderOfMagnitude(GLOBULE.meters)}}$`}</MathText>. 0 &gt; −6, donc
                  l’être humain est plus grand — d’un facteur{' '}
                  <MathText>{`$10^{${magnitudeRatio(HUMAIN.meters, GLOBULE.meters)}}$`}</MathText>.
                </>
              }
              explainWrong={
                <>
                  Le piège est de comparer les coefficients 8 et 1,7. Mais 8 est multiplié par{' '}
                  <MathText>{'$10^{-6}$'}</MathText>, soit un millionième : 8 × 10⁻⁶ = 0,000008 m, contre
                  1,7 m. L’<strong>exposant décide en premier</strong> ; le coefficient ne départage que
                  des exposants égaux.
                </>
              }
              requires={['comparer-par-exposant', 'ecriture-scientifique']}
              solved={compareDone}
              onAnswered={() => setCompareDone(true)}
            />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Combien de fois plus grand ?',
          subtitle: 'Un rapport de puissances de 10 : on soustrait les exposants.',
          done: ratioDone,
          content: (
            <div className="space-y-3">
            <KnowledgeBrick
              id="rapport-echelle"
              variant="new"
              compact
              lead="Et pour savoir combien de fois l’un tient dans l’autre."
            />
            <NumericQuestion
              prompt={
                <>
                  La Voie lactée mesure environ{' '}
                  <MathText>{`$${formatScientific(toScientific(GALAXIE.meters))}$`}</MathText> m et la Terre{' '}
                  <MathText>{`$${formatScientific(toScientific(TERRE.meters))}$`}</MathText> m. La galaxie est
                  environ <MathText>{'$10^{?}$'}</MathText> fois plus grande : quel exposant ?
                </>
              }
              prefix="10 puissance"
              expected={RATIO_GALAXIE_TERRE}
              parse={parseDec}
              display={formatDec(RATIO_GALAXIE_TERRE)}
              explain={`Un rapport de puissances de 10 se lit en soustrayant les exposants : ${formatDec(orderOfMagnitude(GALAXIE.meters))} − ${formatDec(orderOfMagnitude(TERRE.meters))} = ${formatDec(RATIO_GALAXIE_TERRE)}. La galaxie est environ 10^${formatDec(RATIO_GALAXIE_TERRE)} fois plus grande.`}
              explainFor={(n) =>
                n === 28
                  ? `Tu as additionné les exposants : c’est la règle du PRODUIT. Ici on divise une taille par une autre, donc on soustrait : ${formatDec(orderOfMagnitude(GALAXIE.meters))} − ${formatDec(orderOfMagnitude(TERRE.meters))} = ${formatDec(RATIO_GALAXIE_TERRE)}.`
                  : n === 21 || n === 7
                  ? `Tu as donné l’ordre de grandeur d’un seul des deux objets. Le RAPPORT est la différence : ${formatDec(orderOfMagnitude(GALAXIE.meters))} − ${formatDec(orderOfMagnitude(TERRE.meters))} = ${formatDec(RATIO_GALAXIE_TERRE)}.`
                  : `On soustrait les exposants : ${formatDec(orderOfMagnitude(GALAXIE.meters))} − ${formatDec(orderOfMagnitude(TERRE.meters))} = ${formatDec(RATIO_GALAXIE_TERRE)}.`
              }
              requires={['rapport-echelle', 'regle-quotient']}
              solved={ratioDone}
              onAnswered={() => setRatioDone(true)}
            />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Un problème de sciences',
          done: problemDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={
                  <>
                    Une bactérie mesure <MathText>{'$2 \\times 10^{-6}$'}</MathText> m. On en aligne{' '}
                    <MathText>{'$5 \\times 10^{5}$'}</MathText>. Quelle longueur cela fait-il ?
                  </>
                }
                options={['$1 \\times 10^{0}$ m, soit 1 m', '$10 \\times 10^{-11}$ m', '$7 \\times 10^{-1}$ m']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['1 m', '10 × 10⁻¹¹ m', '0,7 m'][i]}
                correctionLabel="1 m"
                cols={1}
                correct={0}
                explain={
                  <>
                    On multiplie les coefficients et on additionne les exposants :{' '}
                    <MathText>{'$(2 \\times 5) \\times 10^{-6+5} = 10 \\times 10^{-1} = 1$'}</MathText> m.
                    Un demi-million de bactéries alignées font un mètre.
                  </>
                }
                explainWrong={
                  <>
                    Deux pièges. On ne multiplie PAS les exposants (−6 × 5 = −30 serait faux) : pour un
                    produit, on les ADDITIONNE, comme pour deux tours qu’on fusionne : −6 + 5 = −1. Et on
                    n’additionne pas les coefficients (2 + 5 = 7) : on les multiplie, 2 × 5 = 10. Résultat :
                    10 × 10⁻¹ = 1 m.
                  </>
                }
                requires={['rapport-echelle', 'ecriture-scientifique']}
                solved={problemDone}
                onAnswered={() => setProblemDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Il ne reste qu’à tout mettre à l’épreuve.
        </KnowledgeSnapshot>
      )}
    />
  );
}
