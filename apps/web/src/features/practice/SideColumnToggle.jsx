import { useTranslation } from 'react-i18next';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';

/**
 * Le bouton qui replie / déplie la colonne latérale du lecteur d'exercices.
 * Visible à partir de `xl` seulement : en dessous, la colonne est déjà
 * empilée au-dessus de l'exercice, qui a toute la largeur.
 */
export default function SideColumnToggle({ hidden, onToggle, label }) {
  const { t } = useTranslation('student');
  const Icon = hidden ? PanelRightOpen : PanelRightClose;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={hidden}
      className="hidden min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-slate-700 hover:bg-white hover:text-nav-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 xl:inline-flex"
      data-side-toggle={hidden ? 'hidden' : 'shown'}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {hidden ? t('practice.sideShow', { what: label }) : t('practice.sideHide', { what: label })}
    </button>
  );
}
