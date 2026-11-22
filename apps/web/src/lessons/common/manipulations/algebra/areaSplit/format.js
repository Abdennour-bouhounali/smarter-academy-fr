import { Hand, LockKeyhole, CheckCircle2, Scissors, Sprout, PenLine } from 'lucide-react';
import { termTex } from '@smarter-academy/core/arithmetic/expansion.js';
import * as E from '@smarter-academy/core/arithmetic/expansion.js';
import * as L from '../../logic/areaSplit';

/** area-split — les mises en forme partagées par la vue : nombres en îlots LTR, termes en texte simple (avec le vrai signe moins), la bannière. */
const LRI = '⁦';
const PDI = '⁩';
export const iso = (s) => `${LRI}${s}${PDI}`;
/** Un nombre DANS une phrase rendue par MathText : un îlot KaTeX (un « −2 » ne se retourne jamais en « 2− »). */
export const num = (n) => `$${n}$`;
/** Un terme en LaTeX (« -2x^2 »). */
export const tex = (t) => termTex(t);
/** Un terme en texte simple pour le dessin et les aria-label : « −2x² », « x », « 4 ». */
export const plain = (t) => termTex(t).replace('^2', '²').replace(/^(-?)1x/, '$1x').replace(/-/g, '−');
/** Un terme entre parenthèses quand il est négatif (les dimensions d'une parcelle : « (−2) × (−3) »). */
const paren = (t) => (t.c < 0 ? `(${plain(t)})` : plain(t));
export const dimsOf = (p) => `${paren(p.hTerm)} × ${paren(p.wTerm)}`;
/** Le signe d'un produit partiel au dessin : « −6x », « +8x ». */
export const signed = (t, lead = false) => (lead ? plain(t) : `${t.c < 0 ? '−' : '+'} ${plain({ c: Math.abs(t.c), p: t.p })}`);

/**
 * La bannière : ce que le DERNIER geste a écrit, en une ligne et dans les nombres de l'élève. La ligne d'attente (le geste) se tait
 * quand le guide est visible : le geste n'est dit qu'une fois (MANIPULATION_CONTRACT §8quater, DNA §17.7).
 */
export function bannerOf(lab, k, coachVisible = false) {
  const last = lab.last;
  if (last?.event === 'refused') {
    if (last.reason === 'cut') {
      return { tone: 'rose', icon: LockKeyhole, refused: 'cut', text: k('refused.cut', { a: num(last.a), b: num(last.b), side: E.sideTex(L.sideOf(lab, last.side)) }) };
    }
    if (last.reason === 'arrow') return { tone: 'rose', icon: LockKeyhole, refused: 'arrow', text: k(`refused.arrow.${last.why}`) };
    if (last.reason === 'sign' && lab.world === 'arrows') {
      const a = lab.arrows.find((q) => q.id === last.id);
      return { tone: 'rose', icon: LockKeyhole, refused: 'sign', text: k('refused.productSign', { x: last.x, a: tex(a.a), b: tex(a.b), truth: num(last.truth), shown: num(last.shown) }) };
    }
    if (last.reason === 'sign') return { tone: 'rose', icon: LockKeyhole, refused: 'sign', text: k('refused.sign', { x: last.x, counted: num(last.counted), written: num(last.written) }) };
  }
  if (last?.event === 'check' && !last.ok) {
    return { tone: 'rose', icon: LockKeyhole, refused: 'coef', text: k('refused.coef', { x: last.x, counted: num(last.counted), written: num(last.written) }) };
  }
  if (lab.solvedNow) return { tone: 'emerald', icon: CheckCircle2, text: k(lab.custom ? 'b.solvedCustom' : 'b.solved') };
  if (last?.event === 'cut') return { tone: 'indigo', icon: Scissors, text: k('b.cut') };
  if (last?.event === 'patch') {
    const i = lab.patches.findIndex((p) => p.id === last.patch) + 1;
    const p = lab.patches[i - 1];
    return { tone: 'indigo', icon: Sprout, text: k(last.sign > 0 ? 'b.patchAdd' : 'b.patchTake', { n: i, area: num(E.patchArea(p, lab.x)) }) };
  }
  if (last?.event === 'arrow') return { tone: 'indigo', icon: PenLine, text: k('b.arrow') };
  if (last?.event === 'product') {
    const a = lab.arrows.find((q) => q.id === last.id);
    return { tone: 'indigo', icon: PenLine, text: k('b.product', { term: tex(a.term) }) };
  }
  if (last?.event === 'custom') return { tone: 'indigo', icon: Hand, text: k('b.custom') };
  if (coachVisible) return { tone: 'indigo', icon: Hand, text: '', idle: true };
  const ph = L.phaseOf(lab);
  return { tone: 'indigo', icon: Hand, text: k(`idle.${lab.world}.${ph}`), idle: true };
}
