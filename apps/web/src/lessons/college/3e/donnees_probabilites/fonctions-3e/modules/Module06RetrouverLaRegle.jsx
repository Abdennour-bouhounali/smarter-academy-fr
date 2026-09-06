import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { affine, square, tableOf, ruleFromTable, formatRule, imageOf } from '../components/functionUtils';
import { parseDec, formatDec, slopeBetween } from '@smarter-academy/core';

/**
 * Module 6 — ATELIER : « Retrouver la règle ».
 *
 * Activity: remonter d'un tableau, puis d'un graphique, jusqu'à l'expression.
 * Mathematical objective: déterminer a et b à partir de données — a se lit
 *   comme un PAS (ce que gagne f quand x avance de 1), b comme la valeur en 0.
 * Student action: calculer le pas entre deux colonnes, lire l'ordonnée à
 *   l'origine, puis répondre.
 * Controlled variable: aucune manipulation continue ici : c'est l'atelier où
 *   le geste des modules 3 et 4 devient une méthode.
 * Mathematical state: des tableaux et des droites fixes ; `ruleFromTable`
 *   calcule la réponse, si bien que la correction ne peut pas diverger.
 * Visual consequence: l'escalier +1 → +a est tracé sur la droite, si bien que
 *   le coefficient se LIT au lieu de se deviner.
 * Expected observation: « le pas du tableau et la montée de l'escalier sont le
 *   même nombre ».
 * Misconception targeted: lire b sur n'importe quel point plutôt qu'en x = 0 ;
 *   et croire qu'un tableau cache toujours une fonction affine.
 * Feedback: explainFor cible le pas mal compté et la confusion a/b.
 * Formalization: la méthode en deux temps (a d'abord, b ensuite) est nommée.
 * Scaffolding: tableau commençant à x = 0 (b lisible) → tableau ne le
 *   contenant pas → graphique seul.
 * Transfer: le module 7 applique la méthode à une situation réelle.
 */

const T1 = affine(3, 2);         // tableau contenant x = 0
const T2 = affine(-2, 7);        // tableau sans x = 0
const G  = affine(0.5, -1);      // lue sur un graphique
const NOT_AFFINE = square();
const RANGE = { xMin: -4, xMax: 6, yMin: -4, yMax: 5 };

function MiniTable({ rows, highlight = [] }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Tableau de valeurs</caption>
        <tbody>
          <tr>
            <th scope="row" className="text-left pr-2 font-semibold text-slate-600">x</th>
            {rows.map((r) => (
              <td key={`x${r.x}`} className={`px-2 text-center font-mono tabular-nums ${highlight.includes(r.x) ? 'bg-amber-100 rounded font-bold' : ''}`}>
                {formatDec(r.x)}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="text-left pr-2 font-semibold text-slate-600">f(x)</th>
            {rows.map((r) => (
              <td key={`y${r.x}`} className={`px-2 text-center font-mono tabular-nums ${highlight.includes(r.x) ? 'bg-amber-100 rounded font-bold' : ''}`}>
                {formatDec(r.y)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Module06RetrouverLaRegle() {
  const [aDone, setADone] = useState(false);
  const [bDone, setBDone] = useState(false);
  const [noZeroDone, setNoZeroDone] = useState(false);
  const [graphDone, setGraphDone] = useState(false);
  const [trapDone, setTrapDone] = useState(false);

  const rows1 = tableOf(T1, [0, 1, 2, 3]);
  const rows2 = tableOf(T2, [1, 2, 3, 4]);
  const rowsTrap = tableOf(NOT_AFFINE, [0, 1, 2, 3]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Retrouver la règle"
      moduleSubtitle="À partir d’un tableau ou d’un graphique, remonte jusqu’à l’expression."
      estimatedTime="10 min"
      brief={{
        tag: '🔍 Mission 06',
        title: 'L’enquête à l’envers',
        tone: 'indigo',
        body: (
          <p>
            Jusqu’ici on partait de la règle. Cette fois on te donne les traces —
            un tableau, une droite — et c’est la règle qu’il faut retrouver.
          </p>
        ),
      }}
      intro={(
        <KnowledgeBrick
          id="methode-retrouver-a-b"
          variant="new"
          lead="Tu sais fabriquer un tableau et tracer une droite à partir d’une règle. Voici comment faire le chemin inverse."
        />
      )}
      steps={[
        {
          num: 1,
          title: 'Le pas du tableau',
          subtitle: 'Combien gagne f quand x avance de 1 ?',
          done: aDone,
          content: (kit) => (
            <div className="space-y-3">
              <MiniTable rows={rows1} highlight={[1, 2]} />
              <NumericQuestion
                prompt={<>Quel est le coefficient <MathText>{'$a$'}</MathText> ?</>}
                expected={T1.a}
                parse={parseDec}
                display={formatDec(T1.a)}
                requires={['methode-retrouver-a-b', 'fonction-affine', 'pas-constant']}
                explain="De x = 1 à x = 2, f passe de 5 à 8 : elle gagne 3. Quand x avance de 1, f avance de a — donc a = 3."
                explainFor={(n) => {
                  if (n === 2) return 'Tu as lu la valeur en x = 0. C’est b, pas a : a est le PAS entre deux colonnes.';
                  if (n === 5) return 'Tu as lu une image. Le coefficient est l’ÉCART entre deux images voisines.';
                  return null;
                }}
                solved={aDone}
                onAnswered={(ok) => { setADone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'La valeur en zéro',
          done: bDone,
          content: (kit) => (
            <div className="space-y-3">
              <MiniTable rows={rows1} highlight={[0]} />
              <NumericQuestion
                prompt={<>Quel est <MathText>{'$b$'}</MathText>, et donc l’expression complète ?</>}
                expected={T1.b}
                parse={parseDec}
                display={formatDec(T1.b)}
                requires={['methode-retrouver-a-b', 'ordonnee-origine', 'image']}
                explain="b est l’image de 0 : ici f(0) = 2. Avec a = 3, la règle est f(x) = 3x + 2 — vérifie sur une autre colonne : 3 × 3 + 2 = 11. ✓"
                explainFor={(n) => {
                  if (n === 3) return 'Tu as redonné a. b se lit dans la colonne x = 0.';
                  return null;
                }}
                solved={bDone}
                onAnswered={(ok) => { setBDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Sans la colonne zéro',
          subtitle: 'Le tableau ne commence pas à 0. La méthode tient quand même.',
          done: noZeroDone,
          content: (kit) => (
            <div className="space-y-3">
              <MiniTable rows={rows2} />
              <TapQuestion
                prompt="Quelle est l’expression de cette fonction ?"
                options={['f(x) = −2x + 7', 'f(x) = 2x + 7', 'f(x) = −2x + 5', 'f(x) = 5x − 2']}
                correct={0}
                cols={1}
                requires={['methode-retrouver-a-b', 'fonction-affine', 'pas-constant']}
                explain="Le pas est −2 (de 5 à 3, puis 3 à 1) : a = −2. En x = 1 on a f(1) = 5, donc −2 × 1 + b = 5, d’où b = 7. Vérification en x = 4 : −2 × 4 + 7 = −1. ✓"
                explainWrong="Attention au signe : les images DIMINUENT quand x augmente, donc a est négatif. Ensuite, remonte de f(1) jusqu’à b."
                solved={noZeroDone}
                onAnswered={(ok) => { setNoZeroDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Sur un graphique',
          subtitle: 'L’escalier montre le coefficient ; l’axe vertical montre b.',
          done: graphDone,
          content: (kit) => (
            <div className="space-y-3">
              <CoordPlane
                range={RANGE}
                unit={28}
                functions={[{ id: 'g', a: G.a, b: G.b, tone: 'indigo', label: 'f' }]}
                intercept={{ y: G.b }}
                staircase={{ from: { x: 0, y: G.b }, a: G.a, run: 2 }}
                ariaLabel="Repère : lire le coefficient et l’ordonnée à l’origine"
                caption={false}
              />
              <TapQuestion
                prompt="Quelle est l’expression de cette droite ?"
                options={['f(x) = 0,5x − 1', 'f(x) = 2x − 1', 'f(x) = 0,5x + 1', 'f(x) = −x + 0,5']}
                correct={0}
                cols={1}
                requires={['methode-retrouver-a-b', 'ordonnee-origine', 'representation-graphique']}
                explain="La droite coupe l’axe vertical en −1, donc b = −1. L’escalier avance de 2 et monte de 1 : a = 1 ÷ 2 = 0,5. D’où f(x) = 0,5x − 1."
                explainWrong="Compte l’escalier dans le bon sens : a est la montée DIVISÉE par l’avancée, pas l’inverse."
                solved={graphDone}
                onAnswered={(ok) => { setGraphDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 5,
          title: 'Le tableau qui ne cache rien',
          done: trapDone,
          content: (
            <div className="space-y-3">
              <MiniTable rows={rowsTrap} />
              <TapQuestion
                prompt="Quelle est l’expression affine de ce tableau ?"
                options={[
                  'Aucune : les écarts ne sont pas constants',
                  'f(x) = 3x',
                  'f(x) = x + 2',
                  'f(x) = 2x − 1',
                ]}
                correct={0}
                cols={1}
                requires={['methode-retrouver-a-b', 'fonction-affine', 'pas-constant']}
                explain="Les écarts valent 1, puis 3, puis 5 : ils ne sont pas constants. Une fonction affine a TOUJOURS un pas constant, donc aucune expression affine ne convient (c’est en fait x²)."
                explainWrong="Vérifie les écarts entre colonnes voisines : s’ils changent, aucune droite ne peut passer par tous ces points."
                solved={trapDone}
                onAnswered={() => setTrapDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Tu sais remonter d’un tableau ou d’un graphique jusqu’à
          l’expression. Au module suivant, la fonction sort du cahier.
        </KnowledgeSnapshot>
      )}
    />
  );
}
