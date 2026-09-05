import React, { useState } from 'react';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { useKit } from '../../../../../common/kit';

/**
 * BuildCheck — valider une construction (intervalle, inégalité) avec un
 * plafond de tentatives puis révélation (playbook §8 : un puzzle de
 * construction peut exiger la réussite, mais seulement jusqu'à un plafond ;
 * ensuite on montre et on complète, sans jamais bloquer).
 *
 * @param {() => boolean} isRight        le prédicat sur l'état du module
 * @param {() => ReactNode} current      ce que l'élève a construit (en clair)
 * @param {ReactNode} answer             la bonne réponse, pour la révélation
 * @param {ReactNode} [why]              la règle, affichée à la révélation
 * @param {(ok:boolean)=>void} onDone    inconditionnel à la fin
 * @param {(ok:boolean, attempt:number)=>ReactNode} [hint]  indice après un essai raté
 * @param {number} [maxAttempts=2]
 * @param {boolean} [solved]
 * @param {() => void} [onReveal]        pour afficher le fantôme dans le lab
 */
export default function BuildCheck({
  isRight, current, answer, why, onDone, hint, maxAttempts = 2, solved = false, onReveal, label = 'Valider ma construction',
}) {
  const { react } = useKit();
  const [attempts, setAttempts] = useState(0);
  const [state, setState] = useState(solved ? 'ok' : 'idle'); // idle | wrong | ok | revealed

  const finish = (ok) => {
    setState(ok ? 'ok' : 'revealed');
    if (!ok) onReveal?.();
    onDone?.(ok);
  };

  const check = () => {
    const ok = isRight();
    react(ok);
    if (ok) { finish(true); return; }
    const n = attempts + 1;
    setAttempts(n);
    if (n >= maxAttempts) finish(false);
    else setState('wrong');
  };

  if (state === 'ok') {
    return <Feedback tone="ok">Construction juste : {answer}. {why}</Feedback>;
  }
  if (state === 'revealed') {
    return (
      <Feedback tone="ko">
        Pas grave, on te le montre. Ta construction : <strong className="font-mono">{current()}</strong>. Il fallait : <strong className="font-mono">{answer}</strong>. {why}
      </Feedback>
    );
  }
  return (
    <div className="space-y-2">
      {state === 'wrong' && (
        <Feedback tone="ko">
          Pas encore : tu as construit <strong className="font-mono">{current()}</strong>. {hint?.(false, attempts)}
        </Feedback>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <ValidateButton onClick={check} tone="indigo">{label}</ValidateButton>
        {attempts > 0 && (
          <button
            type="button"
            onClick={() => { react(false); finish(false); }}
            className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-600 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Je ne trouve pas — montre-moi
          </button>
        )}
      </div>
    </div>
  );
}
