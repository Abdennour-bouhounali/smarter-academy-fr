import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 2 — DÉCOUVERTE : la règle graduée (P1, P4).
 *
 * Objectif : tracer une longueur EXACTE, et éviter le piège du zéro — la
 * graduation 0 n'est pas au bord de la règle.
 *
 * Aha : une mesure est une DIFFÉRENCE de graduations, pas la graduation
 * d'arrivée. Poser le bout sur 1 et lire 8 donne 7, pas 8.
 *
 * Misconception visée : le piège du zéro, déjà rencontré en « Longueurs »,
 * et qui ressurgit dès qu'on trace au lieu de mesurer.
 */
/** Une petite règle graduée, purement visuelle. */
function RulerStrip({ from, to, highlight }) {
  const W = 320;
  const PAD = 20;
  const N = 10;
  const step = (W - 2 * PAD) / N;
  const x = (v) => PAD + v * step;
  return (
    <svg
      viewBox={`0 0 ${W} 90`}
      className="w-full max-w-[460px] mx-auto bg-white rounded-xl border-2 border-slate-200"
      role="img"
      aria-label={`Règle graduée, objet placé de la graduation ${from} à la graduation ${to}`}
    >
      <g style={{ pointerEvents: 'none' }}>
        <rect x={PAD - 8} y="18" width={W - 2 * PAD + 16} height="30" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" rx="3" />
        {Array.from({ length: N + 1 }, (_, i) => (
          <g key={i}>
            <line x1={x(i)} y1="18" x2={x(i)} y2={i % 5 === 0 ? 34 : 28} stroke="#ca8a04" strokeWidth="1.2" />
            <text x={x(i)} y="45" textAnchor="middle" className="font-mono" fontSize="9" fill="#854d0e">{i}</text>
          </g>
        ))}
        {/* L'objet mesuré */}
        <line x1={x(from)} y1="66" x2={x(to)} y2="66" stroke="#4f46e5" strokeWidth="5" strokeLinecap="round" />
        <line x1={x(from)} y1="52" x2={x(from)} y2="78" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1={x(to)} y1="52" x2={x(to)} y2="78" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="3 3" />
        {highlight && (
          <text x={(x(from) + x(to)) / 2} y="86" textAnchor="middle" className="font-mono" fontSize="11" fill="#4338ca">
            {to} − {from} = {to - from}
          </text>
        )}
      </g>
    </svg>
  );
}

export default function Module02RegleGraduee() {
  const [zeroDone, setZeroDone] = useState(false);
  const [mesureDone, setMesureDone] = useState(false);
  const [tracerDone, setTracerDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="La règle graduée"
      moduleSubtitle="Une longueur exacte — sans le piège du zéro."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'La graduation 0 n’est pas au bord de la règle.',
        body: (
          <p>
            C’est le piège classique. Une mesure est une <strong>différence</strong> de graduations, jamais
            la graduation d’arrivée.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Combien mesure ce segment ?',
          subtitle: 'Regarde bien où il commence.',
          done: zeroDone,
          content: (
            <NumericQuestion
              above={(revealed) => <RulerStrip from={1} to={8} highlight={revealed} />}
              prompt="Le segment va de la graduation 1 à la graduation 8. Quelle est sa longueur ?"
              suffix="unités"
              expected={7}
              explain="8 − 1 = 7. La longueur est la DIFFÉRENCE entre les deux graduations."
              explainFor={(n) =>
                n === 8
                  ? 'Tu as lu la graduation d’arrivée. Mais le segment ne commence pas à 0 : il faut faire 8 − 1 = 7.'
                  : n === 9
                    ? 'On soustrait, on n’additionne pas : 8 − 1 = 7.'
                    : 'La longueur est la différence des graduations : 8 − 1 = 7.'
              }
              solved={zeroDone}
              onAnswered={() => setZeroDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'La bonne méthode',
          done: mesureDone,
          content: (
            <TapQuestion
              above={<RulerStrip from={0} to={6} highlight />}
              prompt="Quelle est la façon la plus sûre de mesurer un segment avec une règle graduée ?"
              options={[
                'Aligner une extrémité sur la graduation 0, puis lire l’autre',
                'Poser la règle n’importe où et lire la graduation d’arrivée',
                'Poser le bord de la règle sur le segment',
              ]}
              correct={0}
              cols={1}
              explain="Aligner sur 0 permet de lire directement la longueur, sans soustraction — donc sans erreur. Sinon, il faut penser à soustraire."
              explainWrong="Le bord de la règle n’est pas la graduation 0 : c’est exactement le piège. Aligne toujours sur le 0, ou pense à soustraire."
              solved={mesureDone}
              onAnswered={() => setMesureDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Tracer une longueur donnée',
          done: tracerDone,
          content: (
            <TapQuestion
              prompt="On demande de tracer un segment [AB] de 7 cm. Quelle est la bonne marche à suivre ?"
              options={[
                'Placer A sur le 0, marquer un point au 7, puis relier à la règle',
                'Tracer un trait « à peu près » de 7 cm',
                'Tracer un trait, puis le mesurer et l’ajuster',
              ]}
              correct={0}
              cols={1}
              explain="On place d’abord les deux points aux bonnes graduations, puis on trace. Le tracé vient APRÈS la mesure — jamais l’inverse."
              explainWrong="Tracer puis ajuster fait perdre l’exactitude à chaque retouche. On repère les points d’abord, on relie ensuite."
              solved={tracerDone}
              onAnswered={() => setTracerDone(true)}
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
          <Ruler className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Une longueur est une <strong className="text-white">différence de graduations</strong>. Aligne
            sur le 0 quand tu peux — et souviens-toi que le bord de la règle n’est pas le zéro.
          </p>
        </motion.div>
      }
    />
  );
}
