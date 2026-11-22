import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, Info, Timer as TimerIcon, Volume2, VolumeX, Flame, BookOpen } from 'lucide-react';
import { useLessonChrome } from '../hooks/useLessonChrome';
import MathLabel from './MathLabel';
import { withoutBookRef } from '../textbook/bookRef';

/**
 * Briques d'interface partagées par les leçons Smarter Academy.
 * Toutes les classes Tailwind sont écrites en toutes lettres (pas
 * d'interpolation) pour rester détectables au build. Seule exception :
 * une classe peut être composée à partir d'une variable si TOUTES ses
 * valeurs possibles existent littéralement ailleurs dans la source — c'est
 * le cas des tables de décalage de utils/lessonChrome.js.
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
    prefixKey: 'feedback.correct',
  },
  ko: {
    wrap: 'bg-rose-50 border-rose-200 text-rose-800',
    Icon: XCircle,
    prefixKey: 'feedback.toReview',
  },
  hint: {
    wrap: 'bg-amber-50 border-amber-200 text-amber-900',
    Icon: Lightbulb,
    prefixKey: 'feedback.hint',
  },
  info: {
    wrap: 'bg-slate-50 border-slate-200 text-slate-700',
    Icon: Info,
    prefixKey: 'feedback.info',
  },
};

/**
 * Le retour ne repose jamais sur la seule couleur : icône + mot-clé explicite.
 */
export function Feedback({ tone = 'info', children, className = '' }) {
  const { t } = useTranslation('lesson');
  const toneSpec = FEEDBACK_TONES[tone] || FEEDBACK_TONES.info;
  const { Icon } = toneSpec;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${toneSpec.wrap} ${className}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <span className="sr-only">{t(toneSpec.prefixKey)} : </span>
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
  order,          // optionnel : ordre d'AFFICHAGE (indices d'options) ; `selected`,
                  // `correctIndex` et `onSelect` restent dans l'indexation de l'auteur
}) {
  const grid = cols === 1 ? 'grid-cols-1' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2';
  const shown = order && order.length === options.length ? order : options.map((_, i) => i);

  return (
    <div className={`grid ${grid} gap-2`} role="group">
      {shown.map((i) => {
        const opt = options[i];
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
            className={`text-start px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tone}`}
          >
            <span className="flex items-center gap-2">
              {isRight && <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />}
              {isWrongPick && <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span>{renderOption ? renderOption(opt) : (typeof opt === 'string' ? <MathLabel>{opt}</MathLabel> : opt)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Bouton de validation ─────────────────────────────────────────── */
export function ValidateButton({ onClick, disabled, children, tone = 'blue' }) {
  const { t } = useTranslation('lesson');
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
      {children ?? t('question.validate')}
    </button>
  );
}

/* ── Étape d'un module ────────────────────────────────────────────── */
export function StepCard({ num, title, subtitle, done, locked, children, tone = 'slate', collapsible = false, collapsed = false, onToggle }) {
  const { t } = useTranslation('lesson');
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
          <MathLabel>{title}</MathLabel> — <span className="font-mono text-xs">{t('step.finishPreviousStep')}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      id={anchorId}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      data-step-collapsed={collapsible ? String(collapsed) : undefined}
      className={`border-2 rounded-2xl space-y-4 scroll-mt-24 ${collapsed ? 'px-5 py-3' : 'p-6'} ${
        done ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`w-8 h-8 rounded-lg ${badgeTone} font-mono font-bold text-xs flex items-center justify-center shrink-0`}>
          {done ? '✓' : num}
        </span>
        <div className="flex-1">
          <h3 className="font-space font-bold text-slate-800 leading-snug"><MathLabel>{title}</MathLabel></h3>
          {subtitle && !collapsed && <p className="text-slate-500 mt-0.5 leading-relaxed text-sm"><MathLabel>{subtitle}</MathLabel></p>}
        </div>
        {collapsible && collapsed && (
          <button type="button" onClick={onToggle} aria-expanded={false} className="min-h-[44px] shrink-0 rounded-lg px-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50">
            {t('focus.reopen')} <span aria-hidden="true">▾</span>
          </button>
        )}
      </div>
      {/* Repliable (regard « focus ») : le contenu reste MONTÉ dans le même nœud — replier ne remet rien à zéro. */}
      {collapsible ? <div className="space-y-4" hidden={collapsed}>{children}</div> : children}
    </motion.section>
  );
}

/* ── La CARTE D'ACTIVITÉ d'un module ──────────────────────────────── */

/**
 * Les TEINTES de la carte. Une seule couleur d'accent par teinte, posée sur
 * un fond clair : la carte doit être lisible avant d'être décorative, et le
 * texte mathématique doit rester la chose la plus contrastée de l'écran.
 *
 * Les huit teintes existantes sont toutes servies. Avant, `MissionBrief` n'en
 * connaissait que trois et rendait les cinq autres en gris ardoise sans le
 * dire : la moitié des modules de l'unité demandaient une couleur qu'ils
 * n'obtenaient pas.
 */
const BRIEF_TONES = {
  indigo:  { ring: 'border-indigo-200',  wash: 'from-indigo-50',  accent: 'text-indigo-700',  chip: 'bg-indigo-600',  glyph: 'text-indigo-200' },
  violet:  { ring: 'border-violet-200',  wash: 'from-violet-50',  accent: 'text-violet-700',  chip: 'bg-violet-600',  glyph: 'text-violet-200' },
  amber:   { ring: 'border-amber-200',   wash: 'from-amber-50',   accent: 'text-amber-800',   chip: 'bg-amber-600',   glyph: 'text-amber-200' },
  emerald: { ring: 'border-emerald-200', wash: 'from-emerald-50', accent: 'text-emerald-700', chip: 'bg-emerald-600', glyph: 'text-emerald-200' },
  teal:    { ring: 'border-teal-200',    wash: 'from-teal-50',    accent: 'text-teal-700',    chip: 'bg-teal-600',    glyph: 'text-teal-200' },
  sky:     { ring: 'border-sky-200',     wash: 'from-sky-50',     accent: 'text-sky-700',     chip: 'bg-sky-600',     glyph: 'text-sky-200' },
  rose:    { ring: 'border-rose-200',    wash: 'from-rose-50',    accent: 'text-rose-700',    chip: 'bg-rose-600',    glyph: 'text-rose-200' },
  slate:   { ring: 'border-slate-200',   wash: 'from-slate-50',   accent: 'text-slate-700',   chip: 'bg-slate-700',   glyph: 'text-slate-200' },
};

/**
 * LA CARTE D'ACTIVITÉ — ce que l'élève lit avant de commencer un module.
 *
 * Elle répond à quatre questions, dans cet ordre visuel :
 *   1. d'où vient cette activité ?        → `tag` (pastille, en haut)
 *   2. qu'est-ce qu'on fait ?             → `headline` (l'accroche, optionnelle)
 *   3. quelle idée va-t-on découvrir ?    → `title` (l'objectif mathématique)
 *   4. quelle est la situation concrète ? → `children` (l'énoncé, mot pour mot)
 *   5. sur quelle source s'appuie-t-elle ?→ `footer` (SourceTag, optionnel)
 *
 * ELLE EST DIRIGÉE PAR LES DONNÉES, jamais par la leçon. Aucun contexte
 * particulier n'est codé ici : le football, la bibliothèque ou les fleurs
 * arrivent par `visual` et par le texte. Un module qui ne fournit ni accroche
 * ni visuel obtient la même carte, en plus sobre — c'est le cas des 40
 * modules existants, qui n'ont rien à changer.
 *
 * `visual` est OPTIONNEL et n'est affiché que s'il ajoute quelque chose :
 *   visual={{ src, alt }}            une illustration de contexte
 *   visual={<PitchBackdrop … />}     ou n'importe quel nœud déjà dessiné
 * Sans lui, le texte prend toute la largeur au lieu de laisser un trou.
 *
 * FOND CLAIR, PAS BLOC SOMBRE. L'ancienne carte était un rectangle sombre à
 * dégradé : l'énoncé du manuel y perdait en lisibilité, et trois teintes sur
 * huit seulement étaient honorées. Ici, un fond clair, une seule couleur
 * d'accent, une bordure fine et un lavis discret — la hiérarchie vient de la
 * typographie, pas de la saturation.
 */
export function MissionBrief({ tag: rawTag, title, headline, children, footer, visual, emoji, tone = 'slate' }) {
  const T = BRIEF_TONES[tone] ?? BRIEF_TONES.slate;
  // jamais de renvoi au manuel à l'écran (« الكتاب ص 55 ») — indépendance vis-à-vis du livre, textbook/bookRef.js
  const tag = withoutBookRef(rawTag);
  const hasVisual = Boolean(visual);

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border-2 bg-white shadow-sm ${T.ring}`}
      data-module-brief={tone}
    >
      {/* Le lavis : une profondeur légère, qui ne touche jamais au texte. */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-bl ${T.wash} to-white`} aria-hidden="true" />

      <div className={`relative flex p-6 ${hasVisual ? 'flex-row-reverse items-start gap-6' : 'flex-col gap-4'}`}>
        {hasVisual && (
          // Le visuel de CONTEXTE. Décoratif au sens strict : il aide à se
          // projeter, il ne porte aucune information mathématique — donc
          // `aria-hidden` quand il n'a pas de texte alternatif propre.
          <div className="w-44 shrink-0">
            <div className="mx-auto w-full overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-sm h-36 max-w-none">
              {visual?.src
                ? <img src={visual.src} alt={visual.alt ?? ''} aria-hidden={visual.alt ? undefined : 'true'} loading="lazy" className="block h-full w-full object-cover" />
                : <div className="h-full w-full" aria-hidden="true">{visual}</div>}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2.5">
          {tag && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold text-white ${T.chip}`}>
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {tag}
            </span>
          )}

          {headline && (
            <p className="flex items-center gap-2 font-extrabold leading-tight text-slate-900 text-2xl">
              {emoji && <span aria-hidden="true">{emoji}</span>}
              {headline}
            </p>
          )}

          {title && (
            <h2 className={`font-space font-extrabold leading-snug text-lg ${headline ? T.accent : 'text-slate-900'}`}>
              <MathLabel>{title}</MathLabel>
            </h2>
          )}

          <div className="space-y-2 leading-relaxed text-slate-700 text-base">{children}</div>

          {footer && <div className="pt-1">{footer}</div>}
        </div>
      </div>
    </section>
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
      className={`w-full text-start rounded-2xl border-2 p-4 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-slate-200 bg-white'
      } ${onClick && !disabled ? 'hover:border-slate-400 hover:shadow-sm cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl shrink-0" aria-hidden="true">{emoji}</span>
        <div className="min-w-0">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wide truncate">{label}</div>
          <div className="font-mono font-extrabold text-slate-800 tabular-nums text-xl">
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
  const { t } = useTranslation('lesson');
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2.5 text-sm text-slate-700">
        <TimerIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>
          {t('timer.label')} ({durationLabel}) <span className="text-slate-400">{t('timer.optional')}</span>
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={t('timer.label')}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
          enabled ? 'bg-blue-600' : 'bg-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${
            enabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
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
          className="pointer-events-none absolute -top-1 end-3 font-mono font-extrabold text-sm text-emerald-500 drop-shadow-sm"
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
  // Le décalage collant vient du bandeau réellement rendu au-dessus (contrat
  // lessonChrome), jamais d'un `top-16` supposé : chez l'élève connecté sur
  // grand écran il n'y a aucun en-tête, et réserver 64 px y ouvrirait un vide.
  const { stickyTopClass } = useLessonChrome();
  if (!total) return null;
  const pct = Math.round((doneCount / total) * 100);
  return (
    <div className={`sticky ${stickyTopClass} z-10 px-4 py-2 bg-slate-50/90 backdrop-blur-sm border border-slate-200 rounded-xl`}>
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span dir="ltr" className="text-[10px] font-mono font-bold text-slate-400 tabular-nums shrink-0">
          {doneCount}{'\u00A0/\u00A0'}{total}
        </span>
      </div>
    </div>
  );
}

/* ── Chip de série de bonnes réponses (session, non persistée) ───── */
export function StreakChip({ count }) {
  const { t } = useTranslation('lesson');
  if (count < 2) return null;
  return (
    <motion.div
      key={count}
      initial={{ opacity: 0, scale: 0.7, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-mono text-xs font-bold"
    >
      <Flame className="w-3.5 h-3.5" aria-hidden="true" />
      {count} {t('streak')}
    </motion.div>
  );
}

/* ── Interrupteur son + vibrations (préférence appareil) ──────────── */
export function EffectsToggle({ enabled, onToggle }) {
  const { t } = useTranslation('lesson');
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? t('effects.disable') : t('effects.enable')}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-slate-200 bg-white text-slate-500 hover:border-slate-400 transition-colors text-xs font-mono font-bold min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {enabled ? <Volume2 className="w-3.5 h-3.5" aria-hidden="true" /> : <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />}
      <span className="inline">{enabled ? t('effects.on') : t('effects.off')}</span>
    </button>
  );
}

/* ── Redirection automatique vers le module suivant ───────────────── */
/**
 * Compte à rebours annulable affiché sur l'écran de fin de module. `onGo`
 * doit naviguer immédiatement ; le composant appelle `onGo()` seul une fois
 * les `seconds` écoulées, sauf annulation.
 */
export function AutoAdvance({ seconds = 5, label, onGo }) {
  const { t } = useTranslation('lesson');
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
        {label ?? t('nav.nextModule')} {t('autoAdvance.in')} {remaining}s…
      </span>
      <button
        type="button"
        onClick={() => setCancelled(true)}
        className="underline font-semibold text-slate-500 hover:text-slate-700"
      >
        {t('autoAdvance.stayHere')}
      </button>
    </div>
  );
}
