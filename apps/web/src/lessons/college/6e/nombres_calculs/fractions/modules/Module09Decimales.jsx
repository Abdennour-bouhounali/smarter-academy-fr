import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartitionShape from '../components/PartitionShape';
import FractionBuilder from '../components/FractionBuilder';
import { texFrac, formatDec } from '../components/fractionUtils';

/**
 * Module « pont » (V2, sur le lesson kit) : AUCUNE reprise du cours Nombres
 * décimaux (dixièmes, centièmes, tableau de numération, droite décimale...).
 * On part de ce que l'élève sait déjà et on construit uniquement le lien
 * avec l'écriture fractionnaire.
 */

/* ─── Étape 1 : 0,5 ↔ 1/2 ─────────────────────────────────────────── */
function BridgeUnDemi({ solved, onSolved, react }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Tu as déjà vu que <strong className="font-mono">0,5</strong> représente une demi-unité.
      </p>
      <PartitionShape shape="bar" parts={10} shaded={5} tone="sky" size="md" />

      <p className="text-sm font-semibold text-slate-700">
        Écris cette même quantité sous forme de fraction décimale (dénominateur 10).
      </p>
      <FractionBuilder
        targetNum={5}
        targetDen={10}
        denOptions={[10, 100]}
        solved={revealed}
        onSolved={() => {
          react(true);
          setRevealed(true);
        }}
        hint="5 parts coloriées sur 10 au total."
      />

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Trois écritures, une quantité</div>
          <div className="text-2xl font-mono font-extrabold text-amber-300">
            <MathText>{'$0{,}5 = \\frac{5}{10} = \\frac{1}{2}$'}</MathText>
          </div>
          {!solved && (
            <div className="pt-2">
              <ValidateButton onClick={() => onSolved?.()}>J'ai compris</ValidateButton>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 2 : 0,25 ↔ 25/100 ─────────────────────────────────────── */
function BridgeVingtCinqCentiemes({ solved, onSolved, react }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-5">
      {/* ── Ancre : la valeur décimale bien visible ───────────────── */}
      <div className="flex items-center gap-4 bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
        <div className="text-4xl font-black font-mono text-slate-800 shrink-0">0,25</div>
        <div className="text-slate-400 text-xl shrink-0">=</div>
        <div className="text-sm text-slate-600 leading-snug">
          25 <strong>centièmes</strong> — c'est-à-dire 25 parts sur une unité découpée en <strong>100</strong>.
        </div>
      </div>

      {/* ── Visualisation : 4 bandes de 25 centièmes ─────────────── */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          L'unité entière = 100 centièmes (4 bandes de 25)
        </div>
        <div className="space-y-1 rounded-xl overflow-hidden border-2 border-violet-200">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex h-8">
              {Array.from({ length: 25 }, (_, col) => (
                <div
                  key={col}
                  className={`flex-1 border-r border-white/40 last:border-r-0 ${
                    row === 0 ? 'bg-violet-500' : 'bg-violet-100'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-violet-500 inline-block" />
            <span className="text-violet-700 font-bold">25 centièmes = 0,25</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-violet-100 border border-violet-200 inline-block" />
            <span className="text-slate-500">75 restants</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">total : <strong className="text-slate-700">100</strong></span>
        </div>
      </div>

      {/* ── Chaîne visuelle de raisonnement ───────────────────────── */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { top: '0,25', bot: 'écriture à virgule', bg: 'bg-slate-800 text-white', border: '' },
          { top: '25 centièmes', bot: 'lecture en français', bg: 'bg-white text-slate-700', border: 'border-2 border-slate-200' },
          { top: '25 / 100', bot: 'écriture fractionnaire ?', bg: 'bg-violet-50 text-violet-800', border: 'border-2 border-violet-200' },
        ].map(({ top, bot, bg, border }, i) => (
          <div key={i} className={`${bg} ${border} rounded-xl p-3 space-y-1`}>
            <div className="font-black font-mono text-sm leading-tight">{top}</div>
            <div className="text-[10px] opacity-70 leading-tight">{bot}</div>
          </div>
        ))}
      </div>

      {/* ── Construction de la fraction ────────────────────────────── */}
      <FractionBuilder
        targetNum={25}
        targetDen={100}
        denOptions={[10, 100]}
        maxNum={25}
        solved={revealed}
        onSolved={() => {
          react(true);
          setRevealed(true);
        }}
        hint="25 parts coloriées sur 100 au total."
      />

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Trois façons de dire la même chose</div>
          <div className="text-2xl font-mono font-extrabold text-amber-300">
            <MathText>{'$0{,}25 = \\frac{25}{100}$'}</MathText>
          </div>
          <p className="text-xs text-slate-400">
            Le chiffre après la virgule (2 décimales) indique directement le dénominateur : 100.
          </p>
          {!solved && (
            <div className="pt-1">
              <ValidateButton onClick={() => onSolved?.()}>J'ai compris</ValidateButton>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 3 : la règle générale, en une phrase ─────────────────── */
const REGLE_Q = {
  q: "Quelle phrase résume ce que tu viens d'observer ?",
  options: [
    'Une fraction décimale est une fraction dont le dénominateur est 10, 100, 1 000…, et elle correspond directement à une écriture à virgule',
    'Toutes les fractions peuvent devenir des nombres décimaux',
    'Une fraction décimale est toujours plus petite que 1',
  ],
  correct: 0,
  explain:
    "Exactement : dès que le dénominateur est une puissance de 10 (10, 100, 1 000…), la fraction s'écrit directement avec une virgule. C'est le lien entre les deux notations que tu connais maintenant.",
};

const FLASH = [
  { n: 1, d: 10, dec: 0.1 },
  { n: 1, d: 100, dec: 0.01 },
];

export default function Module09Decimales() {
  const [b1, setB1] = useState(false);
  const [b2, setB2] = useState(false);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="Fractions décimales"
      moduleSubtitle="Tu connais déjà 0,5 et 0,25 : quel est leur lien avec les fractions ?"
      estimatedTime="8 min"
      brief={{
        tag: '🌉 Pont',
        title: 'Deux notations que tu connais déjà, reliées entre elles.',
        body: (
          <p>
            Ce module ne reprend pas la leçon sur les nombres décimaux — tu la connais. On va simplement relier ce
            que tu sais déjà à l'écriture fractionnaire.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: '0,5 et sa fraction',
          done: b1,
          content: (kit) => <BridgeUnDemi solved={b1} onSolved={() => setB1(true)} react={kit.react} />,
        },
        {
          num: 2,
          title: '0,25 et sa fraction',
          done: b2,
          content: (kit) => <BridgeVingtCinqCentiemes solved={b2} onSolved={() => setB2(true)} react={kit.react} />,
        },
        {
          num: 3,
          title: 'La règle, et deux rappels flash',
          done: s3,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {FLASH.map((f) => (
                  <div key={f.d} className="border-2 border-slate-200 rounded-2xl p-3 bg-white text-center space-y-1">
                    <MathText className="text-xl">{`$${texFrac(f.n, f.d)}$`}</MathText>
                    <div className="text-slate-400" aria-hidden="true">=</div>
                    <div className="font-mono font-bold text-lg text-slate-800">{formatDec(f.dec)}</div>
                  </div>
                ))}
              </div>

              <TapQuestion
                prompt={REGLE_Q.q}
                options={REGLE_Q.options}
                correct={REGLE_Q.correct}
                cols={1}
                explain={REGLE_Q.explain}
                solved={s3}
                onAnswered={() => setS3(true)}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
