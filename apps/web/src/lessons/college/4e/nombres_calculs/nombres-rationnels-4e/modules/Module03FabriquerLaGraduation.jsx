import React, { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { FractionView, FractionField } from '../../../../../common/algebra4e';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GraduationLab, { tombeJuste } from '../components/GraduationLab';
import { q, somme, difference, denominateurCommun, surDenominateurCommun, diagnostiquerSomme } from '../components/rationnels4e';

/**
 * Module 3 — MANIPULATION : fabriquer le dénominateur commun, puis additionner
 * et soustraire des dénominateurs quelconques.
 *
 * Activity              choisir en combien de parts couper l'unité, jusqu'à ce
 *                       que les DEUX fractions tombent sur une marque.
 * Mathematical objective on n'additionne que des parts de MÊME TAILLE. En 5e
 *                       la graduation commune était donnée (un dénominateur
 *                       multiple de l'autre) ; ici elle doit être FABRIQUÉE.
 * Student action        −/+ sur le nombre de parts.
 * Controlled variable   le dénominateur candidat, seul.
 * Visual consequence    une barre devient verte quand sa fraction tombe juste,
 *                       et montre alors ses parts remplies ; sinon un repère
 *                       rouge montre qu'elle tombe entre deux marques.
 * Expected observation  « 12 va pour les deux ; 10 ne va pour aucune » — donc
 *                       additionner les dénominateurs (4 + 6 = 10) ne peut pas
 *                       être la bonne opération, ça se VOIT.
 * Misconception targeted « 1/4 + 1/6 = 2/10 ».
 * Formalization         la méthode est nommée à l'étape 2, une fois la
 *                       graduation trouvée à la main.
 */
const A = q(1, 4);
const B = q(1, 6);

export default function Module03FabriquerLaGraduation() {
  // Étape 1 — chercher la graduation commune. On part de 5 : ni 4 ni 6 ne le
  // divisent, et 5 n'est pas non plus 4+6 — l'élève doit vraiment chercher.
  const [parts, setParts] = useState(5);
  const [trouve, setTrouve] = useState(false);
  const commun = denominateurCommun(A, B);

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const [reA, reB] = surDenominateurCommun(A, B);

  const steps = [
    {
      num: 1,
      title: 'Trouve une graduation qui va aux deux',
      subtitle: 'Un quart et un sixième n’ont pas la même taille de part. Coupe l’unité jusqu’à ce que les deux tombent sur une marque.',
      done: trouve,
      content: (kit) => (
        <div className="space-y-3">
          <GraduationLab
            a={A}
            b={B}
            candidat={parts}
            onCandidat={(n) => {
              setParts(n);
              if (tombeJuste(A, n) && tombeJuste(B, n) && !trouve) {
                setTrouve(true);
                kit.react(true);
              }
            }}
          />
          {trouve ? (
            <Feedback tone="ok">
              Avec <strong>{commun}</strong> parts, les deux fractions tombent juste :{' '}
              <FractionView value={A} size="sm" tone="indigo" /> devient{' '}
              <FractionView value={reA.frac} size="sm" tone="indigo" /> (×{reA.facteur}) et{' '}
              <FractionView value={B} size="sm" tone="violet" /> devient{' '}
              <FractionView value={reB.frac} size="sm" tone="violet" /> (×{reB.facteur}). Les parts
              ont enfin la même taille — on peut les compter. Continue à jouer avec le bouton : 24
              marche aussi, mais donne des nombres plus grands.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Une barre verte veut dire « cette fraction tombe pile sur une marque ». Il en faut{' '}
              <strong>deux</strong> vertes en même temps.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Compte les parts',
      subtitle: 'Maintenant que les parts ont la même taille, l’addition redevient un simple comptage.',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="denominateur-commun"
            variant="new"
            lead={<>Tu viens de fabriquer à la main la graduation qui allait aux deux fractions. C’est exactement ce qu’on fait avant toute addition.</>}
          />
          <FractionField
            prompt={
              <span className="inline-flex flex-wrap items-center gap-1.5">
                Combien fait
                <FractionView value={A} size="sm" tone="indigo" />
                <span className="font-black">+</span>
                <FractionView value={B} size="sm" tone="violet" />
                <span>?</span>
              </span>
            }
            above={
              <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-sm text-slate-700">
                Rappel de ce que tu viens de trouver :{' '}
                <FractionView value={reA.frac} size="sm" tone="indigo" /> et{' '}
                <FractionView value={reB.frac} size="sm" tone="violet" />, sur{' '}
                <strong>{commun}</strong> parts chacune.
              </div>
            }
            expected={somme(A, B)}
            allowNegative={false}
            requires={['denominateur-commun']}
            explain="Sur douzièmes : 3 parts plus 2 parts font 5 parts. La taille des parts ne change pas — seul leur nombre s’ajoute."
            explainFor={(rep) => {
              const code = diagnostiquerSomme(A, B, rep);
              if (code === 'somme-des-deux-termes') {
                return "Tu as ajouté les dénominateurs : 1+1 sur 4+6. Or 4 et 6 ne comptent pas des parts, ils disent leur TAILLE — additionner des tailles n’a pas de sens. Regarde les barres : une graduation en 10 parts ne convenait à aucune des deux fractions.";
              }
              if (code === 'oubli-regraduation') {
                return "Tu as ajouté les numérateurs sans re-graduer d’abord : 1 quart et 1 sixième ne sont pas des parts de même taille, on ne peut pas encore les compter ensemble.";
              }
              if (code === 'a-multiplie') {
                return "C’est le produit que tu as calculé. Ici on RÉUNIT deux quantités, on n’en prend pas une part d’une autre.";
              }
              return "Il fallait d’abord réécrire les deux fractions en douzièmes (3/12 et 2/12), puis compter les parts : 3 + 2 = 5.";
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et pour soustraire ?',
      subtitle: 'Exactement le même début — seule la dernière opération change.',
      done: q3,
      content: (
        <div className="space-y-3">
          <FractionField
            prompt={
              <span className="inline-flex flex-wrap items-center gap-1.5">
                Combien fait
                <FractionView value={q(3, 4)} size="sm" tone="indigo" />
                <span className="font-black">−</span>
                <FractionView value={q(2, 3)} size="sm" tone="violet" />
                <span>?</span>
              </span>
            }
            expected={difference(q(3, 4), q(2, 3))}
            allowNegative
            requires={['denominateur-commun']}
            explain="Sur douzièmes : 3/4 = 9/12 et 2/3 = 8/12. Il reste 9 − 8 = 1 part, donc 1/12. Un résultat tout petit — et c’est normal, les deux nombres étaient proches."
            explainFor={(rep) => {
              if (rep.d === 1) {
                return "Attention : le résultat est une fraction, pas un entier. Réécris d’abord les deux nombres en douzièmes.";
              }
              return "Même méthode que pour l’addition : d’abord la graduation commune (12), ensuite seulement le calcul sur les numérateurs — 9 − 8 = 1.";
            }}
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
      moduleTitle="Fabriquer la graduation"
      moduleSubtitle="Quand aucun dénominateur ne va, on en construit un"
      estimatedTime="13 min"
      brief={{
        tag: 'Manipulation',
        title: 'Des parts qui ne se ressemblent pas',
        tone: 'indigo',
        body: (
          <p>
            En 5e, tu additionnais des fractions quand un dénominateur était multiple de l’autre —
            la graduation commune était <strong>déjà là</strong>. Un quart et un sixième n’ont pas
            cette chance : il va falloir en <strong>fabriquer</strong> une.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
