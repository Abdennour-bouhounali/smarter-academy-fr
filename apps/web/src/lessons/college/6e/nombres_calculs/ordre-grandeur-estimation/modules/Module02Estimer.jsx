import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RoundPicker from '../components/RoundPicker';

/**
 * Module 2 — découverte, reconstruit sur le lesson kit.
 *
 * La démarche d'estimation, pas à pas : arrondir chaque nombre (RoundPicker,
 * sur droite graduée), assembler l'estimation, la formuler, puis distinguer
 * estimation et calcul exact. L'assemblage se révèle automatiquement quand
 * les deux arrondis sont répondus — plus d'étape auto-certifiée.
 */

/* ─── Étape 1 : le laboratoire d'estimation, pas à pas ───────────── */
function Laboratoire({ r1, r2, onR1, onR2 }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        On veut estimer <strong className="font-mono">197 + 302</strong>. On remplace chaque nombre par son ami
        le plus proche, un par un.
      </p>

      <RoundPicker value={197} step={10} solved={r1} onAnswered={onR1} label="197 est plus proche de quel nombre ami ?" />

      {r1 && (
        <div className="border-t border-slate-100 pt-5">
          <RoundPicker value={302} step={10} solved={r2} onAnswered={onR2} label="302 est plus proche de quel nombre ami ?" />
        </div>
      )}

      {r1 && r2 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Estimation</div>
          <div className="font-mono text-2xl font-extrabold text-amber-300">200 + 300 = 500</div>
          <p className="text-sm text-slate-300">
            Deux arrondis simples, une addition mentale : voilà la démarche.
          </p>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 2 : la formule qui résume tout ───────────────────────── */
const FORMULE_Q = {
  q: 'Quelle phrase résume ce que tu viens de faire ?',
  options: [
    'Je remplace temporairement les nombres par des nombres plus simples, pour avoir une idée rapide du résultat',
    'Je calcule le résultat exact, mais plus vite',
    'Je devine un nombre au hasard',
  ],
  correct: 0,
  explain:
    "Estimer, ce n'est pas calculer plus vite — c'est remplacer les nombres par des nombres FACILES, pour obtenir une idée fiable du résultat AVANT le calcul exact.",
};

/* ─── Étape 3 : estimation ≠ calcul exact ────────────────────────── */
const DISTINCT_Q = {
  q: "Dans le cas B, l'estimation (500) et le résultat exact (495) sont différents. Qu'est-ce que cela nous apprend ?",
  options: [
    "L'estimation est fausse, il ne faut jamais l'utiliser",
    "Une estimation donne une valeur APPROCHÉE, pas forcément exacte — c'est normal et ça reste utile pour contrôler",
  ],
  correct: 1,
  explain:
    "Une estimation donne un ordre de grandeur, pas la valeur exacte. 495 reste tout à fait cohérent avec l'estimation 500 : l'écart est petit. L'estimation sert à repérer les erreurs GROSSIÈRES, pas à remplacer le calcul exact.",
};

function EstimVsExact({ solved, onAnswered }) {
  return (
    <TapQuestion
      above={
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-emerald-200 bg-emerald-50 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-mono text-emerald-600 uppercase">Cas A</div>
            <div className="font-mono text-sm text-slate-700">198 + 302</div>
            <div className="font-mono text-xs text-slate-500">≈ 200 + 300 = 500</div>
            <div className="font-mono font-bold text-emerald-700">exact = 500</div>
          </div>
          <div className="border-2 border-amber-200 bg-amber-50 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-mono text-amber-600 uppercase">Cas B</div>
            <div className="font-mono text-sm text-slate-700">198 + 297</div>
            <div className="font-mono text-xs text-slate-500">≈ 200 + 300 = 500</div>
            <div className="font-mono font-bold text-amber-700">exact = 495</div>
          </div>
        </div>
      }
      prompt={DISTINCT_Q.q}
      requires={['nombre-ami']}
      options={DISTINCT_Q.options}
      correct={DISTINCT_Q.correct}
      cols={1}
      explain={DISTINCT_Q.explain}
      solved={solved}
      onAnswered={onAnswered}
    />
  );
}

export default function Module02Estimer() {
  const [r1, setR1] = useState(false);
  const [r2, setR2] = useState(false);
  const [formuleDone, setFormuleDone] = useState(false);
  const [distinctDone, setDistinctDone] = useState(false);

  const s1 = r1 && r2;
  const s2 = formuleDone;
  const s3 = distinctDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Estimer avant de calculer"
      moduleSubtitle="Remplacer temporairement des nombres compliqués par des nombres simples."
      estimatedTime="8 min"
      brief={{
        tag: '🧪 Laboratoire',
        title: 'Avant de calculer exactement, je peux prévoir à peu près.',
        body: <p>C'est le premier réflexe à construire : une estimation rapide, avant tout calcul détaillé.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Estime 197 + 302, étape par étape',
          done: s1,
          content: (
            <div className="space-y-5">
              <Laboratoire r1={r1} r2={r2} onR1={() => setR1(true)} onR2={() => setR2(true)} />
              {s1 && (
                <KnowledgeBrick
                  id="nombre-ami"
                  variant="new"
                  lead="Les deux nombres ronds que tu viens de choisir sur la droite graduée."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Ce que tu viens de faire, en une phrase',
          done: s2,
          content: (
            <TapQuestion
              prompt={FORMULE_Q.q}
              requires={['nombre-ami']}
              options={FORMULE_Q.options}
              correct={FORMULE_Q.correct}
              cols={1}
              explain={FORMULE_Q.explain}
              solved={formuleDone}
              onAnswered={() => setFormuleDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Estimation et calcul exact : pas la même chose',
          done: s3,
          content: (
            <div className="space-y-5">
              <EstimVsExact solved={distinctDone} onAnswered={() => setDistinctDone(true)} />
              {s3 && (
                <KnowledgeBrick
                  id="estimation-approchee"
                  variant="new"
                  lead="Les 5 d'écart du cas B : ils ne rendent pas l'estimation fausse."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Choisir le nombre ami « à l'œil » a ses limites. On va
          apprendre à le faire à coup sûr, et à lui donner son nom.
        </KnowledgeSnapshot>
      }
    />
  );
}
