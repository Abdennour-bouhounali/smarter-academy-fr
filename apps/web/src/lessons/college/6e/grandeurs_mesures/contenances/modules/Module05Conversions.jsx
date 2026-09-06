import React, { useState } from 'react';
import { Check, AlertTriangle, ArrowRight, Lightbulb, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { ValidateButton, Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { convert, parseDec, formatCapacity, factorBetween, roundTo } from '../components/capacityUtils';

/**
 * Module 5 V2 — reconstruit sur le lesson kit.
 * UX améliorée via des composants visuels inline (Smarter Academy UI).
 */

const UNITS = ['L', 'dL', 'cL', 'mL'];

/* ── COMPOSANTS VISUELS ──────────────────────────────────────────── */

function CapacityLadder({ fromUnit, toUnit, active = false }) {
  const startIndex = UNITS.indexOf(fromUnit);
  const endIndex = UNITS.indexOf(toUnit);
  const isGrowing = startIndex < endIndex; // e.g. L -> cL (number grows)
  const minIdx = Math.min(startIndex, endIndex);
  const maxIdx = Math.max(startIndex, endIndex);

  return (
    <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-6 pt-2 px-2 -mx-2 snap-x">
      {UNITS.map((u, i) => {
        const isActive = active && i >= minIdx && i <= maxIdx;
        const isFrom = u === fromUnit;
        const isTo = u === toUnit;

        let colorClass = "bg-white text-slate-400 border-slate-200";
        if (isActive) {
          if (isGrowing) colorClass = "bg-blue-50 text-blue-800 border-blue-400 shadow-sm";
          else colorClass = "bg-orange-50 text-orange-800 border-orange-400 shadow-sm";
        }

        return (
          <React.Fragment key={u}>
            <div className="relative flex flex-col items-center shrink-0 snap-center">
              <div className={`flex items-center justify-center w-14 h-14 rounded-2xl border-2 font-mono font-extrabold text-xl transition-colors ${colorClass}`}>
                {u}
              </div>
              {active && isFrom && <div className="absolute -bottom-6 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Départ</div>}
              {active && isTo && <div className="absolute -bottom-6 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Arrivée</div>}
            </div>

            {i < UNITS.length - 1 && (
              <div className="relative flex flex-col items-center justify-center w-8 sm:w-12 h-14 shrink-0">
                <div className={`h-1 w-full rounded-full ${active && i >= minIdx && i < maxIdx ? (isGrowing ? 'bg-blue-300' : 'bg-orange-300') : 'bg-slate-200'}`} />
                {active && i >= minIdx && i < maxIdx && (
                  <div
                    className={`absolute -top-2 px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold text-white shadow-sm ${isGrowing ? 'bg-blue-500' : 'bg-orange-500'
                      }`}
                  >
                    {isGrowing ? '×10' : '÷10'}
                  </div>
                )}
                {/* Arrow head indicator */}
                {active && i >= minIdx && i < maxIdx && (
                  <div className={`absolute top-1/2 -translate-y-1/2 font-bold ${isGrowing ? 'text-blue-500 right-0 translate-x-1/2' : 'text-orange-500 left-0 -translate-x-1/2'}`}>
                    {isGrowing ? '▸' : '◂'}
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function WorkedExample({ done, onSolved }) {
  const [step, setStep] = useState(0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-8 relative overflow-hidden shadow-sm">
        {/* Background grid texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-200/50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <Search className="w-3 h-3" /> Exemple détaillé
            </div>
            <div className="font-mono text-3xl font-extrabold text-slate-800">1,5 L = ? cL</div>
          </div>

          {/* Steps */}
          <div className="space-y-4 max-w-sm mx-auto">
            <AnimatePresence>
              {step >= 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="font-mono font-bold text-slate-600">1 L</div>
                  <div className="text-slate-300 font-bold">→</div>
                  <div className="font-mono font-bold text-slate-800">100 cL</div>
                </motion.div>
              )}
              {step >= 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="font-mono font-bold text-slate-600">0,5 L</div>
                  <div className="text-slate-300 font-bold">→</div>
                  <div className="font-mono font-bold text-slate-800">50 cL</div>
                </motion.div>
              )}
              {step >= 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2 text-center">
                  <div className="font-mono font-bold text-slate-500 mb-2">100 cL + 50 cL</div>
                  <div className="text-slate-300 font-bold mb-2">↓</div>
                  <div className="font-mono text-4xl font-extrabold text-blue-600 bg-blue-50 inline-block px-6 py-3 rounded-3xl border-2 border-blue-200 shadow-sm">150 cL</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls / Why */}
          {!done ? (
            <div className="text-center pt-4">
              {step < 3 ? (
                <ValidateButton onClick={() => setStep(s => s + 1)}>Étape suivante</ValidateButton>
              ) : (
                <ValidateButton onClick={() => onSolved?.()}>J’ai compris, à moi de jouer</ValidateButton>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 font-bold text-amber-800 mb-2">
                <Lightbulb className="w-5 h-5" /> Pourquoi ?
              </div>
              <p className="text-sm text-amber-900 leading-relaxed">
                Le <strong>cL</strong> est une unité plus petite que le <strong>L</strong>. Il faut donc <strong>davantage</strong> de cL pour représenter la même quantité ! Le nombre devient plus grand.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom TapQuestion replacement to allow rich visual cards
function DirectionChoice({ round, done, onDirChosen }) {
  const [selected, setSelected] = useState(null);
  const [hasValidated, setHasValidated] = useState(done);
  const isGrowing = round.grow;

  const handleSelect = (choice) => {
    if (hasValidated) return;
    setSelected(choice);
  };

  const handleValidate = () => {
    if (selected === null || hasValidated) return;
    setHasValidated(true);
    if (selected === isGrowing) {
      onDirChosen?.();
    }
  };

  const isCorrect = selected === isGrowing;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className={`flex-1 flex flex-col items-center justify-center gap-2 p-5 rounded-3xl border-4 transition-all text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${selected === true
              ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-md'
              : hasValidated
                ? 'border-slate-200 bg-slate-50 opacity-50'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          onClick={() => handleSelect(true)}
          disabled={hasValidated}
        >
          <div className="font-mono text-xl font-extrabold text-blue-700">PLUS GRAND</div>
          <div className="text-sm font-bold text-blue-600/70">Unité plus petite</div>
        </button>

        <button
          className={`flex-1 flex flex-col items-center justify-center gap-2 p-5 rounded-3xl border-4 transition-all text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 ${selected === false
              ? 'border-orange-500 bg-orange-50 scale-[1.02] shadow-md'
              : hasValidated
                ? 'border-slate-200 bg-slate-50 opacity-50'
                : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'
            }`}
          onClick={() => handleSelect(false)}
          disabled={hasValidated}
        >
          <div className="font-mono text-xl font-extrabold text-orange-700">PLUS PETIT</div>
          <div className="text-sm font-bold text-orange-600/70">Unité plus grande</div>
        </button>
      </div>

      {!hasValidated && selected !== null && (
        <div className="text-center">
          <ValidateButton onClick={handleValidate}>Valider</ValidateButton>
        </div>
      )}

      {hasValidated && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Feedback tone={isCorrect ? 'ok' : 'ko'}>
              {isCorrect ? (
                <>
                  <div className="font-bold flex items-center gap-2 mb-1">
                    <Check className="w-5 h-5" /> Bien joué !
                  </div>
                  On exprime la même contenance avec une unité <strong>{isGrowing ? 'plus petite' : 'plus grande'}</strong> : il en faut donc {isGrowing ? 'davantage' : 'moins'}, le nombre {isGrowing ? 'augmente' : 'diminue'}.
                </>
              ) : (
                <>
                  <div className="font-bold flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5" /> Pas tout à fait
                  </div>
                  Regarde bien l'échelle. Tu vas vers une unité <strong>{isGrowing ? 'plus petite' : 'plus grande'}</strong>, donc le nombre doit devenir {isGrowing ? 'plus grand' : 'plus petit'}. Recommence !
                </>
              )}
            </Feedback>

            {!isCorrect && (
              <div className="text-center mt-4">
                <button
                  onClick={() => { setSelected(null); setHasValidated(false); }}
                  className="px-4 py-2 font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition"
                >
                  Réessayer
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function ConversionRound({ round, index, total, done, onSolved }) {
  const [dirDone, setDirDone] = useState(false);
  const expected = convert(round.value, round.from, round.to);
  const factor = factorBetween(round.from, round.to);
  const rule = round.grow ? `× ${factor}` : `÷ ${1 / factor}`;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm">
      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-500 mb-6 text-center">
        Conversion {index + 1}/{total}
      </div>

      <div className="text-center font-mono text-3xl sm:text-4xl font-extrabold text-slate-800 mb-8">
        {formatCapacity(round.value, round.from)} = <span className="text-slate-300">?</span> {round.to}
      </div>

      <div className="mb-8">
        <CapacityLadder fromUnit={round.from} toUnit={round.to} active={true} />
      </div>

      <div className="space-y-6">
        <div className="text-center font-bold text-slate-700">Dans quelle direction va le nombre ?</div>
        <DirectionChoice
          round={round}
          done={done || dirDone}
          onDirChosen={() => setDirDone(true)}
        />

        {(dirDone || done) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t-2 border-slate-100 overflow-hidden">
            <div className="flex items-center justify-center gap-4 font-mono font-bold text-lg mb-6">
              <div className="text-slate-600">{formatCapacity(round.value, round.from)}</div>
              <div className={`px-3 py-1 rounded-xl text-white ${round.grow ? 'bg-blue-500' : 'bg-orange-500'}`}>{rule}</div>
              <div className="text-slate-600">...</div>
            </div>

            <NumericQuestion
              requires={['convertir-contenance-methode', 'escalier-contenances']}
              prompt="Calcule maintenant la valeur exacte :"
              suffix={round.to}
              parse={parseDec}
              expected={(n) => !Number.isNaN(n) && Math.abs(roundTo(n, 4) - roundTo(expected, 4)) < 1e-6}
              display={formatCapacity(expected, round.to)}
              explain={null} // Keep it clean, the visual path explains it
              solved={done}
              onAnswered={() => onSolved?.()}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DetectiveCard({ item, done, onSolved }) {
  const [selected, setSelected] = useState(null);
  const [hasValidated, setHasValidated] = useState(done);

  const handleSelect = (idx) => {
    if (hasValidated) return;
    setSelected(idx);
  };

  const handleValidate = () => {
    if (selected === null || hasValidated) return;
    setHasValidated(true);
    if (selected === item.correct) {
      onSolved?.();
    }
  };

  const isCorrect = selected === item.correct;

  return (
    <div className="bg-yellow-50/50 border-2 border-yellow-200 rounded-3xl p-5 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-yellow-400 text-white flex items-center justify-center shrink-0">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-yellow-600">Détective des conversions</div>
          <div className="font-bold text-slate-800">Trouve l'erreur avant qu'elle ne passe !</div>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 p-6 rounded-2xl text-center mb-6 shadow-inner relative overflow-hidden">
        {/* Notebook lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(transparent 95%, #94a3b8 95%)', backgroundSize: '100% 24px' }} />
        <div className="relative font-mono text-2xl font-bold text-slate-700">
          {item.qDisplay}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {item.options.map((opt, idx) => (
          <button
            key={idx}
            className={`w-full text-left p-4 rounded-2xl border-2 font-bold transition-all ${selected === idx
                ? 'border-violet-500 bg-violet-50 text-violet-900 shadow-sm scale-[1.01]'
                : hasValidated
                  ? 'border-slate-200 bg-white text-slate-400 opacity-60'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'
              }`}
            onClick={() => handleSelect(idx)}
            disabled={hasValidated}
          >
            {opt}
          </button>
        ))}
      </div>

      {!hasValidated && selected !== null && (
        <div className="text-center">
          <ValidateButton onClick={handleValidate}>Confirmer l'analyse</ValidateButton>
        </div>
      )}

      {hasValidated && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Feedback tone={isCorrect ? 'ok' : 'ko'}>
              {isCorrect ? (
                <>
                  <div className="font-bold flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5" /> Analyse parfaite
                  </div>
                  {item.explain}
                </>
              ) : (
                <>
                  <div className="font-bold flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" /> Reprends ta loupe
                  </div>
                  L'analyse n'est pas la bonne. Regarde bien la relation entre les unités !
                </>
              )}
            </Feedback>

            {/* Visual Repair if correct and if it was an error */}
            {isCorrect && item.repair && (
              <div className="mt-4 pt-4 border-t-2 border-emerald-200/50 text-center font-mono font-bold">
                <div className="text-slate-400 line-through decoration-rose-400 decoration-2 mb-2">{item.qDisplay}</div>
                <div className="text-emerald-700 text-xl">{item.repair}</div>
              </div>
            )}

            {!isCorrect && (
              <div className="text-center mt-4">
                <button
                  onClick={() => { setSelected(null); setHasValidated(false); }}
                  className="px-4 py-2 font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition"
                >
                  Poursuivre l'enquête
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}



/* ── DONNÉES PÉDAGOGIQUES ────────────────────────────────────────── */

const ROUNDS = [
  { id: 'r1', value: 2, from: 'L', to: 'cL', grow: true },
  { id: 'r2', value: 750, from: 'mL', to: 'L', grow: false },
  { id: 'r3', value: 1.5, from: 'L', to: 'mL', grow: true },
  { id: 'r4', value: 320, from: 'cL', to: 'L', grow: false },
];

const DETECTIVE_ITEMS = [
  {
    qDisplay: '2 L = 20 mL',
    options: ['Il n’y a pas d’erreur, 2 L = 20 mL', 'Il s’est trompé d’échelle : 1 L = 1000 mL'],
    correct: 1,
    explain: '1 L contient 1000 mL (pas 10).',
    repair: '2 L = 2000 mL'
  },
  {
    qDisplay: '3,2 L = 320 cL',
    options: ['Oui : 1 L = 100 cL, donc 3,2 L = 320 cL', 'Non, il a dû se tromper quelque part'],
    correct: 0,
    explain: 'C’est correct ! 1 L = 100 cL, donc 3,2 × 100 = 320 cL. Toutes les affirmations ne sont pas fausses.',
    repair: null
  },
];

/* ── MODULE PRINCIPAL ────────────────────────────────────────────── */

export default function Module05Conversions() {
  const [exampleDone, setExampleDone] = useState(false);
  const [roundsDone, setRoundsDone] = useState([]);
  const [detDone, setDetDone] = useState([]);
  const allRoundsDone = roundsDone.length === ROUNDS.length;
  const allDetDone = detDone.length === DETECTIVE_ITEMS.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Convertir les contenances"
      moduleSubtitle="Passer d’une unité à l’autre."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 05',
        title: "Convertir, ce n'est pas déplacer la virgule au hasard.",
        body: (
          <div className="mt-4">
            <p className="mb-4">Avant de calculer, demande-toi toujours : cette nouvelle unité est-elle plus grande ou plus petite ?</p>
            <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-200 w-fit">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-800">1</span> Comprendre
              <ArrowRight className="w-4 h-4 text-blue-300" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-800">2</span> Convertir
              <ArrowRight className="w-4 h-4 text-blue-300" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-800">3</span> Détecter
            </div>
          </div>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'D’où vient le chiffre ?',
          done: exampleDone,
          content: (
            <div className="space-y-5">
              <WorkedExample done={exampleDone} onSolved={() => setExampleDone(true)} />
              {/* Le calcul vient d'être déplié pas à pas : la méthode et le
                  réflexe de sens sont posés AVANT les quatre conversions. */}
              {exampleDone && (
                <KnowledgeBrick
                  id="convertir-contenance-methode"
                  variant="new"
                  lead="Tu viens de voir d’où sortent les 150 cL. Voici la recette, en deux temps."
                />
              )}
              {exampleDone && (
                <KnowledgeBrick
                  id="mem-sens-conversion-contenance"
                  variant="new"
                  lead="Le seul réflexe à retenir pour ne jamais convertir à l’envers."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Quatre conversions, une seule logique',
          done: allRoundsDone,
          content: (
            <div className="space-y-8">
              {ROUNDS.map((r, i) =>
                i === 0 || roundsDone.includes(i - 1) ? (
                  <ConversionRound
                    key={r.id}
                    round={r}
                    index={i}
                    total={ROUNDS.length}
                    done={roundsDone.includes(i)}
                    onSolved={() => setRoundsDone((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Détecter les erreurs',
          done: allDetDone,
          content: (
            <div className="space-y-8">
              {DETECTIVE_ITEMS.map((item, i) =>
                i === 0 || detDone.includes(i - 1) ? (
                  <DetectiveCard
                    key={i}
                    item={item}
                    done={detDone.includes(i)}
                    onSolved={() => setDetDone((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                ) : null
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Tu convertis juste. Au dernier module d’entraînement, le litre
          va prendre une forme — et les commandes du bar vont mélanger les unités.
        </KnowledgeSnapshot>
      }
    />
  );
}
