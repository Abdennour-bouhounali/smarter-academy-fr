import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MirrorLab from '../components/MirrorLab';
import {
  lineThrough, conservationReport, CONSERVEES, NON_CONSERVEES,
  sideLengths, interiorAngles, polygonArea,
} from '../components/symetrieUtils';

/**
 * Module 5 — FORMALISATION (P9).
 *
 * Ce module ne fait rien découvrir : il met en mots les deux conditions
 * manipulées aux modules 3-4, et fait constater ce que la symétrie CONSERVE.
 *
 * Aha : la symétrie déplace la figure sans la déformer. Longueurs, angles,
 * périmètre, aire : tout est conservé. Seuls la position et le sens de
 * lecture changent.
 *
 * Les verdicts viennent de `conservationReport`, calculé sur la figure et son
 * image — jamais d'une liste écrite à la main.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 };
const AXE = lineThrough({ x: 160, y: 0 }, { x: 160, y: 200 });
const FIG = [{ x: 55, y: 45 }, { x: 125, y: 65 }, { x: 90, y: 155 }];

const RAPPORT = conservationReport(FIG, AXE);

const ROWS = [
  ...CONSERVEES.map((c) => ({ id: c.id, label: c.label, correct: 0 })),
  ...NON_CONSERVEES.map((c) => ({ id: c.id, label: c.label, correct: 1 })),
];

export default function Module05RegleDuMiroir() {
  const [consDone, setConsDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La règle du miroir"
      moduleSubtitle="Deux conditions, et ce qui ne change jamais."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'La fiche à retenir — construite à partir de tes gestes.',
        body: <p>Rien de nouveau : on met des mots sur ce que tu as manipulé.</p>,
      }}
      intro={
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-blue-500">
            Le symétrique d’un point M
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div className="bg-white rounded-xl p-3 border border-blue-200">
              <div className="font-bold text-blue-900 mb-1">1. Perpendiculaire</div>
              <div className="text-slate-700 text-xs">
                Le trait [MM′] coupe l’axe à angle droit.
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-200">
              <div className="font-bold text-blue-900 mb-1">2. Égale distance</div>
              <div className="text-slate-700 text-xs">
                M et M′ sont à la même distance de l’axe, de part et d’autre.
              </div>
            </div>
          </div>
          <p className="text-xs text-blue-900 text-center">
            Les deux ensemble, toujours — l’une sans l’autre ne définit rien.
          </p>
        </div>
      }
      steps={[
        {
          num: 1,
          title: 'Qu’est-ce que la symétrie conserve ?',
          done: consDone,
          content: (
            <div className="space-y-5">
              {/* Les lignes à classer nomment le périmètre et l'aire : ces mots
                  doivent exister AVANT la question, pas dans son feedback. */}
              <KnowledgeBrick
                id="conservation"
                variant="new"
                lead="Compare la figure bleue et son image verte : rien n’a été étiré ni rétréci."
              />
              <BatchChoiceQuestion
                requires={['conservation', 'symetrique-point', 'symetrie-pliage']}
                intro={
                <div className="space-y-2">
                  <MirrorLab
                    axis={AXE}
                    points={FIG}
                    polygon
                    showDistances={false}
                    disabled
                    box={BOX}
                    ariaLabel="Un triangle et son image par symétrie axiale"
                  />
                  <p className="text-sm text-slate-600">
                    Compare la figure bleue et son image verte. Qu’est-ce qui est resté identique ?
                  </p>
                </div>
              }
              rows={ROWS.map((r) => ({
                id: r.id,
                label: <span className="text-sm">{r.label}</span>,
                options: ['Conservé', 'Changé'],
                correct: r.correct,
                correction: <>{r.correct === 0 ? 'conservé' : 'changé'}</>,
              }))}
                solved={consDone}
                onAnswered={() => setConsDone(true)}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {!allRight && (
                      <>
                        {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                      </>
                    )}
                    Le calcul le confirme sur cette figure :{' '}
                    <span className="font-mono">{Math.round(polygonArea(FIG))}</span> ={' '}
                    <span className="font-mono">{Math.round(polygonArea(RAPPORT.image))}</span> — la
                    place occupée est rigoureusement la même.
                  </Feedback>
                )}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le point placé à la bonne distance',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="Un élève place un point à la bonne distance de l’axe, mais pas en face de M. A-t-il construit le symétrique ?"
              options={[
                'Non : il faut AUSSI que [MM′] soit perpendiculaire à l’axe',
                'Oui : la distance est la seule condition',
                'Oui, à condition que ce soit de l’autre côté',
              ]}
              correct={0}
              cols={1}
              requires={['symetrique-point', 'axe-symetrie']}
              explain="À cette distance de l’axe, il existe une infinité de points possibles, tout le long de l’axe. C’est l’angle droit qui en désigne un seul."
              explainWrong="À distance égale de l’axe, il existe une infinité de points. Seule la perpendicularité de [MM′] en sélectionne un — celui-là précisément."
              solved={ruleDone}
              onAnswered={() => setRuleDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Tu sais construire l’image d’un point. Une figure entière n’est
          rien d’autre qu’une poignée de points.
        </KnowledgeSnapshot>
      }
    />
  );
}
