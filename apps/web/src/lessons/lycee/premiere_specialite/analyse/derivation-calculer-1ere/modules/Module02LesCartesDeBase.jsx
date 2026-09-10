import React, { useState } from 'react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TableDesTaux from '../components/TableDesTaux';
import { parseSigned } from '../components/reglesUtils';

/**
 * Module 2 — DÉCOUVERTE : le dos des cartes se découvre, il ne se récite pas.
 *
 * Étape 1  x³ en plusieurs points : la table des taux se pose sur 3, 12, 27,
 *          48 — soit 3 × a². L'élève LIT la régularité avant qu'on l'écrive.
 * Étape 2  1/x et √x : deux cartes dont le dos ne se devine pas, et dont la
 *          table donne le résultat. La brique `derivees-usuelles` est posée ICI,
 *          après les deux gestes, et la mémorisation (xⁿ)′ juste après.
 * Étape 3  appliquer sur cinq cartes.
 *
 * `parseSigned` et non `parseDec` nu : la leçon AFFICHE « −0,25 » avec le vrai
 * signe moins U+2212, que `parseDec` refuse. Sans lui, une réponse juste
 * recopiée depuis l'écran serait déclarée fausse.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étapes 1 et 2 = gestes et constats ; la
 * brique tombe à la fin de l'étape 2 ; l'étape 3 est la demande légitime.
 *
 * MANIPULATION JAMAIS GELÉE : les deux tables restent pilotables. `disabled`
 * ne porte que le verrou d'antériorité.
 */
export default function Module02LesCartesDeBase() {
  const [aCube, setACube] = useState(2);
  const [q1, setQ1] = useState(false);

  const [carte2, setCarte2] = useState('inverse');
  const [a2, setA2] = useState(2);
  const [q2, setQ2] = useState(false);

  const [q3, setQ3] = useState(false);

  const done1 = q1;
  const done2 = q2;
  const done3 = q3;

  const steps = [
    {
      num: 1,
      title: 'D’où vient le dos de la carte x³ ?',
      subtitle:
        'Change le point et regarde la colonne de taux se tasser. En a = 2 elle se pose sur un nombre entier : lequel ?',
      done: done1,
      content: (
        <div className="space-y-3">
          <TableDesTaux
            carteId="cube"
            a={aCube}
            onChangeA={setACube}
            points={[1, 2, 3, 4]}
            cartesDisponibles={['cube']}
            revelerExact={done1}
          />
          <NumericQuestion
            prompt={<>En <strong>a = 2</strong>, sur quel nombre les taux se posent-ils ?</>}
            expected={12}
            parse={parseSigned(parseDec)}
            display="12"
            requires={['methode-calculer-nombre-derive', 'taux-variation-secante']}
            explain="12,61 puis 12,06 puis 12,006 : les taux se posent sur 12. Or 3 × 2² = 12 — et en a = 3 ils se posent sur 27, qui vaut 3 × 3². La régularité est n × a^(n−1)."
            explainFor={(n) =>
              n === 8
                ? 'C’est 2³, l’ordonnée du point — pas la pente. Regarde la colonne : elle se pose bien plus haut.'
                : n === 12.61
                ? 'C’est le taux pour le plus GRAND écart. Continue de lire la ligne vers la droite : les écarts rétrécissent et les taux se tassent sur un nombre rond.'
                : null
            }
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <Feedback tone="ok">
              En a = 1 → 3, en a = 2 → 12, en a = 3 → 27, en a = 4 → 48. Ce sont exactement
              3 × 1², 3 × 2², 3 × 3², 3 × 4². <strong>L’exposant descend devant, et il diminue
              de 1.</strong> Promène le point pour le revoir.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux cartes qui ne se devinent pas',
      subtitle:
        'Retourne 1/x, puis √x. Leurs dos ne suivent pas la même écriture — mais la table, elle, donne le nombre.',
      done: done2,
      content: (
        <div className="space-y-3">
          <TableDesTaux
            carteId={carte2}
            a={a2}
            onChangeCarte={setCarte2}
            onChangeA={setA2}
            points={[1, 2, 4]}
            cartesDisponibles={['inverse', 'racine']}
            revelerExact={done2}
            disabled={!done1}
          />
          <NumericQuestion
            prompt={<>Pour <strong>1/x en a = 2</strong>, sur quel nombre les taux se posent-ils ?</>}
            expected={-0.25}
            parse={parseSigned(parseDec)}
            display="−0,25"
            requires={['methode-calculer-nombre-derive']}
            explain="Les taux valent −0,2381 puis −0,24876 puis −0,24988 : ils se posent sur −0,25, c’est-à-dire −1/4. Et −1/a² en a = 2 donne bien −1/4."
            explainFor={(n) =>
              n === 0.25
                ? 'Le bon nombre, mais le mauvais signe : la colonne affiche des valeurs NÉGATIVES. La fonction 1/x descend, donc sa pente est négative.'
                : n === 0.5
                ? 'C’est 1/a, l’ordonnée du point — pas la pente. La colonne se pose sur −0,25.'
                : null
            }
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                1/x se pose sur <strong>−1/x²</strong> et √x sur <strong>1/(2√x)</strong> —
                sélectionne √x en a = 4 pour voir la colonne se poser sur 0,25. Ces cinq dos, on
                les garde une fois pour toutes.
              </Feedback>
              <KnowledgeBrick
                id="derivees-usuelles"
                variant="new"
                lead={<>Le dos de chaque carte, avec l’ensemble où il vaut. Reretourne-les en le lisant.</>}
              />
              <KnowledgeBrick
                id="mem-x-puissance-n"
                variant="new"
                lead={<>Et la seule à retenir par cœur.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Cinq cartes à retourner',
      done: done3,
      content: (
        <BatchChoiceQuestion
          intro={<p>Sans repasser par la table : donne le dos de chaque carte.</p>}
          rows={[
            { id: 'c1', label: 'f(x) = x⁵', options: ['5x⁴', 'x⁴', '5x⁶'], correct: 0, correction: 'L’exposant descend devant (5) et diminue de 1 (x⁴).' },
            { id: 'c2', label: 'f(x) = x', options: ['1', 'x', '0'], correct: 0, correction: 'x, c’est x¹ : 1 × x⁰ = 1. La droite y = x monte d’une unité par unité.' },
            { id: 'c3', label: 'f(x) = 12', options: ['0', '12', '1'], correct: 0, correction: 'Une valeur qui ne change jamais a une pente nulle : la courbe est horizontale.' },
            { id: 'c4', label: 'f(x) = 1/x', options: ['−1/x²', '1/x²', '−1/x'], correct: 0, correction: 'Le signe compte : la table donnait des valeurs négatives.' },
            { id: 'c5', label: 'f(x) = √x', options: ['1/(2√x)', '2√x', '1/√x'], correct: 0, correction: 'En a = 4 : 1/(2 × 2) = 0,25, exactement ce que la colonne donnait.' },
          ]}
          requires={['derivees-usuelles', 'mem-x-puissance-n']}
          feedback={({ allRight }) =>
            allRight ? (
              <>Cinq cartes en main. Il reste à savoir comment les recoller entre elles — c’est le module suivant.</>
            ) : (
              <>Deux pièges reviennent : oublier de faire descendre l’exposant (x⁵ → 5x⁴, pas x⁴), et perdre le signe de 1/x, dont la pente est négative.</>
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
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Les cartes de base"
      moduleSubtitle="Le dos d’une carte se découvre, il ne se récite pas"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'D’où sortent ces dos ?',
        tone: 'indigo',
        body: (
          <p>
            Le banc affichait 2x, 3x², −1/x² comme s’ils allaient de soi. Ils ne vont pas de soi :
            chacun est ce vers quoi les taux se dirigent. On va les voir arriver.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Les cartes sont prêtes.</strong> Reste la question laissée ouverte : comment
          recoller deux cartes retournées ? Module suivant : le « + », le « × un nombre », et
          enfin le « × ».
        </KnowledgeSnapshot>
      }
    />
  );
}
