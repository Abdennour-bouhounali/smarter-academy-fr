import { termTex, termsTex } from '@smarter-academy/core/arithmetic/expansion.js';
import MathText from '../../../components/MathText';
import * as L from '../../logic/areaSplit';

/**
 * La LIGNE ÉCRITE de l'élève (les deux mondes) : l'expansion qui GRANDIT à chaque parcelle / produit décidé, puis la forme réduite qui
 * s'écrit. Et, en متقدم et dans le monde `arrows`, le BLOC DE RÉDUCTION qui prend la place des cartes une fois tout décidé : un réglage du
 * coefficient de chaque puissance, puis « تحقّق » (dans la bannière). Jamais la réponse avant le geste.
 */
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const M = (s) => <MathText>{`$${s}$`}</MathText>;
const Box = () => <span aria-hidden="true" className="inline-block h-7 w-12 rounded-md border-2 border-dashed border-emerald-300 bg-emerald-50/60 align-middle" />;

function CoefStepper({ lab, setLab, p, k }) {
  const v = L.coefOf(lab, p);
  const judged = lab.checked[p];
  const locked = lab.solvedNow;
  return (
    <div className="space-y-0.5" data-as-coef-box={p}>
      <p className="text-center text-[13px] font-black leading-tight text-indigo-900/80">{k(`power.${p}`)}</p>
      <div dir="ltr" className={`flex items-center rounded-xl bg-white ring-2 ${locked ? 'ring-emerald-300' : judged === false ? 'ring-rose-300' : judged ? 'ring-emerald-300' : 'ring-indigo-100'}`} data-as-coef={p} data-v={v}
        role="group" aria-label={k('coefAria', { power: k(`power.${p}`) })}>
        <button type="button" onClick={() => setLab((s) => L.setCoef(s, p, L.coefOf(s, p) - 1))} disabled={locked || v <= L.COEF_MIN} aria-label={k('coefLess')} data-as-coef-less={p}
          className={`flex h-11 w-10 shrink-0 items-center justify-center rounded-s-xl text-xl font-black text-indigo-700 disabled:opacity-40 ${ring}`}>−</button>
        <span className="min-w-0 flex-1 whitespace-nowrap text-center text-[17px] font-black text-indigo-950">{M(v === 0 ? '0' : termTex({ c: v, p }))}</span>
        <button type="button" onClick={() => setLab((s) => L.setCoef(s, p, L.coefOf(s, p) + 1))} disabled={locked || v >= L.COEF_MAX} aria-label={k('coefMore')} data-as-coef-more={p}
          className={`flex h-11 w-10 shrink-0 items-center justify-center rounded-e-xl text-xl font-black text-indigo-700 disabled:opacity-40 ${ring}`}>+</button>
      </div>
    </div>
  );
}

/** Le bloc de réduction : un réglage par puissance, à la place des cartes (même hauteur). */
export function ReduceBlock({ lab, setLab, k }) {
  const powers = L.powersOf(lab);
  return (
    <div role="group" className="flex min-h-[92px] items-center rounded-2xl border-2 border-indigo-100 bg-white px-2 py-1.5" data-as-reduce aria-label={k(`reduceTitle.${lab.world}`)}>
      <div dir="ltr" className="grid w-full items-end gap-2" style={{ gridTemplateColumns: `repeat(${powers.length}, minmax(0, 1fr))` }}>
        {powers.map((p) => <CoefStepper key={p} lab={lab} setLab={setLab} p={p} k={k} />)}
      </div>
    </div>
  );
}

/** Faut-il le bloc de réduction à la place des cartes ? (متقدم / arrows, de la dernière décision à la fin de la tâche) */
export const showReduce = (lab) => !lab.scaffold && (L.phaseOf(lab) === 'reduce' || lab.solvedNow);

export default function LineRow({ lab, short = false }) {
  const written = L.writtenTerms(lab);
  const total = L.expansionTerms(lab).length;
  const plot = lab.world === 'plot' && !short;
  return (
    <div dir="ltr" className="flex min-h-[48px] flex-wrap items-center gap-x-1.5 gap-y-1 rounded-2xl bg-white/80 px-3 py-1 text-[17px] font-bold text-slate-900 ring-1 ring-emerald-200" data-as-line>
      {plot && <><span className="text-emerald-900">{M(L.exprTex(lab))}</span><span className="text-slate-500">{M('=')}</span></>}
      {!plot && <span className="text-slate-500">{M('=')}</span>}
      {written.length > 0
        ? <span key={written.length} className="as-pop rounded-lg bg-emerald-50 px-1.5 text-emerald-950" data-as-written={written.length}>{M(termsTex(written))}</span>
        : <Box />}
      {written.length > 0 && written.length < total && <span className="text-slate-400">{M('+\\ \\cdots')}</span>}
      {lab.solvedNow ? (
        <>
          <span className="text-slate-500">{M('=')}</span>
          <span key={`r${lab.events.length}`} className="as-pop inline-flex items-center rounded-lg bg-emerald-100 px-1.5 text-emerald-900 ring-2 ring-emerald-300" data-as-result>{M(L.resultTex(lab))}</span>
        </>
      ) : written.length > 0 && written.length === total && (
        <>
          <span className="text-slate-500">{M('=')}</span>
          <Box />
        </>
      )}
    </div>
  );
}
