import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartitionShape from '../components/PartitionShape';
import { texFrac, partName } from '../components/fractionUtils';

/* ─── Étape 1 : les quatre fractions de référence, en contexte ───── */
const CONTEXTES = [
  { den: 2, num: 1, tone: 'sky', shape: 'bar', story: 'Une demi-heure, c\'est 30 minutes sur une heure de 60 minutes.', unit: '30 min sur 60' },
  { den: 3, num: 1, tone: 'violet', shape: 'circle', story: 'Un tiers de la classe (24 élèves) est parti en sortie : 8 élèves sont absents.', unit: '8 élèves sur 24' },
  { den: 4, num: 1, tone: 'amber', shape: 'bar', story: 'Un quart d\'heure, c\'est 15 minutes sur une heure de 60 minutes.', unit: '15 min sur 60' },
  { den: 10, num: 1, tone: 'emerald', shape: 'bar', story: 'Un dixième d\'un ruban de 1 m mesure 10 cm.', unit: '10 cm sur 100 cm' },
];

function ContexteCard({ item, solved, onSolved }) {
  const [cells, setCells] = useState([]);
  const isRight = cells.length === item.num;

  const toggle = (i) => {
    if (solved) return;
    setCells((prev) => (prev.includes(i) ? [] : [i]));
  };

  return (
    <div className="border-2 border-slate-200 rounded-2xl p-4 bg-white space-y-3">
      <p className="text-sm text-slate-700">{item.story}</p>
      <p className="text-xs font-mono text-slate-400">{item.unit}</p>
      <PartitionShape shape={item.shape} parts={item.den} cells={cells} onToggle={toggle} tone={item.tone} size="sm" />
      <p className="text-xs text-center text-slate-500">Tape la part qui correspond à cette situation.</p>

      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => isRight && onSolved?.()} disabled={!isRight}>
            Valider
          </ValidateButton>
        </div>
      )}

      {solved && (
        <Feedback tone="ok">
          <MathText>{`$${texFrac(item.num, item.den)}$`}</MathText> — c'est <strong>{partName(item.num, item.den)}</strong>.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 2 : jeu d'association ────────────────────────────────── */
const PAIRS = [
  { shape: 'bar', den: 4, num: 1, tone: 'sky' }, // un quart
  { shape: 'circle', den: 3, num: 2, tone: 'violet' }, // deux tiers
  { shape: 'bar', den: 10, num: 3, tone: 'emerald' }, // trois dixièmes
  { shape: 'bar', den: 2, num: 1, tone: 'amber' }, // un demi
];
const NAME_ORDER = [3, 0, 2, 1];

function JeuAssociation({ solved, onSolved }) {
  const [selectedShape, setSelectedShape] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState(null);

  const attemptMatch = (nameSlotPairIdx) => {
    if (selectedShape === null) return;
    if (selectedShape === nameSlotPairIdx) {
      const next = [...matched, selectedShape];
      setMatched(next);
      setSelectedShape(null);
      if (next.length === PAIRS.length) onSolved?.();
    } else {
      setWrong([selectedShape, nameSlotPairIdx]);
      setTimeout(() => setWrong(null), 700);
      setSelectedShape(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Tape une figure, puis tape le nom qui lui correspond.
      </p>

      <div className="grid grid-cols-2 gap-6">
        {/* Colonne figures */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase text-center">Figures</div>
          {PAIRS.map((p, i) => {
            const isMatched = matched.includes(i);
            const isSelected = selectedShape === i;
            const isWrong = wrong && wrong[0] === i;
            return (
              <button
                key={i}
                type="button"
                disabled={isMatched}
                onClick={() => setSelectedShape(i)}
                aria-pressed={isSelected}
                className={`w-full p-2 rounded-xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isMatched
                    ? 'border-emerald-300 bg-emerald-50 opacity-60'
                    : isWrong
                    ? 'border-rose-400 bg-rose-50'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-slate-200 bg-white hover:border-slate-400'
                }`}
              >
                <PartitionShape shape={p.shape} parts={p.den} shaded={p.num} tone={p.tone} size="sm" />
              </button>
            );
          })}
        </div>

        {/* Colonne noms (ordre mélangé) */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase text-center">Noms</div>
          {NAME_ORDER.map((pairIdx) => {
            const p = PAIRS[pairIdx];
            const isMatched = matched.includes(pairIdx);
            const isWrong = wrong && wrong[1] === pairIdx;
            return (
              <button
                key={pairIdx}
                type="button"
                disabled={isMatched}
                onClick={() => attemptMatch(pairIdx)}
                className={`w-full px-3 py-4 rounded-xl border-2 font-semibold text-sm capitalize transition-all min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isMatched
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 opacity-60'
                    : isWrong
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                {partName(p.num, p.den)}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs font-mono text-slate-400">
        {matched.length} / {PAIRS.length} paires trouvées
      </p>

      {solved && (
        <Feedback tone="ok">
          Bien joué ! Ces quatre fractions reviennent partout : à toi de les reconnaître, pas seulement de les
          réciter.
        </Feedback>
      )}
    </div>
  );
}

export default function Module07Simples() {
  const navLinks = getNavLinks(7);
  const [ctxDone, setCtxDone] = useState([]);
  const [jeuDone, setJeuDone] = useState(false);

  const s1 = ctxDone.length === CONTEXTES.length;
  const s2 = jeuDone;
  const allDone = s1 && s2;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Fractions simples"
      moduleSubtitle="Demi, tiers, quart, dixième : les reconnaître partout, pas seulement les réciter."
      moduleNumber={7}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🔎 Reconnaissance" title="Quatre fractions que tu croises tous les jours.">
          <p>Une demi-heure, un tiers de classe, un quart d'heure, un dixième de mètre : tu les connais déjà sans le savoir.</p>
        </MissionBrief>

        <StepCard num={1} title="Quatre situations du quotidien" done={s1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CONTEXTES.map((item, i) => (
              <ContexteCard
                key={`${item.num}-${item.den}`}
                item={item}
                solved={ctxDone.includes(i)}
                onSolved={() => setCtxDone((d) => (d.includes(i) ? d : [...d, i]))}
              />
            ))}
          </div>
        </StepCard>

        <StepCard num={2} title="Jeu d'association" subtitle="Figures ↔ noms, sans indice de position." done={s2} locked={!s1}>
          <JeuAssociation solved={jeuDone} onSolved={() => setJeuDone(true)} />
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
