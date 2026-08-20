import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RotateCcw } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PlaceValueTable from '../components/PlaceValueTable';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { formatFr, parseFr, decompose, digitCells } from '../components/numberUtils';

/* ─── Étape 1 : casser un nombre en tuiles ───────────────────────── */
const CIBLE = 4582;
const TUILES = [4000, 400, 500, 50, 80, 8, 2, 20];

function DecompositionTiles({ target, onSolved, solved }) {
  const [picked, setPicked] = useState([]); // index dans TUILES
  const [checked, setChecked] = useState(false);

  const sum = picked.reduce((acc, i) => acc + TUILES[i], 0);
  const attendu = decompose(target);
  const isRight = sum === target && picked.length === attendu.length;

  const toggle = (i) => {
    if (solved) return;
    setChecked(false);
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-2xl p-5 text-center">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Nombre à décomposer</div>
        <div className="font-mono font-extrabold text-4xl text-white tabular-nums">{formatFr(target)}</div>
      </div>

      {/* Tuiles disponibles */}
      <div>
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
          Tuiles disponibles — choisis celles qui composent le nombre
        </div>
        <div className="flex flex-wrap gap-2">
          {TUILES.map((t, i) => {
            const isPicked = picked.includes(i);
            return (
              <button
                key={`${t}-${i}`}
                type="button"
                onClick={() => toggle(i)}
                disabled={solved}
                aria-pressed={isPicked}
                className={`px-4 py-3 rounded-xl border-2 font-mono font-extrabold tabular-nums transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isPicked
                    ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {formatFr(t)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Somme construite */}
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center min-h-[80px] flex flex-col justify-center">
        {picked.length === 0 ? (
          <span className="text-xs text-slate-400 italic">Sélectionne des tuiles pour construire la somme.</span>
        ) : (
          <>
            <div className="font-mono font-bold text-lg sm:text-xl text-slate-800 tabular-nums break-words">
              {picked.map((i) => formatFr(TUILES[i])).join(' + ')}
            </div>
            <div className="font-mono text-sm text-slate-500 mt-1">
              = {formatFr(sum)}{' '}
              {sum === target ? (
                <Check className="inline w-4 h-4 text-emerald-600" aria-label="somme correcte" />
              ) : (
                <span className="text-rose-500">(objectif : {formatFr(target)})</span>
              )}
            </div>
          </>
        )}
      </div>

      {!solved && (
        <div className="flex gap-2 flex-wrap">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              onSolved?.();
            }}
            disabled={picked.length === 0}
          >
            Vérifier
          </ValidateButton>
          {picked.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPicked([]);
                setChecked(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-500 hover:border-slate-400 font-mono text-xs font-bold min-h-[44px]"
            >
              <RotateCcw className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" /> Tout enlever
            </button>
          )}
        </div>
      )}

      {checked && !isRight && !solved && (
        <Feedback tone="ko">
          {sum !== target ? (
            <>
              Ta somme vaut <strong className="font-mono">{formatFr(sum)}</strong> au lieu de{' '}
              <strong className="font-mono">{formatFr(target)}</strong>.
            </>
          ) : (
            <>
              La somme est bonne, mais on cherche la décomposition <strong>par positions</strong> : une seule
              tuile par colonne du tableau de numération, soit {attendu.length} tuiles.
            </>
          )}{' '}
          La bonne décomposition est <strong className="font-mono">{attendu.map((v) => formatFr(v)).join(' + ')}</strong>.
        </Feedback>
      )}

      {solved && (
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center"
          >
            <div className="font-mono font-extrabold text-xl sm:text-2xl text-emerald-800 tabular-nums">
              {formatFr(target)} = {attendu.map((v) => formatFr(v)).join(' + ')}
            </div>
          </motion.div>
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4">
            <PlaceValueTable value={target} showValues />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Étape 2 : plusieurs décompositions du même nombre ──────────── */
const PROPOSITIONS = [
  { expr: '4 000 + 500 + 80 + 2', value: 4582 },
  { expr: '4 500 + 82', value: 4582 },
  { expr: '4 000 + 50 + 80 + 2', value: 4132 },
  { expr: '4 580 + 2', value: 4582 },
  { expr: '400 + 500 + 80 + 2', value: 982 },
  { expr: '4 000 + 500 + 82', value: 4582 },
];

function MultiDecomposition({ onSolved, solved }) {
  const [answers, setAnswers] = useState({}); // index -> true (=) / false (≠)
  const [checked, setChecked] = useState(false);

  const allAnswered = Object.keys(answers).length === PROPOSITIONS.length;
  const allRight = PROPOSITIONS.every((p, i) => answers[i] === (p.value === CIBLE));

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Pour chaque proposition, dis si elle est bien égale à <strong className="font-mono">4 582</strong>.
      </p>

      <div className="space-y-2">
        {PROPOSITIONS.map((p, i) => {
          const expected = p.value === CIBLE;
          const given = answers[i];
          const isWrong = checked && given !== undefined && given !== expected;
          const isRight = checked && given === expected;

          return (
            <div
              key={p.expr}
              className={`flex items-center justify-between gap-3 rounded-xl border-2 px-3 py-2.5 flex-wrap ${
                isRight
                  ? 'border-emerald-300 bg-emerald-50'
                  : isWrong
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <span className="font-mono font-bold text-sm sm:text-base text-slate-800 tabular-nums">{p.expr}</span>
              <div className="flex gap-1.5 shrink-0">
                {[
                  { val: true, label: '= 4 582', Icon: Check },
                  { val: false, label: '≠ 4 582', Icon: X },
                ].map(({ val, label, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={solved}
                    onClick={() => {
                      setChecked(false);
                      setAnswers((a) => ({ ...a, [i]: val }));
                    }}
                    aria-pressed={given === val}
                    className={`px-3 py-2 rounded-lg border-2 font-mono text-xs font-bold transition-all min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      given === val
                        ? val
                          ? 'bg-emerald-600 border-emerald-700 text-white'
                          : 'bg-rose-600 border-rose-700 text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    <Icon className="inline w-3 h-3 mr-1" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
              {checked && isWrong && (
                <span className="w-full text-xs font-mono text-rose-600">
                  {p.expr} = {formatFr(p.value)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!solved && (
        <ValidateButton
          onClick={() => {
            setChecked(true);
            onSolved?.();
          }}
          disabled={!allAnswered}
        >
          Vérifier mes réponses
        </ValidateButton>
      )}

      {solved && !allRight && (
        <Feedback tone="ko">
          Certaines réponses étaient à revoir — regarde les corrections affichées ci-dessus (calcule chaque somme
          position par position).
        </Feedback>
      )}

      {solved && (
        <Feedback tone="ok">
          Quatre écritures différentes, un seul et même nombre : <strong className="font-mono">4 582</strong>.
          Est-ce toujours le même nombre ? <strong>Oui</strong> — tant que la somme des morceaux redonne 4 582, on
          peut regrouper comme on veut. La décomposition « par positions » n'est qu'une décomposition parmi
          d'autres, mais c'est la plus utile pour lire le nombre.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 3 : recomposer ───────────────────────────────────────── */
const RECOMPOSITIONS = [
  { expr: '3 000 + 400 + 20 + 7', answer: 3427, trap: null },
  { expr: '5 000 + 80 + 6', answer: 5086, trap: '586' },
  { expr: '4 000 + 5', answer: 4005, trap: '45' },
];

function RecomposeItem({ item, solved, onSolved }) {
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);

  const check = () => {
    const n = parseFr(val);
    if (n === item.answer) {
      setFb('ok');
    } else {
      setFb(n === parseFr(item.trap || '') ? 'trap' : 'ko');
    }
    onSolved?.();
  };

  const missing = digitCells(item.answer).filter((c) => c.digit === 0);

  return (
    <div className="space-y-3 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono font-bold text-lg text-slate-800 tabular-nums">{item.expr} =</span>
        {solved ? (
          <span className="font-mono font-extrabold text-2xl text-emerald-700 tabular-nums">
            {formatFr(item.answer)}
          </span>
        ) : (
          <>
            <NumberField
              value={val}
              onChange={(v) => {
                setVal(v);
                setFb(null);
              }}
              onEnter={check}
              ariaLabel={`Résultat de ${item.expr}`}
              width="w-32"
            />
            <ValidateButton onClick={check} disabled={!val}>
              OK
            </ValidateButton>
          </>
        )}
      </div>

      {fb === 'trap' && (
        <div className="space-y-2">
          <Feedback tone="ko">
            Attention : en collant les morceaux tu obtiens {item.trap}, mais une position a disparu ! Regarde le
            tableau : {missing.length > 1 ? 'certaines colonnes sont vides' : 'une colonne est vide'} — il faut y
            écrire un <strong className="font-mono">0</strong> pour que les autres chiffres restent à leur place.
          </Feedback>
          <div className="bg-white border-2 border-amber-200 rounded-xl p-3">
            <PlaceValueTable value={item.answer} showValues dimZeros compact />
          </div>
        </div>
      )}
      {fb === 'ko' && (
        <Feedback tone="hint">
          Additionne les morceaux en respectant les positions : chaque terme occupe une colonne différente.
        </Feedback>
      )}
      {fb === 'ok' && !solved && <Feedback tone="ok">Bien joué !</Feedback>}
    </div>
  );
}

/* ─── Étape 4 : le rôle du zéro ──────────────────────────────────── */
const ZEROS = [4005, 7040, 30006, 205007];

function ZeroHunt({ n, solved, onSolved }) {
  const [clicked, setClicked] = useState([]);
  const [checked, setChecked] = useState(false);

  const zeroKeys = digitCells(n)
    .filter((c) => c.digit === 0)
    .map((c) => c.key);
  const isRight =
    clicked.length === zeroKeys.length && zeroKeys.every((k) => clicked.includes(k));

  return (
    <div className="space-y-3">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-3">
        <PlaceValueTable
          value={n}
          selectedKey={null}
          highlightKeys={solved ? zeroKeys : clicked}
          onDigitClick={(cell) => {
            if (solved) return;
            setChecked(false);
            setClicked((c) => (c.includes(cell.key) ? c.filter((x) => x !== cell.key) : [...c, cell.key]));
          }}
          compact
        />
      </div>
      {!solved && (
        <>
          <p className="text-xs text-slate-500">
            Clique sur <strong>toutes les positions vides</strong> de {formatFr(n)}.
          </p>
          <ValidateButton
            onClick={() => {
              setChecked(true);
              onSolved?.();
            }}
            disabled={clicked.length === 0}
          >
            Vérifier
          </ValidateButton>
        </>
      )}
      {checked && !isRight && !solved && (
        <Feedback tone="hint">
          Une position est « vide » lorsqu'elle contient un <strong className="font-mono">0</strong> :
          il n'y a aucune unité de cet ordre.
        </Feedback>
      )}
      {solved && (
        <Feedback tone="ok">
          {formatFr(n)} = {decompose(n).map((v) => formatFr(v)).join(' + ')} — les zéros ne s'écrivent pas dans la
          décomposition, mais ils sont indispensables dans le nombre.
        </Feedback>
      )}
    </div>
  );
}

const ZERO_QUESTION = {
  q: 'Que nous disent les deux zéros de 4 005 ?',
  options: [
    "Qu'il n'y a ni centaine ni dizaine, tout en gardant le 4 à la place des milliers",
    "Qu'ils ne servent à rien : on peut écrire 45",
    'Que le nombre a été multiplié par 100',
    'Que le nombre est un petit nombre',
  ],
  correct: 0,
  explain:
    "Le zéro signale qu'une position ne contient aucune unité de cet ordre. Sans lui, les autres chiffres glisseraient : 4 005 deviendrait 45, un nombre cent fois plus petit.",
};

const ERREUR_ZERO = {
  q: 'Un élève écrit : « 6 020 = 620 ». A-t-il raison ?',
  options: ['Oui, le zéro du milieu ne compte pas', 'Non, 6 020 et 620 sont deux nombres différents'],
  correct: 1,
  explain:
    '6 020 contient 6 milliers ; 620 n\'en contient aucun. En supprimant le zéro, le 6 passe des milliers aux centaines : le nombre est divisé par 10. 6 020 ≠ 620.',
};

export default function Module05Decomposer() {
  const navLinks = getNavLinks(5);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [recompDone, setRecompDone] = useState([]);
  const [zerosDone, setZerosDone] = useState([]);
  const [zeroPick, setZeroPick] = useState(null);
  const [zeroRevealed, setZeroRevealed] = useState(false);
  const [errPick, setErrPick] = useState(null);
  const [errRevealed, setErrRevealed] = useState(false);

  const s3 = recompDone.length === RECOMPOSITIONS.length;
  const s4 = zerosDone.length === ZEROS.length && zeroRevealed && errRevealed;
  const allDone = s1 && s2 && s3 && s4;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Décomposer et recomposer"
      moduleSubtitle="Casser un nombre en morceaux, le reconstruire — et comprendre pourquoi le zéro est indispensable."
      moduleNumber={5}
      estimatedTime="12 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🧩 Atelier" title="Un nombre se démonte… et se remonte.">
          <p>
            Décomposer, c'est séparer un nombre selon les positions. Recomposer, c'est faire le chemin inverse.
            Dans les deux sens, une chose ne change jamais : la valeur totale.
          </p>
        </MissionBrief>

        <StepCard num={1} title="Décompose 4 582" subtitle="Choisis les bonnes tuiles — attention aux pièges." done={s1}>
          <DecompositionTiles target={CIBLE} solved={s1} onSolved={() => setS1(true)} />
        </StepCard>

        <StepCard
          num={2}
          title="Y a-t-il une seule bonne décomposition ?"
          subtitle="Six propositions. Certaines sont justes, d'autres non."
          done={s2}
          locked={!s1}
        >
          <MultiDecomposition solved={s2} onSolved={() => setS2(true)} />
        </StepCard>

        <StepCard
          num={3}
          title="Recompose : de la somme au nombre"
          subtitle="Le chemin inverse — et c'est là que les zéros se rappellent à toi."
          done={s3}
          locked={!s2}
        >
          <div className="space-y-4">
            {RECOMPOSITIONS.map((item, i) => (
              <RecomposeItem
                key={item.expr}
                item={item}
                solved={recompDone.includes(i)}
                onSolved={() => setRecompDone((d) => (d.includes(i) ? d : [...d, i]))}
              />
            ))}
          </div>
        </StepCard>

        <StepCard
          num={4}
          title="Défi : le zéro, gardien des positions"
          subtitle="Repère les positions vides, puis explique à quoi sert le zéro."
          done={s4}
          locked={!s3}
        >
          <div className="space-y-5">
            {ZEROS.map((n, i) =>
              i === 0 || zerosDone.includes(i - 1) ? (
                <ZeroHunt
                  key={n}
                  n={n}
                  solved={zerosDone.includes(i)}
                  onSolved={() => setZerosDone((d) => (d.includes(i) ? d : [...d, i]))}
                />
              ) : null
            )}

            {zerosDone.length === ZEROS.length && (
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-700">{ZERO_QUESTION.q}</p>
                <ChoiceGrid
                  options={ZERO_QUESTION.options}
                  selected={zeroPick}
                  onSelect={setZeroPick}
                  revealed={zeroRevealed}
                  correctIndex={ZERO_QUESTION.correct}
                  cols={1}
                />
                {!zeroRevealed && (
                  <ValidateButton onClick={() => setZeroRevealed(true)} disabled={zeroPick === null}>
                    Valider
                  </ValidateButton>
                )}
                {zeroRevealed && (
                  <Feedback tone={zeroPick === ZERO_QUESTION.correct ? 'ok' : 'ko'}>
                    {zeroPick !== ZERO_QUESTION.correct && (
                      <>
                        Bonne réponse : <strong>{ZERO_QUESTION.options[ZERO_QUESTION.correct]}</strong>. {' '}
                      </>
                    )}
                    {ZERO_QUESTION.explain}
                  </Feedback>
                )}

                {zeroRevealed && (
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <p className="text-sm font-semibold text-slate-700">{ERREUR_ZERO.q}</p>
                    <ChoiceGrid
                      options={ERREUR_ZERO.options}
                      selected={errPick}
                      onSelect={setErrPick}
                      revealed={errRevealed}
                      correctIndex={ERREUR_ZERO.correct}
                      cols={1}
                    />
                    {!errRevealed && (
                      <ValidateButton onClick={() => setErrRevealed(true)} disabled={errPick === null}>
                        Valider
                      </ValidateButton>
                    )}
                    {errRevealed && (
                      <Feedback tone={errPick === ERREUR_ZERO.correct ? 'ok' : 'ko'}>
                        {errPick !== ERREUR_ZERO.correct && (
                          <>
                            Bonne réponse : <strong>{ERREUR_ZERO.options[ERREUR_ZERO.correct]}</strong>. {' '}
                          </>
                        )}
                        {ERREUR_ZERO.explain}
                      </Feedback>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
