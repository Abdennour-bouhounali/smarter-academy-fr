import { Hand, LockKeyhole, CheckCircle2, Sparkles, PackageOpen } from 'lucide-react';
import { termTex } from '@smarter-academy/core/arithmetic/polynomials.js';
import * as L from '../../logic/likeTerms';

/** like-terms — les mises en forme partagées par la vue : îlots LTR, termes en LaTeX / en texte, la ligne de la bannière. */
const LRI = '⁦';
const PDI = '⁩';
export const iso = (s) => `${LRI}${s}${PDI}`;
/** Un nombre DANS une phrase rendue par MathText : un îlot KaTeX (un « −2 » ne se retourne jamais en « 2− »). */
export const num = (n) => `$${n}$`;
/** Un terme en LaTeX (« -2x^2 ») et en texte simple pour les aria-label (« −2x² »). */
export const tex = (c, p, lead = true) => termTex({ c, p }, { lead });
export const plain = (c, p) => tex(c, p).replace('^2', '²').replace(/^-/, '−');

/**
 * La bannière : ce que le DERNIER geste a écrit, en une ligne et dans les nombres de l'élève. La ligne d'attente (le geste) se tait
 * quand le guide est visible : le geste n'est dit qu'une fois (MANIPULATION_CONTRACT §8quater, DNA §17.7).
 */
export function bannerOf(lab, k, coachVisible = false) {
  const last = lab.last;
  const piece = (p) => k(`piece.${p}`);
  if (last?.event === 'refused' && last.reason === 'kind') {
    return { tone: 'rose', icon: LockKeyhole, refused: 'kind', text: k('refused.kind', { piece: piece(last.term.p), tray: k(`pieces.${last.tray}`), x: last.x, a: num(last.termValue), b: num(last.trayValue) }) };
  }
  if (last?.event === 'refused' && last.reason === 'sign') {
    return { tone: 'rose', icon: LockKeyhole, refused: 'sign', text: k(last.flipped ? 'refused.signFlip' : 'refused.signKeep', { x: last.x, before: num(last.before), after: num(last.after), term: tex(last.term.c, last.term.p) }) };
  }
  if (last?.event === 'check' && !last.ok) {
    return { tone: 'rose', icon: LockKeyhole, refused: 'check', text: k('refused.check', { x: last.x, tray: last.trayTex, a: num(last.trayValue), typed: last.typedTex, b: num(last.typedValue) }) };
  }
  if (lab.solvedNow) return { tone: 'emerald', icon: CheckCircle2, text: k(lab.custom ? 'b.solvedCustom' : 'b.solved') };
  if (last?.event === 'sort' && last.cancelled > 0) return { tone: 'indigo', icon: Sparkles, text: k('b.cancel', { pairs: k('pair', { count: last.cancelled }) }) };
  if (last?.event === 'exit') return { tone: 'indigo', icon: PackageOpen, text: k(last.emptied ? 'b.emptied' : 'b.exit', { out: tex(last.out.c, last.out.p) }) };
  if (last?.event === 'custom') return { tone: 'indigo', icon: Hand, text: k('b.custom') };
  if (coachVisible) return { tone: 'indigo', icon: Hand, text: '', idle: true };
  if (L.cratesFull(lab)) return { tone: 'indigo', icon: Hand, text: k('idle.brackets'), idle: true };
  if (!lab.scaffold && L.allSorted(lab)) return { tone: 'indigo', icon: Hand, text: k('idle.coef'), idle: true };
  return { tone: 'indigo', icon: Hand, text: k('idle.collect'), idle: true };
}
