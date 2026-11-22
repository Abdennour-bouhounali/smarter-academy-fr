import { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Gamepad2, Users } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchClassGroups } from '../../services/teacher/classGroupService';
import { TeacherPage, Loading, ErrorBox, btnPrimary } from './teacherUi';

// L'onglet de gestion d'une classe : le même que dans la page de la classe.
const MadarTab = lazy(() => import('../../features/teacher/madar/MadarTab'));

/**
 * « Espace jeux » côté ENSEIGNANT (/enseignant/jeux) : un seul endroit pour
 * gérer les trois jeux de ses classes — choisir la classe, puis ouvrir ou
 * fermer chaque jeu, régler cœurs, limite, leçons et délais, suivre la
 * semaine (classement, approvisionnement, « À regarder »), donner ou retirer
 * des cœurs, afficher le classement au tableau. Le même panneau existe dans
 * l'onglet « Espace jeux » de chaque classe.
 */
export default function TeacherGamesPage() {
  const { t } = useTranslation('madar');
  useDocumentMeta(t('hub.title'));
  const { token } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const [classes, setClasses] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchClassGroups(token)
      .then((d) => setClasses(d.classrooms.filter((c) => c.status === 'active')))
      .catch((e) => setError(e.message));
  }, [token]);

  const selectedId = Number(params.get('classe')) || classes?.[0]?.id || null;
  const selected = classes?.find((c) => c.id === selectedId) ?? null;

  return (
    <TeacherPage eyebrow={t('teacher.space.eyebrow')} title={t('hub.title')} subtitle={t('teacher.space.subtitle')}>
      {error && <ErrorBox message={error} />}
      {!classes && !error && <Loading />}
      {classes?.length === 0 && (
        <div className="rounded-2xl border border-nav-line bg-white p-8 text-center">
          <Users size={28} className="mx-auto text-slate-400" aria-hidden="true" />
          <p className="mt-2 font-inter text-sm text-slate-600">{t('teacher.space.noClass')}</p>
          <Link to="/enseignant/classes/nouveau" className={`${btnPrimary} mt-4 inline-flex`}>{t('teacher.space.createClass')}</Link>
        </div>
      )}
      {classes?.length > 0 && (
        <div className="space-y-5" data-teacher-games>
          <div className="rounded-2xl border border-nav-line bg-white flex flex-wrap items-center gap-2 p-3" role="tablist" aria-label={t('teacher.space.classLabel')}>
            <Gamepad2 size={18} className="text-nav-accent" aria-hidden="true" />
            <span className="font-inter text-sm font-semibold text-slate-700">{t('teacher.space.classLabel')}</span>
            {classes.map((c) => (
              <button key={c.id} type="button" role="tab" aria-selected={c.id === selectedId}
                onClick={() => setParams({ classe: String(c.id) }, { replace: true })}
                className={`rounded-lg px-3 py-1.5 font-inter text-sm font-semibold ${c.id === selectedId ? 'bg-nav-accent text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                data-class={c.id}>
                {c.name}
              </button>
            ))}
          </div>
          {selected && (
            <Suspense fallback={<Loading />}>
              <MadarTab key={selected.id} classGroup={selected} />
            </Suspense>
          )}
        </div>
      )}
    </TeacherPage>
  );
}
