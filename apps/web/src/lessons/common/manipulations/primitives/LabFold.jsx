import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { readStored, writeStored } from './movablePanel';

/**
 * UN BLOC QU'ON MASQUE / AFFICHE — « إخفاء / إظهار » (MANIPULATION_CONTRACT §8bis, règle du propriétaire
 * 2026-10-01). Pour une grande activité, tout ce qui n'est ni l'objet ni ses commandes (tableau des
 * essais, lignes écrites, légende, explication) peut être replié par l'élève pour que l'instrument
 * tienne dans un écran. Jumeau côté leçon du `LabPanel` de la Math Lab (MATH_LAB.md §3.5), sans
 * dépendre de son bundle.
 *
 *   <LabFold id="pair-scoreboard.trials" title={k('trialsTitle')}>…</LabFold>
 *
 * - ouvert par défaut (`defaultOpen`), état retenu par navigateur sous `sa-lab-fold:<id>` ;
 * - replier ne démonte rien d'important : le contenu caché est `hidden` (l'état React survit) ;
 * - JAMAIS pour l'objet manipulé ni pour une commande qui agit dessus : seulement le secondaire.
 */
export default function LabFold({ id = null, title, children, defaultOpen = true, actions = null, className = '' }) {
  const { t } = useTranslation('lesson');
  const key = id ? `sa-lab-fold:${id}` : null;
  const [open, setOpen] = useState(() => readStored(key, defaultOpen) !== false);
  const bodyId = useId();
  const toggle = () => setOpen((v) => { writeStored(key, !v); return !v; });

  return (
    <section className={`rounded-xl border border-slate-200 bg-white/80 ${className}`.trim()} data-lab-fold={id ?? ''} data-open={open ? 'true' : 'false'}>
      <header className="flex items-center gap-2 px-3 py-1.5">
        <h4 className="text-sm font-bold text-slate-700">{title}</h4>
        {actions}
        <button type="button" onClick={toggle} aria-expanded={open} aria-controls={bodyId} data-lab-fold-toggle
          className="ms-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
          {open ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          <span>{t(open ? 'manipulation.layout.hide' : 'manipulation.layout.show')}</span>
        </button>
      </header>
      <div id={bodyId} hidden={!open} className="px-3 pb-3">{children}</div>
    </section>
  );
}
