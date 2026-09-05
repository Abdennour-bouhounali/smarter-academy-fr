import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartitionShape from '../components/PartitionShape';

/**
 * Module 1 V2 — reconstruit sur le lesson kit.
 *
 * Étape 1 (PartageAtelier) reste une manipulation maison : ce n'est pas une
 * question à choix, c'est atteindre un objectif (3 parts sur 4) en tapant.
 * Comme il n'existe pas d'état « faux » ici (on tape juste tant qu'on n'a
 * pas exactement 3 parts), elle appelle kit.react(true) et onSolved() dès
 * que la cible est atteinte — pas de correction à afficher.
 *
 * Enhancement (2026-08-23) : refonte visuelle/typographique.
 * La pédagogie, la logique et tous les composants externes sont inchangés.
 */

/* ─────────────────────────────────────────────────────────────────────
   COMPOSANTS PUREMENT PRÉSENTATIONNELS
   ───────────────────────────────────────────────────────────────────── */

/** Étiquette de contexte de mission — petite pastille colorée */
function MissionLabel({ children, color = 'amber' }) {
  const colors = {
    amber: 'bg-amber-100 text-amber-800 border-amber-300',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest ${colors[color]}`}>
      {children}
    </span>
  );
}

/** Compteur visuel de progression du partage */
function ProgressCounter({ count, total }) {
  const done = count === total - 1; // target is 3/4
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`font-mono font-extrabold text-3xl sm:text-4xl transition-colors ${count > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
        {count} / {total}
      </div>
      <div className="text-sm text-slate-500 font-sans">
        {count === 0
          ? 'Touche une part pour la prendre'
          : count === 1
          ? '1 part prise — continue !'
          : count === total - 1
          ? `${count} parts prises — encore une !`
          : `${count} parts prises`}
      </div>
    </div>
  );
}

/** Bloc de question visuelle — met la question en avant */
function QuestionBlock({ children }) {
  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-indigo-500 text-lg" aria-hidden="true">💡</span>
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
          À toi de trouver
        </span>
      </div>
      <div className="text-lg sm:text-xl font-semibold text-indigo-900 leading-relaxed font-sans">
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   ÉTAPE 1 — MANIPULATION DU CHOCOLAT
   ───────────────────────────────────────────────────────────────────── */
function PartageAtelier({ react, solved, onSolved }) {
  const [cells, setCells] = useState([]);
  const parts = 4;
  const target = 3;
  const count = solved ? target : cells.length;
  const isDone = solved || cells.length === target;

  const toggle = (i) => {
    if (solved) return;
    const next = cells.includes(i) ? cells.filter((x) => x !== i) : [...cells, i].sort();
    setCells(next);
    if (next.length === target) {
      react(true);
      onSolved?.();
    }
  };

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <div className="space-y-2">
        <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-sans">
          La tablette est déjà coupée en{' '}
          <strong className="text-slate-900">4 parts égales</strong> — un partage équitable
          entre 4 personnes.
        </p>
        {!isDone && (
          <p className="text-base text-amber-700 font-semibold font-sans">
            👆 Touche exactement <strong>3 parts</strong> — celles que tu manges.
          </p>
        )}
      </div>

      {/* Chocolate stage */}
      <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-5 sm:p-7 flex flex-col items-center gap-5">
        <div className="w-full max-w-sm">
          <PartitionShape
            shape="bar"
            parts={parts}
            cells={solved ? [0, 1, 2] : cells}
            onToggle={toggle}
            tone="amber"
            size="lg"
          />
        </div>

        {/* Progress counter */}
        <ProgressCounter count={count} total={parts} />
      </div>

      {/* Success state */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl bg-emerald-50 border-2 border-emerald-300 p-5 flex items-start gap-3"
          >
            <span className="text-2xl shrink-0" aria-hidden="true">✓</span>
            <div className="space-y-1">
              <p className="text-base sm:text-lg font-bold text-emerald-800 font-sans">
                Partage réussi !
              </p>
              <p className="text-base text-emerald-700 leading-relaxed font-sans">
                Tu as pris <strong>3 parts sur les 4</strong>.
                C'est exactement cette quantité qu'il va falloir apprendre à noter.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   ÉTAPE 2 — NOTATION (TapQuestion, question mise en valeur)
   ───────────────────────────────────────────────────────────────────── */
const NOTATION_Q = {
  q: 'Comment pourrais-tu noter la quantité que tu as mangée, le plus simplement possible ?',
  options: [
    '« 3 sur 4 », en indiquant les deux nombres : les parts prises et le total des parts',
    '« 3 », le nombre de parts prises suffit',
    '« 4 », le nombre total de parts suffit',
    '« 3 + 4 », en additionnant les deux nombres',
  ],
  correct: 0,
  explain:
    "Le nombre 3 seul ne suffit pas : « 3 parts » de quoi ? Il faut aussi savoir en combien de parts l'unité a été coupée. Une notation utile doit garder LES DEUX informations : les parts prises ET le total des parts égales.",
};

/* Wrapper visuel autour de TapQuestion pour afficher la question en grand */
function NotationStep({ notationDone, setNotationDone }) {
  return (
    <div className="space-y-5">
      <QuestionBlock>
        {NOTATION_Q.q}
      </QuestionBlock>
      <TapQuestion
        prompt=""
        options={NOTATION_Q.options}
        correct={NOTATION_Q.correct}
        cols={1}
        explain={NOTATION_Q.explain}
        solved={notationDone}
        onAnswered={() => setNotationDone(true)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   ÉTAPE 3 — RÉVÉLATION DE LA FRACTION
   ───────────────────────────────────────────────────────────────────── */
function NotationReveal({ revealed, onReveal }) {
  return (
    <div className="space-y-6">
      {!revealed ? (
        <div className="space-y-5">
          {/* Bridge — reminder of what was manipulated */}
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 flex flex-col items-center gap-3">
            <MissionLabel color="amber">Ce que tu as fait</MissionLabel>
            <div className="w-full max-w-xs">
              <PartitionShape shape="bar" parts={4} shaded={3} tone="amber" size="md" />
            </div>
            <p className="text-base sm:text-lg font-semibold text-amber-800 text-center font-sans">
              3 parts sur 4
            </p>
          </div>

          <div className="flex justify-center">
            <ValidateButton onClick={onReveal} tone="indigo">
              Découvrir la notation mathématique →
            </ValidateButton>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          {/* The visual bridge: chocolate → notation */}
          <div className="rounded-2xl bg-slate-900 text-white overflow-hidden">
            {/* Chocolate row */}
            <div className="p-5 flex flex-col items-center gap-3 border-b border-white/10">
              <MissionLabel color="amber">Ta manipulation</MissionLabel>
              <div className="w-full max-w-xs">
                <PartitionShape shape="bar" parts={4} shaded={3} tone="amber" size="md" />
              </div>
              <p className="text-base text-amber-200 font-sans">3 parts sur 4</p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-3 text-slate-500 text-xl" aria-hidden="true">↓</div>

            {/* Fraction reveal */}
            <div className="p-5 flex flex-col items-center gap-4">
              <MissionLabel color="indigo">La notation mathématique</MissionLabel>

              {/* Big fraction */}
              <div
                className="text-6xl sm:text-7xl font-mono font-extrabold text-amber-300 py-2"
                aria-label="trois quarts"
              >
                <MathText>{'$\\frac{3}{4}$'}</MathText>
              </div>

              {/* Spoken form */}
              <p className="text-lg sm:text-xl text-slate-200 font-sans text-center">
                « trois sur quatre »
              </p>

              {/* Breakdown */}
              <div className="flex items-stretch justify-center gap-0 rounded-xl overflow-hidden border border-white/10 text-center text-sm w-full max-w-xs">
                <div className="flex-1 bg-amber-900/40 px-3 py-3 space-y-1">
                  <div className="font-mono font-extrabold text-2xl text-amber-300">3</div>
                  <div className="text-amber-200 font-sans leading-snug text-sm">parts prises</div>
                </div>
                <div className="w-px bg-white/10" aria-hidden="true" />
                <div className="flex-1 bg-indigo-900/40 px-3 py-3 space-y-1">
                  <div className="font-mono font-extrabold text-2xl text-indigo-300">4</div>
                  <div className="text-indigo-200 font-sans leading-snug text-sm">parts égales au total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Closing insight */}
          <Feedback tone="info">
            <span className="text-base leading-7 font-sans">
              C'est une <strong>fraction</strong> — une écriture qui garde les deux informations :
              les <strong>parts prises</strong> et le <strong>nombre total de parts égales</strong>.
              Dans les modules suivants, tu vas construire, nommer et utiliser ces nombres.
            </span>
          </Feedback>
        </motion.div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   EXPORT PRINCIPAL
   ───────────────────────────────────────────────────────────────────── */
export default function Module01Mission() {
  const [partageDone, setPartageDone] = useState(false);
  const [notationDone, setNotationDone] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const s1 = partageDone;
  const s2 = notationDone;
  const s3 = revealed;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Mission : Le partage impossible"
      moduleSubtitle="Une tablette, 4 personnes, un partage équitable. Comment noter ce que j'ai reçu ?"
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Une tablette de chocolat doit être partagée entre 4 personnes.',
        body: (
          <p>
            Chaque personne doit recevoir{' '}
            <strong className="text-white">exactement la même quantité</strong>.
            Toi, tu manges ta part... et 2 autres parts en plus, données par tes amis.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Prends tes parts',
          subtitle: 'Sélectionne les 3 parts que tu manges.',
          done: s1,
          content: (kit) => (
            <PartageAtelier react={kit.react} solved={partageDone} onSolved={() => setPartageDone(true)} />
          ),
        },
        {
          num: 2,
          title: 'Comment noter cette quantité ?',
          subtitle: 'Trouve la meilleure façon de noter ce que tu as pris.',
          done: s2,
          content: (
            <NotationStep notationDone={notationDone} setNotationDone={setNotationDone} />
          ),
        },
        {
          num: 3,
          title: 'La notation mathématique',
          subtitle: 'Découvre comment les mathématiciens écrivent cette quantité.',
          done: s3,
          content: <NotationReveal revealed={revealed} onReveal={() => setRevealed(true)} />,
        },
      ]}
    />
  );
}
