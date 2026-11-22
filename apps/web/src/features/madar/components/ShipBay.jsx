import { useTranslation } from 'react-i18next';
import { Check, Lock } from 'lucide-react';
import { formatScore } from '../madarModel';
import Panel from './Panel';
import ShipIcon from './ShipIcon';

/**
 * « حظيرة السفن » : chaque vaisseau, ouvert ou non, et ce qui le débloque —
 * un record (voler loin) ou des réponses justes à la محطة التزوّد. Jamais
 * une leçon terminée, jamais un achat.
 */
export default function ShipBay({ ships, selected, onSelect, busy }) {
  const { t } = useTranslation('madar');
  return (
    <Panel aria-labelledby="madar-ships-title" data-madar-ships>
      <h2 id="madar-ships-title" className="font-space text-lg font-black text-white">{t('ships.title')}</h2>
      <p className="mt-0.5 font-inter text-xs text-white/55">{t('ships.subtitle')}</p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {ships.map((ship) => {
          const isSelected = ship.id === selected;
          const ratio = ship.rule ? Math.min(1, ship.rule.progress / ship.rule.threshold) : 1;
          return (
            <li key={ship.id}>
              <button
                type="button"
                disabled={!ship.unlocked || isSelected || busy}
                onClick={() => onSelect(ship.id)}
                aria-pressed={isSelected}
                className={`group relative flex h-full w-full flex-col items-center gap-1 rounded-2xl px-2 pb-2 pt-3 text-center transition focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50 ${
                  isSelected ? 'bg-gradient-to-b from-amber-300/25 to-amber-300/5 ring-2 ring-amber-300' : ship.unlocked ? 'bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/10' : 'bg-white/[0.03] ring-1 ring-white/5'
                }`}
                data-ship={ship.id}
              >
                <ShipIcon id={ship.id} size={46} locked={!ship.unlocked} className="transition group-hover:-translate-x-1" />
                <span className={`font-inter text-xs font-bold ${ship.unlocked ? 'text-white' : 'text-white/50'}`}>{t(`ships.names.${ship.id}`)}</span>
                {isSelected && <span className="inline-flex items-center gap-0.5 font-inter text-[10px] font-bold text-amber-200"><Check size={11} aria-hidden="true" />{t('ships.selected')}</span>}
                {!ship.unlocked && ship.rule && (
                  <>
                    <span className="inline-flex items-center gap-1 font-inter text-[10px] text-white/55">
                      <Lock size={10} aria-hidden="true" />
                      {ship.rule.kind === 'best' ? t('ships.ruleBest', { n: formatScore(ship.rule.threshold) }) : t('ships.ruleRefuel', { n: ship.rule.threshold })}
                    </span>
                    <span className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                      <span className="block h-full rounded-full bg-gradient-to-l from-amber-300 to-orange-500" style={{ width: `${ratio * 100}%` }} />
                    </span>
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
