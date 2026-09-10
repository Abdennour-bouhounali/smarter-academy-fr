import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LaboCroissance from '../components/LaboCroissance';
import { EQUATIONS, resoudreEquationExp, parseSigned, fr } from '../components/reglesExpoUtils';

/**
 * Module 5 — ATELIER : résoudre une équation où les deux membres sont des
 * exponentielles.
 *
 * Étape 1  LE GESTE QUI JUSTIFIE TOUT. L'élève fait glisser le point M le long
 *          de la courbe pour le faire coïncider en HAUTEUR avec un point N
 *          fixé. Il n'y a qu'un seul endroit possible — parce que la courbe ne
 *          repasse jamais deux fois par la même hauteur. C'est la stricte
 *          croissance, ACQUISE en amont, remise sous les yeux comme argument.
 * Étape 2  ÉNONCER le passage e^u = e^v ⟺ u = v, et la brique qui le porte.
 * Étape 3  LA MÉTHODE, puis une équation résolue de bout en bout.
 * Étape 4  une seconde équation, où il faut d'abord REGROUPER avec les règles
 *          des modules 2 à 4.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → étape 2 briques
 * `egalite-des-exposants` puis `methode-resoudre-equation-exp` ; étapes 3 et 4
 * les demandes, désormais légitimes.
 *
 * MANIPULATION JAMAIS GELÉE : le laboratoire de l'étape 1 reste pilotable après
 * validation.
 */
export default function Module05ResoudreUneEquation() {
  const [u, setU] = useState(-1.5);
  const [vuCoincidence, setVuCoincidence] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  // La cible : N est fixé sur l'exposant 1, un cran ATTEIGNABLE (test).
  const V_CIBLE = 1;

  const done1 = vuCoincidence;

  const bouger = (x, react) => {
    setU(x);
    if (!vuCoincidence && Math.abs(x - V_CIBLE) < 1e-9) {
      setVuCoincidence(true);
      react?.(true);
    }
  };

  const eq1 = EQUATIONS[0];   // e^{x+3} = e^{2x+1}, solution 2
  const eq2 = EQUATIONS[1];   // e^{3x-1} = e^{x+5}, solution 3
  const res1 = resoudreEquationExp(eq1);
  const res2 = resoudreEquationExp(eq2);

  const steps = [
    {
      num: 1,
      title: 'Fais coïncider les deux hauteurs',
      subtitle:
        'Attrape le point M et fais-le courir le long de la courbe jusqu’à ce qu’il soit exactement à la même hauteur que N. Combien de positions y parviennent ?',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <LaboCroissance u={u} v={V_CIBLE} onChangeU={(x) => bouger(x, kit.react)} />
          {done1 ? (
            <Feedback tone="ok">
              Une seule position, et c’est celle où les deux exposants sont égaux. Continue de
              promener M : tu ne retrouveras jamais cette hauteur ailleurs. La raison est celle que
              tu connais déjà — la courbe <strong>monte toujours</strong>, sans jamais s’arrêter ni
              redescendre. Une hauteur donnée ne peut donc venir que d’un seul exposant.
            </Feedback>
          ) : (
            <Feedback tone="info">
              M est à l’exposant {fr(u)}, N à l’exposant {fr(V_CIBLE)}. Continue de faire glisser M
              jusqu’à ce que les deux traits pointillés se confondent.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que cela autorise',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Deux nombres u et v vérifient e^u = e^v. Que peut-on en conclure, et POURQUOI ?"
            options={[
              'u = v, parce que la fonction est strictement croissante et ne repasse jamais deux fois par la même hauteur',
              'u = v, parce que e^u = e^v se simplifie en enlevant les e des deux côtés',
              'u = v ou u = −v, comme pour un carré',
              'On ne peut rien conclure sans connaître la valeur commune',
            ]}
            correct={0}
            cols={1}
            requires={['exp-strictement-croissante', 'variations']}
            explain="La justification compte autant que la conclusion. Une fonction strictement croissante donne des valeurs différentes à des nombres différents : deux valeurs égales ne peuvent donc venir que du même nombre. Ce n’est pas une simplification d’écriture, c’est un raisonnement sur les variations."
            explainWrong="« Enlever les e » n’est pas un geste mathématique, et le carré n’est pas un bon modèle : x ↦ x² revient sur ses pas, elle prend deux fois la même valeur en 2 et en −2. L’exponentielle, elle, ne redescend jamais — tu viens de le vérifier en promenant M."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                Le laboratoire vient de le montrer : une hauteur, un seul exposant.
              </Feedback>
              <KnowledgeBrick
                id="egalite-des-exposants"
                variant="new"
                lead={<>Ce que la promenade de M a rendu évident, énoncé — avec sa justification.</>}
              />
              <KnowledgeBrick
                id="methode-resoudre-equation-exp"
                variant="new"
                lead={<>Les quatre pas à suivre, dans l’ordre.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Une première équation',
      subtitle: 'Les deux membres sont déjà des exponentielles : il n’y a plus qu’à égaler.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <div className="text-center">
              <MathText>{`$$${eq1.enonce}$$`}</MathText>
            </div>
            <p>
              Les deux membres sont des exponentielles : la stricte croissance autorise à égaler les
              exposants. On obtient <strong>{res1.intermediaire}</strong>, une équation du premier
              degré.
            </p>
          </div>
          <NumericQuestion
            prompt={<>Résous cette équation du premier degré. Que vaut <strong>x</strong> ?</>}
            expected={eq1.solution}
            parse={(raw) => parseSigned(raw, parseDec)}
            display={fr(eq1.solution)}
            requires={['egalite-des-exposants', 'methode-resoudre-equation-exp', 'equation-premier-degre']}
            explain={`On regroupe : x − 2x = 1 − 3, soit −x = −2, donc x = ${fr(eq1.solution)}. Vérification : à gauche l’exposant vaut ${fr(eq1.m * eq1.solution + eq1.p)}, à droite ${fr(eq1.q * eq1.solution + eq1.r)} — les deux coïncident.`}
            explainFor={(n) =>
              n === -eq1.solution
                ? 'Attention au signe : de −x = −2 on tire x = 2, pas x = −2. Multiplier les deux membres par −1 change les deux signes à la fois.'
                : n === 4
                ? 'Tu as sans doute additionné 3 et 1 au lieu de les regrouper d’un même côté. Reprends : x + 3 = 2x + 1 donne 3 − 1 = 2x − x.'
                : null
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Le réflexe de vérification : on remet la valeur trouvée dans les DEUX exposants, et
              l’on contrôle qu’ils coïncident. Ici {fr(eq1.m * eq1.solution + eq1.p)} des deux
              côtés — l’équation est bien résolue.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Une seconde, à regrouper d’abord',
      subtitle:
        'Cette fois un membre est un produit : commence par le ramener à une seule exponentielle avec la règle du module 2.',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <div className="text-center">
              <MathText>{'$$e^{3x} \\times e^{-1} = e^{x+5}$$'}</MathText>
            </div>
            <p>
              <strong>Pas 1 — regrouper.</strong> À gauche, un produit de deux exponentielles : on
              additionne leurs exposants, ce qui donne e^(3x − 1).
            </p>
            <p>
              <strong>Pas 2 — égaler.</strong> Il reste {res2.intermediaire}, par stricte
              croissance.
            </p>
          </div>
          <NumericQuestion
            prompt={<>Termine la résolution. Que vaut <strong>x</strong> ?</>}
            expected={eq2.solution}
            parse={(raw) => parseSigned(raw, parseDec)}
            display={fr(eq2.solution)}
            requires={['relation-fondamentale-exp', 'egalite-des-exposants', 'methode-resoudre-equation-exp']}
            explain={`On regroupe : 3x − x = 5 + 1, soit 2x = 6, donc x = ${fr(eq2.solution)}. Vérification : les deux exposants valent alors ${fr(eq2.m * eq2.solution + eq2.p)}.`}
            explainFor={(n) =>
              n === 6
                ? 'Tu t’es arrêté à 2x = 6 : il reste à diviser par 2.'
                : n === 2
                ? 'Vérifie le regroupement : 3x − 1 = x + 5 donne 3x − x = 5 + 1, soit 2x = 6. Le −1 passe à droite en devenant +1.'
                : null
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Les règles de calcul et la stricte croissance travaillent ensemble : les premières
              ramènent l’équation à deux exponentielles, la seconde autorise à les dépouiller. Sans
              l’une ou l’autre, on serait bloqué.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Résoudre une équation"
      moduleSubtitle="Une hauteur, un seul exposant"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Ce qui autorise à dépouiller',
        tone: 'indigo',
        body: (
          <p>
            Passer de e^u = e^v à u = v n’a rien d’évident : il faut une raison. Promène un point le
            long de la courbe, et cette raison te sautera aux yeux.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Et si l’on remplaçait le « = » par un « &lt; » ?</strong> Le même argument
          donne-t-il le même sens ? Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
