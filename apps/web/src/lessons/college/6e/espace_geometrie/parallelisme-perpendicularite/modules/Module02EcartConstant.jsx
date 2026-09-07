import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EcartGauge from '../components/EcartGauge';
import { relationOf, RELATIONS } from '../components/relationsUtils';

/**
 * Module 2 — DÉCOUVERTE, et l'interaction SIGNATURE de la leçon.
 *
 * Objectif : remplacer le critère impraticable (« prolonger à l'infini ») par
 * un critère mesurable ici et maintenant : l'écart est-il constant ?
 *
 * Aha : sur deux parallèles, on a beau déplacer le point, le nombre ne bouge
 * pas. Sur deux sécantes, il change à chaque déplacement.
 *
 * Misconception visée : mesurer l'écart « droit devant » plutôt que
 * perpendiculairement. Le connecteur est TOUJOURS le pied de la
 * perpendiculaire — c'est la définition qui dessine, pas l'intuition.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 190 };

const PAR = [
  { p: { x: 20, y: 60 }, angleDeg: 12, name: 'd₁' },
  { p: { x: 20, y: 130 }, angleDeg: 12, name: 'd₂' },
];
const SEC = [
  { p: { x: 20, y: 60 }, angleDeg: 12, name: 'e₁' },
  { p: { x: 20, y: 150 }, angleDeg: -6, name: 'e₂' },
];

export default function Module02EcartConstant() {
  const [tPar, setTPar] = useState(60);
  const [stampsPar, setStampsPar] = useState([]);
  const [parDone, setParDone] = useState(false);

  const [tSec, setTSec] = useState(60);
  const [stampsSec, setStampsSec] = useState([]);
  const [secDone, setSecDone] = useState(false);

  const [ruleDone, setRuleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="L’écart constant"
      moduleSubtitle="Si l’écart ne bouge jamais, elles sont parallèles."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Un critère mesurable, ici et maintenant.',
        body: (
          <p>
            Fais glisser le point <strong>P</strong> le long de la première droite et note plusieurs mesures.
            Regarde bien comment le trait de mesure rejoint l’autre droite : toujours de la même façon.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Mesure l’écart en 3 endroits — première paire',
          subtitle: 'Déplace P, puis « Noter cette mesure ».',
          done: parDone,
          content: (kit) => (
            <div className="space-y-3">
              <EcartGauge
                d1={PAR[0]}
                d2={PAR[1]}
                t={tPar}
                onTChange={setTPar}
                stamps={stampsPar}
                onStamp={(g) => {
                  const next = [...stampsPar, g];
                  setStampsPar(next);
                  if (next.length >= 3 && !parDone) {
                    kit.react(true);
                    setParDone(true);
                  }
                }}
                box={BOX}
                ariaLabel="Première paire : fais glisser P le long de d₁"
              />
              {parDone && (
                <>
                  <Feedback tone="ok">
                    Trois mesures, trois fois le même nombre. Ces deux droites gardent le{' '}
                    <strong>même écart partout</strong>.
                  </Feedback>
                  {/* Le geste vient d'établir le critère : on le pose ici, avec
                      la manière de mesurer qui l'accompagne. */}
                  <KnowledgeBrick
                    id="ecart-constant"
                    variant="new"
                    lead="Le nombre n’a pas bougé d’une mesure à l’autre : c’est exactement ce qu’on cherchait à vérifier."
                  />
                  <KnowledgeBrick
                    id="mesurer-ecart"
                    variant="new"
                    lead="Et le trait de mesure, lui, a toujours rejoint l’autre droite en formant un coin parfait."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Recommence avec la seconde paire',
          subtitle: 'Même geste, résultat différent.',
          done: secDone,
          content: (kit) => (
            <div className="space-y-3">
              <EcartGauge
                d1={SEC[0]}
                d2={SEC[1]}
                t={tSec}
                onTChange={setTSec}
                stamps={stampsSec}
                onStamp={(g) => {
                  const next = [...stampsSec, g];
                  setStampsSec(next);
                  if (next.length >= 3 && !secDone) {
                    kit.react(true);
                    setSecDone(true);
                  }
                }}
                box={BOX}
                ariaLabel="Seconde paire : fais glisser P le long de e₁"
              />
              {secDone && (
                <Feedback tone="ok">
                  Ici les mesures <strong>changent</strong> : l’écart se resserre d’un côté. Ces droites
                  finiront par se toucher — elles sont sécantes, pas parallèles.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le critère pratique',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="Comment reconnaître deux droites parallèles sans les prolonger à l’infini ?"
              options={[
                'En vérifiant que l’écart est le même partout',
                'En vérifiant qu’elles ne se touchent pas sur le dessin',
                'En vérifiant qu’elles ont la même longueur',
              ]}
              correct={0}
              cols={1}
              requires={['ecart-constant', 'droites-paralleles', 'mesurer-ecart']}
              explain="Écart constant ⟺ parallèles. C’est le critère qu’on peut vraiment vérifier, et c’est celui qu’on utilisera avec la règle et l’équerre."
              explainWrong="Une droite n’a pas de longueur (elle est infinie), et « ne pas se toucher sur le dessin » ne prouve rien — c’était exactement le piège du module 1."
              solved={ruleDone}
              onAnswered={() => setRuleDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Le coin parfait du trait de mesure revient sans arrêt. Il est
          temps de s’en occuper pour lui-même.
        </KnowledgeSnapshot>
      }
    />
  );
}
