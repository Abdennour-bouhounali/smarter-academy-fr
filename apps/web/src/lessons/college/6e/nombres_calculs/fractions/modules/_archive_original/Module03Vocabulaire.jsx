import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartitionShape from '../components/PartitionShape';
import { texFrac } from '../components/fractionUtils';

/* ─── Étape 1 : surligner numérateur / dénominateur ──────────────── */
const EXEMPLES = [
  { num: 3, den: 4, shape: 'bar', tone: 'amber' },
  { num: 2, den: 5, shape: 'circle', tone: 'violet' },
  { num: 7, den: 10, shape: 'bar', tone: 'sky' },
];

function HighlightExplorer({ item, solved, onSolved }) {
  const [seenNum, setSeenNum] = useState(false);
  const [seenDen, setSeenDen] = useState(false);
  const [highlight, setHighlight] = useState(null);

  const bothSeen = seenNum && seenDen;

  const NUM_COLOR = '#ef4444';
  const DEN_COLOR = '#6366f1';

  return (
    <div className="space-y-4">
      {/* Fraction écrite avec le nombre actif en couleur */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center">
          {/* numérateur */}
          <motion.div
            animate={{
              scale: highlight === 'numerator' ? 1.3 : 1,
              color: highlight === 'numerator' ? NUM_COLOR : highlight === 'denominator' ? '#94a3b8' : '#1e293b',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-3xl font-black leading-none"
          >
            {item.num}
          </motion.div>
          {/* barre */}
          <div className="w-10 h-0.5 bg-slate-700 my-1 rounded-full" />
          {/* dénominateur */}
          <motion.div
            animate={{
              scale: highlight === 'denominator' ? 1.3 : 1,
              color: highlight === 'denominator' ? DEN_COLOR : highlight === 'numerator' ? '#94a3b8' : '#1e293b',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-3xl font-black leading-none"
          >
            {item.den}
          </motion.div>
        </div>
      </div>

      <PartitionShape shape={item.shape} parts={item.den} shaded={item.num} tone={item.tone} highlight={highlight} size="md" />

      <div className="flex gap-2 justify-center flex-wrap">
        <button
          type="button"
          onClick={() => {
            setHighlight('numerator');
            setSeenNum(true);
          }}
          className={`px-4 py-2.5 rounded-xl border-2 font-mono text-xs font-bold min-h-[44px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            highlight === 'numerator'
              ? 'text-white border-amber-500'
              : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400'
          }`}
          style={highlight === 'numerator' ? { background: NUM_COLOR, borderColor: NUM_COLOR } : {}}
        >
          Voir le NUMÉRATEUR ({item.num})
        </button>
        <button
          type="button"
          onClick={() => {
            setHighlight('denominator');
            setSeenDen(true);
          }}
          className={`px-4 py-2.5 rounded-xl border-2 font-mono text-xs font-bold min-h-[44px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            highlight === 'denominator'
              ? 'text-white border-indigo-500'
              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
          }`}
          style={highlight === 'denominator' ? { background: DEN_COLOR, borderColor: DEN_COLOR } : {}}
        >
          Voir le DÉNOMINATEUR ({item.den})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {highlight === 'numerator' && (
          <motion.div
            key="num-fb"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Feedback tone="info">
              Le <strong style={{ color: NUM_COLOR }}>numérateur {item.num}</strong> = les{' '}
              <strong>{item.num} part{item.num > 1 ? 's' : ''} coloriée{item.num > 1 ? 's' : ''}</strong> (en haut de la fraction, en jaune sur le dessin).
            </Feedback>
          </motion.div>
        )}
        {highlight === 'denominator' && (
          <motion.div
            key="den-fb"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Feedback tone="info">
              Le <strong style={{ color: DEN_COLOR }}>dénominateur {item.den}</strong> = les{' '}
              <strong>{item.den} parts au total</strong> (en bas de la fraction, en indigo sur le dessin — chaque part est numérotée).
            </Feedback>
          </motion.div>
        )}
      </AnimatePresence>

      {bothSeen && !solved && (
        <div className="text-center">
          <ValidateButton onClick={() => onSolved?.()}>J'ai compris les deux</ValidateButton>
        </div>
      )}
    </div>
  );
}

/* ─── Étape 2 : lire numérateur et dénominateur ──────────────────── */
const LECTURES = [
  { num: 5, den: 8, shape: 'bar', tone: 'rose' },
  { num: 4, den: 6, shape: 'circle', tone: 'emerald' },
];

function LectureItem({ item, solved, onSolved }) {
  const [numPick, setNumPick] = useState(null);
  const [denPick, setDenPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const numOptions = [item.num, item.den, item.den - item.num].sort((a, b) => a - b).map(String);
  const denOptions = [item.den, item.num, item.den + 2].sort((a, b) => a - b).map(String);
  const numCorrect = numOptions.indexOf(String(item.num));
  const denCorrect = denOptions.indexOf(String(item.den));

  const isRight = numPick === numCorrect && denPick === denCorrect;

  return (
    <div className="space-y-4">
      <PartitionShape shape={item.shape} parts={item.den} shaded={item.num} tone={item.tone} size="md" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Combien de parts sont prises (numérateur) ?</p>
          <ChoiceGrid options={numOptions} selected={numPick} onSelect={setNumPick} revealed={revealed} correctIndex={numCorrect} cols={3} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">En combien de parts égales (dénominateur) ?</p>
          <ChoiceGrid options={denOptions} selected={denPick} onSelect={setDenPick} revealed={revealed} correctIndex={denCorrect} cols={3} />
        </div>
      </div>

      {!revealed && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setRevealed(true);
              if (isRight) onSolved?.();
            }}
            disabled={numPick === null || denPick === null}
          >
            Valider
          </ValidateButton>
        </div>
      )}

      {revealed && (
        <Feedback tone={isRight ? 'ok' : 'ko'}>
          {isRight ? (
            <>
              Exact : <MathText>{`$${texFrac(item.num, item.den)}$`}</MathText>.
            </>
          ) : (
            <>
              Recompte : combien de parts sont coloriées (numérateur) ? En combien de parts égales le tout
              est-il découpé (dénominateur) ?
            </>
          )}
          {!isRight && (
            <>
              {' '}
              <button
                type="button"
                onClick={() => {
                  setRevealed(false);
                  setNumPick(null);
                  setDenPick(null);
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
  );
}

/* ─── Étape 3 : le piège « 4 > 2 » ────────────────────────────────── */
const PIEGE = {
  q: '« 1/4 est plus grand que 1/2, car 4 est plus grand que 2. » Que penses-tu de cette phrase ?',
  options: [
    "C'est vrai : plus le dénominateur est grand, plus la fraction est grande",
    "C'est faux : plus le dénominateur est grand, plus les parts sont PETITES — donc 1/4 est plus petit que 1/2",
  ],
  correct: 1,
  explain:
    "Comparer 4 et 2 comme des nombres seuls ne dit rien sur la fraction. Un dénominateur plus grand veut dire des parts plus petites : couper une pizza en 4 donne des parts plus petites que la couper en 2. 1/4 < 1/2.",
};

function PiegeQuiz({ solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { num: 1, den: 2, tone: 'emerald' },
          { num: 1, den: 4, tone: 'rose' },
        ].map((f) => (
          <div key={f.den} className="border-2 border-slate-200 rounded-2xl p-3 bg-white space-y-2">
            <PartitionShape shape="bar" parts={f.den} shaded={f.num} tone={f.tone} size="sm" />
            <div className="text-center text-lg">
              <MathText>{`$${texFrac(f.num, f.den)}$`}</MathText>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm font-semibold text-slate-700">{PIEGE.q}</p>
      <ChoiceGrid options={PIEGE.options} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={PIEGE.correct} cols={1} />
      {!revealed && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setRevealed(true);
              if (pick === PIEGE.correct) onSolved?.();
            }}
            disabled={pick === null}
          >
            Valider
          </ValidateButton>
        </div>
      )}
      {revealed && (
        <Feedback tone={pick === PIEGE.correct ? 'ok' : 'ko'}>
          {PIEGE.explain}
          {pick !== PIEGE.correct && (
            <>
              {' '}
              <button
                type="button"
                onClick={() => {
                  setRevealed(false);
                  setPick(null);
                }}
                className="underline font-semibold"
              >
                Réessayer
              </button>
            </>
          )}
        </Feedback>
      )}
      {solved && (
        <Feedback tone="info">
          Retiens l'image : plus on partage en beaucoup de morceaux, plus chaque morceau est petit. Le
          dénominateur ne se lit jamais comme un nombre isolé.
        </Feedback>
      )}
    </div>
  );
}

export default function Module03Vocabulaire() {
  const navLinks = getNavLinks(3);
  const [exploreDone, setExploreDone] = useState([]);
  const [lecturesDone, setLecturesDone] = useState([]);
  const [piegeDone, setPiegeDone] = useState(false);

  const s1 = exploreDone.length === EXEMPLES.length;
  const s2 = lecturesDone.length === LECTURES.length;
  const s3 = piegeDone;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Numérateur et dénominateur"
      moduleSubtitle="Que raconte chaque nombre de la fraction ? Le sens avant le vocabulaire."
      moduleNumber={3}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🔍 Exploration" title="Deux nombres, deux rôles bien différents.">
          <p>
            Dans <MathText className="text-white">{'$\\frac{3}{4}$'}</MathText>, le 3 et le 4 ne racontent pas la
            même chose. Clique pour le découvrir toi-même.
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard num={1} title="Explore le rôle de chaque nombre" done={s1}>
          <div className="space-y-8">
            {EXEMPLES.map((item, i) =>
              i === 0 || exploreDone.includes(i - 1) ? (
                <div key={`${item.num}-${item.den}`} className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MousePointerClick className="w-3.5 h-3.5" aria-hidden="true" />
                    Exemple {i + 1} / {EXEMPLES.length}
                  </div>
                  <HighlightExplorer
                    item={item}
                    solved={exploreDone.includes(i)}
                    onSolved={() => setExploreDone((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                </div>
              ) : null
            )}

            {s1 && (
              <Feedback tone="ok">
                <strong>Numérateur</strong> = parts prises. <strong>Dénominateur</strong> = nombre total de parts
                égales. Ce n'est pas « le nombre du haut / le nombre du bas » : c'est le sens qui compte.
              </Feedback>
            )}
          </div>
        </StepCard>

        {/* Étape 2 */}
        <StepCard num={2} title="À toi de lire" done={s2} locked={!s1}>
          <div className="space-y-8">
            {LECTURES.map((item, i) =>
              i === 0 || lecturesDone.includes(i - 1) ? (
                <LectureItem
                  key={`${item.num}-${item.den}`}
                  item={item}
                  solved={lecturesDone.includes(i)}
                  onSolved={() => setLecturesDone((d) => (d.includes(i) ? d : [...d, i]))}
                />
              ) : null
            )}
          </div>
        </StepCard>

        {/* Étape 3 */}
        <StepCard num={3} title="Piège : le dénominateur n'est pas juste un nombre" done={s3} locked={!s2}>
          <PiegeQuiz solved={piegeDone} onSolved={() => setPiegeDone(true)} />
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
