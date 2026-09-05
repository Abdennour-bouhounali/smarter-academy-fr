import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Eye } from 'lucide-react';
import { ContentModule } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MirrorLab from '../components/MirrorLab';
import { lineThrough, checkSymmetric, symmetricHint, reflectPoint } from '../components/symetrieUtils';

/**
 * Module 4 — MANIPULATION : construire le symétrique (P5, P7).
 *
 * Objectif : l'élève place lui-même l'image. Les deux conditions sont
 * contrôlées SÉPARÉMENT, donc il voit toujours laquelle lui manque — c'est
 * ce qui transforme un « faux » en information exploitable.
 *
 * Aha : une seule condition ne suffit jamais. Bien aligné mais trop loin ⇒
 * raté ; à la bonne distance mais de travers ⇒ raté aussi.
 *
 * Politique formative : le composant ne montre PAS la vraie image tant que
 * l'élève cherche (sa proposition est en ambre) ; échappatoire après 3
 * demandes d'indice, avec révélation honnête.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 220 };

const CHANTIERS = [
  {
    id: 's1',
    axis: lineThrough({ x: 160, y: 0 }, { x: 160, y: 220 }),
    M: { x: 75, y: 80 },
    start: { x: 250, y: 150 },
    label: 'Place le symétrique de M par rapport à l’axe vertical.',
  },
  {
    id: 's2',
    axis: lineThrough({ x: 30, y: 200 }, { x: 290, y: 40 }),
    M: { x: 90, y: 60 },
    start: { x: 200, y: 180 },
    label: 'Même travail, mais l’axe est oblique : la règle ne change pas.',
  },
];

function Chantier({ chantier, done, onDone, react }) {
  const [cand, setCand] = useState(chantier.start);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const state = checkSymmetric(chantier.axis, chantier.M, cand);

  const handle = (p) => {
    if (done || revealed) return;
    setCand(p);
    const st = checkSymmetric(chantier.axis, chantier.M, p);
    if (st.ok) { react(true); onDone(); }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
        {chantier.label}
      </div>

      <MirrorLab
        axis={chantier.axis}
        points={[chantier.M]}
        candidate={revealed ? reflectPoint(chantier.axis, chantier.M) : cand}
        onCandidateChange={handle}
        showImage={done || revealed}
        showDistances={false}
        showConnector={done || revealed}
        ghostImage={revealed ? reflectPoint(chantier.axis, chantier.M) : null}
        box={BOX}
        disabled={done || revealed}
        ariaLabel="Place le point symétrique de M"
      />

      {/* Les DEUX conditions, contrôlées séparément */}
      {!done && !revealed && (
        <div className="grid sm:grid-cols-2 gap-2">
          <div
            className={`rounded-xl border-2 px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
              state.perpendiculaire ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            <span aria-hidden="true">{state.perpendiculaire ? '✓' : '○'}</span>
            [MM′] perpendiculaire à l’axe
          </div>
          <div
            className={`rounded-xl border-2 px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
              state.distanceEgale ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            <span aria-hidden="true">{state.distanceEgale ? '✓' : '○'}</span>
            Distances égales à l’axe
            <span className="ml-auto font-mono text-[11px]">
              {Math.round(state.distPoint)} / {Math.round(state.distCandidate)}
            </span>
          </div>
        </div>
      )}

      {!done && !revealed && (
        <div className="space-y-2">
          <Feedback tone="info">{symmetricHint(state)}</Feedback>
          <button
            type="button"
            onClick={() => setTries((t) => t + 1)}
            className="min-h-[44px] inline-flex items-center px-1 text-xs font-mono text-slate-500 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Un indice ?
          </button>
        </div>
      )}

      {(done || revealed) && (
        <Feedback tone={revealed ? 'info' : 'ok'}>
          {revealed && <strong>Pas grave, on te le montre. </strong>}
          Les deux conditions sont réunies : <strong>[MM′] ⊥ (d)</strong> et{' '}
          <strong>M et M′ à égale distance</strong> de l’axe. C’est ce couple de conditions qui définit le
          symétrique — jamais une seule des deux.
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

export default function Module04ConstruireSymetrique() {
  const [done, setDone] = useState([]);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Construire le symétrique"
      moduleSubtitle="Perpendiculaire d’abord, distance égale ensuite."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'À toi de placer l’image.',
        body: (
          <p>
            Deux voyants te disent ce qui est déjà juste. Il faut les allumer{' '}
            <strong>tous les deux</strong> — l’un sans l’autre ne suffit pas.
          </p>
        ),
      }}
      steps={CHANTIERS.map((c, i) => ({
        num: i + 1,
        title: i === 0 ? 'Axe vertical' : 'Axe oblique',
        done: done.includes(c.id),
        content: (kit) => (
          <Chantier chantier={c} done={done.includes(c.id)} onDone={() => mark(c.id)} react={kit.react} />
        ),
      }))}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
        >
          <Crosshair className="w-6 h-6 mx-auto text-purple-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            L’axe peut être vertical, horizontal ou penché : la règle ne change jamais.{' '}
            <strong className="text-white">Perpendiculaire à l’axe, à égale distance de l’axe.</strong>
          </p>
        </motion.div>
      }
    />
  );
}
