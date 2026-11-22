import { describe, it, expect, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from '../../i18n';
import { PaymentsSwitchView, changePayments } from './PaymentsSwitchCard';
import { fetchPaymentsSwitch } from '../../services/admin/paymentsSwitchService';

const t = i18n.getFixedT(null, 'admin');
const CLOSED = {
  open: false,
  default: false,
  provider: 'stripe',
  mode: 'test',
  configured: false,
  missing: ['STRIPE_SECRET', 'STRIPE_WEBHOOK_SECRET'],
  lastChange: null,
};
const OPEN = { ...CLOSED, open: true, configured: true, missing: [], mode: 'live', lastChange: { at: '2026-11-22T10:00:00+00:00', by: { id: 1, name: 'Ada Admin' } } };

const view = (props) => (
  <PaymentsSwitchView
    t={t}
    payments={CLOSED}
    loading={false}
    pending={null}
    saving={false}
    error={null}
    refusal={null}
    onAsk={() => {}}
    onConfirm={() => {}}
    onCancel={() => {}}
    {...props}
  />
);
const html = (props) => renderToStaticMarkup(view(props));

/** The view's element tree, every hook-free component expanded: its buttons are found and pressed, no DOM needed. */
function expand(node) {
  if (Array.isArray(node)) return node.flatMap(expand);
  if (!node || typeof node !== 'object' || !node.props) return [];
  if (typeof node.type === 'function') return expand(node.type(node.props));
  return [node, ...expand(node.props.children)];
}
const find = (tree, attribute) => expand(tree).find((el) => el.props[attribute] !== undefined);

function mockFetch(status, body) {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method ?? 'GET', body: options.body && JSON.parse(options.body) });
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  };
  return calls;
}

describe('« Paiement en ligne » — the administrator’s switch', () => {
  const original = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = original;
  });

  it('closed and not configured: the state, the provider, test mode, the NAMES of what is missing, never changed', () => {
    const out = html({});
    expect(out).toContain('data-payments="closed"');
    expect(out).toContain(t('payments.closed'));
    expect(out).toContain('aria-checked="false"');
    expect(out).toContain('stripe');
    expect(out).toContain(t('payments.modeTest'));
    expect(out).toContain(t('payments.notConfigured'));
    expect(out).toContain('STRIPE_SECRET');
    expect(out).toContain('STRIPE_WEBHOOK_SECRET');
    expect(out).toContain(t('payments.neverChanged'));
  });

  it('open and configured: live mode, nothing missing, who changed it last and when', () => {
    const out = html({ payments: OPEN });
    expect(out).toContain('data-payments="open"');
    expect(out).toContain(t('payments.open'));
    expect(out).toContain('aria-checked="true"');
    expect(out).toContain(t('payments.modeLive'));
    expect(out).toContain(t('payments.configured'));
    expect(out).not.toContain('data-payments-missing');
    expect(out).toContain('Ada Admin');
    expect(out).not.toContain(t('payments.neverChanged'));
  });

  it('the switch asks for the opposite of its state, and nothing is sent before the confirmation', () => {
    const asked = [];
    find(view({ onAsk: (next) => asked.push(next) }), 'data-payments-switch').props.onClick();
    find(view({ payments: OPEN, onAsk: (next) => asked.push(next) }), 'data-payments-switch').props.onClick();
    expect(asked).toEqual([true, false]);
    expect(html({})).not.toContain('data-payments-confirm');
  });

  it.each([
    [true, 'payments.confirmOpen', 'open'],
    [false, 'payments.confirmClose', 'close'],
  ])('pending %s: one sentence says what the change does; confirm or cancel', (pending, key, mark) => {
    const out = html({ pending });
    expect(out).toContain(`data-payments-confirm="${mark}"`);
    expect(out).toContain(t(key));
    const done = [];
    const tree = view({ pending, onConfirm: () => done.push('yes'), onCancel: () => done.push('no') });
    find(tree, 'data-payments-confirm-yes').props.onClick();
    find(tree, 'data-payments-confirm-no').props.onClick();
    expect(done).toEqual(['yes', 'no']);
    // The switch cannot be pressed again while a change waits for its answer.
    expect(find(tree, 'data-payments-switch').props.disabled).toBe(true);
  });

  it('shows the refusal `payments_not_configured` with its missing list', () => {
    const out = html({ refusal: { missing: ['STRIPE_PRICE_ANNUAL'] } });
    expect(out).toContain('data-payments-refusal');
    expect(out).toContain('role="alert"');
    expect(out).toContain(t('payments.refusedNotConfigured'));
    expect(out).toContain('STRIPE_PRICE_ANNUAL');
  });

  it('shows the loading and error lines', () => {
    expect(html({ payments: null, loading: true })).toContain(t('payments.loading'));
    expect(html({ payments: null, error: t('payments.loadError') })).toContain(t('payments.loadError'));
    expect(html({ saving: true })).toContain(t('payments.saving'));
  });

  it('reads GET /admin/payments/switch', async () => {
    const calls = mockFetch(200, { success: true, payments: CLOSED });
    expect(await fetchPaymentsSwitch('tok')).toEqual(CLOSED);
    expect(calls).toEqual([{ url: expect.stringMatching(/\/admin\/payments\/switch$/), method: 'GET', body: undefined }]);
  });

  it('a confirmed change PATCHes the switch and returns the server’s new state', async () => {
    const calls = mockFetch(200, { success: true, payments: OPEN });
    expect(await changePayments('tok', true)).toEqual({ payments: OPEN });
    expect(calls).toEqual([{ url: expect.stringMatching(/\/admin\/payments\/switch$/), method: 'PATCH', body: { open: true } }]);
  });

  it('opening refused because the provider is not configured: the refusal and its names, not an error', async () => {
    mockFetch(422, { success: false, code: 'payments_not_configured', message: 'x', missing: ['STRIPE_SECRET'] });
    expect(await changePayments('tok', true)).toEqual({ refusal: { missing: ['STRIPE_SECRET'] } });
  });

  it('any other failure is an error', async () => {
    mockFetch(403, { message: 'Forbidden' });
    await expect(changePayments('tok', false)).rejects.toMatchObject({ status: 403 });
  });
});
