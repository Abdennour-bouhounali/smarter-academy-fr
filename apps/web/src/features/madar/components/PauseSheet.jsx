import { useTranslation } from 'react-i18next';
import { Flag, Play } from 'lucide-react';
import Sheet, { primaryBtn, secondaryBtn } from './Sheet';

export default function PauseSheet({ onResume, onQuit }) {
  const { t } = useTranslation('madar');
  return (
    <Sheet labelledBy="madar-pause-title" onEscape={onResume} data-madar-pause>
      <h2 id="madar-pause-title" className="text-center font-space text-2xl font-black text-white">{t('pause.title')}</h2>
      <div className="mt-5 space-y-2.5">
        <button type="button" className={primaryBtn} onClick={onResume} data-action="resume" data-autofocus>
          <Play size={20} aria-hidden="true" className="-scale-x-100" /> {t('pause.resume')}
        </button>
        <button type="button" className={secondaryBtn} onClick={onQuit} data-action="quit">
          <Flag size={16} aria-hidden="true" /> {t('pause.quit')}
        </button>
      </div>
    </Sheet>
  );
}
