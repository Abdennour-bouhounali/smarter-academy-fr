import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PointPlacer from '../components/PointPlacer';
import { RESERVOIR as R } from '../components/situationsData';
import { formatDec, evaluate, tableOf, planeFor } from '../components/modelUtils';

/**
 * Module 3 — DÉCOUVERTE : « Du tableau au graphique ».
 *
 * Activity: remplir le tableau de valeurs du réservoir en touchant des
 *   puces t = …, puis poser chaque ligne comme un point dans le repère,
 *   reconnaître la forme, lire le moment où le réservoir est vide.
 * Mathematical objective: construire un tableau à partir d'une situation
 *   (chaque colonne est un calcul de la règle), construire le graphique
 *   (chaque ligne est un point), et lire sur la forme le type de modèle
 *   (droite qui ne passe pas par O, décroissante).
 * Student action: toucher des puces ; déplacer le curseur, « Poser ».
 * Controlled variable: la valeur de t testée ; la position du curseur.
 * Mathematical state: `tested` (Set), `placed` (Set), `cursor` ; les cibles
 *   viennent de `tableOf(R.model, R.xs)`.
 * Visual consequence: le tableau se remplit ; chaque point posé se fixe ;
 *   un point mal posé reste en rouge avec l'écart écrit.
 * Expected observation: « les points sont alignés, la droite descend, elle
 *   coupe l'axe des temps à 12 min ».
 */

const ROWS = tableOf(R.model, R.xs);
const GEO = planeFor(ROWS, { maxTicks: 7, width: 320, height: 200 });
const NEEDED = [0, 4, 8, 12];

export default function Module03TableauGraphique() {
  const [tested, setTested] = useState(() => new Set());
  const [placed, setPlaced] = useState(() => new Set());
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [wrong, setWrong] = useState(null);
  const [misses, setMisses] = useState(0);
  const [shapeDone, setShapeDone] = useState(false);
  const [emptyDone, setEmptyDone] = useState(false);

  const targets = ROWS.filter((r) => NEEDED.includes(r.x));
  const tableDone = NEEDED.every((x) => tested.has(x));
  const placedDone = targets.every((r) => placed.has(r.x));

  const place = (kit) => {
    const hit = targets.find((r) => !placed.has(r.x) && r.x === cursor.x && r.y === cursor.y);
    if (hit) { setPlaced((s) => new Set(s).add(hit.x)); setWrong(null); kit.react(true); return; }
    const target = targets.find((r) => r.x === cursor.x && !placed.has(r.x));
    setWrong({ ...cursor, target });
    setMisses((m) => m + 1);
    kit.react(false);
  };
  const reveal = () => { setPlaced(new Set(targets.map((r) => r.x))); setWrong(null); };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Du tableau au graphique"
      moduleSubtitle="Remplis le tableau, pose les points, reconnais la forme."
      estimatedTime="9 min"
      brief={{
        tag: '🪣 Mission 03',
        title: 'Le réservoir qui se vide',
        tone: 'cyan',
        body: (
          <p>
            {R.text} Quand sera-t-il vide ? Construis le tableau, puis le graphique — et lis la réponse dessus.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Construis le tableau',
          subtitle: 'Touche t = 0, 4, 8 et 12 au moins : chaque colonne est un calcul de la règle 60 − 5t.',
          done: tableDone,
          content: (kit) => (
            <div className="space-y-3">
              <ValueTable columns={[{ id: 'v', label: 'volume (L) = 60 − 5 × t', fn: (t) => evaluate(R.model, t) }]} xs={R.xs} tested={tested}
                onTest={(x) => { setTested((s) => new Set(s).add(x)); kit.react(true); }} variable="t" compare={false} unit="L" caption="Le réservoir, minute par minute" />
              <Feedback tone={tableDone ? 'ok' : 'info'}>
                {tableDone ? <>À t = 12, le volume vaut {formatDec(evaluate(R.model, 12))} L : le réservoir est vide au bout de 12 minutes. Le tableau le dit déjà — le graphique va le montrer.</>
                  : <>Il manque {NEEDED.filter((x) => !tested.has(x)).map((x) => `t = ${x}`).join(', ')}.</>}
              </Feedback>
            </div>
          ),
        },
        {
          num: 2,
          title: 'Pose les points',
          subtitle: 'Déplace le curseur sur (t ; volume) pour t = 0, 4, 8, 12, puis « Poser ».',
          done: placedDone,
          content: (kit) => (
            <div className="space-y-3">
              <PointPlacer rows={targets} placed={placed} cursor={cursor} onCursorChange={(p) => { setCursor(p); setWrong(null); }} onPlace={() => place(kit)} wrong={wrong} geo={GEO} xLabel="min" yLabel="L" />
              {wrong && (
                <Feedback tone="ko">
                  ({formatDec(wrong.x)} ; {formatDec(wrong.y)}) n’est pas dans le tableau.{' '}
                  {wrong.target ? <>Pour t = {formatDec(wrong.target.x)}, le volume vaut {formatDec(wrong.target.y)} L : le curseur est {wrong.y > wrong.target.y ? `${formatDec(wrong.y - wrong.target.y)} L trop haut` : `${formatDec(wrong.target.y - wrong.y)} L trop bas`}.</>
                    : <>Choisis d’abord une abscisse du tableau : t = {targets.filter((r) => !placed.has(r.x)).map((r) => r.x).join(', ')}.</>}
                  {misses >= 3 && <> <button type="button" onClick={reveal} className="underline font-semibold text-cyan-800 focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Je ne trouve pas — montre-moi</button></>}
                </Feedback>
              )}
              {!wrong && !placedDone && <Feedback tone="info">{placed.size} point{placed.size > 1 ? 's' : ''} posé{placed.size > 1 ? 's' : ''} sur {targets.length}. Flèches du clavier ou glisser, puis « Poser ».</Feedback>}
              {placedDone && <Feedback tone="ok">Quatre points, une droite. Chaque ligne du tableau est devenue un point : le graphique est le tableau, dessiné.</Feedback>}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Lis la forme',
          subtitle: 'Que dit le dessin ?',
          done: shapeDone && emptyDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt="Les points sont alignés, mais la droite ne passe pas par l’origine et descend. Quel type de modèle est-ce ?"
                options={['Un modèle affine décroissant : volume = 60 − 5t', 'Un modèle proportionnel : le volume est proportionnel au temps', 'Une courbe : le réservoir se vide de plus en plus vite']}
                correct={0}
                cols={1}
                explain="Alignés → affine ; pas par O → part fixe (60 L au départ) ; qui descend → coefficient négatif (−5 L par minute). La forme du graphique dit la famille du modèle."
                solved={shapeDone}
                onAnswered={() => setShapeDone(true)}
              />
              {shapeDone && (
                <TapQuestion
                  prompt="Sur le graphique, où lit-on le moment où le réservoir est vide ?"
                  options={['Là où la droite coupe l’axe des temps : t = 12 min', 'Là où la droite coupe l’axe des volumes : 60 L', 'Nulle part : il faut le tableau']}
                  correct={0}
                  cols={1}
                  explain="Vide = volume 0 = la droite touche l’axe horizontal, à t = 12. Le tableau le disait (60 − 5 × 12 = 0) ; le graphique le montre d’un coup d’œil, et montrerait aussi 6 min (30 L) sans aucun calcul."
                  solved={emptyDone}
                  onAnswered={() => setEmptyDone(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>Tableau</strong> : une colonne = un calcul de la règle. <strong>Graphique</strong> : une ligne = un point. La forme (droite par O,
          droite, courbe) dit la famille du modèle. Et quand on n’a QUE des points — sans règle — comment retrouver le modèle ? Module suivant.
        </Feedback>
      }
    />
  );
}
