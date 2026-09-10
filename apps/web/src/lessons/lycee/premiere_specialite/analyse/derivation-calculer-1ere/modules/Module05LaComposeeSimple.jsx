import React, { useState } from 'react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConfrontationPente from '../components/ConfrontationPente';
import { composee, parseSigned, fr } from '../components/reglesUtils';

/**
 * Module 5 — ATELIER : la composée simple (ax + b)^n.
 *
 * Étape 1  l'oubli du facteur intérieur, MESURÉ : sur (3x − 2)⁴ en x = 1, la
 *          candidate « je dérive la puissance seule » annonce 4 quand la pente
 *          vaut 12. Trois fois moins — et 3 est exactement le coefficient de x
 *          dans la parenthèse. C'est la trace de l'intérieur.
 * Étape 2  la règle posée et appliquée, y compris avec un a négatif.
 * Étape 3  quatre composées à dériver, dont un piège où a = 1 (l'oubli devient
 *          invisible) et un où l'expression n'est PAS une composée.
 *
 * PÉRIMÈTRE : (ax + b)^n et u^n seulement. `composee` REFUSE n non entier ou
 * a nul — le périmètre est codé, pas commenté.
 *
 * CONNAISSANCES AVANT LA DEMANDE : geste (étape 1) → brique (fin d'étape 2) →
 * demandes (étape 3).
 *
 * MANIPULATION JAMAIS GELÉE : le point de mesure reste réglable après
 * validation. `disabled` ne porte que le verrou d'antériorité.
 */
export default function Module05LaComposeeSimple() {
  const [x1, setX1] = useState(1);
  const [mesure1, setMesure1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = mesure1;
  const done2 = q2;
  const done3 = q3;

  const c = composee({ a: 3, b: -2, n: 4 });

  const steps = [
    {
      num: 1,
      title: 'La trace de l’intérieur',
      subtitle:
        '(3x − 2)⁴ n’est ni une somme, ni un produit de deux fonctions, ni une fraction. La candidate évidente : dériver la puissance et laisser la parenthèse tranquille. Mesure.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <ConfrontationPente
            titre="Une parenthèse élevée à une puissance"
            expression="f(x) = (3x − 2)⁴"
            objet={c}
            labelNaif="la puissance seule : 4(3x − 2)³"
            labelJuste="mesurée sur la courbe, sans aucune règle"
            x={x1}
            points={[0, 1, 2]}
            onChangeX={setX1}
            mesure={mesure1}
            onMesurer={() => {
              if (!mesure1) kit.react?.(true);
              setMesure1(true);
            }}
          />
          {done1 && (
            <Feedback tone="ko">
              En x = 1, la candidate annonce <strong>4</strong> quand la pente vaut{' '}
              <strong>12</strong>. Exactement <strong>3 fois</strong> plus — et 3 est le nombre
              qui multiplie x dans la parenthèse. Change de point : le rapport reste 3, toujours.
              L’intérieur laisse une trace, et cette trace est un facteur.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La règle, et un a négatif',
      subtitle:
        'On dérive la puissance comme d’habitude, puis on multiplie par la dérivée de l’intérieur.',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p className="font-mono text-center text-[15px]">((ax + b)ⁿ)′ = n · a · (ax + b)ⁿ⁻¹</p>
            <p>
              Sur (3x − 2)⁴ : d’abord 4(3x − 2)³, puis × 3, soit <strong className="font-mono">12(3x − 2)³</strong>.
              En x = 1 : 12 × 1³ = 12. ✔
            </p>
          </div>
          <NumericQuestion
            prompt={<>Pour g(x) = (−2x + 5)³, que vaut <strong>g′(2)</strong> ?</>}
            expected={-6}
            parse={parseSigned(parseDec)}
            display="−6"
            requires={['derivees-usuelles', 'regle-somme-et-reel']}
            explain="g′(x) = 3 × (−2) × (−2x + 5)² = −6(−2x + 5)². En x = 2 : −2 × 2 + 5 = 1, donc −6 × 1² = −6. Le signe vient du a, qui est négatif."
            explainFor={(n) =>
              n === 3
                ? 'Tu as oublié le facteur intérieur : il vaut −2, et il apporte à la fois le 2 et le signe. 3 × (−2) = −6.'
                : n === 6
                ? 'Le bon nombre, mais pas le bon signe : le facteur intérieur vaut −2, pas 2.'
                : n === -12
                ? 'Attention à la valeur de la parenthèse : en x = 2, −2 × 2 + 5 = 1, et 1² = 1. Le résultat est donc −6 × 1 = −6.'
                : null
            }
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                Le facteur intérieur porte aussi le <strong>signe</strong>. Reviens à l’étape 1 et
                promène le point de mesure : le rapport entre la candidate et la vraie pente vaut
                toujours a.
              </Feedback>
              <KnowledgeBrick
                id="regle-composee-simple"
                variant="new"
                lead={<>La règle que la mesure vient d’imposer, dans sa forme générale.</>}
              />
              <KnowledgeBrick
                id="mem-composee"
                variant="new"
                lead={<>La forme courte.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quatre expressions, un piège',
      done: done3,
      content: (
        <BatchChoiceQuestion
          intro={<p>Deux d’entre elles ne sont PAS des emboîtements. Regarde la structure avant de calculer.</p>}
          rows={[
            {
              id: 'k1',
              label: 'f(x) = (5x + 1)³',
              options: ['15(5x + 1)²', '3(5x + 1)²', '(5x + 1)²'],
              correct: 0,
              correction: '3 × 5 = 15, puis la parenthèse à la puissance 2. Le 5 vient de l’intérieur.',
            },
            {
              id: 'k2',
              label: 'g(x) = (x + 7)⁵',
              options: ['5(x + 7)⁴', '(x + 7)⁴', '35(x + 7)⁴'],
              correct: 0,
              correction: 'Ici a = 1 : le facteur intérieur vaut 1, donc il ne se voit pas. C’est le seul cas où l’oublier ne se paie pas — raison de plus pour l’écrire toujours.',
            },
            {
              id: 'k3',
              label: 'h(x) = 2x³ + 1',
              options: ['6x²', '3(2x³ + 1)²', '6x² + 1'],
              correct: 0,
              correction: 'Ce n’est PAS un emboîtement : c’est une somme de deux termes. On dérive terme par terme, et le 1 s’efface.',
            },
            {
              id: 'k4',
              label: 'k(x) = (4 − x)²',
              options: ['−2(4 − x)', '2(4 − x)', '−2'],
              correct: 0,
              correction: 'Le coefficient de x dans la parenthèse est −1 : 2 × (−1) = −2, puis (4 − x) à la puissance 1.',
            },
          ]}
          requires={['regle-composee-simple', 'mem-composee', 'regle-somme-et-reel', 'derivees-usuelles']}
          feedback={({ allRight }) =>
            allRight ? (
              <>Et le vrai réflexe est celui de la troisième ligne : reconnaître la structure AVANT de choisir une règle.</>
            ) : (
              <>Deux pièges : oublier le facteur intérieur (il vaut 5, puis 1, puis −1 selon les lignes), et appliquer l’emboîtement à une expression qui n’en est pas un — 2x³ + 1 est une somme.</>
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
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La composée simple"
      moduleSubtitle="Une parenthèse élevée à une puissance, et un facteur qu’on oublie"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Ce que l’intérieur laisse derrière lui',
        tone: 'indigo',
        body: (
          <p>
            (3x − 2)⁴ : développer serait long et inutile. Il y a une façon directe — à condition
            de ne pas perdre en route ce que la parenthèse contient.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Les cinq règles sont là.</strong> Le vrai travail commence : devant une
          expression quelconque, savoir DE QUELLE règle il s’agit. Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
