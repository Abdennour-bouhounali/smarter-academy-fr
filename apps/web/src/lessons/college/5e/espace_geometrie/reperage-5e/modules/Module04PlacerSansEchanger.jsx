import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PointPlacer from '../components/PointPlacer';
import {
  CIBLES, describeQuadrant, formatCoords, quadrantOf, samePoint, swap,
} from '../components/reperageUtils';

/**
 * Module 4 — MANIPULATION : l'ordre du couple, enseigné par comparaison.
 *
 * L'erreur visée (échanger les deux coordonnées) ne se corrige pas en la
 * nommant : elle se voit. Pendant que l'élève place son point, un FANTÔME
 * montre en permanence où tomberait le couple échangé. Les deux points
 * coexistent — c'est la comparaison qui enseigne, pas un verdict après coup
 * (§12, l'erreur comme manipulation).
 *
 * LE CAS HONNÊTE. Sur la diagonale (x = y), l'échange ne déplace rien.
 * `swapLandsElsewhere` le sait, le composant l'affiche, et l'étape 3 le
 * DEMANDE explicitement : la leçon ne prétend jamais que l'échange déplace
 * toujours, parce que le dessin dirait le contraire (§28bis).
 *
 * Le diagnostic d'erreur porte sur le geste RÉELLEMENT fait : si l'élève pose
 * son point exactement sur le fantôme, on le lui dit dans ces termes — jamais
 * « Incorrect. ».
 */
const CIBLE = CIBLES[0];              // (−2 ; 3) — l'échange déplace
const CIBLE_DIAG = CIBLES[3];         // (3 ; 3)  — l'échange ne déplace pas

export default function Module04PlacerSansEchanger() {
  const [p, setP] = useState({ x: 0, y: 0 });
  const [pose, setPose] = useState(false);
  const [q2, setQ2] = useState(false);
  const [pd, setPd] = useState({ x: 0, y: 0 });
  const [poseDiag, setPoseDiag] = useState(false);

  const surFantome = samePoint(p, swap(CIBLE.p));

  const bouger = (next, react) => {
    setP(next);
    if (samePoint(next, CIBLE.p) && !pose) { setPose(true); react?.(true); }
  };

  const bougerDiag = (next, react) => {
    setPd(next);
    if (samePoint(next, CIBLE_DIAG.p) && !poseDiag) { setPoseDiag(true); react?.(true); }
  };

  const steps = [
    {
      num: 1,
      title: `Place le point ${formatCoords(CIBLE.p)}`,
      subtitle: 'Le point rose montre où tomberait le couple écrit à l’envers.',
      done: pose,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            Amène le point violet sur <strong className="font-mono">{formatCoords(CIBLE.p)}</strong>{' '}
            (l’anneau orange). Pendant que tu le déplaces, le point <strong>rose</strong> te montre
            où irait <strong className="font-mono">{formatCoords(swap(CIBLE.p))}</strong> — les
            deux mêmes nombres, écrits dans l’autre ordre.
          </div>

          <PointPlacer
            point={p}
            onPoint={(next) => bouger(next, kit.react)}
            target={CIBLE.p}
            ghostSwapped
            showQuadrantBadge
            ariaLabel={`Place le point ${formatCoords(CIBLE.p)}, avec le couple échangé en fantôme`}
          />

          {pose ? (
            <Feedback tone="ok">
              Placé. Regarde les deux points : <strong className="font-mono">{formatCoords(CIBLE.p)}</strong>{' '}
              est {describeQuadrant(quadrantOf(CIBLE.p))}, tandis que{' '}
              <strong className="font-mono">{formatCoords(swap(CIBLE.p))}</strong> est{' '}
              {describeQuadrant(quadrantOf(swap(CIBLE.p)))}. Mêmes nombres, ordre différent,{' '}
              <strong>endroits différents</strong>.
            </Feedback>
          ) : surFantome ? (
            /* Diagnostic du geste réellement fait — jamais « Incorrect. ». */
            <Feedback tone="ko">
              Tu es sur le point <strong className="font-mono">{formatCoords(swap(CIBLE.p))}</strong> :
              c’est le couple <em>échangé</em>. Tu as lu le second nombre en premier. Reprends
              depuis l’origine : {CIBLE.p.x} horizontalement <strong>d’abord</strong>, puis{' '}
              {CIBLE.p.y} verticalement.
            </Feedback>
          ) : (
            <Feedback tone="info">{CIBLE.indice}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux écritures, deux points',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="ordre-du-couple"
            variant="new"
            lead={<>Ce que le point rose montrait depuis le début a une conséquence, et elle est générale.</>}
          />
          <KnowledgeBrick id="placer-un-point" variant="new" />
          <TapQuestion
            prompt={
              <>
                Un camarade écrit <span className="font-mono font-bold">{formatCoords({ x: 5, y: -1 })}</span>{' '}
                au lieu de <span className="font-mono font-bold">{formatCoords({ x: -1, y: 5 })}</span>.
                Qu’a-t-il fait ?
              </>
            }
            options={[
              'Il a écrit les deux nombres dans l’ordre inverse',
              'Il a changé les signes',
              'Il a fait une erreur de calcul',
              'Les deux écritures désignent le même point',
            ]}
            correct={0}
            cols={1}
            requires={['ordre-du-couple', 'coordonnees']}
            explain="Les nombres sont les mêmes, seul leur ordre change — et cet ordre décide du point. L’abscisse se lit toujours en premier."
            explainWrong="Les signes n’ont pas bougé et il n’y a aucun calcul : ce sont les deux mêmes nombres, mais placés dans l’autre ordre. C’est cela qui change le point désigné."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le cas où l’échange ne change rien',
      subtitle: `Place ${formatCoords(CIBLE_DIAG.p)}, et regarde le fantôme.`,
      done: poseDiag,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3.5 text-sm text-slate-700">
            Une règle honnête doit dire aussi ses exceptions. Place{' '}
            <strong className="font-mono">{formatCoords(CIBLE_DIAG.p)}</strong> et observe ce que
            devient le point rose.
          </div>

          <PointPlacer
            point={pd}
            onPoint={(next) => bougerDiag(next, kit.react)}
            target={CIBLE_DIAG.p}
            ghostSwapped
            ariaLabel={`Place le point ${formatCoords(CIBLE_DIAG.p)}, sur la diagonale`}
          />

          {poseDiag ? (
            <Feedback tone="ok">
              Le fantôme a disparu — et c’est normal :{' '}
              <strong className="font-mono">{formatCoords(CIBLE_DIAG.p)}</strong> et{' '}
              <strong className="font-mono">{formatCoords(swap(CIBLE_DIAG.p))}</strong> sont{' '}
              <strong>le même couple</strong>. Quand les deux nombres sont égaux, les échanger ne
              déplace rien. L’ordre compte <em>toujours</em>, mais ici les deux ordres donnent la
              même écriture.
            </Feedback>
          ) : (
            <Feedback tone="info">{CIBLE_DIAG.indice}</Feedback>
          )}

          {poseDiag && <KnowledgeBrick id="mem-couple" variant="new" compact />}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Placer sans échanger"
      moduleSubtitle="Pourquoi l’ordre des deux nombres décide du point"
      estimatedTime="9 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le piège le plus fréquent',
        tone: 'indigo',
        body: (
          <p>
            Écrire les deux bons nombres ne suffit pas : il faut les écrire{' '}
            <strong>dans le bon ordre</strong>. Pour le voir plutôt que le retenir, un point rose
            va suivre chacun de tes gestes — il montre où tomberait le couple écrit à l’envers.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
