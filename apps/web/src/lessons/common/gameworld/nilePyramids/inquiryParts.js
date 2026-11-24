/**
 * What the three experiment screens of this world share: the walks' hooks, the screen's timers, the words of a kind
 * and a number in LaTeX (one copy here: a world never imports another world).
 */
import { KIND_TEXT } from './strings';

/** Every screen exposes its state to the walks on `window.__inquiry` (dev only). */
export const expose = (state) => {
  if (import.meta.env.DEV && typeof window !== 'undefined') window.__inquiry = state;
};

/** The words of a kind: the world's, with the lesson's `spec.text` over them (one level deep). */
export function textOf(kind, spec) {
  const base = KIND_TEXT[kind];
  const out = { ...base };
  for (const [k, v] of Object.entries(spec.text ?? {}))
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && typeof base[k] === 'object' ? { ...base[k], ...v } : v;
  return out;
}

/** A number in LaTeX: « 42{,}5 », a fraction over a real bar (defects D41). */
export const texNum = (t) => {
  const [n, d] = String(t).split('/');
  const one = (x) => x.replace(',', '{,}');
  return d == null ? one(n) : `\\dfrac{${one(n)}}{${one(d)}}`;
};
