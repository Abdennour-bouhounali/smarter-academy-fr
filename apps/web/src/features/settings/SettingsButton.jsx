import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import Modal from '../../components/admin/ui/Modal';
import StudentSettingsPanel from './StudentSettingsPanel';

/**
 * « الإعدادات » s'ouvre dans une FENÊTRE centrale (propriétaire, 2026-10-06),
 * depuis n'importe quel bouton : la roue de la barre latérale, le profil, la
 * page des niveaux. `className` habille le bouton ; `iconOnly` pour la roue.
 */
export default function SettingsButton({ className = '', iconOnly = false, iconSize = 15, testId = 'settings-open' }) {
  const { t } = useTranslation('student');
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('settings.title')}
        title={t('settings.title')}
        className={className}
        data-settings-open={testId}
      >
        <Settings size={iconSize} aria-hidden="true" />
        {!iconOnly && t('settings.title')}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t('settings.title')} closeLabel={t('practice.exam.panelClose')} size="lg">
        <StudentSettingsPanel />
      </Modal>
    </>
  );
}
