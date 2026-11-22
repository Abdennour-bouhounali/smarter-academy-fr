import { ChevronLeft, Check, FlaskConical } from 'lucide-react';
import * as E from '@smarter-academy/core/arithmetic/expansion.js';
import LabFold from '../../primitives/LabFold';
import MathText from '../../../components/MathText';
import { RoundButton, VerdictBanner } from '../../primitives/LabKit';
import KidFigure from '../../primitives/KidFigure';
import * as L from '../../logic/areaSplit';
import { bannerOf } from './format';

/**
 * Le PANNEAU du jardin : x (−/+ avec une réglette de longueur x), les deux compteurs côte à côte (l'aire comptée du terrain / la somme
 * des parcelles décidées, ou l'expression écrite / les produits décidés), la bannière (ce que le geste a écrit, « التالي », « تحقّق ») et
 * « جرّب أعدادك » toujours ouvert. À côté de la scène (large) ou dessous (étroit).
 */
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const M = (s) => <MathText>{s}</MathText>;

function MiniRod({ x }) {
  const s = 8;
  return (
    <svg width={9 * s + 6} height="14" viewBox={`0 0 ${9 * s + 6} 14`} aria-hidden="true" data-as-minirod={x}>
      <rect x="3" y="2" width={x * s} height="8" rx="2" fill="#86C98B" stroke="#2F7D4B" strokeWidth="1.2" style={{ transition: 'width .2s' }} />
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={3 + i * s} x2={3 + i * s} y1="10" y2="13" stroke="#2F7D4B" strokeWidth="1" />)}
    </svg>
  );
}

function XControl({ lab, setLab, k, compact = false }) {
  const lo = L.xMinOf(lab);
  return (
    <div className={`rounded-2xl bg-white px-2 ring-2 ring-emerald-100 ${compact ? 'py-1' : 'py-1.5'}`} data-as-x={lab.x}>
      {!compact && <p className="text-center text-xs font-black text-emerald-900/80">{M(k('x.label'))}</p>}
      <div dir="ltr" className="flex items-center justify-between gap-1.5">
        <RoundButton size={compact ? 44 : 46} onClick={() => setLab((s) => L.setX(s, s.x - 1))} disabled={lab.x <= lo} aria-label={k('x.less')} data-as-x-less>
          <span className="text-2xl font-black leading-none">−</span>
        </RoundButton>
        <div className={`flex min-w-0 flex-col items-center rounded-lg ${ring}`} role="spinbutton" tabIndex={0} aria-label={k('x.label').replace(/\$/g, '')} aria-valuenow={lab.x} aria-valuemin={lo} aria-valuemax={L.X_MAX} data-as-x-pill
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setLab((s) => L.setX(s, s.x - 1)); }
            else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setLab((s) => L.setX(s, s.x + 1)); }
          }}>
          <bdi dir="ltr" key={lab.x} className={`as-pop whitespace-nowrap font-black leading-tight text-emerald-950 ${compact ? 'text-[20px]' : 'text-[26px]'}`}>{M(`$x = ${lab.x}$`)}</bdi>
          {!compact && <MiniRod x={lab.x} />}
        </div>
        <RoundButton primary size={compact ? 44 : 46} onClick={() => setLab((s) => L.setX(s, s.x + 1))} disabled={lab.x >= L.X_MAX} aria-label={k('x.more')} data-as-x-more>
          <span className="text-2xl font-black leading-none">+</span>
        </RoundButton>
      </div>
    </div>
  );
}

function Meters({ lab, k, compact = false, flat = false }) {
  const whole = L.writtenValue(lab);
  const parts = L.partsValue(lab);
  const any = lab.world === 'arrows' ? L.signedArrows(lab).length > 0 : L.decided(lab).length > 0;
  const equal = L.bothEqual(lab);
  const card = (id, v, show, tone) => (
    <div className={`min-w-0 rounded-2xl px-2 py-1 ring-2 transition-colors ${equal ? 'bg-emerald-50 ring-emerald-400' : tone}`} data-as-meter={id} data-v={show ? v : ''}>
      <p className="text-[11px] font-black leading-tight text-slate-700">{k(`meter.${lab.world}.${id}${compact ? 'Short' : ''}`)}</p>
      <bdi dir="ltr" key={`${v}${show}`} className={`as-pop block font-black leading-tight tabular-nums text-emerald-950 ${compact ? 'text-[22px]' : 'text-[26px]'}`}>{show ? String(v).replace('-', '\u2212') : '·'}</bdi>
    </div>
  );
  const a = card('whole', whole, true, 'bg-[#FFFDF6] ring-amber-200');
  const b = card('parts', parts, any, 'bg-[#EEF7F3] ring-emerald-200');
  if (flat) return <>{a}{b}</>;
  return (
    <div className="space-y-0.5" data-as-meters>
      <div className="grid grid-cols-2 gap-1.5">{a}{b}</div>
      {!compact && <p className="text-center text-[11px] font-bold text-slate-500">{M(k('meter.at', { x: lab.x }))}</p>}
    </div>
  );
}

/** هناء en buste (colonne étroite : la grande figure de la cour n'a pas de place) — elle réagit, elle ne porte aucune information. */
function HanaBust({ mood }) {
  return (
    <svg width="38" height="42" viewBox="8 0 48 53" className="shrink-0 self-center" aria-hidden="true" data-as-hana-bust={mood}>
      <KidFigure cx={32} top={2} foot={104} hairStyle="hijab" scarf="lavender" outfit="teal" skin="wheat" mood={mood} shadow={false} />
    </svg>
  );
}

function Banner({ lab, setLab, k, coachVisible, compact = false, mood = null, blocking = false }) {
  const b = bannerOf(lab, k, coachVisible);
  const next = L.canNext(lab) && !blocking && (
    <button type="button" onClick={() => setLab(L.nextTask)} data-as-next
      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] active:translate-y-0.5 ${ring}`}>
      {k(lab.custom ? 'back' : 'next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    </button>
  );
  const checkBtn = !lab.scaffold && L.phaseOf(lab) === 'reduce' && (
    <button type="button" onClick={() => setLab(L.check)} data-as-check disabled={!L.canCheck(lab)}
      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border-2 border-indigo-600 bg-indigo-600 px-4 text-sm font-black text-white shadow-[0_3px_0_0_#3730A3] active:translate-y-0.5 disabled:opacity-40 ${ring}`}>
      <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> {k('check')}
    </button>
  );
  return (
    <VerdictBanner tone={b.tone} icon={b.icon} size="xs" className={`${compact ? 'min-h-[2.4rem] !py-1' : 'min-h-[3.4rem]'} ${b.idle && !b.text ? 'opacity-0' : ''}`} data-as-banner={lab.last?.event ?? ''}>
      <div className={`flex min-w-0 gap-x-2 gap-y-1 ${compact ? 'flex-wrap items-center justify-between' : 'flex-col items-stretch'}`}>
        {mood && <HanaBust mood={mood} />}
        {b.text && <p className="min-w-0 flex-1" {...(b.refused ? { 'data-as-refused': b.refused } : {})}>{M(b.text)}</p>}
        {(next || checkBtn) && <div className={`flex flex-wrap gap-2 ${compact ? 'shrink-0' : ''}`}>{checkBtn}{next}</div>}
      </div>
    </VerdictBanner>
  );
}

/** Un stepper −/valeur/+ (LTR), 44 px. */
function Stepper({ value, shown, onLess, onMore, lessOff, moreOff, label, data }) {
  return (
    <div dir="ltr" className="flex items-center rounded-xl bg-white ring-2 ring-amber-200" role="group" aria-label={label} {...data}>
      <button type="button" onClick={onLess} disabled={lessOff} aria-label={`${label} −`} data-step="less"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-s-xl text-xl font-black text-amber-900 disabled:opacity-30 ${ring}`}>−</button>
      <bdi dir="ltr" className="min-w-0 flex-1 text-center text-[17px] font-black tabular-nums text-amber-950" data-v={value}>{shown}</bdi>
      <button type="button" onClick={onMore} disabled={moreOff} aria-label={`${label} +`} data-step="more"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-e-xl text-xl font-black text-amber-900 disabled:opacity-30 ${ring}`}>+</button>
    </div>
  );
}

const fmtM = (m) => (m === 0 ? '0' : m === 1 ? 'x' : `${m}x`);
const fmtN = (n) => (n < 0 ? `−${-n}` : n > 0 ? `+${n}` : '0');

function FreePanel({ lab, setLab, k, compact = false, inline = false, bare = false }) {
  const f = L.freeOf(lab);
  const rows = lab.world === 'arrows'
    ? [['f1', 'a', 'b', k('free.f1')], ['f2', 'a', 'b', k('free.f2')]]
    : [['h', 'm', 'n', k('free.h')], ['w', 'm', 'n', k('free.w')]];
  const range = (which, field) => (lab.world === 'arrows' ? L.FREE.arrows.c : L.FREE.plot[which][field]);
  return (
    <div className={`rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-1.5 ${compact ? 'space-y-1' : 'space-y-1.5'}`} data-as-free>
      {!bare && <p className="flex items-center gap-1 text-xs font-black text-amber-950"><FlaskConical className="h-4 w-4" aria-hidden="true" />{k('free.title')}</p>}
      <div className="space-y-1">
        {rows.map(([which, f1, f2, name]) => (
          <div key={which} className={inline ? 'flex items-center gap-1.5' : 'space-y-0.5'} data-as-free-row={which}>
            <span className={`${inline ? 'w-16 shrink-0' : 'flex items-baseline justify-between gap-2'} text-[12px] font-black leading-tight text-amber-950`}>
              {name}
              {!inline && <bdi dir="ltr" className="text-[13px] font-black tabular-nums text-amber-800" data-as-free-tex={which}>{lab.world === 'arrows' ? E.sideTex({ m: f[which].a, n: f[which].b }) : E.sideTex(f[which])}</bdi>}
            </span>
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5">
              {[f1, f2].map((field, idx) => {
                const [lo, hi] = range(which, field);
                const v = f[which][field];
                const isX = idx === 0;
                return (
                  <Stepper key={field} value={v} shown={isX ? fmtM(v) : fmtN(v)} label={k(isX ? 'free.xAria' : 'free.nAria', { side: name })}
                    onLess={() => setLab((s) => L.stepFree(s, which, field, -1))} onMore={() => setLab((s) => L.stepFree(s, which, field, 1))}
                    lessOff={v <= lo} moreOff={v >= hi} data={{ 'data-as-free-step': `${which}.${field}` }} />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SidePanel({ lab, setLab, k, side, width, coachVisible, mood = null, fold = false, blocking = false }) {
  if (side) {
    return (
      <div className="min-w-0 shrink-0 space-y-2" style={{ width }} data-as-panel>
        <Banner lab={lab} setLab={setLab} k={k} coachVisible={coachVisible} blocking={blocking} />
        <Meters lab={lab} k={k} />
        <XControl lab={lab} setLab={setLab} k={k} />
        <FreePanel lab={lab} setLab={setLab} k={k} />
      </div>
    );
  }
  return (
    <div className="space-y-1" data-as-panel>
      <div className="grid grid-cols-[1.5fr_1fr_1fr] items-stretch gap-1.5">
        <XControl lab={lab} setLab={setLab} k={k} compact />
        <Meters lab={lab} k={k} compact flat />
      </div>
      <Banner lab={lab} setLab={setLab} k={k} coachVisible={coachVisible} compact mood={lab.world === 'plot' ? mood : null} blocking={blocking} />
      {fold
        ? <LabFold id="area-split.free" defaultOpen={false} title={<span className="flex items-center gap-1"><FlaskConical className="h-4 w-4" aria-hidden="true" />{k('free.title')}</span>} className="!border-2 !border-dashed !border-amber-300 !bg-amber-50/70"><FreePanel lab={lab} setLab={setLab} k={k} compact inline bare /></LabFold>
        : <FreePanel lab={lab} setLab={setLab} k={k} compact inline />}
    </div>
  );
}
