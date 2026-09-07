import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ExtentPuller from '../components/ExtentPuller';
import GeoFigure from '../components/GeoFigure';
import { KINDS, KIND_LABEL, endpointCount } from '../components/droitesUtils';

/**
 * Module 2 — DÉCOUVERTE : la demi-droite apparaît comme CONSÉQUENCE.
 *
 * Objectif : le troisième objet n'est pas annoncé, il est fabriqué. On bloque
 * une extrémité et on laisse filer l'autre : l'élève voit naître un objet qui
 * n'est ni un segment ni une droite.
 *
 * Aha : entre « deux bouts » et « aucun bout », il reste un cas — un seul
 * bout. C'est la demi-droite, et son origine est ce bout unique.
 *
 * Misconception visée : croire qu'une demi-droite est « la moitié d'une
 * droite », donc qu'elle aurait une longueur. Elle est infinie d'un côté.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 170 };
const RAY0 = { kind: 'demi-droite', a: { x: 80, y: 120 }, b: { x: 210, y: 75 } };

const COUNT_ROWS = KINDS.map((k) => ({
  id: `c-${k}`,
  kind: k,
}));

export default function Module02UnSeulBout() {
  const [ray, setRay] = useState(RAY0);
  const [rayDone, setRayDone] = useState(false);
  const [originDone, setOriginDone] = useState(false);
  const [countDone, setCountDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Un seul bout"
      moduleSubtitle="Bloque une extrémité, laisse l’autre filer."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Et s’il n’avait qu’un seul bout ?',
        body: (
          <p>
            Le point A est <strong>fixé</strong> : il ne bougera pas. Tire sur l’autre bout et regarde ce que
            tu obtiens.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Tire — A reste bloqué',
          done: rayDone,
          content: (kit) => (
            <div className="space-y-2">
              {/* JAMAIS `disabled` après validation : la manipulation reste
                  ouverte pour que l'élève rejoue le geste (règle 2026-09-06). */}
              <ExtentPuller
                obj={ray}
                onObjChange={setRay}
                baseBox={BOX}
                pullable="b"
                onExtended={() => {
                  if (rayDone) return;
                  kit.react(true);
                  setRayDone(true);
                }}
                ariaLabel="Trait dont le bout A est fixé : tire sur l’autre bout"
              />
              {rayDone && (
                <>
                  <Feedback tone="ok">
                    Un seul bout, et de l’autre côté ça continue sans fin. Ce n’est ni un segment (il lui
                    manque un bout), ni une droite (il en a un).
                  </Feedback>
                  {/* Deux briques, dans l'ordre du geste : l'objet d'abord,
                      puis le nom de son unique bout — mot qu'exige l'étape 2. */}
                  <KnowledgeBrick
                    id="demi-droite"
                    variant="new"
                    lead="Le trait que tu viens d’obtenir : bloqué d’un côté, infini de l’autre."
                  />
                  <KnowledgeBrick
                    id="origine"
                    variant="new"
                    lead="Ce bout unique, le point A que tu n’as pas pu déplacer, porte un nom."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          // Titre neutre : StepCard l'affiche avant l'ouverture de l'étape, et
          // il ne doit donc pas vendre la réponse.
          title: 'Repère le bout unique',
          done: originDone,
          content: (
            <TapQuestion
              above={
                <GeoFigure
                  objects={[{ ...RAY0, nameA: 'A', nameB: 'B' }]}
                  box={BOX}
                  ariaLabel="Demi-droite d’origine A passant par B"
                />
              }
              prompt="Sur cette demi-droite, quel point est l’origine ?"
              options={[
                'Le point A — c’est là que ça s’arrête',
                'Le point B — c’est là que ça continue',
                'Les deux à la fois',
              ]}
              correct={0}
              cols={1}
              requires={['demi-droite', 'origine']}
              explain="L’origine est l’unique extrémité : le point où la demi-droite commence, et au-delà duquel elle n’existe pas. Ici, c’est A."
              explainWrong="B n’est pas une extrémité : de ce côté, la demi-droite continue sans fin. Le seul bout, c’est A."
              solved={originDone}
              onAnswered={() => setOriginDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Compte les extrémités',
          done: countDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chaque objet, combien de bouts (d’extrémités) possède-t-il ?
                </p>
              }
              requires={['segment', 'droite', 'demi-droite', 'origine']}
              rows={COUNT_ROWS.map((r) => ({
                id: r.id,
                label: <span className="font-semibold">{KIND_LABEL[r.kind]}</span>,
                options: ['0', '1', '2'],
                correct: endpointCount(r.kind),
                correction: (
                  <>
                    {endpointCount(r.kind)} extrémité{endpointCount(r.kind) > 1 ? 's' : ''}
                  </>
                ),
              }))}
              solved={countDone}
              onAnswered={() => setCountDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Segment : 2 bouts. Demi-droite : 1 bout (son origine). Droite : aucun. C’est la seule chose
                  qui les distingue.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Les trois objets existent. On va maintenant les mettre côte à
          côte pour trouver la question qui permet de les trier à coup sûr.
        </KnowledgeSnapshot>
      }
    />
  );
}
