import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TableauDeLoi } from '../components/WheelLab';
import {
  GROS_LOT_DEFAUT, NB_SECTEURS, loiDeLaRoue, secteursDeLaRoue, euros, fr,
} from '../components/roueUtils';

/**
 * Module 3 — DÉCOUVERTE : la loi de probabilité, et le tableau qui la porte.
 *
 * Étape 1  regrouper : quatre secteurs gris ne font qu'UNE ligne du tableau, et
 *          leur probabilité est 4/10. L'élève calcule la probabilité de chaque
 *          ligne, une par une.
 * Étape 2  le contrôle qui ne trompe pas : la somme de la seconde ligne. On la
 *          fait CALCULER avant de la nommer règle.
 * Étape 3  s'en servir : retrouver une probabilité manquante par la somme, et
 *          repérer un tableau faux.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 comptage mené → brique
 * `loi-de-probabilite` ; étape 2 somme calculée → brique
 * `somme-des-probabilites-vaut-1` puis `tableau-de-loi` ; étape 3 les demandes,
 * légitimes.
 *
 * PAS DE MANIPULATION GELÉE : ce module n'a pas de laboratoire à figer — le
 * tableau est une figure, pas un instrument. Aucun `disabled` n'y porte sur une
 * manipulation.
 */
export default function Module03LaLoiEtSonTableau() {
  const [pA, setPA] = useState(false);
  const [pB, setPB] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const loi = loiDeLaRoue(GROS_LOT_DEFAUT);
  const secteurs = secteursDeLaRoue(GROS_LOT_DEFAUT);
  const done1 = pA && pB;

  const steps = [
    {
      num: 1,
      title: 'Regrouper, puis compter',
      subtitle:
        'Les dix secteurs ont tous la même taille, donc la même chance. Quatre paient 0 €, quatre paient 1 €, deux paient 5 €. À toi de donner les probabilités.',
      done: done1,
      content: (
        <div className="space-y-3">
          <ul className="rounded-xl border border-sky-100 bg-white p-3 space-y-1.5 text-sm">
            {secteurs.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: s.couleur }} aria-hidden="true" />
                <span className="text-slate-600">{s.effectif} secteurs sur {NB_SECTEURS} paient</span>
                <strong className="font-mono tabular-nums">{euros(s.gain)}</strong>
              </li>
            ))}
          </ul>
          <NumericQuestion
            prompt={<>Quelle est la probabilité que X vaille <strong>0 €</strong> ? Réponds sous forme décimale.</>}
            expected={0.4}
            parse={parseDec}
            display="0,4"
            requires={['probabilite', 'proportion-reference', 'variable-aleatoire']}
            explain="Quatre secteurs sur dix conviennent, et les dix ont la même taille : P(X = 0) = 4/10 = 0,4."
            explainFor={(n) =>
              n === 4
                ? 'C’est le nombre de secteurs, pas la probabilité : il reste à le rapporter au total, 4 ÷ 10 = 0,4.'
                : n === 0.1
                ? 'C’est la probabilité d’UN secteur. Quatre secteurs conviennent, donc quatre fois 0,1 : 0,4.'
                : null
            }
            solved={pA}
            onAnswered={() => setPA(true)}
          />
          <NumericQuestion
            prompt={<>Et la probabilité que X vaille <strong>{euros(GROS_LOT_DEFAUT)}</strong> ?</>}
            expected={0.2}
            parse={parseDec}
            display="0,2"
            requires={['probabilite', 'proportion-reference', 'variable-aleatoire']}
            explain="Deux secteurs sur dix : P(X = 5) = 2/10 = 0,2. C’est la valeur la plus rare, et de loin la plus grosse."
            explainFor={(n) =>
              n === 0.25
                ? 'Tu as rapporté les 2 secteurs aux 8 autres au lieu du total. Le tout de référence, ce sont les DIX secteurs : 2 ÷ 10 = 0,2.'
                : n === 5
                ? 'C’est le montant du lot, pas sa probabilité. Compte les secteurs qui le portent : 2 sur 10.'
                : null
            }
            solved={pB}
            onAnswered={() => setPB(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Quatre secteurs gris réunis en <strong>une seule ligne</strong> de probabilité 0,4.
                On ne liste pas les issues : on les regroupe par valeur, et l’on additionne leurs
                probabilités.
              </Feedback>
              <KnowledgeBrick
                id="loi-de-probabilite"
                variant="new"
                lead={<>Ce que tu viens de construire porte un nom.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le contrôle qui ne trompe pas',
      subtitle: 'Additionne les trois probabilités que tu viens d’établir : 0,4 puis 0,4 puis 0,2.',
      done: q2,
      content: (
        <div className="space-y-3">
          <TableauDeLoi loi={loi} titre="La loi de X sur la roue" avecTotal={false} />
          <NumericQuestion
            prompt={<>Combien vaut <strong>0,4 + 0,4 + 0,2</strong> ?</>}
            expected={1}
            parse={parseDec}
            display="1"
            requires={['loi-de-probabilite', 'somme-branches']}
            explain="1 exactement. Ce n’est pas un hasard de cette roue : à chaque lancer, une valeur et une seule se réalise, donc les probabilités des valeurs se partagent la totalité."
            explainFor={(n) => (n === 10 ? 'Tu as additionné les NOMBRES DE SECTEURS (4 + 4 + 2 = 10). Additionne les probabilités : 0,4 + 0,4 + 0,2.' : null)}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                <strong>1</strong>, toujours. C’est le premier contrôle à faire sur un tableau : une
                somme différente de 1 signale une valeur oubliée ou une probabilité fausse.
              </Feedback>
              <KnowledgeBrick
                id="somme-des-probabilites-vaut-1"
                variant="new"
                lead={<>La règle que ton addition vient de vérifier.</>}
              />
              <KnowledgeBrick
                id="tableau-de-loi"
                variant="new"
                compact
                lead={<>Et les quatre gestes pour dresser le tableau, dans l’ordre.</>}
              />
              <TableauDeLoi loi={loi} titre="Le tableau complet, avec son total" />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'S’en servir',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p>
                Trois tableaux à juger. Rappel : les probabilités d’une même variable aléatoire
                doivent sommer à 1.
              </p>
            }
            rows={[
              {
                id: 'l1',
                label: 'X vaut 0 avec 0,5 ; 2 avec 0,3 ; 10 avec … — que vaut la case manquante ?',
                options: ['0,2', '0,8', '0,5'],
                correct: 0,
                correction: '1 − 0,5 − 0,3 = 0,2. La somme doit faire 1.',
              },
              {
                id: 'l2',
                label: 'X vaut 1 avec 0,4 ; 3 avec 0,4 ; 7 avec 0,4 — ce tableau est…',
                options: ['Faux : la somme vaut 1,2', 'Juste', 'Faux : il manque une valeur'],
                correct: 0,
                correction: '0,4 × 3 = 1,2 ≠ 1. Le tableau est faux tel quel, sans qu’on ait besoin d’en savoir plus.',
              },
              {
                id: 'l3',
                label: 'Un sac contient six boules identiques numérotées de 1 à 6 ; X = le numéro tiré. Que vaut P(X = 4) ?',
                options: ['1/6', '4/6', '1/4'],
                correct: 0,
                correction: 'Une seule boule porte le 4, sur six boules qui ont toutes la même chance : 1/6. Le numéro écrit sur la boule n’intervient pas dans sa probabilité.',
              },
            ]}
            requires={['loi-de-probabilite', 'somme-des-probabilites-vaut-1', 'tableau-de-loi']}
            feedback={({ allRight }) =>
              allRight ? (
                <>
                  La somme à 1 sert deux fois : à retrouver une case manquante, et à détecter un
                  tableau faux sans rien connaître de l’expérience.
                </>
              ) : (
                <>
                  Vérifie d’abord la somme de chaque tableau. Si elle ne fait pas 1, le tableau est
                  faux ; si une case manque, elle vaut 1 moins la somme des autres.
                </>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="La loi et son tableau"
      moduleSubtitle="Regrouper, compter, diviser — et vérifier que la somme fait 1"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Chaque valeur, avec sa chance',
        tone: 'indigo',
        body: (
          <p>
            On sait quelles valeurs X peut prendre. Il reste à dire avec quelles chances — et à les
            ranger dans un tableau qui se contrôle d’un coup d’œil.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Le tableau est prêt.</strong> C’est de lui, et de lui seul, que se calcule la
          ligne du module 1. Module suivant : comment.
        </KnowledgeSnapshot>
      }
    />
  );
}
