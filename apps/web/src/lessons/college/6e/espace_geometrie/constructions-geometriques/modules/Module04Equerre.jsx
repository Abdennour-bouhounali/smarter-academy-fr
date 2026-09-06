import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VirtualEquerre from '../../parallelisme-perpendicularite/components/VirtualEquerre';
import {
  relationOf, RELATIONS, RELATION_LABEL,
} from '../../parallelisme-perpendicularite/components/relationsUtils';

/**
 * Module 4 — MANIPULATION : l'équerre (P2, P6, P7).
 *
 * RÉUTILISATION ASSUMÉE : l'équerre virtuelle vient de la leçon
 * « Parallélisme et perpendicularité ». C'est délibéré — le playbook demande
 * que la familiarité des outils s'accumule d'une leçon à l'autre. L'élève
 * retrouve le rituel qu'il connaît déjà, et l'applique ici à la CONSTRUCTION
 * d'une figure plutôt qu'à la vérification d'une relation.
 *
 * Aha : perpendiculaire et parallèle se construisent avec le MÊME instrument
 * et le même geste ; seule change la face de l'équerre qu'on suit.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 };
const D = { p: { x: 20, y: 145 }, angleDeg: 0, name: 'd' };
const A = { x: 200, y: 145 };
const B = { x: 120, y: 70 };

function Construction({ target, point, done, onDone, react, hint, ariaLabel }) {
  const [equerre, setEquerre] = useState({ p: { x: 70, y: 90 }, angleDeg: 40 });
  const [drawn, setDrawn] = useState(null);
  const [tries, setTries] = useState(0);

  return (
    <div className="space-y-3">
      <VirtualEquerre
        line={D}
        point={point}
        equerre={equerre}
        onEquerreChange={(next) => { if (!done) setEquerre(next); }}
        mode="construct"
        construct={target}
        drawn={drawn}
        onTrace={(built) => {
          if (done) return;
          setDrawn(built);
          const attendu = target === 'parallele' ? RELATIONS.paralleles : RELATIONS.perpendiculaires;
          const ok = relationOf(D, built) === attendu;
          react(ok);
          if (ok) onDone();
        }}
        box={BOX}
        disabled={done}
        ariaLabel={ariaLabel}
      />

      {!done && !drawn && <Feedback tone="info">{hint}</Feedback>}

      {done && drawn && (
        <Feedback tone="ok">
          Tracé : la droite obtenue est <strong>{RELATION_LABEL[relationOf(D, drawn)]}</strong> à (d), et
          elle passe bien par le point. L’instrument a garanti la propriété — pas l’œil.
        </Feedback>
      )}
    </div>
  );
}

export default function Module04Equerre() {
  const [perpDone, setPerpDone] = useState(false);
  const [parDone, setParDone] = useState(false);
  const [memeDone, setMemeDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="L’équerre"
      moduleSubtitle="Perpendiculaire, puis parallèle : un seul rituel."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Tu connais déjà ce geste.',
        body: (
          <p>
            Le rituel de l’équerre — <strong>un côté sur la droite, le sommet sur le point</strong> — sert
            ici à <strong>construire</strong>, pas seulement à vérifier.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Construis la perpendiculaire à (d) passant par A',
          done: perpDone,
          content: (kit) => (
            <div className="space-y-5">
              <Construction
                target="perpendiculaire"
                point={A}
                done={perpDone}
                onDone={() => setPerpDone(true)}
                react={kit.react}
                hint="Pose un côté de l’équerre le long de (d), amène son sommet sur A, puis trace."
                ariaLabel="Construis la perpendiculaire à d passant par A"
              />

              {/* Le rituel vient d'être exécuté à la main : on le fixe en
                  méthode, avant la construction de la parallèle. */}
              {perpDone && (
                <KnowledgeBrick
                  id="construire-perpendiculaire"
                  variant="new"
                  lead="Les deux conditions que tu viens de réunir — côté sur (d), sommet sur A — sont la méthode entière."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Construis la parallèle à (d) passant par B',
          done: parDone,
          content: (kit) => (
            <div className="space-y-5">
              <Construction
                target="parallele"
                point={B}
                done={parDone}
                onDone={() => setParDone(true)}
                react={kit.react}
                hint="Même rituel, mais on suit l’autre côté de l’équerre : celui qui reste parallèle à (d)."
                ariaLabel="Construis la parallèle à d passant par B"
              />

              {/* Le même instrument vient de donner un résultat différent :
                  la seconde méthode se pose ici, avant la question qui
                  demande d'expliquer pourquoi une seule équerre suffit. */}
              {parDone && (
                <KnowledgeBrick
                  id="construire-parallele"
                  variant="new"
                  lead="Même équerre, autre côté suivi — et cette fois la droite ne coupe jamais (d)."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Un instrument, deux constructions',
          done: memeDone,
          content: (
            <TapQuestion
              prompt="Comment une seule équerre permet-elle de tracer aussi bien une perpendiculaire qu’une parallèle ?"
              options={[
                'Ses deux côtés forment un angle droit : l’un donne la perpendiculaire, l’autre la parallèle',
                'Il faut deux équerres différentes',
                'On trace la parallèle à l’œil, après la perpendiculaire',
              ]}
              correct={0}
              cols={1}
              requires={['construire-perpendiculaire', 'construire-parallele', 'angle-droit', 'droites-paralleles']}
              explain="L’angle droit de l’équerre relie les deux constructions : suivre un côté donne la perpendiculaire, suivre l’autre donne la parallèle. C’est aussi pourquoi deux perpendiculaires à une même droite sont parallèles entre elles."
              explainWrong="Une seule équerre suffit : son angle droit porte les deux directions à la fois. Rien n’est tracé à l’œil."
              solved={memeDone}
              onAnswered={() => setMemeDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu possèdes les trois gestes. Le module suivant les enchaîne :
          une figure entière, étape par étape.
        </KnowledgeSnapshot>
      }
    />
  );
}
