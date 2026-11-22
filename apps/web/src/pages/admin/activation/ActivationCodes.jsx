import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Plus, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminPage, useAdminLabels, formatDate, Num, btnPrimary, btnSecondary, input } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import Modal from '../../../components/admin/ui/Modal';
import { EmptyState } from '../../../components/admin/ui/states';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useDebounced } from '../../../hooks/useDebounced';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { AuthContext } from '../../../context/AuthContext';
import { fetchPlans } from '../../../services/admin/planService';
import { quoteSeats } from '../../../features/teacher/subscription/seatPricing';
import { formatEur } from '../../../utils/money';
import {
  fetchActivationCodes,
  fetchActivationBatches,
  generateActivationBatch,
  downloadActivationCodesCsv,
  downloadGeneratedCodesCsv,
} from '../../../services/admin/activationCodeService';

/** Les états d'un code — les valeurs restent celles du serveur. */
const STATUS_VALUES = ['available', 'activated', 'expired', 'revoked'];

/**
 * La liste des codes d'activation.
 *
 * Le code lui-même n'apparaît JAMAIS ici : la base n'en garde qu'une
 * empreinte, et cet écran ne montre que l'indice de 4 symboles — assez pour
 * rapprocher une carte physique d'une ligne, pas assez pour s'en servir.
 * Les codes en clair n'existent qu'une fois, dans le panneau de génération
 * ci-dessous, et seulement pour le lot qu'on vient de produire.
 */
export default function AdminActivationCodes() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  useDocumentMeta(t('activation.metaTitle'));

  const { token } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') ?? undefined);
  const [batch, setBatch] = useState(undefined);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState(null);
  const [exporting, setExporting] = useState(false);
  // Les offres liables à un lot : actives ou masquées, jamais l'offre par
  // défaut (déjà effective) ni une archivée.
  const [plans, setPlans] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [batchSeats, setBatchSeats] = useState('');
  useEffect(() => {
    fetchPlans(token, { perPage: 100 })
      .then((d) => setPlans((d.plans?.data ?? []).filter((p) => ['active', 'hidden'].includes(p.status) && !p.isDefault)))
      .catch(() => setPlans([]));
  }, [token]);

  const filters = { search: debouncedSearch, status, batch, page };

  const loader = useCallback(
    (authToken) => fetchActivationCodes(authToken, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, status, batch, page],
  );
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const batchLoader = useCallback((authToken) => fetchActivationBatches(authToken, { perPage: 100 }), []);
  const { data: batchData } = useAdminResource(batchLoader, [batchLoader]);

  const batchOptions = (batchData?.batches?.data ?? []).map((b) => ({
    value: String(b.id),
    label: `${b.label} (${b.quantity})`,
  }));

  const applyStatus = (next) => {
    setStatus(next);
    setPage(1);
    // Le filtre voyage dans l'URL : un lien « les codes révoqués » doit
    // pouvoir être partagé et rechargé, comme sur la liste des élèves.
    const params = new URLSearchParams(searchParams);
    if (next) params.set('status', next);
    else params.delete('status');
    setSearchParams(params, { replace: true });
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (generating) return;

    const form = new FormData(event.currentTarget);
    const payload = {
      label: form.get('label'),
      quantity: Number(form.get('quantity')),
    };

    const accessDays = form.get('accessDays');
    const accessEndsAt = form.get('accessEndsAt');
    const redeemBy = form.get('redeemBy');
    const notes = form.get('notes');
    const planVersionId = form.get('planVersionId');
    const studentSeats = form.get('studentSeats');

    if (accessDays) payload.accessDays = Number(accessDays);
    if (accessEndsAt) payload.accessEndsAt = accessEndsAt;
    if (redeemBy) payload.redeemBy = redeemBy;
    if (notes) payload.notes = notes;
    // L'OFFRE que chaque code active : la vente en nombre à une école ou une
    // classe. Facultatif — sans elle, le lot ouvre le droit premium élève
    // classique, comme avant.
    if (planVersionId) payload.planVersionId = Number(planVersionId);
    // La CAPACITÉ que chaque code ouvre (offre par sièges) : « 10 codes ×
    // 30 élèves ». Un nombre, jamais un prix — le serveur le calcule.
    if (studentSeats) payload.studentSeats = Number(studentSeats);

    setGenerating(true);
    setFormError(null);
    try {
      const result = await generateActivationBatch(token, payload);
      setGenerated(result);
      setFormOpen(false);
      reload();
    } catch (caught) {
      setFormError(caught.message || t('activation.generateFailed'));
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadActivationCodesCsv(token, { search: debouncedSearch, status, batch });
    } catch {
      /* l'échec est visible : aucun fichier ne descend */
    } finally {
      setExporting(false);
    }
  };

  const counts = data?.counts ?? {};

  const columns = [
    {
      key: 'hint',
      label: t('activation.columnHint'),
      render: (row) => (
        <Link to={`/admin/codes-activation/${row.id}`} className="font-mono-jetbrains text-xs text-violet-700 hover:underline">
          <Num>••••-••••-{row.hint}</Num>
        </Link>
      ),
    },
    { key: 'batchLabel', label: t('activation.columnBatch'), render: (row) => row.batchLabel ?? t('common.dash') },
    { key: 'status', label: t('activation.columnStatus'), render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'activatedBy',
      label: t('activation.columnActivatedBy'),
      render: (row) => (row.activatedBy
        ? <Link to={`/admin/eleves/${row.activatedBy.id}`} className="text-violet-700 hover:underline"><Num>{row.activatedBy.email}</Num></Link>
        : t('common.dash')),
    },
    { key: 'activatedAt', label: t('activation.columnActivatedAt'), render: (row) => formatDate(row.activatedAt) },
    { key: 'expiresAt', label: t('activation.columnExpiresAt'), render: (row) => formatDate(row.expiresAt) },
    { key: 'createdAt', label: t('activation.columnCreated'), render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <AdminPage
      eyebrow={t('activation.eyebrow')}
      title={t('activation.title')}
      subtitle={t('activation.subtitle')}
      actions={(
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExport} disabled={exporting} className={btnSecondary}>
            <Download size={14} />
            {exporting ? t('activation.exporting') : t('activation.exportCsv')}
          </button>
          <button
            type="button"
            onClick={() => { setFormOpen(true); setFormError(null); }}
            className={btnPrimary}
          >
            <Plus size={14} />
            {t('activation.generate')}
          </button>
        </div>
      )}
    >
      <div className="space-y-3">
        {/* Les codes tout juste produits — montrés UNE fois. */}
        {generated && (
          <GeneratedCodesPanel
            batch={generated.batch}
            codes={generated.codes}
            onClose={() => setGenerated(null)}
          />
        )}

        {/* LE SÉPARATEUR N'EST PAS DU TEXTE. Écrit « · » en tête de chaque
            segment, il se retrouvait détaché du segment qu'il sépare dès que
            celui-ci commence par un chiffre : « 0 · » au lieu de « · 0 ».
            Porté par la mise en page (`divide-x-reverse`), il se place du bon
            côté quelle que soit la direction, et disparaît du texte lu à voix
            haute par un lecteur d'écran. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-inter text-xs text-slate-600">
          {[
            ['total', t('activation.countTotal', { count: counts.total ?? 0 })],
            ['available', t('activation.countAvailable', { count: counts.available ?? 0 })],
            ['activated', t('activation.countActivated', { count: counts.activated ?? 0 })],
            ['expired', t('activation.countExpired', { count: counts.expired ?? 0 })],
            ['revoked', t('activation.countRevoked', { count: counts.revoked ?? 0 })],
          ].map(([key, text], i) => (
            <span key={key} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="text-slate-300">·</span>}
              <span className={key === 'total' ? 'font-semibold text-slate-800' : undefined}>{text}</span>
            </span>
          ))}
        </div>

        <FilterBar>
          <SearchInput
            value={search}
            onChange={(value) => { setSearch(value); setPage(1); }}
            placeholder={t('activation.searchPlaceholder')}
            label={L.filters.searchLabel}
          />
          <SelectFilter
            value={status}
            onChange={applyStatus}
            options={STATUS_VALUES.map((value) => ({ value, label: t(`status.${value}`) }))}
            label={t('activation.columnStatus')}
            allLabel={t('activation.allStatuses')}
          />
          <SelectFilter
            value={batch}
            onChange={(value) => { setBatch(value); setPage(1); }}
            options={batchOptions}
            label={t('activation.columnBatch')}
            allLabel={t('activation.allBatches')}
          />
        </FilterBar>

        <DataTable
          labels={L.table}
          columns={columns}
          rows={data?.codes?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={<EmptyState title={t('activation.emptyTitle')} hint={t('activation.emptyHint')} />}
        />

        <Pagination meta={data?.codes} onPage={setPage} labels={L.pagination} />
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t('activation.generateTitle')}
        closeLabel={L.dialog.closeLabel}
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <Field label={t('activation.batchName')} hint={t('activation.batchNameHint')}>
            <input name="label" required maxLength={120} className={input} />
          </Field>

          <Field label={t('activation.quantity')} hint={t('activation.quantityHint')}>
            <input name="quantity" type="number" min={1} max={500} defaultValue={50} required dir="ltr" className={input} />
          </Field>

          <fieldset className="rounded-lg border border-slate-200 p-3">
            <legend className="px-1 font-inter text-xs font-semibold text-slate-700">{t('activation.accessDuration')}</legend>
            <p className="mb-2 font-inter text-xs text-slate-500">
              {t('activation.accessDurationHint')}
            </p>
            <Field label={t('activation.accessDays')} hint={t('activation.accessDaysHint')}>
              <input name="accessDays" type="number" min={1} max={3650} dir="ltr" className={input} />
            </Field>
            <Field label={t('activation.accessEndsAt')} hint={t('activation.accessEndsAtHint')}>
              <input name="accessEndsAt" type="date" dir="ltr" className={input} />
            </Field>
          </fieldset>

          <Field label={t('activation.redeemBy')} hint={t('activation.redeemByHint')}>
            <input name="redeemBy" type="date" dir="ltr" className={input} />
          </Field>

          <Field label={t('common.note')}>
            <textarea name="notes" rows={2} maxLength={2000} className={input} />
          </Field>

          {/* L'OFFRE que chaque code active — la vente en nombre à une école
              ou une classe (X codes = X activations). Facultatif : sans
              offre, le lot ouvre le droit premium élève classique. */}
          <Field label={t('activation.planLabel')} hint={t('activation.planHint')}>
            <select name="planVersionId" className={input} value={selectedVersionId} onChange={(e) => setSelectedVersionId(e.target.value)}>
              <option value="">{t('activation.planNone')}</option>
              {plans.map((p) => (
                <option key={p.id} value={p.currentVersionId ?? ''} disabled={!p.currentVersionId}>
                  {p.type === 'teacher' ? t('status.teacher') : t('status.student')} · {p.name}
                  {p.currentVersion ? ` (v${p.currentVersion})` : ` — ${t('activation.planNoPublishedVersion')}`}
                </option>
              ))}
            </select>
          </Field>

          {(() => {
            const plan = plans.find((p) => String(p.currentVersionId) === String(selectedVersionId));
            if (!plan?.seatBased) return null;
            const quote = quoteSeats(plan.pricingTiers ?? [], Number(batchSeats));
            return (
              <Field label={t('activation.seatsPerCode')} hint={t('activation.seatsPerCodeHint')}>
                <input name="studentSeats" type="number" min={1} required dir="ltr" value={batchSeats} onChange={(e) => setBatchSeats(e.target.value)} className={input} />
                {batchSeats && (
                  <p className="mt-1 font-inter text-[11px] text-slate-500" data-batch-quote>
                    {quote
                      ? t('activation.seatsQuote', {
                        tier: quote.tier.label,
                        unit: formatEur(quote.unitPriceCents),
                        total: formatEur(quote.totalCents),
                      })
                      : t('activation.seatsNoTier')}
                  </p>
                )}
              </Field>
            );
          })()}

          {formError && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-2 font-inter text-xs text-rose-800">
              {formError}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className={btnSecondary}>
              {L.dialog.cancelLabel}
            </button>
            <button type="submit" disabled={generating} className={btnPrimary}>
              {generating ? t('activation.generating') : t('common.create')}
            </button>
          </div>
        </form>
      </Modal>
    </AdminPage>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="mb-3 block last:mb-0">
      <span className="mb-1 block font-inter text-xs font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-inter text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

/**
 * Les codes en clair, montrés UNE SEULE FOIS.
 *
 * La base n'en garde qu'une empreinte : ni cet écran, ni aucun autre, ne
 * pourra les réafficher. L'avertissement n'est donc pas une précaution de
 * style — c'est la description exacte de ce qui se passe si l'administrateur
 * ferme ce panneau sans enregistrer le fichier.
 */
function GeneratedCodesPanel({ batch, codes, onClose }) {
  const { t } = useTranslation('admin');

  return (
    <section className="rounded-xl border border-amber-300 bg-amber-50 p-4">
      <div className="mb-3 flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <h2 className="font-space text-sm font-bold text-amber-900">
            {t('activation.generatedHeading', { count: codes.length, label: batch?.label ?? '' })}
          </h2>
          <p className="mt-0.5 font-inter text-xs text-amber-800">
            {t('activation.generatedWarning')}
          </p>
        </div>
        <button type="button" onClick={onClose} className="shrink-0 font-inter text-xs font-semibold text-amber-900 hover:underline">
          {t('common.close')}
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => downloadGeneratedCodesCsv(batch, codes)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 font-inter text-xs font-semibold text-white hover:bg-amber-700"
        >
          <Download size={14} />
          {t('activation.downloadCsv')}
        </button>
      </div>

      <div className="max-h-56 overflow-auto rounded-lg border border-amber-200 bg-white p-3">
        <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4">
          {codes.map((code) => (
            <li key={code.id} className="font-mono-jetbrains text-xs text-slate-800" dir="ltr">
              {code.code}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
