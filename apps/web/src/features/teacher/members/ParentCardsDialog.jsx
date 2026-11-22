import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Printer, QrCode as QrIcon } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import Modal from '../../../components/admin/ui/Modal';
import { issueParentCards } from '../../../services/teacher/classGroupService';
import { btnPrimary, btnSecondary } from '../../../pages/teacher/teacherUi';
import { studentName } from '../insights/insights';
import QrCode from '../../family/QrCode';
import './parentCards.css';

/**
 * « Cartes pour les parents » (docs/architecture/PARENT_SPACE.md §2bis) — l'enseignant
 * choisit des élèves ; le serveur rend le « lien parent » de chacun (le lien
 * EXISTANT s'il y en a un : imprimer ne casse jamais un lien déjà envoyé) ; les
 * cartes s'impriment avec un QR que le parent scanne à la réunion des parents.
 *
 * Paresseux (MembersTab le charge à l'ouverture, sous son <Suspense>) : il tire
 * qrcode-generator et le namespace `family`. Impression : un portail
 * `[data-parent-cards-print]`, comme les « Cartes de connexion ».
 */
export default function ParentCardsDialog({ open, onClose, classGroup, students }) {
  const { t } = useTranslation('family');
  const { t: tTeacher } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  const [selected, setSelected] = useState(() => new Set());
  const [cards, setCards] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set(students.map((s) => s.id)));
    setCards(null);
    setError(null);
  }, [open, students]);

  const toggle = (id) => setSelected((cur) => {
    const next = new Set(cur);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const allChecked = students.length > 0 && selected.size === students.length;

  const issue = async () => {
    setBusy(true);
    setError(null);
    try {
      setCards(await issueParentCards(token, classGroup.id, [...selected]));
    } catch {
      setError(t('cards.errors'));
    } finally {
      setBusy(false);
    }
  };

  const close = () => (busy ? null : onClose());

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title={t('cards.title')}
      closeLabel={t('cards.close')}
      footer={cards ? (
        <>
          <button type="button" onClick={close} className={btnSecondary}>{t('cards.close')}</button>
          <button type="button" onClick={() => window.print()} className={btnPrimary}><Printer size={14} aria-hidden="true" /> {t('cards.print')}</button>
        </>
      ) : (
        <>
          <button type="button" onClick={close} disabled={busy} className={btnSecondary}>{t('cards.close')}</button>
          <button type="button" onClick={issue} disabled={busy || selected.size === 0} className={btnPrimary} data-parent-cards-issue>
            <QrIcon size={14} aria-hidden="true" /> {t('cards.issue')}
          </button>
        </>
      )}
    >
      {!cards && (
        <div className="space-y-4">
          <p className="rounded-xl border border-indigo-200 bg-nav-accent-soft p-3 text-indigo-950">{t('cards.intro')}</p>
          <label className="flex items-center gap-2 font-semibold text-slate-800">
            <input type="checkbox" className="h-4 w-4" checked={allChecked}
              onChange={() => setSelected(allChecked ? new Set() : new Set(students.map((s) => s.id)))} />
            {t('cards.selectAll')} ({students.length})
          </label>
          <ul className="grid grid-cols-2 gap-2">
            {students.map((s) => (
              <li key={s.id}>
                <label className="flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                  <input type="checkbox" className="h-4 w-4" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
                  <span>{studentName(s, tTeacher('common.unnamedStudent'))}</span>
                </label>
              </li>
            ))}
          </ul>
          {error && <p role="alert" className="text-rose-700">{error}</p>}
        </div>
      )}

      {cards && (
        <div className="space-y-4">
          <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">{t('cards.count', { count: cards.length })}</p>
          <ParentCards cards={cards} classGroup={classGroup} unnamed={tTeacher('common.unnamedStudent')} />
          {createPortal(
            <div data-parent-cards-print>
              <ParentCards cards={cards} classGroup={classGroup} unnamed={tTeacher('common.unnamedStudent')} />
            </div>,
            document.body,
          )}
        </div>
      )}
    </Modal>
  );
}

/** Les cartes — les mêmes à l'écran et sur papier. */
function ParentCards({ cards, classGroup, unnamed }) {
  const { t } = useTranslation('family');
  return (
    <ul className="sa-pcard-grid">
      {cards.map((c) => (
        <li key={c.id} className="sa-pcard" data-parent-card>
          <div className="sa-pcard-text">
            <p className="sa-pcard-class">{classGroup.name}</p>
            <p className="sa-pcard-name">{studentName(c, unnamed)}</p>
            <p className="sa-pcard-title">{t('cards.cardTitle')}</p>
            <ol>
              <li>{t('cards.cardStep1')}</li>
              <li>{t('cards.cardStep2')}</li>
              <li>{t('cards.cardStep3')}</li>
            </ol>
            <p className="sa-pcard-footer">{t('cards.cardFooter')}</p>
          </div>
          <QrCode value={c.url} size={124} label={t('parentLink.qrLabel')} />
        </li>
      ))}
    </ul>
  );
}
