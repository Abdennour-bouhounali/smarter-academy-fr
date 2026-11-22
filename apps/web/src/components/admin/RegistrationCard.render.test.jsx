import { describe, it, expect, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from '../../i18n';
import { AuthContext } from '../../context/AuthContext';
import RegistrationCard, { RegistrationView, changeRegistration } from './RegistrationCard';
import Switch from './ui/Switch';

const t = i18n.getFixedT(null, 'admin');
const view = (props) => <RegistrationView t={t} loading={false} saving={false} error={null} onChange={() => {}} {...props} />;
const html = (props) => renderToStaticMarkup(view(props));

/** The view's element tree, every hook-free component expanded: its switches are found and pressed, no DOM needed. */
function expand(node) {
  if (Array.isArray(node)) return node.flatMap(expand);
  if (!node || typeof node !== 'object' || !node.props) return [];
  if (typeof node.type === 'function') return expand(node.type(node.props));
  return [node, ...expand(node.props.children)];
}
const switchOf = (tree, name) => expand(tree).find((el) => el.props['data-registration-switch'] === name);

function mockFetch(registration) {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method ?? 'GET', body: options.body && JSON.parse(options.body) });
    return new Response(JSON.stringify({ success: true, registration }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  return calls;
}

describe('« التسجيل » — la carte du tableau de bord', () => {
  const original = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = original;
  });

  it('dit l’état ouvert, sans l’interrupteur du lien de classe', () => {
    const out = html({ registration: { open: true, classLinks: true } });
    expect(out).toContain('التسجيل مفتوح');
    expect(out).toContain('role="switch"');
    expect(out).toContain('aria-checked="true"');
    expect(out).not.toContain('التسجيل برابط القسم');
    expect(out).not.toContain('data-registration-switch="classLinks"');
  });

  it('fermé : dit la liste d’attente, et montre le lien de classe avec son explication', () => {
    const out = html({ registration: { open: false, classLinks: true } });
    expect(out).toContain('التسجيل مغلق — الصفحة تعرض قائمة الانتظار');
    expect(out).toContain('التسجيل برابط القسم');
    expect(out).toContain('رغم إغلاق التسجيل');
    expect(out).toMatch(/aria-checked="false"[^>]*data-registration-switch="open"/);
    expect(out).toMatch(/aria-checked="true"[^>]*data-registration-switch="classLinks"/);
  });

  it('chaque interrupteur demande le contraire de son état ; désactivés pendant l’enregistrement', () => {
    const asked = [];
    const tree = view({ registration: { open: false, classLinks: true }, onChange: (c) => asked.push(c) });
    switchOf(tree, 'open').props.onClick();
    switchOf(tree, 'classLinks').props.onClick();
    expect(asked).toEqual([{ open: true }, { classLinks: false }]);

    const saving = view({ registration: { open: false, classLinks: false }, saving: true });
    expect(switchOf(saving, 'open').props.disabled).toBe(true);
    expect(switchOf(saving, 'classLinks').props.disabled).toBe(true);
    expect(renderToStaticMarkup(saving)).toContain('جارٍ الحفظ');
  });

  it('montre la ligne d’erreur', () => {
    const out = html({ registration: { open: false, classLinks: false }, error: t('registration.error') });
    expect(out).toContain('role="alert"');
    expect(out).toContain('تعذّر تغيير حالة التسجيل');
    expect(html({ registration: null, error: t('registration.loadError') })).toContain('تعذّرت قراءة حالة التسجيل');
  });

  it('OUVRIR demande une confirmation ; un refus n’envoie rien', async () => {
    const calls = mockFetch({ open: true, classLinks: true });
    const prompts = [];
    const refuse = { confirm: (m) => (prompts.push(m), false), confirmMessage: t('registration.confirmOpen') };
    expect(await changeRegistration('tk', { open: true }, refuse)).toBeNull();
    expect(calls).toHaveLength(0);
    expect(prompts).toEqual([t('registration.confirmOpen')]);

    const accept = { confirm: () => true, confirmMessage: 'x' };
    expect(await changeRegistration('tk', { open: true }, accept)).toEqual({ open: true, classLinks: true });
    expect(calls[0].url).toContain('/admin/registration');
    expect(calls[0].method).toBe('PATCH');
    expect(calls[0].body).toEqual({ open: true });
  });

  it('fermer, ou toucher au lien de classe, part sans confirmation', async () => {
    const calls = mockFetch({ open: false, classLinks: false });
    const never = { confirm: () => { throw new Error('asked'); }, confirmMessage: 'x' };
    await changeRegistration('tk', { open: false }, never);
    await changeRegistration('tk', { classLinks: false }, never);
    expect(calls.map((c) => c.body)).toEqual([{ open: false }, { classLinks: false }]);
  });

  it('un échec du serveur remonte (la carte en fait sa ligne d’erreur)', async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({ success: false }), { status: 500 });
    await expect(changeRegistration('tk', { open: false }, { confirm: () => true, confirmMessage: '' })).rejects.toThrow();
  });

  it('la carte montée dit qu’elle charge', () => {
    const out = renderToStaticMarkup(
      <AuthContext.Provider value={{ token: 'tk', user: { role: 'admin' } }}>
        <RegistrationCard />
      </AuthContext.Provider>,
    );
    expect(out).toContain('التسجيل');
    expect(out).toContain('جارٍ قراءة حالة التسجيل');
  });

  it('Switch : un vrai interrupteur accessible', () => {
    const out = renderToStaticMarkup(<Switch on={false} label="x" onToggle={() => {}} />);
    expect(out).toContain('role="switch"');
    expect(out).toContain('aria-checked="false"');
    expect(out).toContain('aria-label="x"');
  });
});
