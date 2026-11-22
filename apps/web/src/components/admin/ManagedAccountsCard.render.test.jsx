import { describe, it, expect, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from '../../i18n';
import { AuthContext } from '../../context/AuthContext';
import ManagedAccountsCard, { ManagedAccountsView } from './ManagedAccountsCard';
import { fetchManagedAccounts, updateManagedAccounts } from '../../services/admin/managedAccountsService';

const t = i18n.getFixedT(null, 'admin');
const CLOSED = { open: false, default: false, lastChange: null };
const OPEN = {
  open: true,
  default: false,
  lastChange: { at: '2026-11-22T10:00:00+00:00', by: { id: 1, name: 'Ada Admin' } },
};

const view = (props) => (
  <ManagedAccountsView
    t={t}
    managedAccounts={CLOSED}
    loading={false}
    pending={null}
    saving={false}
    error={null}
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

describe('« Comptes créés par un établissement ou un professeur » — the administrator’s switch', () => {
  const original = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = original;
  });

  it('closed: the state, what closing does, that existing accounts keep working, never changed', () => {
    const out = html({});
    expect(out).toContain(t('managedAccounts.title'));
    expect(out).toContain('data-managed-accounts="closed"');
    expect(out).toContain(t('managedAccounts.closed'));
    expect(out).toContain(t('managedAccounts.closedHint'));
    expect(out).toContain('aria-checked="false"');
    expect(out).toContain(t('managedAccounts.existing'));
    expect(out).toContain('continue de se connecter avec son mot de passe actuel');
    expect(out).toContain(t('managedAccounts.neverChanged'));
    expect(out).not.toContain('data-managed-accounts-confirm=');
  });

  it('open: the state, what it allows, who changed it last and when', () => {
    const out = html({ managedAccounts: OPEN });
    expect(out).toContain('data-managed-accounts="open"');
    expect(out).toContain(t('managedAccounts.open'));
    expect(out).toContain(t('managedAccounts.openHint'));
    expect(out).toContain('aria-checked="true"');
    expect(out).toContain('Ada Admin');
    expect(out).not.toContain(t('managedAccounts.neverChanged'));
    expect(html({ managedAccounts: { ...OPEN, lastChange: { at: OPEN.lastChange.at, by: null } } })).toContain(
      'Dernier changement le',
    );
  });

  it('the switch asks for the opposite of its state; nothing is sent before the confirmation', () => {
    const asked = [];
    find(view({ onAsk: (v) => asked.push(v) }), 'data-managed-accounts-switch').props.onClick();
    find(view({ managedAccounts: OPEN, onAsk: (v) => asked.push(v) }), 'data-managed-accounts-switch').props.onClick();
    expect(asked).toEqual([true, false]);
  });

  it('the confirmation says what the change does, with confirm and cancel; the switch waits', () => {
    const opening = html({ pending: true });
    expect(opening).toContain('data-managed-accounts-confirm="open"');
    expect(opening).toContain(t('managedAccounts.confirmOpen'));
    expect(opening).toContain(t('managedAccounts.confirmOpenButton'));
    expect(opening).toContain(t('managedAccounts.cancel'));

    const closing = html({ managedAccounts: OPEN, pending: false });
    expect(closing).toContain('data-managed-accounts-confirm="close"');
    expect(closing).toContain(t('managedAccounts.confirmClose'));
    expect(closing).toContain(t('managedAccounts.confirmCloseButton'));

    const tree = view({ pending: true });
    expect(find(tree, 'data-managed-accounts-switch').props.disabled).toBe(true);
    let confirmed = 0;
    let cancelled = 0;
    const pressed = view({ pending: true, onConfirm: () => (confirmed += 1), onCancel: () => (cancelled += 1) });
    find(pressed, 'data-managed-accounts-confirm-yes').props.onClick();
    find(pressed, 'data-managed-accounts-confirm-no').props.onClick();
    expect([confirmed, cancelled]).toEqual([1, 1]);
  });

  it('saving, loading and the error lines', () => {
    expect(html({ saving: true })).toContain(t('managedAccounts.saving'));
    expect(html({ managedAccounts: null, loading: true })).toContain(t('managedAccounts.loading'));
    const failed = html({ managedAccounts: null, error: t('managedAccounts.loadError') });
    expect(failed).toContain('role="alert"');
    expect(failed).toContain(t('managedAccounts.loadError'));
  });

  it('the strings follow French typography (’, no-break spaces before : and ;)', () => {
    const strings = Object.values(i18n.getResource('fr', 'admin', 'managedAccounts'));
    for (const s of strings) {
      expect(s, s).not.toMatch(/'/);
      expect(s, s).not.toMatch(/ [:;!?]/);
    }
    expect(t('managedAccounts.existing')).toContain(' :');
    expect(t('managedAccounts.openHint')).toContain(' ;');
  });

  it('the service reads GET /admin/managed-accounts and sends PATCH { open }', async () => {
    let calls = mockFetch(200, { success: true, managedAccounts: CLOSED });
    expect(await fetchManagedAccounts('tk')).toEqual(CLOSED);
    expect(calls[0].url).toMatch(/\/admin\/managed-accounts$/);
    expect(calls[0].method).toBe('GET');

    calls = mockFetch(200, { success: true, managedAccounts: OPEN });
    expect(await updateManagedAccounts('tk', true)).toEqual(OPEN);
    expect(calls[0].method).toBe('PATCH');
    expect(calls[0].body).toEqual({ open: true });

    mockFetch(403, { success: false, message: 'Accès refusé.' });
    await expect(updateManagedAccounts('tk', false)).rejects.toThrow('Accès refusé.');
  });

  it('the mounted card says it loads', () => {
    const out = renderToStaticMarkup(
      <AuthContext.Provider value={{ token: 'tk', user: { role: 'admin' } }}>
        <ManagedAccountsCard />
      </AuthContext.Provider>,
    );
    expect(out).toContain(t('managedAccounts.title'));
    expect(out).toContain(t('managedAccounts.loading'));
  });
});
