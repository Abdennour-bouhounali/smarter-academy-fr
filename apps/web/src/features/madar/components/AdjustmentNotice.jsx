import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, HeartCrack, Megaphone } from 'lucide-react';
import { adjustmentKind } from '../madarModel';

const ICONS = { gave: Heart, took: HeartCrack, warned: Megaphone };
const TONES = {
  gave: 'bg-emerald-400/15 ring-emerald-300/40 text-emerald-50',
  took: 'bg-rose-500/15 ring-rose-300/40 text-rose-50',
  warned: 'bg-amber-400/15 ring-amber-300/40 text-amber-50',
};

/**
 * Ce que l'enseignant a fait des cœurs de l'élève depuis sa dernière visite :
 * donné (effort), retiré (triche), ou un simple avertissement (rien à
 * retirer) — avec le motif et le mot du professeur. Montré une fois : le
 * serveur le marque lu en le servant.
 */
export default function AdjustmentNotice({ adjustments, onDismiss }) {
  const { t } = useTranslation('madar');
  const [open, setOpen] = useState(true);
  if (!adjustments?.length) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-2" role="status" data-madar-adjustments>
          {adjustments.map((a, i) => {
            const kind = adjustmentKind(a.applied);
            const Icon = ICONS[kind];
            return (
              <div key={`${a.at}-${i}`} className={`flex items-start gap-3 rounded-2xl p-3 ring-1 backdrop-blur ${TONES[kind]}`}>
                <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1 font-inter text-sm">
                  <p className="font-bold">
                    {kind === 'warned' ? t('adjust.warned') : t(`adjust.${kind}`, { count: Math.abs(a.applied) })}
                    <span className="font-normal opacity-80"> · {t(`adjust.reasons.${a.reason}`)}</span>
                  </p>
                  {a.note && <p className="mt-0.5 opacity-90">« <bdi>{a.note}</bdi> »</p>}
                </div>
              </div>
            );
          })}
          <button type="button" onClick={() => { setOpen(false); onDismiss?.(); }} className="font-inter text-xs font-semibold text-white/70 underline-offset-2 hover:underline">{t('adjust.dismiss')}</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
