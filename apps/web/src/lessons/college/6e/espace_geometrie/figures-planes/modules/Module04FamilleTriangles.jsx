import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Triangle, Eye } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ShapeLab from '../components/ShapeLab';
import { classifyTriangle, triangleTraits, shapeName, SHAPE_LABEL } from '../components/figuresUtils';

/**
 * Module 4 — MANIPULATION : la famille des triangles (P6).
 *
 * Objectif : découvrir que les caractères d'un triangle se CUMULENT. Un
 * triangle peut être isocèle ET rectangle — ce ne sont pas des cases
 * exclusives, contrairement à ce que suggèrent les listes de manuels.
 *
 * Aha : « isocèle » parle des CÔTÉS, « rectangle » parle d'un ANGLE. Deux
 * critères indépendants, donc cumulables.
 *
 * Misconception visée : ranger chaque triangle dans une seule case, et donc
 * refuser qu'un triangle rectangle puisse être isocèle.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 300, yMax: 230 };

// Triangle de départ VÉRIFIÉ quelconque : 190/101/182 (aucun couple égal à la
// tolérance de 4 %) et aucun angle droit. Un départ déjà isocèle validerait
// la mission 1 avant même que l'élève ait touché la figure.
const DEPART = [{ x: 55, y: 180 }, { x: 245, y: 180 }, { x: 210, y: 85 }];

const MISSIONS = [
  {
    id: 't1',
    target: 'triangle-isocele',
    // La base [AB] est verrouillée : seul C bouge. L'élève sait donc
    // exactement QUELS côtés il doit égaliser — [AC] et [BC], les deux qui
    // se rejoignent au sommet mobile. Sans cette contrainte, il pourrait
    // rendre égale n'importe quelle paire et ne pas comprendre ce qu'il a
    // fait.
    lockedIndices: [0, 1],
    equalPair: ['AC', 'BC'],
    label: 'Rends ce triangle ISOCÈLE : les côtés [AC] et [BC] doivent avoir la même longueur.',
    hint: 'Seul le sommet C bouge. Déplace-le jusqu’à ce que les deux longueurs affichées de part et d’autre soient identiques.',
  },
  {
    id: 't2',
    target: 'triangle-rectangle',
    lockedIndices: [0, 1],
    label: 'Rends-le maintenant RECTANGLE : un angle doit valoir 90°.',
    hint: 'Seul C bouge. La marque d’angle droit apparaîtra d’elle-même quand l’angle sera exact.',
  },
];

/* Trois triangles à classer — les verdicts viennent de triangleTraits. */
// Sommets VÉRIFIÉS numériquement contre triangleTraits — un triangle « à peu
// près isocèle » tomberait dans la tolérance de 4 % et rendrait la question
// fausse. c1 : 180/154/154 (isocèle, NON équilatéral). c2 : angle de 90°.
// c3 : 200/182/123, aucun couple égal.
const A_CLASSER = [
  { id: 'c1', pts: [{ x: 60, y: 180 }, { x: 240, y: 180 }, { x: 150, y: 55 }] },   // isocèle
  { id: 'c2', pts: [{ x: 60, y: 180 }, { x: 200, y: 180 }, { x: 60, y: 50 }] },     // rectangle
  { id: 'c3', pts: [{ x: 50, y: 180 }, { x: 250, y: 180 }, { x: 105, y: 70 }] },    // quelconque
];

function Mission({ mission, done, onDone, react }) {
  const [pts, setPts] = useState(DEPART);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const traits = triangleTraits(pts);
  const reached =
    mission.target === 'triangle-isocele' ? traits.isocele : traits.rectangle;

  const handle = (next) => {
    if (done || revealed) return;
    setPts(next);
    const t = triangleTraits(next);
    const ok = mission.target === 'triangle-isocele' ? t.isocele : t.rectangle;
    if (ok) { react(true); onDone(); }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
        {mission.label}
      </div>

      <ShapeLab
        points={pts}
        onPointsChange={handle}
        box={BOX}
        showLengths
        showAngles
        showProperties={false}
        lockedIndices={mission.lockedIndices}
        // Le sommet s'accroche aux positions qui rendent deux côtés
        // exactement égaux : les deux longueurs affichées deviennent
        // identiques, au lieu d'un « 143 / 141 » qui contredirait le verdict.
        snapEqualSides
        disabled={done || revealed}
        ariaLabel={`Triangle à déformer — actuellement : ${shapeName(pts)}`}
      />

      {!done && !revealed && !reached && (
        <div className="space-y-2">
          <Feedback tone="info">
            Pour l’instant, c’est un <strong>{shapeName(pts)}</strong>.
            {tries >= 1 && <> {mission.hint}</>}
          </Feedback>
          <button type="button" onClick={() => setTries((t) => t + 1)} className="min-h-[44px] inline-flex items-center px-1 text-xs font-mono text-slate-500 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
            Un indice ?
          </button>
        </div>
      )}

      {(done || revealed) && (
        <Feedback tone={revealed ? 'info' : 'ok'}>
          {revealed && <strong>Pas grave, on te le montre. </strong>}
          {mission.target === 'triangle-isocele' ? (
            <>
              <strong>[AC] = [BC]</strong> : le triangle est <strong>isocèle</strong> en C. C’est une
              propriété des CÔTÉS — les deux qui partent du sommet mobile.
            </>
          ) : (
            <>Un angle de 90° : le triangle est <strong>rectangle</strong>. C’est une propriété d’un ANGLE.</>
          )}
        </Feedback>
      )}

      {tries >= 3 && !done && !revealed && (
        <button
          type="button"
          onClick={() => { setRevealed(true); onDone(); }}
          className="w-full min-h-[44px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold text-sm hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Eye className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
          Je ne trouve pas — montre-moi
        </button>
      )}
    </div>
  );
}

export default function Module04FamilleTriangles() {
  const [done, setDone] = useState([]);
  const [classDone, setClassDone] = useState(false);
  const [cumulDone, setCumulDone] = useState(false);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  const OPTIONS = ['isocèle', 'rectangle', 'quelconque'];
  const answerFor = (pts) => {
    const t = triangleTraits(pts);
    if (t.rectangle) return 1;
    if (t.isocele) return 0;
    return 2;
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="La famille des triangles"
      moduleSubtitle="Isocèle, équilatéral, rectangle : trois façons d’être un triangle."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Les côtés d’un côté, les angles de l’autre.',
        body: (
          <p>
            Un triangle se décrit par ses <strong>côtés</strong> (isocèle, équilatéral) ou par ses{' '}
            <strong>angles</strong> (rectangle). Deux critères indépendants.
          </p>
        ),
      }}
      steps={[
        ...MISSIONS.map((m, i) => ({
          num: i + 1,
          title: `Mission ${i + 1} — ${SHAPE_LABEL[m.target]}`,
          done: done.includes(m.id),
          content: (kit) => (
            <Mission mission={m} done={done.includes(m.id)} onDone={() => mark(m.id)} react={kit.react} />
          ),
        })),
        {
          num: 3,
          title: 'Classe ces trois triangles',
          done: classDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <div className="space-y-3">
                  {A_CLASSER.map((f, i) => (
                    <div key={f.id} className="rounded-xl border-2 border-slate-200 bg-white p-2">
                      <p className="text-xs font-mono text-slate-500 mb-1">Triangle {i + 1}</p>
                      <ShapeLab
                        points={f.pts} box={BOX} draggable={false}
                        showName={false} showProperties={false} showLengths size={260}
                        ariaLabel={`Triangle ${i + 1} avec ses longueurs`}
                      />
                    </div>
                  ))}
                </div>
              }
              rows={A_CLASSER.map((f, i) => ({
                id: f.id,
                label: <span className="font-semibold">Triangle {i + 1}</span>,
                options: OPTIONS,
                correct: answerFor(f.pts),
                correction: <>{OPTIONS[answerFor(f.pts)]}</>,
              }))}
              solved={classDone}
              onAnswered={() => setClassDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Compare d’abord les longueurs (deux égales ⇒ isocèle), puis cherche la marque d’angle droit.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 4,
          title: 'Peut-on être les deux à la fois ?',
          done: cumulDone,
          content: (
            <TapQuestion
              above={
                <ShapeLab
                  points={[{ x: 70, y: 180 }, { x: 200, y: 180 }, { x: 70, y: 50 }]}
                  box={BOX} draggable={false} showLengths showProperties={false}
                  ariaLabel="Triangle à la fois isocèle et rectangle"
                />
              }
              prompt="Ce triangle a deux côtés égaux ET un angle droit. Comment faut-il l’appeler ?"
              options={[
                'Isocèle rectangle — les deux à la fois',
                'Seulement rectangle : l’angle droit l’emporte',
                'Seulement isocèle : les côtés l’emportent',
              ]}
              correct={0}
              cols={1}
              explain="« Isocèle » décrit les côtés, « rectangle » décrit un angle : rien n’empêche les deux d’être vrais ensemble. On dit un triangle isocèle rectangle."
              explainWrong="Aucun des deux ne « l’emporte » : ce sont deux critères indépendants — l’un sur les longueurs, l’autre sur un angle. Un triangle peut donc cumuler les deux."
              solved={cumulDone}
              onAnswered={() => setCumulDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 space-y-3"
        >
          <Triangle className="w-6 h-6 mx-auto text-purple-400" aria-hidden="true" />
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="font-bold text-white mb-1">Isocèle</div>
              <div className="text-slate-300 text-xs">2 côtés égaux</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="font-bold text-white mb-1">Équilatéral</div>
              <div className="text-slate-300 text-xs">3 côtés égaux</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="font-bold text-white mb-1">Rectangle</div>
              <div className="text-slate-300 text-xs">un angle droit</div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400">
            Côtés d’un côté, angles de l’autre — c’est pourquoi les caractères se cumulent.
          </p>
        </motion.div>
      }
    />
  );
}
