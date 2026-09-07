import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VirtualEquerre from '../components/VirtualEquerre';
import {
  relationOf, RELATIONS, RELATION_LABEL, distanceTo, perpendicularThroughPoint,
} from '../components/relationsUtils';

/**
 * Module 7 — PRACTICE LAB : construire (P8, P9).
 *
 * Objectif : l'instrument devient CONSTRUCTEUR. Bien posé, il produit la
 * droite lui-même — un placement correct ne peut donc pas donner une droite
 * incorrecte.
 *
 * Aha : pour tracer une PARALLÈLE, on trace deux perpendiculaires. La
 * propriété du module 4 (« deux perpendiculaires à une même droite sont
 * parallèles ») devient une méthode de construction.
 *
 * Misconception visée : croire qu'on trace une parallèle « à l'œil, en
 * gardant la même pente ». La construction rigoureuse passe par l'angle droit.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 };
const D = { p: { x: 20, y: 145 }, angleDeg: 0, name: 'd' };
const A = { x: 200, y: 145 };  // sur d — pour la perpendiculaire
const B = { x: 120, y: 70 };   // hors de d — pour la parallèle

function Construction({ target, point, done, onDone, react, ariaLabel, hint }) {
  const [equerre, setEquerre] = useState({ p: { x: 70, y: 90 }, angleDeg: 40 });
  const [drawn, setDrawn] = useState(null);

  return (
    <div className="space-y-3">
      {/* L'instrument reste MANIPULABLE après la réussite (règle projet du
          2026-09-06) : reposer l'équerre ailleurs et re-tracer est exactement
          la façon dont on vérifie qu'une construction n'était pas un coup de
          chance. Seule la validation de l'étape, elle, ne se rejoue pas. */}
      <VirtualEquerre
        line={D}
        point={point}
        equerre={equerre}
        onEquerreChange={setEquerre}
        mode="construct"
        construct={target}
        drawn={drawn}
        onTrace={(built) => {
          setDrawn(built);
          // L'instrument A CONSTRUIT la droite : elle est juste par
          // construction. On vérifie tout de même la relation obtenue —
          // c'est relationOf, et lui seul, qui prononce le verdict.
          const ok = relationOf(D, built) === (target === 'parallele' ? RELATIONS.paralleles : RELATIONS.perpendiculaires);
          if (done) return;           // l'étape ne se revalide pas…
          react(ok);
          if (ok) onDone();
        }}
        box={BOX}
        ariaLabel={ariaLabel}
      />

      {!done && !drawn && <Feedback tone="info">{hint}</Feedback>}

      {done && drawn && (
        <Feedback tone="ok">
          Tracé : la droite d′ est <strong>{RELATION_LABEL[relationOf(D, drawn)]}</strong> à d, et elle passe
          bien par le point.
          {target === 'parallele' && (
            <> Elle reste à <strong>{Math.round(distanceTo(D, point))}</strong> de d, partout.</>
          )}
        </Feedback>
      )}
    </div>
  );
}

export default function Module07AtelierConstruction() {
  const [perpDone, setPerpDone] = useState(false);
  const [parDone, setParDone] = useState(false);
  const [methodDone, setMethodDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="L’atelier de construction"
      moduleSubtitle="Trace la perpendiculaire, puis la parallèle — avec les instruments."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 07',
        title: 'L’équerre ne sert pas qu’à vérifier : elle trace.',
        body: (
          <p>
            Pose-la correctement — les deux voyants allumés — puis appuie sur <strong>Tracer</strong>. Le
            bouton reste inactif tant que le placement n’est pas juste.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trace la perpendiculaire à d passant par A',
          subtitle: 'A est sur la droite d.',
          done: perpDone,
          content: (kit) => (
            <div className="space-y-5">
              <Construction
                target="perpendiculaire"
                point={A}
                done={perpDone}
                onDone={() => setPerpDone(true)}
                react={kit.react}
                hint="Pose un côté de l’équerre le long de d, et amène son sommet sur A. Le bouton Tracer s’activera."
                ariaLabel="Construis la perpendiculaire à d passant par A"
              />
              {perpDone && (
                <KnowledgeBrick
                  id="unicite-perpendiculaire"
                  variant="new"
                  lead="Une fois l’équerre bien posée, il n’y avait qu’un seul trait possible."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Trace la parallèle à d passant par B',
          subtitle: 'B n’est pas sur la droite d.',
          done: parDone,
          content: (kit) => (
            <div className="space-y-5">
              <Construction
                target="parallele"
                point={B}
                done={parDone}
                onDone={() => setParDone(true)}
                react={kit.react}
                hint="Même rituel : un côté le long de d, le sommet amené sous B. L’équerre garde l’inclinaison de d."
                ariaLabel="Construis la parallèle à d passant par B"
              />
              {parDone && (
                <KnowledgeBrick
                  id="construire-parallele"
                  variant="new"
                  lead="Tu n’as pas visé « la même pente » à l’œil : c’est l’angle droit de l’équerre qui a fait le travail."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Pourquoi ça marche',
          done: methodDone,
          content: (
            <TapQuestion
              prompt="Sur papier, une méthode classique pour tracer une parallèle consiste à tracer DEUX perpendiculaires successives. Pourquoi obtient-on bien une parallèle ?"
              options={[
                'Parce que deux droites perpendiculaires à une même droite sont parallèles entre elles',
                'Parce que deux angles droits font 180°',
                'Parce qu’une perpendiculaire est toujours parallèle',
              ]}
              correct={0}
              cols={1}
              requires={['construire-parallele', 'mem-deux-perp', 'droites-perpendiculaires', 'droites-paralleles']}
              explain="C’est la propriété rencontrée au module 4 : si d′ ⊥ c et d ⊥ c, alors d′ // d. Deux angles droits sur la même droite forcent la même inclinaison."
              explainWrong="Une perpendiculaire n’est jamais parallèle à la droite qu’elle croise. La bonne raison est la propriété du module 4 : perpendiculaires à une MÊME troisième droite ⇒ parallèles entre elles."
              solved={methodDone}
              onAnswered={() => setMethodDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Une dernière question : à quoi sert vraiment une perpendiculaire,
          dans la vie ?
        </KnowledgeSnapshot>
      }
    />
  );
}
