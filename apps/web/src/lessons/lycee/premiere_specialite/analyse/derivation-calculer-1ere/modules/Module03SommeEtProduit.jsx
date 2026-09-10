import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BancDeCartes from '../components/BancDeCartes';
import { parseSigned } from '../components/reglesUtils';

/**
 * Module 3 — DÉCOUVERTE : on NOMME ce que le module 1 a fait constater, puis
 * on construit la règle qui manquait.
 *
 * Étape 1  la somme et le produit par un réel : le geste qui passe est écrit
 *          en règle, et appliqué à 3x² + 5x − 7. Brique `regle-somme-et-reel`.
 * Étape 2  le produit : on RECONSTRUIT la bonne règle en repartant du couple
 *          du module 1. u′v + uv′ redonne 3x² — ce que le banc mesurait. La
 *          brique tombe APRÈS cette vérification, pas avant.
 * Étape 3  appliquer sur trois produits.
 *
 * CONNAISSANCES AVANT LA DEMANDE : chaque brique est posée après le geste qui
 * la justifie et avant la demande qui l'exige.
 *
 * MANIPULATION JAMAIS GELÉE : le banc de l'étape 2 reste pilotable — c'est
 * précisément au moment où l'on tient la règle qu'on veut la revérifier.
 */
export default function Module03SommeEtProduit() {
  const [q1, setQ1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [x2, setX2] = useState(3);
  const [ret2, setRet2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = q1;
  const done2 = q2a && q2b;
  const done3 = q3;

  const steps = [
    {
      num: 1,
      title: 'Les deux opérations qui se laissent traverser',
      subtitle:
        'Le banc l’a montré deux fois : le « + » et le « × un nombre » n’opposent aucune résistance. On l’écrit une fois pour toutes, puis on l’applique.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p className="font-semibold text-sky-900">Ce que le banc a mesuré, écrit en toutes lettres :</p>
            <p className="font-mono text-center text-[15px]">(u + v)′ = u′ + v′ &nbsp;&nbsp;·&nbsp;&nbsp; (k·u)′ = k·u′</p>
            <p>
              On dérive donc <strong>terme par terme</strong>, en gardant chaque coefficient à sa
              place. Sur f(x) = 3x² + 5x − 7 : le 3x² donne 3 × 2x, le 5x donne 5 × 1, et le −7
              ne fait que décaler la courbe.
            </p>
          </div>
          <NumericQuestion
            prompt={<>Pour f(x) = 3x² + 5x − 7, que vaut <strong>f′(1)</strong> ?</>}
            expected={11}
            parse={parseSigned(parseDec)}
            display="11"
            requires={['derivees-usuelles', 'vocab-terme-coefficient']}
            explain="f′(x) = 6x + 5, donc f′(1) = 6 + 5 = 11. Le −7 disparaît : une valeur constante ne change pas la pente."
            explainFor={(n) =>
              n === 4
                ? 'Tu as gardé le −7 : 6 + 5 − 7 = 4. Or la dérivée d’une constante est 0, pas la constante elle-même.'
                : n === 1
                ? 'C’est f(1) = 3 + 5 − 7 = 1, l’ordonnée du point — pas la pente. f′(x) = 6x + 5.'
                : n === 8
                ? 'Tu as dérivé le 3x² en 3 × 2 = 6 mais oublié le terme en x : il apporte 5 de plus.'
                : null
            }
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Terme par terme, coefficient compris, et la constante s’efface. C’est le cas le
                plus fréquent — et le plus sûr.
              </Feedback>
              <KnowledgeBrick
                id="regle-somme-et-reel"
                variant="new"
                lead={<>Les deux règles que le banc a vérifiées, posées.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le produit : reconstruire la bonne règle',
      subtitle:
        'On sait ce qui ne marche pas. On repart du couple du module 1 — u = x², v = x — dont on connaît le résultat : x³, de pente 3x². Deux morceaux au lieu d’un.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p>
              Une piste : et si chaque morceau se dérivait <strong>à son tour</strong>, pendant
              que l’autre attend ? Cela ferait deux termes à additionner :
            </p>
            <p className="font-mono text-center text-[15px]">u′ × v &nbsp; + &nbsp; u × v′</p>
            <p>Testons-la sur u = x² et v = x, dont on connaît déjà la réponse.</p>
          </div>
          <NumericQuestion
            prompt={<>Premier terme : que vaut <strong>u′(2) × v(2)</strong>, avec u = x² et v = x ?</>}
            expected={8}
            parse={parseSigned(parseDec)}
            display="8"
            requires={['derivees-usuelles']}
            explain="u′ = 2x, donc u′(2) = 4. Et v(2) = 2. Le premier terme vaut 4 × 2 = 8."
            explainFor={(n) =>
              n === 4
                ? 'C’est u′(2) tout seul. Il reste à le multiplier par v(2) = 2, ce qui donne 8.'
                : n === 2
                ? 'C’est v(2). Le premier terme est le produit u′(2) × v(2) = 4 × 2 = 8.'
                : null
            }
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          <NumericQuestion
            prompt={<>Maintenant la somme entière : <strong>u′(2)·v(2) + u(2)·v′(2)</strong> ?</>}
            expected={12}
            parse={parseSigned(parseDec)}
            display="12"
            requires={['derivees-usuelles', 'derivation-ne-se-distribue-pas']}
            explain="u′(2)·v(2) = 4 × 2 = 8, et u(2)·v′(2) = 4 × 1 = 4. Somme : 12 — exactement la pente que le banc mesurait au module 1."
            explainFor={(n) =>
              n === 4
                ? 'C’est ce que le geste naïf annonçait au module 1, et le banc a montré qu’il rate. Ici il y a DEUX termes à additionner : 8 puis 4.'
                : n === 8
                ? 'C’est le premier terme seul, celui de la ligne précédente. Il en manque un second : u(2) × v′(2) = 4 × 1 = 4.'
                : null
            }
            solved={q2b}
            onAnswered={() => setQ2b(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                <strong>12.</strong> C’est très exactement ce que le banc mesurait, là où le geste
                naïf annonçait 4. Retourne l’assemblage ci-dessous et change le point de mesure :
                la vraie pente vaut 3x², et u′v + uv′ la redonne à chaque fois.
              </Feedback>
              <BancDeCartes
                gauche="carre"
                droite="identite"
                op="produit"
                x={x2}
                onChangeX={setX2}
                operateursDisponibles={['produit']}
                retourne={ret2}
                onRetourner={() => setRet2(true)}
              />
              <KnowledgeBrick
                id="regle-produit"
                variant="new"
                lead={<>La règle que tu viens de reconstruire et de vérifier.</>}
              />
              <KnowledgeBrick
                id="mem-produit"
                variant="new"
                lead={<>La forme courte, à garder en tête.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Trois produits à dériver',
      done: done3,
      content: (
        <BatchChoiceQuestion
          intro={<p>Applique u′v + uv′. Un conseil : nomme u et v avant d’écrire quoi que ce soit.</p>}
          rows={[
            {
              id: 'p1',
              label: 'f(x) = x²·√x',
              options: ['2x√x + x²/(2√x)', '2x/(2√x)', 'x²/(2√x)'],
              correct: 0,
              correction: 'u = x², v = √x : u′v = 2x√x, et uv′ = x² × 1/(2√x). On additionne les DEUX.',
            },
            {
              id: 'p2',
              label: 'g(x) = (2x + 1)(x² − 3)',
              options: ['2(x² − 3) + (2x + 1)·2x', '2 × 2x', '(2x + 1) + (x² − 3)'],
              correct: 0,
              correction: 'u = 2x + 1 donc u′ = 2 ; v = x² − 3 donc v′ = 2x. Puis u′v + uv′.',
            },
            {
              id: 'p3',
              label: 'h(x) = 4x³ (un nombre multiplie)',
              options: ['12x²', '0', '4 + 3x²'],
              correct: 0,
              correction: 'Ici pas besoin de la règle du produit : 4 est un NOMBRE, il traverse. 4 × 3x² = 12x².',
            },
          ]}
          requires={['regle-produit', 'mem-produit', 'regle-somme-et-reel', 'derivees-usuelles']}
          feedback={({ allRight }) =>
            allRight ? (
              <>Et le troisième rappelle l’essentiel : un NOMBRE qui multiplie traverse, seule une FONCTION qui multiplie appelle la règle du produit.</>
            ) : (
              <>Deux termes, toujours. Et attention au troisième : 4x³ n’est pas un produit de deux fonctions — 4 est un nombre, il reste devant.</>
            )
          }
          solved={done3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="La somme, le réel… et le produit"
      moduleSubtitle="Deux opérations qui se laissent traverser, une qui exige sa règle"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Recoller correctement',
        tone: 'indigo',
        body: (
          <p>
            Le module 1 a laissé une question ouverte : comment recoller deux cartes retournées
            quand elles sont multipliées ? On commence par les deux cas faciles, puis on
            reconstruit celui qui résistait.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Il reste deux formes.</strong> Une fraction dont le bas contient x, et une
          parenthèse élevée à une puissance. Module suivant : la fraction.
        </KnowledgeSnapshot>
      }
    />
  );
}
