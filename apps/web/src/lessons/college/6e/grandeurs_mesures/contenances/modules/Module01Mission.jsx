import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LiquidContainer from '../components/LiquidContainer';

// Capacités réelles (en mL), jamais affichées à l'élève : la cruche, plus
// large, SEMBLE contenir plus que la bouteille haute et fine — c'est
// justement le piège que la manipulation doit lui faire découvrir.
const BOTTLE_CAP = 1200;
const JUG_CAP = 900;

function PourReveal({ solved, onSolved }) {
  const [predicted, setPredicted] = useState(null);
  const [poured, setPoured] = useState(false);
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);

  const overflowAmount = BOTTLE_CAP - JUG_CAP; // > 0 ici : ça déborde
  const jugFillPct = poured ? Math.min(1, BOTTLE_CAP / JUG_CAP) : 0;
  const correctIndex = overflowAmount > 0 ? 0 : overflowAmount < 0 ? 1 : 2;
  const isRight = checked && pick === correctIndex;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">D’abord, un avis — il n’y a pas de mauvaise réponse ici.</p>
      <ChoiceGrid
        options={['La bouteille contient plus', 'La cruche contient plus', 'On dirait pareil']}
        selected={predicted}
        onSelect={setPredicted}
        revealed={false}
        cols={3}
      />

      <div className="flex items-end justify-center gap-10 pt-2">
        <LiquidContainer shape="bottle" fillPct={poured ? 0 : 1} color="#3b82f6" ariaLabel="Bouteille pleine" />
        <LiquidContainer shape="jug" fillPct={jugFillPct} overflowing={poured && overflowAmount > 0} color="#3b82f6" ariaLabel="Cruche" />
      </div>

      {predicted !== null && !poured && (
        <div className="text-center">
          <ValidateButton onClick={() => setPoured(true)}>Verser la bouteille dans la cruche</ValidateButton>
        </div>
      )}

      {poured && (
        <div className="space-y-4">
          <Feedback tone="info">
            {overflowAmount > 0 && 'Regarde : la cruche déborde ! Elle ne pouvait pas contenir tout le liquide de la bouteille.'}
            {overflowAmount < 0 && 'Toute la bouteille est passée dans la cruche, et il restait encore de la place.'}
            {overflowAmount === 0 && 'Toute la bouteille est passée dans la cruche, pile jusqu’au bord.'}
          </Feedback>
          <p className="text-sm font-semibold text-slate-700 text-center">Alors, laquelle contient le plus ?</p>
          <ChoiceGrid
            options={['La bouteille contient plus', 'La cruche contient plus', 'Elles contiennent pareil']}
            selected={pick}
            onSelect={(i) => { setChecked(false); setPick(i); }}
            revealed={checked}
            correctIndex={correctIndex}
            cols={3}
            disabled={solved}
          />
          {!solved && (
            <div className="text-center">
              <ValidateButton onClick={() => { setChecked(true); if (pick === correctIndex) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
            </div>
          )}
          {checked && !isRight && (
            <Feedback tone="hint">Reviens à ce que tu as observé : est-ce que ça a débordé, ou est-ce qu’il restait de la place ?</Feedback>
          )}
          {(isRight || solved) && checked && (
            <Feedback tone="ok">
              La bouteille, plus haute et plus fine, contient en réalité plus que la cruche, plus large mais moins
              profonde. La forme d’un récipient ne dit pas tout : il faut vérifier.
            </Feedback>
          )}
        </div>
      )}
    </div>
  );
}

function FreePour({ solved, onSolved }) {
  const [level, setLevel] = useState(1); // 0 = vide, 1 = plein (verre)
  const [bucketLevel, setBucketLevel] = useState(0);
  const [poured, setPoured] = useState(false);

  const doPour = () => {
    setBucketLevel((b) => Math.min(1, b + 0.22));
    setLevel(0);
    setPoured(true);
    if (!solved) onSolved?.();
  };

  const refill = () => setLevel(1);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        À toi : remplis le verre, verse-le dans le seau, puis recommence. Observe le seau se remplir petit à petit.
      </p>
      <div className="flex items-end justify-center gap-10">
        <div className="flex flex-col items-center gap-2">
          <LiquidContainer shape="glass" fillPct={level} color="#0ea5e9" ariaLabel="Verre" height={140} />
          {level < 1 ? (
            <ValidateButton tone="slate" onClick={refill}>Remplir le verre</ValidateButton>
          ) : (
            <ValidateButton onClick={doPour}>Verser dans le seau</ValidateButton>
          )}
        </div>
        <LiquidContainer shape="bucket" fillPct={bucketLevel} color="#0ea5e9" ariaLabel="Seau" />
      </div>
      {poured && (
        <Feedback tone="ok">
          Chaque verre versé ajoute la même petite quantité au seau : c’est en transvasant, verre après verre, qu’on
          peut vraiment mesurer une contenance.
        </Feedback>
      )}
    </div>
  );
}

export default function Module01Mission() {
  const navLinks = getNavLinks(1);
  const [pourDone, setPourDone] = useState(false);
  const [freeDone, setFreeDone] = useState(false);
  const allDone = pourDone && freeDone;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Mission : lequel contient le plus ?"
      moduleSubtitle="Une bouteille, une cruche : laquelle contient le plus d’eau ?"
      moduleNumber={1}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 01" title="Avant toute définition, regarde et vérifie.">
          <p>La forme d’un récipient peut tromper l’œil. Il n’y a qu’une façon d’être sûr : transvaser.</p>
        </MissionBrief>

        <StepCard num={1} title="La bouteille ou la cruche ?" done={pourDone}>
          <PourReveal solved={pourDone} onSolved={() => setPourDone(true)} />
        </StepCard>

        <StepCard num={2} title="À toi de transvaser" done={freeDone} locked={!pourDone}>
          <FreePour solved={freeDone} onSolved={() => setFreeDone(true)} />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Droplets className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Tu sais déjà comparer des contenances en transvasant. Prochaine étape : apprendre à les mesurer
              vraiment.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
