import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dot, Eye } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PointsOnLine from '../components/PointsOnLine';
import { isAligned, alignmentGap, isMidpoint, midpointGap, midpoint } from '../components/droitesUtils';

/**
 * Module 4 — MANIPULATION : le rôle des points sur une droite (P6).
 *
 * Objectif : distinguer « avoir l'air » de « être ». Deux notions du
 * programme s'y jouent : l'ALIGNEMENT et le MILIEU, toutes deux jugées par
 * un nombre, jamais par l'œil.
 *
 * Aha : à 3 pixels près, ça a l'air aligné — et ce n'est pas aligné. La
 * géométrie tranche par une égalité, pas par une impression.
 *
 * Misconceptions visées : (a) « ça a l'air aligné donc c'est aligné » ;
 * (b) le milieu confondu avec « quelque part au milieu », sans égalité.
 *
 * Politique formative : la complétion se fait sur l'objectif réel, avec
 * échappatoire après 3 essais infructueux — jamais de blocage.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 170 };
const A = { x: 60, y: 120 };
const B = { x: 260, y: 60 };

const TOL_ALIGN = 4;   // unités SVG — « posé sur la droite »
const TOL_MID = 6;     // écart accepté entre AM et MB

function Task({ mode, target, done, onDone, react, hint }) {
  const [m, setM] = useState(mode === 'align' ? { x: 160, y: 140 } : { x: 110, y: 100 });
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const gap = mode === 'midpoint' ? midpointGap(A, B, m) : alignmentGap(A, B, m);
  const reached = mode === 'midpoint' ? gap <= TOL_MID && alignmentGap(A, B, m) <= TOL_ALIGN : gap <= TOL_ALIGN;

  const handleChange = (next) => {
    if (done || revealed) return;
    setM(next);
    const g = mode === 'midpoint' ? midpointGap(A, B, next) : alignmentGap(A, B, next);
    const onLine = alignmentGap(A, B, next) <= TOL_ALIGN;
    const ok = mode === 'midpoint' ? g <= TOL_MID && onLine : g <= TOL_ALIGN;
    if (ok) {
      react(true);
      onDone();
    }
  };

  return (
    <div className="space-y-3">
      <PointsOnLine
        a={A}
        b={B}
        m={revealed ? (mode === 'midpoint' ? midpoint(A, B) : { x: 160, y: 96 }) : m}
        onMChange={handleChange}
        mode={mode}
        box={BOX}
        disabled={done || revealed}
        ariaLabel={mode === 'midpoint' ? 'Place M au milieu de A et B' : 'Place M sur la droite (AB)'}
      />

      {!done && !revealed && !reached && (
        <div className="space-y-2">
          <Feedback tone="info">
            {mode === 'midpoint'
              ? 'Vise l’égalité : AM et MB doivent afficher le même nombre — et M doit rester sur le trait.'
              : 'Tant que la distance affichée n’est pas 0, M n’est pas sur la droite, même si ça en a l’air.'}
            {tries >= 1 && <> {hint}</>}
          </Feedback>
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
          {revealed && <>Pas grave, on te le montre. </>}
          {mode === 'midpoint' ? (
            <>
              Le milieu de [AB] est le point de <strong>[AB]</strong> tel que{' '}
              <strong className="font-mono">AM = MB</strong>. Être « à peu près au centre » ne suffit pas.
            </>
          ) : (
            <>
              M est aligné avec A et B : sa distance à la droite vaut <strong>0</strong>. « Presque aligné »
              n’existe pas en géométrie.
            </>
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

export default function Module04PointsSurLaDroite() {
  const [alignDone, setAlignDone] = useState(false);
  const [midDone, setMidDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Les points sur la droite"
      moduleSubtitle="Un point est-il « dessus » ? Et où est exactement le milieu ?"
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'L’œil se trompe, les nombres non.',
        body: (
          <p>
            Déplace le point M (glisse-le, ou utilise les flèches du clavier) et surveille les jauges : elles
            disent ce que l’œil ne voit pas.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Pose M exactement sur la droite (AB)',
          subtitle: 'La jauge doit tomber à 0.',
          done: alignDone,
          content: (kit) => (
            <Task
              mode="align"
              done={alignDone}
              onDone={() => setAlignDone(true)}
              react={kit.react}
              hint="Rapproche M du trait bleu : la jauge diminue quand tu t’en approches."
            />
          ),
        },
        {
          num: 2,
          title: 'Place M au milieu de [AB]',
          subtitle: 'AM et MB doivent afficher le même nombre.',
          done: midDone,
          content: (kit) => (
            <Task
              mode="midpoint"
              done={midDone}
              onDone={() => setMidDone(true)}
              react={kit.react}
              hint="Reste sur le trait, puis équilibre : si AM est plus petit que MB, avance vers B."
            />
          ),
        },
        {
          num: 3,
          title: 'Qu’est-ce que le milieu, exactement ?',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="Le milieu M d’un segment [AB], c’est le point qui vérifie…"
              options={[
                'M est sur [AB] et AM = MB',
                'M est à peu près au centre du dessin',
                'AM = MB, où que soit M',
              ]}
              correct={0}
              cols={1}
              explain="Deux conditions, pas une : M doit appartenir au segment ET les deux longueurs doivent être égales. Un point hors de la droite peut être à égale distance de A et de B sans être le milieu."
              explainWrong="Attention : l’égalité AM = MB ne suffit pas. Un point situé au-dessus de la droite peut être à égale distance de A et de B — il n’est pas pour autant le milieu de [AB]."
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
          <Dot className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Un point <strong className="text-white">appartient</strong> à une droite, ou il n’y appartient
            pas — il n’y a pas d’« à peu près ». Et le milieu se définit par une égalité de longueurs.
          </p>
        </motion.div>
      }
    />
  );
}
