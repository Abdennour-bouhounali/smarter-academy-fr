import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrainFront } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RelationFigure from '../components/RelationFigure';
import { relationOf, RELATIONS, intersectionOf, angleBetweenDeg, toLine } from '../components/relationsUtils';

/**
 * Module 1 — TRIGGER (conflit cognitif).
 *
 * Objectif : casser le « ça a l'air parallèle ». Deux paires de droites se
 * ressemblent beaucoup ; en les PROLONGEANT, l'une finit par se couper.
 *
 * Aha : l'œil ne suffit pas. Le critère est « se coupent-elles, oui ou non ? »
 * — et il se vérifie en prolongeant.
 *
 * Misconception visée : juger le parallélisme sur un morceau de dessin, où
 * deux droites presque parallèles semblent le rester.
 *
 * L'honnêteté du dispositif tient à un invariant du modèle :
 * intersectionOf() renvoie null EXACTEMENT quand les droites sont
 * parallèles. Le point d'intersection n'est donc jamais « ajouté » pour la
 * démonstration : il existe, ou il n'existe pas.
 */
const NEAR = { xMin: 0, yMin: 0, xMax: 320, yMax: 180 };
// Vue élargie choisie pour que l'intersection de la paire B — calculée en
// (399 ; 135) — y soit VISIBLE, tout en restant hors de la vue rapprochée.
// Le point n'est jamais « ajouté » pour la démonstration : intersectionOf le
// renvoie, ou renvoie null.
const FAR = { xMin: -60, yMin: -90, xMax: 620, yMax: 300 };

// Paire A : rigoureusement parallèles (même inclinaison) — intersectionOf
// renvoie null. Paire B : 10° d'écart, indétectable sur le morceau visible.
const PAIR_A = [
  { p: { x: 30, y: 70 }, angleDeg: 10, name: 'a₁' },
  { p: { x: 30, y: 135 }, angleDeg: 10, name: 'a₂' },
];
const PAIR_B = [
  { p: { x: 30, y: 70 }, angleDeg: 10, name: 'b₁' },
  { p: { x: 30, y: 135 }, angleDeg: 0, name: 'b₂' },
];

export default function Module01LesRails() {
  const [zoomed, setZoomed] = useState(false);
  const [predicted, setPredicted] = useState(false);
  const [zoomDone, setZoomDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);

  const box = zoomed ? FAR : NEAR;
  const interB = intersectionOf(PAIR_B[0], PAIR_B[1]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Les rails qui ne se croisent jamais"
      moduleSubtitle="Prolonge les deux droites : une des paires finit par se couper."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Deux paires de rails. Une seule ne se croisera jamais.',
        body: (
          <p>
            De près, elles se ressemblent toutes. Fais ta prédiction, puis <strong>recule la vue</strong>{' '}
            pour voir ce qui se passe vraiment.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Prédis : laquelle finira par se couper ?',
          subtitle: 'Regarde bien avant de choisir.',
          done: predicted,
          content: (
            <TapQuestion
              above={
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-center text-slate-500">Paire A</p>
                    <RelationFigure droites={PAIR_A} box={NEAR} showMarks={false} showIntersection={false} ariaLabel="Paire A vue de près" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-center text-slate-500">Paire B</p>
                    <RelationFigure droites={PAIR_B} box={NEAR} showMarks={false} showIntersection={false} ariaLabel="Paire B vue de près" />
                  </div>
                </div>
              }
              prompt="Si on prolongeait ces droites très loin, laquelle des deux paires finirait par se croiser ?"
              options={['La paire A', 'La paire B', 'Aucune des deux']}
              correct={1}
              cols={3}
              explain="C’est la paire B : ses deux droites n’ont pas la même inclinaison (10° et 0°). De près, l’écart est invisible."
              explainWrong="À cette échelle, impossible de trancher à l’œil — c’est justement le piège. Prolongeons pour vérifier."
              solved={predicted}
              onAnswered={() => setPredicted(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Recule la vue et vérifie',
          done: zoomDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-center text-slate-500">Paire A</p>
                  <RelationFigure droites={PAIR_A} box={box} showMarks={zoomed} ariaLabel="Paire A prolongée" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-center text-slate-500">Paire B</p>
                  <RelationFigure droites={PAIR_B} box={box} showMarks={zoomed} ariaLabel="Paire B prolongée" />
                </div>
              </div>

              {!zoomDone && (
                <button
                  type="button"
                  onClick={() => {
                    if (!zoomed) { setZoomed(true); return; }
                    kit.react(true);
                    setZoomDone(true);
                  }}
                  className="w-full min-h-[44px] rounded-xl bg-indigo-600 text-white font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {zoomed ? 'J’ai vu ce qui se passe' : 'Prolonger les quatre droites'}
                </button>
              )}

              {zoomed && (
                <Feedback tone={zoomDone ? 'ok' : 'info'}>
                  La paire B <strong>se coupe</strong> : le point d’intersection est apparu. La paire A, elle,
                  garde le même écart aussi loin qu’on aille — ses droites ne se rencontreront jamais. On dit
                  qu’elles sont <strong>parallèles</strong>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le vrai critère',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="Pour affirmer que deux droites sont parallèles, sur quoi faut-il se fonder ?"
              options={[
                'Elles ne se coupent en aucun point, même prolongées à l’infini',
                'Elles ont l’air de ne pas se toucher sur le dessin',
                'Elles sont toutes les deux penchées dans le même sens',
              ]}
              correct={0}
              cols={1}
              explain="C’est la définition : deux droites parallèles n’ont aucun point commun, quelle que soit la distance sur laquelle on les prolonge."
              explainWrong="« Avoir l’air » ne suffit pas — la paire B en est la preuve. Et « penchées dans le même sens » reste vague : il faut EXACTEMENT la même inclinaison."
              solved={ruleDone}
              onAnswered={() => setRuleDone(true)}
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
          <TrainFront className="w-6 h-6 mx-auto text-indigo-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Deux droites <strong className="text-white">parallèles</strong> ne se coupent jamais. Mais
            comment le vérifier sans prolonger à l’infini&nbsp;? Il existe un autre moyen : mesurer l’écart.
          </p>
        </motion.div>
      }
    />
  );
}
