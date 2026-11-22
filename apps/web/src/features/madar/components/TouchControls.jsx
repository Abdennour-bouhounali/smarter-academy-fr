import { useTranslation } from 'react-i18next';
import { ArrowBigUp, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Les commandes tactiles de « المستكشف » : deux flèches d'un côté, un gros
 * bouton de saut de l'autre — les deux pouces. Le niveau avance vers la
 * GAUCHE : la flèche ◀ fait avancer. Appui maintenu = action continue (le saut
 * maintenu va plus haut). Multi-touch : on court et on saute en même temps.
 */
export default function TouchControls({ onPress }) {
  const { t } = useTranslation('madar');
  const bind = (part) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      // La capture garde l'appui même si le pouce glisse hors du bouton ; elle peut échouer (pointeur déjà relâché) : sans gravité.
      try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* rien */ }
      onPress(part, true);
    },
    onPointerUp: () => onPress(part, false),
    onPointerCancel: () => onPress(part, false),
    onPointerLeave: () => onPress(part, false),
    onContextMenu: (e) => e.preventDefault(),
  });
  const btn = 'grid touch-none select-none place-items-center rounded-full bg-white/12 text-white ring-2 ring-white/25 backdrop-blur active:scale-95 active:bg-white/25';
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-5 pb-[max(18px,env(safe-area-inset-bottom))]" dir="ltr" data-touch-controls>
      <div className="flex gap-3">
        <button type="button" aria-label={t('explorer.controls.forward')} className={`${btn} h-20 w-20`} {...bind('forward')}><ChevronLeft size={40} aria-hidden="true" /></button>
        <button type="button" aria-label={t('explorer.controls.back')} className={`${btn} h-16 w-16 self-end`} {...bind('back')}><ChevronRight size={32} aria-hidden="true" /></button>
      </div>
      <button type="button" aria-label={t('explorer.controls.jump')} className={`${btn} h-24 w-24 bg-amber-400/25 ring-amber-300/50`} {...bind('jump')}><ArrowBigUp size={46} aria-hidden="true" /></button>
    </div>
  );
}
