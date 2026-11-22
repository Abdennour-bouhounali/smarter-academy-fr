import { useState } from 'react';
import { ChevronLeft, Check, Eraser, FlaskConical } from 'lucide-react';
import MathText from '../../../components/MathText';
import { RoundButton, VerdictBanner } from '../../primitives/LabKit';
import * as L from '../../logic/likeTerms';
import { bannerOf } from './format';
import { WOOD } from './PieceArt';

/**
 * Le PANNEAU de la table : x (la longueur de la réglette, −/+), les deux valeurs côte à côte (l'expression écrite, la table), la bannière
 * (ce que le geste a écrit, « التالي », « تحقّق ») et « جرّب أعدادك » toujours ouvert. À côté de la table (large), dessous (étroit).
 */
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const M = (s) => <MathText>{s}</MathText>;

function MiniRod({ x }) {
  const s = 9;
  const w = x * s;
  return (
    <svg width={6 * s + 6} height="16" viewBox={`0 0 ${6 * s + 6} 16`} aria-hidden="true" data-lt-minirod={x}>
      <rect x="3" y="3" width={w} height="9" rx="2" fill={WOOD.mid} stroke={WOOD.edge} style={{ transition: 'width .2s' }} />
      {Array.from({ length: 7 }, (_, i) => <line key={i} x1={3 + i * s} x2={3 + i * s} y1="12" y2="15.5" stroke="#9A6131" strokeWidth="1" />)}
    </svg>
  );
}

function XControl({ lab, setLab, k, compact = false }) {
  return (
    <div className={`rounded-2xl bg-white px-2 ring-2 ring-indigo-100 ${compact ? 'py-1' : 'py-1.5'}`} data-lt-xbox>
      {!compact && <p className="text-center text-xs font-black text-indigo-900/80">{M(k('x.label'))}</p>}
      <div dir="ltr" className="flex items-center justify-between gap-1.5">
        <RoundButton size={compact ? 44 : 46} onClick={() => setLab((s) => L.setX(s, s.x - 1))} disabled={lab.x <= L.X_MIN} aria-label={k('x.less')} data-lt-x-less>
          <span className="text-2xl font-black leading-none">−</span>
        </RoundButton>
        <div className="flex min-w-0 flex-col items-center">
          <bdi dir="ltr" key={lab.x} className={`lt-pop whitespace-nowrap font-black leading-tight text-indigo-950 ${compact ? 'text-[20px]' : 'text-[26px]'}`} data-lt-x={lab.x}>{M(`$x = ${lab.x}$`)}</bdi>
          {!compact && <MiniRod x={lab.x} />}
        </div>
        <RoundButton primary size={compact ? 44 : 46} onClick={() => setLab((s) => L.setX(s, s.x + 1))} disabled={lab.x >= L.X_MAX} aria-label={k('x.more')} data-lt-x-more>
          <span className="text-2xl font-black leading-none">+</span>
        </RoundButton>
      </div>
    </div>
  );
}

function Values({ lab, k, compact = false, flat = false }) {
  const w = L.writtenValue(lab);
  const tb = L.tableValue(lab);
  const card = (id, v, tone) => (
    <div className={`min-w-0 rounded-2xl px-2 py-1 ring-2 ${tone}`} data-lt-value={id} data-v={v}>
      <p className="truncate text-[11px] font-black leading-tight text-slate-700">{k(`value.${id}`)}</p>
      <bdi dir="ltr" key={v} className={`lt-pop block font-black leading-tight tabular-nums text-indigo-950 ${compact ? 'text-[22px]' : 'text-[26px]'}`}>{v}</bdi>
    </div>
  );
  if (flat) return <>{card('written', w, 'bg-[#FFFDF6] ring-amber-200')}{card('table', tb, 'bg-[#EEF7F3] ring-emerald-200')}</>;
  return (
    <div className="space-y-0.5" data-lt-values>
      <div className="grid grid-cols-2 gap-1.5">
        {card('written', w, 'bg-[#FFFDF6] ring-amber-200')}
        {card('table', tb, 'bg-[#EEF7F3] ring-emerald-200')}
      </div>
      {!compact && <p className="text-center text-[11px] font-bold text-slate-500">{M(k('value.at', { x: lab.x }))}</p>}
    </div>
  );
}

function Banner({ lab, setLab, k, coachVisible, compact = false, blocking = false }) {
  const b = bannerOf(lab, k, coachVisible);
  const next = L.canNext(lab) && !blocking && (
    <button type="button" onClick={() => setLab(L.nextTask)} data-lt-next
      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] active:translate-y-0.5 ${ring}`}>
      {k(lab.custom ? 'back' : 'next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    </button>
  );
  const checkBtn = !lab.scaffold && !lab.solvedNow && L.allSorted(lab) && (
    <button type="button" onClick={() => setLab(L.check)} data-lt-check disabled={!L.canCheck(lab)}
      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border-2 border-indigo-600 bg-indigo-600 px-4 text-sm font-black text-white shadow-[0_3px_0_0_#3730A3] active:translate-y-0.5 disabled:opacity-40 ${ring}`}>
      <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> {k('check')}
    </button>
  );
  return (
    <VerdictBanner tone={b.tone} icon={b.icon} size="xs" className={`${compact ? 'min-h-[2.4rem] !py-1' : 'min-h-[3.4rem]'} ${b.idle && !b.text ? 'opacity-0' : ''}`} data-lt-banner={lab.last?.event ?? ''}>
      <div className="min-w-0 space-y-1.5">
        {b.text && <p {...(b.refused ? { 'data-lt-refused': b.refused } : {})}>{M(b.text)}</p>}
        {(next || checkBtn) && <div className="flex flex-wrap gap-2">{checkBtn}{next}</div>}
      </div>
    </VerdictBanner>
  );
}

function FreePanel({ lab, setLab, k, compact = false }) {
  const [target, setTarget] = useState('row');
  const brackets = lab.world === 'brackets';
  const tg = brackets ? target : 'row';
  return (
    <div className={`rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-1.5 ${compact ? 'space-y-1' : 'space-y-1.5'}`} data-lt-free>
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-xs font-black text-amber-950"><FlaskConical className="h-4 w-4" aria-hidden="true" />{k('free.title')}</p>
        <button type="button" onClick={() => setLab(L.clearTable)} data-lt-clear aria-label={k('free.clearAria')}
          className={`inline-flex min-h-[36px] items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 text-xs font-black text-amber-900 ${ring}`}>
          <Eraser className="h-3.5 w-3.5" aria-hidden="true" /> {k('free.clear')}
        </button>
      </div>
      {brackets && (
        <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label={k('free.targetAria')}>
          {['row', 'plus', 'minus'].map((id) => (
            <button key={id} type="button" role="radio" aria-checked={target === id} onClick={() => setTarget(id)} data-lt-target={id}
              className={`min-h-[36px] rounded-xl border-2 px-1 text-[12px] font-black leading-tight ${ring} ${target === id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-100 bg-white text-indigo-900'}`}>
              {M(k(`free.target.${id}`))}
            </button>
          ))}
        </div>
      )}
      <div dir="ltr" className={`grid gap-1 ${compact ? 'grid-cols-6' : 'grid-cols-3'}`}>
        {[1, -1].flatMap((sg) => L.TRAYS.map((p) => {
          const id = `${p}${sg > 0 ? '+' : '-'}`;
          const can = L.canAdd(lab, p);
          return (
            <button key={id} type="button" disabled={!can} onClick={() => setLab((s) => L.addPiece(s, p, sg, tg))} data-lt-add={id}
              aria-label={k(sg > 0 ? 'free.addAria' : 'free.addOppAria', { piece: k(`piecePlain.${p}`) })}
              className={`flex min-h-[44px] items-center justify-center rounded-xl border-2 text-[17px] font-black disabled:opacity-40 ${ring} ${sg > 0 ? 'border-amber-300 bg-white text-amber-950 shadow-[0_3px_0_0_#FCD34D]' : 'border-rose-200 bg-rose-50 text-rose-800 shadow-[0_3px_0_0_#FECDD3]'} active:translate-y-0.5 active:shadow-none`}>
              {M(`$${sg > 0 ? '+' : '-'}${p === 2 ? 'x^2' : p === 1 ? 'x' : '1'}$`)}
            </button>
          );
        }))}
      </div>
    </div>
  );
}

export default function SidePanel({ lab, setLab, k, side, width, coachVisible, blocking = false }) {
  if (side) {
    return (
      <div className="min-w-0 shrink-0 space-y-2" style={{ width }} data-lt-panel>
        <Banner lab={lab} setLab={setLab} k={k} coachVisible={coachVisible} blocking={blocking} />
        <Values lab={lab} k={k} />
        <XControl lab={lab} setLab={setLab} k={k} />
        <FreePanel lab={lab} setLab={setLab} k={k} />
      </div>
    );
  }
  return (
    <div className="space-y-1" data-lt-panel>
      <div className="grid grid-cols-[1.5fr_1fr_1fr] items-stretch gap-1.5">
        <XControl lab={lab} setLab={setLab} k={k} compact />
        <Values lab={lab} k={k} compact flat />
      </div>
      <Banner lab={lab} setLab={setLab} k={k} coachVisible={coachVisible} compact blocking={blocking} />
      <FreePanel lab={lab} setLab={setLab} k={k} compact />
    </div>
  );
}

