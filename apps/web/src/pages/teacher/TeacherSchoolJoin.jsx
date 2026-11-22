import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Eye } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { joinSchool, previewSchoolLink } from '../../services/schoolService';
import { btnPrimary, btnSecondary, card, errorText } from '../../features/school/ui';

const SEEN_ITEMS = ['classes', 'students', 'interventions', 'lastSignIn'];

/**
 * Rejoindre un établissement par son lien (SCHOOL_ADMIN_SPACE.md §7, D4).
 * Ouvrir le lien ne rejoint RIEN : la page dit ce que la direction verra, et
 * le bouton « J'accepte et je rejoins » est le geste — comme le lien d'une classe.
 * Le geste rattache aussi toutes les classes actives de l'enseignant, avec
 * leurs élèves qui l'ont accepté (2026-10-28) : la page le dit d'abord.
 */
export default function TeacherSchoolJoin() {
  const { t } = useTranslation('idara');
  useDocumentMeta(t('meta.teacherJoin'));
  const { token: linkToken } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    previewSchoolLink(token, linkToken)
      .then((d) => setPreview(d.schoolLink))
      .catch((e) => setError(errorText(t, e)));
  }, [token, linkToken, t]);

  const join = async () => {
    setBusy(true);
    setError(null);
    try {
      await joinSchool(token, linkToken);
      navigate('/enseignant/muassasa', { replace: true });
    } catch (e) {
      setError(errorText(t, e));
      setBusy(false);
    }
  };

  return (
    <div className="sa-page mx-auto max-w-2xl space-y-5 py-8" data-teacher-school-join>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 font-inter text-sm text-rose-700">{error}</p>}
      {preview && (
        <section className={`${card} space-y-4`}>
          <h1 className="flex items-center gap-2 font-space text-xl font-bold text-slate-900">
            <Building2 size={22} className="text-nav-accent" aria-hidden="true" />{t('teacher.join.title', { school: preview.name })}
          </h1>

          {preview.alreadyMember && <p className="rounded-xl bg-emerald-50 p-3 font-inter text-sm text-emerald-800">{t('teacher.join.already')}</p>}
          {preview.currentSchoolName && <p className="rounded-xl bg-amber-50 p-3 font-inter text-sm text-amber-900">{t('teacher.join.other', { school: preview.currentSchoolName })}</p>}

          {!preview.alreadyMember && !preview.currentSchoolName && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 font-inter text-sm text-slate-700" data-school-disclosure>
              <p className="mb-3 font-semibold text-indigo-900" data-school-join-all-classes>{t('teacher.join.allClasses')}</p>
              <p className="mb-2 flex items-center gap-2 font-semibold text-indigo-900"><Eye size={16} aria-hidden="true" />{t('teacher.join.intro')}</p>
              <ul className="mb-2 list-disc space-y-1 ps-5">
                {SEEN_ITEMS.map((item) => <li key={item}>{t(`teacher.join.items.${item}`)}</li>)}
              </ul>
              <p>{t('teacher.join.never')}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!preview.alreadyMember && !preview.currentSchoolName ? (
              <button type="button" className={btnPrimary} onClick={join} disabled={busy} data-school-join-accept>
                {busy ? t('teacher.join.joining') : t('teacher.join.accept')}
              </button>
            ) : (
              <Link to="/enseignant/muassasa" className={btnPrimary}>{t('teacher.join.open')}</Link>
            )}
            <Link to="/enseignant" className={btnSecondary}>{t('common.cancel')}</Link>
          </div>
        </section>
      )}
    </div>
  );
}
