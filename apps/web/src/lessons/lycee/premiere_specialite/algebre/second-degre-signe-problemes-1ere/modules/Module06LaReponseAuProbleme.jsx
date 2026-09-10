import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SignePlot from '../components/SignePlot';
import {
  AIRE_PIEGEE, AIRE, TRAJECTOIRE, racinesAdmissibles, racinesRejetees,
  discriminant, roots, evalTrinome, trinomeText, parseSigned, fr,
} from '../components/signeProblemesUtils';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT : interpréter les solutions dans le
 * contexte (P5).
 *
 * Étape 1  L'AIRE PIÉGÉE. x² + 3x − 40 = 0 a pour racines −8 et 5. Les deux
 *          annulent l'expression ; une seule est une longueur. L'élève
 *          CONSTATE que −8 vérifie l'équation avant de l'écarter — on n'écarte
 *          pas une réponse « fausse », on écarte une réponse SANS SENS.
 * Étape 2  LE CAS OÙ L'ON N'ÉCARTE RIEN. Sur le rectangle du module 5, les
 *          deux racines 6 et 8 sont admissibles : elles décrivent le MÊME
 *          rectangle. Écarter n'est pas un réflexe.
 * Étape 3  LA TRAJECTOIRE. Une racine négative rejetée parce que le ballon ne
 *          part pas en arrière, et la rédaction de la réponse : une phrase,
 *          avec l'unité, arrondie parce que la racine est irrationnelle.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 constat → brique
 * `solution-equation-vs-probleme` ; étape 3 rédaction → briques
 * `methode-interpreter` puis `mem-ecarter-solutions`.
 *
 * AUCUNE MANIPULATION GELÉE : figures et bandes restent affichées après
 * validation.
 */
export default function Module06LaReponseAuProbleme() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);

  const P = AIRE_PIEGEE;                        // x² + 3x − 40, racines −8 et 5
  const rP = roots(P.a, P.b, P.c);
  const gardee = racinesAdmissibles(P)[0];      // 5
  const rejetee = racinesRejetees(P)[0];        // −8

  const rAire = roots(AIRE.a, AIRE.b, AIRE.c);  // 6 et 8

  const rT = roots(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c);
  const porteeExacte = racinesAdmissibles(TRAJECTOIRE)[0];
  const portee = Math.round(porteeExacte * 10) / 10;
  const rejeteeT = racinesRejetees(TRAJECTOIRE)[0];

  const steps = [
    {
      num: 1,
      title: 'Une longueur de −8 mètres',
      subtitle: `Un rectangle a une longueur qui dépasse sa largeur de ${fr(P.ecart)} m, et une aire de ${fr(P.aireCible)} m². En nommant x la largeur, l’énoncé donne x(x + ${fr(P.ecart)}) = ${fr(P.aireCible)}, soit ${trinomeText(P.a, P.b, P.c)} = 0.`,
      done: q1a && q1b,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-amber-900">
            <div className="font-mono text-lg font-black">{trinomeText(P.a, P.b, P.c)} = 0</div>
            <div className="mt-2 text-sm">
              Δ = {fr(discriminant(P.a, P.b, P.c))}, donc √Δ = {fr(Math.sqrt(discriminant(P.a, P.b, P.c)))},
              et les racines sont <strong>{fr(rP[0])}</strong> et <strong>{fr(rP[1])}</strong>.
            </div>
          </div>
          <NumericQuestion
            prompt={<>Avant de trancher : que vaut {trinomeText(P.a, P.b, P.c)} pour x = {fr(rejetee)} ?</>}
            expected={0}
            parse={parseSigned}
            display="0"
            requires={['formule-racines']}
            explain={`(${fr(rejetee)})² + ${fr(P.ecart)} × (${fr(rejetee)}) − ${fr(P.aireCible)} = 64 − 24 − 40 = 0. Le nombre ${fr(rejetee)} est donc une solution PARFAITEMENT CORRECTE de l’équation. Le problème, lui, va pourtant devoir l’écarter.`}
            explainFor={(n) =>
              n === -128
                ? 'Attention au carré d’un nombre négatif : (−8)² vaut +64, et non −64. Reprends : 64 + 3 × (−8) − 40 = 64 − 24 − 40.'
                : n === 40
                ? 'Tu as calculé 64 − 24, en oubliant de retrancher l’aire 40. L’expression est x² + 3x − 40, le −40 en fait partie.'
                : null
            }
            solved={q1a}
            onAnswered={() => setQ1a(true)}
          />
          <TapQuestion
            prompt={`L’équation a donc deux solutions, ${fr(rP[0])} et ${fr(rP[1])}. Quelle est la largeur du rectangle ?`}
            options={[
              `${fr(gardee)} m : ${fr(rejetee)} est bien une solution de l’équation, mais une largeur ne peut pas être négative`,
              `${fr(rejetee)} m et ${fr(gardee)} m : les deux solutions de l’équation répondent au problème`,
              `${fr(rejetee)} m : c’est la première solution donnée par la formule`,
              `Aucune : puisqu’une solution est négative, l’énoncé est impossible`,
            ]}
            correct={0}
            cols={1}
            requires={['formule-racines', 'trinome']}
            explain={`Tu viens de vérifier que ${fr(rejetee)} annule bien l’expression : ce n’est pas une erreur de calcul. Mais x désigne une LARGEUR, en mètres, et une largeur est positive. On écarte donc ${fr(rejetee)} et l’on garde ${fr(gardee)}. Vérification dans l’énoncé : ${fr(gardee)} × ${fr(gardee + P.ecart)} = ${fr(gardee * (gardee + P.ecart))} m² ✔`}
            explainWrong={`Deux erreurs opposées guettent ici. Garder ${fr(rejetee)} reviendrait à annoncer un rectangle de ${fr(rejetee)} m de large. Et déclarer l’énoncé impossible reviendrait à jeter la solution ${fr(gardee)}, qui elle convient parfaitement : ${fr(gardee)} × ${fr(gardee + P.ecart)} = ${fr(gardee * (gardee + P.ecart))}.`}
            solved={q1b}
            onAnswered={() => setQ1b(true)}
          />
          {q1a && q1b && (
            <>
              <SignePlot
                a={P.a} b={P.b} c={P.c} xMin={-10} xMax={8} montrerBandes={false}
                bandesContexte={[{ from: 0, to: 8, tone: 'emerald' }]}
                legende={<span className="text-slate-600">en vert : les valeurs de x qui ont un sens (une largeur est positive)</span>}
              />
              <Feedback tone="ok">
                Deux ensembles, à ne pas confondre : les solutions de l’<strong>équation</strong>{' '}
                {'{'} {fr(rP[0])} ; {fr(rP[1])} {'}'}, et la réponse au{' '}
                <strong>problème</strong>, {fr(gardee)} m. La seconde est toujours incluse dans la
                première, jamais l’inverse.
              </Feedback>
              <KnowledgeBrick
                id="solution-equation-vs-probleme"
                variant="new"
                lead={<>La distinction que tu viens de faire.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quand il n’y a rien à écarter',
      subtitle: `Reprends le rectangle du module précédent : périmètre ${fr(AIRE.perimetre)} m, aire ${fr(AIRE.aireCible)} m². Les solutions sont ${fr(rAire[0])} et ${fr(rAire[1])}.`,
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={`Faut-il écarter l’une des deux solutions, ${fr(rAire[0])} ou ${fr(rAire[1])} ?`}
            options={[
              `Non : les deux sont des longueurs valables. Elles décrivent le MÊME rectangle, de ${fr(rAire[0])} m sur ${fr(rAire[1])} m`,
              `Oui, ${fr(rAire[1])} : une largeur est toujours la plus petite des deux dimensions, donc la réponse est ${fr(rAire[0])}`,
              `Oui, ${fr(rAire[0])} : c’est la plus petite, donc elle n’atteint pas l’aire demandée`,
              `Oui, les deux : un rectangle n’a qu’une seule largeur, donc l’énoncé est contradictoire`,
            ]}
            correct={0}
            cols={1}
            requires={['solution-equation-vs-probleme']}
            explain={`Les deux nombres sont positifs et inférieurs au demi-périmètre : ils ont tous deux un sens. Prendre ${fr(rAire[0])} comme largeur donne ${fr(rAire[1])} comme longueur, et inversement — c’est le même rectangle, posé dans l’autre sens. Sa surface vaut ${fr(rAire[0] * rAire[1])} m² dans les deux cas.`}
            explainWrong={`Écarter n’est pas un réflexe à appliquer chaque fois qu’il y a deux solutions. Ici les deux valent ${fr(rAire[0])} et ${fr(rAire[1])} : positives, plus petites que le demi-périmètre ${fr(AIRE.perimetre / 2)}, elles décrivent toutes deux un rectangle réel — le même.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="ok">
              La règle n’est donc pas « on garde la solution positive », mais{' '}
              <strong>« on confronte chaque solution au contexte »</strong>. Parfois on écarte,
              parfois non — et parfois on garde deux réponses qui n’en font qu’une.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Rédiger la réponse',
      subtitle: `Le ballon du module précédent : sa hauteur à x mètres du lanceur vaut ${trinomeText(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c)}. On cherche où il touche le sol.`,
      done: q3a && q3b,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="text-center font-mono text-lg font-black">
              {trinomeText(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c)} = 0
            </div>
            <div className="mt-2 text-center">
              Δ = {fr(discriminant(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c))} ·
              les racines valent environ <strong>{fr(Math.round(rT[0] * 100) / 100)}</strong> et{' '}
              <strong>{fr(Math.round(rT[1] * 100) / 100)}</strong>.
            </div>
          </div>
          <TapQuestion
            prompt="Laquelle des deux répond à la question, et pourquoi ?"
            options={[
              `La seconde, environ ${fr(portee)} m : x mesure une distance parcourue vers l’avant, elle ne peut pas être négative`,
              `La première, environ ${fr(Math.round(rejeteeT * 100) / 100)} m : c’est celle que la formule donne en premier`,
              'Les deux : le ballon touche le sol à deux endroits',
              'Aucune : le discriminant n’est pas un carré parfait, donc il n’y a pas de réponse',
            ]}
            correct={0}
            cols={1}
            requires={['solution-equation-vs-probleme']}
            explain={`x compte les mètres parcourus depuis le lanceur, vers l’avant : x ⩾ 0. La racine ${fr(Math.round(rejeteeT * 100) / 100)} correspondrait à un point situé DERRIÈRE le lanceur, où le ballon n’est jamais passé. On garde donc environ ${fr(portee)} m.`}
            explainWrong={`Un ballon lancé ne touche le sol qu’une fois. La seconde racine décrit le prolongement mathématique de la courbe en arrière du lanceur, là où le vol n’a pas eu lieu. Et un discriminant qui n’est pas un carré parfait donne simplement des racines à écrire avec √ ou à arrondir — jamais une absence de réponse.`}
            solved={q3a}
            onAnswered={() => setQ3a(true)}
          />
          <NumericQuestion
            prompt={<>Au dixième de mètre près, à quelle distance du lanceur le ballon touche-t-il le sol ?</>}
            expected={portee}
            parse={parseSigned}
            display={fr(portee)}
            requires={['formule-racines']}
            explain={`La racine positive vaut exactement 2 + 2√2, soit ${fr(Math.round(porteeExacte * 1000) / 1000)}… mètres, donc ${fr(portee)} m au dixième près. Vérification : la hauteur en x = ${fr(portee)} vaut ${fr(Math.round(evalTrinome(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c, portee) * 1000) / 1000)}, presque zéro — l’écart vient de la valeur approchée qu’on a écrite.`}
            explainFor={(n) =>
              n === 2
                ? 'C’est la distance à laquelle le ballon est le plus haut, pas celle où il retombe. Il culmine à 2 m du lanceur, puis continue.'
                : n === 1
                ? 'C’est la hauteur de DÉPART du ballon, en mètres, pas une distance horizontale.'
                : null
            }
            solved={q3b}
            onAnswered={() => setQ3b(true)}
          />
          {q3a && q3b && (
            <>
              <SignePlot
                a={TRAJECTOIRE.a} b={TRAJECTOIRE.b} c={TRAJECTOIRE.c}
                xMin={-2} xMax={6} montrerBandes={false}
                bandesContexte={[{ from: 0, to: 6, tone: 'emerald' }]}
                legende={<span className="text-slate-600">en vert : le vol réel du ballon ; à gauche de 0, la courbe n’est plus qu’un dessin</span>}
              />
              <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <div className="font-bold mb-1">La phrase de réponse</div>
                « Le ballon touche le sol à environ <strong>{fr(portee)} mètres</strong> du lanceur. »
                <div className="mt-2 text-xs">
                  Une phrase, une valeur, une unité, et le mot « environ » parce que la valeur
                  n’est pas exacte. Pas d’ensemble de solutions, pas de x : la question était
                  posée en français, la réponse l’est aussi.
                </div>
              </div>
              <KnowledgeBrick
                id="methode-interpreter"
                variant="new"
                lead={<>Les cinq gestes de la fin d’un problème.</>}
              />
              <KnowledgeBrick
                id="mem-ecarter-solutions"
                variant="new"
                lead={<>Et l’ordre à retenir.</>}
              />
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
      moduleTitle="La réponse au problème"
      moduleSubtitle="Résoudre donne des nombres ; répondre demande d’en choisir"
      estimatedTime="8 min"
      brief={{
        tag: 'Laboratoire',
        title: 'Une longueur ne vaut pas −8 m',
        tone: 'indigo',
        body: (
          <p>
            Une équation rend tous les nombres qui l’annulent, y compris ceux qui n’ont aucun sens
            dans la situation. Le dernier geste d’un problème consiste à les confronter au contexte
            — puis à répondre par une phrase.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tu as tout.</strong> Le signe d’un trinôme, son tableau, les inéquations, la
          traduction d’un énoncé et l’interprétation d’une solution. La mission finale attend.
        </KnowledgeSnapshot>
      }
    />
  );
}
