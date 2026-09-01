import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartitionShape from '../components/PartitionShape';

/* ─── Étape 1 : le partage lui-même ──────────────────────────────── */
function PartageAtelier({ solved, onSolved }) {
  const [cells, setCells] = useState([]);
  const parts = 4;
  const target = 3;

  const toggle = (i) => {
    if (solved) return;
    setCells((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort()));
  };

  const isRight = cells.length === target;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        La tablette est déjà coupée en <strong>4 parts égales</strong> — un partage équitable entre 4 personnes.
        Tape sur <strong>tes 3 parts</strong> (celles que tu manges).
      </p>

      <PartitionShape shape="bar" parts={parts} cells={cells} onToggle={toggle} tone="amber" size="lg" />

      <p className="text-center text-sm font-mono text-slate-500">
        {cells.length} part{cells.length > 1 ? 's' : ''} sélectionnée{cells.length > 1 ? 's' : ''} sur {parts}
      </p>

      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => isRight && onSolved?.()} disabled={!isRight} tone="amber">
            Valider mes 3 parts
          </ValidateButton>
        </div>
      )}

      {solved && (
        <Feedback tone="ok">
          Tu as pris 3 parts sur les 4. C'est exactement cette quantité qu'il va falloir savoir noter.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 2 : la question sans réponse imposée ─────────────────── */
const NOTATION_Q = {
  q: "Comment pourrais-tu noter la quantité que tu as mangée, le plus simplement possible ?",
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

/* ─── Étape 3 : la révélation ─────────────────────────────────────── */

export default function Module01Mission() {
  const navLinks = getNavLinks(1);
  const [partageDone, setPartageDone] = useState(false);
  const [notationPick, setNotationPick] = useState(null);
  const [notationRevealed, setNotationRevealed] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const s1 = partageDone;
  const s2 = notationRevealed && notationPick === NOTATION_Q.correct;
  const s3 = revealed;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Mission : Le partage impossible"
      moduleSubtitle="Une tablette, 4 personnes, un partage équitable. Comment noter ce que j'ai reçu ?"
      moduleNumber={1}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 01" title="Une tablette de chocolat doit être partagée entre 4 personnes.">
          <p>
            Chaque personne doit recevoir <strong className="text-white">exactement la même quantité</strong>.
            Toi, tu manges ta part... et 2 autres parts en plus, données par tes amis.
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard num={1} title="Prends tes parts" done={s1}>
          <PartageAtelier solved={partageDone} onSolved={() => setPartageDone(true)} />
        </StepCard>

        {/* Étape 2 */}
        <StepCard num={2} title="Comment noter cette quantité ?" done={s2} locked={!s1}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{NOTATION_Q.q}</p>
            <ChoiceGrid
              options={NOTATION_Q.options}
              selected={notationPick}
              onSelect={setNotationPick}
              revealed={notationRevealed}
              correctIndex={NOTATION_Q.correct}
              cols={1}
            />
            {!notationRevealed && (
              <ValidateButton onClick={() => setNotationRevealed(true)} disabled={notationPick === null}>
                Valider
              </ValidateButton>
            )}
            {notationRevealed && (
              <Feedback tone={notationPick === NOTATION_Q.correct ? 'ok' : 'ko'}>
                {NOTATION_Q.explain}
                {notationPick !== NOTATION_Q.correct && (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={() => {
                        setNotationRevealed(false);
                        setNotationPick(null);
                      }}
                      className="underline font-semibold"
                    >
                      Réessayer
                    </button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        {/* Étape 3 — révélation */}
        <StepCard num={3} title="La notation mathématique" done={s3} locked={!s2}>
          <div className="space-y-4">
            {!revealed ? (
              <div className="text-center">
                <ValidateButton onClick={() => setRevealed(true)} tone="indigo">
                  Découvrir la notation →
                </ValidateButton>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3"
              >
                <PartitionShape shape="bar" parts={4} shaded={3} tone="amber" size="md" />
                <div className="text-slate-400 text-xs font-mono uppercase tracking-widest pt-2">
                  Les mathématiciens notent cette quantité
                </div>
                <div className="text-5xl font-mono font-extrabold text-amber-300">
                  <MathText>{'$\\frac{3}{4}$'}</MathText>
                </div>
                <p className="text-sm text-slate-300 pt-1">
                  On l'écrit <strong className="text-white">3/4</strong> : 3 parts prises, sur un total de 4 parts
                  égales. C'est une <strong className="text-white">fraction</strong>.
                </p>
              </motion.div>
            )}

            {revealed && (
              <Feedback tone="info">
                Tu viens de vivre l'idée centrale de toute la leçon : une fraction n'apparaît que{' '}
                <strong>quand un nombre entier ne suffit plus</strong> à décrire une quantité. Dans les modules
                suivants, tu vas construire, nommer et utiliser ces nombres.
              </Feedback>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
