import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, CheckCircle2, Loader2, MapPin, Home, Store } from 'lucide-react';
import { fetchWilayas, submitBookOrder } from './bookService';
import { S, formatDa } from './strings';
import SearchSelect from './SearchSelect';
import { filterOptions } from './dzSearch';
import { normalizePhone, validateOrder } from './orderValidation';
import { trackPixel } from './metaPixel';
import { DELIVERY_MODES, deliveryFeeFor, orderTotal } from './delivery';

const field = 'h-14 w-full rounded-xl border bg-white px-3.5 font-inter text-base text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';
const lbl = 'mb-1.5 block font-inter text-sm font-semibold text-slate-700';
const errCls = 'mt-1.5 font-inter text-sm font-medium text-rose-600';

const EMPTY = { customerName: '', phone: '', email: '', wilaya: '', commune: '', customerNote: '', quantity: 1, deliveryMode: 'home', website: '' };
// Un champ refusé par le serveur (422) → la clé de SON message arabe.
const SERVER_FIELD = { customerName: 'name', phone: 'phone', wilaya: 'wilaya', commune: 'commune', quantity: 'quantity' };
const FIELD_ORDER = ['customerName', 'phone', 'wilaya', 'commune'];

/** Le brouillon survit à un rechargement ou à un aller-retour dans le navigateur de WhatsApp. */
const draftKey = (slug) => `sa-book-order:${slug}`;
function readDraft(slug) {
  try {
    const raw = window.sessionStorage.getItem(draftKey(slug));
    return raw ? { ...EMPTY, ...JSON.parse(raw), website: '' } : EMPTY;
  } catch { return EMPTY; }
}
function writeDraft(slug, form) {
  try {
    const { website, ...rest } = form; // eslint-disable-line no-unused-vars
    window.sessionStorage.setItem(draftKey(slug), JSON.stringify(rest));
  } catch { /* stockage indisponible : le formulaire marche sans */ }
}
function clearDraft(slug) {
  try { window.sessionStorage.removeItem(draftKey(slug)); } catch { /* idem */ }
}

/**
 * Le formulaire de commande d'un livre — téléphone d'abord (BOOKS_STORE.md §4).
 * AUCUN paiement en ligne. Le client choisit le mode de livraison (à domicile ou
 * stop-desk) ; le frais de SA wilaya (tarif du transporteur, `GET /books/wilayas`)
 * s'affiche dès la wilaya choisie, avec le total à payer à la réception. Ce frais
 * n'est qu'affiché : le serveur fige le prix et recalcule le frais lui-même, on ne
 * l'envoie jamais. Une wilaya sans tarif (`delivery: null`) : le frais se fixe à
 * l'appel de confirmation, et le total affiché dit qu'il est « دون التوصيل ».
 * Plus d'adresse (2026-11-13) : wilaya + commune, l'adresse exacte se demande au téléphone.
 *
 * - Wilaya : numérotée, cherchée par numéro OU par nom (arabe affiché seul) ; un nom
 *   de COMMUNE la trouve aussi et remplit les deux champs.
 * - Commune : inactive tant qu'aucune wilaya n'est choisie, puis la liste arabe de
 *   CETTE wilaya (`data/dzCommunes.json`, chargé à part).
 * - Chaque champ dit son erreur en arabe (au départ du champ, puis à l'envoi) ;
 *   un refus du serveur (422) revient sous le champ concerné.
 * - Le bouton BAT 3 fois quand le formulaire devient complet — jamais sur un
 *   formulaire vide, jamais sous `prefers-reduced-motion` (conseil 2026-11-13).
 * `website` est le pot de miel (champ caché) : un humain ne le remplit pas.
 */
export default function OrderForm({ book }) {
  const [form, setForm] = useState(() => readDraft(book.slug));
  const [wilayas, setWilayas] = useState([]);
  const [communes, setCommunes] = useState(null);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const [pulseKey, setPulseKey] = useState(0);
  const startedRef = useRef(false);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const wilayaRef = useRef(null);
  const communeRef = useRef(null);
  const refs = { customerName: nameRef, phone: phoneRef, wilaya: wilayaRef, commune: communeRef };

  useEffect(() => {
    fetchWilayas().then((d) => setWilayas(d.wilayas ?? [])).catch(() => setWilayas([]));
    import('./data/dzCommunes.json').then((m) => setCommunes(m.default)).catch(() => setCommunes({}));
  }, []);

  useEffect(() => { if (!done) writeDraft(book.slug, form); }, [book.slug, form, done]);

  const localErrors = useMemo(() => validateOrder(form), [form]);
  const errors = { ...localErrors, ...serverErrors };
  const ready = Object.keys(localErrors).length === 0;

  // Le battement se rejoue chaque fois que le formulaire DEVIENT complet.
  const wasReady = useRef(ready);
  useEffect(() => {
    if (ready && !wasReady.current) setPulseKey((k) => k + 1);
    wasReady.current = ready;
  }, [ready]);

  const clearServer = (...keys) => setServerErrors((e) => {
    const next = { ...e };
    keys.forEach((k) => delete next[k]);
    return next;
  });
  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((f) => ({ ...f, [key]: value }));
    clearServer(key);
  };
  const touch = (key) => () => setTouched((t) => ({ ...t, [key]: true }));
  const setQty = (delta) => {
    setForm((f) => ({ ...f, quantity: Math.min(10, Math.max(1, (Number(f.quantity) || 1) + delta)) }));
    clearServer('quantity');
  };
  const shownError = (key) => ((touched[key] || serverErrors[key]) && errors[key] ? S.order.errors[errors[key]] : null);

  const selectedWilaya = wilayas.find((w) => w.label === form.wilaya) ?? null;

  const wilayaOptions = useMemo(
    () => wilayas.map((w) => ({ value: w.label, label: w.ar, code: w.id, terms: [w.ar, w.fr] })),
    [wilayas],
  );
  const communeOptions = useMemo(
    () => (selectedWilaya && communes?.[selectedWilaya.id]
      ? communes[selectedWilaya.id].map(([ar, latin]) => ({ value: ar, label: ar, terms: [ar, latin] }))
      : []),
    [selectedWilaya, communes],
  );

  // Toutes les communes, pour retrouver une wilaya par le nom d'une de ses communes
  // (« بوسعادة » → 28 المسيلة) : un client d'une wilaya créée en 2025 trouve la sienne.
  const allCommunes = useMemo(() => {
    if (!communes || !wilayas.length) return [];
    return wilayas.flatMap((w) => (communes[w.id] ?? []).map(([ar, latin]) => ({ key: `${w.id}:${ar}`, ar, wilaya: w, terms: [ar, latin] })));
  }, [communes, wilayas]);

  const pickWilaya = useCallback((label) => {
    setForm((f) => (f.wilaya === label ? f : { ...f, wilaya: label, commune: '' }));
    clearServer('wilaya', 'commune');
    setTouched((t) => ({ ...t, wilaya: true }));
    // Le champ suivant prend la main (sans s'ouvrir : deux listes plein écran d'affilée désorientent).
    requestAnimationFrame(() => communeRef.current?.focus());
  }, []);
  const pickCommune = useCallback((commune) => {
    setForm((f) => ({ ...f, commune }));
    clearServer('commune');
    setTouched((t) => ({ ...t, commune: true }));
  }, []);

  const wilayaExtras = useCallback((query) => {
    const q = query.trim();
    if (q.length < 2 || /^[\d٠-٩]+$/.test(q)) return [];
    return filterOptions(allCommunes, q).slice(0, 8).map((c) => ({
      key: c.key,
      code: c.wilaya.id,
      label: c.ar,
      hint: S.order.communeIn(c.wilaya.ar),
      pick: () => {
        setForm((f) => ({ ...f, wilaya: c.wilaya.label, commune: c.ar }));
        clearServer('wilaya', 'commune');
        setTouched((t) => ({ ...t, wilaya: true, commune: true }));
      },
    }));
  }, [allCommunes]);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!ready) {
      setTouched({ customerName: true, phone: true, wilaya: true, commune: true });
      refs[FIELD_ORDER.find((k) => localErrors[k])]?.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await submitBookOrder(book.slug, {
        ...form,
        phone: normalizePhone(form.phone),
        quantity: Math.min(10, Math.max(1, Number(form.quantity) || 1)),
        deliveryMode: DELIVERY_MODES.includes(form.deliveryMode) ? form.deliveryMode : 'home',
        email: form.email || null,
        customerNote: form.customerNote || null,
      });
      trackPixel('Lead', { content_name: book.title, content_ids: [book.slug], content_type: 'product', value: book.price * (Number(form.quantity) || 1), currency: 'DZD', num_items: Number(form.quantity) || 1 });
      clearDraft(book.slug);
      setDone({ reference: result.reference, total: result.total ?? null, deliveryFee: result.deliveryFee ?? null });
      setForm(EMPTY);
      setTouched({});
    } catch (caught) {
      const mapped = {};
      (caught.fields ?? []).forEach((f) => { if (SERVER_FIELD[f]) mapped[f] = SERVER_FIELD[f]; });
      setServerErrors(mapped);
      // Un champ connu : son message est sous le champ. Sinon, le message général.
      setError(Object.keys(mapped).length ? null : S.order.failed);
      const first = FIELD_ORDER.find((k) => mapped[k]);
      if (first) refs[first].current?.focus();
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    const feeKnown = done.deliveryFee !== null && done.total !== null;
    return (
      <div role="status" className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto mb-3 text-emerald-600" size={44} />
        <h3 className="font-space text-2xl font-bold text-slate-900">{S.order.successTitle}</h3>
        <p className="mx-auto mt-2 max-w-md font-inter text-slate-600">{feeKnown ? S.order.successBody : S.order.successBodyLater}</p>
        <p dir="ltr" className="mt-3 inline-block rounded-xl bg-white px-4 py-2 font-mono-jetbrains text-lg font-bold text-slate-900">{done.reference}</p>
        {feeKnown && (
          <p className="mt-3 font-inter text-slate-700">
            {S.order.successAmount} <span dir="ltr" className="font-space text-lg font-bold text-slate-900">{formatDa(done.total)}</span>
          </p>
        )}
        <div className="mt-5">
          <button type="button" onClick={() => setDone(null)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 font-inter text-sm font-semibold text-slate-700 hover:bg-slate-50">
            {S.order.another}
          </button>
        </div>
      </div>
    );
  }

  const fee = deliveryFeeFor(selectedWilaya, form.deliveryMode);
  const total = orderTotal(book.price, form.quantity, fee);
  const homeFee = deliveryFeeFor(selectedWilaya, 'home');
  const deskFee = deliveryFeeFor(selectedWilaya, 'desk');
  // Sans wilaya, ou une wilaya sans tarif : une seule phrase sous les deux cartes.
  const deliveryHint = !selectedWilaya ? S.order.deliveryChooseWilaya : (homeFee === null && deskFee === null ? S.order.deliveryNoTariff : null);
  const border = (key) => (shownError(key) ? 'border-rose-400' : 'border-slate-300');

  return (
    <form
      onSubmit={submit}
      // Premier champ touché = le visiteur COMMENCE sa commande (Meta : InitiateCheckout, une seule fois).
      onFocusCapture={() => {
        if (startedRef.current) return;
        startedRef.current = true;
        trackPixel('InitiateCheckout', { content_name: book.title, content_ids: [book.slug], content_type: 'product', value: book.price, currency: 'DZD' });
      }}
      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8"
      noValidate
    >
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <div>
          <label className={lbl} htmlFor="bo-name">{S.order.name}</label>
          <input
            ref={nameRef} id="bo-name" autoComplete="name" enterKeyHint="next"
            aria-invalid={Boolean(shownError('customerName'))} aria-describedby="bo-name-err"
            className={`${field} ${border('customerName')}`} value={form.customerName}
            onChange={set('customerName')} onBlur={touch('customerName')}
          />
          {shownError('customerName') && <p id="bo-name-err" className={errCls}>{shownError('customerName')}</p>}
        </div>
        <div>
          <label className={lbl} htmlFor="bo-phone">{S.order.phone}</label>
          <input
            ref={phoneRef} id="bo-phone" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" enterKeyHint="next"
            placeholder={S.order.phonePlaceholder}
            aria-invalid={Boolean(shownError('phone'))} aria-describedby="bo-phone-hint"
            className={`${field} ${border('phone')} text-end tracking-wide`} value={form.phone}
            onChange={set('phone')} onBlur={touch('phone')}
          />
          {shownError('phone')
            ? <p id="bo-phone-hint" className={errCls}>{shownError('phone')}</p>
            : <p id="bo-phone-hint" className="mt-1.5 font-inter text-xs text-slate-500">{S.order.phoneHint}</p>}
        </div>
        <div>
          <label className={lbl} htmlFor="bo-wilaya">{S.order.wilaya}</label>
          <SearchSelect
            ref={wilayaRef} id="bo-wilaya" label={S.order.wilaya} value={form.wilaya} options={wilayaOptions}
            onChange={pickWilaya} extras={wilayaExtras} extrasTitle={S.order.wilayaByCommune}
            placeholder={S.order.wilayaPlaceholder} searchPlaceholder={S.order.wilayaSearch} emptyText={S.order.wilayaEmpty}
            loading={!wilayas.length} invalid={Boolean(shownError('wilaya'))} describedBy="bo-wilaya-err"
          />
          {shownError('wilaya') && <p id="bo-wilaya-err" className={errCls}>{shownError('wilaya')}</p>}
        </div>
        <div>
          <label className={lbl} htmlFor="bo-commune">{S.order.commune}</label>
          <SearchSelect
            ref={communeRef} id="bo-commune" label={S.order.commune} value={form.commune} options={communeOptions}
            onChange={pickCommune} placeholder={S.order.communePlaceholder} searchPlaceholder={S.order.communeSearch}
            emptyText={S.order.communeEmpty} disabled={!selectedWilaya} disabledHint={S.order.communeDisabled}
            loading={Boolean(selectedWilaya) && !communes} invalid={Boolean(shownError('commune'))} describedBy="bo-commune-hint"
          />
          {shownError('commune')
            ? <p id="bo-commune-hint" className={errCls}>{shownError('commune')}</p>
            : (
              <p id="bo-commune-hint" className="mt-1.5 flex items-center gap-1 font-inter text-xs text-slate-500">
                <MapPin size={12} aria-hidden="true" />{S.order.addressByPhone}
              </p>
            )}
        </div>
        {/* Le mode de livraison : deux cartes côte à côte, même sur 360 px ; chaque carte dit SON frais. */}
        <fieldset className="min-w-0 md:col-span-2" aria-describedby={deliveryHint ? 'bo-delivery-hint' : undefined}>
          <legend className={lbl}>{S.order.deliveryMode}</legend>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {DELIVERY_MODES.map((mode) => {
              const checked = form.deliveryMode === mode;
              const modeFee = mode === 'home' ? homeFee : deskFee;
              const Icon = mode === 'home' ? Home : Store;
              return (
                <label
                  key={mode}
                  className={`flex min-h-14 min-w-0 cursor-pointer items-start gap-2 rounded-xl border p-3 transition ${checked ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                >
                  <input
                    type="radio" name="bo-delivery" value={mode} checked={checked}
                    onChange={() => setForm((f) => ({ ...f, deliveryMode: mode }))}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-1.5 font-inter text-sm font-semibold leading-snug text-slate-800">
                      <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-blue-600" />
                      <span className="min-w-0">{S.order.deliveryModes[mode]}</span>
                    </span>
                    {modeFee !== null && (
                      <span className="mt-1 block font-space text-base font-bold text-slate-900"><span dir="ltr">{formatDa(modeFee)}</span></span>
                    )}
                    {mode === 'desk' && deskFee !== null && homeFee !== null && deskFee < homeFee && (
                      <span className="block font-inter text-xs font-semibold text-blue-700">{S.order.deliveryCheaper}</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
          {deliveryHint && <p id="bo-delivery-hint" className="mt-1.5 font-inter text-xs text-slate-500">{deliveryHint}</p>}
        </fieldset>
        <div className="md:col-span-2">
          <span className={lbl}>{S.order.quantity}</span>
          <div className="inline-flex items-center gap-3 rounded-xl border border-slate-300 bg-white p-1">
            <button type="button" onClick={() => setQty(-1)} disabled={(Number(form.quantity) || 1) <= 1} aria-label="-" className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 enabled:hover:bg-slate-100 disabled:opacity-40"><Minus size={16} /></button>
            {/* Le nombre se TAPE aussi (chiffres arabes ou latins), borné à 1–10 ; vide le temps de la frappe. */}
            <input
              id="bo-qty" dir="ltr" type="text" inputMode="numeric" autoComplete="off" enterKeyHint="done"
              aria-label={S.order.quantity} value={form.quantity}
              onChange={(event) => {
                const digits = event.target.value.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/\D/g, '');
                setForm((f) => ({ ...f, quantity: digits === '' ? '' : Math.min(10, Number(digits)) }));
                clearServer('quantity');
              }}
              onBlur={() => setForm((f) => ({ ...f, quantity: Math.max(1, Number(f.quantity) || 1) }))}
              onFocus={(event) => event.target.select()}
              className="h-11 w-14 rounded-lg border border-transparent bg-transparent text-center font-space text-lg font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button type="button" onClick={() => setQty(1)} disabled={Number(form.quantity) >= 10} aria-label="+" className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 enabled:hover:bg-slate-100 disabled:opacity-40"><Plus size={16} /></button>
          </div>
          {serverErrors.quantity && <p className={errCls}>{S.order.errors.quantity}</p>}
        </div>
        {/* Les champs FACULTATIFS sont repliés : chaque champ visible de plus coûte des
            commandes, surtout sur téléphone. Ouverts d'office s'ils sont déjà remplis. */}
        <details className="group md:col-span-2" open={Boolean(form.email || form.customerNote)}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center font-inter text-sm font-semibold text-blue-700 hover:underline">
            {S.order.optionalMore}
          </summary>
          <div className="mt-3 grid gap-4 sm:gap-5 md:grid-cols-2">
            <div>
              <label className={lbl} htmlFor="bo-email">{S.order.email}</label>
              <input id="bo-email" type="email" dir="ltr" autoComplete="email" className={`${field} border-slate-300 text-end`} value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className={lbl} htmlFor="bo-note">{S.order.note}</label>
              <input id="bo-note" className={`${field} border-slate-300`} value={form.customerNote} onChange={set('customerNote')} />
            </div>
          </div>
        </details>
      </div>

      {/* Pot de miel : hors écran, hors tabulation, hors lecteur d'écran. */}
      <div aria-hidden="true" style={{ position: 'absolute', insetInlineStart: '-9999px', height: 0, overflow: 'hidden' }}>
        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} name="website" />
      </div>

      {/* Le récapitulatif juste AU-DESSUS du bouton : le client voit ce qu'il paiera en appuyant. */}
      <dl className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-4 font-inter text-sm">
        <div className="flex justify-between gap-4"><dt className="text-slate-600">{S.order.price}</dt><dd dir="ltr" className="font-semibold">{formatDa(book.price)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-600">{S.order.delivery}</dt>{fee !== null
          ? <dd dir="ltr" className="font-semibold">{formatDa(fee)}</dd>
          : <dd className="text-end text-slate-500">{selectedWilaya ? S.order.deliveryLater : S.order.deliveryChooseWilaya}</dd>}</div>
        {/* Jamais un total qui tait un frais CONNU : le libellé dit si le frais y est. */}
        <div className="flex justify-between gap-4 border-t border-slate-200 pt-2"><dt className="font-semibold text-slate-800">{fee !== null ? S.order.totalOnDelivery : S.order.total}</dt><dd dir="ltr" className="font-space text-lg font-bold text-slate-900">{formatDa(total)}</dd></div>
      </dl>

      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-inter text-sm text-rose-700">{error}</p>}

      {/* `key` change quand le formulaire devient complet : l'animation repart de zéro. */}
      <button
        key={pulseKey}
        type="submit"
        disabled={busy}
        data-ready={ready || undefined}
        className={`mt-5 flex min-h-[60px] w-full flex-col items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 ${pulseKey > 0 ? 'motion-safe:animate-cta-ready' : ''}`}
      >
        <span className="inline-flex items-center gap-2 font-space text-lg font-bold leading-tight">
          {busy && <Loader2 size={18} className="animate-spin" />}
          {busy ? S.order.sending : S.order.submit}
        </span>
        {!busy && <span className="font-inter text-xs font-semibold text-blue-100">{S.order.submitCod}</span>}
      </button>
      <p className="mt-3 text-center font-inter text-xs text-slate-500">{S.order.noPayment}</p>
    </form>
  );
}
