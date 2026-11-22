
/**
 * L'ÉGALITÉ QUI DIT LE SENS DE CHAQUE NOMBRE (propriétaire, 2026-11-04 : « 3 → 3 فرق، 15 → 15 لاعبًا »).
 *
 *    15    =    3    ×    5     +    0
 *  لاعبًا       فرق       في كل فريق     خارج الفرق
 *
 * a = b × q + r, chaque nombre AVEC le mot de la scène sous lui ; les couleurs de b, q, r sont celles de DivisionRoles (le même
 * rôle a la même couleur partout). Un reste nul est en vert : c'est lui qui fait le قاسم. Le texte arabe reste du DOM.
 *
 * @param n, g, q, r  les nombres (a, b, q, r)
 * @param labels      { n, g, q, r } — les mots de la scène (lesson.manipulation.json › <type>.roles)
 */
const TONE = {
  n: 'text-slate-900',
  g: 'text-indigo-700',
  q: 'text-violet-700',
  r: 'text-rose-600',
  r0: 'text-emerald-600',
};

function Term({ value, label, tone, role }) {
  return (
    <span className="inline-flex flex-col items-center" data-role-term={role}>
      <span className={`text-3xl font-black leading-none ${tone}`}>{value}</span>
      <span className={`mt-1 whitespace-nowrap text-xs font-bold ${tone}`} dir="rtl">{label}</span>
    </span>
  );
}

const Op = ({ children }) => <span className="pt-1 text-2xl font-bold text-slate-400" aria-hidden="true">{children}</span>;

export default function RolesEquation({ n, g, q, r, labels, className = '' }) {
  return (
    <span className={`inline-flex max-w-full flex-wrap items-start justify-center gap-x-3 gap-y-2 rounded-2xl bg-white px-4 py-2 ${className}`} dir="ltr" data-roles-equation
      aria-label={`${n} ${labels.n} = ${g} ${labels.g} × ${q} ${labels.q} + ${r} ${labels.r}`}>
      <Term value={n} label={labels.n} tone={TONE.n} role="n" />
      <Op>=</Op>
      <Term value={g} label={labels.g} tone={TONE.g} role="g" />
      <Op>×</Op>
      <Term value={q} label={labels.q} tone={TONE.q} role="q" />
      <Op>+</Op>
      <Term value={r} label={labels.r} tone={Number(r) === 0 ? TONE.r0 : TONE.r} role="r" />
    </span>
  );
}
