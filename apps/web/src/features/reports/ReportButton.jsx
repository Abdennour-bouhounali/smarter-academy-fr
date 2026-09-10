import React, { useContext, useRef, useState } from 'react';
import { Flag } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { initiateReport, completeReport, isRetryableFailure } from '../../services/reportService';
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
  // Le signal a-t-il échoué pour une raison qu'une nouvelle tentative peut
  // lever (réseau coupé, serveur momentanément indisponible) ? Un refus
  // d'autorisation ou une validation, eux, se reproduiront à l'identique :
  // les rejouer à l'envoi ne ferait que masquer la vraie cause derrière un
  // second échec.
  const [signalPending, setSignalPending] = useState(false);
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
    setSignalPending(false);
    setReportId(null);
    // La fenêtre s'ouvre TOUT DE SUITE : l'élève ne doit pas attendre le
    // réseau pour voir qu'il s'est passé quelque chose.
    setOpen(true);

    try {
      const report = await initiateReport(token, { source, ...context });
      setReportId(report.id);
    } catch (caught) {
      // Silencieux, et c'est délibéré : l'élève n'a encore rien demandé, et
      // lui annoncer une panne au moment où il ouvre la fenêtre serait du
      // bruit pour un problème qui se résoudra peut-être tout seul.
      //
      // On retient seulement s'il vaut la peine de réessayer. Une panne
      // réseau, oui. Un 403 ou un 422, non : la même requête produira la
      // même réponse, et l'élève verra alors une erreur claire à l'envoi
      // plutôt qu'un second échec inexpliqué.
      setSignalPending(isRetryableFailure(caught));
    } finally {
      opening.current = false;
    }
  };

  const submit = async ({ category, note }) => {
    setBusy(true);
    setError(null);

    try {
      let id = reportId;

      if (id === null) {
        // Le signal manque. On ne le repose QUE s'il avait échoué pour une
        // raison passagère : sinon on laisse remonter l'erreur d'origine,
        // qui dit quelque chose, au lieu d'en fabriquer une seconde.
        //
        // Aucun doublon possible : le serveur déduplique sur
        // (élève, empreinte, signal encore incomplet), donc si le premier
        // POST avait en réalité abouti — réponse perdue en route — cette
        // seconde tentative retrouve la MÊME ligne.
        if (!signalPending) {
          throw new Error('Impossible d’envoyer le signalement pour le moment.');
        }

        id = (await initiateReport(token, { source, ...context })).id;
      }

      await completeReport(token, id, { category, note });
      setSubmitted(true);
      setReportId(null);
      setSignalPending(false);
    } catch (caught) {
      // La saisie de l'élève reste à l'écran : il peut réessayer sans avoir
      // à tout retaper.
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
  const trigger = variant === 'icon' ? (
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
        <span className="hidden sm:inline">Signaler</span>
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
