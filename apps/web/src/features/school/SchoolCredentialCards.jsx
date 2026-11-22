import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import '../teacher/members/credentials.css';

/**
 * Les cartes de connexion émises par la DIRECTION (import, réédition) — même
 * papier et même feuille d'impression que « بطاقات الدخول » de l'enseignant
 * (credentials.css : à l'écran dans la boîte, seules sur papier). Un compte
 * d'établissement entre par son « معرّف الدخول », jamais par une adresse.
 */
function Cards({ cards, classroomName, t }) {
  const loginUrl = `${window.location.host}/login`;
  return (
    <ul className="sa-cred-grid">
      {cards.map((c) => (
        <li key={c.id} className="sa-cred-card">
          {classroomName && <p className="sa-cred-class">{classroomName}</p>}
          <p className="sa-cred-name">{[c.firstName, c.lastName].filter(Boolean).join(' ') || t('common.unnamed')}</p>
          <dl>
            <dt>{t('cards.site')}</dt>
            <dd dir="ltr">{loginUrl}</dd>
            <dt>{t('cards.login')}</dt>
            <dd dir="ltr">{c.login}</dd>
            <dt>{t('cards.password')}</dt>
            <dd dir="ltr" className="sa-cred-secret">{c.password}</dd>
          </dl>
          <p className="sa-cred-note">{t('cards.note')}</p>
        </li>
      ))}
    </ul>
  );
}

export default function SchoolCredentialCards({ cards, classroomName = null }) {
  const { t } = useTranslation('idara');
  return (
    <>
      <Cards cards={cards} classroomName={classroomName} t={t} />
      {createPortal(
        <div data-credentials-print dir="rtl">
          <Cards cards={cards} classroomName={classroomName} t={t} />
        </div>,
        document.body,
      )}
    </>
  );
}
