import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ATELIER, parseSigned } from '../components/reglesUtils';

/**
 * Module 6 — ATELIER MIXTE : reconnaître la règle avant de calculer.
 *
 * Étape 1  TRIER : cinq expressions, cinq structures. On ne calcule rien —
 *          on nomme la règle. C'est le geste qui manque le plus souvent, et
 *          c'est lui qui décide de tout ce qui suit. Brique
 *          `methode-choisir-la-regle` posée APRÈS ce tri.
 * Étape 2  calculer une valeur sur chacune des deux règles les plus fragiles.
 *
 * Les cinq expressions et leurs dérivées viennent d'`ATELIER`, dont le test
 * vérifie que CHAQUE dérivée annoncée redonne la définition. Aucun texte
 * mathématique de ce module n'est cru sur parole.
 */
export default function Module06AtelierMixte() {
  const [q1, setQ1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);

  const done1 = q1;
  const done2 = q2a && q2b;

  const parRegle = Object.fromEntries(ATELIER.map((a) => [a.id, a]));

  const steps = [
    {
      num: 1,
      title: 'Trier avant de calculer',
      subtitle:
        'Cinq expressions. Pour chacune, ne donne pas la dérivée : donne la RÈGLE qui s’applique. C’est la décision qui compte.',
      done: done1,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p>De quelle structure s’agit-il ?</p>}
            rows={[
              {
                id: 'r1',
                label: parRegle.a1.expr,
                options: ['Somme de termes → terme par terme', 'Produit de deux fonctions', 'Emboîtement'],
                correct: 0,
                correction: 'Trois termes séparés par + et −. Les 3 et 5 sont des NOMBRES : ils traversent. → 6x + 5.',
              },
              {
                id: 'r2',
                label: parRegle.a2.expr,
                options: ['Produit de deux fonctions → u′v + uv′', 'Somme de termes', 'Fraction'],
                correct: 0,
                correction: 'Deux parenthèses qui contiennent chacune x, multipliées. u = 2x + 1, v = x² − 3.',
              },
              {
                id: 'r3',
                label: parRegle.a3.expr,
                options: ['Fraction dont le bas contient x → (u′v − uv′)/v²', 'Produit', 'Emboîtement'],
                correct: 0,
                correction: 'Le dénominateur contient x : c’est la règle du quotient. u = x, v = x + 1.',
              },
              {
                id: 'r4',
                label: parRegle.a4.expr,
                options: ['Emboîtement → n·u′·uⁿ⁻¹', 'Produit', 'Somme de termes'],
                correct: 0,
                correction: 'Une parenthèse élevée à une puissance. Le facteur intérieur vaut 3.',
              },
              {
                id: 'r5',
                label: parRegle.a5.expr,
                options: ['Produit de deux fonctions → u′v + uv′', 'Emboîtement', 'Somme de termes'],
                correct: 0,
                correction: 'x et √x contiennent tous deux x : c’est bien un produit de deux FONCTIONS, pas un nombre qui multiplie.',
              },
            ]}
            requires={['regle-somme-et-reel', 'regle-produit', 'regle-quotient', 'regle-composee-simple', 'derivees-usuelles']}
            feedback={({ allRight }) =>
              allRight ? (
                <>Cinq structures reconnues sans avoir calculé une seule dérivée. C’est la moitié du travail.</>
              ) : (
                <>Le partage se fait sur une seule question : qu’est-ce qui contient x ? Si les deux facteurs en contiennent, c’est un produit. Si c’est un nombre qui multiplie, ce n’en est pas un.</>
              )
            }
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Le tri d’abord, le calcul ensuite. Une erreur de règle coûte toujours plus cher
                qu’une erreur de calcul.
              </Feedback>
              <KnowledgeBrick
                id="methode-choisir-la-regle"
                variant="new"
                lead={<>Le tri que tu viens de faire, en quatre questions.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Les deux règles les plus fragiles',
      subtitle: 'Le produit et l’emboîtement : ce sont eux qui perdent un terme ou un facteur.',
      done: done2,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Pour g(x) = (2x + 1)(x² − 3), on trouve g′(x) = 6x² + 2x − 6. Que vaut <strong>g′(1)</strong> ?</>}
            expected={2}
            parse={parseSigned(parseDec)}
            display="2"
            requires={['regle-produit', 'mem-produit']}
            explain="6 + 2 − 6 = 2. Vérification par une autre route : (2x + 1)(x² − 3) se développe en 2x³ + x² − 6x − 3, dont la dérivée terme par terme est bien 6x² + 2x − 6."
            explainFor={(n) =>
              n === 4
                ? 'Attention au dernier terme : 6 × 1² + 2 × 1 − 6 = 2, pas 4. Le −6 se soustrait.'
                : n === -4
                ? 'C’est g(1) = 3 × (−2) = −6… ou une erreur de signe. Reprends : 6 + 2 − 6.'
                : null
            }
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          <NumericQuestion
            prompt={<>Pour k(x) = (3x − 2)⁴, on trouve k′(x) = 12(3x − 2)³. Que vaut <strong>k′(2)</strong> ?</>}
            expected={768}
            parse={parseSigned(parseDec)}
            display="768"
            requires={['regle-composee-simple', 'mem-composee']}
            explain="3 × 2 − 2 = 4, et 4³ = 64. Donc 12 × 64 = 768."
            explainFor={(n) =>
              n === 256
                ? 'Tu as oublié le facteur intérieur : 4 × 64 = 256 au lieu de 12 × 64 = 768. Il manque le 3.'
                : n === 64
                ? 'C’est la parenthèse au cube, sans le coefficient 12 qui la précède.'
                : null
            }
            solved={q2b}
            onAnswered={() => setQ2b(true)}
          />
          {done2 && (
            <Feedback tone="ok">
              Les deux fautes les plus fréquentes de toute la leçon : oublier le second terme d’un
              produit, et perdre le facteur intérieur d’un emboîtement. Tu viens d’éviter les deux.
            </Feedback>
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
      moduleTitle="Atelier mixte"
      moduleSubtitle="Reconnaître la règle est le vrai travail"
      estimatedTime="8 min"
      brief={{
        tag: 'Atelier',
        title: 'De quelle règle s’agit-il ?',
        tone: 'indigo',
        body: (
          <p>
            En contrôle, personne n’annonce quelle règle utiliser. C’est à la structure de
            l’expression de le dire — et elle le dit toujours, si l’on prend le temps de regarder.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tout est en place.</strong> Dix épreuves pour le prouver : reconnaître la
          structure, appliquer la bonne règle, ne rien perdre en route.
        </KnowledgeSnapshot>
      }
    />
  );
}
