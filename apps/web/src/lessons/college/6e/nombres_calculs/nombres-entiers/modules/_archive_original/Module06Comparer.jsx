import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { useModuleEffects } from '../../../../../common/hooks/useModuleEffects';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Base10Blocks from '../components/Base10Blocks';
import {
  Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief,
  XPBurst, StepProgressBar, StreakChip, EffectsToggle,
} from '../../../../../common/components/LessonUI';
import { formatFr, digitCells, highestPlaceValue } from '../components/numberUtils';
import { isStepLocked } from '../../../../../common/utils/stepUnlock';

/* ─── Étape 1 : comparer avec les yeux ───────────────────────────── */
const VISUEL = { a: 4500, b: 3900 };

/* ─── Étape 2 : le nombre de chiffres ────────────────────────────── */
const DUELS_CHIFFRES = [
  { a: 845, b: 1200, correct: 'b' },
  { a: 9999, b: 10000, correct: 'b' },
  { a: 100000, b: 99999, correct: 'a' },
];

/* ─── Étape 3 : laboratoire de comparaison ───────────────────────── */
const LABOS = [
  { a: 4582, b: 4527 },
  { a: 7348, b: 7352 },
];

function CompareLab({ a, b, solved, onSolved, react }) {
  const top = Math.max(highestPlaceValue(a), highestPlaceValue(b));
  const cellsA = digitCells(a, top);
  const cellsB = digitCells(b, top);
  const firstDiff = cellsA.findIndex((c, i) => c.digit !== cellsB[i].digit);

  const [revealed, setRevealed] = useState(0); // nb de colonnes comparées
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);

  const stopped = firstDiff !== -1 && revealed > firstDiff;
  const nextCell = cellsA[revealed];
  const correctSymbol = a > b ? '>' : a < b ? '<' : '=';

  return (
    <div className="space-y-4">
      {/* Tableau de comparaison */}
      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-1 min-w-max">
          <thead>
            <tr>
              <th className="w-14" />
              {cellsA.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className="px-1 pb-1 text-[9px] sm:text-[10px] font-mono text-slate-500 font-semibold uppercase max-w-[70px]"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'A', n: a, cells: cellsA },
              { label: 'B', n: b, cells: cellsB },
            ].map((row, ri) => (
              <React.Fragment key={row.label}>
                {ri === 1 && (
                  <tr>
                    <td />
                    {cellsA.map((c, i) => {
                      const isCompared = i < revealed;
                      const equal = cellsA[i].digit === cellsB[i].digit;
                      const isDecisive = i === firstDiff && revealed > firstDiff;
                      return (
                        <td key={c.key} className="text-center">
                          {isCompared && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.6 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`inline-block font-mono font-extrabold text-lg ${
                                isDecisive ? 'text-rose-600' : equal ? 'text-slate-400' : 'text-slate-300'
                              }`}
                            >
                              {equal ? '=' : cellsA[i].digit > cellsB[i].digit ? '>' : '<'}
                            </motion.span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )}
                <tr>
                  <th scope="row" className="text-[11px] font-mono font-bold text-slate-400 pr-1 text-right">
                    {row.label}
                  </th>
                  {row.cells.map((c, i) => {
                    const isCompared = i < revealed;
                    const isDecisive = i === firstDiff && revealed > firstDiff;
                    return (
                      <td key={c.key} className="p-0.5">
                        <div
                          className={`w-11 h-12 sm:w-14 sm:h-14 mx-auto rounded-xl border-2 flex items-center justify-center font-mono font-extrabold text-xl sm:text-2xl tabular-nums transition-all ${
                            isDecisive
                              ? 'border-rose-400 bg-rose-50 text-rose-700'
                              : isCompared
                              ? 'border-slate-300 bg-slate-100 text-slate-500'
                              : 'border-slate-200 bg-white text-slate-800'
                          }`}
                        >
                          {c.digit}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Progression de la comparaison */}
      {!stopped && !solved && (
        <div className="text-center space-y-2">
          <ValidateButton onClick={() => setRevealed((r) => r + 1)} tone="indigo">
            <ArrowDown className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Comparer les {nextCell?.label.toLowerCase()}
          </ValidateButton>
          <p className="text-xs text-slate-500">
            On commence toujours par la <strong>position la plus grande</strong>, à gauche.
          </p>
        </div>
      )}

      {revealed > 0 && !stopped && (
        <Feedback tone="info">
          {cellsA[revealed - 1].digit} contre {cellsB[revealed - 1].digit} à la position des{' '}
          {cellsA[revealed - 1].label.toLowerCase()} : c'est <strong>égal</strong>. On ne peut pas encore
          décider, on passe à la position suivante.
        </Feedback>
      )}

      {stopped && (
        <div className="space-y-4">
          <Feedback tone="hint">
            Première différence à la position des <strong>{cellsA[firstDiff].label.toLowerCase()}</strong> :{' '}
            <strong className="font-mono">
              {cellsA[firstDiff].digit} {cellsA[firstDiff].label.toLowerCase()}
            </strong>{' '}
            contre{' '}
            <strong className="font-mono">
              {cellsB[firstDiff].digit} {cellsB[firstDiff].label.toLowerCase()}
            </strong>
            . Inutile de regarder les positions suivantes : la décision est déjà prise.
          </Feedback>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="font-mono font-extrabold text-2xl text-slate-800 tabular-nums">{formatFr(a)}</span>
            <div className="flex gap-1.5">
              {['<', '>', '='].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  disabled={solved || checked}
                  onClick={() => {
                    setPick(sym);
                    setChecked(true);
                    react(sym === correctSymbol);
                    onSolved?.();
                  }}
                  aria-label={`Signe ${sym}`}
                  className={`w-12 h-12 rounded-xl border-2 font-mono font-extrabold text-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    (solved ? correctSymbol : pick) === sym
                      ? 'bg-blue-600 border-blue-700 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
            <span className="font-mono font-extrabold text-2xl text-slate-800 tabular-nums">{formatFr(b)}</span>
          </div>

          {checked && pick !== correctSymbol && (
            <Feedback tone="ko">
              Bonne réponse : <strong className="font-mono">{correctSymbol}</strong>. Reprends la première
              différence : {cellsA[firstDiff].digit} contre {cellsB[firstDiff].digit} à la position des{' '}
              {cellsA[firstDiff].label.toLowerCase()}.
            </Feedback>
          )}

          {(checked || solved) && pick === correctSymbol && (
            <Feedback tone="ok">
              <span className="font-mono font-bold">
                {formatFr(a)} {correctSymbol} {formatFr(b)}
              </span>{' '}
              — la comparaison s'est jouée à la position des {cellsA[firstDiff].label.toLowerCase()}.
            </Feedback>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Étape 4 : raisonnements à corriger ─────────────────────────── */
const ERREURS = [
  {
    claim: '« 3 900 > 12 000 parce que 900 est plus grand que 12 »',
    options: [
      "On compare 900 et 12 alors que le 12 de 12 000 compte des milliers : il vaut 12 000, pas 12.",
      'Le raisonnement est correct.',
      'Il fallait comparer les derniers chiffres : 0 et 0.',
      'Il fallait additionner les chiffres de chaque nombre.',
    ],
    correct: 0,
    truth: '3 900 < 12 000',
    detail:
      "3 900 a 4 chiffres, 12 000 en a 5. Un nombre à 5 chiffres est toujours plus grand qu'un nombre à 4 chiffres.",
  },
  {
    claim: '« 8 450 < 8 320 parce que 320 est plus petit que 450 »',
    options: [
      'Le raisonnement est correct.',
      "On a comparé des morceaux au hasard : il faut chercher la première position qui diffère, en partant de la gauche.",
      'Il fallait comparer le nombre de chiffres.',
      'Il fallait comparer les chiffres des unités.',
    ],
    correct: 1,
    truth: '8 450 > 8 320',
    detail:
      'Les milliers sont égaux (8 = 8). La première différence est aux centaines : 4 contre 3. Donc 8 450 > 8 320.',
  },
];

function ErreurCard({ item, solved, onSolved, react }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);

  return (
    <div className="space-y-3 border-2 border-amber-200 bg-amber-50/50 rounded-2xl p-4">
      <div className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wider">
        Raisonnement d'élève à examiner
      </div>
      <p className="text-base font-semibold text-slate-800 italic">{item.claim}</p>
      <p className="text-sm font-semibold text-slate-600">Qu'est-ce qui ne va pas dans ce raisonnement ?</p>
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
          cols={1}
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
          La bonne comparaison est <strong className="font-mono">{item.truth}</strong>. {item.detail}
        </Feedback>
      )}
    </div>
  );
}

export default function Module06Comparer() {
  const navLinks = getNavLinks(6);
  const { isModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const alreadyCompleted = isModuleCompleted('6');
  const { effectsEnabled, toggleEffects, streak, react } = useModuleEffects();

  const [visuelPick, setVisuelPick] = useState(null);
  const [visuelRevealed, setVisuelRevealed] = useState(false);
  const [visuelBurst, setVisuelBurst] = useState(0);
  const [duelsDone, setDuelsDone] = useState([]);
  const [labosDone, setLabosDone] = useState([]);
  const [erreursDone, setErreursDone] = useState([]);

  const s1 = visuelRevealed;
  const s2 = duelsDone.length === DUELS_CHIFFRES.length;
  const s3 = labosDone.length === LABOS.length;
  const s4 = erreursDone.length === ERREURS.length;
  const allDone = alreadyCompleted || (s1 && s2 && s3 && s4);
  const doneCount = [s1, s2, s3, s4].filter(Boolean).length;

  const incompleteSteps = [
    !s1 && { num: 1, title: 'Compare avec les yeux' },
    !s2 && { num: 2, title: 'Premier réflexe : compter les chiffres' },
    !s3 && { num: 3, title: 'Laboratoire : même nombre de chiffres' },
    !s4 && { num: 4, title: 'Chasse aux raisonnements faux' },
  ].filter(Boolean);

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Comparer les nombres"
      moduleSubtitle="D'abord avec les yeux, puis avec une méthode sûre : on commence par la plus grande position."
      moduleNumber={6}
      estimatedTime="12 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
      incompleteSteps={incompleteSteps}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {!allDone && <StepProgressBar doneCount={doneCount} total={4} />}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <StreakChip count={streak} />
          <EffectsToggle enabled={effectsEnabled} onToggle={toggleEffects} />
        </div>

        <MissionBrief tag="⚖️ Comparaison" title="Comparer, ce n'est pas deviner : c'est regarder au bon endroit.">
          <p>
            Tu vas construire la méthode toi-même, en trois temps : avec les yeux, puis avec le nombre de
            chiffres, puis position par position.
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard num={1} title="Compare avec les yeux" subtitle="Deux quantités représentées par du matériel." done={s1}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { n: VISUEL.a, counts: { UM: 4, C: 5 }, label: 'Quantité A' },
                { n: VISUEL.b, counts: { UM: 3, C: 9 }, label: 'Quantité B' },
              ].map((q) => (
                <div key={q.n} className="border-2 border-slate-200 rounded-2xl p-3 bg-white space-y-2">
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase">{q.label}</div>
                  <Base10Blocks counts={q.counts} compact max={9} />
                  {s1 && (
                    <div className="font-mono font-extrabold text-xl text-slate-800 text-center tabular-nums">
                      {formatFr(q.n)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm font-semibold text-slate-700">Quelle quantité est la plus grande ?</p>
            <div className="relative">
              <ChoiceGrid
                options={['La quantité A', 'La quantité B', 'Impossible à dire sans calculer']}
                selected={visuelPick}
                onSelect={(i) => {
                  setVisuelPick(i);
                  setVisuelRevealed(true);
                  const isCorrect = i === 0;
                  const id = react(isCorrect);
                  if (isCorrect) setVisuelBurst(id);
                }}
                revealed={visuelRevealed}
                correctIndex={0}
                cols={3}
              />
              <XPBurst amount={10} tick={visuelBurst} />
            </div>
            {visuelRevealed && (
              <Feedback tone={visuelPick === 0 ? 'ok' : 'ko'}>
                {visuelPick !== 0 && (
                  <>
                    Bonne réponse : <strong>La quantité A</strong>. {' '}
                  </>
                )}
                A contient <strong>4 blocs de mille</strong>, B seulement <strong>3</strong>. Même si B a beaucoup
                plus de plaques (9 contre 5), cela ne rattrape jamais un millier entier :{' '}
                <strong className="font-mono">4 500 &gt; 3 900</strong>. Les grosses positions décident avant les
                petites.
              </Feedback>
            )}
          </div>
        </StepCard>

        {/* Étape 2 */}
        <StepCard
          num={2}
          title="Premier réflexe : compter les chiffres"
          subtitle="Trois duels éclair. Réponds sans calculer."
          done={s2}
          locked={isStepLocked(alreadyCompleted, !s1)}
        >
          <div className="space-y-4">
            {DUELS_CHIFFRES.map((d, i) => (
              <DuelChiffres
                key={`${d.a}-${d.b}`}
                duel={d}
                solved={duelsDone.includes(i)}
                onSolved={() => setDuelsDone((x) => (x.includes(i) ? x : [...x, i]))}
                react={react}
              />
            ))}
            {s2 && (
              <Feedback tone="info">
                Règle 1 : <strong>si les deux nombres n'ont pas le même nombre de chiffres, le plus long est le
                plus grand</strong> (à condition de ne pas écrire de zéro inutile devant). Mais que faire quand ils
                ont le même nombre de chiffres ?
              </Feedback>
            )}
          </div>
        </StepCard>

        {/* Étape 3 */}
        <StepCard
          num={3}
          title="Laboratoire : même nombre de chiffres"
          subtitle="Compare position par position, en partant de la gauche, et arrête-toi à la première différence."
          done={s3}
          locked={isStepLocked(alreadyCompleted, !s2)}
        >
          <div className="space-y-8">
            {LABOS.map((l, i) =>
              i === 0 || labosDone.includes(i - 1) ? (
                <div key={`${l.a}-${l.b}`} className="space-y-3">
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Duel {i + 1} / {LABOS.length}
                  </div>
                  <CompareLab
                    a={l.a}
                    b={l.b}
                    solved={labosDone.includes(i)}
                    onSolved={() => setLabosDone((x) => (x.includes(i) ? x : [...x, i]))}
                    react={react}
                  />
                </div>
              ) : null
            )}
            {s3 && (
              <Feedback tone="info">
                Règle 2 : <strong>à nombre de chiffres égal, on compare position par position en partant de la
                gauche, et on s'arrête à la première différence.</strong> Les positions suivantes ne peuvent plus
                rien changer.
              </Feedback>
            )}
          </div>
        </StepCard>

        {/* Étape 4 */}
        <StepCard
          num={4}
          title="Chasse aux raisonnements faux"
          subtitle="Deux élèves se sont trompés. À toi de dire pourquoi."
          done={s4}
          locked={isStepLocked(alreadyCompleted, !s3)}
        >
          <div className="space-y-4">
            {ERREURS.map((e, i) => (
              <ErreurCard
                key={e.claim}
                item={e}
                solved={erreursDone.includes(i)}
                onSolved={() => setErreursDone((x) => (x.includes(i) ? x : [...x, i]))}
                react={react}
              />
            ))}
          </div>
        </StepCard>

      </div>
    </ModuleLayout>
  );
}

/* ─── Duel « nombre de chiffres » ────────────────────────────────── */
function DuelChiffres({ duel, solved, onSolved, react }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const correctIndex = duel.correct === 'a' ? 0 : 1;

  return (
    <div className="border-2 border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
      <div className="grid grid-cols-2 gap-2">
        {[duel.a, duel.b].map((n, i) => (
          <button
            key={n}
            type="button"
            disabled={revealed || solved}
            onClick={() => {
              setPick(i);
              setRevealed(true);
              react(i === correctIndex);
              onSolved?.();
            }}
            className={`rounded-xl border-2 p-3 text-center transition-all min-h-[72px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              revealed && i === correctIndex
                ? 'border-emerald-400 bg-emerald-50'
                : revealed && pick === i
                ? 'border-rose-400 bg-rose-50'
                : pick === i
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-400'
            }`}
          >
            <div className="font-mono font-extrabold text-2xl text-slate-800 tabular-nums">{formatFr(n)}</div>
            <div className="text-[10px] font-mono text-slate-400">{String(n).length} chiffres</div>
          </button>
        ))}
      </div>
      <p className="text-sm font-semibold text-slate-600">Lequel est le plus grand ?</p>
      {revealed && (
        <Feedback tone={pick === correctIndex ? 'ok' : 'ko'}>
          <span className="font-mono font-bold">
            {formatFr(duel.a)} {duel.a > duel.b ? '>' : '<'} {formatFr(duel.b)}
          </span>{' '}
          : {String(duel.a).length === String(duel.b).length
            ? 'même nombre de chiffres, il faut comparer position par position.'
            : `${String(Math.max(duel.a, duel.b)).length} chiffres contre ${String(Math.min(duel.a, duel.b)).length} — le plus long l'emporte.`}
        </Feedback>
      )}
    </div>
  );
}
