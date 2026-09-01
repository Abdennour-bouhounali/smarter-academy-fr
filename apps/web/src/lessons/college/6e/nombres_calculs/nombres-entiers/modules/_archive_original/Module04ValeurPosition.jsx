import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { useModuleEffects } from '../../../../../common/hooks/useModuleEffects';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PlaceValueTable from '../components/PlaceValueTable';
import {
  Feedback, ChoiceGrid, StepCard, MissionBrief,
  XPBurst, StepProgressBar, StreakChip, EffectsToggle,
} from '../../../../../common/components/LessonUI';
import { formatFr, PLACE_SINGULAR } from '../components/numberUtils';
import { isStepLocked } from '../../../../../common/utils/stepUnlock';

const GRAND = 4582307;

const PLACE_VALUE = { M: 1000000, CM: 100000, DM: 10000, UM: 1000, C: 100, D: 10, U: 1 };

/* ─── Étape 1 : chasse au chiffre ────────────────────────────────── */
const CHASSES = [
  {
    digit: 8,
    key: 'DM',
    place: 'dizaines de milliers',
    options: ['8', '80', '8 000', '80 000'],
    correct: 3,
    explain:
      "Le 8 est à la position des dizaines de milliers. Il représente donc 8 dizaines de milliers, c'est-à-dire 80 000 — et non « 8 ».",
  },
  {
    digit: 3,
    key: 'C',
    place: 'centaines',
    options: ['3', '30', '300', '3 000'],
    correct: 2,
    explain: 'Le 3 est à la position des centaines : il représente 3 centaines, soit 300.',
  },
  {
    digit: 5,
    key: 'CM',
    place: 'centaines de milliers',
    options: ['5 000', '50 000', '500 000', '5 000 000'],
    correct: 2,
    explain:
      'Le 5 est à la position des centaines de milliers : il représente 5 centaines de milliers, soit 500 000.',
  },
];

function DigitHunt({ chasse, solved, onSolved, react }) {
  const [clicked, setClicked] = useState(null);
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);

  const located = clicked === chasse.key;

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4">
        <PlaceValueTable
          value={GRAND}
          selectedKey={clicked}
          onDigitClick={(cell) => {
            if (solved) return;
            setClicked(cell.key);
            setPick(null);
            setRevealed(false);
          }}
        />
      </div>

      {!clicked && (
        <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <MousePointerClick className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" aria-hidden="true" />
          <span>
            Clique sur le chiffre <strong className="font-mono text-base">{chasse.digit}</strong> dans le tableau.
          </span>
        </div>
      )}

      {clicked && !located && (
        <Feedback tone="hint">
          Ce n'est pas le bon chiffre : tu as sélectionné un{' '}
          <strong className="font-mono">{Math.floor(GRAND / (PLACE_VALUE[clicked] || 1)) % 10}</strong>. Le chiffre{' '}
          <strong className="font-mono">{chasse.digit}</strong> demandé est à la position des {chasse.place} —
          clique dessus, ou continue directement avec la question ci-dessous.
        </Feedback>
      )}

      {clicked && (
        <>
          <p className="text-sm font-semibold text-slate-700">
            Que représente le chiffre <span className="font-mono text-base">{chasse.digit}</span> dans{' '}
            <span className="font-mono">{formatFr(GRAND)}</span> ?
          </p>
          <div className="relative">
            <ChoiceGrid
              options={chasse.options}
              selected={pick}
              onSelect={(i) => {
                setPick(i);
                setRevealed(true);
                const isCorrect = i === chasse.correct;
                const id = react(isCorrect);
                if (isCorrect) setBurst(id);
                onSolved?.();
              }}
              revealed={revealed}
              correctIndex={chasse.correct}
              cols={2}
            />
            <XPBurst amount={10} tick={burst} />
          </div>
          {revealed && (
            <Feedback tone={pick === chasse.correct ? 'ok' : 'ko'}>
              {pick !== chasse.correct && (
                <>
                  Bonne réponse : <strong>{chasse.options[chasse.correct]}</strong>. {' '}
                </>
              )}
              {chasse.explain}
            </Feedback>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Étape 2 : le nombre 5 555 ──────────────────────────────────── */
const CINQS = [
  { key: 'UM', label: 'milliers', options: ['5', '50', '500', '5 000'], correct: 3, value: 5000 },
  { key: 'C', label: 'centaines', options: ['5', '50', '500', '5 000'], correct: 2, value: 500 },
  { key: 'D', label: 'dizaines', options: ['5', '50', '500', '5 000'], correct: 1, value: 50 },
  { key: 'U', label: 'unités', options: ['5', '50', '500', '5 000'], correct: 0, value: 5 },
];

function CinqCinqCinqCinq({ done, onStepDone, react }) {
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);
  const current = CINQS[idx];
  const finished = done.length === CINQS.length;

  const validate = (i) => {
    setPick(i);
    setRevealed(true);
    const isCorrect = i === current.correct;
    const id = react(isCorrect);
    if (isCorrect) setBurst(id);
    onStepDone(idx);
    setTimeout(() => {
      if (idx < CINQS.length - 1) {
        setIdx((i2) => i2 + 1);
        setPick(null);
        setRevealed(false);
      }
    }, 1400);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4">
        <PlaceValueTable
          value={5555}
          highlightKeys={finished ? [] : [current.key]}
          showValues={finished}
        />
      </div>

      {!finished ? (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {CINQS.map((c, i) => (
              <span
                key={c.key}
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full ${
                  done.includes(i)
                    ? 'bg-emerald-100 text-emerald-700'
                    : i === idx
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done.includes(i) ? '✓ ' : ''}
                {c.label}
              </span>
            ))}
          </div>

          <p className="text-sm font-semibold text-slate-700">
            Le 5 surligné est à la position des <strong>{current.label}</strong>. Que représente-t-il ?
          </p>
          <div className="relative">
            <ChoiceGrid
              options={current.options}
              selected={pick}
              onSelect={validate}
              revealed={revealed}
              correctIndex={current.correct}
              cols={2}
            />
            <XPBurst amount={10} tick={burst} />
          </div>
          {revealed && (
            <Feedback tone={pick === current.correct ? 'ok' : 'ko'}>
              {pick === current.correct ? (
                <>
                  Oui : ce 5 vaut <strong className="font-mono">{formatFr(current.value)}</strong> car il occupe la
                  position des {current.label}.
                </>
              ) : (
                <>
                  Regarde la colonne surlignée : c'est celle des {current.label}. Un 5 placé là vaut{' '}
                  <strong className="font-mono">{formatFr(current.value)}</strong>, soit 5{' '}
                  {PLACE_SINGULAR[current.key]}s.
                </>
              )}
            </Feedback>
          )}
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <div className="font-mono text-4xl font-extrabold tabular-nums">5 555</div>
            <div className="text-slate-400">=</div>
            <div className="font-mono text-xl font-bold text-amber-300">5 000 + 500 + 50 + 5</div>
          </div>
          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl p-5 text-center">
            <div className="text-xs font-mono uppercase tracking-widest text-violet-200 mb-1">
              À retenir absolument
            </div>
            <div className="text-lg sm:text-xl font-space font-extrabold">
              Le chiffre n'est pas la valeur.
            </div>
            <p className="text-sm text-violet-100 mt-1">
              Quatre fois le même chiffre 5, quatre valeurs différentes. C'est la <strong>position</strong> qui
              décide.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 3 : chiffre des milliers ≠ nombre de milliers ────────── */
const DISTINCTION = [
  {
    q: 'Quel est le CHIFFRE des milliers de 12 450 ?',
    options: ['1', '2', '12', '450'],
    correct: 1,
    explain:
      "Le chiffre des milliers est celui qui occupe la colonne des milliers : c'est le 2. Un chiffre, c'est toujours un seul symbole entre 0 et 9.",
  },
  {
    q: 'Combien y a-t-il de milliers dans 12 450 ?',
    options: ['2', '12', '450', '12 450'],
    correct: 1,
    explain:
      "Il y a 12 milliers complets dans 12 450 (12 000), plus 450 en plus. Le NOMBRE de milliers compte tous les milliers du nombre, pas seulement le chiffre de la colonne.",
  },
];

export default function Module04ValeurPosition() {
  const navLinks = getNavLinks(4);
  const { isModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const alreadyCompleted = isModuleCompleted('4');
  const { effectsEnabled, toggleEffects, streak, react } = useModuleEffects();

  const [chassesDone, setChassesDone] = useState([]);
  const [cinqsDone, setCinqsDone] = useState([]);
  const [distDone, setDistDone] = useState([]);

  const s1 = chassesDone.length === CHASSES.length;
  const s2 = cinqsDone.length === CINQS.length;
  const s3 = distDone.length === DISTINCTION.length;
  const allDone = alreadyCompleted || (s1 && s2 && s3);
  const doneCount = [s1, s2, s3].filter(Boolean).length;

  const incompleteSteps = [
    !s1 && { num: 1, title: `Chasse au chiffre dans ${formatFr(GRAND)}` },
    !s2 && { num: 2, title: 'Le nombre 5 555 : quatre chiffres identiques' },
    !s3 && { num: 3, title: 'Attention au piège : chiffre des milliers ≠ nombre de milliers' },
  ].filter(Boolean);

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="La valeur de chaque chiffre"
      moduleSubtitle="Le même chiffre peut valoir 5, 50, 500 ou 5 000. Sa position décide de tout."
      moduleNumber={4}
      estimatedTime="12 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
      incompleteSteps={incompleteSteps}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {!allDone && <StepProgressBar doneCount={doneCount} total={3} />}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <StreakChip count={streak} />
          <EffectsToggle enabled={effectsEnabled} onToggle={toggleEffects} />
        </div>

        <MissionBrief
          tag="🎯 Cœur de la leçon"
          title="Un chiffre seul ne dit rien. Un chiffre placé dit tout."
          tone="indigo"
        >
          <p>
            Dans ce module, tu vas manipuler le <strong>tableau de numération</strong> pour découvrir ce que
            représente vraiment chaque chiffre d'un grand nombre.
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard
          num={1}
          title={`Chasse au chiffre dans ${formatFr(GRAND)}`}
          subtitle="Localise le chiffre demandé, puis dis ce qu'il représente."
          done={s1}
        >
          <div className="space-y-8">
            {CHASSES.map((chasse, i) =>
              i === 0 || chassesDone.includes(i - 1) ? (
                <div key={chasse.digit} className="space-y-3">
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Chasse {i + 1} / {CHASSES.length}
                  </div>
                  <DigitHunt
                    chasse={chasse}
                    solved={chassesDone.includes(i)}
                    onSolved={() => setChassesDone((d) => (d.includes(i) ? d : [...d, i]))}
                    react={react}
                  />
                </div>
              ) : null
            )}
          </div>
        </StepCard>

        {/* Étape 2 */}
        <StepCard
          num={2}
          title="Le nombre 5 555 : quatre chiffres identiques"
          subtitle="Quatre fois le chiffre 5 — mais représentent-ils la même chose ?"
          done={s2}
          locked={isStepLocked(alreadyCompleted, !s1)}
        >
          <CinqCinqCinqCinq
            done={cinqsDone}
            onStepDone={(i) => setCinqsDone((d) => (d.includes(i) ? d : [...d, i]))}
            react={react}
          />
        </StepCard>

        {/* Étape 3 */}
        <StepCard
          num={3}
          title="Attention au piège : chiffre des milliers ≠ nombre de milliers"
          subtitle="Deux questions qui se ressemblent, deux réponses différentes."
          done={s3}
          locked={isStepLocked(alreadyCompleted, !s2)}
        >
          <div className="space-y-4">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4">
              <PlaceValueTable value={12450} showValues />
            </div>
            {DISTINCTION.map((d, i) => (
              <MiniQuestion
                key={d.q}
                item={d}
                solved={distDone.includes(i)}
                onSolved={() => setDistDone((prev) => (prev.includes(i) ? prev : [...prev, i]))}
                react={react}
              />
            ))}
            {s3 && (
              <Feedback tone="info">
                Retiens la nuance : le <strong>chiffre</strong> des milliers se lit dans une seule colonne (2),
                alors que le <strong>nombre</strong> de milliers compte tous les milliers du nombre (12). Cette
                distinction te servira dans les problèmes.
              </Feedback>
            )}
          </div>
        </StepCard>

      </div>
    </ModuleLayout>
  );
}

/* ─── Petite question à choix ────────────────────────────────────── */
function MiniQuestion({ item, solved, onSolved, react }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);

  return (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      <p className="text-sm font-semibold text-slate-700">{item.q}</p>
      <div className="relative">
        <ChoiceGrid
          options={item.options}
          selected={pick}
          onSelect={(i) => {
            setPick(i);
            setRevealed(true);
            const isCorrect = i === item.correct;
            const id = react(isCorrect);
            if (isCorrect) setBurst(id);
            onSolved?.();
          }}
          revealed={revealed}
          correctIndex={item.correct}
          cols={2}
        />
        <XPBurst amount={10} tick={burst} />
      </div>
      {revealed && (
        <Feedback tone={pick === item.correct ? 'ok' : 'ko'}>
          {pick !== item.correct && (
            <>
              Bonne réponse : <strong>{item.options[item.correct]}</strong>. {' '}
            </>
          )}
          {item.explain}
        </Feedback>
      )}
    </div>
  );
}
