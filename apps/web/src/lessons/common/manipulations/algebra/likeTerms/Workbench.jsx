import { Equal, Repeat } from 'lucide-react';
import { termTex } from '@smarter-academy/core/arithmetic/polynomials.js';
import * as B from '@smarter-academy/core/arithmetic/brackets.js';
import MathText from '../../../components/MathText';
import KidFigure from '../../primitives/KidFigure';
import * as L from '../../logic/likeTerms';
import PieceArt, { ShapeSilhouette, WOOD, OPP } from './PieceArt';

/**
 * LA TABLE DU CLUB (thème `workbench`) : la feuille où l'expression est écrite (et grandit), le tapis où les piles attendent dans
 * l'ordre de l'écriture (les caisses = les parenthèses, leur signe peint devant), puis les deux sorties (brackets, tant qu'une caisse
 * est pleine) ou les trois صواني. Sous la feuille, سلمى (KidFigure, hijab) regarde — elle ne porte aucune information.
 * Vue PURE : tout l'état est `lab` (logic/likeTerms.js), les gestes passent par `drag` (useDragInteraction) et `setLab`.
 */
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const M = (s) => <MathText>{`$${s}$`}</MathText>;
const M2 = (s) => <MathText>{s}</MathText>;
const TABLE_BG = {
  backgroundImage: 'repeating-linear-gradient(92deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 17px), repeating-linear-gradient(88deg, rgba(120,53,15,0.07) 0 1px, transparent 1px 29px), linear-gradient(180deg, #DDB27A, #C79257)',
};
const MAT_BG = {
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(180deg, #3F8F75, #357C66)',
  backgroundSize: '22px 22px, 22px 22px, auto',
};
const CRATE_BG = {
  backgroundImage: 'repeating-linear-gradient(0deg, rgba(120,53,15,0.16) 0 2px, transparent 2px 13px), linear-gradient(180deg, #F2D3A2, #E2B57A)',
};

const Box = ({ small = false }) => (
  <span aria-hidden="true" className={`inline-block rounded-md border-2 border-dashed border-indigo-300 bg-indigo-50/60 align-middle ${small ? 'h-6 w-7' : 'h-7 w-10'}`} />
);

/** La feuille : l'expression écrite, puis ce que la main a écrit (les termes sortis, la forme réduite). */
function PaperLine({ lab, k }) {
  const brackets = lab.world === 'brackets' && lab.crates.length > 0;
  const slots = [...lab.bundles].sort((a, b) => a.slot - b.slot);
  const result = lab.solvedNow ? (
    <span key={`r${lab.events.length}`} className="lt-pop inline-flex items-center rounded-lg bg-emerald-100 px-1.5 text-emerald-900 ring-2 ring-emerald-300" data-lt-result>{M(B.simplifiedTex(lab.expr))}</span>
  ) : <Box />;
  return (
    <div dir="ltr" className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 text-[19px] font-bold text-slate-900" data-lt-line aria-label={k('lineAria')}>
      <span>{M(B.expressionTex(lab.expr))}</span>
      {brackets && (
        <>
          <span className="text-slate-500">{M('=')}</span>
          {slots.map((b, i) => (b.place === 'crate'
            ? <Box key={b.id} small />
            : <span key={b.id} className={lab.last?.event === 'exit' && lab.last.id === b.id ? 'lt-pop rounded bg-amber-100 px-0.5' : ''} data-lt-slot={b.slot}>{M(termTex({ c: b.c, p: b.p }, { lead: i === 0 }))}</span>))}
        </>
      )}
      {(!brackets || !L.cratesFull(lab)) && lab.bundles.length > 0 && (
        <>
          <span className="text-slate-500">{M('=')}</span>
          {result}
        </>
      )}
    </div>
  );
}

function Salma({ mood }) {
  return (
    <svg width="58" height="96" viewBox="0 0 58 96" className="shrink-0" aria-hidden="true" data-lt-salma={mood}>
      <KidFigure cx={29} top={3} foot={94} hairStyle="hijab" scarf="lavender" outfit="teal" skin="wheat" mood={mood} />
    </svg>
  );
}

/** Une pile : la pièce dessinée et son terme écrit. Portable seulement quand le geste a un sens (`movable`). */
function BundleCard({ lab, b, k, u, drag, wobble, movable }) {
  const c = b.place === 'crate' ? b.c0 : b.c;
  const ghost = b.place === 'tray';
  const pill = (
    <span className={`rounded-full px-2 py-0.5 text-[15px] font-black leading-tight shadow-sm ring-1 ${c < 0 ? 'bg-rose-50 text-rose-800 ring-rose-200' : 'bg-white text-indigo-950 ring-amber-200'}`}>{M(termTex({ c, p: b.p }))}</span>
  );
  if (ghost) {
    return (
      <div className="flex flex-col items-center justify-end gap-1 rounded-2xl border-2 border-dashed border-white/40 px-1.5 pb-1 pt-1.5 opacity-30 grayscale" aria-hidden="true" data-lt-ghost={b.id}>
        <PieceArt c={c} p={b.p} x={lab.x} u={u} />
        {pill}
      </div>
    );
  }
  const sp = movable ? drag.sourceProps(`b:${b.id}`) : {};
  const isHeld = drag.held === `b:${b.id}`;
  const wob = wobble?.id === b.id;
  const flipped = lab.last?.event === 'exit' && lab.last.id === b.id && lab.last.flipped;
  const Tag = movable ? 'button' : 'div';
  return (
    <Tag key={wob ? `w${wobble.n}` : flipped ? `f${lab.events.length}` : b.id} type={movable ? 'button' : undefined} {...sp}
      data-lt-bundle={b.id} data-c={c} data-p={b.p} data-lt-nav={movable ? '' : undefined}
      aria-label={k('bundleAria', { term: plainTerm(c, b.p) })} aria-disabled={movable ? undefined : 'true'}
      className={`sa-manip-object relative flex flex-col items-center justify-end gap-1 rounded-2xl px-1.5 pb-1 pt-1.5 transition-transform duration-150 motion-reduce:transition-none ${ring} ${movable ? 'cursor-grab hover:-translate-y-0.5 hover:bg-white/15' : ''} ${isHeld ? '-translate-y-1 scale-105 bg-white/25 ring-4 ring-amber-300' : ''} ${drag.rejected === `b:${b.id}` ? 'sa-manip-reject' : ''} ${wob ? 'lt-wobble' : ''} ${flipped ? 'lt-flip' : ''}`}
      style={movable ? sp.style : undefined}>
      <PieceArt c={c} p={b.p} x={lab.x} u={u} />
      {pill}
    </Tag>
  );
}

const plainTerm = (c, p) => termTex({ c, p }).replace('^2', '²').replace(/^-/, '−');

function Paren({ right = false }) {
  return (
    <svg width="12" viewBox="0 0 12 100" preserveAspectRatio="none" className="h-auto self-stretch" aria-hidden="true">
      <path d={right ? 'M3 3 Q 13 50 3 97' : 'M9 3 Q -1 50 9 97'} fill="none" stroke="#5B3A1A" strokeWidth="3.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Crate({ lab, item, k, children }) {
  const sign = L.crateOf(lab, item).sign;
  return (
    <div className="relative flex items-stretch gap-0.5 rounded-xl border-[3px] border-[#8B5A2B] px-0.5 pb-0.5 pt-1 shadow-[inset_0_-4px_0_rgba(120,53,15,0.25),0_6px_10px_-6px_rgba(0,0,0,0.5)]" style={CRATE_BG}
      data-lt-crate={item} data-sign={sign} role="group" aria-label={k(sign < 0 ? 'crateMinus' : 'cratePlus')}>
      <span className={`absolute -left-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border-[3px] text-2xl font-black leading-none shadow ${sign < 0 ? 'border-rose-800 bg-rose-500 text-white' : 'border-emerald-800 bg-emerald-500 text-white'}`} aria-hidden="true" data-lt-crate-tag>
        {sign < 0 ? '−' : '+'}
      </span>
      <Paren />
      <div className="flex items-end gap-1">{children}</div>
      <Paren right />
    </div>
  );
}

/** La rangée : les piles dans l'ordre de l'écriture, les caisses à leur place (les piles déjà sorties juste avant leur caisse). */
function Row({ lab, k, u, drag, wobble, narrow }) {
  const full = L.cratesFull(lab);
  const canMove = (b) => !lab.solvedNow && (b.place === 'crate' || (b.place === 'row' && !full));
  const card = (b) => <BundleCard key={b.id} lab={lab} b={b} k={k} u={u} drag={drag} wobble={wobble} movable={canMove(b)} />;
  const entries = [];
  lab.expr.forEach((it, i) => {
    const mine = lab.bundles.filter((b) => b.item === i).sort((a, b) => a.slot - b.slot);
    if (!B.isGroup(it)) { mine.forEach((b) => entries.push(card(b))); return; }
    mine.filter((b) => b.place !== 'crate').forEach((b) => entries.push(card(b)));
    const inside = mine.filter((b) => b.place === 'crate');
    if (inside.length) entries.push(<Crate key={`c${i}`} lab={lab} item={i} k={k}>{inside.map(card)}</Crate>);
  });
  return (
    <div dir="ltr" className={`flex flex-wrap items-end justify-center gap-x-2.5 rounded-2xl px-3 shadow-[inset_0_2px_8px_rgba(0,0,0,0.25)] ${narrow ? 'min-h-[56px] gap-y-2 pb-1.5 pt-3' : 'min-h-[64px] gap-y-3 pb-2 pt-4'}`} style={MAT_BG} data-lt-row>
      {entries.length ? entries : <p className="self-center text-sm font-bold text-white/80" dir="rtl">{k('emptyTable')}</p>}
    </div>
  );
}

/** Les deux sorties d'une caisse : « كما هي » et « بعكس إشارتها ». Aucune n'est jugée avant le dépôt. */
function Exits({ k, drag }) {
  const zone = (id) => {
    const zp = drag.zoneProps(`exit:${id}`);
    return (
      <div key={id} {...zp} role="button" tabIndex={0} data-lt-exit={id} data-lt-nav aria-label={k(`exit.${id}Aria`)}
        className={`group flex min-h-[64px] items-center justify-center gap-2.5 rounded-2xl border-[3px] border-dashed px-3 py-2 transition-colors ${ring} ${zp['data-drop-active'] ? 'border-amber-500 bg-amber-100' : zp['data-drop-ready'] ? 'border-amber-400 bg-[#FFF5E1] shadow-[0_0_0_4px_rgba(251,191,36,0.35)]' : 'border-[#8B5A2B]/50 bg-[#F6E3C4]'}`}>
        <svg width="54" height="34" viewBox="0 0 54 34" aria-hidden="true">
          <rect x="2" y="5" width="9" height="24" rx="2" fill={WOOD.mid} stroke={WOOD.edge} />
          <path d="M16 17 h14" stroke="#7C4A1E" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M26 12 l6 5 l-6 5" fill="none" stroke="#7C4A1E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="40" y="5" width="9" height="24" rx="2" fill={id === 'flip' ? OPP.mid : WOOD.mid} stroke={id === 'flip' ? OPP.edge : WOOD.edge} />
          {id === 'flip' && <rect x="42" y="9" width="5" height="2.2" rx="1" fill="#fff" />}
        </svg>
        <span className="flex items-center gap-1 text-base font-black text-amber-950">
          {id === 'flip' ? <Repeat className="h-4 w-4" aria-hidden="true" /> : <Equal className="h-4 w-4" aria-hidden="true" />}
          {k(`exit.${id}`)}
        </span>
      </div>
    );
  };
  return <div className="grid grid-cols-2 gap-2.5" data-lt-exits>{['keep', 'flip'].map(zone)}</div>;
}

function CoefStepper({ lab, setLab, p, k }) {
  const v = L.coefOf(lab, p);
  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };
  const judged = lab.checked[p];
  return (
    <div dir="ltr" className={`flex w-full max-w-[160px] items-center justify-between gap-0.5 rounded-xl bg-white/90 p-0.5 ring-2 ${judged === false ? 'ring-rose-300' : judged ? 'ring-emerald-300' : 'ring-indigo-100'}`} data-lt-coef={p}
      onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="group" aria-label={k('coefAria', { tray: k(`trayPlain.${p}`) })}>
      <button type="button" onClick={stop(() => setLab((s) => L.setCoef(s, p, L.coefOf(s, p) - 1)))} disabled={lab.solvedNow || v <= L.COEF_MIN}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-indigo-200 bg-white text-xl font-black text-indigo-700 disabled:opacity-40 ${ring}`} aria-label={k('coefLess')} data-lt-coef-less={p}>−</button>
      <span className="min-w-0 flex-1 text-center text-base font-black text-indigo-950" data-lt-coef-value={v}>{M(v === 0 ? '0' : termTex({ c: v, p }))}</span>
      <button type="button" onClick={stop(() => setLab((s) => L.setCoef(s, p, L.coefOf(s, p) + 1)))} disabled={lab.solvedNow || v >= L.COEF_MAX}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-indigo-600 bg-indigo-600 text-xl font-black text-white disabled:opacity-40 ${ring}`} aria-label={k('coefMore')} data-lt-coef-more={p}>+</button>
    </div>
  );
}

/** Les trois صواني : x², x, nombres. مبتدئ : la lecture courante (le terme qu'elles portent) ; متقدم : deux tas, puis le réglage. */
function Trays({ lab, setLab, k, u, drag, poof, narrow }) {
  const full = L.cratesFull(lab);
  return (
    <div dir="ltr" className="grid grid-cols-3 gap-2" data-lt-trays>
      {L.TRAYS.map((p) => {
        const zp = drag.zoneProps(`tray:${p}`, { disabled: full || lab.solvedNow });
        const coef = L.trayCoef(lab, p);
        const has = L.inTray(lab, p).length > 0;
        const { pos, neg } = L.trayPieces(lab, p);
        const net = lab.scaffold || lab.solvedNow;
        const pf = poof?.trays?.[p];
        return (
          <div key={p} {...zp} role="button" tabIndex={0} data-lt-tray={p} data-coef={coef} data-lt-nav aria-label={k('trayAria', { tray: k(`trayPlain.${p}`) })}
            className={`relative flex min-w-0 flex-col items-center gap-1 rounded-2xl border-[3px] px-1.5 pb-1 pt-0.5 shadow-[inset_0_4px_10px_rgba(120,53,15,0.28)] transition-colors ${ring} ${zp['data-drop-invalid'] ? 'border-rose-400 bg-rose-50' : zp['data-drop-active'] ? 'border-emerald-500 bg-emerald-50' : zp['data-drop-ready'] ? 'border-amber-400 bg-[#FFF7E6] shadow-[0_0_0_4px_rgba(251,191,36,0.35)]' : 'border-[#9A6131] bg-[#F7E7C9]'}`}>
            <span className="flex items-center gap-1.5 text-sm font-black text-amber-950">
              <ShapeSilhouette p={p} x={lab.x} u={u} scale={0.42} />
              <span>{M2(k(`trayName.${p}`))}</span>
            </span>
            <div className={`relative flex w-full flex-1 items-end justify-center gap-1.5 ${narrow ? 'min-h-[30px]' : 'min-h-[44px]'}`} dir="ltr">
              {net
                ? (coef !== 0 && <PieceArt c={coef} p={p} x={lab.x} u={u} tie={false} />)
                : (
                  <>
                    {pos > 0 && <PieceArt c={pos} p={p} x={lab.x} u={u} tie={false} />}
                    {neg > 0 && <PieceArt c={-neg} p={p} x={lab.x} u={u} tie={false} />}
                  </>
                )}
              {pf > 0 && (
                <span key={poof.key} className="lt-poof pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center gap-1" aria-hidden="true" data-lt-poof={pf}>
                  <PieceArt c={pf} p={p} x={lab.x} u={u} tie={false} />
                  <PieceArt c={-pf} p={p} x={lab.x} u={u} tie={false} />
                </span>
              )}
            </div>
            {lab.scaffold && (
              <span key={`${coef}-${lab.events.length}`} className={`lt-pop rounded-full px-2.5 py-0.5 text-base font-black ${has ? 'bg-white text-indigo-950 ring-2 ring-indigo-200' : 'text-amber-900/40'}`} data-lt-readout={p}>
                {has ? M(coef === 0 ? '0' : termTex({ c: coef, p })) : '·'}
              </span>
            )}
            {!lab.scaffold && has && <CoefStepper lab={lab} setLab={setLab} p={p} k={k} />}
          </div>
        );
      })}
    </div>
  );
}

export default function Workbench({ lab, setLab, k, u, drag, wobble, poof, mood, narrow }) {
  return (
    <div className={`relative rounded-[26px] border-b-[10px] border-[#8A5A2B] ${narrow ? 'space-y-2 p-2' : 'space-y-2.5 p-2.5'} shadow-[0_18px_32px_-18px_rgba(120,53,15,0.75)]`} style={TABLE_BG} data-lt-table>
      <div className="flex items-end gap-2">
        <div className="relative min-w-0 flex-1 -rotate-[0.4deg] rounded-md bg-[#FFFDF6] px-3 py-1.5 shadow-[0_6px_14px_-8px_rgba(0,0,0,0.55)]">
          <span aria-hidden="true" className="absolute -top-2 left-6 h-4 w-12 rotate-[-4deg] rounded-sm bg-amber-200/70" />
          <span aria-hidden="true" className="absolute -top-2 right-8 h-4 w-12 rotate-[5deg] rounded-sm bg-amber-200/70" />
          <PaperLine lab={lab} k={k} />
        </div>
        {!narrow && <Salma mood={mood} />}
      </div>
      <Row lab={lab} k={k} u={u} drag={drag} wobble={wobble} narrow={narrow} />
      {L.showExits(lab) && <Exits lab={lab} k={k} drag={drag} />}
      {L.showTrays(lab) && <Trays lab={lab} setLab={setLab} k={k} u={u} drag={drag} poof={poof} narrow={narrow} />}
    </div>
  );
}
