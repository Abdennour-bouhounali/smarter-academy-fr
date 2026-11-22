import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { POSITIONS, levelOfPos, levelsByDomain, subOfPos } from '../sniper/levels';
import { mentalLevelsByDomain } from '../mental/levels';
import { SUB_LETTERS } from './SniperHud';

/**
 * Où en est l'élève dans les 50 niveaux d'un jeu de mathématiques : sa
 * position (niveau · أ/ب/ج, une barre sur les 150 sous-niveaux), puis la carte
 * des onze familles. Un niveau ouvert se rejoue d'un toucher ; un niveau
 * fermé attend (on l'ouvre en y arrivant, le jeu s'adapte tout seul).
 *
 * `progress` : `GET /madar › sniper | odd | mental` — position, unlockedUpTo, entryLevel.
 * `catalog` : `sniper` (les 50 niveaux de « قنّاص القيم » et « الدخيل ») ou
 * `mental` (les 50 niveaux du calcul mental).
 */
export default function MathLevelMap({ progress, catalog = 'sniper', disabled, onPlay }) {
  const { t } = useTranslation('madar');
  const ns = catalog === 'mental' ? 'mental' : 'sniper';
  const byDomain = catalog === 'mental' ? mentalLevelsByDomain : levelsByDomain;
  const position = progress?.position ?? 0;
  const level = levelOfPos(position);
  const sub = subOfPos(position);
  const open = progress?.unlockedUpTo ?? 1;
  const current = byDomain().flatMap((d) => d.levels).find((l) => l.n === level);

  return (
    <div className="space-y-3" data-math-levels>
      <div className="rounded-2xl bg-white/[0.06] p-3" data-math-position={position}>
        <p className="font-inter text-xs text-white/60">{t('sniper.lobby.youAre')}</p>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 font-space text-lg font-black text-white">
          <span className="text-amber-200">{t('sniper.hud.level', { n: level, sub: SUB_LETTERS[sub - 1] })}</span>
          <span className="font-inter text-sm font-bold">{current ? t(`${ns}.levels.${current.id}`) : ''}</span>
        </p>
        <p className="font-inter text-[11px] text-white/50">{current ? t(`${ns}.domains.${current.domain}`) : ''}</p>
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <span className="block h-full rounded-full bg-gradient-to-l from-amber-300 to-emerald-400" style={{ width: `${((position + 1) / POSITIONS) * 100}%` }} />
        </span>
        <p className="mt-1.5 font-inter text-[11px] leading-relaxed text-white/55">{t('sniper.lobby.adaptHint')}</p>
      </div>

      <details className="group rounded-2xl bg-white/[0.04] p-3" data-math-map>
        <summary className="cursor-pointer list-none font-inter text-xs font-semibold text-white/80 marker:hidden">
          {t('sniper.lobby.map', { n: open })} <span className="text-white/45 group-open:hidden">▾</span>
        </summary>
        <div className="mt-2 space-y-2.5">
          {byDomain().map(({ domain, levels }) => (
            <div key={domain}>
              <p className="font-inter text-[11px] font-bold text-white/60">{t(`${ns}.domains.${domain}`)}</p>
              <ol className="mt-1 flex flex-wrap gap-1.5">
                {levels.map((l) => {
                  const unlocked = l.n <= open;
                  const here = l.n === level;
                  return (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => onPlay(l.n)}
                        disabled={!unlocked || disabled}
                        title={t(`${ns}.levels.${l.id}`)}
                        aria-label={`${t('sniper.hud.level', { n: l.n, sub: '' })} — ${t(`${ns}.levels.${l.id}`)}`}
                        className={`grid h-9 min-w-[36px] place-items-center rounded-xl px-1.5 font-space text-xs font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50 ${here ? 'bg-amber-300 text-slate-950 ring-2 ring-amber-100' : unlocked ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/[0.03] text-white/30'}`}
                        dir="ltr"
                        data-level={l.n}
                        data-unlocked={unlocked || undefined}
                      >
                        {unlocked ? l.n : <Lock size={12} aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
