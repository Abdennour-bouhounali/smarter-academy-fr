import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import DeviceGuide from '../../features/family/DeviceGuide';

/**
 * « اجعل الجهاز للدراسة فقط » — servi à deux adresses (PARENT_SPACE.md §6) :
 * /himaya, PUBLIC (pied de page — un parent doit pouvoir le lire avant de
 * créer un compte), et /wali/himaya dans فضاء الوليّ. Le visiteur voit en plus
 * comment obtenir le « رابط الوليّ » — aucun compte à créer.
 */
export default function DeviceGuidePage() {
  const { t } = useTranslation('family');
  useDocumentMeta(t('meta.guide'));
  const { user } = useContext(AuthContext);
  const isVisitor = !user;

  return (
    <div className={isVisitor ? 'mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28' : ''}>
      <h1 className="mb-5 font-space text-xl font-bold text-slate-900 sm:mb-6 sm:text-2xl">{t('guide.title')}</h1>
      <DeviceGuide />
      {isVisitor && (
        <div className="mt-8 flex items-start gap-4 rounded-2xl bg-nav-accent p-5 text-white sm:p-6">
          <Link2 size={28} className="flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-space text-lg font-bold">{t('guide.parentCta')}</p>
            <p className="font-inter text-sm text-indigo-100">{t('guide.parentCtaText')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
