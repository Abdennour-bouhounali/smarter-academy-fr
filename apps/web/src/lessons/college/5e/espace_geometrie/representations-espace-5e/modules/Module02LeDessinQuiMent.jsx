import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidTurner from '../../../../../common/components/SolidTurner';
import { SOLIDS } from '../../../../../common/utils/geometry3d';

/**
 * Module 2 — DÉCOUVERTE : la perspective cavalière est une convention.
 *
 * L'élève TOURNE le prisme et constate deux choses qu'aucun texte ne lui a
 * annoncées : la face avant garde ses vraies mesures, et les arêtes passent
 * du pointillé au trait plein selon le point de vue.
 *
 * La visibilité est CALCULÉE par `visibleEdges` (module 3D partagé) : aucun
 * appelant ne peut demander « dessine cette arête en pointillé ». Le dessin ne
 * peut donc pas mentir sur ce qui est caché — c'est la garantie qui rend la
 * découverte honnête.
 *
 * Misconception targeted (M1) : croire que le dessin est une photographie, et
 * s'étonner qu'un carré s'y dessine comme un parallélogramme.
 *
 * PÉRIMÈTRE : on lit la perspective, on ne la construit pas à la règle et au
 * compas, et on ne compte pas faces/arêtes/sommets pour eux-mêmes (6e, puis
 * relation d'Euler en 3e).
 */
export default function Module02LeDessinQuiMent() {
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [tourne, setTourne] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const bouger = (setter) => (v, react) => {
    setter(v);
    if (!tourne) { setTourne(true); react?.(true); }
  };

  const steps = [
    {
      num: 1,
      title: 'Tourne la boîte de chocolats',
      subtitle: 'Regarde ce qui change, et surtout ce qui ne change pas.',
      done: tourne,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3.5 text-sm text-slate-700">
            Voici le dessin de la boîte de chocolats. Fais-la tourner : les arêtes{' '}
            <strong>en pointillé</strong> sont celles que le carton lui-même cacherait.
          </div>

          <SolidTurner
            solid={SOLIDS.prisme}
            yaw={yaw}
            pitch={pitch}
            onYawChange={(v) => bouger(setYaw)(v, kit.react)}
            onPitchChange={(v) => bouger(setPitch)(v, kit.react)}
            ariaLabel="Prisme droit à base triangulaire, orientable"
          />

          {tourne ? (
            <Feedback tone="ok">
              Les pointillés se déplacent : une arête <strong>cachée</strong> sous un angle devient{' '}
              <strong>visible</strong> sous un autre. Ce n’est pas l’arête qui change, c’est le
              point de vue — le dessin montre une chose <em>et</em> ce qu’elle cache.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Utilise les réglages pour faire pivoter la boîte, et suis une arête en pointillé du
              regard.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un dessin qui ment un peu — mais toujours de la même façon',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="perspective-cavaliere"
            variant="new"
            lead={<>Le dessin que tu viens de tourner obéit à une règle précise, choisie par convention.</>}
          />
          <TapQuestion
            prompt="Sur un dessin en perspective cavalière, que devient un carré vu en fuyante ?"
            options={[
              'Un parallélogramme : c’est la convention, pas une erreur',
              'Un carré, toujours : sinon le dessin serait faux',
              'Un cercle',
              'Un triangle',
            ]}
            correct={0}
            cols={1}
            requires={['perspective-cavaliere']}
            explain="Les fuyantes partent en biais et sont raccourcies : un carré vu en fuyante se dessine donc comme un parallélogramme. Le dessin déforme volontairement la profondeur pour garder la face avant mesurable."
            explainWrong="Seule la FACE AVANT est dessinée en vraie grandeur. Ce qui part vers l’arrière est tracé en biais et raccourci : le carré devient un parallélogramme. Ce n’est pas une erreur de dessin, c’est la règle de la convention."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Fuyantes et arêtes cachées',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="fuyante"
            variant="new"
            lead={<>Deux mots pour ce que tu as vu bouger : celles qui partent en arrière, et celles qu’on ne verrait pas.</>}
          />
          <TapQuestion
            prompt="Pourquoi trace-t-on certaines arêtes en pointillé plutôt que de ne pas les dessiner du tout ?"
            options={[
              'Pour montrer qu’elles existent, tout en disant qu’elles sont cachées',
              'Pour décorer le dessin',
              'Parce qu’elles sont plus courtes que les autres',
              'Parce qu’elles ne font pas vraiment partie du solide',
            ]}
            correct={0}
            cols={1}
            requires={['fuyante', 'perspective-cavaliere', 'arete']}
            explain="Le pointillé dit deux choses à la fois : cette arête fait bien partie du solide, et depuis ce point de vue on ne la verrait pas. Les effacer donnerait un dessin incomplet ; les tracer en plein ferait croire qu’on les voit."
            explainWrong="Une arête cachée est une vraie arête du solide : elle a la même longueur que sa symétrique et appartient bien au carton. Le pointillé sert justement à la montrer sans prétendre qu’on la voit."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le dessin qui ment un peu"
      moduleSubtitle="La perspective cavalière est une convention, pas une photo"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Montrer un objet en relief sur une feuille plate',
        tone: 'indigo',
        body: (
          <p>
            Une photo perdait la profondeur. Le dessin technique, lui, la garde — au prix d’une{' '}
            <strong>convention</strong> : il déforme volontairement, mais{' '}
            <strong>toujours de la même façon</strong>, pour rester lisible et mesurable.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
