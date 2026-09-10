import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TableauSignes, { colonnesDe } from '../components/TableauSignes';
import SignePlot from '../components/SignePlot';
import {
  discriminant, roots, evalTrinome, trinomeText, fr,
} from '../components/signeProblemesUtils';

/**
 * Module 3 — DÉCOUVERTE : la règle du module 2 se range dans un TABLEAU DE
 * SIGNES (P1).
 *
 * Étape 1  le tableau lu : la bande colorée pliée en une ligne. On nomme
 *          l'objet, on lit ses colonnes, on situe les zéros.
 * Étape 2  le tableau REMPLI par l'élève, sur un trinôme à a positif. Les
 *          racines et les zéros sont donnés — la mathématique ne se devine
 *          pas — et c'est le SIGNE de chaque colonne qu'il pose.
 * Étape 3  le piège du désordre : avec a négatif, la formule des racines rend
 *          souvent la plus grande en premier. Le tableau se dresse dans
 *          l'ordre CROISSANT, sinon les signes sont justes aux mauvais
 *          endroits.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 lecture → brique
 * `tableau-signes-trinome` ; étape 2 remplissage → brique
 * `methode-dresser-tableau` ; étape 3 → `mem-tableau-signes`.
 *
 * MANIPULATION JAMAIS GELÉE. Le tableau saisi de l'étape 2 passe en `reveal`
 * une fois validé — c'est la CORRECTION, pas un gel : chaque case montre la
 * bonne réponse. Le tableau reste affiché et lisible.
 */
export default function Module03LeTableauDeSignes() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q3, setQ3] = useState(false);

  // Le trinôme lu (a > 0, deux racines) : x² − 5x + 6.
  const A = { a: 1, b: -5, c: 6 };
  // Le trinôme rempli par l'élève : x² − x − 6, racines −2 et 3.
  const B = { a: 1, b: -1, c: -6 };
  const rB = roots(B.a, B.b, B.c);
  const colonnesB = colonnesDe(B.a, B.b, B.c);
  const vraiB = colonnesB.map((col) => (col.sign === 1 ? '+' : '−'));

  const [saisie, setSaisie] = useState(() => colonnesB.map(() => null));
  const complet = saisie.every((v) => v !== null);
  const juste = complet && saisie.every((v, i) => v === vraiB[i]);
  const [valide, setValide] = useState(false);

  // Le trinôme à a négatif : −2x² + 2x + 12, racines −2 et 3.
  const C = { a: -2, b: 2, c: 12 };
  const rC = roots(C.a, C.b, C.c);

  const steps = [
    {
      num: 1,
      title: 'La bande, pliée en une ligne',
      subtitle: `Voici ${trinomeText(A.a, A.b, A.c)}, ses couleurs de signe et le tableau qui les résume. Compare-les colonne par colonne.`,
      done: q1a && q1b,
      content: (
        <div className="space-y-3">
          <SignePlot a={A.a} b={A.b} c={A.c} />
          <TableauSignes
            a={A.a} b={A.b} c={A.c}
            label={trinomeText(A.a, A.b, A.c)}
            caption="Le tableau de signes du même trinôme"
          />
          <TapQuestion
            prompt="Que contient exactement ce tableau ?"
            options={[
              'Les racines en tête de colonne, et un signe par intervalle — jamais une valeur du trinôme',
              'Les valeurs du trinôme aux points remarquables',
              'Le discriminant et les racines, rangés dans l’ordre',
              'La liste des points où la courbe rencontre l’axe',
            ]}
            correct={0}
            cols={1}
            requires={['signe-trinome-regle', 'intervalle']}
            explain={`On n’y lit aucun nombre calculé à partir du trinôme, seulement des signes. C’est ce qui le rend court : trois colonnes suffisent à dire le signe partout, alors qu’aucune liste de valeurs n’y parviendrait.`}
            explainWrong={`Cherche une valeur du trinôme dans le tableau : il n’y en a aucune. Le seul chiffre écrit est le 0 sous chaque racine, et c’est un SIGNE, pas une valeur particulière — le trinôme y vaut effectivement zéro.`}
            solved={q1a}
            onAnswered={() => setQ1a(true)}
          />
          <TapQuestion
            prompt={`Sur ce tableau, à quoi correspond la deuxième colonne de signes, celle qui porte un « − » ?`}
            options={[
              'À l’intervalle ]2 ; 3[ : entre les deux racines, bornes exclues',
              'À l’intervalle [2 ; 3] : entre les deux racines, bornes comprises',
              'À la valeur x = 2,5, le milieu des deux racines',
              'À l’intervalle ]−∞ ; 2[, celui de gauche',
            ]}
            correct={0}
            cols={1}
            requires={['intervalle-crochets', 'borne-incluse-exclue']}
            explain={`Une colonne de signe couvre l’intervalle OUVERT entre deux bornes : ]2 ; 3[. Les bornes elles-mêmes portent le 0, dans les petites colonnes qui les séparent — le trinôme y vaut zéro, ni positif ni négatif.`}
            explainWrong={`Les racines 2 et 3 ne sont pas dans la colonne « − » : elles ont leur propre case, celle du 0. Une colonne de signe ne contient donc que des nombres strictement compris entre deux bornes.`}
            solved={q1b}
            onAnswered={() => setQ1b(true)}
          />
          {q1a && q1b && (
            <>
              <Feedback tone="ok">
                Le tableau dit la même chose que les couleurs, en trois lignes de texte : c’est
                l’outil qu’on écrit sur une copie.
              </Feedback>
              <KnowledgeBrick
                id="tableau-signes-trinome"
                variant="new"
                lead={<>L’objet que tu viens de lire.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'À toi de le dresser',
      subtitle: `Le trinôme ${trinomeText(B.a, B.b, B.c)} a pour discriminant ${fr(discriminant(B.a, B.b, B.c))} et pour racines ${fr(rB[0])} et ${fr(rB[1])}. Les colonnes et les zéros sont posés : place les trois signes.`,
      done: valide,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
            a = {fr(B.a)}, donc <strong>positif</strong>. Rappelle-toi : du signe de a partout,
            sauf entre les racines. Appuie sur une case pour la faire basculer entre + et −.
          </div>
          <TableauSignes
            a={B.a} b={B.b} c={B.c}
            label={trinomeText(B.a, B.b, B.c)}
            editable
            values={saisie}
            onChange={(i, v) => setSaisie((s) => s.map((old, k) => (k === i ? v : old)))}
            reveal={valide}
          />
          {!valide && (
            <button
              type="button"
              disabled={!complet}
              onClick={() => setValide(true)}
              className="min-h-[44px] px-5 rounded-xl bg-sky-600 text-white font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {complet ? 'Vérifier mon tableau' : 'Remplis les trois cases'}
            </button>
          )}
          {valide && (
            <>
              <Feedback tone={juste ? 'ok' : 'warn'}>
                {juste ? (
                  <>
                    Exact. Trois colonnes, deux zéros, et l’exception au milieu : le trinôme est
                    positif avant {fr(rB[0])}, négatif entre {fr(rB[0])} et {fr(rB[1])}, positif
                    après. Vérification en x = 0 : {fr(evalTrinome(B.a, B.b, B.c, 0))}, bien
                    négatif.
                  </>
                ) : (
                  <>
                    Les cases fautives affichent la bonne réponse à côté de la tienne. La règle :
                    a = {fr(B.a)} est positif, donc <strong>+ aux deux extrémités</strong>, et le
                    signe contraire entre les racines. Vérifie en remplaçant : en x = 0 le trinôme
                    vaut {fr(evalTrinome(B.a, B.b, B.c, 0))}, et 0 est bien entre {fr(rB[0])} et{' '}
                    {fr(rB[1])}.
                  </>
                )}
              </Feedback>
              <button
                type="button"
                onClick={() => { setValide(false); setSaisie(colonnesB.map(() => null)); }}
                className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Recommencer le tableau
              </button>
              <SignePlot a={B.a} b={B.b} c={B.c} />
              <KnowledgeBrick
                id="methode-dresser-tableau"
                variant="new"
                lead={<>Les cinq gestes, dans l’ordre où tu viens de les faire.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ranger les racines, toujours',
      subtitle: `Sur ${trinomeText(C.a, C.b, C.c)}, la formule des racines donne d’abord ${fr(3)} puis ${fr(-2)} — parce que 2a est négatif. Le tableau, lui, ne se dresse que dans un sens.`,
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="text-center font-mono text-lg font-black">{trinomeText(C.a, C.b, C.c)}</div>
            <div className="mt-2 text-center">
              a = {fr(C.a)} · Δ = {fr(discriminant(C.a, C.b, C.c))} · 2a = {fr(2 * C.a)}
            </div>
            <div className="mt-2">
              (−b − √Δ) ÷ 2a = (−2 − 10) ÷ (−4) = <strong>3</strong>, et
              (−b + √Δ) ÷ 2a = (−2 + 10) ÷ (−4) = <strong>−2</strong>. La première formule a donné
              la PLUS GRANDE.
            </div>
          </div>
          <TapQuestion
            prompt="Comment dresser le tableau de ce trinôme ?"
            options={[
              `En rangeant d’abord les racines dans l’ordre croissant : ${fr(rC[0])} puis ${fr(rC[1])}, puis − aux deux bords et + au milieu`,
              'En écrivant les racines dans l’ordre où la formule les a données : 3 puis −2',
              'En écrivant + aux deux bords et − au milieu, comme d’habitude',
              'En inversant aussi le sens de lecture du tableau, de droite à gauche',
            ]}
            correct={0}
            cols={1}
            requires={['methode-dresser-tableau', 'signe-trinome-regle']}
            explain={`La ligne des x se lit toujours de −∞ à +∞ : les racines s’y rangent dans l’ordre croissant, ${fr(rC[0])} puis ${fr(rC[1])}, quelle que soit celle que la formule a sortie en premier. Ensuite, a = ${fr(C.a)} est négatif : le trinôme est négatif aux deux bords et positif au milieu. Vérification en x = 0 : ${fr(evalTrinome(C.a, C.b, C.c, 0))}.`}
            explainWrong={`Deux pièges se croisent ici. Le premier : ranger les racines dans l’ordre de la formule mettrait 3 à gauche de −2, et les signes tomberaient aux mauvais endroits. Le second : « + au milieu » n’est vrai que pour a positif ; ici a = ${fr(C.a)}, donc c’est l’inverse. Vérifie en x = 0 : ${fr(evalTrinome(C.a, C.b, C.c, 0))}.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <TableauSignes
                a={C.a} b={C.b} c={C.c}
                label={trinomeText(C.a, C.b, C.c)}
                caption="Le tableau correct : racines rangées, signes de a aux extrémités"
              />
              <KnowledgeBrick
                id="mem-tableau-signes"
                variant="new"
                lead={<>La forme du tableau, selon le nombre de racines.</>}
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
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le tableau de signes"
      moduleSubtitle="La bande colorée, pliée en trois colonnes"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Un outil qui tient en trois lignes',
        tone: 'indigo',
        body: (
          <p>
            La règle du module précédent se range dans un tableau : les racines en tête de colonne,
            un signe par intervalle, un zéro sous chaque racine. C’est ce tableau qui répondra aux
            questions du module suivant.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Un tableau de signes se lit comme une réponse : les colonnes
          dont le signe convient forment l’ensemble des solutions d’une inéquation.
        </KnowledgeSnapshot>
      }
    />
  );
}
