import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { submitReport } from '../../services/reportService';
import ReportDialog from './ReportDialog';

/**
 * « Signaler un problème » — un seul composant, piloté par son CONTEXTE.
 *
 * Il n'existe pas de bouton « signaler une leçon » et de bouton « signaler un
 * module » : c'est le même, et `source` dit d'où il parle. C'est ce qui permet
 * de le poser une fois dans chaque shell partagé (LessonIndex, ModuleLayout,
 * PracticeSession, DiagnosticRun) plutôt que 132 fois à la main.
 *
 * RÉSERVÉ AUX RELECTEURS (2026-10-05) : l'administrateur et les enseignants
 * ambassadeurs (« سفراء », `user.canReviewContent`). Pour tout autre compte,
 * rien n'est rendu — et le serveur refuse de toute façon (middleware
 * `reviewer`).
 *
 * Le CLIC n'ouvre que le formulaire : rien ne part avant « إرسال ». L'envoi
 * est unique (POST multipart), capture d'écran comprise.
 *
 * @param {'lesson'|'module'|'exercise'|'question'|'diagnostic'} source
 * @param {object} context  codes de contenu — jamais d'identifiant de base
 * @param {'chip'|'link'|'icon'|'prominent'} [variant]
 */
export default function ReportButton({ source, context = {}, variant = 'chip', className = '' }) {
  const { t } = useTranslation('common');
  const { token, user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!token || !user?.canReviewContent) return null;

  const label = t('report.trigger');

  const openDialog = () => {
    setError(null);
    setSubmitted(false);
    setOpen(true);
  };

  const submit = async ({ category, note, screenshot }) => {
    setBusy(true);
    setError(null);
    try {
      await submitReport(token, { source, context, category, note, screenshot });
      setSubmitted(true);
    } catch (caught) {
      // La saisie reste à l'écran : on peut réessayer sans tout refaire.
      setError(caught.message);
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setOpen(false);
    setError(null);
    // `submitted` est remis à zéro à la prochaine ouverture, pas ici : sinon
    // l'écran de confirmation disparaîtrait pendant l'animation de fermeture.
  };

  // Variante icône : la CIBLE fait 44px (h-11 w-11), la PASTILLE visible en
  // fait 36 (h-9 w-9). Le bouton est dimensionné pour le doigt, et l'anneau
  // survol/focus est porté par le <span> intérieur pour qu'il garde la taille
  // qu'on voit. Grossir la pastille encombrerait une barre d'outils déjà
  // dense ; laisser la cible à 36px la rendrait difficile à toucher.
  // Variante « prominent » (2026-10-05) : en HAUT de page, couleur d'alerte
  // et libellé toujours visible — seuls les relecteurs la voient, et pour
  // eux signaler EST le travail : le bouton doit se trouver d'un coup d'œil.
  const trigger = variant === 'prominent' ? (
    <button
      type="button"
      onClick={openDialog}
      aria-haspopup="dialog"
      data-report-trigger="prominent"
      className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-2 border-amber-400 bg-amber-50 px-4 font-inter text-sm font-bold text-amber-900 shadow-sm transition-colors hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none ${className}`}
    >
      <Flag size={16} aria-hidden="true" /> {label}
    </button>
  ) : variant === 'icon' ? (
    <button
      type="button"
      onClick={openDialog}
      title={label}
      aria-label={label}
      aria-haspopup="dialog"
      className={`group inline-flex h-11 shrink-0 items-center justify-center rounded-full focus:outline-none ${className}`}
    >
      {/* Une pastille bordée, comme celle des XP juste à côté : l'icône seule
          se lisait comme un ornement. Le mot « Signaler » apparaît à partir de
          `sm` — sur un téléphone, la barre du haut n'a pas la place, et
          l'étiquette accessible porte alors seule le sens. */}
      <span className="flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 font-mono text-xs font-bold text-slate-500 shadow-sm transition-colors group-hover:border-slate-300 group-hover:bg-slate-50 group-hover:text-slate-800 group-focus-visible:ring-2 group-focus-visible:ring-blue-400 sm:px-3">
        <Flag size={14} aria-hidden="true" />
        <span className="hidden sm:inline">{t('report.triggerShort')}</span>
      </span>
    </button>
  ) : variant === 'link' ? (
    <button
      type="button"
      onClick={openDialog}
      aria-haspopup="dialog"
      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 font-inter text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none ${className}`}
    >
      <Flag size={13} aria-hidden="true" /> {label}
    </button>
  ) : (
    <button
      type="button"
      onClick={openDialog}
      aria-haspopup="dialog"
      className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 font-inter text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none ${className}`}
    >
      <Flag size={13} aria-hidden="true" /> {label}
    </button>
  );

  return (
    <>
      {trigger}
      <ReportDialog
        open={open}
        onClose={close}
        onSubmit={submit}
        busy={busy}
        error={error}
        submitted={submitted}
      />
    </>
  );
}
