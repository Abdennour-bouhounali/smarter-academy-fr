import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../context/AuthContext';
import { setTeacherAmbassador } from '../../../services/admin/teacherService';
import Switch from './Switch';

/**
 * L'interrupteur « سفير » d'un enseignant — désigner / retirer en un geste.
 *
 * Un ambassadeur voit tout le contenu, quel qu'en soit l'état de publication,
 * et peut signaler un problème. Le geste est réversible et ne touche ni les
 * classes ni l'offre : pas de confirmation, l'état revient au serveur.
 */
export default function AmbassadorSwitch({ teacher, onChange, withLabel = false }) {
  const { t } = useTranslation('admin');
  const { token } = useContext(AuthContext);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const on = Boolean(teacher.isAmbassador);
  const name = [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') || teacher.email;

  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      const updated = await setTeacherAmbassador(token, teacher.id, !on);
      onChange?.(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2" data-ambassador-switch>
      <Switch
        on={on}
        onToggle={toggle}
        disabled={busy}
        label={t('teachers.ambassador.switchLabel', { name })}
        onClass="bg-amber-500"
      />
      {withLabel && (
        <span className="font-inter text-xs font-semibold text-slate-700">
          {on ? t('teachers.ambassador.on') : t('teachers.ambassador.off')}
        </span>
      )}
      {error && <span role="alert" className="font-inter text-[11px] text-rose-600">{error}</span>}
    </span>
  );
}
