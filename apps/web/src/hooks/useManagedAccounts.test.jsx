import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

// The store lives in the module: each test gets a fresh one.
async function fresh() {
  vi.resetModules();
  const hook = await import('./useManagedAccounts');
  const auth = await import('../context/AuthContext');
  return { ...hook, AuthContext: auth.AuthContext };
}

const original = globalThis.fetch;
const calls = [];
function serve(respond) {
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), headers: options.headers ?? {} });
    return respond(String(url));
  };
}
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function probe(m, token) {
  const Probe = () => {
    const { open, loaded } = m.useManagedAccounts();
    return <i data-open={String(open)} data-loaded={String(loaded)} />;
  };
  return renderToStaticMarkup(
    <m.AuthContext.Provider value={{ token, user: token ? { role: 'teacher' } : null }}>
      <Probe />
    </m.AuthContext.Provider>,
  );
}

describe('« accounts created by a school or a teacher » — the status reader', () => {
  beforeEach(() => {
    calls.length = 0;
  });
  afterEach(() => {
    globalThis.fetch = original;
  });

  it.each([
    ['open', { success: true, open: true }, true],
    ['closed', { success: true, open: false }, false],
    ['a body without `open`', { success: true }, false],
    ['`open` that is not a boolean', { success: true, open: 'yes' }, false],
  ])('GET /managed-accounts/status says %s', async (_, body, expected) => {
    serve(() => json(body));
    const m = await fresh();
    expect(await m.loadManagedAccountsStatus('tk')).toBe(expected);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toMatch(/\/managed-accounts\/status$/);
    expect(calls[0].headers.Authorization).toBe('Bearer tk');

    const html = probe(m, 'tk');
    expect(html).toContain(`data-open="${expected}"`);
    expect(html).toContain('data-loaded="true"');
  });

  it.each([
    ['the network fails', () => Promise.reject(new TypeError('offline'))],
    ['the server errs', () => json({ message: 'boom' }, 500)],
    ['the account is refused', () => json({ success: true, open: true }, 403)],
  ])('fails CLOSED when %s', async (_, respond) => {
    serve(respond);
    const m = await fresh();
    expect(await m.loadManagedAccountsStatus('tk')).toBe(false);
    const html = probe(m, 'tk');
    expect(html).toContain('data-open="false"');
    expect(html).toContain('data-loaded="true"');
  });

  it('before any answer: closed and not loaded (neither the button nor its sentence)', async () => {
    serve(() => json({ success: true, open: true }));
    const m = await fresh();
    const html = probe(m, 'tk');
    expect(html).toContain('data-open="false"');
    expect(html).toContain('data-loaded="false"');
  });

  it('reads ONCE per account: a second read, even a concurrent one, sends nothing', async () => {
    serve(() => json({ success: true, open: true }));
    const m = await fresh();
    const [a, b] = await Promise.all([m.loadManagedAccountsStatus('tk'), m.loadManagedAccountsStatus('tk')]);
    expect([a, b]).toEqual([true, true]);
    expect(await m.loadManagedAccountsStatus('tk')).toBe(true);
    expect(calls).toHaveLength(1);
  });

  it('another account reads again, and never sees the first one’s answer', async () => {
    serve(() => json({ success: true, open: true }));
    const m = await fresh();
    await m.loadManagedAccountsStatus('first');
    expect(probe(m, 'second')).toContain('data-loaded="false"');
    expect(probe(m, 'second')).toContain('data-open="false"');

    serve(() => json({ success: true, open: false }));
    expect(await m.loadManagedAccountsStatus('second')).toBe(false);
    expect(calls).toHaveLength(2);
    expect(probe(m, 'second')).toContain('data-open="false"');
    expect(probe(m, 'first')).toContain('data-loaded="false"');
  });

  it('without an account: nothing is read, and it is closed', async () => {
    serve(() => json({ success: true, open: true }));
    const m = await fresh();
    expect(await m.loadManagedAccountsStatus(null)).toBe(false);
    expect(calls).toHaveLength(0);
    expect(probe(m, null)).toContain('data-open="false"');
  });
});
