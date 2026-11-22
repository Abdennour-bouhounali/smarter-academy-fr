import { useTranslation } from 'react-i18next';
import { PanelsTopLeft } from 'lucide-react';

/**
 * Feuille d'examen : le bouton qui ouvre la FENÊTRE CENTRALE (propriétaire,
 * 2026-10-06) — à la place de la colonne latérale, la feuille garde toute la
 * largeur. Élève : « Se repérer » + « Savoir-faire » ; enseignant : « Se repérer » + les
 * réponses des élèves. Visible à toutes les tailles d'écran.
 */
export default function ExamPanelButton({ label, onOpen }) {
  const { t } = useTranslation('student');
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-slate-700 hover:bg-white hover:text-nav-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      data-exam-panel-open
    >
      <PanelsTopLeft className="h-4 w-4" aria-hidden="true" />
      {t('practice.sideShow', { what: label })}
    </button>
  );
}
