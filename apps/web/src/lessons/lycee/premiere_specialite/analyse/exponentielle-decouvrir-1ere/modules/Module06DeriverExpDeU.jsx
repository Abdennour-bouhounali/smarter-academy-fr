import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';


/**
 * Module 6 — ATELIER : dériver e^u dans des cas simples.
 *
 * Étape 1  LE GESTE DÉJÀ CONNU. La règle de la composée est un acquis (module 0,
 *          `regle-composee-simple`) : on l'applique, on ne la réenseigne pas.
 *          Ce que l'exponentielle ajoute, et c'est tout : l'enveloppe se recopie
 *          à l'identique, puisqu'elle est sa propre dérivée.
 * Étape 2  LES TROIS CAS, en un lot : e^{2x}, e^{−x}, e^{3x+1}.
 * Étape 3  le piège du facteur oublié, confronté par un nombre.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 le raisonnement mené → brique
 * `regle-derivee-exp-u` ; étape 2 l'application ; étape 3 la vérification, puis
 * `mem-facteur-descend`.
 *
 * PÉRIMÈTRE CODÉ : les trois cas viennent de `CAS_EXP_U`, que
 * `assertCasSimple` refuse dès que u n'est pas affine (components/expoUtils.js).
 * Un module ne peut donc pas glisser un e^{x²} sans que le test tombe.
 */
export default function Module06DeriverExpDeU() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = q1;
  const done2 = q2;
  const done3 = q3;

  const steps = [
    {
      num: 1,
      title: 'Le geste que tu connais déjà',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p className="font-semibold text-amber-900">Rappel de l’emboîtement</p>
            <p>
              Pour dériver un emboîtement, on dérive l’enveloppe, puis on multiplie par la dérivée
              de l’intérieur. Sur (5x + 2)³ cela donnait 3(5x + 2)² × 5.
            </p>
            <p>
              Ici l’enveloppe est l’exponentielle. Or elle a une particularité que tu viens de
              passer cinq modules à établir…
            </p>
          </div>
          <TapQuestion
            prompt="Quand on dérive l’enveloppe exponentielle, que devient-elle ?"
            options={[
              'Elle se recopie à l’identique : sa dérivée est elle-même',
              'Elle devient un produit de facteurs en x',
              'Elle disparaît, il ne reste que la dérivée de l’intérieur',
              'Elle devient une constante',
            ]}
            correct={0}
            cols={1}
            requires={['propriete-caracteristique', 'mem-exp-egale-sa-derivee', 'regle-composee-simple']}
            explain="C’est toute la propriété caractéristique : exp′ = exp. L’enveloppe se recopie donc telle quelle, et il ne reste qu’à multiplier par la dérivée de l’intérieur."
            explainWrong="Rappelle-toi la définition : cette fonction est justement celle dont la dérivée est elle-même. Dériver l’enveloppe ne la change donc pas."
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Deux gestes, dont un qui ne fait rien : on recopie l’exponentielle, et on multiplie
                par la dérivée de l’intérieur. Quand l’intérieur s’écrit ax + b, cette dérivée vaut
                simplement <strong>a</strong>.
              </Feedback>
              <KnowledgeBrick
                id="regle-derivee-exp-u"
                variant="new"
                lead={<>La règle, et les trois cas que tu vas travailler.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trois emboîtements',
      done: done2,
      content: (
        <BatchChoiceQuestion
          intro={<p>Applique la règle : on recopie l’exponentielle, et le coefficient de x descend en facteur.</p>}
          rows={[
            {
              id: 'r1',
              label: 'dérivée de e^(2x)',
              options: ['2e^(2x)', 'e^(2x)', '2xe^(2x)'],
              correct: 0,
              correction: 'Le coefficient de x vaut 2 : il descend en facteur, et l’exponentielle se recopie. (e^(2x) seul, c’est le facteur oublié.)',
            },
            {
              id: 'r2',
              label: 'dérivée de e^(−x)',
              options: ['−e^(−x)', 'e^(−x)', '−e^(x)'],
              correct: 0,
              correction: 'Le coefficient de x vaut −1 : le facteur descend avec son signe. C’est pourquoi cette fonction-là DÉCROÎT.',
            },
            {
              id: 'r3',
              label: 'dérivée de e^(3x+1)',
              options: ['3e^(3x+1)', 'e^(3x+1)', '4e^(3x+1)'],
              correct: 0,
              correction: 'Seul le coefficient de x descend : c’est 3. Le nombre 1 ne bouge pas — il décale la courbe, il ne change pas la vitesse.',
            },
          ]}
          requires={['regle-derivee-exp-u', 'facteur']}
          feedback={({ allRight }) =>
            allRight ? (
              <>
                Un seul nombre descend : celui qui multiplie x. Le nombre ajouté à l’intérieur,
                lui, reste où il est.
              </>
            ) : (
              <>
                Attention : le facteur qui descend est le coefficient de <strong>x</strong>, pas la
                somme des nombres de l’intérieur. Pour e^(3x+1), c’est 3, pas 4.
              </>
            )
          }
          solved={done2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Ce que le facteur oublié coûte',
      done: done3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p>
              Prenons f(x) = e^{'{3x+1}'}. Sa vraie dérivée est 3e^{'{3x+1}'}. Un élève qui oublie
              le facteur écrit e^{'{3x+1}'}.
            </p>
            <div className="text-center">
              <MathText>{'$$\\left(e^{3x+1}\\right)\' = 3e^{3x+1} \\neq e^{3x+1}$$'}</MathText>
            </div>
            <p>
              L’écart n’est pas une nuance d’écriture : la pente annoncée serait{' '}
              <strong>trois fois trop petite</strong>, en tout point.
            </p>
          </div>
          <KnowledgeBrick
            id="mem-facteur-descend"
            variant="new"
            lead={<>Avant de trancher entre quatre écritures, la seule chose à retenir de ce module.</>}
          />
          <TapQuestion
            prompt="Parmi ces trois écritures, laquelle est une dérivée CORRECTE ?"
            options={[
              '(e^(−x))′ = −e^(−x)',
              '(e^(2x))′ = e^(2x)',
              '(e^(3x+1))′ = 4e^(3x+1)',
              '(e^(2x))′ = 2xe^(2x)',
            ]}
            correct={0}
            cols={1}
            requires={['regle-derivee-exp-u', 'mem-facteur-descend']}
            explain="Le coefficient de x vaut −1, donc il descend avec son signe : (e^(−x))′ = −e^(−x). Les trois autres écritures oublient le facteur, l’additionnent au lieu de le lire, ou confondent avec la règle du produit."
            explainWrong="Reprends la règle : l’exponentielle se recopie, et SEUL le coefficient de x descend. Pour e^(2x) ce facteur vaut 2 — ni 1, ni 2x. Pour e^(3x+1), il vaut 3 — pas 4."
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <>
              <Feedback tone="ok">
                Et remarque ce que le signe entraîne : pour e^{'{−x}'} la dérivée est{' '}
                <strong>négative partout</strong> — cette fonction-là décroît, alors que
                l’exponentielle croît. Le facteur ne change pas que la vitesse, il peut renverser
                le sens de marche.
              </Feedback>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle={'Dériver e^u'}
      moduleSubtitle="L’enveloppe se recopie, l’intérieur laisse une trace"
      estimatedTime="8 min"
      brief={{
        tag: 'Atelier',
        title: 'Un emboîtement de plus',
        tone: 'indigo',
        body: (
          <p>
            Tu sais dériver l’exponentielle toute seule : c’est elle-même. Reste le cas où quelque
            chose se trouve à l’intérieur — et là, le geste de l’emboîtement reprend ses droits.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tout est en place.</strong> Sa définition, son signe, ses variations, sa courbe,
          sa tangente en 0 et sa dérivée composée. Reste à le prouver : mission finale.
        </KnowledgeSnapshot>
      }
    />
  );
}
