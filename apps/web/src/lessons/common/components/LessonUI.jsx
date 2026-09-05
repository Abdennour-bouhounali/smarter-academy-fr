import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, Info, Timer as TimerIcon, Volume2, VolumeX, Flame } from 'lucide-react';

/**
 * Briques d'interface partagées par les leçons Smarter Academy.
 * Toutes les classes Tailwind sont écrites en toutes lettres (pas
 * d'interpolation) pour rester détectables au build.
 *
 * Convention de validation (à respecter dans tout module utilisant
 * ValidateButton pour déclencher onSolved) : la condition de réussite
 * DOIT être recalculée à chaque rendu à partir de l'état courant — jamais
 * mémorisée dans un booléen "déjà atteint une fois" (ex. `reachedOnce`)
 * qui resterait vrai même si l'élève s'éloigne ensuite de la cible.
 *   const atTarget = value === target;              // recalculé à chaque rendu
 *   {atTarget && <ValidateButton onClick={onSolved}>...}   // disparaît si value change
 * ou, pour une saisie validée par clic :
 *   onClick={() => { setChecked(true); if (isRight) onSolved(); }}  // isRight = const live
 * Bug de référence corrigé : grandeurs_mesures/contenances/modules/Module02Mesurer.jsx
 * (un flag `reachedOnce` gardait le bouton de confirmation actif après
 * que l'élève ait quitté la valeur cible).
 */

/* ── Retour élève ─────────────────────────────────────────────────── */
const FEEDBACK_TONES = {
  ok: {
    wrap: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    Icon: CheckCircle2,
    prefix: 'Correct',
  },
  ko: {
    wrap: 'bg-rose-50 border-rose-200 text-rose-800',
    Icon: XCircle,
    prefix: 'À revoir',
  },
  hint: {
    wrap: 'bg-amber-50 border-amber-200 text-amber-900',
    Icon: Lightbulb,
    prefix: 'Indice',
  },
  info: {
    wrap: 'bg-slate-50 border-slate-200 text-slate-700',
    Icon: Info,
    prefix: 'Info',
  },
};

/**
 * Le retour ne repose jamais sur la seule couleur : icône + mot-clé explicite.
 */
export function Feedback({ tone = 'info', children, className = '' }) {
  const t = FEEDBACK_TONES[tone] || FEEDBACK_TONES.info;
  const { Icon } = t;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${t.wrap} ${className}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <span className="sr-only">{t.prefix} : </span>
        {children}
      </div>
    </motion.div>
  );
}

/* ── Choix multiples ──────────────────────────────────────────────── */
export function ChoiceGrid({
  options,
  selected,
  onSelect,
  revealed = false,
  correctIndex,
  cols = 2,
  disabled = false,
  renderOption,
}) {
  const grid = cols === 1 ? 'grid-cols-1' : cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className={`grid ${grid} gap-2`} role="group">
      {options.map((opt, i) => {
        const isSel = selected === i;
        const isRight = revealed && i === correctIndex;
        const isWrongPick = revealed && isSel && i !== correctIndex;

        const tone = isRight
          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
          : isWrongPick
          ? 'bg-rose-50 border-rose-400 text-rose-800'
          : revealed
          ? 'bg-slate-50 border-slate-200 text-slate-400'
          : isSel
          ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-300'
          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50';

        return (
          <button
            key={i}
            type="button"
            onClick={() => !revealed && !disabled && onSelect(i)}
            disabled={revealed || disabled}
            aria-pressed={isSel}
            className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tone}`}
          >
            <span className="flex items-center gap-2">
              {isRight && <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />}
              {isWrongPick && <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span>{renderOption ? renderOption(opt) : opt}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Bouton de validation ─────────────────────────────────────────── */
export function ValidateButton({ onClick, disabled, children = 'Valider', tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    slate: 'bg-slate-800 hover:bg-slate-900',
    cyan: 'bg-cyan-600 hover:bg-cyan-700',
    teal: 'bg-teal-600 hover:bg-teal-700',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white transition-all shadow-sm min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
        disabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : tones[tone]
      }`}
    >
      {children}
    </button>
  );
}

/* ── Étape d'un module ────────────────────────────────────────────── */
export function StepCard({ num, title, subtitle, done, locked, children, tone = 'slate' }) {
  const badgeTone = done
    ? 'bg-emerald-500 text-white'
    : locked
    ? 'bg-slate-200 text-slate-400'
    : tone === 'amber'
    ? 'bg-amber-500 text-white'
    : 'bg-slate-800 text-white';

  // Stable anchor so ModuleLayout's "what's left" hint can scroll straight
  // to this step when the "Module suivant" button is disabled.
  const anchorId = `step-${num}`;

  if (locked) {
    return (
      <div id={anchorId} className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex items-center gap-3 opacity-70">
        <span className={`w-8 h-8 rounded-lg ${badgeTone} font-mono font-bold text-xs flex items-center justify-center shrink-0`}>
          {num}
        </span>
        <div className="text-sm text-slate-400">
          {title} — <span className="font-mono text-xs">termine l'étape précédente</span>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      id={anchorId}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 rounded-2xl p-5 sm:p-6 space-y-4 scroll-mt-24 ${
        done ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`w-8 h-8 rounded-lg ${badgeTone} font-mono font-bold text-xs flex items-center justify-center shrink-0`}>
          {done ? '✓' : num}
        </span>
        <div>
          <h3 className="font-space font-bold text-slate-800 leading-snug">{title}</h3>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

/* ── Bandeau narratif ─────────────────────────────────────────────── */
export function MissionBrief({ tag, title, children, tone = 'slate' }) {
  const bg =
    tone === 'amber'
      ? 'bg-gradient-to-br from-amber-900 to-amber-700'
      : tone === 'indigo'
      ? 'bg-gradient-to-br from-indigo-700 to-violet-700'
      : 'bg-slate-900';
  const accent = tone === 'amber' ? 'text-amber-300' : tone === 'indigo' ? 'text-indigo-200' : 'text-amber-400';
  const body = tone === 'amber' ? 'text-amber-100' : tone === 'indigo' ? 'text-indigo-100' : 'text-slate-300';

  return (
    <div className={`${bg} text-white rounded-2xl p-6 space-y-2`}>
      {tag && <div className={`${accent} font-mono text-xs font-bold uppercase tracking-widest`}>{tag}</div>}
      <h2 className="text-lg sm:text-xl font-space font-bold leading-snug">{title}</h2>
      <div className={`${body} text-sm leading-relaxed space-y-2`}>{children}</div>
    </div>
  );
}

/* ── Saisie d'un entier ───────────────────────────────────────────── */
export function NumberField({ value, onChange, onEnter, placeholder = '?', ariaLabel, width = 'w-full', size = 'lg' }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      aria-label={ariaLabel}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onEnter) onEnter();
      }}
      className={`${width} border-2 border-slate-300 rounded-xl px-3 py-2.5 font-mono tabular-nums text-center text-slate-800 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
        size === 'lg' ? 'text-xl min-h-[52px]' : 'text-base min-h-[44px]'
      }`}
    />
  );
}

/* ── Carte « quantité du monde réel » ─────────────────────────────── */
export function QuantityCard({ emoji, label, value, unit, selected, onClick, disabled, footer }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-slate-200 bg-white'
      } ${onClick && !disabled ? 'hover:border-slate-400 hover:shadow-sm cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl shrink-0" aria-hidden="true">{emoji}</span>
        <div className="min-w-0">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wide truncate">{label}</div>
          <div className="font-mono font-extrabold text-lg sm:text-xl text-slate-800 tabular-nums">
            {value} {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
          </div>
        </div>
      </div>
      {footer && <div className="mt-2 text-xs text-slate-500">{footer}</div>}
    </Wrapper>
  );
}

/* ── Chronomètre d'évaluation (activable/désactivable) ───────────────── */
/**
 * Bandeau de contrôle du chronomètre, à afficher avant que le test démarre.
 * L'élève choisit d'activer ou non le temps limité — indépendant du reste
 * du test, qui se déroule à l'identique dans les deux cas.
 */
export function TimerToggle({ enabled, onChange, durationLabel, disabled = false }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2.5 text-sm text-slate-700">
        <TimerIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>
          Chronomètre ({durationLabel}) <span className="text-slate-400">— facultatif</span>
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
          enabled ? 'bg-blue-600' : 'bg-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

/** Chrono affiché pendant le test — sobre, jamais alarmiste avant la fin. */
export function TimerDisplay({ label, urgent = false }) {
  return (
    <div
      role="timer"
      className={`inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 font-mono text-sm font-bold tabular-nums ${
        urgent ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-700'
      }`}
    >
      <TimerIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
      {label}
    </div>
  );
}

/* ── Micro-célébration : gain d'XP flottant ───────────────────────── */
/**
 * Petit "+N XP" qui monte et s'efface, à monter juste à côté d'une réponse
 * correcte. `tick` doit être une valeur qui change UNE FOIS par réponse
 * correcte de CETTE question précise (ex. un compteur local incrémenté dans
 * le handler onSelect) — jamais un compteur partagé entre plusieurs
 * questions, qui ferait rejouer l'animation au mauvais endroit.
 */
export function XPBurst({ amount, tick }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!tick) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 900);
    return () => clearTimeout(t);
  }, [tick]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.85 }}
          animate={{ opacity: 1, y: -22, scale: 1 }}
          exit={{ opacity: 0, y: -34 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="pointer-events-none absolute -top-1 right-3 font-mono font-extrabold text-sm text-emerald-500 drop-shadow-sm"
          aria-hidden="true"
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Bandeau de progression compact d'un module ───────────────────── */
/**
 * ●●○ — reflète les mêmes étapes que `incompleteSteps`/StepCard, en lecture
 * seule. `doneCount`/`total` : nombre d'étapes terminées sur le total.
 */
export function StepProgressBar({ doneCount, total }) {
  if (!total) return null;
  const pct = Math.round((doneCount / total) * 100);
  return (
    <div className="sticky top-16 z-10 -mx-4 px-4 py-2 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 sm:rounded-xl sm:border sm:mx-0">
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums shrink-0">
          {doneCount} / {total}
        </span>
      </div>
    </div>
  );
}

/* ── Chip de série de bonnes réponses (session, non persistée) ───── */
export function StreakChip({ count }) {
  if (count < 2) return null;
  return (
    <motion.div
      key={count}
      initial={{ opacity: 0, scale: 0.7, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-mono text-xs font-bold"
    >
      <Flame className="w-3.5 h-3.5" aria-hidden="true" />
      {count} d’affilée
    </motion.div>
  );
}

/* ── Interrupteur son + vibrations (préférence appareil) ──────────── */
export function EffectsToggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Désactiver les effets sonores' : 'Activer les effets sonores'}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-slate-200 bg-white text-slate-500 hover:border-slate-400 transition-colors text-xs font-mono font-bold min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {enabled ? <Volume2 className="w-3.5 h-3.5" aria-hidden="true" /> : <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />}
      <span className="hidden sm:inline">{enabled ? 'Sons activés' : 'Sons coupés'}</span>
    </button>
  );
}

/* ── Redirection automatique vers le module suivant ───────────────── */
/**
 * Compte à rebours annulable affiché sur l'écran de fin de module. `onGo`
 * doit naviguer immédiatement ; le composant appelle `onGo()` seul une fois
 * les `seconds` écoulées, sauf annulation.
 */
export function AutoAdvance({ seconds = 5, label = 'Module suivant', onGo }) {
  const [remaining, setRemaining] = useState(seconds);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return undefined;
    if (remaining <= 0) {
      onGo();
      return undefined;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, cancelled]);

  if (cancelled) return null;

  return (
    <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-400">
      <span>
        {label} dans {remaining}s…
      </span>
      <button
        type="button"
        onClick={() => setCancelled(true)}
        className="underline font-semibold text-slate-500 hover:text-slate-700"
      >
        Rester ici
      </button>
    </div>
  );
}
