// The walk's OWN arithmetic of a Thalès figure (the pyramids world; defects.md C1: never the world's `figure.js` nor the
// lesson's `math.js`). A figure is named as the world names it: V the vertex, M on line (VB), N on line (VC); its
// lengths VM, VB, VN, VC, MN, BC, and on a NESTED figure the pieces MB = VB − VM, NC = VC − VN. A length is a number as a
// screen writes it (« 42,5 », « 5/6 ») or a root « a√n » (the river's SR = √2785, SF = 8√2785).
import { eq, mul, q, sub } from './exact.mjs';

const add = (a, b) => sub(a, mul(b, '-1'));
const div = (a, b) => mul(a, { n: q(b).d, d: q(b).n });
/** The partner of a length in the other triangle (small VMN ↔ big VBC). */
const PARTNER = { VM: 'VB', VB: 'VM', VN: 'VC', VC: 'VN', MN: 'BC', BC: 'MN' };
const SMALL = new Set(['VM', 'VN', 'MN']);

/** « 8√2785 » → { k: 8, r: 2785 }; « 42,5 » → { k: 42,5, r: 1 }. */
function surd(x) {
  const s = String(x).replace(/\s/g, '');
  const m = /^(.*)√(\d+)$/.exec(s);
  return m ? { k: q(m[1] || '1'), r: m[2] } : { k: q(s), r: '1' };
}
/** a / b exactly, when both stand on the same root (or none); null otherwise. */
export function ratio(a, b) {
  const [x, y] = [surd(a), surd(b)];
  return x.r === y.r ? div(x.k, y.k) : null;
}

/**
 * A length of the figure from the lengths KNOWN only: the pieces give the whole sides (nested only), a pair small/big
 * wholly known gives k = small / big, the asked length is its partner × k (or ÷ k); a piece asked is its side less the
 * other part. Throws when the known lengths do not reach it.
 */
export function solveLength(known, asked, kind = 'nested') {
  const L = Object.fromEntries(Object.entries(known).filter(([, v]) => v != null));
  const pieces = () => {
    if (kind !== 'nested') return;
    if (L.VB == null && L.VM != null && L.MB != null) L.VB = add(L.VM, L.MB);
    if (L.VC == null && L.VN != null && L.NC != null) L.VC = add(L.VN, L.NC);
    if (L.VM == null && L.VB != null && L.MB != null) L.VM = sub(L.VB, L.MB);
    if (L.VN == null && L.VC != null && L.NC != null) L.VN = sub(L.VC, L.NC);
  };
  pieces();
  if (L[asked] != null) return q(L[asked]);
  const pair = ['VM', 'VN', 'MN'].find((s) => L[s] != null && L[PARTNER[s]] != null);
  if (!pair) throw new Error(`thales: no ratio wholly known (${JSON.stringify(known)})`);
  const k = div(L[pair], L[PARTNER[pair]]);
  const by = (key) => {
    const p = L[PARTNER[key]];
    if (p == null) return null;
    return SMALL.has(key) ? mul(p, k) : div(p, k);
  };
  if (asked === 'MB' || asked === 'NC') {
    const [whole, part] = asked === 'MB' ? ['VB', 'VM'] : ['VC', 'VN'];
    const W = L[whole] ?? by(whole);
    const P = L[part] ?? by(part);
    if (W == null || P == null) throw new Error(`thales: cannot reach ${asked} from ${JSON.stringify(known)}`);
    return sub(W, P);
  }
  const out = by(asked);
  if (out == null) throw new Error(`thales: cannot reach ${asked} from ${JSON.stringify(known)}`);
  return out;
}

/** The three ratios from the vertex are equal (a Thalès case holds), exactly — null when a root makes it unknowable here. */
export function chainHolds(len) {
  const r = [ratio(len.VM, len.VB), ratio(len.VN, len.VC), ratio(len.MN, len.BC)];
  if (r.some((x) => x == null)) return null;
  return eq(r[0], r[1]) && eq(r[0], r[2]);
}
