import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpCircle, Gem, Lock, Trash2, X } from 'lucide-react';
import { TURRETS, TURRET_ORDER, sellValue, upgradeCost } from '../defense/constants';
import TurretIcon from './TurretIcon';

/**
 * Le menu d'un emplacement, collé en bas de l'écran (à portée de pouce au
 * téléphone, sous le plateau à l'ordinateur) : vide → les tourelles, leur
 * prix, celles qu'on ne peut pas encore payer, celles qui sont verrouillées
 * (et ce qui les ouvre) ; occupé → améliorer ou revendre. Le temps ralentit
 * tant qu'il est ouvert. Clavier : 1–5 construire, U améliorer, S revendre,
 * Échap fermer.
 */
export default function BuildMenu({ slotId, getGame, turretsView, onBuild, onUpgrade, onSell, onClose }) {
  const { t } = useTranslation('madar');
  const reduce = useReducedMotion();
  const [, setTick] = useState(0);
  // Les cristaux montent pendant que le menu est ouvert : relecture régulière.
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 250);
    return () => clearInterval(id);
  }, []);

  const game = getGame();
  const turret = game?.turrets.get(slotId) ?? null;
  const crystals = game?.crystals ?? 0;
  const rules = new Map((turretsView ?? []).map((v) => [v.id, v]));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (!turret && /^[1-5]$/.test(e.key)) onBuild(TURRET_ORDER[Number(e.key) - 1]);
      if (turret && (e.key === 'u' || e.key === 'U')) onUpgrade();
      if (turret && (e.key === 's' || e.key === 'S')) onSell();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const cost = turret ? upgradeCost(turret.type, turret.level) : null;

  return (
    <motion.div
      initial={reduce ? false : { y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6"
      role="dialog" aria-label={turret ? t(`defense.turrets.${turret.type}.name`) : t('defense.menu.build')} data-build-menu={slotId}
    >
      <div className="mx-auto max-w-2xl rounded-[26px] bg-slate-950/85 p-3 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-xl sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-space text-base font-black">{turret ? `${t(`defense.turrets.${turret.type}.name`)} · ${t('defense.menu.level', { n: turret.level })}` : t('defense.menu.build')}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/15 px-2.5 py-0.5 font-space text-sm font-black text-cyan-100" dir="ltr"><Gem size={13} aria-hidden="true" />{crystals}</span>
          <button type="button" onClick={onClose} aria-label={t('defense.menu.close')} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 hover:bg-white/20"><X size={18} aria-hidden="true" /></button>
        </div>

        {!turret && (
          <ul className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {TURRET_ORDER.map((type, i) => {
              const rule = rules.get(type);
              const locked = rule ? !rule.unlocked : false;
              const price = TURRETS[type].cost;
              const affordable = crystals >= price;
              return (
                <li key={type}>
                  <button
                    type="button" disabled={locked || !affordable} onClick={() => onBuild(type)} data-build={type}
                    className={`flex h-full w-full flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-center ring-1 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50 ${
                      locked ? 'bg-white/[0.03] ring-white/5' : affordable ? 'bg-white/[0.07] ring-white/15 hover:bg-white/15' : 'bg-white/[0.04] opacity-60 ring-white/10'
                    }`}
                  >
                    <TurretIcon type={type} size={34} locked={locked} />
                    <span className="font-inter text-[11px] font-bold leading-tight">{t(`defense.turrets.${type}.name`)}</span>
                    {locked ? (
                      <span className="inline-flex items-center gap-0.5 font-inter text-[9px] leading-tight text-white/55">
                        <Lock size={9} aria-hidden="true" />
                        {rule.rule.kind === 'wave' ? t('defense.turrets.ruleWave', { n: rule.rule.threshold }) : t('ships.ruleRefuel', { n: rule.rule.threshold })}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-0.5 font-space text-xs font-black ${affordable ? 'text-cyan-200' : 'text-rose-300'}`} dir="ltr"><Gem size={10} aria-hidden="true" />{price}</span>
                    )}
                    <span className="sr-only">{t(`defense.turrets.${type}.desc`)} ({i + 1})</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {turret && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3">
              <TurretIcon type={turret.type} size={44} />
              <p className="font-inter text-xs leading-relaxed text-white/75">{t(`defense.turrets.${turret.type}.desc`)}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onUpgrade} disabled={cost === null || crystals < cost} data-action="upgrade"
                className="flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 px-4 font-space text-sm font-black text-slate-950 disabled:opacity-40">
                <ArrowUpCircle size={18} aria-hidden="true" />
                {cost === null ? t('defense.menu.max') : <>{t('defense.menu.upgrade')} <span dir="ltr" className="inline-flex items-center gap-0.5"><Gem size={12} aria-hidden="true" />{cost}</span></>}
              </button>
              <button type="button" onClick={onSell} data-action="sell"
                className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl bg-white/10 px-4 font-inter text-sm font-bold ring-1 ring-white/15 hover:bg-white/15">
                <Trash2 size={16} aria-hidden="true" /> {t('defense.menu.sell')} <span dir="ltr" className="inline-flex items-center gap-0.5 text-cyan-200"><Gem size={12} aria-hidden="true" />+{sellValue(turret)}</span>
              </button>
            </div>
          </div>
        )}
        <p className="mt-2 text-center font-inter text-[11px] text-white/45">{t('defense.menu.slowmo')}</p>
      </div>
    </motion.div>
  );
}
