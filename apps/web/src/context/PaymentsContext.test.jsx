import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

// The store lives in the module: each test gets a fresh one.
async function fresh() {
  vi.resetModules();
  return import('./PaymentsContext');
}

const original = globalThis.fetch;
const calls = [];
function serve(respond) {
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return respond(String(url));
  };
}
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('« are payments open? » — one answer for the web', () => {
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
  ])('GET /billing/status says %s', async (_, body, expected) => {
    serve(() => json(body));
    const m = await fresh();
    expect(await m.loadPaymentsStatus()).toBe(expected);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatch(/\/billing\/status$/);

    const Probe = () => {
      const { paymentsOpen, loaded } = m.usePayments();
      return <i data-open={String(paymentsOpen)} data-loaded={String(loaded)} />;
    };
    const html = renderToStaticMarkup(
      <m.PaymentsProvider>
        <Probe />
      </m.PaymentsProvider>,
    );
    expect(html).toContain(`data-open="${expected}"`);
    expect(html).toContain('data-loaded="true"');
  });

  it.each([
    ['the network fails', () => Promise.reject(new TypeError('offline'))],
    ['the server errs', () => json({ message: 'boom' }, 500)],
  ])('fails CLOSED when %s', async (_, respond) => {
    serve(respond);
    const m = await fresh();
    expect(await m.loadPaymentsStatus()).toBe(false);
    const Probe = () => <i data-open={String(m.usePayments().paymentsOpen)} data-loaded={String(m.usePayments().loaded)} />;
    const html = renderToStaticMarkup(
      <m.PaymentsProvider>
        <Probe />
      </m.PaymentsProvider>,
    );
    expect(html).toContain('data-open="false"');
    expect(html).toContain('data-loaded="true"');
  });

  it('is closed and not yet known before any answer — a route that sells waits instead of bouncing', async () => {
    const m = await fresh();
    const Probe = () => <i data-open={String(m.usePayments().paymentsOpen)} data-loaded={String(m.usePayments().loaded)} />;
    const html = renderToStaticMarkup(
      <m.PaymentsProvider>
        <Probe />
      </m.PaymentsProvider>,
    );
    expect(html).toContain('data-open="false"');
    expect(html).toContain('data-loaded="false"');
  });

  it('follows the switch carried by /content/availability and /me/feature-access; ignores anything but a boolean', async () => {
    const m = await fresh();
    const Probe = () => <i data-open={String(m.usePayments().paymentsOpen)} />;
    const read = () =>
      renderToStaticMarkup(
        <m.PaymentsProvider>
          <Probe />
        </m.PaymentsProvider>,
      );
    m.notePaymentsOpen(true);
    expect(read()).toContain('data-open="true"');
    m.notePaymentsOpen(undefined);
    m.notePaymentsOpen('false');
    expect(read()).toContain('data-open="true"');
    m.notePaymentsOpen(false);
    expect(read()).toContain('data-open="false"');
  });

  it('a failed status read never overrides what another server answer already said', async () => {
    serve(() => Promise.reject(new TypeError('offline')));
    const m = await fresh();
    m.notePaymentsOpen(true);
    expect(await m.loadPaymentsStatus()).toBe(true);
  });

  it('without a provider the app is closed; a provider value replaces the server (tests, previews)', async () => {
    const m = await fresh();
    const Probe = () => {
      const { paymentsOpen, loaded } = m.usePayments();
      return <i data-open={String(paymentsOpen)} data-loaded={String(loaded)} />;
    };
    expect(renderToStaticMarkup(<Probe />)).toBe('<i data-open="false" data-loaded="true"></i>');
    expect(
      renderToStaticMarkup(
        <m.PaymentsProvider value={{ paymentsOpen: true }}>
          <Probe />
        </m.PaymentsProvider>,
      ),
    ).toBe('<i data-open="true" data-loaded="true"></i>');
  });
});
