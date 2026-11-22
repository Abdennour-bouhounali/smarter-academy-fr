import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Check, Plus } from 'lucide-react';

/**
 * The frame of the visitor's auth pages (Login, Register) — ONE wide card
 * split in two: the form on the reading side (left), and a light
 * brand panel on the other, drawn in code. Below `lg` the brand panel folds
 * away and the form takes the whole card.
 *
 * Light surfaces only (owner rule: no dark panels); the accent is the space's
 * gradient — student `#3B82F6 → #8B5CF6`, teacher `#0F766E → #3B82F6`.
 */
export const AUTH_TONES = {
  student: {
    gradient: '#3B5BDB',
    ring: 'focus:border-nav-accent focus:ring-nav-accent/15',
    link: 'text-nav-accent hover:text-nav-accent',
    wash: 'from-blue-50 via-white to-violet-50',
    dot: 'bg-blue-100 text-nav-accent',
    stroke: ['#3B82F6', '#8B5CF6'],
  },
  teacher: {
    gradient: 'linear-gradient(135deg, #0F766E, #3B82F6)',
    ring: 'focus:border-teal-600 focus:ring-teal-500/15',
    link: 'text-teal-700 hover:text-teal-800',
    wash: 'from-teal-50 via-white to-sky-50',
    dot: 'bg-teal-100 text-teal-700',
    stroke: ['#0F766E', '#3B82F6'],
  },
};

/** The shared input look for the auth forms (email, password). */
export const authInputClass = (tone = 'student') =>
  `block h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-4 ${AUTH_TONES[tone].ring}`;

/** The primary submit button of the auth forms. */
export function AuthSubmit({ tone = 'student', loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-nav-accent/30 disabled:translate-y-0 disabled:opacity-70"
      style={{ background: AUTH_TONES[tone].gradient }}
    >
      {children}
    </button>
  );
}

/** « ou » between Google and the form. */
export function AuthDivider() {
  const { t } = useTranslation('auth');
  return (
    <div className="my-7 flex items-center gap-4">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-xs font-medium text-slate-400">{t('common:or')}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

/**
 * « Programme officiel du collège, de la 6e à la 3e » — the programme
 * promise, as a badge where it is read first: at the top of the brand panel,
 * and (below `lg`, where that panel folds away) above the form title.
 */
function ProgrammeBadge({ tone, className = '' }) {
  const { t } = useTranslation('auth');
  const colors = AUTH_TONES[tone];
  return (
    <p className={`inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3.5 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ${className}`}>
      <BadgeCheck size={17} className={colors.dot.split(' ').find((c) => c.startsWith('text-'))} aria-hidden="true" />
      {t('shell.programme')}
    </p>
  );
}

/**
 * The brand panel's drawing — a right triangle on a grid, its circumscribed
 * circle and a curve: objects of the 3e programme, drawn, not generated.
 */
function BrandFigure({ stroke }) {
  const [from, to] = stroke;
  return (
    <svg viewBox="0 0 320 220" className="w-full max-w-sm" aria-hidden="true">
      <defs>
        <linearGradient id="auth-figure-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <pattern id="auth-figure-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#CBD5E1" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="320" height="220" rx="18" fill="url(#auth-figure-grid)" opacity="0.7" />
      <circle cx="160" cy="120" r="78" fill="none" stroke="url(#auth-figure-stroke)" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.7" />
      <path d="M82 120 L238 120 L110 52 Z" fill={from} fillOpacity="0.08" stroke="url(#auth-figure-stroke)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 190 C 90 190, 110 140, 160 140 S 240 70, 300 40" fill="none" stroke="url(#auth-figure-stroke)" strokeWidth="2" opacity="0.5" />
      {[[82, 120], [238, 120], [110, 52]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill="#fff" stroke={to} strokeWidth="2" />
      ))}
      <circle cx="160" cy="120" r="3" fill={from} />
    </svg>
  );
}

function BrandPanel({ tone, audience }) {
  const { t } = useTranslation('auth');
  const colors = AUTH_TONES[tone];
  const points = [1, 2, 3].map((n) => t(`shell.${audience}.point${n}`));

  return (
    <aside className={`relative hidden overflow-hidden bg-gradient-to-br ${colors.wash} p-12 lg:flex lg:flex-col lg:justify-between`}>
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-25 blur-3xl" style={{ background: colors.gradient }} />
      <div className="relative flex flex-col items-center text-center">
        <ProgrammeBadge tone={tone} />
        <h2 className="mt-6 font-display text-3xl font-bold leading-snug text-slate-900 [text-wrap:balance] xl:text-[2.1rem]">
          {t(`shell.${audience}.title`)}
        </h2>
        {/* Title and badge are centred; the feature list stays on the
            reading edge. */}
        <ul className="mt-8 space-y-4 self-stretch text-start">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-[15px] text-slate-700">
              <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${colors.dot}`}>
                <Check size={14} strokeWidth={2.5} />
              </span>
              {point}
            </li>
          ))}
          <li className="flex items-center gap-3 text-[15px] font-medium text-slate-500">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400">
              <Plus size={14} strokeWidth={2.5} />
            </span>
            {t('shell.more')}
          </li>
        </ul>
      </div>
      <div className="relative mt-10 flex justify-center">
        <BrandFigure stroke={colors.stroke} />
      </div>
    </aside>
  );
}

/**
 * @param {{
 *   tone?: 'student'|'teacher',        accent (teacher registration uses teal)
 *   audience?: 'student'|'teacher',    which brand-panel copy to show
 *   title: string, subtitle?: string,
 *   plain?: boolean,                   a reading page (the class-join link): ONE
 *                                      column, no brand panel and no programme
 *                                      badge — those sell the product on login /
 *                                      register; here they only push the class
 *                                      and the consent text aside (owner, 2026-10-01)
 *   children: React.ReactNode, footer?: React.ReactNode,
 * }} props
 */
export default function AuthShell({ tone = 'student', audience = tone, title, subtitle, children, footer, plain = false }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFAFA] px-4 pb-12 pt-24 sm:px-6 lg:px-10">
      {/* Decorative, direction-neutral halos. */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-blue-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-teal-400/15 blur-3xl" />

      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 mx-auto grid w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 ${plain ? 'max-w-4xl' : 'max-w-6xl lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]'}`}
      >
        <section className="px-5 py-8 sm:px-12 sm:py-12 xl:px-16">
          <div className={`mx-auto w-full ${plain ? 'max-w-3xl' : 'max-w-xl'}`}>
            <div className="mb-8">
              {!plain && <ProgrammeBadge tone={tone} className="mb-6 border-slate-200 bg-slate-50 text-xs sm:text-sm lg:hidden" />}
              <span className="mb-5 block h-1.5 w-12 rounded-full" style={{ background: AUTH_TONES[tone].gradient }} />
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">{title}</h1>
              {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{subtitle}</p>}
            </div>
            {children}
            {footer && <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">{footer}</div>}
          </div>
        </section>
        {!plain && <BrandPanel tone={tone} audience={audience} />}
      </m.div>
    </div>
  );
}
