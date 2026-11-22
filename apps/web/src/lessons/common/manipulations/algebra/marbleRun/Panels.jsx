import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import * as S from '@smarter-academy/core/arithmetic/substitution.js';
import MathText from '../../../components/MathText';
import * as L from '../../logic/marbleRun';
import { MarbleBall, Basket, StationCard, iso } from './Parts';

/** Les panneaux annexes de « مسار الكريات » : la prédiction (متقدم), « جرّب أعدادك », les deux murs jumeaux. */

const btn = 'inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 px-3 text-sm font-black outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';

export function PredictPanel({ lab, k, onCommit, onClear }) {
  const [sg, setSg] = useState(1);
  const [n, setN] = useState('');
  const [d, setD] = useState('');
  const p = lab.predicted;
  const parse = (t) => (/^\d{1,3}$/.test(t.trim()) ? Number(t) : null);
  const num = parse(n); const den = d.trim() === '' ? 1 : parse(d);
  const ok = num != null && den != null && den >= 1;
  return (
    <div data-mr-predict className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50/70 px-3 py-1.5">
      <span className="text-sm font-black text-indigo-950">{k('predict.label')}</span>
      {p ? (
        <>
          <bdi dir="ltr" data-mr-predicted className="rounded-xl bg-white px-3 py-1 text-xl font-black tabular-nums text-indigo-900 ring-2 ring-indigo-200">{L.valueText(p.v)}</bdi>
          <button type="button" onClick={onClear} className={`${btn} border-slate-300 bg-white text-slate-700`}>{k('predict.change')}</button>
        </>
      ) : (
        <div dir="ltr" className="flex flex-wrap items-center gap-1.5">
          <button type="button" data-mr-predict-sign onClick={() => setSg((v) => -v)} aria-label={k('predict.signAria')} aria-pressed={sg < 0}
            className={`${btn} w-11 ${sg < 0 ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-teal-400 bg-teal-50 text-teal-700'}`}>{sg < 0 ? '−' : '+'}</button>
          <input data-mr-predict-num inputMode="numeric" value={n} onChange={(e) => setN(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} aria-label={k('predict.numAria')} placeholder={k('predict.num')}
            className="h-11 w-16 rounded-xl border-2 border-slate-300 bg-white px-1 text-center text-lg font-black tabular-nums outline-none focus:border-indigo-500" />
          <span className="text-xl font-black text-slate-500">/</span>
          <input data-mr-predict-den inputMode="numeric" value={d} onChange={(e) => setD(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} aria-label={k('predict.denAria')} placeholder={k('predict.den')}
            className="h-11 w-14 rounded-xl border-2 border-slate-300 bg-white px-1 text-center text-lg font-black tabular-nums outline-none focus:border-indigo-500" />
          <button type="button" data-mr-predict-commit disabled={!ok} onClick={() => onCommit({ sg, n: num, d: den })}
            className={`${btn} border-indigo-600 bg-indigo-600 text-white disabled:opacity-40`}>{k('predict.commit')}</button>
        </div>
      )}
    </div>
  );
}

const Stepper = ({ label, value, onLess, onMore, lessLabel, moreLabel }) => (
  <div className="flex items-center gap-0.5" dir="ltr">
    <button type="button" onClick={onLess} aria-label={lessLabel} className={`${btn} min-h-[44px] w-11 border-slate-300 bg-white text-slate-700`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
    <span className="min-w-[1.6rem] text-center text-lg font-black tabular-nums text-indigo-900" aria-label={label}>{value}</span>
    <button type="button" onClick={onMore} aria-label={moreLabel} className={`${btn} min-h-[44px] w-11 border-indigo-300 bg-indigo-50 text-indigo-800`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
  </div>
);

/** « جرّب أعدادك » — toujours ouvert : six cartes d'expression ou une expression tapée, et une bille réglée au bout des doigts. */
export function FreePanel({ lab, k, onExpr, onStep, onDrop }) {
  const [text, setText] = useState('');
  const [bad, setBad] = useState(false);
  const submit = (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;
    if (L.tryParse(t) && S.letters(L.tryParse(t)).length && S.letters(L.tryParse(t)).every((l) => l === 'x' || l === 'y')) { setBad(false); onExpr(t); } else setBad(true);
  };
  const cur = lab.free.expr;
  const m = L.freeMarble(lab);
  return (
    <div data-mr-free data-active={lab.custom ? 'true' : 'false'} className="space-y-1 rounded-2xl border-2 border-dashed border-indigo-200 bg-white/70 px-2.5 py-1.5">
      <p className="text-sm font-black text-indigo-950">{k('free.title')}</p>
      <div className="flex flex-wrap items-center gap-1" role="group" aria-label={k('free.cards')}>
        {L.FREE_CARDS.map((c) => (
          <button key={c} type="button" data-mr-free-card={c} aria-pressed={lab.custom && cur === c} onClick={() => onExpr(c)}
            className={`${btn} min-h-[40px] px-2 text-sm ${lab.custom && cur === c ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>
            <bdi dir="ltr">{S.treeText(L.treeOf(c))}</bdi>
          </button>
        ))}
        <form onSubmit={submit} className="flex items-center gap-1" dir="ltr">
          <input data-mr-free-input value={text} onChange={(e) => { setText(e.target.value); setBad(false); }} maxLength={26} aria-label={k('free.typeAria')} placeholder="3x − 4"
            className={`h-10 w-24 rounded-xl border-2 bg-white px-2 text-center text-sm font-black outline-none focus:border-indigo-500 ${bad ? 'border-rose-400' : 'border-slate-300'}`} />
          <button type="submit" className={`${btn} min-h-[40px] border-indigo-300 bg-indigo-50 px-2 text-indigo-800`}>✓</button>
        </form>
      </div>
      {bad && <p className="text-xs font-bold text-rose-700" data-mr-free-bad>{k('free.typeBad')}</p>}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-sm font-black text-slate-700">{k('free.marble')}</span>
        <Stepper label={k('free.num')} value={lab.free.num} onLess={() => onStep('num', -1)} onMore={() => onStep('num', 1)} lessLabel={k('free.numLess')} moreLabel={k('free.numMore')} />
        <span className="text-lg font-black text-slate-500">/</span>
        <Stepper label={k('free.den')} value={lab.free.den} onLess={() => onStep('den', -1)} onMore={() => onStep('den', 1)} lessLabel={k('free.denLess')} moreLabel={k('free.denMore')} />
        <MarbleBall m={m} size={34} />
        {S.letters(lab.tree).map((l) => (
          <button key={l} type="button" data-mr-free-drop={l} aria-label={k('free.dropAria')} onClick={() => onDrop(l, m)} className={`${btn} min-h-[40px] border-teal-500 bg-teal-50 px-2 text-teal-900`}>{k('free.drop')} {l}</button>
        ))}
      </div>
    </div>
  );
}

export function TwinsFree({ lab, k, onSet }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [bad, setBad] = useState(null);
  const submit = (which, text) => (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const tree = L.tryParse(t);
    if (!tree || S.letters(tree).some((l) => l !== 'x')) { setBad(which); return; }
    setBad(null); onSet(which, t);
  };
  const field = (which, val, set, label) => (
    <form onSubmit={submit(which, val)} className="flex flex-1 items-center gap-1" dir="ltr">
      <input data-mr-free-input={which} value={val} onChange={(e) => { set(e.target.value); setBad(null); }} maxLength={26} aria-label={label} placeholder={label}
        className={`h-11 min-w-0 flex-1 rounded-xl border-2 bg-white px-2 text-center text-base font-black outline-none focus:border-indigo-500 ${bad === which ? 'border-rose-400' : 'border-slate-300'}`} />
      <button type="submit" className={`${btn} border-indigo-300 bg-indigo-50 text-indigo-800`}>✓</button>
    </form>
  );
  return (
    <div data-mr-free data-active={lab.custom ? 'true' : 'false'} className="space-y-1.5 rounded-2xl border-2 border-dashed border-indigo-200 bg-white/70 px-3 py-2">
      <p className="text-sm font-black text-indigo-950">{k('free.title')}</p>
      <div className="flex flex-wrap gap-2">{field('a', a, setA, k('free.a'))}{field('b', b, setB, k('free.b'))}</div>
      {bad && <p className="text-xs font-bold text-rose-700">{k('free.typeBad')}</p>}
    </div>
  );
}

/** Un mur jumeau : l'expression écrite, ses stations (leurs valeurs vivent avec la bille), sa corbeille, et sa forme développée après « انشر ». */
export function TwinWall({ lab, tree, title, k, side }) {
  const m = lab.m;
  const env = m ? { x: m } : { x: { v: { n: 0n, d: 1n } } };
  const steps = S.trace(tree, env);
  const val = m ? iso(L.valueText(S.evaluate(tree, env))) : null;
  const reduced = lab.expanded ? L.reducedTex(tree) : null;
  const names = { pow: (n) => k(n === 3 ? 'stations.pow3' : 'stations.pow2'), mul: () => k('stations.mul'), neg: () => k('stations.neg'), add: () => k('stations.add'), sub: () => k('stations.sub') };
  return (
    <div className="min-w-0 flex-1 space-y-1.5 rounded-xl bg-white/50 p-1.5" data-mr-twin={side}>
      <p className="text-center text-xs font-black text-amber-950">{title}</p>
      <bdi dir="ltr" className="block rounded-lg bg-white px-2 py-1 text-center text-xl font-black text-slate-900 ring-1 ring-slate-300" data-mr-twin-expr>{S.treeText(tree)}</bdi>
      <div dir="ltr" className="flex flex-wrap items-stretch justify-center gap-1">
        {steps.map((st) => (
          <StationCard key={st.id} size="sm" st={{ id: st.id, op: st.op, n: st.n }} name={names[st.op](st.n)} reached={!!m} chip={m ? `${chipOf(st)}` : ''} lit={false} />
        ))}
        <Basket value={val} label={k('basket')} ok={false} />
      </div>
      {reduced && (
        <p className="text-center text-sm font-black text-indigo-900" data-mr-reduced={side}>{k('twin.reduced')} <MathText>{`$${reduced}$`}</MathText></p>
      )}
    </div>
  );
}

const T = (v) => L.valueText(v);
const P = (v) => (v.n < 0n ? `(${T(v)})` : T(v));
/** Le calcul d'une station : « (−2) × (−2) = 4 ». */
export function chipOf(st) {
  const [a, b] = st.args;
  const r = T(st.value);
  switch (st.op) {
    case 'pow': return st.n === 2 ? `${P(a)} × ${P(a)} = ${r}` : `${P(a)}³ = ${r}`;
    case 'mul': return `${P(a)} × ${P(b)} = ${r}`;
    case 'neg': return `−${P(a)} = ${r}`;
    case 'add': return `${T(a)} + ${P(b)} = ${r}`;
    case 'sub': return `${T(a)} − ${P(b)} = ${r}`;
    default: return r;
  }
}

