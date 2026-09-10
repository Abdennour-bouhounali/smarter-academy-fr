import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DerouleurLab from '../components/DerouleurLab';
import { SIN, COS, sinExact, cosExact, fr, labelPi, tDuCran } from '../components/trigFnUtils';

/**
 * Module 5 — ATELIER : représenter les deux fonctions (LP5).
 *
 * Étape 1  poser les CINQ points clés d'un tour, en les lisant sur le cercle.
 *          Le laboratoire est le même dérouloir : l'élève enroule jusqu'à
 *          chacun des cinq réels, et la trace se construit point par point.
 * Étape 2  prolonger : la brique dit qu'on RECOPIE le motif. L'élève l'exerce
 *          en déduisant une valeur hors du premier tour.
 * Étape 3  le décalage entre les deux courbes — la même forme, pas au même
 *          moment. C'est ici que se traite « ce sont deux vagues différentes ».
 *
 * TOUTES LES VALEURS SONT DÉRIVÉES de `sinExact` / `cosExact`, jamais saisies.
 *
 * MANIPULATION JAMAIS GELÉE : les dérouloirs restent pilotables.
 */
const CINQ = [0, 6, 12, 18, 24];   // 0, π/2, π, 3π/2, 2π

export default function Module05TracerLesDeuxCourbes() {
  const [cran1, setCran1] = useState(0);
  const [vus1, setVus1] = useState([0]);
  const [q2, setQ2] = useState(false);
  const [cran3, setCran3] = useState(0);
  const [vus3, setVus3] = useState([0]);
  const [q3, setQ3] = useState(false);

  const poses = (v) => CINQ.filter((n) => v.includes(n)).length;
  const done1 = poses(vus1) === CINQ.length;
  const done3 = q3;

  const visiter = (v, vus, setVus, setCran, deja, react) => {
    setCran(v);
    if (vus.includes(v)) return;
    const suivant = [...vus, v];
    setVus(suivant);
    if (!deja && poses(suivant) === CINQ.length) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Les cinq points d’un tour',
      subtitle:
        'Fais tourner le point jusqu’à chacun des cinq réels 0, π/2, π, 3π/2 et 2π. À chaque arrêt, la hauteur du point se pose sur l’axe de droite.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DerouleurLab
            fn={SIN}
            cran={cran1}
            visites={vus1}
            onChangeCran={(v) => visiter(v, vus1, setVus1, setCran1, done1, kit.react)}
          />
          <div className="grid grid-cols-5 gap-1.5 text-center text-[13px]">
            {CINQ.map((n) => (
              <div
                key={n}
                className={`rounded-lg border-2 px-1 py-2 ${vus1.includes(n) ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}
              >
                <div className="font-semibold">{labelPi(tDuCran(n))}</div>
                <div className="font-mono tabular-nums">{vus1.includes(n) ? fr(sinExact(tDuCran(n))) : '·'}</div>
              </div>
            ))}
          </div>
          {done1 ? (
            <Feedback tone="ok">
              Cinq points, et la forme est déjà là :{' '}
              <strong>{CINQ.map((n) => fr(sinExact(tDuCran(n)))).join(' · ')}</strong>. Elle part
              du milieu, monte au sommet, redescend au milieu, plonge au creux, et revient au
              milieu. C’est tout ce qu’il faut retenir d’un tour.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Points posés : {poses(vus1)} sur {CINQ.length}. Le point s’aimante tous les π/12,
              donc π/2 est à six crans du départ.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Prolonger sans recalculer',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="courbe-sinusoide"
            variant="new"
            lead={<>Un tour suffit : le reste de la courbe s’en déduit.</>}
          />
          <KnowledgeBrick id="mem-cinq-points-du-tour" variant="new" />
          <BatchChoiceQuestion
            intro={<p>Sans rien recalculer, en utilisant seulement le motif et sa répétition :</p>}
            rows={[
              {
                id: 'r1',
                label: 'sin(2π + π/2)',
                options: [fr(sinExact(Math.PI / 2)), fr(0), fr(-1)],
                correct: 0,
                correction: `On ajoute un tour à π/2 : la valeur ne change pas, elle vaut ${fr(sinExact(Math.PI / 2))}.`,
              },
              {
                id: 'r2',
                label: 'sin(−π/2)',
                options: [fr(sinExact(-Math.PI / 2)), fr(sinExact(Math.PI / 2)), fr(0)],
                correct: 0,
                correction: `Le sinus est impair : sin(−π/2) = −sin(π/2) = ${fr(sinExact(-Math.PI / 2))}. C’est le creux de la courbe.`,
              },
              {
                id: 'r3',
                label: 'cos(2π)',
                options: [fr(cosExact(0)), fr(0), fr(-1)],
                correct: 0,
                correction: `Un tour complet ramène au point de départ : cos(2π) = cos(0) = ${fr(cosExact(0))}.`,
              },
            ]}
            requires={['courbe-sinusoide', 'mem-cinq-points-du-tour', 'periodicite', 'parite-sinus-cosinus']}
            feedback={({ allRight }) =>
              allRight ? (
                <>Tu n’as eu besoin d’aucun calcul : le motif d’un tour, plus la répétition et le retournement, suffisent à tout.</>
              ) : (
                <>Deux réflexes seulement : « x + un tour » ne change rien, et « −x » retourne le sinus mais pas le cosinus.</>
              )
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La même forme, mais pas au même moment',
      subtitle:
        'Le dérouloir montre maintenant le cosinus, avec le sinus en fantôme derrière. Fais tourner le point d’un tour et compare les deux traces.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <DerouleurLab
            fn={COS}
            cran={cran3}
            visites={vus3}
            fantome={SIN}
            onChangeCran={(v) => {
              setCran3(v);
              if (!vus3.includes(v)) setVus3([...vus3, v]);
            }}
            disabled={!q2}
            label="Dérouler le cercle — cosinus, avec le sinus en fantôme"
          />
          <TapQuestion
            prompt="Les deux courbes ont exactement la même forme. Qu’est-ce qui les distingue ?"
            options={[
              'Rien d’autre que leur position : celle du cosinus est celle du sinus décalée d’un quart de tour vers la gauche',
              'Le cosinus monte plus haut que le sinus',
              'Le cosinus se répète plus vite que le sinus',
              'Ce sont deux formes différentes, qui ne se ressemblent que par hasard',
            ]}
            correct={0}
            cols={1}
            requires={['courbe-sinusoide', 'variations-sin-cos']}
            explain={`Les deux atteignent le même plus grand écart, ${fr(1)}, et se répètent au même rythme. Seule la position change : le cosinus est déjà à son sommet en 0, là où le sinus n’y arrive qu’en π/2 — un quart de tour plus tard.`}
            explainWrong={`Compare les nombres : le sinus va de ${fr(-1)} à ${fr(1)}, le cosinus aussi. Et tous deux refont la même forme au bout d’un tour. Ce n’est donc ni la hauteur ni le rythme qui diffère, mais le MOMENT où chaque étape arrive.`}
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
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Tracer les deux courbes"
      moduleSubtitle="Cinq points, un motif, et on recopie"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'À toi de poser la courbe',
        tone: 'indigo',
        body: (
          <p>
            Tracer ces deux courbes ne demande ni calculatrice ni table de valeurs :{' '}
            <strong>cinq points</strong> suffisent pour un tour, et le reste se recopie.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Et dans l’autre sens ?</strong> Tu sais tracer une courbe à partir de la
          fonction. Module suivant : lire une courbe qu’on te donne, et en tirer deux nombres.
        </KnowledgeSnapshot>
      }
    />
  );
}
