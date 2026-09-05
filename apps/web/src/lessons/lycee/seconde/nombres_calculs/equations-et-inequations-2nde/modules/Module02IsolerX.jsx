import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EquationSteps from '../components/EquationSteps';
import { lin, applyBothSides, applyOneSide, isSolvedForm, sameSolutions } from '../components/eqUtils';

/**
 * Module 2 — DISCOVERY : « Isoler x sans casser l'égalité ».
 * Activity: transformer 2x + 5 = 13, puis 3x − 4 = x + 6, puis 7x + 2 = 4x + 9
 *   par des opérations aux deux membres — avec le piège « à gauche seulement ».
 * Mathematical objective: une opération faite AUX DEUX membres conserve les
 *   solutions ; on isole x en défaisant les opérations ; la solution peut être
 *   une fraction, à garder exacte.
 * Expected observation: la ligne « −5 à gauche seulement » devient rouge :
 *   solutions changées ; « −5 des deux côtés » puis « ÷ 2 » donnent x = 4, la
 *   valeur trouvée au scanner.
 */
const TASKS = [
  { id: 't1', L: lin(2, 5), R: lin(0, 13), ops: [
    { id: 'm5', label: '− 5 des deux côtés', op: { type: 'add', k: -5 } },
    { id: 'm5L', label: '− 5 à gauche seulement', op: { type: 'add', k: -5 }, side: 'L' },
    { id: 'd2', label: '÷ 2 des deux côtés', op: { type: 'div', k: 2 } },
    { id: 'x2', label: '× 2 des deux côtés', op: { type: 'mul', k: 2 } },
  ] },
  { id: 't2', L: lin(3, -4), R: lin(1, 6), ops: [
    { id: 'mx', label: '− x des deux côtés', op: { type: 'addx', k: -1 } },
    { id: 'p4', label: '+ 4 des deux côtés', op: { type: 'add', k: 4 } },
    { id: 'p4R', label: '+ 4 à droite seulement', op: { type: 'add', k: 4 }, side: 'R' },
    { id: 'd2', label: '÷ 2 des deux côtés', op: { type: 'div', k: 2 } },
    { id: 'd3', label: '÷ 3 des deux côtés', op: { type: 'div', k: 3 } },
  ] },
  { id: 't3', L: lin(7, 2), R: lin(4, 9), ops: [
    { id: 'm4x', label: '− 4x des deux côtés', op: { type: 'addx', k: -4 } },
    { id: 'm2', label: '− 2 des deux côtés', op: { type: 'add', k: -2 } },
    { id: 'd3', label: '÷ 3 des deux côtés', op: { type: 'div', k: 3 } },
    { id: 'd7', label: '÷ 7 des deux côtés', op: { type: 'div', k: 7 } },
  ] },
];

function useTask(task) {
  const start = { L: task.L, R: task.R };
  const [history, setHistory] = useState([start]);
  const [count, setCount] = useState(0);
  const last = history[history.length - 1];
  const solved = isSolvedForm(last) && sameSolutions(start, last);
  const apply = (o) => {
    const next = o.side ? applyOneSide(last, o.op, o.side) : applyBothSides(last, o.op);
    setHistory([...history, { ...next, op: o.op, both: !o.side, label: o.label }]);
    setCount(count + 1);
  };
  const undo = () => setHistory(history.slice(0, -1));
  const reset = () => setHistory([start]);
  const reveal = (path) => { let h = [start]; let cur = start; for (const o of path) { cur = applyBothSides(cur, o.op); h = [...h, { ...cur, op: o.op, both: true, label: o.label }]; } setHistory(h); };
  return { history, apply, undo, reset, solved, count, reveal };
}

export default function Module02IsolerX() {
  const t1 = useTask(TASKS[0]); const t2 = useTask(TASKS[1]); const t3 = useTask(TASKS[2]);
  const [trapSeen, setTrapSeen] = useState(false);
  const [exactDone, setExactDone] = useState(false);
  const wrap = (t, task, kit) => (o) => { if (o.side) setTrapSeen(true); t.apply(o); const next = o.side ? null : applyBothSides(t.history[t.history.length - 1], o.op); if (next && isSolvedForm(next)) kit.react(true); };
  const Escape = ({ t, path }) => (t.count >= 5 && !t.solved ? <button type="button" onClick={() => t.reveal(path)} className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-600 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Je ne trouve pas — montre-moi</button> : null);

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Isoler x sans casser l’égalité"
      moduleSubtitle="Retire 5 des deux côtés, divise par 2 : l’égalité tient, les solutions restent. Un seul côté ? Tout casse."
      estimatedTime="11 min"
      brief={{ tag: '⚖️ Mission 02', title: 'Une équation est une balance : ce qu’on fait à un plateau, on le fait à l’autre.', tone: 'indigo', body: <p>Choisis des opérations jusqu’à obtenir « x = … ». Essaie aussi le piège « à gauche seulement » : regarde ce que dit la ligne.</p> }}
      steps={[
        {
          num: 1, title: '2x + 5 = 13', subtitle: 'Isole x. Essaie au moins une fois une opération sur un seul côté.', done: t1.solved && trapSeen,
          content: (kit) => (
            <div className="space-y-3">
              <EquationSteps history={t1.history} ops={TASKS[0].ops} onApply={wrap(t1, TASKS[0], kit)} onUndo={t1.undo} onReset={t1.reset} />
              <Escape t={t1} path={[TASKS[0].ops[0], TASKS[0].ops[2]]} />
              {t1.solved && !trapSeen && <Feedback tone="info">x = 4, comme au scanner. Avant de continuer, recommence et essaie « − 5 à gauche seulement » pour voir ce qui se passe.</Feedback>}
              {t1.solved && trapSeen && <Feedback tone="ok">Une opération faite à UN SEUL membre change les solutions (la ligne rouge). Faite aux DEUX membres, l’égalité reste vraie pour les mêmes x : − 5 des deux côtés, puis ÷ 2, et x = 4 apparaît — la valeur du scanner.</Feedback>}
            </div>
          ),
        },
        {
          num: 2, title: '3x − 4 = x + 6', subtitle: 'x est des deux côtés : commence par le rassembler.', done: t2.solved,
          content: (kit) => (
            <div className="space-y-3">
              <EquationSteps history={t2.history} ops={TASKS[1].ops} onApply={wrap(t2, TASKS[1], kit)} onUndo={t2.undo} onReset={t2.reset} />
              <Escape t={t2} path={[TASKS[1].ops[0], TASKS[1].ops[1], TASKS[1].ops[3]]} />
              {t2.solved && <Feedback tone="ok">− x des deux côtés rassemble les x à gauche ; + 4 rassemble les nombres à droite ; ÷ 2 isole x : x = 5. Vérification : 3 × 5 − 4 = 11 et 5 + 6 = 11.</Feedback>}
            </div>
          ),
        },
        {
          num: 3, title: '7x + 2 = 4x + 9', subtitle: 'La solution n’est pas entière. Garde-la exacte.', done: t3.solved && exactDone,
          content: (kit) => (
            <div className="space-y-3">
              <EquationSteps history={t3.history} ops={TASKS[2].ops} onApply={wrap(t3, TASKS[2], kit)} onUndo={t3.undo} onReset={t3.reset} />
              <Escape t={t3} path={[TASKS[2].ops[0], TASKS[2].ops[1], TASKS[2].ops[2]]} />
              {t3.solved && (
                <TapQuestion prompt={<>Pourquoi écrire <MathText>{'$x = \\frac{7}{3}$'}</MathText> plutôt que x ≈ 2,33 ?</>}
                  options={['Parce que 2,33 n’est pas solution : 7 × 2,33 + 2 = 18,31 alors que 4 × 2,33 + 9 = 18,32', 'Parce que les fractions sont plus jolies', 'On peut écrire 2,33, c’est pareil']} cols={1} correct={0}
                  explain="7/3 est la valeur EXACTE : 7 × 7/3 + 2 = 55/3 et 4 × 7/3 + 9 = 55/3, égalité parfaite. Avec 2,33 (une valeur approchée), les deux membres diffèrent : ce n’est pas une solution."
                  explainWrong="Vérifie avec 2,33 : 7 × 2,33 + 2 = 18,31 et 4 × 2,33 + 9 = 18,32 — pas égaux. Seule la fraction 7/3 rend l’égalité vraie exactement."
                  solved={exactDone} onAnswered={() => setExactDone(true)} />
              )}
            </div>
          ),
        },
      ]}
      footer={<Feedback tone="ok"><strong>Méthode :</strong> rassembler les x d’un côté, les nombres de l’autre (même opération aux deux membres), puis diviser par le coefficient de x. Solution exacte, puis VÉRIFIER par substitution. Et pour une inéquation ? Presque pareil… presque.</Feedback>}
    />
  );
}
