import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Droplets, FlaskConical, Sparkles } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { ChoiceGrid } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LiquidContainer, { containerLip } from '../components/LiquidContainer';

/**
 * Module 1 V2 — « Qui contient le plus ? » : une mini-expérience.
 *
 *   PRÉDIRE → MANIPULER → OBSERVER → DÉCOUVRIR → EXPÉRIMENTER → COMPRENDRE
 *
 * Capacités réelles (en mL), JAMAIS affichées avant la fin de l'expérience :
 * la cruche, plus large, SEMBLE contenir plus que la bouteille haute et fine
 * — c'est le piège que le transvasement doit faire découvrir.
 *
 * Règle d'animation : le geste d'abord, le nombre ensuite (voir MeasureFillMission).
 * État mathématique (volumes, compteurs) ≠ état d'animation (phase, progression).
 */
const BOTTLE_CAP = 1200;
const JUG_CAP = 900;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/** Progression 0→1 pilotée par requestAnimationFrame (le niveau suit le geste). */
function tween(ms, onFrame) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      onFrame(p);
      if (p < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
}
function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const on = (e) => setNarrow(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

/* ── géométrie des récipients (fractions de leur boîte, viewBox 160×210) ── */
const BOTTLE_MOUTH = { x: 0.6, y: 8 / 210 };   // bord droit du goulot : pivot du versement
const GLASS_LIP = { x: 0.775, y: 40 / 210 };    // bord droit du verre
const JUG_IN = { x: 60 / 160, y: 20 / 210 };    // point de chute du filet dans la cruche (streamX, top-34)
const BUCKET_IN = { x: 80 / 160, y: 12 / 210 }; // idem pour le seau
const POUR_ROTATION = 52;

const PREDICTIONS = [
  { emoji: '🍶', label: 'La bouteille' },
  { emoji: '🫗', label: 'La cruche' },
  { emoji: '⚖️', label: 'Pareil' },
];

/* ══ Étape 1 — la bouteille ou la cruche ? ═══════════════════════════ */
function PourExperiment({ solved, onSolved, react }) {
  const reduced = useReducedMotion();
  const narrow = useNarrow();
  const k = reduced ? 0.3 : 1;
  const H = narrow ? 180 : 240;

  const [predicted, setPredicted] = useState(null);
  const [phase, setPhase] = useState(solved ? 'done' : 'idle'); // idle → lift → move → tilt → pour → overflow → return → done
  const [p, setP] = useState(solved ? 1 : 0);                    // progression du versement
  const [geo, setGeo] = useState({ dx: 0, dy: 0, hover: 0 });
  const [ripple, setRipple] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const bottleRef = useRef(null);
  const jugAnchorRef = useRef(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const pouring = ['pour', 'overflow', 'return', 'done'].includes(phase);
  const bottleFill = pouring ? 1 - p : 1;
  const jugFill = pouring ? Math.min(1, (p * BOTTLE_CAP) / JUG_CAP) : 0;
  const spilling = pouring && p * BOTTLE_CAP > JUG_CAP;
  const overflowVisible = spilling && (phase === 'pour' || phase === 'overflow' || phase === 'return');

  async function runExperiment() {
    if (phase !== 'idle') return;
    const b = bottleRef.current?.getBoundingClientRect();
    const a = jugAnchorRef.current?.getBoundingClientRect();
    if (b && a) {
      setGeo({ dx: a.left - (b.left + b.width * BOTTLE_MOUTH.x), dy: a.top - (b.top + b.height * BOTTLE_MOUTH.y), hover: b.height * 0.55 });
    }
    setPhase('lift'); await wait(200 * k); if (!alive.current) return;
    setPhase('move'); await wait(320 * k); if (!alive.current) return;
    setPhase('tilt'); await wait(280 * k); if (!alive.current) return;
    setPhase('pour');
    await tween(1100 * k, (v) => { if (alive.current) setP(v); }); if (!alive.current) return;
    setPhase('overflow'); setRipple(true); react?.(true);
    await wait(700 * k); if (!alive.current) return;
    setRipple(false);
    setPhase('return'); await wait(360 * k); if (!alive.current) return;
    setPhase('done');
  }

  const bottleMotion = (() => {
    switch (phase) {
      case 'lift': return { x: 0, y: -14, rotate: 0 };
      case 'move': return { x: geo.dx, y: geo.dy - geo.hover, rotate: 0 };
      case 'tilt': case 'pour': case 'overflow': return { x: geo.dx, y: geo.dy, rotate: POUR_ROTATION };
      default: return { x: 0, y: 0, rotate: 0 };
    }
  })();
  const dur = ({ lift: 0.2, move: 0.32, tilt: 0.28, return: 0.36 }[phase] ?? 0.3) * k;

  const predictionText = predicted != null ? PREDICTIONS[predicted].label.toLowerCase() : null;

  return (
    <div className="space-y-5">
      {/* 1. hypothèse */}
      <div className="space-y-3">
        <p className="font-space font-bold text-slate-800 text-base">🤔 À ton avis ?</p>
        <ChoiceGrid
          options={PREDICTIONS}
          selected={predicted}
          onSelect={(i) => { if (phase === 'idle') setPredicted(i); }}
          revealed={false}
          cols={3}
          disabled={phase !== 'idle'}
          renderOption={(o) => (
            <span className="flex flex-col items-center gap-1 py-1 w-full">
              <span className="text-3xl" aria-hidden="true">{o.emoji}</span>
              <span className="font-bold text-slate-800 text-sm">{o.label}</span>
            </span>
          )}
        />
        {predicted != null && phase === 'idle' && (
          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-slate-600 text-center">
            Voyons si ton intuition a raison…
          </motion.p>
        )}
      </div>

      {/* 2. la paillasse */}
      <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-b from-sky-50/80 via-white to-slate-50 px-3 py-6 sm:px-8">
        <div className="flex items-end justify-center gap-6 sm:gap-14">
          <motion.div
            ref={bottleRef}
            className="relative"
            style={{ transformOrigin: `${BOTTLE_MOUTH.x * 100}% ${BOTTLE_MOUTH.y * 100}%`, zIndex: phase !== 'idle' && phase !== 'done' ? 30 : 1 }}
            initial={false}
            animate={bottleMotion}
            transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
          >
            <LiquidContainer shape="bottle" fillPct={bottleFill} height={H} ariaLabel={`Bouteille ${bottleFill > 0.98 ? 'pleine' : bottleFill < 0.02 ? 'vide' : 'en train de se vider'}`} />
          </motion.div>
          <motion.div className="relative" animate={celebrate ? { scale: [1, 1.05, 1] } : { scale: 1 }} transition={{ duration: 0.5 }}>
            <div ref={jugAnchorRef} aria-hidden="true" className="absolute w-px h-px" style={{ left: `${JUG_IN.x * 100}%`, top: `${JUG_IN.y * 100}%` }} />
            <LiquidContainer
              shape="jug"
              fillPct={jugFill}
              height={H}
              streamIn={phase === 'pour'}
              overflowing={overflowVisible}
              ripple={ripple}
              ariaLabel={`Cruche ${jugFill >= 1 ? 'pleine' : jugFill > 0 ? 'en train de se remplir' : 'vide'}${spilling ? ', elle déborde' : ''}`}
            />
            {celebrate && (
              <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 1.4] }} transition={{ duration: 0.9 }} className="absolute -top-3 right-2 text-amber-400" aria-hidden="true">
                <Sparkles className="w-7 h-7" />
              </motion.div>
            )}
          </motion.div>
        </div>
        <div className="flex justify-center gap-14 sm:gap-24 mt-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
          <span>Bouteille</span><span>Cruche</span>
        </div>

        {/* 3. lancer l'expérience */}
        {phase === 'idle' && !solved && (
          <div className="flex justify-center mt-5">
            <button
              type="button"
              onClick={runExperiment}
              disabled={predicted == null}
              aria-label="Vérifier par transvasement : verser la bouteille dans la cruche"
              className="inline-flex items-center gap-2.5 min-h-[56px] px-7 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-space font-bold text-base shadow-md active:scale-[0.98] disabled:opacity-40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <FlaskConical className="w-5 h-5" aria-hidden="true" /> Vérifier par transvasement
            </button>
          </div>
        )}
        {predicted == null && phase === 'idle' && !solved && (
          <p className="text-center text-xs text-slate-400 mt-2">Choisis d’abord ton hypothèse.</p>
        )}

        {/* 4. observer */}
        <AnimatePresence>
          {(phase === 'overflow' || phase === 'return' || phase === 'done') && (
            <motion.div key="spill" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-center font-space font-extrabold text-xl text-sky-800">
              💦 La cruche déborde !
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. découvrir, puis comprendre */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div key="discover" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.3 }} className="space-y-4">
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-1">
              <div className="font-space font-extrabold text-amber-900">Surprise !</div>
              <p className="text-sm text-amber-900">
                La bouteille contenait <strong>plus</strong> d’eau que la cruche. <strong>La forme du récipient peut tromper notre œil.</strong>
              </p>
              {predictionText && (
                <p className="text-xs text-amber-800/80 pt-1">
                  Ton intuition disait : <em>{predictionText}</em> — l’expérience a tranché.
                </p>
              )}
            </div>

            <TapQuestion
              prompt="Alors, laquelle contient le plus ?"
              options={['🍶 La bouteille', '🫗 La cruche', '⚖️ Elles contiennent pareil']}
              correct={0}
              cols={3}
              solved={solved}
              explain="🎯 Exact ! Tu as vérifié au lieu de te fier à la forme : la bouteille, haute et fine, contient plus que la cruche, large mais peu profonde."
              explainWrong="Regarde encore le résultat du transvasement : la cruche n’a pas pu contenir toute l’eau de la bouteille. C’est donc la bouteille qui contient le plus — la forme a trompé ton œil."
              onAnswered={(ok) => {
                if (ok) { setCelebrate(true); setRipple(true); setTimeout(() => { setCelebrate(false); setRipple(false); }, 900); }
                onSolved?.();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══ Étape 2 — l'enquête : comparer deux inconnus avec le MÊME verre ══ */
// Capacités en « verres » — jamais affichées : l'élève les découvre en mesurant.
const CAP = { A: 6, B: 4 };
const METHODS = [
  { id: 'look', emoji: '👀', label: 'Regarder les formes' },
  { id: 'pour', emoji: '🫗', label: 'Verser A dans B' },
  { id: 'glass', emoji: '🥛', label: 'Utiliser le même verre' },
];
const METHOD_FEEDBACK = {
  look: '👀 Attention : la forme peut tromper ton œil. Essaie de mesurer avec le même verre.',
  pour: '🫗 Ça dit seulement lequel déborde… pas de combien. Essaie de mesurer avec le même verre.',
};
const LAB_CHEER = ['💧 Mesure encore.', '🥛 Encore un verre !', '👀 Compte les verres.'];

function MiniGlass({ pop }) {
  return (
    <motion.div initial={pop ? { scale: 0.3, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
      <LiquidContainer shape="glass" fillPct={1} height={40} ariaLabel="un verre mesuré" />
    </motion.div>
  );
}

function CompareLab({ solved, onSolved, react }) {
  const reduced = useReducedMotion();
  const narrow = useNarrow();
  const k = reduced ? 0.3 : 1;

  const [method, setMethod] = useState(null);            // id choisi
  const [methodOk, setMethodOk] = useState(solved);     // le verre a été choisi
  const [measured, setMeasured] = useState(solved ? { A: CAP.A, B: CAP.B } : { A: 0, B: 0 }); // état mathématique
  const [phase, setPhase] = useState('idle');           // idle | move | tilt | fill | untilt | carry | return
  const [target, setTarget] = useState(null);           // 'A' | 'B'
  const [p, setP] = useState(0);                        // progression du remplissage
  const [geo, setGeo] = useState({ toX: 0, toY: 0, rowX: 0, rowY: 0 });
  const [ripple, setRipple] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [answered, setAnswered] = useState(solved);
  const glassRef = useRef(null);
  const contRef = { A: useRef(null), B: useRef(null) };
  const rowRef = { A: useRef(null), B: useRef(null) };
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const busy = phase !== 'idle';
  const allDone = measured.A >= CAP.A && measured.B >= CAP.B;
  const H = narrow ? 170 : 210;
  const shapes = { A: 'tall', B: 'bowl' };
  const lipSide = { A: 'right', B: 'left' };
  const tiltDeg = { A: 38, B: -38 };

  const containerFill = (c) => {
    const n = measured[c] + (target === c && phase === 'fill' ? p : 0);
    return Math.max(0, 1 - n / CAP[c]);
  };
  const glassFill = phase === 'fill' ? p : phase === 'untilt' || phase === 'carry' ? 1 : 0;

  async function measure(c) {
    if (busy || !methodOk || measured[c] >= CAP[c] || allDone) return;
    const g = glassRef.current?.getBoundingClientRect();
    const ct = contRef[c].current?.getBoundingClientRect();
    const row = rowRef[c].current?.getBoundingClientRect();
    if (g && ct && row) {
      const [lx, ly] = containerLip(shapes[c], lipSide[c]);
      // le verre se place sous la lèvre du récipient, de son côté
      const lipX = ct.left + ct.width * lx;
      const lipY = ct.top + ct.height * ly;
      const mouthX = c === 'A' ? lipX + g.width * 0.42 : lipX - g.width * 0.42;
      const toX = mouthX - (g.left + g.width / 2);
      const toY = lipY + 26 - (g.top + g.height * 0.19);
      // puis il est posé au bout de la rangée
      const slot = measured[c];
      const rowX = row.left + 14 + slot * 34 - (g.left + g.width / 2);
      const rowY = row.top + 20 - (g.top + g.height / 2);
      setGeo({ toX, toY, rowX, rowY });
    }
    setTarget(c);
    setPhase('move'); await wait(280 * k); if (!alive.current) return;
    setPhase('tilt'); await wait(220 * k); if (!alive.current) return;
    setPhase('fill'); setRipple(true);
    await tween(600 * k, (v) => { if (alive.current) setP(v); }); if (!alive.current) return;
    setRipple(false);
    setPhase('untilt'); await wait(200 * k); if (!alive.current) return;
    setPhase('carry'); await wait(300 * k); if (!alive.current) return;
    // le geste est fini → on commet : un verre de plus dans la rangée, un verre de moins dans le récipient
    setMeasured((m) => ({ ...m, [c]: m[c] + 1 }));
    setP(0);
    setPhase('return'); await wait(220 * k); if (!alive.current) return;
    setPhase('idle'); setTarget(null);
    react?.(true);
  }

  const glassMotion = (() => {
    switch (phase) {
      case 'move': case 'tilt': case 'fill': case 'untilt': return { x: geo.toX, y: geo.toY, scale: 1, opacity: 1 };
      case 'carry': return { x: geo.rowX, y: geo.rowY, scale: 0.22, opacity: 0.9 };
      case 'return': return { x: 0, y: 0, scale: 1, opacity: [0, 1] };
      default: return { x: 0, y: 0, scale: 1, opacity: 1 };
    }
  })();
  const glassDur = ({ move: 0.28, carry: 0.3, return: 0.22 }[phase] ?? 0.2) * k;
  const contMotion = (c) => (target === c && (phase === 'tilt' || phase === 'fill') ? { rotate: tiltDeg[c] } : { rotate: 0 });
  const cheer = allDone ? null : measured.A + measured.B === 0 ? null : measured.A >= CAP.A || measured.B >= CAP.B ? LAB_CHEER[2] : LAB_CHEER[(measured.A + measured.B) % 2];

  // fonction de rendu (pas un composant local : un composant redéfini à chaque
  // rendu serait remonté, ce qui casserait les animations et les refs)
  const renderContainer = (c) => {
    const [lx, ly] = containerLip(shapes[c], lipSide[c]);
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500">{c === 'A' ? '🍶 Récipient A' : '🫗 Récipient B'}</div>
        <motion.div ref={contRef[c]} style={{ transformOrigin: `${lx * 100}% ${ly * 100}%` }} initial={false} animate={contMotion(c)} transition={{ duration: 0.22 * k, ease: [0.22, 1, 0.36, 1] }}>
          <LiquidContainer shape={shapes[c]} fillPct={containerFill(c)} height={H} ariaLabel={`Récipient ${c}, ${Math.round(containerFill(c) * 100)} % de son eau restante`} />
        </motion.div>
        {methodOk && !answered && (
          <button
            type="button"
            onClick={() => measure(c)}
            disabled={busy || measured[c] >= CAP[c] || allDone}
            aria-label={`Mesurer un verre dans le récipient ${c}`}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-sky-600 text-white font-mono text-xs font-bold shadow-sm hover:bg-sky-700 disabled:opacity-35 disabled:hover:bg-sky-600 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            🥛 Mesurer {c}
          </button>
        )}
        {/* rangée de verres mesurés — le nombre se VOIT avant d'être écrit */}
        <div ref={rowRef[c]} className={`w-full min-h-[52px] rounded-2xl border-2 px-2 py-1.5 flex flex-wrap items-end gap-[6px] transition-colors ${celebrate && c === 'A' ? 'border-emerald-400 bg-emerald-50' : 'border-dashed border-slate-200 bg-white/70'}`} aria-label={`Verres mesurés dans ${c} : ${measured[c]}`}>
          {Array.from({ length: measured[c] }, (_, i) => (
            <motion.div key={i} animate={celebrate ? { y: [0, -6, 0] } : { y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
              <MiniGlass pop={!solved} />
            </motion.div>
          ))}
          {measured[c] === 0 && <span className="text-[11px] text-slate-400 self-center">Les verres mesurés s’alignent ici.</span>}
        </div>
        {allDone && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.4 }} className="font-mono font-extrabold text-slate-800 tabular-nums">
            {c} → {measured[c]} verres
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-700">
        Ces deux récipients ont des formes différentes. <strong>Lequel contient le plus ?</strong> Trouve une façon de vérifier.
      </p>

      {/* phase 1 — la méthode */}
      {!methodOk && (
        <div className="space-y-3">
          <p className="font-space font-bold text-slate-800">🤔 Comment pourrais-tu vérifier ?</p>
          <ChoiceGrid
            options={METHODS}
            selected={method == null ? null : METHODS.findIndex((m) => m.id === method)}
            onSelect={(i) => {
              const id = METHODS[i].id;
              setMethod(id);
              if (id === 'glass') { react?.(true); setMethodOk(true); } else react?.(false);
            }}
            revealed={false}
            cols={3}
            renderOption={(o) => (
              <span className="flex flex-col items-center gap-1 py-1 w-full">
                <span className="text-3xl" aria-hidden="true">{o.emoji}</span>
                <span className="font-bold text-slate-800 text-sm text-center">{o.label}</span>
              </span>
            )}
          />
          {method && method !== 'glass' && (
            <motion.p key={method} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              {METHOD_FEEDBACK[method]}
            </motion.p>
          )}
        </div>
      )}
      {methodOk && !solved && !answered && measured.A + measured.B === 0 && (
        <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          💡 Bonne idée ! Utilisons <strong>toujours le même verre</strong>. Mesure A, puis B.
        </motion.p>
      )}

      {/* phase 2 — la paillasse : A | verre | B (sur mobile : verre, puis A, puis B) */}
      <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-b from-sky-50/80 via-white to-slate-50 px-3 py-5 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-5 sm:gap-6 items-start">
          <div className="order-2 sm:order-1">{renderContainer('A')}</div>
          <div className="order-1 sm:order-2 flex flex-col items-center gap-2 sm:pt-7">
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500">🥛 Ton verre de mesure</div>
            <motion.div ref={glassRef} className="relative" style={{ zIndex: busy ? 30 : 1 }} initial={false} animate={glassMotion} transition={{ duration: glassDur, ease: [0.22, 1, 0.36, 1] }}>
              <LiquidContainer shape="glass" fillPct={glassFill} height={narrow ? 120 : 140} graduations={[{ pct: 0.9 }]} streamIn={phase === 'fill'} ripple={ripple} ariaLabel={`Verre de mesure ${glassFill >= 1 ? 'plein' : glassFill > 0 ? 'en train de se remplir' : 'vide'}`} />
            </motion.div>
            <div className="text-[11px] text-slate-400 text-center">Toujours le même.</div>
          </div>
          <div className="order-3">{renderContainer('B')}</div>
        </div>

        <AnimatePresence mode="wait">
          {cheer && !busy && (
            <motion.div key={cheer + measured.A + measured.B} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 text-center font-space font-extrabold text-lg text-sky-800">
              {cheer}
            </motion.div>
          )}
        </AnimatePresence>
        {celebrate && (
          <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 1.4] }} transition={{ duration: 0.9 }} className="absolute top-3 right-4 text-amber-400" aria-hidden="true">
            <Sparkles className="w-7 h-7" />
          </motion.div>
        )}
      </div>

      {/* phase 3 — conclure */}
      {allDone && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.6 }} className="space-y-4">
          <TapQuestion
            prompt="Alors, lequel contient le plus ?"
            options={['🍶 A', '🫗 B', '⚖️ Pareil']}
            correct={0}
            cols={3}
            solved={solved}
            explain={
              <>
                🎯 Bien joué ! Le récipient A a rempli <strong>{CAP.A} verres</strong>, le récipient B <strong>{CAP.B} verres</strong>. Comme nous avons
                utilisé exactement le même verre, nous pouvons comparer les deux contenances : <strong>le même verre nous sert d’unité de mesure.</strong>
              </>
            }
            explainWrong={
              <>
                Compte les verres : A en a rempli <strong>{CAP.A}</strong>, B seulement <strong>{CAP.B}</strong>. Avec le même verre, la comparaison est juste —
                c’est A qui contient le plus. <strong>Le même verre nous sert d’unité de mesure.</strong>
              </>
            }
            onAnswered={(ok) => {
              setAnswered(true);
              if (ok) { setCelebrate(true); setTimeout(() => setCelebrate(false), 1200); }
              onSolved?.();
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

/* ══ Module ═════════════════════════════════════════════════════════ */
export default function Module01Mission() {
  const [pourDone, setPourDone] = useState(false);
  const [freeDone, setFreeDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Mission : lequel contient le plus ?"
      moduleSubtitle="Une bouteille, une cruche : laquelle contient le plus d’eau ?"
      estimatedTime="8 min"
      brief={{
        tag: '🔎 Défi 01',
        title: 'Qui contient le plus ?',
        body: <p>Ton œil peut-il trouver la réponse ? Fais une hypothèse… puis vérifie-la par l’expérience.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Qui contient le plus ?',
          subtitle: 'Ton œil peut-il trouver la réponse ?',
          done: pourDone,
          content: (kit) => <PourExperiment solved={pourDone} onSolved={() => setPourDone(true)} react={kit.react} />,
        },
        {
          num: 2,
          title: '🕵️ À toi de trouver !',
          subtitle: 'Deux récipients inconnus. Trouve une méthode pour les comparer.',
          done: freeDone,
          content: (kit) => <CompareLab solved={freeDone} onSolved={() => setFreeDone(true)} react={kit.react} />,
        },
      ]}
      footer={
        <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Droplets className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Tu sais comparer des contenances : en transvasant, ou en comptant des verres identiques. Prochaine étape :
            donner un nom à cette unité, et la mesurer vraiment.
          </p>
        </div>
      }
    />
  );
}
