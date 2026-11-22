/**
 * Les classes de base de « espace établissement » — une seule source pour ses boutons et
 * ses champs (SchoolLayout, pages/school/*, pages enseignant « Mon établissement »).
 */
const BTN = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 font-inter text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

export const btnPrimary = `${BTN} bg-nav-accent text-white hover:bg-[#3350c4]`;
export const btnSecondary = `${BTN} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;
export const btnDanger = `${BTN} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`;
export const field = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-inter text-sm text-slate-900 focus:border-nav-accent focus:outline-none focus:ring-2 focus:ring-indigo-200';
export const fieldLabel = 'mb-1 block font-inter text-sm font-semibold text-slate-700';
export const card = 'rounded-2xl border border-slate-200 bg-white p-5';

/** Le message arabe d'un refus : le motif clos d'abord, sinon le message du transport. */
export function errorText(t, error) {
  return error?.reason ? t(`errors.${error.reason}`, { defaultValue: t('errors.generic') }) : (error?.message || t('errors.generic'));
}

export const personName = (p, fallback) => [p?.firstName, p?.lastName].filter(Boolean).join(' ') || fallback;
