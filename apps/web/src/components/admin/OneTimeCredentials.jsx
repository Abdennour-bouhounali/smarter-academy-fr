import { useState } from 'react';
import { AdminCard, btnSecondary, btnGhost } from '../../pages/admin/adminUi';

/**
 * La carte ambre d'un mot de passe montré UNE SEULE fois — à la création d'un compte ou à sa réinitialisation.
 * L'administrateur le copie et le remet lui-même ; « Terminé » (`onDone`) l'efface de l'écran, et rien ne le rappelle.
 *
 * Les libellés viennent de l'appelant (chaque page a son catalogue) : `labels = { copy, copied, done }`.
 * `login` (courriel ou identifiant) et `password` sont des identités techniques : LTR, toujours.
 */
export default function OneTimeCredentials({ title, hint, footer, login, password, labels, onDone }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* le mot de passe reste lisible à l'écran */
    }
  };

  return (
    <AdminCard title={title} className="border-amber-300 bg-amber-50">
      <div data-one-time-credentials>
        <p className="mb-3 font-inter text-sm text-slate-700">{hint}</p>
        <div className="flex flex-wrap items-center gap-3">
          <span dir="ltr" className="font-mono-jetbrains text-sm text-slate-600">{login}</span>
          <code dir="ltr" className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-mono-jetbrains text-base font-bold text-slate-900 select-all">{password}</code>
          <button type="button" className={btnSecondary} onClick={copy}>{copied ? labels.copied : labels.copy}</button>
          <button type="button" className={btnGhost} onClick={onDone}>{labels.done}</button>
        </div>
        {footer && <p className="mt-2 font-inter text-xs text-slate-500">{footer}</p>}
      </div>
    </AdminCard>
  );
}
