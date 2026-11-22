import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import Panel from './Panel';
import TurretIcon from './TurretIcon';

/**
 * Les tourelles de « دفاع الكوكب » : ouvertes ou non, et ce qui les ouvre —
 * tenir plus de vagues, ou répondre juste à la محطة التزوّد. Jamais une leçon
 * terminée, jamais un achat.
 */
export default function TurretBay({ turrets }) {
  const { t } = useTranslation('madar');
  return (
    <Panel aria-labelledby="madar-turrets-title" data-madar-turrets>
      <h2 id="madar-turrets-title" className="font-space text-lg font-black text-white">{t('defense.turrets.title')}</h2>
      <p className="mt-0.5 font-inter text-xs text-white/55">{t('defense.turrets.subtitle')}</p>
      <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3">
        {turrets.map((tur) => {
          const ratio = tur.rule ? Math.min(1, tur.rule.progress / tur.rule.threshold) : 1;
          return (
            <li key={tur.id} className={`flex flex-col items-center gap-1 rounded-2xl px-2 pb-2 pt-3 text-center ring-1 ${tur.unlocked ? 'bg-white/[0.06] ring-white/10' : 'bg-white/[0.03] ring-white/5'}`} data-turret={tur.id}>
              <TurretIcon type={tur.id} size={40} locked={!tur.unlocked} />
              <span className={`font-inter text-xs font-bold ${tur.unlocked ? 'text-white' : 'text-white/50'}`}>{t(`defense.turrets.${tur.id}.name`)}</span>
              {tur.unlocked || !tur.rule ? (
                <span className="font-inter text-[10px] leading-tight text-white/55">{t(`defense.turrets.${tur.id}.desc`)}</span>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 font-inter text-[10px] text-white/55">
                    <Lock size={10} aria-hidden="true" />
                    {tur.rule.kind === 'wave' ? t('defense.turrets.ruleWave', { n: tur.rule.threshold }) : t('ships.ruleRefuel', { n: tur.rule.threshold })}
                  </span>
                  <span className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                    <span className="block h-full rounded-full bg-gradient-to-l from-cyan-300 to-violet-500" style={{ width: `${ratio * 100}%` }} />
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
