import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
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
          // L'instrument A CONSTRUIT la droite : elle est juste par
          // construction. On vérifie tout de même la relation obtenue —
          // c'est relationOf, et lui seul, qui prononce le verdict.
          const ok = relationOf(D, built) === (target === 'parallele' ? RELATIONS.paralleles : RELATIONS.perpendiculaires);
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
            <Construction
              target="perpendiculaire"
              point={A}
              done={perpDone}
              onDone={() => setPerpDone(true)}
              react={kit.react}
              hint="Pose un côté de l’équerre le long de d, et amène son sommet sur A. Le bouton Tracer s’activera."
              ariaLabel="Construis la perpendiculaire à d passant par A"
            />
          ),
        },
        {
          num: 2,
          title: 'Trace la parallèle à d passant par B',
          subtitle: 'B n’est pas sur la droite d.',
          done: parDone,
          content: (kit) => (
            <Construction
              target="parallele"
              point={B}
              done={parDone}
              onDone={() => setParDone(true)}
              react={kit.react}
              hint="Même rituel : un côté le long de d, le sommet amené sous B. L’équerre garde l’inclinaison de d."
              ariaLabel="Construis la parallèle à d passant par B"
            />
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
              explain="C’est la propriété rencontrée au module 4 : si d′ ⊥ c et d ⊥ c, alors d′ // d. Deux angles droits sur la même droite forcent la même inclinaison."
              explainWrong="Une perpendiculaire n’est jamais parallèle à la droite qu’elle croise. La bonne raison est la propriété du module 4 : perpendiculaires à une MÊME troisième droite ⇒ parallèles entre elles."
              solved={methodDone}
              onAnswered={() => setMethodDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
        >
          <Compass className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Construire, ce n’est pas dessiner à l’œil : c’est poser un instrument qui{' '}
            <strong className="text-white">garantit</strong> la propriété voulue. L’angle droit de l’équerre
            fait tout le travail.
          </p>
        </motion.div>
      }
    />
  );
}
