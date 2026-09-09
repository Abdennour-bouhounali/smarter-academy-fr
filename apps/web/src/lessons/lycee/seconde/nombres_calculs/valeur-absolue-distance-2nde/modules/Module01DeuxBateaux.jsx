import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DistanceLine from '../components/DistanceLine';
import Stepper from '../components/Stepper';
import { abs } from '../components/absUtils';

/**
 * Module 1 — TRIGGER : « Deux bateaux, une distance » (signature).
 *
 * Activity: déplacer un bateau sur une côte graduée (phare en 0) et lire
 *   sa distance au phare ; trouver LES positions à 5 km.
 * Mathematical objective: la distance à 0 est une longueur, la même pour x
 *   et −x — c'est ce que la notation |x| va nommer en conclusion.
 * Student action: prédiction sans verdict (−4 ou +4 : lequel est plus
 *   loin ?), curseur/stepper sur x, recherche des deux positions à 5 km.
 * Controlled variable: x.
 * Mathematical state: x, l'ensemble des positions « à 5 km » visitées.
 * Visual consequence: la barre verte s'étire, sa longueur s'écrit ; le
 *   jumeau fantôme −x apparaît à l'étape 2.
 * Expected observation (aha) : −5 et 5 donnent la même barre ; il y a DEUX
 *   positions à 5 km, une de chaque côté ; la distance n'est jamais négative.
 * Misconception targeted: « −4 est plus loin que 4 », « la distance de −5
 *   au phare est −5 ».
 * Formalization: |x| nommé à l'étape 3 seulement, comme le nom de la barre.
 */
export default function Module01DeuxBateaux() {
  const [prediction, setPrediction] = useState(null);
  const [x, setX] = useState(3);
  const [visited, setVisited] = useState(() => new Set());
  const [fives, setFives] = useState(() => new Set());
  const [readDone, setReadDone] = useState(false);

  const moveX = (v) => {
    setX(v);
    const s = new Set(visited); s.add(v); setVisited(s);
    if (abs(v) === 5) { const f = new Set(fives); f.add(v); setFives(f); }
  };
  const exploreDone = visited.has(-4) && visited.has(4);
  const fivesDone = fives.has(5) && fives.has(-5);

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Deux bateaux, une distance"
      moduleSubtitle="Un phare en 0, une côte graduée en km. Déplace le bateau : à quelle distance du phare est-il ?"
      estimatedTime="8 min"
      brief={{ tag: '🌊 Mission 01', title: 'Le phare est au kilomètre 0. À l’ouest les kilomètres sont négatifs, à l’est positifs.', tone: 'indigo', body: <p>Le bateau B est au km −4, le bateau C au km +4. Lequel est le plus loin du phare ? Ne réponds pas de tête : déplace le bateau.</p> }}
      steps={[
        {
          num: 1, title: 'Déplace le bateau', subtitle: 'Amène-le au km −4, puis au km +4. Lis la distance au phare.', done: exploreDone,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="B (km −4) ou C (km +4), lequel est le plus loin du phare ?" options={[{ id: 'B', label: 'B (km −4) est plus loin' }, { id: 'C', label: 'C (km +4) est plus loin' }, { id: 'egal', label: 'Ils sont aussi loin' }]} value={prediction} onChange={setPrediction} disabled={exploreDone} />
              <DistanceLine x={x} onX={moveX} unit="km" labelX="bateau" min={-10} max={10} step={1} snap={0.5} />
              <Stepper label="bateau" value={x} onChange={(v) => { moveX(v); if ((v === -4 && visited.has(4)) || (v === 4 && visited.has(-4))) kit.react(true); }} min={-10} max={10} step={0.5} unit=" km" />
              {exploreDone ? (
                <Feedback tone="ok">
                  {prediction === 'egal' ? 'Ta prédiction : aussi loin. La côte confirme' : prediction ? `Ta prédiction : ${prediction === 'B' ? 'B' : 'C'} est plus loin. La côte te contredit` : 'La côte tranche'} : au km −4 comme au km +4, la barre mesure <strong>4 km</strong>. Une distance est une longueur : elle ne regarde pas le sens, et elle n’est jamais négative.
                </Feedback>
              ) : (
                <Feedback tone="info">Bateau au km {x} : distance au phare {abs(x)} km. {visited.has(-4) ? 'Maintenant le km +4.' : visited.has(4) ? 'Maintenant le km −4.' : 'Va au km −4, puis au km +4.'}</Feedback>
              )}
              {/* Le geste vient de montrer que la barre est une LONGUEUR, la
                  même des deux côtés du phare : c'est l'instant où « distance
                  à 0 » et « jamais négative » ont un sens. */}
              {exploreDone && (
                <KnowledgeBrick
                  id="valeur-absolue-distance-zero"
                  variant="new"
                  compact
                  lead={<>Tu viens de mesurer la barre au km −4 <strong>et</strong> au km +4 : même longueur, <strong>4 km</strong>.</>}
                />
              )}
              {exploreDone && (
                <KnowledgeBrick
                  id="mem-valeur-absolue-positive"
                  variant="new"
                  compact
                  lead={<>Une barre ne mesure jamais moins que 0.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Trouve toutes les positions à 5 km du phare', subtitle: 'Il y en a plus d’une. Le point creux montre le jumeau du bateau.', done: fivesDone,
          content: (kit) => (
            <div className="space-y-3">
              <DistanceLine x={x} onX={(v) => { moveX(v); if (abs(v) === 5 && !fives.has(v)) kit.react(true); }} unit="km" labelX="bateau" showTwin min={-10} max={10} step={1} snap={0.5} />
              <Stepper label="bateau" value={x} onChange={(v) => { moveX(v); if (abs(v) === 5 && !fives.has(v)) kit.react(true); }} min={-10} max={10} step={0.5} unit=" km" />
              {fivesDone ? (
                <Feedback tone="ok">Deux positions, <strong>−5</strong> et <strong>5</strong> : un nombre et son opposé sont à la même distance de 0. Le jumeau creux le montrait à chaque position : x et −x, même barre.</Feedback>
              ) : (
                <Feedback tone="info">{fives.size === 0 ? 'Cherche une position où la barre mesure 5 km.' : `Une position trouvée (${[...fives][0]}). Il y en a une autre, de l’autre côté du phare.`}</Feedback>
              )}
              {/* Les deux positions trouvées (−5 et 5) viennent de montrer la
                  règle ; la question de l'étape 3 va l'exiger. */}
              {fivesDone && (
                <KnowledgeBrick
                  id="regle-opposes-meme-distance"
                  variant="new"
                  compact
                  lead={<>−5 et 5 : deux positions <strong>opposées</strong>, une seule et même distance au phare.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Le nom de la barre', done: readDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">La distance d’un nombre x au phare (à 0) se note <span className="font-mono font-bold text-slate-900">|x|</span>, et se lit « valeur absolue de x ». Tu viens de constater |−4| = |4| = 4 et |−5| = |5| = 5.</p>
              <TapQuestion
                prompt="Combien vaut |−7| ?"
                options={['−7', '7', '0']} cols={3} correct={1}
                requires={['valeur-absolue-distance-zero', 'mem-valeur-absolue-positive', 'nombres-relatifs']}
                explain="|−7| est la distance de −7 à 0 : 7 km de barre. Une valeur absolue est une longueur, jamais négative."
                explainWrong="|−7| est une DISTANCE : celle de −7 au phare. La barre mesure 7, pas −7. Une valeur absolue n’est jamais négative."
                solved={readDone} onAnswered={() => setReadDone(true)} />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          Mais comment la CALCULER sans dessiner ? C’est le module suivant.
        </KnowledgeSnapshot>
      )}
    />
  );
}
