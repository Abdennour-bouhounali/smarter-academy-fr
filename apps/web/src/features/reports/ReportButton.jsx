import React, { useContext, useRef, useState } from 'react';
import { Flag } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { initiateReport, completeReport } from '../../services/reportService';
import ReportDialog from './ReportDialog';

/**
 * « Signaler un problème » — un seul composant, piloté par son CONTEXTE.
 *
 * Il n'existe pas de bouton « signaler une leçon » et de bouton « signaler un
 * module » : c'est le même, et `source` dit d'où il parle. C'est ce qui permet
 * de le poser une fois dans chaque shell partagé (LessonIndex, ModuleLayout,
 * PracticeSession, DiagnosticRun) plutôt que 132 fois à la main.
 *
 * DEUX TEMPS, et c'est délibéré :
 *
 *   clic  → POST /reports  → le signal existe déjà en base
 *   envoi → PATCH /reports/{id} → la catégorie et les mots le complètent
 *
 * Un élève qui ouvre puis referme laisse donc une trace : « quelqu'un a buté
 * ici » est l'information qu'un formulaire abandonné fait perdre. Le serveur
 * déduplique les ouvertures répétées sur un même contexte.
 *
 * @param {'lesson'|'module'|'exercise'|'question'|'diagnostic'} source
 * @param {object} context  codes de contenu — jamais d'identifiant de base
 * @param {'chip'|'link'|'icon'} [variant]
 */
export default function ReportButton({ source, context = {}, variant = 'chip', className = '' }) {
  const { token } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  // Garde anti double-clic : deux clics rapides ne doivent pas lancer deux
  // requêtes. Une ref plutôt qu'un état — il ne faut pas attendre un rendu.
  const opening = useRef(false);

  // Sans session, personne à qui rattacher le signalement. Ouvrir un
  // formulaire qui échouera à l'envoi serait pire que ne rien proposer.
  if (!token) return null;

  const label = 'Signaler un problème';

  const openDialog = async () => {
    if (opening.current) return;
    opening.current = true;

    setError(null);
    setSubmitted(false);
    // La fenêtre s'ouvre TOUT DE SUITE : l'élève ne doit pas attendre le
    // réseau pour voir qu'il s'est passé quelque chose.
    setOpen(true);

    try {
      const report = await initiateReport(token, { source, ...context });
      setReportId(report.id);
    } catch {
      // Le signal a échoué, mais on ne le dit pas ici : l'élève n'a encore
      // rien demandé. La tentative sera refaite à l'envoi, où l'échec est
      // pertinent et affichable.
      setReportId(null);
    } finally {
      opening.current = false;
    }
  };

  const submit = async ({ category, note }) => {
    setBusy(true);
    setError(null);

    try {
      // Le signal a pu échouer à l'ouverture (réseau coupé, puis revenu) :
      // on le repose avant de compléter, plutôt que de perdre la saisie.
      const id = reportId ?? (await initiateReport(token, { source, ...context })).id;
      await completeReport(token, id, { category, note });
      setSubmitted(true);
      setReportId(null);
    } catch (caught) {
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

  const trigger = variant === 'icon' ? (
    <button
      type="button"
      onClick={openDialog}
      title={label}
      aria-label={label}
      aria-haspopup="dialog"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none ${className}`}
    >
      <Flag size={15} aria-hidden="true" />
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
