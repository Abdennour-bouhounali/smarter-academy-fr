import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import { SHARED_ITEMS } from '../../pages/student/qismConsent';

/**
 * Ce que l'enseignant voit — le MÊME texte au formulaire du code (قسمي), sur
 * la page du lien de classe (/rejoindre/classe/…) et sur la carte de
 * confirmation : un consentement ne se donne pas sur trois versions d'un
 * texte. `schoolName` (page du lien d'une classe d'établissement) ajoute la
 * phrase qui nomme l'établissement : le même geste l'accepte aussi. Sans
 * établissement, la phrase `schoolFuture` annonce qu'un rattachement plus tard
 * fera entrer l'élève automatiquement (classroom.school_auto_consent_since,
 * 2026-10-28) — même texte, même version côté serveur.
 */
export default function SharingDisclosure({ schoolName = null }) {
  const { t } = useTranslation('student');
  return (
    <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4 text-sm text-slate-700" data-qism-sharing>
      <p className="flex items-center gap-2 font-semibold text-teal-900 mb-2">
        <Eye size={16} className="shrink-0" aria-hidden="true" /> {t('qism.sharing.title')}
      </p>
      <p className="mb-2">{t('qism.sharing.intro')}</p>
      <ul className="list-disc ps-5 space-y-1 mb-2">
        {SHARED_ITEMS.map((item) => <li key={item}>{t(`qism.sharing.items.${item}`)}</li>)}
      </ul>
      <p className="mb-2">{t('qism.sharing.teacherNotes')}</p>
      <p>{t('qism.sharing.email')}</p>
      <p>{t('qism.sharing.leave')}</p>
      {/* Une classe d'établissement : la direction lit aussi (SCHOOL_ADMIN_SPACE.md §4). */}
      {schoolName
        ? <p className="mt-2 font-semibold text-teal-900" data-qism-sharing-school>{t('qism.sharing.school', { school: schoolName })}</p>
        : <p className="mt-2" data-qism-sharing-school-future>{t('qism.sharing.schoolFuture')}</p>}
    </div>
  );
}
