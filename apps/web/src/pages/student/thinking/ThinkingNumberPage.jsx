import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { resolveNumber } from '../../../services/thinkingLabService';

/** « Défi 318 » : un lien partagé cite le NUMÉRO ; le serveur le résout en id stable (édition courante). */
export default function ThinkingNumberPage() {
  const { t } = useTranslation('thinking');
  const { number } = useParams();
  const { token } = useContext(AuthContext);
  const [target, setTarget] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!token) return;
    resolveNumber(token, number).then((r) => setTarget(r.id), () => setMissing(true));
  }, [token, number]);

  if (target) return <Navigate to={`/espace/tafkir/${target}`} replace />;
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {missing ? (
        <>
          <p role="alert" className="rounded-2xl bg-slate-100 px-4 py-3 font-inter text-sm text-slate-700">{t('errors.not_found')}</p>
          <Link to="/espace/tafkir" className="mt-3 inline-block font-inter text-sm font-bold text-nav-accent hover:underline">{t('after.backToLadder')}</Link>
        </>
      ) : (
        <Loader2 className="mx-auto animate-spin text-indigo-500" size={28} aria-label="…" />
      )}
    </div>
  );
}
