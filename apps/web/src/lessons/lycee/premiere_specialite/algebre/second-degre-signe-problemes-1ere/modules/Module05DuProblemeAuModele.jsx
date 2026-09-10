import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SignePlot from '../components/SignePlot';
import TableauSignes from '../components/TableauSignes';
import {
  AIRE, ENCLOS, enclosInequation, aireEnclos, TRAJECTOIRE,
  solutionsInequationText, discriminant, roots, vertex, evalTrinome,
  trinomeText, parseSigned, fr,
} from '../components/signeProblemesUtils';

/**
 * Module 5 — LABORATOIRE D'ENTRAÎNEMENT : traduire une situation en équation
 * (P3) ou en inéquation (P4).
 *
 * Étape 1  L'AIRE. Un rectangle de périmètre 28 m dont l'aire vaut exactement
 *          48 m². « Exactement » → une ÉQUATION. L'élève construit le modèle
 *          par étapes : nommer, exprimer, traduire.
 * Étape 2  L'ENCLOS. 24 m de grillage sur trois côtés, une aire d'AU MOINS
 *          64 m². « Au moins » → une INÉQUATION, avec ⩾. Le même geste, un
 *          autre symbole — et la réponse devient un intervalle.
 * Étape 3  LA TRAJECTOIRE. Un ballon parti de 1 m de haut : « à quelle
 *          distance retombe-t-il ? » → une équation ; « sur quelle distance
 *          est-il à plus de 2 m ? » → une inéquation. Deux questions, un seul
 *          modèle.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 construction → brique
 * `modeliser-second-degre` ; étape 2 comparaison des formulations → brique
 * `traduire-au-moins-au-plus`.
 *
 * TOUS LES MODÈLES SONT REDÉRIVÉS DU CONTEXTE dans le test (largeur × longueur
 * = aire, x(24 − 2x) = aire), jamais recopiés : si les coefficients
 * mentaient, le test tomberait.
 *
 * PÉRIMÈTRE : ce module MODÉLISE et RÉSOUT. L'interprétation dans le contexte —
 * écarter une longueur négative, rédiger la réponse — est le module suivant.
 *
 * AUCUNE MANIPULATION GELÉE : figures et tableaux restent affichés après
 * validation.
 */
export default function Module05DuProblemeAuModele() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);

  const demi = AIRE.perimetre / 2;                     // 14
  const rAire = roots(AIRE.a, AIRE.b, AIRE.c);         // 6 et 8
  const Q = enclosInequation();                        // −2x² + 24x − 64 ⩾ 0
  const rQ = roots(Q.a, Q.b, Q.c);                     // 4 et 8
  const vEnclos = vertex(ENCLOS.a, ENCLOS.b, ENCLOS.c); // (6 ; 72)

  const steps = [
    {
      num: 1,
      title: 'Un rectangle imposé',
      subtitle: `Un rectangle mesure ${fr(AIRE.perimetre)} m de tour, et sa surface vaut ${fr(AIRE.aireCible)} m². Quelles sont ses dimensions ?`,
      done: q1a && q1b,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <strong>Premier geste : nommer.</strong> Soit x la largeur du rectangle, en mètres. Le
            tour du rectangle vaut {fr(AIRE.perimetre)} m, donc la somme d’une largeur et d’une
            longueur vaut {fr(demi)} m.
          </div>
          <TapQuestion
            prompt="Comment s’écrit la longueur à l’aide de x, et quelle équation traduit l’énoncé ?"
            options={[
              `La longueur vaut ${fr(demi)} − x, et l’équation est x(${fr(demi)} − x) = ${fr(AIRE.aireCible)}`,
              `La longueur vaut ${fr(AIRE.perimetre)} − x, et l’équation est x(${fr(AIRE.perimetre)} − x) = ${fr(AIRE.aireCible)}`,
              `La longueur vaut ${fr(AIRE.aireCible)} ÷ x, et l’équation est x + ${fr(AIRE.aireCible)} ÷ x = ${fr(demi)}`,
              `La longueur vaut ${fr(demi)} − x, et l’équation est 2x + 2(${fr(demi)} − x) = ${fr(AIRE.aireCible)}`,
            ]}
            correct={0}
            cols={1}
            requires={['trinome']}
            explain={`Le tour est 2 × (largeur + longueur), donc largeur + longueur = ${fr(AIRE.perimetre)} ÷ 2 = ${fr(demi)}. Si la largeur est x, la longueur est ${fr(demi)} − x. La surface est le produit des deux, et l’énoncé dit qu’elle vaut EXACTEMENT ${fr(AIRE.aireCible)} : x(${fr(demi)} − x) = ${fr(AIRE.aireCible)}.`}
            explainWrong={`${fr(AIRE.perimetre)} − x confondrait le tour entier avec sa moitié : avec x = 1, la longueur vaudrait ${fr(AIRE.perimetre - 1)} m et le tour ${fr(2 * (1 + AIRE.perimetre - 1))} m, pas ${fr(AIRE.perimetre)}. Et la dernière option redonne le tour, pas la surface.`}
            solved={q1a}
            onAnswered={() => setQ1a(true)}
          />
          <NumericQuestion
            prompt={
              <>
                Effectue le produit et ramène tout à gauche : x({fr(demi)} − x) = {fr(AIRE.aireCible)}{' '}devient{' '}
                {trinomeText(AIRE.a, AIRE.b, AIRE.c)} = 0. Que vaut son discriminant ?
              </>
            }
            expected={discriminant(AIRE.a, AIRE.b, AIRE.c)}
            parse={parseSigned}
            display={fr(discriminant(AIRE.a, AIRE.b, AIRE.c))}
            requires={['discriminant']}
            explain={`x(${fr(demi)} − x) = ${fr(demi)}x − x². En retranchant ${fr(AIRE.aireCible)} : ${trinomeText(AIRE.a, AIRE.b, AIRE.c)} = 0. Alors Δ = ${fr(AIRE.b)}² − 4 × (${fr(AIRE.a)}) × (${fr(AIRE.c)}) = ${fr(AIRE.b * AIRE.b)} − ${fr(4 * AIRE.a * AIRE.c)} = ${fr(discriminant(AIRE.a, AIRE.b, AIRE.c))}. Les racines sont ${fr(rAire[0])} et ${fr(rAire[1])}.`}
            explainFor={(n) =>
              n === 388
                ? 'Attention aux signes : a vaut −1 et c vaut −48, donc 4ac = 4 × (−1) × (−48) = +192. Δ = 196 − 192, pas 196 + 192.'
                : null
            }
            solved={q1b}
            onAnswered={() => setQ1b(true)}
          />
          {q1a && q1b && (
            <>
              <SignePlot a={AIRE.a} b={AIRE.b} c={AIRE.c} xMin={0} xMax={14} montrerBandes={false} />
              <Feedback tone="ok">
                Les deux racines sont <strong>{fr(rAire[0])}</strong> et{' '}
                <strong>{fr(rAire[1])}</strong>. Leur somme vaut {fr(rAire[0] + rAire[1])}, le
                demi-tour, et leur produit {fr(rAire[0] * rAire[1])}, la surface : ce sont la
                largeur et la longueur du même rectangle.
              </Feedback>
              <KnowledgeBrick
                id="modeliser-second-degre"
                variant="new"
                lead={<>Les quatre gestes que tu viens d’enchaîner.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: '« Au moins », et tout change',
      subtitle: `Un enclos rectangulaire est adossé à un mur : ${fr(ENCLOS.grillage)} m de grillage suffisent pour ses trois autres côtés. On veut une aire d’AU MOINS ${fr(ENCLOS.cible)} m².`,
      done: q2a && q2b,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <strong>Nommer, puis exprimer.</strong> Soit x la profondeur de l’enclos, en mètres
            (les deux côtés perpendiculaires au mur). Il reste{' '}
            {fr(ENCLOS.grillage)} − 2x mètres de grillage pour le côté parallèle au mur, donc
            l’aire vaut x({fr(ENCLOS.grillage)} − 2x) = {trinomeText(ENCLOS.a, ENCLOS.b, ENCLOS.c)}.
          </div>
          <TapQuestion
            prompt={`Comment se traduit « l’aire est d’au moins ${fr(ENCLOS.cible)} m² » ?`}
            options={[
              `${trinomeText(ENCLOS.a, ENCLOS.b, ENCLOS.c)} ⩾ ${fr(ENCLOS.cible)}, soit ${trinomeText(Q.a, Q.b, Q.c)} ⩾ 0`,
              `${trinomeText(ENCLOS.a, ENCLOS.b, ENCLOS.c)} = ${fr(ENCLOS.cible)}, soit ${trinomeText(Q.a, Q.b, Q.c)} = 0`,
              `${trinomeText(ENCLOS.a, ENCLOS.b, ENCLOS.c)} > ${fr(ENCLOS.cible)}, soit ${trinomeText(Q.a, Q.b, Q.c)} > 0`,
              `${trinomeText(ENCLOS.a, ENCLOS.b, ENCLOS.c)} ⩽ ${fr(ENCLOS.cible)}, soit ${trinomeText(Q.a, Q.b, Q.c)} ⩽ 0`,
            ]}
            correct={0}
            cols={1}
            requires={['modeliser-second-degre']}
            explain={`« Au moins ${fr(ENCLOS.cible)} » veut dire « ${fr(ENCLOS.cible)} ou plus » : l’aire peut valoir exactement ${fr(ENCLOS.cible)}. C’est donc ⩾, une inégalité LARGE. On ramène ensuite la cible à gauche : ${trinomeText(Q.a, Q.b, Q.c)} ⩾ 0.`}
            explainWrong={`« = » répondrait à « exactement ${fr(ENCLOS.cible)} m² » et donnerait deux nombres, pas un intervalle. « > » exclurait la valeur ${fr(ENCLOS.cible)} elle-même, que l’énoncé accepte pourtant.`}
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          {q2a && (
            <>
              <KnowledgeBrick
                id="traduire-au-moins-au-plus"
                variant="new"
                lead={<>Les quatre formulations et leurs symboles.</>}
              />
              <TableauSignes a={Q.a} b={Q.b} c={Q.c} label={trinomeText(Q.a, Q.b, Q.c)} />
            </>
          )}
          <TapQuestion
            prompt={`Résous ${trinomeText(Q.a, Q.b, Q.c)} ⩾ 0. Quelles profondeurs conviennent ?`}
            options={[
              solutionsInequationText(Q.a, Q.b, Q.c, Q.rel),
              solutionsInequationText(Q.a, Q.b, Q.c, '<='),
              `]${fr(rQ[0])} ; ${fr(rQ[1])}[`,
              `[${fr(vEnclos.x)} ; ${fr(vEnclos.y)}]`,
            ]}
            correct={0}
            cols={2}
            requires={['methode-inequation-second-degre', 'signe-trinome-regle']}
            explain={`Δ = ${fr(discriminant(Q.a, Q.b, Q.c))}, racines ${fr(rQ[0])} et ${fr(rQ[1])}. a = ${fr(Q.a)} est négatif, donc le trinôme est positif ENTRE les racines, et ⩾ garde les bornes : S = ${solutionsInequationText(Q.a, Q.b, Q.c, Q.rel)}. Vérification : une profondeur de ${fr(rQ[0])} m donne ${fr(aireEnclos(rQ[0]))} m², et ${fr(6)} m donne ${fr(aireEnclos(6))} m².`}
            explainWrong={`a = ${fr(Q.a)} est NÉGATIF : le trinôme est positif au milieu, pas aux bords. Et ⩾ inclut les bornes, donc les crochets se ferment. Vérifie : une profondeur de 3 m donne ${fr(aireEnclos(3))} m², insuffisant ; 5 m donne ${fr(aireEnclos(5))} m², suffisant.`}
            solved={q2b}
            onAnswered={() => setQ2b(true)}
          />
          {q2b && (
            <Feedback tone="ok">
              Une équation aurait donné deux nombres ; l’inéquation donne un{' '}
              <strong>intervalle entier</strong> de profondeurs acceptables, de {fr(rQ[0])} m à{' '}
              {fr(rQ[1])} m. Et l’aire y est maximale en {fr(vEnclos.x)} m, où elle atteint{' '}
              {fr(vEnclos.y)} m².
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un modèle, deux questions',
      subtitle: `Un ballon est lancé depuis une hauteur de ${fr(TRAJECTOIRE.c)} m. À x mètres du lanceur, sa hauteur vaut ${trinomeText(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c)} mètres.`,
      done: q3a && q3b,
      content: (
        <div className="space-y-3">
          <SignePlot
            a={TRAJECTOIRE.a} b={TRAJECTOIRE.b} c={TRAJECTOIRE.c}
            xMin={0} xMax={6} montrerBandes={false}
            legende={<span className="text-slate-600">la hauteur du ballon, en mètres, selon la distance</span>}
          />
          <TapQuestion
            prompt="« À quelle distance le ballon touche-t-il le sol ? » Comment cette question se traduit-elle ?"
            options={[
              `Par une ÉQUATION : ${trinomeText(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c)} = 0, car le sol est à la hauteur 0`,
              `Par une INÉQUATION : ${trinomeText(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c)} ⩽ 0`,
              `Par une ÉQUATION : ${trinomeText(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c)} = ${fr(TRAJECTOIRE.c)}`,
              'Par le calcul du point le plus haut de la courbe',
            ]}
            correct={0}
            cols={1}
            requires={['modeliser-second-degre']}
            explain={`Toucher le sol, c’est être à la hauteur 0 : on cherche donc les x qui annulent l’expression. La question dit « à quelle distance », au singulier et de façon précise : c’est une équation.`}
            explainWrong={`Une inéquation répondrait à « sur quelle distance est-il sous le sol ? », qui n’a pas de sens ici. Et « = ${fr(TRAJECTOIRE.c)} » chercherait où le ballon repasse à sa hauteur de départ, ce qui est une autre question.`}
            solved={q3a}
            onAnswered={() => setQ3a(true)}
          />
          <TapQuestion
            prompt="« Sur quelle portion de son vol le ballon est-il à plus de 2 m de haut ? » Et celle-ci ?"
            options={[
              `Par une INÉQUATION : ${trinomeText(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c)} > 2`,
              `Par une ÉQUATION : ${trinomeText(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c)} = 2`,
              `Par une INÉQUATION : ${trinomeText(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c)} ⩾ 0`,
              `Par une INÉQUATION : ${trinomeText(TRAJECTOIRE.a, TRAJECTOIRE.b, TRAJECTOIRE.c)} < 2`,
            ]}
            correct={0}
            cols={1}
            requires={['traduire-au-moins-au-plus', 'inequation-second-degre']}
            explain={`« Sur quelle portion » demande un ENSEMBLE de distances, pas une distance : c’est une inéquation. Et « à plus de 2 m » est strict — 2 m exactement ne compte pas — donc « > 2 ». L’équation « = 2 » ne donnerait que les deux extrémités de cette portion.`}
            explainWrong={`Repère les deux indices : « sur quelle portion » (un ensemble, donc une inéquation) et « à plus de » (strict, donc >). Une équation ne répondrait qu’aux deux bornes, pas à la portion entre elles.`}
            solved={q3b}
            onAnswered={() => setQ3b(true)}
          />
          {q3a && q3b && (
            <Feedback tone="ok">
              Le même modèle, deux questions, deux traductions. Ce n’est pas la situation qui décide
              du symbole : c’est <strong>la question posée</strong>. « À quelle distance » → une
              équation ; « sur quelle portion », « au moins », « au plus » → une inéquation.
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
      moduleTitle="Du problème au modèle"
      moduleSubtitle="Nommer, exprimer, traduire — puis seulement résoudre"
      estimatedTime="11 min"
      brief={{
        tag: 'Laboratoire',
        title: 'Une phrase, un symbole',
        tone: 'indigo',
        body: (
          <p>
            Un rectangle, un enclos, un ballon. Le geste est toujours le même : nommer l’inconnue,
            exprimer la grandeur, puis regarder ce que la question demande —{' '}
            <strong>« exactement » donne un « = », « au moins » donne un « ⩾ »</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Une équation rend des nombres. Le problème, lui, attend une
          réponse — et tous les nombres trouvés n’en sont pas une.
        </KnowledgeSnapshot>
      }
    />
  );
}
