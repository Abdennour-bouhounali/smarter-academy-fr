import { sign } from '@smarter-academy/core/arithmetic/powers.js';
import * as L from '../../logic/marbleRun';

/**
 * La ligne écrite sous le mur (LTR, grande) : l'expression dont chaque lettre est remplacée par SA case. Toucher une case ajoute /
 * retire ses parenthèses ; toucher le vide avant une case écrit /efface le signe ×. La case fautive (celle de la station allumée)
 * tremble et s'entoure d'ambre. Les jetons viennent de `substitution.js › writeLine` ; ici on ne fait que les dessiner.
 */
const SUP = { 2: '²', 3: '³' };

function segmentsOf(lab) {
  const tokens = L.lineTokens(lab);
  const sl = L.slotsOf(lab);
  const out = [];
  let prev = null;
  for (let p = 0; p < tokens.length; p += 1) {
    const t = tokens[p];
    if (t.gap) { out.push({ kind: 'gap', i: t.slot, on: true }); prev = t; continue; }
    if (t.slot != null) {
      const group = [];
      let q = p;
      while (q < tokens.length && tokens[q].slot === t.slot && !tokens[q].gap) { group.push(tokens[q]); q += 1; }
      if (sl[t.slot]?.needsTimes && !lab.choices[t.slot]?.times) out.push({ kind: 'gap', i: t.slot, on: false });
      out.push({ kind: 'slot', i: t.slot, tokens: group });
      p = q - 1; prev = group[group.length - 1];
      continue;
    }
    out.push({ kind: 'fixed', t, prev });
    prev = t;
  }
  return out;
}

const glyph = (t) => (t.k === 'num' ? t.s.replace('.', ',') : t.k === '(' ? '(' : t.k === ')' ? ')' : t.k === 'pow' ? SUP[t.n] : t.k === 'hole' ? '' : t.s === '-' ? '−' : t.s === '*' ? '×' : t.s);

function Fixed({ t, prev }) {
  if (t.k === 'op') {
    const binary = prev && (prev.k === 'num' || prev.k === ')' || prev.k === 'pow');
    const spaced = binary && t.s !== '/';
    return <span className={spaced ? 'mx-1.5' : ''}>{glyph(t)}</span>;
  }
  if (t.k === 'pow') return <sup className="text-[0.7em] leading-none">{SUP[t.n]}</sup>;
  return <span>{glyph(t)}</span>;
}

export default function LineRow({ lab, k, onBrackets, onTimes, guilty = null, coachSlot = null, coachGap = null }) {
  const segs = segmentsOf(lab);
  const length = L.lineTokens(lab).length;
  const fs = Math.max(20, Math.min(30, 31 - Math.max(0, length - 11) * 0.8));
  const sl = L.slotsOf(lab);
  return (
    <div className="flex min-h-[56px] items-center justify-center rounded-2xl border-2 border-slate-300 bg-white px-3 py-1" data-mr-line-box>
      <div dir="ltr" data-mr-line role="group" aria-label={k('lineAria')} className="flex flex-wrap items-center justify-center gap-y-1 font-black tabular-nums text-slate-900" style={{ fontSize: fs }}>
        {segs.map((s, n) => {
          if (s.kind === 'fixed') return <Fixed key={n} t={s.t} prev={s.prev} />;
          const c = lab.choices[s.i] ?? {};
          if (s.kind === 'gap') {
            return (
              <button key={n} type="button" data-mr-times={s.i} data-on={s.on ? 'true' : 'false'} data-coach={coachGap === s.i ? '' : undefined} onClick={() => onTimes(s.i)}
                aria-pressed={s.on} aria-label={k('timesAria', { i: s.i + 1, state: s.on ? k('timesOn') : k('timesOff') })}
                className={`mx-0.5 inline-flex min-h-[44px] min-w-[26px] items-center justify-center rounded-lg px-0.5 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${s.on ? 'text-slate-900' : 'border-2 border-dashed border-slate-300 text-transparent hover:border-indigo-400'} ${coachGap === s.i ? 'mr-coach' : ''}`}>
                ×
              </button>
            );
          }
          const filled = s.tokens[0]?.k !== 'hole';
          const neg = filled && lab.env[sl[s.i].name] && sign(lab.env[sl[s.i].name].v) < 0;
          const bad = guilty === s.i;
          return (
            <button key={n} type="button" data-mr-slot={s.i} data-brackets={c.brackets ? 'true' : 'false'} data-guilty={bad ? 'true' : 'false'} onClick={() => onBrackets(s.i)}
              aria-pressed={!!c.brackets} disabled={!filled}
              aria-label={k('slotAria', { i: s.i + 1, l: sl[s.i].name, state: filled ? (c.brackets ? k('slotBrackets') : k('slotBare')) : k('slotEmpty') })}
              className={`mx-0.5 inline-flex min-h-[44px] items-center rounded-xl border-2 px-1.5 outline-none transition-colors focus-visible:ring-4 focus-visible:ring-indigo-300 ${coachSlot === s.i ? 'mr-coach' : ''} ${bad ? 'border-amber-500 bg-amber-100 ring-4 ring-amber-300/70 mr-shake' : filled ? (neg ? 'border-rose-300 bg-rose-50 hover:border-rose-500' : 'border-teal-300 bg-teal-50 hover:border-teal-500') : 'border-dashed border-slate-300 bg-slate-50'}`}>
              {filled ? s.tokens.map((t, j) => <Fixed key={j} t={t} prev={s.tokens[j - 1] ?? null} />) : <span className="px-2 text-base font-black text-slate-400">{sl[s.i].name}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
