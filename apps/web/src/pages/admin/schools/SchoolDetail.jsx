import { useCallback, useContext, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Copy, UserPlus } from 'lucide-react';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { AuthContext } from '../../../context/AuthContext';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import Modal, { ConfirmDialog } from '../../../components/admin/ui/Modal';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { appointDirector, fetchSchool, grantLicence, revokeDirector, setLicenceStatus, setSchoolStatus } from '../../../services/admin/schoolService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { AdminPage, AdminSection, Loading, ErrorBox, formatDate, Num, btnPrimary, btnSecondary, btnDanger, input, label } from '../adminUi';

const BLANK_DIRECTOR = { firstName: '', lastName: '', email: '' };

/**
 * « Licence de l’établissement » (SCHOOL_ADMIN_SPACE.md, D1) : sièges, usage, fin, et le
 * cycle de vie — activer (une nouvelle annule l'actuelle), suspendre,
 * reprendre, annuler. Le paiement se fait hors de la plateforme.
 */
function LicenceSection({ schoolId, licence, onChange }) {
  const { t } = useTranslation('admin');
  const { token } = useContext(AuthContext);
  const [form, setForm] = useState({ studentSeats: '', endsAt: '', note: '' });
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  const run = async (action) => {
    setBusy(true);
    setProblem(null);
    try {
      await action();
      onChange();
      return true;
    } catch (caught) {
      setProblem(t(`schools.licence.errors.${caught.reason}`, { defaultValue: caught.message || t('schools.errors.generic') }));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const grant = async (event) => {
    event.preventDefault();
    const ok = await run(() => grantLicence(token, schoolId, {
      studentSeats: Number(form.studentSeats), endsAt: form.endsAt || null, note: form.note || null,
    }));
    if (ok) setForm({ studentSeats: '', endsAt: '', note: '' });
  };

  return (
    <AdminSection title={t('schools.licence.section')}>
      <p className="mb-3 font-inter text-xs text-slate-500">{t('schools.licence.hint')}</p>
      {problem && <p role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 font-inter text-sm text-rose-700">{problem}</p>}
      {licence ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4" data-school-licence>
          <dl className="grid grid-cols-2 gap-3 font-inter text-sm lg:grid-cols-4">
            <div><dt className="text-xs font-semibold text-slate-400">{t('common.status')}</dt><dd className="mt-0.5"><StatusBadge status={licence.status} label={t(`schools.licence.status.${licence.status}`)} /></dd></div>
            <div><dt className="text-xs font-semibold text-slate-400">{t('schools.licence.used')}{'\u00A0/\u00A0'}{t('schools.licence.seats')}</dt><dd className="mt-0.5"><Num>{`${licence.current}\u00A0/\u00A0${licence.seats}`}</Num></dd></div>
            <div><dt className="text-xs font-semibold text-slate-400">{t('schools.licence.endsAt')}</dt><dd className="mt-0.5"><Num>{licence.endsAt ? formatDate(licence.endsAt) : t('schools.licence.noEnd')}</Num></dd></div>
            <div><dt className="text-xs font-semibold text-slate-400">{t('schools.licence.note')}</dt><dd className="mt-0.5">{licence.note || t('common.dash')}</dd></div>
          </dl>
          {!licence.running && <p className="font-inter text-xs text-amber-700">{t('schools.licence.notRunning')}</p>}
          <div className="flex flex-wrap gap-2">
            {licence.status === 'active' && <button type="button" disabled={busy} className={btnSecondary} onClick={() => run(() => setLicenceStatus(token, schoolId, 'suspended'))}>{t('schools.licence.suspend')}</button>}
            {licence.status === 'suspended' && <button type="button" disabled={busy} className={btnSecondary} onClick={() => run(() => setLicenceStatus(token, schoolId, 'active'))}>{t('schools.licence.resume')}</button>}
            <button type="button" disabled={busy} className={btnDanger} onClick={() => run(() => setLicenceStatus(token, schoolId, 'cancelled'))}>{t('schools.licence.cancel')}</button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 font-inter text-sm text-slate-600">{t('schools.licence.none')}</p>
      )}

      <form onSubmit={grant} className="mt-3 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4" data-school-licence-form>
        <div><label htmlFor="licence-seats" className={label}>{t('schools.licence.studentSeats')}</label><input id="licence-seats" type="number" min="1" required dir="ltr" className={input} value={form.studentSeats} onChange={(e) => setForm((f) => ({ ...f, studentSeats: e.target.value }))} /></div>
        <div><label htmlFor="licence-ends" className={label}>{t('schools.licence.endsAtLabel')}</label><input id="licence-ends" type="date" dir="ltr" className={input} value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} /></div>
        <div><label htmlFor="licence-note" className={label}>{t('schools.licence.note')}</label><input id="licence-note" className={input} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} /></div>
        <div className="flex items-end"><button type="submit" disabled={busy} className={btnPrimary}>{licence ? t('schools.licence.renew') : t('schools.licence.grant')}</button></div>
        {licence && <p className="font-inter text-xs text-slate-500 md:col-span-4">{t('schools.licence.renewHint')}</p>}
      </form>
    </AdminSection>
  );
}

/**
 * La fiche d'un établissement (SCHOOL_ADMIN_SPACE.md §5) : statut, et le
 * DIRECTEUR — nommé ici, avec un mot de passe montré UNE fois, dans cette
 * fenêtre seulement ; il disparaît à la fermeture et ne se relit jamais.
 */
export default function AdminSchoolDetail() {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  useDocumentMeta(t('schools.detailMetaTitle', { id }));
  const { token } = useContext(AuthContext);
  const loader = useCallback((tok) => fetchSchool(tok, id), [id]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);
  const s = data?.school;

  const [person, setPerson] = useState(null);
  const [issued, setIssued] = useState(null); // { director, password } — une fois
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  const reasonText = (caught) => t(`schools.errors.${caught.reason}`, { defaultValue: caught.message || t('schools.errors.generic') });

  const run = async (action) => {
    setBusy(true);
    setProblem(null);
    try {
      await action();
      reload();
      return true;
    } catch (caught) {
      setProblem(reasonText(caught));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const appoint = async (event) => {
    event.preventDefault();
    await run(async () => {
      const result = await appointDirector(token, id, person);
      setPerson(null);
      setCopied(false);
      setIssued(result);
    });
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(issued.password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const directorName = s?.director ? [s.director.firstName, s.director.lastName].filter(Boolean).join(' ') : '';

  return (
    <AdminPage
      eyebrow={t('schools.detailEyebrow')}
      title={s?.name ?? t('schools.detailFallbackTitle', { id })}
      subtitle={s ? [s.wilaya, s.commune, s.currentAcademicYear].filter(Boolean).join(' · ') : undefined}
      actions={<Link to="/admin/etablissements" className={btnSecondary}><ArrowBack size={14} /> {t('schools.backToList')}</Link>}
    >
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {problem && !person && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 font-inter text-sm text-rose-700">{problem}</p>}
      {data && s && (
        <div className="space-y-6">
          <AdminSection title={t('schools.infoSection')}>
            <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 font-inter text-sm lg:grid-cols-5">
              <div><dt className="text-xs font-semibold text-slate-400">{t('common.status')}</dt><dd className="mt-0.5"><StatusBadge status={s.status} /></dd></div>
              <div><dt className="text-xs font-semibold text-slate-400">{t('schools.code')}</dt><dd className="mt-0.5"><code dir="ltr" className="font-mono-jetbrains">{s.code || t('common.dash')}</code></dd></div>
              <div><dt className="text-xs font-semibold text-slate-400">{t('schools.countsClasses')}</dt><dd className="mt-0.5"><Num>{data.counts.classes}</Num></dd></div>
              <div><dt className="text-xs font-semibold text-slate-400">{t('schools.countsTeachers')}</dt><dd className="mt-0.5"><Num>{data.counts.teachers}</Num></dd></div>
              <div><dt className="text-xs font-semibold text-slate-400">{t('classrooms.columnCreated')}</dt><dd className="mt-0.5"><Num>{formatDate(s.createdAt)}</Num></dd></div>
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {s.status !== 'active' && <button type="button" disabled={busy} className={btnSecondary} onClick={() => run(() => setSchoolStatus(token, id, 'active'))}>{t('schools.activate')}</button>}
              {s.status === 'active' && <button type="button" disabled={busy} className={btnDanger} onClick={() => run(() => setSchoolStatus(token, id, 'suspended'))}>{t('schools.suspend')}</button>}
              {s.status !== 'archived' && <button type="button" disabled={busy} className={btnDanger} onClick={() => run(() => setSchoolStatus(token, id, 'archived'))}>{t('schools.archive')}</button>}
              <p className="font-inter text-xs text-slate-500">{t('schools.statusHint')}</p>
            </div>
          </AdminSection>

          <AdminSection title={t('schools.directorSection')}>
            {s.director ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4" data-school-director>
                <div>
                  <p className="font-space font-bold text-slate-900">{directorName}</p>
                  <p className="font-inter text-sm text-slate-500" dir="ltr">{s.director.email}</p>
                </div>
                <button type="button" className={btnDanger} disabled={busy} onClick={() => setConfirmRevoke(true)}>{t('schools.revoke')}</button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
                <p className="font-inter text-sm text-slate-600">{t('schools.appointHint')}</p>
                <button type="button" className={`${btnPrimary} mt-3`} disabled={s.status !== 'active'} onClick={() => { setPerson(BLANK_DIRECTOR); setProblem(null); }}>
                  <UserPlus size={14} />{t('schools.appoint')}
                </button>
              </div>
            )}
          </AdminSection>

          <LicenceSection schoolId={id} licence={data.licence} onChange={reload} />
        </div>
      )}

      <Modal
        open={!!person}
        onClose={() => setPerson(null)}
        title={t('schools.appoint')}
        closeLabel={t('schools.cancel')}
        footer={(
          <>
            <button type="button" className={btnSecondary} onClick={() => setPerson(null)}>{t('schools.cancel')}</button>
            <button type="submit" form="director-form" disabled={busy} className={btnPrimary}>{t('schools.appoint')}</button>
          </>
        )}
      >
        {person && (
          <form id="director-form" onSubmit={appoint} className="grid gap-4 md:grid-cols-2">
            {problem && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 font-inter text-sm text-rose-700 md:col-span-2">{problem}</p>}
            <div><label htmlFor="director-first" className={label}>{t('schools.firstName')}</label><input id="director-first" required className={input} value={person.firstName} onChange={(e) => setPerson((p) => ({ ...p, firstName: e.target.value }))} /></div>
            <div><label htmlFor="director-last" className={label}>{t('schools.lastName')}</label><input id="director-last" required className={input} value={person.lastName} onChange={(e) => setPerson((p) => ({ ...p, lastName: e.target.value }))} /></div>
            <p className="-mt-2 font-inter text-xs text-slate-500 md:col-span-2">{t('schools.nameHint')}</p>
            <div className="md:col-span-2"><label htmlFor="director-email" className={label}>{t('schools.email')}</label><input id="director-email" type="email" required dir="ltr" className={input} value={person.email} onChange={(e) => setPerson((p) => ({ ...p, email: e.target.value }))} /></div>
          </form>
        )}
      </Modal>

      <Modal
        open={!!issued}
        onClose={() => setIssued(null)}
        title={t('schools.passwordTitle')}
        closeLabel={t('schools.done')}
        footer={<button type="button" className={btnPrimary} onClick={() => setIssued(null)}>{t('schools.done')}</button>}
      >
        {issued && (
          <div className="space-y-3" data-director-password>
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 font-inter text-sm text-amber-900">{t('schools.passwordOnce')}</p>
            <p className="font-inter text-sm text-slate-600" dir="ltr">{issued.director.email}</p>
            <div className="flex items-center gap-2">
              <code dir="ltr" className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-center font-mono-jetbrains text-lg tracking-wider text-slate-900">{issued.password}</code>
              <button type="button" className={btnSecondary} onClick={copyPassword}><Copy size={14} />{copied ? t('schools.copied') : t('schools.copy')}</button>
            </div>
            <p className="font-inter text-xs text-slate-500">{t('schools.loginHint')}</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmRevoke}
        onClose={() => setConfirmRevoke(false)}
        onConfirm={async () => { if (await run(() => revokeDirector(token, id))) setConfirmRevoke(false); }}
        title={t('schools.revokeTitle')}
        message={t('schools.revokeMessage', { name: directorName })}
        confirmLabel={t('schools.revoke')}
        cancelLabel={t('schools.cancel')}
        closeLabel={t('schools.cancel')}
        tone="danger"
        busy={busy}
      />
    </AdminPage>
  );
}
