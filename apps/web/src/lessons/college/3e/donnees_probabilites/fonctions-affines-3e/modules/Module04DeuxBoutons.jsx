import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import AffineExplorer from '../../../../../common/components/AffineExplorer';
import ValueTable from '../../../../../common/components/ValueTable';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { image, formatAffine } from '../components/affineUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 4 — MANIPULATION SIGNATURE : « Les deux boutons ».
 *
 * Activity: régler a et b ensemble, viser une droite donnée, remplir le
 *   tableau de valeurs qui suit, puis lire a et b sur un graphique muet.
 * Mathematical objective: coordonner les deux paramètres après les avoir vus
 *   séparément, et faire du tableau de valeurs un objet CONSTRUIT (P8) plutôt
 *   qu'un mot coché.
 * Student action: régler les deux curseurs jusqu'à la cible ; toucher des x
 *   pour remplir le tableau ; lire un graphique sans étiquette.
 * Controlled variable: a et b, cette fois libres tous les deux.
 * Mathematical state: { a, b } — droite, escalier, point (0 ; b) et colonnes
 *   du tableau en dérivent tous ; `image` fournit chaque valeur.
 * Visual consequence: la cible en pointillé amber reste visible tant qu'elle
 *   n'est pas atteinte ; le tableau se remplit colonne par colonne.
 * Expected observation: « il faut régler les deux, et l'ordre n'importe pas ».
 * Misconception targeted: lire b ailleurs qu'en x = 0, et lire a comme une
 *   ordonnée plutôt que comme une montée.
 * Feedback: l'écart restant est quantifié paramètre par paramètre ; échappée
 *   après 4 essais infructueux.
 * Formalization: les noms de a et b sont acquis ; ce module pose les deux
 *   MÉTHODES de lecture (dans un tableau, sur un graphique) et le raccourci
 *   f(0) = b, chacune par une <KnowledgeBrick> après le geste correspondant.
 * Scaffolding: cible affichée (TRY) → tableau (EXPLORE) → lecture muette
 *   (CHALLENGE).
 * Transfer: le module 5 remonte à l'expression sans aucun réglage.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   L'étape 3 (« lis une droite muette ») demandait a ET b d'un seul coup,
 *   sans que la lecture graphique n'ait jamais été décrite : le tableau de
 *   l'étape 2 ne le préparait que par une phrase de `Feedback`. Désormais :
 *     étape 2  remplir le tableau      → brique `tableau-affine` + essai
 *     étape 3  brique `lire-a-et-b-graphique` avant la droite muette
 *     étape 4  brique `mem-f0-egale-b` : le raccourci, retenu tel quel
 */

const TARGET = { a: -1.5, b: 3 };
const RANGE = { xMin: -5, xMax: 5, yMin: -7, yMax: 7 };
const READ = { a: 2, b: -3 };
const XS = [-2, -1, 0, 1, 2, 3];

export default function Module04DeuxBoutons() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const [tested, setTested] = useState(() => new Set());
  const [tableDone, setTableDone] = useState(false);
  const [readDone, setReadDone] = useState(false);
  const [zeroDone, setZeroDone] = useState(false);

  const hit = a === TARGET.a && b === TARGET.b;
  const done1 = hit || revealed;
  const done2 = tested.size >= 4;

  const cols = [{ id: 'f', label: `f(x) = ${formatDec(TARGET.a)}x + ${formatDec(TARGET.b)}`, fn: (x) => image(TARGET.a, TARGET.b, x) }];

  const change = ({ a: na, b: nb }, kit) => {
    if (done1) return;
    if (na !== a || nb !== b) {
      setA(na);
      setB(nb);
      setTries((t) => t + 1);
      if (na === TARGET.a && nb === TARGET.b) kit.react(true);
    }
  };

  const test = (x, kit) => {
    if (tested.has(x)) return;
    setTested((prev) => new Set(prev).add(x));
    kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Les deux boutons"
      moduleSubtitle="Les deux réglages libres, un tableau qui suit, un graphique à lire."
      estimatedTime="10 min"
      brief={{
        tag: '🎯 Mission 04',
        title: 'Vise la droite en pointillé',
        tone: 'indigo',
        body: (
          <p>
            Les deux réglages sont libres. Amène ta droite sur la droite en pointillé —
            il faut régler l’inclinaison <em>et</em> la hauteur.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Atteins la cible',
          subtitle: 'Une droite qui descend, partant de 3.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <AffineExplorer
                a={done1 ? TARGET.a : a}
                b={done1 ? TARGET.b : b}
                showB
                onChange={(v) => change(v, kit)}
                aRange={{ min: -3, max: 3, step: 0.5 }}
                bRange={{ min: -4, max: 4, step: 1 }}
                range={RANGE}
                showIntercept
                compareWith={done1 ? null : { a: TARGET.a, b: TARGET.b, label: 'cible', tone: 'amber' }}
                disabled={done1}
              />
              {!done1 && (
                <>
                  <Feedback tone="info">
                    {a !== TARGET.a && b !== TARGET.b && <>Les deux réglages sont à revoir : l’inclinaison et la hauteur.</>}
                    {a === TARGET.a && b !== TARGET.b && <>L’inclinaison est bonne. Il reste la hauteur : <strong>{formatDec(TARGET.b - b)}</strong> à ajouter à b.</>}
                    {a !== TARGET.a && b === TARGET.b && <>La hauteur est bonne. Il reste l’inclinaison : ta droite {a > TARGET.a ? 'monte trop' : 'descend trop'}.</>}
                  </Feedback>
                  {tries >= 4 && (
                    <button
                      type="button"
                      onClick={() => { setA(TARGET.a); setB(TARGET.b); setRevealed(true); kit.react(false); }}
                      className="w-full min-h-[44px] rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Je ne trouve pas — montre-moi les réglages
                    </button>
                  )}
                </>
              )}
              {done1 && (
                <Feedback tone={revealed ? 'info' : 'ok'}>
                  {revealed ? 'On te les montre : ' : 'Atteinte. '}
                  <MathText>{`$${formatAffine(TARGET.a, TARGET.b)}$`}</MathText> — elle descend
                  (a négatif) et part de 3 (b positif).
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le tableau de cette droite',
          subtitle: 'Touche au moins quatre valeurs de x.',
          done: done2 && tableDone,
          content: (kit) => (
            <div className="space-y-3">
              <ValueTable
                columns={cols}
                xs={XS}
                tested={tested}
                onTest={(x) => test(x, kit)}
                variable="x"
                compare={false}
                caption="Tableau de valeurs de la droite cible"
              />
              {!done2 ? (
                <Feedback tone="info">
                  Encore <strong>{4 - tested.size}</strong> colonne{4 - tested.size > 1 ? 's' : ''} à remplir.
                </Feedback>
              ) : (
                <Feedback tone="ok">
                  Regarde la colonne <MathText>{'$x = 0$'}</MathText> : elle donne{' '}
                  <strong>3</strong>, c’est-à-dire <MathText>{'$b$'}</MathText>. Et d’une
                  colonne à la suivante, on descend de 1,5 : c’est{' '}
                  <MathText>{'$a$'}</MathText>.
                </Feedback>
              )}

              {done2 && (
                <KnowledgeBrick
                  id="tableau-affine"
                  variant="new"
                  lead="Les deux nombres que tu règles au curseur se lisent aussi dans le tableau, à deux endroits précis."
                >
                  <NumericQuestion
                    prompt={<>Dans un tableau, on lit <MathText>{'$f(0) = 5$'}</MathText> et <MathText>{'$f(1) = 9$'}</MathText>. Que vaut <MathText>{'$a$'}</MathText> ?</>}
                    expected={4}
                    parse={parseDec}
                    display="4"
                    requires={['tableau-affine', 'coefficient-directeur']}
                    explain="Entre x = 0 et x = 1, x avance de 1 et f passe de 5 à 9 : il monte de 4. Donc a = 4 (et b = 5, la colonne x = 0)."
                    explainFor={(n) => {
                      if (n === 5) return 'Tu as donné la colonne x = 0 : c’est b, pas a. a est l’ÉCART d’une colonne à la suivante.';
                      if (n === 9) return 'Tu as donné la seconde image. a est l’écart entre les deux : 9 − 5.';
                      if (n === 14) return 'Tu as additionné les deux images. a est leur écart quand x avance de 1 : 9 − 5.';
                      return null;
                    }}
                    solved={tableDone}
                    onAnswered={(ok) => { setTableDone(true); kit.react(ok); }}
                  />
                </KnowledgeBrick>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Lis une droite muette',
          subtitle: 'Aucune expression affichée cette fois.',
          done: readDone,
          content: (kit) => (
            <div className="space-y-3">
              <CoordPlane
                range={RANGE}
                unit={30}
                functions={[{ id: 'r', a: READ.a, b: READ.b, tone: 'indigo' }]}
                intercept={{ y: READ.b }}
                staircase={{ from: { x: 0, y: READ.b }, a: READ.a, run: 1 }}
                ariaLabel="Repère : une droite dont il faut lire a et b"
                caption={false}
              />
              <KnowledgeBrick
                id="lire-a-et-b-graphique"
                variant="new"
                lead="Aucune expression affichée : tout est sur le dessin. Voici dans quel ordre le lire."
              >
                <TapQuestion
                  prompt="Quelle est l’expression de cette droite ?"
                  options={['f(x) = 2x − 3', 'f(x) = −3x + 2', 'f(x) = 2x + 3', 'f(x) = 3x − 2']}
                  correct={0}
                  cols={2}
                  requires={['lire-a-et-b-graphique', 'coefficient-directeur', 'ordonnee-origine']}
                  explain="La droite coupe l’axe vertical en −3, donc b = −3. L’escalier avance de 1 et monte de 2, donc a = 2. D’où f(x) = 2x − 3."
                  explainWrong="Ne confonds pas les deux rôles : le nombre lu sur l’axe vertical est b, celui de l’escalier est a."
                  solved={readDone}
                  onAnswered={(ok) => { setReadDone(true); kit.react(ok); }}
                />
              </KnowledgeBrick>
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le raccourci qui marche toujours',
          done: zeroDone,
          content: (kit) => (
            <KnowledgeBrick
              id="mem-f0-egale-b"
              variant="new"
              compact
              lead="Tu viens de le lire deux fois de suite : dans le tableau sous x = 0, et sur le graphique à l’axe vertical. C’est toujours le même nombre."
            >
              <TapQuestion
                prompt={<>Sans tracer : que vaut <MathText>{'$f(0)$'}</MathText> pour <MathText>{'$f(x) = -4x + 7$'}</MathText> ?</>}
                options={['7', '0', '−4', '3']}
                correct={0}
                cols={2}
                requires={['mem-f0-egale-b', 'ordonnee-origine']}
                explain="f(0) = −4 × 0 + 7 = 7. L’image de 0 est toujours b : c’est le raccourci le plus utile de la leçon."
                explainWrong="Remplace x par 0 : le terme en x disparaît et il ne reste que b."
                solved={zeroDone}
                onAnswered={(ok) => { setZeroDone(true); kit.react(ok); }}
              />
            </KnowledgeBrick>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Expression, tableau et graphique décrivent la{' '}
          <strong>même</strong> fonction affine. Reste à faire le chemin inverse : partir de
          deux points seulement, sans droite tracée, et retrouver{' '}
          <MathText>{'$a$'}</MathText> et <MathText>{'$b$'}</MathText>.
        </KnowledgeSnapshot>
      )}
    />
  );
}
