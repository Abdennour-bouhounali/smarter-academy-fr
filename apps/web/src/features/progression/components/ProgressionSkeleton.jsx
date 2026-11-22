/**
 * Squelettes de chargement à la forme du contenu final, pour les SEULES
 * parties qui attendent le serveur : la progression locale s'affiche tout de
 * suite, la maîtrise (pastilles, « للعمل الآن », tuile des compétences)
 * arrive avec le profil. `animate-pulse` est coupé sous
 * prefers-reduced-motion (`motion-reduce:animate-none`). Tous sont
 * `aria-hidden` : le chargement est annoncé une fois par la page (aria-busy).
 */
const base = 'rounded-xl bg-slate-200/70 animate-pulse motion-reduce:animate-none';

export function ChipsSkeleton() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <span className={`${base} h-5 w-12 rounded-full`} />
      <span className={`${base} h-5 w-12 rounded-full`} />
      <span className={`${base} h-5 w-16 rounded-full`} />
    </div>
  );
}

export function WorkNowSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-3" aria-hidden="true">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <span className={`${base} block h-5 w-24 rounded-full`} />
          <span className={`${base} block h-5 w-3/4`} />
          <span className={`${base} block h-3 w-1/2`} />
          <span className={`${base} block h-3 w-2/3`} />
          <span className={`${base} block h-10 w-32`} />
        </div>
      ))}
    </div>
  );
}
