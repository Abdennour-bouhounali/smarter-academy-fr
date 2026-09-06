import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GraphBuilder from '../components/GraphBuilder';
import { RESERVOIR, VENTES } from '../components/graphData';
import { scaleChoices, bestStep, rangeFor, fitsIn, joinDecision } from '../components/graphUtils';
import { formatDec } from '@smarter-academy/core';

/**
 * Module 4 — MANIPULATION SIGNATURE : « L'atelier du graphique ».
 *
 * Activity: construire un graphique de bout en bout — axes, échelle, points,
 *   tracé — puis décider s'il faut relier.
 * Mathematical objective: un graphique est une SUITE DE DÉCISIONS. Chacune se
 *   justifie, et une seule mauvaise décision (l'échelle) suffit à rendre le
 *   graphique inutilisable.
 * Student action: choisir l'axe, toucher une pastille d'échelle, poser chaque
 *   point, basculer « relier ».
 * Controlled variable: le pas de l'échelle, puis la position du point courant.
 * Mathematical state: { step, placed[], joined } — le cadre, les graduations
 *   et la liste des valeurs hors cadre en dérivent (`fitsIn`).
 * Visual consequence: un pas trop fin fait SORTIR des valeurs du cadre, et
 *   elles sont annoncées en clair au lieu d'être dessinées dehors.
 * Expected observation: « avec 5 par carreau, mes 60 L ne rentrent pas ».
 * Misconception targeted: choisir l'échelle après avoir placé les points ;
 *   relier des données discrètes.
 * Feedback: l'écart de placement est dit en mots ; les valeurs hors cadre sont
 *   listées ; échappée après 3 essais.
 * Formalization: la suite des quatre décisions est nommée en pied de module.
 * Scaffolding: axes guidés → échelle libre → points → tracé → cas discret.
 * Transfer: le module 6 fait réparer les graphiques mal construits.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Deux décisions neuves, chacune posée après le geste qui la justifie :
 *     étape 2  essayer les pas, voir sortir 60 L → brique `choisir-une-echelle`
 *     étape 4  basculer « relier »              → brique `relier-ou-non`
 *     étape 5  le cas discret (la question d'origine, désormais légitime), puis
 *              la brique `mem-quatre-decisions` qui récapitule l'ordre.
 *   Les étapes 1 et 3 réemploient ce que les modules 1 et 3 ont établi.
 */

const DATA = RESERVOIR;
const CHOICES = scaleChoices(DATA.rows.map((r) => r.y), 12, [2, 5, 10, 20]);
const GOOD = bestStep(DATA.rows.map((r) => r.y), 12, [2, 5, 10, 20]);

export default function Module04Atelier() {
  const [axisDone, setAxisDone] = useState(false);
  const [step, setStep] = useState(2);
  const [scaleSeen, setScaleSeen] = useState(() => new Set([2]));
  const [cur, setCur] = useState({ x: 0, y: 0 });
  const [placed, setPlaced] = useState([]);
  const [wrong, setWrong] = useState(null);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [joined, setJoined] = useState(false);
  const [discreteDone, setDiscreteDone] = useState(false);

  // L'échelle est « bonne » quand plus rien ne sort du cadre.
  const outside = fitsIn(rangeFor(step, 12), DATA.rows.map((r) => r.y)).outside;
  const scaleOk = outside.length === 0;
  const done2 = scaleOk && scaleSeen.size >= 2;

  const idx = placed.length;
  const target = idx < DATA.rows.length ? DATA.rows[idx] : null;
  const done3 = placed.length === DATA.rows.length || revealed;
  const done4 = joined;

  const chooseStep = (s, kit) => {
    setStep(s);
    setScaleSeen((prev) => new Set(prev).add(s));
    setPlaced([]);
    setWrong(null);
    kit.react(true);
  };

  const validate = (kit) => {
    if (done3 || !target) return;
    if (cur.x === target.x && cur.y === target.y) {
      setPlaced((p) => [...p, { x: cur.x, y: cur.y }]);
      setWrong(null);
      kit.react(true);
    } else {
      setWrong({ placed: { ...cur }, target });
      setTries((t) => t + 1);
      kit.react(false);
    }
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="L’atelier du graphique"
      moduleSubtitle="Axes, échelle, points, tracé : construis le graphique de bout en bout."
      estimatedTime="11 min"
      brief={{
        tag: '🛠️ Mission 04',
        title: 'Quatre décisions, un graphique',
        tone: 'indigo',
        body: (
          <p>
            Le tableau du réservoir est là. À toi de le mettre en image : d’abord les axes,
            puis l’échelle, puis les points, puis le tracé.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Décision 1 — les axes',
          done: axisDone,
          content: (
            <TapQuestion
              prompt="Quelle grandeur mettre sur l’axe horizontal ?"
              options={[
                'Le temps, car le volume en dépend',
                'Le volume, car c’est ce qu’on mesure',
                'Peu importe, les deux marchent',
              ]}
              correct={0}
              cols={1}
              explain="L’axe horizontal porte la grandeur dont l’autre dépend. Le volume restant dépend du temps écoulé : le temps va donc en abscisse."
              explainWrong="Demande-toi laquelle des deux commande l’autre : c’est le temps qui passe et fait baisser le volume, pas l’inverse."
              requires={['choix-des-axes', 'abscisse']}
              solved={axisDone}
              onAnswered={() => setAxisDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Décision 2 — l’échelle',
          subtitle: 'Essaie plusieurs pas, et trouve celui qui fait tout tenir.',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <GraphBuilder
                rows={DATA.rows}
                step={step}
                xStep={1}
                onStepChange={(s) => chooseStep(s, kit)}
                stepChoices={CHOICES}
                targetIndex={-1}
                axisLabels={{ x: 'min', y: 'L' }}
              />
              {!done2 && (
                <Feedback tone="info">
                  {scaleOk
                    ? <>Ça rentre. Essaie une autre échelle pour voir ce qui se passe quand elle est trop fine.</>
                    : <>Change d’échelle : il faut que la plus grande valeur (60 L) tienne dans les douze carreaux.</>}
                </Feedback>
              )}
              {done2 && (
                <KnowledgeBrick
                  id="choisir-une-echelle"
                  variant="new"
                  lead={(
                    <>
                      Avec <strong>{formatDec(step)} L par carreau</strong>, les quatre valeurs
                      tiennent — et tu as vu ce qui se passe quand le pas est trop fin.
                    </>
                  )}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Décision 3 — les points',
          subtitle: 'Pose les quatre relevés.',
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <GraphBuilder
                rows={DATA.rows}
                step={GOOD}
                xStep={1}
                current={cur}
                onCurrentChange={(p) => { setCur(p); setWrong(null); }}
                placed={placed}
                onValidate={() => validate(kit)}
                targetIndex={done3 ? -1 : idx}
                showTarget={placed.length === 0}
                lastError={wrong}
                axisLabels={{ x: 'min', y: 'L' }}
              />
              {!done3 && tries >= 3 && (
                <button
                  type="button"
                  onClick={() => { setPlaced(DATA.rows.map((r) => ({ x: r.x, y: r.y }))); setRevealed(true); setWrong(null); kit.react(false); }}
                  className="w-full min-h-[44px] rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                  style={{ touchAction: 'manipulation' }}
                >
                  Je ne trouve pas — montre-moi les points
                </button>
              )}
              {done3 && (
                <Feedback tone={revealed ? 'info' : 'ok'}>
                  {revealed ? 'On te les montre. ' : 'Les quatre relevés sont posés. '}
                  Reste une décision : faut-il les relier ?
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Décision 4 — relier ou non',
          done: done4,
          content: (kit) => (
            <div className="space-y-3">
              <GraphBuilder
                rows={DATA.rows}
                step={GOOD}
                xStep={1}
                placed={DATA.rows.map((r) => ({ x: r.x, y: r.y }))}
                targetIndex={-1}
                joined={joined}
                onJoinChange={(v) => { setJoined(v); if (v) kit.react(true); }}
                showJoin
                axisLabels={{ x: 'min', y: 'L' }}
              />
              {!joined && (
                <Feedback tone="info">
                  Le volume baisse-t-il aussi entre deux relevés ? Si oui, le trait a un sens.
                </Feedback>
              )}
              {joined && (
                <KnowledgeBrick
                  id="relier-ou-non"
                  variant="new"
                  lead="Tu as relié : le volume existe à chaque instant, pas seulement aux minutes mesurées. Mais ce n’est pas toujours le cas."
                />
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Le cas où l’on ne relie pas',
          done: discreteDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="On note le nombre de cahiers vendus chaque jour. Faut-il relier les points ?"
                options={[
                  'Non : il n’y a rien entre le jour 1 et le jour 2',
                  'Oui : cela montre mieux l’évolution',
                  'Oui, toujours, sur tous les graphiques',
                ]}
                correct={0}
                cols={1}
                requires={['relier-ou-non']}
                explain="Relier voudrait dire qu’il existe une valeur au « jour 1,5 » — ce qui n’a pas de sens pour des cahiers vendus par journée."
                explainWrong="Demande-toi si un point entre les deux aurait un sens. Pour un volume qui coule, oui ; pour des ventes par jour, non."
                solved={discreteDone}
                onAnswered={() => setDiscreteDone(true)}
              />
              {discreteDone && (
                <KnowledgeBrick
                  id="mem-quatre-decisions"
                  variant="new"
                  compact
                  lead="Tu viens de prendre les quatre décisions, dans l’ordre. C’est cet ordre qu’il faut retenir."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          Tu sais construire. Reste à LIRE : au module suivant, quatre graphiques racontent
          quatre histoires différentes — sans une seule unité.
        </KnowledgeSnapshot>
      }
    />
  );
}
